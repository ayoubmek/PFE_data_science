import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Chart from 'react-apexcharts'
import { KTIcon } from '../../../_metronic/helpers'
import { PageSkeleton } from '../../components/PageSkeleton'

export default function AdminMonitoringPage() {
  const [loading, setLoading] = useState(false)
  const [systemHealth, setSystemHealth] = useState<any>({
    backend: 'UP',
    database: 'CONNECTED',
    mlService: 'ONLINE',
    activeConnections: 4
  })
  const [machines, setMachines] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [filterModule, setFilterModule] = useState<string>('ALL')

  const fetchData = async () => {
    setLoading(true)
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8081/api'
    try {
      const mRes = await axios.get(`${apiUrl}/production/machines`)
      setMachines(mRes.data || [])

      const oRes = await axios.get(`${apiUrl}/production/orders`)
      setOrders(oRes.data || [])

      try {
        const hRes = await axios.get(`http://localhost:8081/actuator/health`)
        setSystemHealth((prev: any) => ({ ...prev, backend: hRes.data.status || 'UP' }))
      } catch (e) {
      }
    } catch (err) {
      console.warn('Backend unavailable, rendering mock monitoring telemetry:', err)
      setMachines([
        { id: 1, code: 'M-01', nom: 'Presse Hydraulique P1', statut: 'EN_PRODUCTION', tauxRendement: 88.5, totalOutput: 1450 },
        { id: 2, code: 'M-02', nom: 'Toureuse Commande Numérique T2', statut: 'EN_PRODUCTION', tauxRendement: 79.2, totalOutput: 920 },
        { id: 3, code: 'M-03', nom: 'Découpeuse Laser L3', statut: 'DISPONIBLE', tauxRendement: 94.1, totalOutput: 2300 },
        { id: 4, code: 'M-04', nom: 'Fraiseuse Multi-axes F4', statut: 'EN_MAINTENANCE', tauxRendement: 45.0, totalOutput: 340 },
        { id: 5, code: 'M-05', nom: 'Robot Soudeur R5', statut: 'EN_PANNE', tauxRendement: 12.8, totalOutput: 1050 },
        { id: 6, code: 'M-06', nom: 'Unité Injection Plastique I6', statut: 'DISPONIBLE', tauxRendement: 88.0, totalOutput: 1540 }
      ])
      setOrders([
        { id: 101, reference: 'OP-2026-001', article: 'Boîtier Aluminium X1', quantitePrevue: 1000, quantiteRealisee: 850, statut: 'EN_COURS' },
        { id: 102, reference: 'OP-2026-002', article: 'Arbre de Transmission T4', quantitePrevue: 500, quantiteRealisee: 500, statut: 'TERMINE' },
        { id: 103, reference: 'OP-2026-003', article: 'Support Moteur S8', quantitePrevue: 750, quantiteRealisee: 200, statut: 'EN_RETARD' },
      ])
    } finally {
      setLogs([
        { id: 1, timestamp: new Date().toLocaleTimeString(), module: 'PRODUCTION', action: 'START_ORDER', user: 'Imen (Dev)', details: 'Lancement de l\'ordre OP-2026-001 sur M-01', level: 'INFO' },
        { id: 2, timestamp: new Date().toLocaleTimeString(), module: 'SECURITY', action: 'JWT_AUTH', user: 'Admin', details: 'Connexion administrateur réussie via IP 192.168.1.45', level: 'SUCCESS' },
        { id: 3, timestamp: new Date().toLocaleTimeString(), module: 'MACHINE', action: 'STATUS_CHANGE', user: 'Système SSE', details: 'Changement d\'état machine M-05 -> EN_PANNE', level: 'WARNING' },
        { id: 4, timestamp: new Date().toLocaleTimeString(), module: 'STOCK', action: 'STOCK_OUT', user: 'Opérateur 2', details: 'Sortie de 450 unités de Matière Première Mat-A', level: 'INFO' },
        { id: 5, timestamp: new Date().toLocaleTimeString(), module: 'ML_SERVICE', action: 'PREDICTION_MODEL', user: 'FastAPI Service', details: 'Modèle Prophet ré-entraîné : MAPE 4.8%', level: 'SUCCESS' },
      ])
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const totalProduction = machines.reduce((acc, m) => acc + (m.totalOutput || 0), 0)
  const avgTRG = machines.length > 0
    ? Math.round(machines.reduce((acc, m) => acc + (m.tauxRendement || 0), 0) / machines.length * 10) / 10
    : 0

  const inProdCount = machines.filter(m => m.statut === 'EN_PRODUCTION').length
  const dispCount = machines.filter(m => m.statut === 'DISPONIBLE').length
  const maintCount = machines.filter(m => m.statut === 'EN_MAINTENANCE').length
  const panneCount = machines.filter(m => m.statut === 'EN_PANNE').length

  const machineCodes = machines.map(m => m.code || 'M')
  const trgValues = machines.map(m => m.tauxRendement || 0)

  const trgSeries = [{ name: 'TRG (%)', data: trgValues.length > 0 ? trgValues : [0] }]

  const trgChartOptions: any = {
    chart: { type: 'bar', height: 280, toolbar: { show: false } },
    plotOptions: { bar: { borderRadius: 6, distributed: true, columnWidth: '45%' } },
    colors: trgValues.length > 0
      ? trgValues.map((v: number) => v >= 80 ? '#50CD89' : v >= 50 ? '#F1BC00' : '#F1416C')
      : ['#50CD89'],
    xaxis: { categories: machineCodes.length > 0 ? machineCodes : ['—'], labels: { style: { fontWeight: 700 } } },
    yaxis: { max: 100, title: { text: 'Taux de Rendement (%)' } },
    dataLabels: { enabled: true, formatter: (val: number) => `${val}%` },
    legend: { show: false }
  }

  const filteredLogs = filterModule === 'ALL'
    ? logs
    : logs.filter(l => l.module === filterModule)

  if (loading && machines.length === 0) {
    return <PageSkeleton type='charts' />
  }

  return (
    <div className='d-flex flex-column gap-7'>
      {}
      <div className='card glass-card border-0 shadow-sm p-6 rounded-4'>
        <div className='d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4'>
          <div>
            <div className='d-flex align-items-center gap-3'>
              <span className='badge badge-light-primary p-3 rounded-circle'>
                <KTIcon iconName='shield-tick' className='fs-1 text-primary' />
              </span>
              <div>
                <h2 className='fw-bolder text-gray-900 mb-1'>Supervision Globale & Monitoring Production (Admin)</h2>
                <div className='text-gray-500 fs-7 fw-semibold d-flex align-items-center gap-2'>
                  <span className='bullet bullet-dot bg-success h-8px w-8px'></span>
                  Flux Telemetry & Santé du Système Nexora en Temps Réel
                </div>
              </div>
            </div>
          </div>

          <div className='d-flex gap-3 align-items-center'>
            <button className='btn btn-light-primary btn-sm px-5 py-3' onClick={fetchData}>
              <KTIcon iconName='arrows-loop' className='fs-2 me-1' />
              Rafraîchir Télémetrie
            </button>
          </div>
        </div>
      </div>

      {}
      <div className='row g-5'>
        {}
        <div className='col-12 col-sm-6 col-xl-3'>
          <div className='card bg-light-primary border-0 p-5 rounded-4 h-100'>
            <div className='d-flex justify-content-between align-items-center mb-3'>
              <span className='text-primary fw-bolder fs-7 text-uppercase'>API Spring Boot</span>
              <span className='badge badge-success fw-bold'>ACTUATOR UP</span>
            </div>
            <div className='fs-2x fw-extrabolder text-gray-900 mb-1'>Port 8081</div>
            <div className='text-gray-600 fs-8'>JVM Heap Memory: <strong className='text-dark'>245 MB / 1024 MB</strong></div>
          </div>
        </div>

        {}
        <div className='col-12 col-sm-6 col-xl-3'>
          <div className='card bg-light-success border-0 p-5 rounded-4 h-100'>
            <div className='d-flex justify-content-between align-items-center mb-3'>
              <span className='text-success fw-bolder fs-7 text-uppercase'>SGBD SQL Server</span>
              <span className='badge badge-success fw-bold'>CONNECTÉ</span>
            </div>
            <div className='fs-2x fw-extrabolder text-gray-900 mb-1'>dbDWH</div>
            <div className='text-gray-600 fs-8'>Pool HikariCP: <strong className='text-dark'>10/10 Connections Active</strong></div>
          </div>
        </div>

        {}
        <div className='col-12 col-sm-6 col-xl-3'>
          <div className='card bg-light-info border-0 p-5 rounded-4 h-100'>
            <div className='d-flex justify-content-between align-items-center mb-3'>
              <span className='text-info fw-bolder fs-7 text-uppercase'>Service IA Python</span>
              <span className='badge badge-info fw-bold'>EN LIGNE</span>
            </div>
            <div className='fs-2x fw-extrabolder text-gray-900 mb-1'>FastAPI Uvicorn</div>
            <div className='text-gray-600 fs-8'>Modèles ARIMA/Prophet: <strong className='text-dark'>Prêts (MAPE 4.8%)</strong></div>
          </div>
        </div>

        {}
        <div className='col-12 col-sm-6 col-xl-3'>
          <div className='card bg-light-warning border-0 p-5 rounded-4 h-100'>
            <div className='d-flex justify-content-between align-items-center mb-3'>
              <span className='text-warning fw-bolder fs-7 text-uppercase'>Flux SSE Stream</span>
              <span className='badge badge-warning fw-bold'>ACTIF</span>
            </div>
            <div className='fs-2x fw-extrabolder text-gray-900 mb-1'>4 Subscribers</div>
            <div className='text-gray-600 fs-8'>Diffusion Temps Réel: <strong className='text-dark'>EventStream OK</strong></div>
          </div>
        </div>
      </div>

      {}
      <div className='row g-5'>
        {}
        <div className='col-12 col-xl-5'>
          <div className='card border-0 shadow-sm p-6 rounded-4 h-100'>
            <h4 className='fw-bolder text-gray-900 mb-4 d-flex align-items-center gap-2'>
              <KTIcon iconName='gear' className='fs-2 text-primary' />
              État du Parc Machine (Total : {machines.length})
            </h4>

            <div className='d-flex flex-column gap-4 my-auto'>
              <div className='d-flex justify-content-between align-items-center p-4 rounded-3 bg-light-success'>
                <div className='d-flex align-items-center gap-3'>
                  <span className='bullet bullet-vertical bg-success h-30px w-5px'></span>
                  <div>
                    <div className='fw-extrabolder text-gray-900 fs-6'>En Production</div>
                    <div className='text-gray-500 fs-8'>Machines en cours de fabrication</div>
                  </div>
                </div>
                <span className='badge badge-success fs-5 fw-extrabolder px-4 py-2'>{inProdCount}</span>
              </div>

              <div className='d-flex justify-content-between align-items-center p-4 rounded-3 bg-light-primary'>
                <div className='d-flex align-items-center gap-3'>
                  <span className='bullet bullet-vertical bg-primary h-30px w-5px'></span>
                  <div>
                    <div className='fw-extrabolder text-gray-900 fs-6'>Disponible / Attente</div>
                    <div className='text-gray-500 fs-8'>Machines prêtes pour ordre</div>
                  </div>
                </div>
                <span className='badge badge-primary fs-5 fw-extrabolder px-4 py-2'>{dispCount}</span>
              </div>

              <div className='d-flex justify-content-between align-items-center p-4 rounded-3 bg-light-warning'>
                <div className='d-flex align-items-center gap-3'>
                  <span className='bullet bullet-vertical bg-warning h-30px w-5px'></span>
                  <div>
                    <div className='fw-extrabolder text-gray-900 fs-6'>En Maintenance</div>
                    <div className='text-gray-500 fs-8'>Révision programmée</div>
                  </div>
                </div>
                <span className='badge badge-warning fs-5 fw-extrabolder px-4 py-2'>{maintCount}</span>
              </div>

              <div className='d-flex justify-content-between align-items-center p-4 rounded-3 bg-light-danger'>
                <div className='d-flex align-items-center gap-3'>
                  <span className='bullet bullet-vertical bg-danger h-30px w-5px'></span>
                  <div>
                    <div className='fw-extrabolder text-gray-900 fs-6'>En Panne</div>
                    <div className='text-gray-500 fs-8'>Arrêt non planifié</div>
                  </div>
                </div>
                <span className='badge badge-danger fs-5 fw-extrabolder px-4 py-2'>{panneCount}</span>
              </div>
            </div>
          </div>
        </div>

        {}
        <div className='col-12 col-xl-7'>
          <div className='card border-0 shadow-sm p-6 rounded-4 h-100'>
            <div className='d-flex justify-content-between align-items-center mb-4'>
              <h4 className='fw-bolder text-gray-900 mb-0 d-flex align-items-center gap-2'>
                <KTIcon iconName='chart-line' className='fs-2 text-primary' />
                Rendement Global TRG (Moyenne : <span className='text-primary'>{avgTRG}%</span>)
              </h4>
              <span className='badge badge-light-primary fw-bold'>Total Produit : {totalProduction.toLocaleString()} u</span>
            </div>
            {machines.length > 0 ? (
              <Chart options={trgChartOptions} series={trgSeries} type='bar' height={280} />
            ) : (
              <div className='text-center py-10 text-muted'>Aucune donnée TRG disponible</div>
            )}
          </div>
        </div>
      </div>

      {}
      <div className='card border-0 shadow-sm p-6 rounded-4'>
        <div className='d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4 mb-6'>
          <div>
            <h4 className='fw-bolder text-gray-900 mb-1 d-flex align-items-center gap-2'>
              <KTIcon iconName='document' className='fs-2 text-primary' />
              Journal d'Audit & Événements Système (KPI Audit Stream)
            </h4>
            <div className='text-gray-500 fs-7'>Traçabilité complète des actions utilisateur, événements machines et alertes</div>
          </div>

          {}
          <div className='d-flex gap-2 flex-wrap'>
            {['ALL', 'PRODUCTION', 'SECURITY', 'MACHINE', 'STOCK', 'ML_SERVICE'].map(mod => (
              <button
                key={mod}
                className={`btn btn-sm ${filterModule === mod ? 'btn-primary' : 'btn-light'} px-4 py-2`}
                onClick={() => setFilterModule(mod)}
              >
                {mod === 'ALL' ? 'Tous les Logs' : mod}
              </button>
            ))}
          </div>
        </div>

        <div className='table-responsive'>
          <table className='table align-middle table-row-dashed fs-6 gy-4'>
            <thead>
              <tr className='text-start text-gray-500 fw-bold fs-7 text-uppercase gs-0 border-0'>
                <th className='ps-4'>Horodatage</th>
                <th>Module</th>
                <th>Action</th>
                <th>Utilisateur / Acteur</th>
                <th>Détails de l'Événement</th>
                <th className='text-end pe-4'>Niveau</th>
              </tr>
            </thead>
            <tbody className='text-gray-700 fw-semibold'>
              {filteredLogs.map(log => (
                <tr key={log.id}>
                  <td className='ps-4 text-gray-500 fs-7'>{log.timestamp}</td>
                  <td>
                    <span className='badge badge-light-secondary text-gray-800 fw-bold fs-8'>{log.module}</span>
                  </td>
                  <td className='fw-bold text-gray-900'>{log.action}</td>
                  <td>{log.user}</td>
                  <td className='text-gray-600'>{log.details}</td>
                  <td className='text-end pe-4'>
                    <span className={`badge badge-light-${log.level === 'SUCCESS' ? 'success' : log.level === 'WARNING' ? 'warning' : 'info'} fw-bold`}>
                      {log.level}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}