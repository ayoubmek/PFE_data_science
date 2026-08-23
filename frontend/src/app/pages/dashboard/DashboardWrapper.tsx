import React, { FC, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import axios from 'axios'
import { Modal } from 'react-bootstrap'
import { KTIcon } from '../../../_metronic/helpers'
import Chart from 'react-apexcharts'
import DashboardSkeleton from './DashboardSkeleton'

interface DashboardData {
  statistics: {
    total_revenue: {
      value: number;
      label: string;
      growth: string;
      growth_raw?: number;
      value_last_month?: number
      current_month?: number
      comparison_label?: string
    }
    total_orders: { value: number; label: string; growth: string }
    total_products: { value: number; label: string; growth: string }
    total_vendors: { value: string | number; label: string; growth: string }
  }
  status_distribution: Record<string, { count: number; revenue: number }>
  chart_data: { date: string; revenue: number; orders: number }[]
  top_vendors: any[]
  top_products: any[]
  kpis: {
    gmv: number
    nmv: number
    aov: number
    success_rate: number
    failure_rate: number
    pickup_rate: number
    avg_delivery_time: string
    on_time_delivery_rate: number
    cost_per_order: number
  }
}

const StatisticsWidget: FC<{
  className?: string
  color: string
  icon: string
  title: string
  description: string
  value: string | number
  change?: string
  comparisonLabel?: string
  changeType?: 'positive' | 'negative' | 'neutral'
}> = ({ className, color, icon, title, description, value, change, comparisonLabel }) => {
  return (
    <div className={`card card-flush ${className}`}>
      <div className='card-header pt-5'>
        <div className='card-title d-flex flex-column'>
          <span className='fs-2hx fw-bold text-dark me-2 lh-1 ls-n2'>{value}</span>
          <span className='text-gray-500 pt-1 fw-semibold fs-6'>{description}</span>
        </div>
        <div className="card-toolbar">
          <span className={`badge badge-light-${color} fs-base`}>
            <KTIcon iconName={icon} className={`fs-1 text-${color}`} />
          </span>
        </div>
      </div>
      <div className='card-body d-flex align-items-end pt-0'>
        <div className='d-flex align-items-center flex-column mt-3 w-100'>
          {change && (
            <div className='d-flex justify-content-between w-100 mt-auto mb-2'>
              <span className={`fw-boldest fs-6 text-success`}>
                {change}
              </span>
              <span className='fw-bold fs-7 text-gray-500'>{comparisonLabel}</span>
            </div>
          )}
          <div className='h-4px mx-0 w-100 bg-light rounded'>
            <div className={`bg-${color} rounded h-4px`} role='progressbar' style={{ width: '100%' }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}

const DashboardPage: FC = () => {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [recentOfs, setRecentOfs] = useState<any[]>([])
  const [selectedOf, setSelectedOf] = useState<any>(null)
  const [showOfModal, setShowOfModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<any>(null)
  const [showCategoryModal, setShowCategoryModal] = useState(false)

  const fetchDashboardData = async () => {
    setLoading(true)
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8081/api'
    try {
      const [summaryRes, statsRes, ofsRes] = await Promise.all([
        axios.get(`${apiUrl}/dashboard/summary`),
        axios.get(`${apiUrl}/production/fact-cle/stats`),
        axios.get(`${apiUrl}/production/orders`)
      ])
      const summary = summaryRes.data
      const stats = statsRes.data || []
      const mappedOfs = (ofsRes.data || []).map((o: any) => ({
        id: o.id,
        code: o.reference || o.code,
        articleNom: o.article || o.articleNom,
        quantiteObjectif: o.quantitePrevue !== undefined ? o.quantitePrevue : o.quantiteObjectif,
        quantiteProduite: o.quantiteRealisee !== undefined ? o.quantiteRealisee : o.quantiteProduite,
        statut: o.statut,
        dateDebut: o.dateDebut,
        dateFin: o.dateFin,
        machineNom: o.machineNom,
        responsable: o.responsable,
        notes: o.notes
      }))
      setRecentOfs(mappedOfs.slice(0, 5))

      const sorted = [...stats].reverse().slice(-14)
      const dates = sorted.map((s: any) => {
        const d = s.date ? new Date(s.date) : null
        return d ? `${d.getDate()}/${d.getMonth() + 1}` : s.date
      })
      const outputs = sorted.map((s: any) => Math.round(Number(s.totalOutput || 0)))
      const scraps = sorted.map((s: any) => Math.round(Number(s.totalScrap || 0)))

      const mappedData: DashboardData = {
        statistics: {
          total_revenue: {
            value: summary?.production?.totalOutput || 14250,
            label: "Volume Produit Cumulé",
            growth: "+10%",
            comparison_label: "Pièces produites"
          },
          total_orders: {
            value: summary?.production?.ordresEnCours || 3,
            label: "Ordres de Fab. Actifs",
            growth: "En cours"
          },
          total_vendors: {
            value: summary?.production?.tauxRendementMoyen ? `${summary.production.tauxRendementMoyen}%` : '78.4%',
            label: "Taux de Rendement (TRG)",
            growth: "Efficacité atelier"
          },
          total_products: {
            value: summary?.stock?.lowStockAlerts || 12,
            label: "Alertes de Stock Bas",
            growth: "À réapprovisionner"
          }
        },
        status_distribution: {
          'Composants': { count: 85, revenue: 1062 },
          'Visserie': { count: 1520, revenue: 1024 },
          'Métaux': { count: 12, revenue: 2160 },
          'Matières Premières': { count: 1500, revenue: 3150 }
        },
        chart_data: dates.map((d, idx) => ({
          date: d,
          revenue: outputs[idx] || 0,
          orders: scraps[idx] || 0
        })),
        top_vendors: [],
        top_products: [],
        kpis: {
          gmv: 0, nmv: 0, aov: 0, success_rate: 0, failure_rate: 0, pickup_rate: 0, avg_delivery_time: '', on_time_delivery_rate: 0, cost_per_order: 0
        }
      }
      setData(mappedData)
    } catch (err) {
      console.warn('Failed to fetch Spring Boot stats, using mock stats:', err)
      const mockData: DashboardData = {
        statistics: {
          total_revenue: {
            value: 15420,
            label: "Volume Produit Cumulé",
            growth: "+14%",
            comparison_label: "Pièces produites"
          },
          total_orders: {
            value: 5,
            label: "Ordres de Fab. Actifs",
            growth: "En cours"
          },
          total_vendors: {
            value: "82.5%",
            label: "Taux de Rendement (TRG)",
            growth: "Efficacité atelier"
          },
          total_products: {
            value: 12,
            label: "Alertes de Stock Bas",
            growth: "À réapprovisionner"
          }
        },
        status_distribution: {
          'Composants': { count: 85, revenue: 1062 },
          'Visserie': { count: 1520, revenue: 1024 },
          'Métaux': { count: 12, revenue: 2160 },
          'Matières Premières': { count: 1500, revenue: 3150 }
        },
        chart_data: [
          { date: '01/07', revenue: 980, orders: 12 },
          { date: '03/07', revenue: 1100, orders: 20 },
          { date: '05/07', revenue: 850, orders: 15 },
          { date: '07/07', revenue: 1200, orders: 35 },
          { date: '09/07', revenue: 1400, orders: 40 },
          { date: '11/07', revenue: 1350, orders: 18 },
          { date: '13/07', revenue: 1600, orders: 25 },
          { date: '15/07', revenue: 1540, orders: 22 }
        ],
        top_vendors: [],
        top_products: [],
        kpis: {
          gmv: 0, nmv: 0, aov: 0, success_rate: 0, failure_rate: 0, pickup_rate: 0, avg_delivery_time: '', on_time_delivery_rate: 0, cost_per_order: 0
        }
      }
      setData(mockData)
      setRecentOfs([
        { id: 1, code: 'OF-2026-001', articleNom: 'Axe Cylindrique A1', quantiteObjectif: 500, quantiteProduite: 500, statut: 'TERMINE', dateDebut: '2026-07-10' },
        { id: 2, code: 'OF-2026-002', articleNom: 'Support Moteur M2', quantiteObjectif: 300, quantiteProduite: 120, statut: 'EN_COURS', dateDebut: '2026-07-15' },
        { id: 3, code: 'OF-2026-003', articleNom: 'Boulon Taraudé B8', quantiteObjectif: 1000, quantiteProduite: 0, statut: 'PLANIFIE', dateDebut: '2026-07-20' }
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  if (loading || !data) {
    return <DashboardSkeleton />
  }

  const dates = data.chart_data.map((item) => item.date)
  const outputSeries = data.chart_data.map((item) => item.revenue)
  const scrapSeries = data.chart_data.map((item) => item.orders)

  const chartOptions: any = {
    series: [
      { name: 'Production', type: 'area', data: outputSeries },
      { name: 'Rebuts', type: 'line', data: scrapSeries }
    ],
    options: {
      chart: {
        fontFamily: 'Inter, sans-serif',
        type: 'line',
        height: 300,
        toolbar: { show: false },
        zoom: { enabled: false }
      },
      stroke: {
        curve: 'smooth',
        width: [3, 4],
      },
      markers: {
        size: [4, 5],
        colors: ['#FFFFFF', '#FFFFFF'],
        strokeColors: ['#3E97FF', '#F1416C'],
        strokeWidth: 2,
        hover: { size: 7 }
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories: dates,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { colors: '#A1A5B7', fontSize: '11px', fontWeight: '500' } }
      },
      yaxis: {
        labels: { style: { colors: '#A1A5B7', fontSize: '11px', fontWeight: '500' } }
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'vertical',
          shadeIntensity: 0.5,
          inverseColors: false,
          opacityFrom: [0.35, 0.9],
          opacityTo: [0.05, 0.9],
          stops: [0, 100]
        }
      },
      colors: ['#3E97FF', '#F1416C'],
      grid: {
        borderColor: '#F1F1F4',
        strokeDashArray: 4,
        yaxis: { lines: { show: true } }
      },
      tooltip: {
        style: { fontSize: '12px' },
        y: { formatter: (val: number) => val.toLocaleString() + ' unités' }
      }
    }
  }

  return (
    <>
      {}
      <div className='row g-5 g-xl-10 mb-xl-10'>
        <div className='col-md-6 col-lg-6 col-xl-3 col-xxl-3'>
          <StatisticsWidget
            color='primary'
            icon='delivery'
            title='Production'
            description={data.statistics.total_revenue.label}
            value={data.statistics.total_revenue.value.toLocaleString() + ' u'}
            change={data.statistics.total_revenue.growth}
            comparisonLabel={data.statistics.total_revenue.comparison_label}
            className='h-md-100'
          />
        </div>
        <div className='col-md-6 col-lg-6 col-xl-3 col-xxl-3'>
          <StatisticsWidget
            color='success'
            icon='archive'
            title='Ordres de fabrication'
            description={data.statistics.total_orders.label}
            value={data.statistics.total_orders.value}
            change={data.statistics.total_orders.growth}
            className='h-md-100'
          />
        </div>
        <div className='col-md-6 col-lg-6 col-xl-3 col-xxl-3'>
          <StatisticsWidget
            color='warning'
            icon='gear'
            title='Rendement'
            description={data.statistics.total_vendors.label}
            value={data.statistics.total_vendors.value}
            change={data.statistics.total_vendors.growth}
            className='h-md-100'
          />
        </div>
        <div className='col-md-6 col-lg-6 col-xl-3 col-xxl-3'>
          <StatisticsWidget
            color='danger'
            icon='shield-cross'
            title='Alertes'
            description={data.statistics.total_products.label}
            value={data.statistics.total_products.value}
            change={data.statistics.total_products.growth}
            className='h-md-100'
          />
        </div>
      </div>

      {}
      <div className='row g-5 mb-7'>
        <div className='col-12'>
          <div className='card card-flush shadow-sm border-0 h-100'>
            <div className='card-header pt-6'>
              <h3 className='card-title align-items-start flex-column'>
                <span className='card-label fw-bold text-gray-900 fs-5'>Production & Rebuts (14 derniers jours)</span>
                <span className='text-muted fs-7 fw-semibold mt-1'>Comparatif des volumes de production brute et rebuts (scrap)</span>
              </h3>
            </div>
            <div className='card-body pt-2'>
              <div style={{ height: '300px' }}>
                <Chart
                  options={chartOptions.options}
                  series={chartOptions.series}
                  type='line'
                  height={290}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {}
      <div className='row g-5 mb-7'>
        {}
        <div className='col-lg-6'>
          <div className='card card-flush shadow-sm border-0 h-100'>
            <div className='card-header pt-6'>
              <h3 className='card-title align-items-start flex-column'>
                <span className='card-label fw-bold text-gray-900 fs-5'>Ordres de Fabrication Récents</span>
                <span className='text-muted fs-7 fw-semibold mt-1'>Suivi d'activité des derniers lancements</span>
              </h3>
            </div>
            <div className='card-body pt-2'>
              <div className='table-responsive'>
                <table className='table align-middle table-row-dashed fs-6 gy-3'>
                  <thead>
                    <tr className='text-start text-gray-500 fw-bold fs-7 text-uppercase gs-0'>
                      <th>Code</th>
                      <th>Article</th>
                      <th>Objectif</th>
                      <th>Statut</th>
                      <th style={{minWidth: '70px'}} className='text-end pe-4'>Actions</th>
                    </tr>
                  </thead>
                  <tbody className='text-gray-600 fw-semibold'>
                    {recentOfs.map((o, index) => (
                      <tr key={index}>
                        <td className='fw-bold text-gray-900'>{o.code}</td>
                        <td>{o.articleNom}</td>
                        <td>{o.quantiteObjectif} u</td>
                        <td>
                          <span className={`badge badge-light-${o.statut === 'TERMINE' ? 'success' : o.statut === 'EN_COURS' ? 'primary' : 'warning'} fs-8 fw-bold`}>
                            {o.statut}
                          </span>
                        </td>
                        <td className='text-end pe-4'>
                          <button
                            className='btn btn-icon btn-bg-light btn-active-color-primary btn-sm'
                            onClick={() => {
                              setSelectedOf(o)
                              setShowOfModal(true)
                            }}
                            title="Voir les détails"
                          >
                            <KTIcon iconName='eye' className='fs-3' />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {}
        <div className='col-lg-6'>
          <div className='card card-flush shadow-sm border-0 h-100'>
            <div className='card-header pt-6'>
              <h3 className='card-title align-items-start flex-column'>
                <span className='card-label fw-bold text-gray-900 fs-5'>Répartition de l'Inventaire</span>
                <span className='text-muted fs-7 fw-semibold mt-1'>Volume global d'articles par catégorie</span>
              </h3>
            </div>
            <div className='card-body pt-2'>
              <div className='table-responsive'>
                <table className='table align-middle table-row-dashed fs-6 gy-3'>
                  <thead>
                    <tr className='text-start text-gray-500 fw-bold fs-7 text-uppercase gs-0'>
                      <th>Catégorie</th>
                      <th>Quantité Totale</th>
                      <th>Valeur Stockée</th>
                      <th style={{minWidth: '70px'}} className='text-end pe-4'>Actions</th>
                    </tr>
                  </thead>
                  <tbody className='text-gray-600 fw-semibold'>
                    {Object.entries(data.status_distribution).map(([cat, dist], idx) => (
                      <tr key={idx}>
                        <td className='fw-bold text-gray-900'>{cat}</td>
                        <td>{dist.count.toLocaleString()} u</td>
                        <td>{dist.revenue.toLocaleString()} DT</td>
                        <td className='text-end pe-4'>
                          <button
                            className='btn btn-icon btn-bg-light btn-active-color-primary btn-sm'
                            onClick={() => {
                              setSelectedCategory({ name: cat, ...dist })
                              setShowCategoryModal(true)
                            }}
                            title="Voir les détails"
                          >
                            <KTIcon iconName='eye' className='fs-3' />
                          </button>
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

      {selectedOf && (() => {
        const pct = Math.min(100, Math.round(((selectedOf.quantiteProduite || 0) / (selectedOf.quantiteObjectif || 1)) * 100))
        return (
          <Modal show={showOfModal} onHide={() => setShowOfModal(false)} centered size="lg">
            <Modal.Header closeButton className='border-0 pt-6 px-8 bg-light'>
              <Modal.Title className='fw-bold text-gray-900 fs-3 d-flex align-items-center gap-2'>
                <KTIcon iconName='archive' className='fs-1 text-primary' />
                Ordre de Fabrication : <span className='text-primary fw-extrabolder'>{selectedOf.code}</span>
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className='px-8 py-8'>
              <div className='row g-6'>
                <div className='col-12'>
                  <div className='card bg-light border-0 p-5 rounded-3'>
                    <span className='text-muted fs-8 fw-semibold text-uppercase ls-1'>Article à Fabriquer</span>
                    <div className='text-gray-900 fw-bold fs-5 mt-1'>{selectedOf.articleNom || '-'}</div>
                  </div>
                </div>

                <div className='col-12'>
                  <div className='card bg-body border border-dashed border-gray-300 p-5 rounded-3'>
                    <span className='text-gray-500 fw-bold fs-7 mb-2 d-block'>Avancement de la Production :</span>
                    <div className='d-flex align-items-center mb-1'>
                      <span className='fs-2 fw-extrabolder text-gray-900 me-3'>{pct}%</span>
                      <div className='progress h-10px w-100 bg-light rounded-pill overflow-hidden'>
                        <div
                          className={`progress-bar rounded-pill ${pct >= 100 ? 'bg-success' : 'bg-primary'}`}
                          role='progressbar'
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className='text-muted fs-8'>
                      {selectedOf.quantiteProduite?.toLocaleString() || 0} pièces réalisées sur un objectif de {selectedOf.quantiteObjectif?.toLocaleString()} pièces.
                    </span>
                  </div>
                </div>

                <div className='col-md-6'>
                  <div className='card bg-body border border-dashed border-gray-300 p-5 rounded-3 h-100'>
                    <div className='d-flex flex-column gap-4'>
                      <div className='d-flex justify-content-between border-bottom pb-3'>
                        <span className='text-gray-500 fw-bold fs-7'>Code OF :</span>
                        <span className='text-gray-900 fw-extrabolder fs-6'>{selectedOf.code || '-'}</span>
                      </div>
                      <div className='d-flex justify-content-between border-bottom pb-3'>
                        <span className='text-gray-500 fw-bold fs-7'>Date Début :</span>
                        <span className='text-gray-900 fw-bold fs-6'>{selectedOf.dateDebut || '-'}</span>
                      </div>
                      <div className='d-flex justify-content-between pb-1'>
                        <span className='text-gray-500 fw-bold fs-7'>Statut actuel :</span>
                        <span className={`badge badge-light-${selectedOf.statut === 'TERMINE' ? 'success' : selectedOf.statut === 'EN_COURS' ? 'primary' : 'warning'} fs-8 fw-bold`}>
                          {selectedOf.statut}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='col-md-6'>
                  <div className='card bg-body border border-dashed border-gray-300 p-5 rounded-3 h-100'>
                    <div className='d-flex flex-column gap-4'>
                      <div className='d-flex justify-content-between border-bottom pb-3'>
                        <span className='text-gray-500 fw-bold fs-7'>Volume Cible (Objectif) :</span>
                        <span className='text-gray-950 fw-extrabolder fs-6'>{selectedOf.quantiteObjectif?.toLocaleString()} unités</span>
                      </div>
                      <div className='d-flex justify-content-between border-bottom pb-3'>
                        <span className='text-gray-500 fw-bold fs-7'>Volume Réalisé (Produit) :</span>
                        <span className='text-success fw-extrabolder fs-6'>{(selectedOf.quantiteProduite || 0).toLocaleString()} unités</span>
                      </div>
                      <div className='d-flex justify-content-between pb-1'>
                        <span className='text-gray-500 fw-bold fs-7'>Pièces Restantes :</span>
                        <span className='text-gray-900 fw-bold fs-6'>
                          {Math.max(0, selectedOf.quantiteObjectif - (selectedOf.quantiteProduite || 0)).toLocaleString()} unités
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer className='border-0 bg-light py-4 px-8 d-flex justify-content-end'>
              <button className='btn btn-light-primary btn-sm px-6' onClick={() => setShowOfModal(false)}>
                Fermer
              </button>
            </Modal.Footer>
          </Modal>
        )
      })()}

      {selectedCategory && (
        <Modal show={showCategoryModal} onHide={() => setShowCategoryModal(false)} centered size="lg">
          <Modal.Header closeButton className='border-0 pt-6 px-8 bg-light'>
            <Modal.Title className='fw-bold text-gray-900 fs-3 d-flex align-items-center gap-2'>
              <KTIcon iconName='element-11' className='fs-1 text-primary' />
              Détails de la Catégorie : <span className='text-primary fw-extrabolder'>{selectedCategory.name}</span>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className='px-8 py-8'>
            <div className='row g-6'>
              {}
              <div className='col-12'>
                <div className='card bg-light border-0 p-5 rounded-3'>
                  <span className='text-muted fs-8 fw-semibold text-uppercase ls-1'>Catégorie d'Inventaire</span>
                  <div className='text-gray-900 fw-bold fs-5 mt-1'>{selectedCategory.name || '-'}</div>
                </div>
              </div>

              {}
              <div className='col-md-6'>
                <div className='card bg-body border border-dashed border-gray-300 p-5 rounded-3 h-100'>
                  <div className='d-flex flex-column gap-4'>
                    <div className='d-flex justify-content-between border-bottom pb-3'>
                      <span className='text-gray-500 fw-bold fs-7'>Désignation :</span>
                      <span className='text-gray-900 fw-bold fs-6'>{selectedCategory.name || '-'}</span>
                    </div>
                    <div className='d-flex justify-content-between pb-1'>
                      <span className='text-gray-500 fw-bold fs-7'>Quantité Totale en Stock :</span>
                      <span className='text-gray-900 fw-extrabolder fs-6'>{selectedCategory.count?.toLocaleString()} unités</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className='col-md-6'>
                <div className='card bg-body border border-dashed border-gray-300 p-5 rounded-3 h-100'>
                  <div className='d-flex flex-column gap-4'>
                    <div className='d-flex justify-content-between border-bottom pb-3'>
                      <span className='text-gray-500 fw-bold fs-7'>Valeur Stockée Globale :</span>
                      <span className='text-primary fw-extrabolder fs-6'>{selectedCategory.revenue?.toLocaleString()} DT</span>
                    </div>
                    <div className='d-flex justify-content-between pb-1'>
                      <span className='text-gray-500 fw-bold fs-7'>Statut de l'inventaire :</span>
                      <span className='badge badge-light-success fs-7 px-3 py-1 fw-bold'>Actif</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer className='border-0 bg-light py-4 px-8 d-flex justify-content-end'>
            <button className='btn btn-light-primary btn-sm px-6' onClick={() => setShowCategoryModal(false)}>
              Fermer
            </button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  )
}

const DashboardWrapper: FC = () => {
  return (
    <>
      <DashboardPage />
    </>
  )
}

export { DashboardWrapper }