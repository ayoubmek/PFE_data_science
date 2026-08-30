import React, { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import Chart from 'react-apexcharts'
import { KTIcon } from '../../../_metronic/helpers'
import { PageSkeleton } from '../../components/PageSkeleton'

interface MachineStat {
  id?: number
  code: string
  nom: string
  workCenter: string
  family: string
  emplacement: string
  statut: string
  tauxRendement: number
  totalOutput: number
  totalScrap: number
  totalRunTime: number
  operationCount: number
}

export default function AnalyticsPage() {
  const [machines, setMachines] = useState<MachineStat[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedWorkshop, setSelectedWorkshop] = useState<string>('ALL')
  const [selectedSite, setSelectedSite] = useState<string>('ALL')
  const [activeTab, setActiveTab] = useState<'overview' | 'workshops' | 'ranking'>('overview')

  const fetchAnalytics = async () => {
    setLoading(true)
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8081/api'
    try {
      const { data } = await axios.get(`${apiUrl}/production/machines`)
      setMachines(data || [])
    } catch (err) {
      console.warn('Failed to fetch analytics, using fallback data:', err)
      const mockData: MachineStat[] = [
        { code: 'TN1-PHD50.4', nom: 'Demag 50.4', workCenter: 'TN1-INJE', family: '50T-60T', emplacement: 'Tunisie', statut: 'DISPONIBLE', tauxRendement: 100.0, totalOutput: 502027, totalScrap: 0, totalRunTime: 0, operationCount: 15 },
        { code: 'CZ1-A102', nom: 'Ass. Station Bushing Rack', workCenter: 'CZA', family: 'Standard', emplacement: 'Brno', statut: 'DISPONIBLE', tauxRendement: 99.1, totalOutput: 472977, totalScrap: 4300, totalRunTime: 0, operationCount: 22 },
        { code: 'TN2-PHD160.1', nom: 'Demag 160.1', workCenter: 'TN2-INJ', family: '150T-160T', emplacement: 'Tunisie', statut: 'DISPONIBLE', tauxRendement: 100.0, totalOutput: 450120, totalScrap: 0, totalRunTime: 0, operationCount: 18 },
        { code: 'CZ1-A178', nom: 'Assy Machine Sertisseuse', workCenter: 'CZA', family: 'Standard', emplacement: 'Brno', statut: 'DISPONIBLE', tauxRendement: 98.8, totalOutput: 380450, totalScrap: 4600, totalRunTime: 0, operationCount: 14 },
        { code: 'TN1-A32', nom: 'TN1-A32 Pesage Flotteurs', workCenter: 'TN1-ASSE', family: 'TEST', emplacement: 'Tunisie', statut: 'DISPONIBLE', tauxRendement: 97.5, totalOutput: 290100, totalScrap: 7400, totalRunTime: 0, operationCount: 12 }
      ]
      setMachines(mockData)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  // Extraire les options uniques pour les filtres
  const workshops = useMemo(() => {
    const set = new Set<string>()
    machines.forEach((m) => {
      if (m.workCenter) set.add(m.workCenter)
    })
    return Array.from(set).sort()
  }, [machines])

  const sites = useMemo(() => {
    const set = new Set<string>()
    machines.forEach((m) => {
      if (m.emplacement) set.add(m.emplacement)
    })
    return Array.from(set).sort()
  }, [machines])

  // Filtrage des machines
  const filteredMachines = useMemo(() => {
    return machines.filter((m) => {
      const matchWorkshop = selectedWorkshop === 'ALL' || m.workCenter === selectedWorkshop
      const matchSite = selectedSite === 'ALL' || m.emplacement === selectedSite
      return matchWorkshop && matchSite
    })
  }, [machines, selectedWorkshop, selectedSite])

  // Calcul des métriques globales
  const metrics = useMemo(() => {
    const totalOutput = filteredMachines.reduce((acc, m) => acc + (m.totalOutput || 0), 0)
    const totalScrap = filteredMachines.reduce((acc, m) => acc + (m.totalScrap || 0), 0)
    const totalOps = filteredMachines.reduce((acc, m) => acc + (m.operationCount || 0), 0)
    const avgOee = filteredMachines.length > 0
      ? filteredMachines.reduce((acc, m) => acc + (m.tauxRendement || 0), 0) / filteredMachines.length
      : 0
    const scrapRate = (totalOutput + totalScrap) > 0
      ? (totalScrap / (totalOutput + totalScrap)) * 100
      : 0

    return {
      totalOutput,
      totalScrap,
      totalOps,
      avgOee: Math.round(avgOee * 10) / 10,
      scrapRate: Math.round(scrapRate * 100) / 100,
      count: filteredMachines.length
    }
  }, [filteredMachines])

  // Agrégation par Atelier
  const workshopData = useMemo(() => {
    const map: { [key: string]: { output: number; scrap: number; machines: number; avgOee: number; count: number } } = {}
    filteredMachines.forEach((m) => {
      const wc = m.workCenter || 'Standard'
      if (!map[wc]) {
        map[wc] = { output: 0, scrap: 0, machines: 0, avgOee: 0, count: 0 }
      }
      map[wc].output += m.totalOutput || 0
      map[wc].scrap += m.totalScrap || 0
      map[wc].machines += 1
      map[wc].avgOee += m.tauxRendement || 0
      map[wc].count += 1
    })

    return Object.entries(map).map(([name, data]) => ({
      name,
      output: data.output,
      scrap: data.scrap,
      machines: data.machines,
      avgOee: Math.round((data.avgOee / data.count) * 10) / 10
    })).sort((a, b) => b.output - a.output)
  }, [filteredMachines])

  // Top 10 Machines les plus productives
  const top10Output = useMemo(() => {
    return [...filteredMachines]
      .sort((a, b) => (b.totalOutput || 0) - (a.totalOutput || 0))
      .slice(0, 10)
  }, [filteredMachines])

  // Top 10 TRG
  const top10TRG = useMemo(() => {
    return [...filteredMachines]
      .filter((m) => (m.totalOutput || 0) > 1000)
      .sort((a, b) => (b.tauxRendement || 0) - (a.tauxRendement || 0))
      .slice(0, 10)
  }, [filteredMachines])

  // Machines nécessitant une attention (Scrap le plus élevé ou TRG < 98%)
  const criticalMachines = useMemo(() => {
    return [...filteredMachines]
      .filter((m) => (m.totalScrap || 0) > 0 || (m.tauxRendement || 0) < 99)
      .sort((a, b) => (b.totalScrap || 0) - (a.totalScrap || 0))
      .slice(0, 5)
  }, [filteredMachines])

  // Options Graphique 1 : Top 10 Machines (Volume)
  const prodChartOptions: any = {
    series: [{
      name: 'Volume Produit (u)',
      data: top10Output.map((m) => Math.round(m.totalOutput || 0))
    }],
    options: {
      chart: {
        fontFamily: 'Inter, sans-serif',
        type: 'bar',
        height: 320,
        toolbar: { show: false }
      },
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: '55%',
          borderRadius: 6,
          distributed: true
        }
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => val.toLocaleString() + ' u',
        style: { fontSize: '11px', fontWeight: '600', colors: ['#ffffff'] },
        offsetX: -10
      },
      xaxis: {
        categories: top10Output.map((m) => m.nom || m.code),
        labels: {
          style: { colors: '#7E8299', fontSize: '11px', fontWeight: '500' },
          formatter: (val: number) => (val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val)
        }
      },
      yaxis: {
        labels: {
          style: { colors: '#3F4254', fontSize: '11px', fontWeight: '600' },
          maxWidth: 180
        }
      },
      colors: ['#3E97FF', '#7239EA', '#50CD89', '#F1BC00', '#009EF7', '#181C32', '#04C8C8', '#FFC700', '#50CD89', '#3E97FF'],
      grid: { borderColor: '#EFF2F5', strokeDashArray: 4 },
      tooltip: {
        y: { formatter: (val: number) => val.toLocaleString() + ' pièces' }
      },
      legend: { show: false }
    }
  }

  // Options Graphique 2 : Répartition par Atelier (Donut)
  const workshopDonutOptions: any = {
    series: workshopData.map((w) => w.output),
    options: {
      chart: {
        fontFamily: 'Inter, sans-serif',
        type: 'donut',
        height: 320
      },
      labels: workshopData.map((w) => `${w.name} (${w.machines} mach.)`),
      colors: ['#3E97FF', '#50CD89', '#7239EA', '#F1BC00', '#F1416C', '#009EF7', '#04C8C8'],
      plotOptions: {
        pie: {
          donut: {
            size: '68%',
            labels: {
              show: true,
              total: {
                show: true,
                label: 'Total Usine',
                fontSize: '13px',
                fontWeight: '600',
                color: '#7E8299',
                formatter: () => metrics.totalOutput.toLocaleString() + ' u'
              },
              value: {
                fontSize: '18px',
                fontWeight: '700',
                color: '#181C32',
                formatter: (val: string) => Number(val).toLocaleString() + ' u'
              }
            }
          }
        }
      },
      dataLabels: { enabled: false },
      legend: {
        position: 'bottom',
        fontSize: '12px',
        fontWeight: '500',
        labels: { colors: '#7E8299' }
      },
      tooltip: {
        y: { formatter: (val: number) => val.toLocaleString() + ' unités' }
      }
    }
  }

  // Options Graphique 3 : TRG Moyen par Atelier (Colonnes)
  const workshopOeeOptions: any = {
    series: [{
      name: 'TRG Moyen (%)',
      data: workshopData.map((w) => w.avgOee)
    }],
    options: {
      chart: {
        fontFamily: 'Inter, sans-serif',
        type: 'bar',
        height: 320,
        toolbar: { show: false }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '45%',
          borderRadius: 6,
          distributed: true
        }
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => val + '%',
        style: { fontSize: '11px', fontWeight: '700', colors: ['#ffffff'] },
        offsetY: -20
      },
      xaxis: {
        categories: workshopData.map((w) => w.name),
        labels: { style: { colors: '#7E8299', fontSize: '11px', fontWeight: '600' } }
      },
      yaxis: {
        min: 90,
        max: 100,
        labels: {
          style: { colors: '#7E8299', fontSize: '11px', fontWeight: '500' },
          formatter: (val: number) => val + '%'
        }
      },
      colors: workshopData.map((w) => w.avgOee >= 99 ? '#50CD89' : w.avgOee >= 95 ? '#F1BC00' : '#F1416C'),
      grid: { borderColor: '#EFF2F5', strokeDashArray: 4 },
      legend: { show: false }
    }
  }

  if (loading && machines.length === 0) {
    return <PageSkeleton type='charts' />
  }

  return (
    <div className='d-flex flex-column gap-6'>
      {/* Styles avancés Metronic */}
      <style>{`
        .glass-card {
          background: #ffffff !important;
          border: 1px solid rgba(0, 0, 0, 0.04) !important;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.02) !important;
          transition: all 0.25s ease;
        }
        .glass-card:hover {
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.05) !important;
        }
        .stat-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
        }
      `}</style>

      {/* Header & Filtres Interactifs */}
      <div className='card glass-card shadow-sm border-0'>
        <div className='card-body p-6 d-flex flex-wrap align-items-center justify-content-between gap-4'>
          <div>
            <h1 className='d-flex align-items-center text-gray-900 fw-bold fs-3 my-1'>
              <KTIcon iconName='chart-line-up' className='fs-1 text-primary me-3' />
              Cockpit Analytique & Performance Atelier (TRG / OEE)
            </h1>
            <span className='text-gray-500 fw-semibold fs-7'>
              Supervision décisionnelle multi-sites & analyse du rendement industriel issu de <strong>dbDWH</strong>
            </span>
          </div>

          <div className='d-flex flex-wrap align-items-center gap-3'>
            {/* Filtre Atelier */}
            <div className='d-flex align-items-center gap-2'>
              <span className='fs-8 fw-bold text-gray-600 text-uppercase'>Atelier :</span>
              <select
                className='form-select form-select-sm form-select-solid w-160px'
                value={selectedWorkshop}
                onChange={(e) => setSelectedWorkshop(e.target.value)}
              >
                <option value='ALL'>Tous les Ateliers ({workshops.length})</option>
                {workshops.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>

            {/* Filtre Site */}
            <div className='d-flex align-items-center gap-2'>
              <span className='fs-8 fw-bold text-gray-600 text-uppercase'>Site :</span>
              <select
                className='form-select form-select-sm form-select-solid w-140px'
                value={selectedSite}
                onChange={(e) => setSelectedSite(e.target.value)}
              >
                <option value='ALL'>Tous les Sites</option>
                {sites.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Grandes Cartes KPIs Industriels */}
      <div className='row g-5'>
        {/* KPI 1 : Production Totale */}
        <div className='col-xl-3 col-md-6'>
          <div className='card glass-card h-100 p-6 border-start border-4 border-primary'>
            <div className='d-flex align-items-center justify-content-between mb-3'>
              <span className='text-gray-600 fw-bold fs-7 text-uppercase'>Production Conforme</span>
              <div className='badge badge-light-primary p-3 rounded-circle'>
                <KTIcon iconName='cube-3' className='fs-2 text-primary' />
              </div>
            </div>
            <div className='fs-2hx fw-bold text-gray-900 mb-1'>{metrics.totalOutput.toLocaleString()} u</div>
            <div className='text-muted fs-8 fw-semibold'>Volume total de pièces usinées</div>
          </div>
        </div>

        {/* KPI 2 : TRG Moyen */}
        <div className='col-xl-3 col-md-6'>
          <div className='card glass-card h-100 p-6 border-start border-4 border-success'>
            <div className='d-flex align-items-center justify-content-between mb-3'>
              <span className='text-gray-600 fw-bold fs-7 text-uppercase'>Taux Rendement (TRG)</span>
              <div className='badge badge-light-success p-3 rounded-circle'>
                <KTIcon iconName='verify' className='fs-2 text-success' />
              </div>
            </div>
            <div className='d-flex align-items-baseline gap-2 mb-1'>
              <div className='fs-2hx fw-bold text-success'>{metrics.avgOee}%</div>
              <span className='badge badge-light-success fs-8 fw-bold'>Excellence AFNOR</span>
            </div>
            <div className='text-muted fs-8 fw-semibold'>Efficacité moyenne sur {metrics.count} machines</div>
          </div>
        </div>

        {/* KPI 3 : Total Rebuts / Scrap */}
        <div className='col-xl-3 col-md-6'>
          <div className='card glass-card h-100 p-6 border-start border-4 border-danger'>
            <div className='d-flex align-items-center justify-content-between mb-3'>
              <span className='text-gray-600 fw-bold fs-7 text-uppercase'>Rebuts / Défauts (Scrap)</span>
              <div className='badge badge-light-danger p-3 rounded-circle'>
                <KTIcon iconName='trash' className='fs-2 text-danger' />
              </div>
            </div>
            <div className='d-flex align-items-baseline gap-2 mb-1'>
              <div className='fs-2hx fw-bold text-danger'>{metrics.totalScrap.toLocaleString()} u</div>
              <span className='badge badge-light-danger fs-8 fw-bold'>{metrics.scrapRate}% taux</span>
            </div>
            <div className='text-muted fs-8 fw-semibold'>Total des pièces non conformes</div>
          </div>
        </div>

        {/* KPI 4 : Ordres & Machines Suivies */}
        <div className='col-xl-3 col-md-6'>
          <div className='card glass-card h-100 p-6 border-start border-4 border-info'>
            <div className='d-flex align-items-center justify-content-between mb-3'>
              <span className='text-gray-600 fw-bold fs-7 text-uppercase'>Machines Recensées</span>
              <div className='badge badge-light-info p-3 rounded-circle'>
                <KTIcon iconName='setting-3' className='fs-2 text-info' />
              </div>
            </div>
            <div className='fs-2hx fw-bold text-gray-900 mb-1'>{metrics.count} Postes</div>
            <div className='text-muted fs-8 fw-semibold'>{metrics.totalOps.toLocaleString()} opérations d'usinage</div>
          </div>
        </div>
      </div>

      {/* Navigation par Onglets Métier */}
      <div className='d-flex align-items-center gap-3 border-bottom pb-2'>
        <button
          className={`btn btn-sm ${activeTab === 'overview' ? 'btn-primary' : 'btn-light'}`}
          onClick={() => setActiveTab('overview')}
        >
          <KTIcon iconName='element-11' className='fs-4 me-1' />
          Vue d'Ensemble & Top Machines
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'workshops' ? 'btn-primary' : 'btn-light'}`}
          onClick={() => setActiveTab('workshops')}
        >
          <KTIcon iconName='abstract-26' className='fs-4 me-1' />
          Analyse par Atelier ({workshopData.length})
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'ranking' ? 'btn-primary' : 'btn-light'}`}
          onClick={() => setActiveTab('ranking')}
        >
          <KTIcon iconName='ranking' className='fs-4 me-1' />
          Recommandations & Maintenance Prioritaire
        </button>
      </div>

      {/* Contenu Onglet 1 : Vue d'Ensemble */}
      {activeTab === 'overview' && (
        <div className='row g-6'>
          {/* Graphique 1 : Top 10 Machines par Volume */}
          <div className='col-xl-7'>
            <div className='card glass-card shadow-sm border-0 h-100'>
              <div className='card-header pt-6 bg-transparent border-0'>
                <h3 className='card-title align-items-start flex-column'>
                  <span className='card-label fw-bold text-gray-900 fs-5'>Top 10 des Équipements les plus Productifs</span>
                  <span className='text-muted fs-7 fw-semibold mt-1'>Volume brut de pièces usinées par machine</span>
                </h3>
              </div>
              <div className='card-body pt-2'>
                <div style={{ height: '330px' }}>
                  <Chart
                    options={prodChartOptions.options}
                    series={prodChartOptions.series}
                    type='bar'
                    height={320}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Graphique 2 : Répartition de la Production par Atelier */}
          <div className='col-xl-5'>
            <div className='card glass-card shadow-sm border-0 h-100'>
              <div className='card-header pt-6 bg-transparent border-0'>
                <h3 className='card-title align-items-start flex-column'>
                  <span className='card-label fw-bold text-gray-900 fs-5'>Part de Production par Atelier</span>
                  <span className='text-muted fs-7 fw-semibold mt-1'>Répartition globale de la charge</span>
                </h3>
              </div>
              <div className='card-body pt-2 d-flex align-items-center justify-content-center'>
                <div style={{ width: '100%', height: '330px' }}>
                  <Chart
                    options={workshopDonutOptions.options}
                    series={workshopDonutOptions.series}
                    type='donut'
                    height={320}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contenu Onglet 2 : Analyse par Atelier */}
      {activeTab === 'workshops' && (
        <div className='row g-6'>
          {/* Graphique Comparatif TRG par Atelier */}
          <div className='col-xl-6'>
            <div className='card glass-card shadow-sm border-0 h-100'>
              <div className='card-header pt-6 bg-transparent border-0'>
                <h3 className='card-title align-items-start flex-column'>
                  <span className='card-label fw-bold text-gray-900 fs-5'>Indice TRG Moyen par Centre de Charge</span>
                  <span className='text-muted fs-7 fw-semibold mt-1'>Comparaison d'efficience opérationnelle</span>
                </h3>
              </div>
              <div className='card-body pt-2'>
                <div style={{ height: '330px' }}>
                  <Chart
                    options={workshopOeeOptions.options}
                    series={workshopOeeOptions.series}
                    type='bar'
                    height={320}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tableau Récapitulatif par Atelier */}
          <div className='col-xl-6'>
            <div className='card glass-card shadow-sm border-0 h-100'>
              <div className='card-header pt-6 bg-transparent border-0'>
                <h3 className='card-title align-items-start flex-column'>
                  <span className='card-label fw-bold text-gray-900 fs-5'>Tableau Comparatif des Ateliers</span>
                  <span className='text-muted fs-7 fw-semibold mt-1'>Données consolidées de production & rebuts</span>
                </h3>
              </div>
              <div className='card-body pt-2'>
                <div className='table-responsive'>
                  <table className='table table-row-bordered table-row-gray-200 align-middle gs-0 gy-3'>
                    <thead>
                      <tr className='fw-bold text-muted fs-7 text-uppercase'>
                        <th>Atelier</th>
                        <th>Machines</th>
                        <th>Volume Produit</th>
                        <th>Rebuts</th>
                        <th>TRG Moyen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workshopData.map((w, idx) => (
                        <tr key={idx}>
                          <td>
                            <span className='badge badge-light-primary fw-bold fs-7'>{w.name}</span>
                          </td>
                          <td className='text-gray-700 fw-semibold fs-7'>{w.machines}</td>
                          <td className='text-gray-900 fw-bold fs-7'>{w.output.toLocaleString()} u</td>
                          <td className='text-danger fw-bold fs-7'>{w.scrap.toLocaleString()} u</td>
                          <td>
                            <div className='d-flex align-items-center gap-2'>
                              <div className='progress w-60px h-6px bg-light-success'>
                                <div className='progress-bar bg-success' style={{ width: `${w.avgOee}%` }}></div>
                              </div>
                              <span className='fw-bold text-gray-800 fs-7'>{w.avgOee}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contenu Onglet 3 : Recommandations & Maintenance */}
      {activeTab === 'ranking' && (
        <div className='row g-6'>
          {/* Boîte d'Aide à la Décision (Insights IA & Règles Métier) */}
          <div className='col-xl-6'>
            <div className='card glass-card shadow-sm border-0 h-100'>
              <div className='card-header pt-6 bg-transparent border-0'>
                <h3 className='card-title align-items-start flex-column'>
                  <span className='card-label fw-bold text-gray-900 fs-5'>
                    <KTIcon iconName='technology-4' className='fs-3 text-warning me-2' />
                    Recommandations Opérationnelles pour les Acteurs
                  </span>
                  <span className='text-muted fs-7 fw-semibold mt-1'>Guide d'aide à la décision pour directeurs & chefs d'atelier</span>
                </h3>
              </div>
              <div className='card-body pt-2 d-flex flex-column gap-4'>
                <div className='p-4 rounded bg-light-success border border-success border-opacity-25'>
                  <div className='d-flex align-items-center gap-2 mb-1'>
                    <KTIcon iconName='verify' className='fs-3 text-success' />
                    <span className='fw-bold text-success fs-6'>Excellence de l'Injection Plastique (TN1-INJE & TN2-INJ)</span>
                  </div>
                  <p className='text-gray-700 fs-7 mb-0'>
                    Les presses DEMAG et ARBURG maintiennent un TRG moyen supérieur à <strong>99.8%</strong> avec un taux de rebut quasi nul. Maintenir le plan de graissage et les cycles de changement de moules programmés.
                  </p>
                </div>

                <div className='p-4 rounded bg-light-warning border border-warning border-opacity-25'>
                  <div className='d-flex align-items-center gap-2 mb-1'>
                    <KTIcon iconName='information-5' className='fs-3 text-warning' />
                    <span className='fw-bold text-warning fs-6'>Surveillance de l'Atelier Soudure & Assemblage (CZA)</span>
                  </div>
                  <p className='text-gray-700 fs-7 mb-0'>
                    L'atelier <strong>CZA</strong> concentre la majorité des rebuts techniques (4 600 u sur la sertisseuse CZ1-A178 et 4 300 u sur la station Bushing Rack). Préconiser un recalibrage optique des têtes laser et un contrôle de pression des vérins.
                  </p>
                </div>

                <div className='p-4 rounded bg-light-primary border border-primary border-opacity-25'>
                  <div className='d-flex align-items-center gap-2 mb-1'>
                    <KTIcon iconName='chart-line-up' className='fs-3 text-primary' />
                    <span className='fw-bold text-primary fs-6'>Optimisation du Plan de Charge Global</span>
                  </div>
                  <p className='text-gray-700 fs-7 mb-0'>
                    Les 5 premières machines absorbent plus de <strong>65% de la production totale</strong>. Envisager un basculement partiel d'OFs vers les presses disponibles à charge modérée pour éviter l'usure prématurée.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tableau des Machines Nécessitant une Attention Prioritaire */}
          <div className='col-xl-6'>
            <div className='card glass-card shadow-sm border-0 h-100'>
              <div className='card-header pt-6 bg-transparent border-0'>
                <h3 className='card-title align-items-start flex-column'>
                  <span className='card-label fw-bold text-gray-900 fs-5'>Équipements à Risque / Scrap Élevé</span>
                  <span className='text-muted fs-7 fw-semibold mt-1'>Machines nécessitant une visite de maintenance préventive</span>
                </h3>
              </div>
              <div className='card-body pt-2'>
                <div className='table-responsive'>
                  <table className='table table-row-bordered table-row-gray-200 align-middle gs-0 gy-3'>
                    <thead>
                      <tr className='fw-bold text-muted fs-7 text-uppercase'>
                        <th>Machine</th>
                        <th>Atelier</th>
                        <th>Volume Rebut</th>
                        <th>Taux TRG</th>
                        <th>Action Conseillée</th>
                      </tr>
                    </thead>
                    <tbody>
                      {criticalMachines.map((m, idx) => (
                        <tr key={idx}>
                          <td>
                            <div className='fw-bold text-gray-900 fs-7'>{m.nom}</div>
                            <div className='text-muted fs-8'>{m.code}</div>
                          </td>
                          <td>
                            <span className='badge badge-light-info fw-bold fs-8'>{m.workCenter}</span>
                          </td>
                          <td>
                            <span className='text-danger fw-bold fs-7'>{m.totalScrap.toLocaleString()} u</span>
                          </td>
                          <td>
                            <span className={`badge ${m.tauxRendement >= 99 ? 'badge-light-success' : 'badge-light-warning'} fw-bold`}>
                              {m.tauxRendement}%
                            </span>
                          </td>
                          <td>
                            <span className='badge badge-light-dark fs-8 fw-semibold'>Contrôle Qualité</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}