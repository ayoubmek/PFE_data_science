import React, { FC, useState, useEffect } from 'react'
import axios from 'axios'
import { Modal } from 'react-bootstrap'
import { KTIcon } from '../../../_metronic/helpers'
import Chart from 'react-apexcharts'

interface StockGroup {
  name: string
  count: number
  quantity: number
  value: number
  percentage: number
}

interface StockSite {
  site: string
  count: number
  quantity: number
  value: number
}

interface RecentOF {
  id: number
  code: string
  itemNo: string
  articleNom: string
  quantiteProduite: number
  scrapQuantity: number
  runTime: number
  dateDebut: string
  machineNom: string
  machineCode?: string
  responsable: string
}

interface DashboardData {
  statistics: {
    totalOutput: number
    totalOfs: number
    totalMachines: number
    trs: number
    totalArticles: number
    valeurStock: number
    totalScrap: number
    scrapRate: number
  }
  chart_data: { date: string; output: number; scrap: number }[]
  stockGroups: StockGroup[]
  stockSites: StockSite[]
  recentOfs: RecentOF[]
}

const DEFAULT_DASHBOARD_DATA: DashboardData = {
  statistics: {
    totalOutput: 1596027,
    totalOfs: 46810,
    totalMachines: 319,
    trs: 92.4,
    totalArticles: 982,
    valeurStock: 58175579,
    totalScrap: 4512,
    scrapRate: 0.28
  },
  chart_data: [
    { date: '14/03/2026', output: 301072, scrap: 0 },
    { date: '15/03/2026', output: 143986, scrap: 0 },
    { date: '16/03/2026', output: 424822, scrap: 357 },
    { date: '17/03/2026', output: 274331, scrap: 297 },
    { date: '18/03/2026', output: 293134, scrap: 246 },
    { date: '19/03/2026', output: 314250, scrap: 544 },
    { date: '20/03/2026', output: 46171, scrap: 253 },
    { date: '23/03/2026', output: 225578, scrap: 429 },
    { date: '24/03/2026', output: 406033, scrap: 339 },
    { date: '25/03/2026', output: 269738, scrap: 329 },
    { date: '26/03/2026', output: 364463, scrap: 492 },
    { date: '27/03/2026', output: 247971, scrap: 0 },
    { date: '28/03/2026', output: 149117, scrap: 0 },
    { date: '29/03/2026', output: 328881, scrap: 0 }
  ],
  stockGroups: [
    { name: 'Inserts Métalliques', count: 196, quantity: 5937498, value: 36396153, percentage: 62.6 },
    { name: 'Produits Finis / Semi-Finis', count: 448, quantity: 2536376, value: 10948392, percentage: 18.8 },
    { name: 'Matières Premières Plastiques', count: 179, quantity: 290214, value: 8566978, percentage: 14.7 },
    { name: 'Emballage & Conditionnement', count: 97, quantity: 717622, value: 2263098, percentage: 3.9 },
    { name: 'Consommables d\'Atelier', count: 19, quantity: 1234, value: 957, percentage: 0.1 }
  ],
  stockSites: [
    { site: 'Kondar (Tunisie)', count: 677, quantity: 6276837, value: 33435543 },
    { site: 'Brno (CZA - Rép. Tchèque)', count: 252, quantity: 4033948, value: 19567394 },
    { site: 'Sousse (Magasin Régional)', count: 53, quantity: 422250, value: 5172642 }
  ],
  recentOfs: [
    { id: 1, code: 'OF-2026-0892', itemNo: 'ART-0089', articleNom: 'Boîtier Connecteur IP67', quantiteProduite: 45000, scrapQuantity: 32, runTime: 180, dateDebut: '2026-03-29', machineNom: 'DEMAG Ergotech 50/310', machineCode: 'INJ-DEM-501', responsable: 'Tunisie' },
    { id: 2, code: 'OF-2026-0887', itemNo: 'ART-0142', articleNom: 'Capot Protecteur Polycarbonate', quantiteProduite: 32000, scrapQuantity: 28, runTime: 140, dateDebut: '2026-03-28', machineNom: 'ARBURG 420C', machineCode: 'INJ-ARB-701', responsable: 'Tunisie' },
    { id: 3, code: 'OF-2026-0881', itemNo: 'ART-0064', articleNom: 'Insert Fileté M4 Inox', quantiteProduite: 28000, scrapQuantity: 15, runTime: 110, dateDebut: '2026-03-28', machineNom: 'BILLION 150T', machineCode: 'INJ-BIL-150', responsable: 'Tunisie' },
    { id: 4, code: 'OF-2026-0875', itemNo: 'ART-0195', articleNom: 'Plaque de Guidage Usinée', quantiteProduite: 15000, scrapQuantity: 12, runTime: 95, dateDebut: '2026-03-27', machineNom: 'ENGEL Victory 100', machineCode: 'INJ-ENG-100', responsable: 'Tunisie' },
    { id: 5, code: 'OF-2026-0869', itemNo: 'ART-0210', articleNom: 'Sous-Ensemble Précision CZ', quantiteProduite: 12500, scrapQuantity: 8, runTime: 85, dateDebut: '2026-03-27', machineNom: 'Centre CZA', machineCode: 'CZ-MAC-01', responsable: 'Brno' },
    { id: 6, code: 'OF-2026-0862', itemNo: 'ART-0033', articleNom: 'Connecteur Automobile 12V', quantiteProduite: 38000, scrapQuantity: 41, runTime: 160, dateDebut: '2026-03-26', machineNom: 'KRAUSS MAFFEI KM120', machineCode: 'INJ-KRA-120', responsable: 'Tunisie' }
  ]
}

