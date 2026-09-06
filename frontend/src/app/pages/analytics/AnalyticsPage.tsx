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

let globalCachedAnalytics: MachineStat[] = []

export default function AnalyticsPage() {
  const [machines, setMachines] = useState<MachineStat[]>(globalCachedAnalytics)
  const [loading, setLoading] = useState(globalCachedAnalytics.length === 0)
  const [selectedSite, setSelectedSite] = useState<string>('ALL')
  const [selectedWorkshop, setSelectedWorkshop] = useState<string>('ALL')

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8081/api'

  const fetchAnalytics = async () => {
    if (globalCachedAnalytics.length === 0) setLoading(true)
    try {
      const { data } = await axios.get(`${apiUrl}/production/machines`)
      const list = Array.isArray(data) ? data : []
      globalCachedAnalytics = list
      setMachines(list)
    } catch (err) {
      console.error('Failed to fetch analytics from API:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  // Options uniques pour les filtres
  const workshops = useMemo(() => {
    const set = new Set<string>()
    machines.forEach((m) => {
      if (selectedSite === 'ALL' || m.emplacement === selectedSite) {
        if (m.workCenter) set.add(m.workCenter)
      }
    })
    return Array.from(set).sort()
  }, [machines, selectedSite])

  const sites = useMemo(() => {
    const set = new Set<string>()
    machines.forEach((m) => {
      if (m.emplacement) set.add(m.emplacement)
    })
    return Array.from(set).sort()
  }, [machines])

  // Filtrage
  const filteredMachines = useMemo(() => {
    return machines.filter((m) => {
      const matchWorkshop = selectedWorkshop === 'ALL' || m.workCenter === selectedWorkshop
      const matchSite = selectedSite === 'ALL' || m.emplacement === selectedSite
      return matchWorkshop && matchSite
    })
  }, [machines, selectedWorkshop, selectedSite])

  // Métriques globales
  const metrics = useMemo(() => {
    const totalOutput = filteredMachines.reduce((acc, m) => acc + (m.totalOutput || 0), 0)
    const totalScrap = filteredMachines.reduce((acc, m) => acc + (m.totalScrap || 0), 0)
    const totalOps = filteredMachines.reduce((acc, m) => acc + (m.operationCount || 0), 0)
    const avgTRS = filteredMachines.length > 0
      ? filteredMachines.reduce((acc, m) => acc + (m.tauxRendement || 0), 0) / filteredMachines.length
      : 0
    const scrapRate = (totalOutput + totalScrap) > 0
      ? (totalScrap / (totalOutput + totalScrap)) * 100
      : 0

    return {
      totalOutput,
      totalScrap,
      totalOps,
      avgTRS: Math.round(avgTRS * 10) / 10,
      scrapRate: Math.round(scrapRate * 100) / 100,
      totalMachines: filteredMachines.length
    }
  }, [filteredMachines])

  // Agrégation par Atelier (WorkCenter)
  const workshopData = useMemo(() => {
    const map: { [key: string]: { output: number; scrap: number; machines: number; avgTRS: number; site: string } } = {}
    filteredMachines.forEach((m) => {
      const wc = m.workCenter || 'Standard'
      if (!map[wc]) {
        map[wc] = { output: 0, scrap: 0, machines: 0, avgTRS: 0, site: m.emplacement || 'Principal' }
      }
      map[wc].output += m.totalOutput || 0
      map[wc].scrap += m.totalScrap || 0
      map[wc].machines += 1
      map[wc].avgTRS += m.tauxRendement || 0
    })

    return Object.entries(map).map(([name, data]) => {
      const avg = data.machines > 0 ? Math.round((data.avgTRS / data.machines) * 10) / 10 : 0
      const scrapPct = (data.output + data.scrap) > 0 ? Math.round((data.scrap / (data.output + data.scrap)) * 1000) / 10 : 0
      return {
        name,
        output: data.output,
        scrap: data.scrap,
        machines: data.machines,
        avgTRS: avg,
        scrapPct,
        site: data.site
      }
    }).sort((a, b) => b.output - a.output)
  }, [filteredMachines])

  // Répartition par Site (Donut)
  const siteData = useMemo(() => {
    const map: { [key: string]: number } = {}
    const dataset = selectedSite === 'ALL' ? machines : filteredMachines
    dataset.forEach((m) => {
      const s = m.emplacement || 'Non défini'
      map[s] = (map[s] || 0) + (m.totalOutput || 0)
    })
    return {
      labels: Object.keys(map),
      series: Object.values(map)
    }
  }, [machines, filteredMachines, selectedSite])

  // Top 8 Machines par Volume
  const top8Output = useMemo(() => {
    return [...filteredMachines]
      .sort((a, b) => (b.totalOutput || 0) - (a.totalOutput || 0))
      .slice(0, 8)
  }, [filteredMachines])

  // Graphique 1 : Volume de Production par Atelier
  const workshopBarOptions: any = {
    series: [{
      name: 'Volume Produit (unités)',
      data: workshopData.map((w) => w.output)
    }],
    options: {
      chart: {
        fontFamily: 'Inter, sans-serif',
        type: 'bar',
        height: 290,
        toolbar: { show: false }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '40%',
          borderRadius: 4
        }
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories: workshopData.map((w) => w.name),
        labels: {
          style: { colors: '#7E8299', fontSize: '11px', fontWeight: '600' }
        }
      },
      yaxis: {
        labels: {
          style: { colors: '#7E8299', fontSize: '11px' },
          formatter: (val: number) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : `${val}`)
        }
      },
      colors: ['#009EF7'],
      grid: { borderColor: '#EFF2F5', strokeDashArray: 4 },
      tooltip: {
        y: { formatter: (val: number) => `${val.toLocaleString()} pièces` }
      }
    }
  }

  // Couleurs harmonisées et vives par site
  const getSiteColor = (label: string) => {
    const l = (label || '').toLowerCase()
    if (l.includes('kondar')) return '#009EF7' // Bleu Kondar
    if (l.includes('sousse')) return '#50CD89' // Vert Sousse
    if (l.includes('brno')) return '#F59E0B'   // Ambre Brno
    return '#7239EA'
  }

  // Graphique 2 : Répartition par Site (Donut)
  const siteDonutOptions: any = {
    series: siteData.series.length > 0 ? siteData.series : [1],
    options: {
      chart: {
        fontFamily: 'Inter, sans-serif',
        type: 'donut',
        height: 290
      },
      labels: siteData.labels.length > 0 ? siteData.labels : ['Aucune donnée'],
      colors: siteData.labels.length > 0 ? siteData.labels.map(getSiteColor) : ['#009EF7', '#50CD89', '#F59E0B'],
      plotOptions: {
        pie: {
          donut: {
            size: '65%',
            labels: {
              show: true,
              total: {
                show: true,
                label: 'Total Production',
                fontSize: '12px',
                fontWeight: '600',
                color: '#7E8299',
                formatter: () => `${metrics.totalOutput.toLocaleString()} u`
              },
              value: {
                fontSize: '16px',
                fontWeight: '700',
                color: '#181C32',
                formatter: (val: string) => `${Number(val).toLocaleString()} u`
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
        y: { formatter: (val: number) => `${val.toLocaleString()} unités` }
      }
    }
  }

  // Graphique 3 : Top 8 Machines (Horizontal Bar)
  const topMachinesBarOptions: any = {
    series: [{
      name: 'Volume Produit',
      data: top8Output.map((m) => Math.round(m.totalOutput || 0))
    }],
    options: {
      chart: {
        fontFamily: 'Inter, sans-serif',
        type: 'bar',
        height: 290,
        toolbar: { show: false }
      },
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: '50%',
          borderRadius: 4
        }
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => `${(val / 1000).toFixed(0)}k u`,
        style: { fontSize: '10px', fontWeight: '600', colors: ['#ffffff'] },
        offsetX: -10
      },
      xaxis: {
        categories: top8Output.map((m) => m.nom || m.code),
        labels: {
          style: { colors: '#7E8299', fontSize: '11px' },
          formatter: (val: number) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : `${val}`)
        }
      },
      yaxis: {
        labels: {
          style: { colors: '#3F4254', fontSize: '11px', fontWeight: '600' },
          maxWidth: 160
        }
      },
      colors: ['#50CD89'],
      grid: { borderColor: '#EFF2F5', strokeDashArray: 4 },
      tooltip: {
        y: { formatter: (val: number) => `${val.toLocaleString()} pièces` }
      }
    }
  }

  // Badge visuel et contrasté pour distinguer immédiatement chaque site
  const renderSiteBadge = (siteName: string) => {
    const s = (siteName || '').toLowerCase()
    if (s.includes('kondar')) {
      return (
        <span
          className='badge fw-bolder fs-8 px-3 py-2'
          style={{
            backgroundColor: '#E8F3FF',
            color: '#0066CC',
            border: '1px solid #B6D9FF'
          }}
        >
          <span className='bullet bullet-dot bg-primary me-2' style={{ width: '6px', height: '6px' }}></span>
          Kondar
        </span>
      )
    }
    if (s.includes('sousse')) {
      return (
        <span
          className='badge fw-bolder fs-8 px-3 py-2'
          style={{
            backgroundColor: '#E8FFF3',
            color: '#0BB783',
            border: '1px solid #A8F0CB'
          }}
        >
          <span className='bullet bullet-dot bg-success me-2' style={{ width: '6px', height: '6px' }}></span>
          Sousse
        </span>
      )
    }
    if (s.includes('brno')) {
      return (
        <span
          className='badge fw-bolder fs-8 px-3 py-2'
          style={{
            backgroundColor: '#FFF4E5',
            color: '#B45309',
            border: '1px solid #FCD34D'
          }}
        >
          <span className='bullet bullet-dot bg-warning me-2' style={{ width: '6px', height: '6px' }}></span>
          Brno
        </span>
      )
    }
    return (
      <span className='badge badge-light-secondary text-gray-700 fw-bold fs-8 px-3 py-2 border'>
        {siteName}
      </span>
    )
  }

  if (loading && machines.length === 0) {
    return <PageSkeleton type='charts' />
  }

  return (
    <div className='d-flex flex-column gap-6'>
      {/* En-tête de la page */}
      <div className='card shadow-sm border-0'>
        <div className='card-body p-6 d-flex flex-wrap align-items-center justify-content-between gap-4'>
          <div>
            <h1 className='d-flex align-items-center text-gray-900 fw-bold fs-3 my-1'>
              <KTIcon iconName='chart-line-up' className='fs-1 text-primary me-3' />
              Tableau de Bord Analytique & Performance
            </h1>
            <span className='text-muted fw-semibold fs-7'>
              Indicateurs clés de performance industrielle, rendement opérationnel (TRS) et suivi des centres de charge
            </span>
          </div>

          {/* Filtres interactifs */}
          <div className='d-flex flex-wrap align-items-center gap-3'>
            <div className='d-flex align-items-center gap-2'>
              <span className='fs-8 fw-bold text-gray-600 text-uppercase'>Site :</span>
              <select
                className='form-select form-select-sm form-select-solid w-140px'
                value={selectedSite}
                onChange={(e) => {
                  setSelectedSite(e.target.value)
                  setSelectedWorkshop('ALL')
                }}
              >
                <option value='ALL'>Tous les Sites ({sites.length})</option>
                {sites.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

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

            <button
              className='btn btn-sm btn-light-primary'
              onClick={fetchAnalytics}
              title='Actualiser les données'
            >
              <KTIcon iconName='arrows-circle' className='fs-5' />
              Actualiser
            </button>
          </div>
        </div>
      </div>

      {/* 4 Indicateurs Synthétiques (KPIs) */}
      <div className='row g-5'>
        {/* KPI 1 : Production Totale */}
        <div className='col-xl-3 col-md-6'>
          <div className='card h-100 p-6 border-0 shadow-sm'>
            <div className='d-flex align-items-center justify-content-between mb-3'>
              <span className='text-gray-600 fw-bold fs-7 text-uppercase'>Volume Produit</span>
              <div className='badge badge-light-primary p-3 rounded-circle'>
                <KTIcon iconName='cube-3' className='fs-2 text-primary' />
              </div>
            </div>
            <div className='fs-2hx fw-bold text-gray-900 mb-1'>{metrics.totalOutput.toLocaleString()}</div>
            <div className='text-muted fs-8 fw-semibold'>Unités conformes enregistrées</div>
          </div>
        </div>

        {/* KPI 2 : Taux de Rendement Synthétique (TRS) */}
        <div className='col-xl-3 col-md-6'>
          <div className='card h-100 p-6 border-0 shadow-sm'>
            <div className='d-flex align-items-center justify-content-between mb-3'>
              <span className='text-gray-600 fw-bold fs-7 text-uppercase'>Taux Rendement (TRS)</span>
              <div className='badge badge-light-success p-3 rounded-circle'>
                <KTIcon iconName='verify' className='fs-2 text-success' />
              </div>
            </div>
            <div className='fs-2hx fw-bold text-success mb-1'>{metrics.avgTRS}%</div>
            <div className='text-muted fs-8 fw-semibold'>Efficacité moyenne des équipements</div>
          </div>
        </div>

        {/* KPI 3 : Rebuts / Non-conformités */}
        <div className='col-xl-3 col-md-6'>
          <div className='card h-100 p-6 border-0 shadow-sm'>
            <div className='d-flex align-items-center justify-content-between mb-3'>
              <span className='text-gray-600 fw-bold fs-7 text-uppercase'>Rebuts / Non-conformités</span>
              <div className='badge badge-light-danger p-3 rounded-circle'>
                <KTIcon iconName='trash' className='fs-2 text-danger' />
              </div>
            </div>
            <div className='d-flex align-items-baseline gap-2 mb-1'>
              <div className='fs-2hx fw-bold text-danger'>{metrics.totalScrap.toLocaleString()}</div>
              <span className='badge badge-light-danger fs-8 fw-bold'>{metrics.scrapRate}%</span>
            </div>
            <div className='text-muted fs-8 fw-semibold'>Taux de rebut global sur le parc</div>
          </div>
        </div>

        {/* KPI 4 : Postes de charge */}
        <div className='col-xl-3 col-md-6'>
          <div className='card h-100 p-6 border-0 shadow-sm'>
            <div className='d-flex align-items-center justify-content-between mb-3'>
              <span className='text-gray-600 fw-bold fs-7 text-uppercase'>Centres & Équipements</span>
              <div className='badge badge-light-info p-3 rounded-circle'>
                <KTIcon iconName='setting-3' className='fs-2 text-info' />
              </div>
            </div>
            <div className='fs-2hx fw-bold text-gray-900 mb-1'>{metrics.totalMachines} Machines</div>
            <div className='text-muted fs-8 fw-semibold'>Réparties sur {workshopData.length} centres de charge</div>
          </div>
        </div>
      </div>

      {/* Ligne Graphiques Principaux */}
      <div className='row g-6'>
        {/* Graphique 1 : Volume de Production par Atelier */}
        <div className='col-xl-7'>
          <div className='card shadow-sm border-0 h-100'>
            <div className='card-header pt-6 bg-transparent border-0'>
              <h3 className='card-title align-items-start flex-column'>
                <span className='card-label fw-bold text-gray-900 fs-5'>Volume de Production par Atelier</span>
                <span className='text-muted fs-7 fw-semibold mt-1'>Répartition du volume produit par centre de charge</span>
              </h3>
            </div>
            <div className='card-body pt-2'>
              <div style={{ height: '300px' }}>
                <Chart
                  options={workshopBarOptions.options}
                  series={workshopBarOptions.series}
                  type='bar'
                  height={290}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Graphique 2 : Répartition par Site */}
        <div className='col-xl-5'>
          <div className='card shadow-sm border-0 h-100'>
            <div className='card-header pt-6 bg-transparent border-0'>
              <h3 className='card-title align-items-start flex-column'>
                <span className='card-label fw-bold text-gray-900 fs-5'>Répartition de la Production par Site</span>
                <span className='text-muted fs-7 fw-semibold mt-1'>Part de volume par implantation géographique</span>
              </h3>
            </div>
            <div className='card-body pt-2 d-flex align-items-center justify-content-center'>
              <div style={{ width: '100%', height: '300px' }}>
                <Chart
                  options={siteDonutOptions.options}
                  series={siteDonutOptions.series}
                  type='donut'
                  height={290}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ligne 2 : Top Équipements & Synthèse Ateliers */}
      <div className='row g-6'>
        {/* Top 8 Machines */}
        <div className='col-xl-5'>
          <div className='card shadow-sm border-0 h-100'>
            <div className='card-header pt-6 bg-transparent border-0'>
              <h3 className='card-title align-items-start flex-column'>
                <span className='card-label fw-bold text-gray-900 fs-5'>Top 8 Équipements les plus Sollicités</span>
                <span className='text-muted fs-7 fw-semibold mt-1'>Classement par volume de pièces usinées</span>
              </h3>
            </div>
            <div className='card-body pt-2'>
              <div style={{ height: '300px' }}>
                <Chart
                  options={topMachinesBarOptions.options}
                  series={topMachinesBarOptions.series}
                  type='bar'
                  height={290}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tableau Synthétique par Atelier */}
        <div className='col-xl-7'>
          <div className='card shadow-sm border-0 h-100'>
            <div className='card-header pt-6 bg-transparent border-0'>
              <h3 className='card-title align-items-start flex-column'>
                <span className='card-label fw-bold text-gray-900 fs-5'>Synthèse de Performance par Centre de Charge</span>
                <span className='text-muted fs-7 fw-semibold mt-1'>Bilan consolidé production, rebuts et rendement moyen</span>
              </h3>
            </div>
            <div className='card-body pt-2'>
              <div className='table-responsive'>
                <table className='table table-row-bordered table-row-gray-200 align-middle gs-0 gy-3'>
                  <thead>
                    <tr className='fw-bold text-muted fs-7 text-uppercase'>
                      <th>Centre de Charge</th>
                      <th>Site</th>
                      <th className='text-center'>Machines</th>
                      <th className='text-end'>Volume Produit</th>
                      <th className='text-end'>Rebuts</th>
                      <th className='text-center'>TRS Moyen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workshopData.map((w, idx) => (
                      <tr key={idx}>
                        <td>
                          <span className='fw-bold text-gray-900 fs-7'>{w.name}</span>
                        </td>
                        <td>
                          {renderSiteBadge(w.site)}
                        </td>
                        <td className='text-center text-gray-700 fw-semibold fs-7'>{w.machines}</td>
                        <td className='text-end text-gray-900 fw-bold fs-7'>{w.output.toLocaleString()} u</td>
                        <td className='text-end text-danger fw-semibold fs-7'>
                          {w.scrap > 0 ? `${w.scrap.toLocaleString()} u` : '0 u'}
                        </td>
                        <td>
                          <div className='d-flex align-items-center justify-content-center gap-2'>
                            <div className='progress w-50px h-5px bg-light-success'>
                              <div className='progress-bar bg-success' style={{ width: `${w.avgTRS}%` }}></div>
                            </div>
                            <span className='fw-bold text-gray-800 fs-7'>{w.avgTRS}%</span>
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
    </div>
  )
}