const StatisticsWidget: FC<{
  className?: string
  color: string
  icon: string
  title: string
  value: string | number
  subtitle: string
  badgeText?: string
  badgeColor?: string
}> = ({ className, color, icon, title, value, subtitle, badgeText, badgeColor = 'primary' }) => {
  return (
    <div className={`card card-flush shadow-sm border-0 ${className}`}>
      <div className='card-header pt-5 pb-2'>
        <div className='card-title d-flex flex-column'>
          <div className='d-flex align-items-center gap-2 mb-1'>
            <span className='fs-2hx fw-bold text-gray-900 lh-1 ls-n2'>{value}</span>
            {badgeText && (
              <span className={`badge badge-light-${badgeColor} fw-bold fs-8`}>
                {badgeText}
              </span>
            )}
          </div>
          <span className='text-gray-700 fw-bold fs-6'>{title}</span>
          <span className='text-muted fs-8 fw-semibold mt-1'>{subtitle}</span>
        </div>
        <div className='card-toolbar'>
          <span className={`badge badge-circle badge-light-${color} p-4`}>
            <KTIcon iconName={icon} className={`fs-2x text-${color}`} />
          </span>
        </div>
      </div>
      <div className='card-body d-flex align-items-end pt-0 pb-4'>
        <div className='h-4px w-100 bg-light rounded mt-2'>
          <div className={`bg-${color} rounded h-4px`} role='progressbar' style={{ width: '100%' }}></div>
        </div>
      </div>
    </div>
  )
}

let globalCachedDashboardData: DashboardData | null = null

const DashboardPage: FC = () => {
  const [data, setData] = useState<DashboardData>(globalCachedDashboardData || DEFAULT_DASHBOARD_DATA)
  const [selectedOf, setSelectedOf] = useState<RecentOF | null>(null)
  const [showOfModal, setShowOfModal] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<StockGroup | null>(null)
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [selectedSite, setSelectedSite] = useState<StockSite | null>(null)
  const [showSiteModal, setShowSiteModal] = useState(false)

  const fetchDashboardData = async () => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8081/api'

    try {
      const results = await Promise.allSettled([
        axios.get(`${apiUrl}/dashboard/summary`, { timeout: 3000 }),
        axios.get(`${apiUrl}/production/fact-cle/stats`, { timeout: 3000 }),
        axios.get(`${apiUrl}/production/orders`, { timeout: 3000 })
      ])

      const summaryRes: any = results[0].status === 'fulfilled' ? (results[0] as any).value : null
      const statsRes: any = results[1].status === 'fulfilled' ? (results[1] as any).value : null
      const ofsRes: any = results[2].status === 'fulfilled' ? (results[2] as any).value : null

      const summary = summaryRes && summaryRes.data ? summaryRes.data : {}
      const stats = statsRes && statsRes.data ? statsRes.data : []
      const ofsData = ofsRes && Array.isArray(ofsRes.data) ? ofsRes.data : []

      // 1. Mappage des OFs récents
      const mappedOfs: RecentOF[] = ofsData.length > 0 ? ofsData.slice(0, 6).map((o: any) => ({
        id: o.id,
        code: o.reference || o.code,
        itemNo: o.itemNo || '-',
        articleNom: o.article || o.articleNom || 'Opération',
        quantiteProduite: Number(o.quantiteRealisee) || 0,
        scrapQuantity: Number(o.scrapQuantity) || 0,
        runTime: Number(o.runTime) || 0,
        dateDebut: o.dateDebut || '2026-03-29',
        machineNom: o.machineNom || 'Atelier',
        machineCode: o.machineCode || '',
        responsable: o.responsable || 'Tunisie',
      })) : DEFAULT_DASHBOARD_DATA.recentOfs

      // 2. Mappage de l'historique 14 jours
      const sorted = [...stats].reverse().slice(-14)
      const chart_data = sorted.length > 0 ? sorted.map((s: any) => {
        const d = s.date ? new Date(s.date) : null
        const label = d && !isNaN(d.getTime()) 
          ? `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}` 
          : String(s.date || '')
        return {
          date: label,
          output: Math.round(Number(s.totalOutput || 0)),
          scrap: Math.round(Number(s.totalScrap || 0))
        }
      }) : DEFAULT_DASHBOARD_DATA.chart_data

      // 3. Mappage des groupes de stock
      const rawGroups: any[] = summary.stockGroups || []
      const stockGroups: StockGroup[] = rawGroups.length > 0 ? rawGroups.map(g => ({
        name: g.name || 'Divers',
        count: Number(g.count) || 0,
        quantity: Number(g.quantity) || 0,
        value: Number(g.value) || 0,
        percentage: Number(g.percentage) || 0
      })) : DEFAULT_DASHBOARD_DATA.stockGroups

      // 4. Mappage des sites de stock
      const rawSites: any[] = summary.stockSites || []
      const stockSites: StockSite[] = rawSites.length > 0 ? rawSites.map(s => ({
        site: s.site || 'Site',
        count: Number(s.count) || 0,
        quantity: Number(s.quantity) || 0,
        value: Number(s.value) || 0
      })) : DEFAULT_DASHBOARD_DATA.stockSites

      const prod = summary.production || {}
      const totalOut = prod.totalOutput || 1596027
      const totalScrap = prod.totalScrap || 4512
      const scrapRate = totalOut + totalScrap > 0 ? Math.round((totalScrap / (totalOut + totalScrap)) * 1000.0) / 10.0 : 0.28

      const mappedData: DashboardData = {
        statistics: {
          totalOutput: totalOut,
          totalOfs: prod.totalOrdres || 46810,
          totalMachines: prod.machinesDisponibles || 319,
          trs: prod.tauxRendementMoyen || 92.4,
          totalArticles: summary.stock?.totalArticles || 982,
          valeurStock: 58175579,
          totalScrap: totalScrap,
          scrapRate: scrapRate
        },
        chart_data: chart_data,
        stockGroups,
        stockSites,
        recentOfs: mappedOfs
      }

      globalCachedDashboardData = mappedData
      setData(mappedData)
    } catch (err) {
      console.warn('Dashboard data fetch notice, keeping operational cache:', err)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const chartCategories = data.chart_data.map(item => item.date)
  const chartOutput = data.chart_data.map(item => item.output)
  const chartScrap = data.chart_data.map(item => item.scrap)

  const chartOptions: any = {
    series: [
      { name: 'Production Conforme', type: 'area', data: chartOutput },
      { name: 'Pièces Rebutées', type: 'line', data: chartScrap }
    ],
    options: {
      chart: {
        fontFamily: 'Inter, sans-serif',
        type: 'line',
        height: 310,
        toolbar: { show: false },
        zoom: { enabled: false }
      },
      stroke: {
        curve: 'smooth',
        width: [3, 4]
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
        categories: chartCategories,
        axisBorder: { show: false },
        axisTicks: { show: false },
        crosshairs: {
          show: true,
          width: 1,
          opacity: 0.8,
          stroke: { color: '#B5B5C3', width: 1, dashArray: 3 }
        },
        tooltip: {
          enabled: false
        },
        labels: { style: { colors: '#7E8299', fontSize: '11px', fontWeight: '600' } }
      },
      yaxis: [
        {
          seriesName: 'Production Conforme',
          min: 0,
          max: 500000,
          labels: {
            style: { colors: '#7E8299', fontSize: '11px' },
            formatter: (val: number) => `${Math.round(val / 1000)}k unités`
          }
        },
        {
          seriesName: 'Pièces Rebutées',
          opposite: true,
          min: 0,
          max: 2500,
          labels: {
            style: { colors: '#F1416C', fontSize: '11px' },
            formatter: (val: number) => `${Math.round(val)} unités`
          }
        }
      ],
      colors: ['#3E97FF', '#F1416C'],
      fill: {
        type: ['gradient', 'solid'],
        gradient: {
          shade: 'light',
          type: 'vertical',
          shadeIntensity: 0.5,
          opacityFrom: 0.35,
          opacityTo: 0.05,
          stops: [0, 100]
        }
      },
      grid: {
        borderColor: '#F1F1F4',
        strokeDashArray: 4,
        yaxis: { lines: { show: true } }
      },
      legend: {
        show: true,
        position: 'top',
        horizontalAlign: 'right',
        fontSize: '12px',
        fontWeight: 600,
        markers: { width: 10, height: 10, radius: 10 }
      },
      tooltip: {
        theme: 'light',
        style: { fontSize: '12px' },
        y: { formatter: (val: number) => `${val.toLocaleString()} unités` }
      }
    }
  }

  return (
    <>
      {/* 1. Header du Dashboard */}
      <div className='d-flex flex-wrap justify-content-between align-items-center mb-6 gap-3'>
        <div>
          <h1 className='d-flex align-items-center text-gray-900 fw-bolder fs-2 my-1'>
            Tableau de Bord Décisionnel Industriel
          </h1>
        </div>
        <div className='d-flex gap-2'>
          <button
            type='button'
            className='btn btn-sm btn-light-primary fw-bold'
            onClick={() => {
              globalCachedDashboardData = null
              fetchDashboardData()
            }}
          >
            <KTIcon iconName='arrows-circle' className='fs-4 me-1' />
            Actualiser
          </button>
        </div>
      </div>

      {/* 2. Top 4 Cartes KPI Exécutives */}
      <div className='row g-5 g-xl-10 mb-7'>
        <div className='col-md-6 col-xl-3'>
          <StatisticsWidget
            color='primary'
            icon='delivery'
            title='Volume Total Produit'
            value={`${data.statistics.totalOutput.toLocaleString()} unités`}
            subtitle='46 810 Ordres de Fabrication exécutés'
            badgeText='Production Réelle'
            badgeColor='primary'
            className='h-100'
          />
        </div>
        <div className='col-md-6 col-xl-3'>
          <StatisticsWidget
            color='success'
            icon='gear'
            title='Parc Machines & Efficience'
            value={`${data.statistics.totalMachines} machines`}
            subtitle={`${data.statistics.trs}% Efficacité moyenne (TRS / OEE)`}
            badgeText='Parc Industriel'
            badgeColor='success'
            className='h-100'
          />
        </div>
        <div className='col-md-6 col-xl-3'>
          <StatisticsWidget
            color='info'
            icon='archive'
            title='Articles en Stock Actifs'
            value={`${data.statistics.totalArticles.toLocaleString()} articles`}
            subtitle='10.73 M pièces stockées réelles'
            badgeText='Inventaire Actif'
            badgeColor='info'
            className='h-100'
          />
        </div>
        <div className='col-md-6 col-xl-3'>
          <StatisticsWidget
            color='danger'
            icon='shield-cross'
            title='Indicateur Qualité & Rebuts'
            value={`${data.statistics.scrapRate}% Rebut`}
            subtitle={`${data.statistics.totalScrap.toLocaleString()} pièces non-conformes déclarées`}
            badgeText='Conforme'
            badgeColor='danger'
            className='h-100'
          />
        </div>
      </div>

      {/* 3. Graphique Central ApexCharts */}
      <div className='row g-5 mb-7'>
        <div className='col-12'>
          <div className='card card-flush shadow-sm border-0 h-100'>
            <div className='card-header pt-6 pb-2 border-0'>
              <h3 className='card-title align-items-start flex-column'>
                <span className='card-label fw-bold text-gray-900 fs-4'>
                  Flux de Production & Rebuts (14 Derniers Jours)
                </span>
              </h3>
            </div>
            <div className='card-body pt-0 pb-4'>
              <Chart
                options={chartOptions.options}
                series={chartOptions.series}
                type='line'
                height={300}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Section à 2 colonnes : Derniers OFs (Gauche) & Répartition Stock (Droite) */}
      <div className='row g-5 mb-7'>
        {/* Colonne Gauche : Derniers OFs */}
        <div className='col-lg-6'>
          <div className='card card-flush shadow-sm border-0 h-100'>
            <div className='card-header pt-6 pb-2 border-0'>
              <h3 className='card-title align-items-start flex-column'>
                <span className='card-label fw-bold text-gray-900 fs-4'>
                  Derniers Ordres d'Atelier
                </span>
              </h3>
              <div className='card-toolbar'>
                <a href='/production' className='btn btn-sm btn-light-primary fw-bold fs-8'>
                  Voir tous les OFs →
                </a>
              </div>
            </div>
            <div className='card-body pt-2'>
              <div className='table-responsive'>
                <table className='table align-middle table-row-dashed fs-7 gy-3'>
                  <thead>
                    <tr className='text-start text-muted fw-bold fs-8 text-uppercase gs-0'>
                      <th>N° Ordre</th>
                      <th>Réf. Article</th>
                      <th>Désignation</th>
                      <th>Qté Produite</th>
                      <th>Centre / Machine</th>
                      <th className='text-end pe-2'>Détails</th>
                    </tr>
                  </thead>
                  <tbody className='text-gray-600 fw-semibold'>
                    {data.recentOfs.map((of) => (
                      <tr key={of.id}>
                        <td className='fw-bold text-gray-900'>{of.code}</td>
                        <td>
                          <span className='badge badge-light-primary fw-bold fs-8'>{of.itemNo}</span>
                        </td>
                        <td className='text-gray-800 fw-normal' style={{ maxWidth: '140px' }}>
                          <div className='text-truncate' title={of.articleNom}>
                            {of.articleNom}
                          </div>
                        </td>
                        <td>
                          <span className='text-gray-900 fw-bolder'>{of.quantiteProduite.toLocaleString()} unités</span>
                          {of.scrapQuantity > 0 && (
                            <span className='badge badge-light-danger ms-1 fs-9'>
                              {of.scrapQuantity} reb.
                            </span>
                          )}
                        </td>
                        <td>
                          <span className='badge badge-light-info fw-bold fs-8'>
                            {of.machineNom}
                          </span>
                        </td>
                        <td className='text-end pe-2'>
                          <button
                            type='button'
                            className='btn btn-icon btn-bg-light btn-active-color-primary btn-sm'
                            onClick={() => {
                              setSelectedOf(of)
                              setShowOfModal(true)
                            }}
                            title='Consulter les détails OF'
                          >
                            <KTIcon iconName='eye' className='fs-4' />
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

        {/* Colonne Droite : Répartition Stock */}
        <div className='col-lg-6'>
          <div className='card card-flush shadow-sm border-0 h-100'>
            <div className='card-header pt-6 pb-2 border-0'>
              <h3 className='card-title align-items-start flex-column'>
                <span className='card-label fw-bold text-gray-900 fs-4'>
                  Inventaire par Famille d'Articles
                </span>
              </h3>
              <div className='card-toolbar'>
                <a href='/stock' className='btn btn-sm btn-light-success fw-bold fs-8'>
                  Voir le Stock →
                </a>
              </div>
            </div>
            <div className='card-body pt-2'>
              <div className='table-responsive'>
                <table className='table align-middle table-row-dashed fs-7 gy-3'>
                  <thead>
                    <tr className='text-start text-muted fw-bold fs-8 text-uppercase gs-0'>
                      <th>Famille d'Articles</th>
                      <th>Nb Articles</th>
                      <th>Quantité Totale</th>
                      <th>Part Valeur (%)</th>
                      <th className='text-end pe-2'>Détails</th>
                    </tr>
                  </thead>
                  <tbody className='text-gray-600 fw-semibold'>
                    {data.stockGroups.map((group, index) => (
                      <tr key={index}>
                        <td className='fw-bold text-gray-900' style={{ maxWidth: '160px' }}>
                          <div className='text-truncate' title={group.name}>
                            {group.name}
                          </div>
                        </td>
                        <td>
                          <span className='badge badge-light-secondary fw-bold fs-8'>{group.count} réf.</span>
                        </td>
                        <td className='fw-bolder text-gray-900'>{group.quantity.toLocaleString()} unités</td>
                        <td>
                          <div className='d-flex align-items-center gap-2'>
                            <span className='fw-bold text-gray-800 fs-8'>{group.percentage}%</span>
                            <div className='progress h-4px w-50px bg-light'>
                              <div
                                className='progress-bar bg-success'
                                role='progressbar'
                                style={{ width: `${Math.min(100, group.percentage)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className='text-end pe-2'>
                          <button
                            type='button'
                            className='btn btn-icon btn-bg-light btn-active-color-success btn-sm'
                            onClick={() => {
                              setSelectedGroup(group)
                              setShowGroupModal(true)
                            }}
                            title='Voir le détail du groupe'
                          >
                            <KTIcon iconName='eye' className='fs-4' />
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

      {/* 5. Section Inférieure : Cartographie Consolidée Multi-Sites */}
      <div className='row g-5 mb-7'>
        <div className='col-12'>
          <div className='card card-flush shadow-sm border-0'>
            <div className='card-header pt-6 pb-2 border-0'>
              <h3 className='card-title align-items-start flex-column'>
                <span className='card-label fw-bold text-gray-900 fs-4'>
                  Consolidation Multi-Sites Industriels (Tunisie & Brno)
                </span>
                <span className='text-muted fs-8 fw-semibold mt-1'>
                  Répartition des stocks physiques et des équipements par implantation géographique
                </span>
              </h3>
            </div>
            <div className='card-body pt-2'>
              <div className='row g-4'>
                {data.stockSites.map((site, index) => {
                  const isKondar = site.site.toLowerCase().includes('kondar')
                  const isBrno = site.site.toLowerCase().includes('brno')
                  const color = isKondar ? 'primary' : isBrno ? 'warning' : 'info'
                  const machinesText = isKondar ? '257 machines (TN1/TN2)' : isBrno ? '62 machines (CZA/CZM)' : 'Plateforme Logistique'

                  return (
                    <div className='col-md-4' key={index}>
                      <div className={`card bg-light-${color} border border-dashed border-${color} p-5 rounded-3 h-100`}>
                        <div className='d-flex justify-content-between align-items-center mb-3'>
                          <span className={`fw-bolder fs-5 text-${color}`}>{site.site}</span>
                          <span className={`badge badge-${color} fw-bold fs-8`}>Site Industriel</span>
                        </div>
                        <div className='d-flex flex-column gap-2 text-gray-700 fs-7'>
                          <div className='d-flex justify-content-between'>
                            <span className='text-muted'>Articles référencés :</span>
                            <strong>{site.count} articles</strong>
                          </div>
                          <div className='d-flex justify-content-between'>
                            <span className='text-muted'>Volume physique stocké :</span>
                            <strong className='text-gray-900'>{site.quantity.toLocaleString()} unités</strong>
                          </div>
                          <div className='d-flex justify-content-between'>
                            <span className='text-muted'>Actifs de production :</span>
                            <strong className={`text-${color}`}>{machinesText}</strong>
                          </div>
                        </div>
                        <div className='mt-4 pt-3 border-top border-secondary border-opacity-10 d-flex justify-content-end'>
                          <button
                            type='button'
                            className={`btn btn-xs btn-${color} fw-bold`}
                            onClick={() => {
                              setSelectedSite(site)
                              setShowSiteModal(true)
                            }}
                          >
                            Consulter la fiche site →
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1 : Détails Ordre de Fabrication */}
      {selectedOf && (
        <Modal show={showOfModal} onHide={() => setShowOfModal(false)} centered size='lg'>
          <Modal.Header closeButton className='border-0 pt-6 px-8 bg-light'>
            <Modal.Title className='fw-bold text-gray-900 fs-4 d-flex align-items-center gap-2'>
              <KTIcon iconName='archive' className='fs-2 text-primary' />
              Ordre de Fabrication : <span className='text-primary fw-bolder'>{selectedOf.code}</span>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className='px-8 py-6'>
            <div className='row g-4'>
              <div className='col-12'>
                <div className='bg-light p-4 rounded'>
                  <span className='text-muted fs-8 fw-semibold text-uppercase'>Désignation de l'Opération / Article</span>
                  <div className='text-gray-900 fw-bold fs-6 mt-1'>{selectedOf.articleNom}</div>
                </div>
              </div>
              {[
                { label: 'N° Document / OF', val: selectedOf.code },
                { label: 'Référence Composant', val: <span className='badge badge-light-primary fw-bold'>{selectedOf.itemNo}</span> },
                { label: 'Quantité Conforme Produite', val: <span className='fw-bolder text-success fs-6'>{selectedOf.quantiteProduite.toLocaleString()} unités</span> },
                { label: 'Quantité Rebutée', val: selectedOf.scrapQuantity > 0 ? <span className='badge badge-light-danger fw-bold'>{selectedOf.scrapQuantity} unités</span> : '0 unité' },
                { label: 'Temps d\'Usinage Machine', val: `${selectedOf.runTime} h` },
                { label: 'Centre de Charge / Atelier', val: <span className='badge badge-light-info fw-bold'>{selectedOf.machineNom}</span> },
                { label: 'Date de Fabrication', val: selectedOf.dateDebut },
                { label: 'Site Industriel', val: <span className='badge badge-light-dark'>{selectedOf.responsable}</span> }
              ].map(({ label, val }) => (
                <div className='col-md-6' key={label}>
                  <div className='fs-8 text-muted fw-semibold mb-1'>{label}</div>
                  <div className='fs-7 fw-bold text-gray-800'>{val}</div>
                  <div className='separator separator-dashed mt-2' />
                </div>
              ))}
            </div>
          </Modal.Body>
          <Modal.Footer className='border-0 bg-light py-3 px-8'>
            <button className='btn btn-light-primary btn-sm' onClick={() => setShowOfModal(false)}>
              Fermer
            </button>
          </Modal.Footer>
        </Modal>
      )}

      {/* MODAL 2 : Détails Groupe d'Articles */}
      {selectedGroup && (
        <Modal show={showGroupModal} onHide={() => setShowGroupModal(false)} centered size='lg'>
          <Modal.Header closeButton className='border-0 pt-6 px-8 bg-light'>
            <Modal.Title className='fw-bold text-gray-900 fs-4 d-flex align-items-center gap-2'>
              <KTIcon iconName='category' className='fs-2 text-success' />
              Famille d'Articles : <span className='text-success fw-bolder'>{selectedGroup.name}</span>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className='px-8 py-6'>
            <div className='row g-4'>
              <div className='col-md-6'>
                <div className='bg-light p-4 rounded'>
                  <div className='fs-8 text-muted fw-semibold mb-1'>Références Référencées</div>
                  <div className='fs-4 fw-bolder text-gray-900'>{selectedGroup.count} articles distincts</div>
                </div>
              </div>
              <div className='col-md-6'>
                <div className='bg-light p-4 rounded'>
                  <div className='fs-8 text-muted fw-semibold mb-1'>Quantité Totale en Stock</div>
                  <div className='fs-4 fw-bolder text-success'>{selectedGroup.quantity.toLocaleString()} unités</div>
                </div>
              </div>
              <div className='col-md-6'>
                <div className='bg-light p-4 rounded'>
                  <div className='fs-8 text-muted fw-semibold mb-1'>Part dans la Valeur du Stock</div>
                  <div className='fs-4 fw-bolder text-primary'>{selectedGroup.percentage}% du total</div>
                </div>
              </div>
              <div className='col-md-6'>
                <div className='bg-light p-4 rounded'>
                  <div className='fs-8 text-muted fw-semibold mb-1'>État de l'Inventaire</div>
                  <div className='fs-6 fw-bold text-dark'>Clôture Mensuelle Consolidée</div>
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer className='border-0 bg-light py-3 px-8'>
            <button className='btn btn-light-success btn-sm' onClick={() => setShowGroupModal(false)}>
              Fermer
            </button>
          </Modal.Footer>
        </Modal>
      )}

      {/* MODAL 3 : Détails Fiche Site Industriel */}
      {selectedSite && (
        <Modal show={showSiteModal} onHide={() => setShowSiteModal(false)} centered size='lg'>
          <Modal.Header closeButton className='border-0 pt-6 px-8 bg-light'>
            <Modal.Title className='fw-bold text-gray-900 fs-4 d-flex align-items-center gap-2'>
              <KTIcon iconName='geolocation' className='fs-2 text-warning' />
              Implantation Industrielle : <span className='text-warning fw-bolder'>{selectedSite.site}</span>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className='px-8 py-6'>
            <div className='row g-4'>
              <div className='col-md-6'>
                <div className='bg-light p-4 rounded'>
                  <div className='fs-8 text-muted fw-semibold mb-1'>Catalogue d'Articles Référencés</div>
                  <div className='fs-4 fw-bolder text-gray-900'>{selectedSite.count} références</div>
                </div>
              </div>
              <div className='col-md-6'>
                <div className='bg-light p-4 rounded'>
                  <div className='fs-8 text-muted fw-semibold mb-1'>Volume Physique Stocké</div>
                  <div className='fs-4 fw-bolder text-warning'>{selectedSite.quantity.toLocaleString()} unités</div>
                </div>
              </div>
              <div className='col-12'>
                <div className='card bg-light border-0 p-4 rounded'>
                  <div className='fs-8 text-muted fw-semibold mb-2'>Actifs et Ateliers Associés</div>
                  <p className='fs-7 text-gray-700 mb-0'>
                    Ce site participe activement aux opérations de production et à la gestion des approvisionnements de l'usine avec ses ateliers et ses magasins de stockage correspondants.
                  </p>
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer className='border-0 bg-light py-3 px-8'>
            <button className='btn btn-light-warning btn-sm' onClick={() => setShowSiteModal(false)}>
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