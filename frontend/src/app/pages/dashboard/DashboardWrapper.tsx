import { FC, useState } from 'react'
import { useQuery } from 'react-query'
import { Modal } from 'react-bootstrap'
import { KTIcon } from '../../../_metronic/helpers'
import Chart from 'react-apexcharts'
import { ApexOptions } from 'apexcharts'
import { apiErrorMessage } from '../../config'
import { PageSkeleton } from '../../components/PageSkeleton'
import {
  DailyStat,
  DashboardSummary,
  Declaration,
  Period,
  fetchDashboardSummary,
  fetchDeclarations,
  fetchProductionStats,
} from '../../services/api'
import { fmt, fmtDate } from '../../utils/format'

const PERIODS: { key: Period; label: string }[] = [
  { key: 'mois', label: 'Mois' },
  { key: 'annee', label: '12 derniers mois' },
  { key: 'tout', label: 'Tout' },
]

interface DashboardData extends DashboardSummary {
  daily: DailyStat[]
  recent: Declaration[]
}

const TRS_COMPLETENESS_RATIO = 0.5
const isPending = (d: DailyStat) =>
  (d.totalOutput > 0 && d.totalTrs < TRS_COMPLETENESS_RATIO * d.totalOutput) || (d.totalTrs === 0 && d.totalScrap > 0)

const splitConsolidated = (daily: DailyStat[]) => {
  let end = daily.length
  while (end > 0 && isPending(daily[end - 1])) end--
  return { shown: daily.slice(0, end), pending: daily.slice(end) }
}

const shiftMonth = (month: string, delta: number) => {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
const monthLabel = (month: string) =>
  new Date(`${month}-01T00:00:00`).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

const isMonthly = (period: Period) => period === 'annee' || period === 'tout'
const fmtMonth = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
const fmtAxis = (v: number) => (v >= 1e6 ? `${fmt(v / 1e6, 1)} M` : `${Math.round(v / 1000)}k`)

const fetchDashboard = async (period: Period): Promise<DashboardData> => {
  const [summary, daily, orders] = await Promise.all([
    fetchDashboardSummary(period),
    fetchProductionStats(period),
    fetchDeclarations(),
  ])
  return { ...summary, daily, recent: orders.slice(0, 6) }
}

const periodName = (period: Period, start: string, end: string) => {
  switch (period) {
    case 'annee':
      return '12 derniers mois'
    case 'tout':
      return `historique depuis ${new Date(start).getFullYear()}`
    default:
      return new Date(end).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  }
}

const StatisticsWidget: FC<{
  className?: string
  color: string
  icon: string
  title: string
  value: string | number
}> = ({ className, color, icon, title, value }) => {
  return (
    <div className={`card card-flush shadow-sm border-0 ${className}`}>
      <div className='card-header pt-5 pb-2'>
        <div className='card-title d-flex flex-column'>
          <div className='d-flex align-items-center gap-2 mb-1'>
            <span className='fs-2hx fw-bold text-gray-900 lh-1 ls-n2'>{value}</span>
          </div>
          <span className='text-gray-700 fw-bold fs-6'>{title}</span>
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

const DashboardPage: FC = () => {
  const [period, setPeriod] = useState<Period>('mois')
  const query = useQuery(['dashboard', period], () => fetchDashboard(period), { keepPreviousData: true })
  const data = query.data
  const loading = query.isFetching
  const error = query.error ? apiErrorMessage(query.error, 'Impossible de charger les données du Data Warehouse.') : ''

  const [chartMonth, setChartMonth] = useState<string | null>(null)
  const monthQuery = useQuery(['productionStats', chartMonth], () => fetchProductionStats('mois', chartMonth ?? undefined), {
    enabled: chartMonth !== null,
    keepPreviousData: true,
  })

  const [selectedOf, setSelectedOf] = useState<Declaration | null>(null)

  if (!data) {
    return error ? (
      <div className='alert alert-danger d-flex align-items-center p-5'>
        <KTIcon iconName='information-5' className='fs-2hx text-danger me-4' />
        <div className='d-flex flex-column'>
          <h4 className='mb-1 text-danger'>Données indisponibles</h4>
          <span>{error}</span>
        </div>
      </div>
    ) : (
      <PageSkeleton type='table' />
    )
  }

  const { production, stock } = data
  const monthly = isMonthly(production.period)
  const name = periodName(production.period, production.periodStart, production.periodEnd)
  const latestMonth = production.periodEnd.slice(0, 7)
  const firstMonth = production.dataStart?.slice(0, 7) ?? latestMonth
  const shownMonth = chartMonth ?? latestMonth
  const goToMonth = (month: string) => setChartMonth(month >= latestMonth ? null : month)
  const chartLoading = chartMonth !== null && !monthQuery.data
  const chartDaily = chartMonth === null ? data.daily : monthQuery.data ?? []
  const { shown: daily, pending } =
    monthly || chartMonth !== null ? { shown: chartDaily, pending: [] } : splitConsolidated(chartDaily)
  const pendingNote =
    pending.length === 0
      ? null
      : pending.length === 1
        ? `Dernier jour en cours de consolidation (${fmtDate(pending[0].date)}) non affiché`
        : `Derniers jours en cours de consolidation (${fmtDate(pending[0].date)} – ${fmtDate(pending[pending.length - 1].date)}) non affichés`

  const chartOptions: { series: ApexAxisChartSeries; options: ApexOptions } = {
    series: [
      { name: 'Production (quantité TRS)', type: 'area', data: daily.map((d) => Math.round(d.totalTrs)) },
      { name: 'Unités rebutées', type: 'line', data: daily.map((d) => Math.round(d.totalScrap)) },
    ],
    options: {
      chart: { fontFamily: 'Inter, sans-serif', type: 'line', height: 310, toolbar: { show: false }, zoom: { enabled: false } },
      stroke: { curve: 'smooth', width: [3, 4] },
      markers: {
        size: daily.length > 40 ? [0, 0] : [4, 5],
        colors: ['#FFFFFF', '#FFFFFF'],
        strokeColors: ['#3E97FF', '#F1416C'],
        strokeWidth: 2,
        hover: { size: 7 },
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories: daily.map((d) => (monthly ? fmtMonth(d.date) : fmtDate(d.date))),
        axisBorder: { show: false },
        axisTicks: { show: false },
        tooltip: { enabled: false },
        labels: { style: { colors: '#7E8299', fontSize: '11px', fontWeight: '600' } },
      },
      yaxis: [
        {
          seriesName: 'Production (quantité TRS)',
          min: 0,
          title: { text: 'Production (unités)', style: { color: '#3E97FF', fontSize: '11px', fontWeight: 600 } },
          labels: { style: { colors: '#7E8299', fontSize: '11px' }, formatter: fmtAxis },
        },
        {
          seriesName: 'Unités rebutées',
          opposite: true,
          min: 0,
          title: { text: 'Rebuts (unités)', style: { color: '#F1416C', fontSize: '11px', fontWeight: 600 } },
          labels: { style: { colors: '#F1416C', fontSize: '11px' }, formatter: (v: number) => `${Math.round(v)}` },
        },
      ],
      colors: ['#3E97FF', '#F1416C'],
      fill: {
        type: ['gradient', 'solid'],
        gradient: { shade: 'light', type: 'vertical', shadeIntensity: 0.5, opacityFrom: 0.35, opacityTo: 0.05, stops: [0, 100] },
      },
      grid: { borderColor: '#F1F1F4', strokeDashArray: 4, yaxis: { lines: { show: true } } },
      legend: { show: true, position: 'top', horizontalAlign: 'right', fontSize: '12px', fontWeight: 600 },
      tooltip: { theme: 'light', style: { fontSize: '12px' }, y: { formatter: (v: number) => `${fmt(v)} unités` } },
    },
  }

  const periodLabel = `du ${fmtDate(production.periodStart)} au ${fmtDate(production.periodEnd)}`

  return (
    <>
      <div className='d-flex flex-wrap justify-content-between align-items-center mb-6 gap-3'>
        <div>
          <h1 className='d-flex align-items-center text-gray-900 fw-bolder fs-2 my-1'>
            Tableau de Bord Décisionnel Industriel
          </h1>
          <span className='text-muted fs-7'>
            Production {periodLabel} · stock au {fmtDate(stock.dateStock)}
          </span>
        </div>
        <div className='d-flex align-items-center gap-3'>
          {error && <span className='badge badge-light-warning fs-8'>Actualisation impossible : {error}</span>}
          {loading && <span className='spinner-border spinner-border-sm text-primary' />}
          <div className='btn-group' role='group'>
            {PERIODS.map((p) => (
              <button
                key={p.key}
                type='button'
                className={`btn btn-sm ${period === p.key ? 'btn-primary' : 'btn-light'}`}
                onClick={() => {
                  setPeriod(p.key)
                  setChartMonth(null)
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className='row g-5 g-xl-10 mb-7'>
        <div className='col-md-6 col-xl-3'>
          <StatisticsWidget
            color='primary'
            icon='delivery'
            title={`Volume produit (${name})`}
            value={`${fmt(production.totalVolumeProduit)} unités`}
            className='h-100'
          />
        </div>

        <div className='col-md-6 col-xl-3'>
          <StatisticsWidget
            color='success'
            icon='gear'
            title='Parc machines'
            value={`${fmt(production.machinesTotal)} machines`}
            className='h-100'
          />
        </div>

        <div className='col-md-6 col-xl-3'>
          <StatisticsWidget
            color='info'
            icon='parcel'
            title='Valeur du stock'
            value={`${fmt(stock.valeurTotaleStock / 1e6, 2)} M TND`}
            className='h-100'
          />
        </div>

        <div className='col-md-6 col-xl-3'>
          <StatisticsWidget
            color='danger'
            icon='cross-circle'
            title='Rebuts sur la période'
            value={`${fmt(production.totalRebut)} unités`}
            className='h-100'
          />
        </div>
      </div>

      <div className='row g-5 mb-7'>
        <div className='col-12'>
          <div className='card card-flush shadow-sm border-0 h-100'>
            <div className='card-header pt-6 pb-2 border-0'>
              <h3 className='card-title align-items-start flex-column'>
                <span className='card-label fw-bold text-gray-900 fs-4'>
                  Flux de production et rebuts ({monthly ? name : monthLabel(shownMonth)}, par {monthly ? 'mois' : 'jour'})
                </span>
                {pendingNote && <span className='text-muted fs-8 fw-semibold mt-1'>{pendingNote}</span>}
              </h3>
              {!monthly && (
                <div className='card-toolbar d-flex align-items-center gap-2'>
                  {monthQuery.isFetching && <span className='spinner-border spinner-border-sm text-primary' />}
                  <button
                    type='button'
                    className='btn btn-sm btn-light fw-bold fs-5 px-4 py-1'
                    disabled={shownMonth <= firstMonth}
                    onClick={() => goToMonth(shiftMonth(shownMonth, -1))}
                    title='Mois précédent'
                  >
                    ‹
                  </button>
                  <span className='fw-bold text-gray-700 fs-7 text-center text-capitalize' style={{ minWidth: 110 }}>
                    {monthLabel(shownMonth)}
                  </span>
                  <button
                    type='button'
                    className='btn btn-sm btn-light fw-bold fs-5 px-4 py-1'
                    disabled={shownMonth >= latestMonth}
                    onClick={() => goToMonth(shiftMonth(shownMonth, 1))}
                    title='Mois suivant'
                  >
                    ›
                  </button>
                </div>
              )}
            </div>
            <div className='card-body pt-0 pb-4'>
              {monthQuery.isError && chartMonth !== null ? (
                <div className='text-danger text-center py-10'>
                  {apiErrorMessage(monthQuery.error, 'Impossible de charger ce mois.')}
                </div>
              ) : chartLoading ? (
                <div className='text-muted text-center py-10'>Chargement du mois…</div>
              ) : daily.length === 0 ? (
                <div className='text-muted text-center py-10'>Aucune déclaration sur la période.</div>
              ) : (
                <Chart options={chartOptions.options} series={chartOptions.series} type='line' height={300} />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className='row g-5 mb-7'>
        <div className='col-lg-6'>
          <div className='card card-flush shadow-sm border-0 h-100'>
            <div className='card-header pt-6 pb-2 border-0'>
              <h3 className='card-title align-items-start flex-column'>
                <span className='card-label fw-bold text-gray-900 fs-4'>Dernières déclarations d'atelier</span>
              </h3>
              <div className='card-toolbar'>
                <a href='/production' className='btn btn-sm btn-light-primary fw-bold fs-8'>
                  Voir toutes les déclarations →
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
                      <th>Qté Produite</th>
                      <th>Machine</th>
                      <th className='text-end pe-2'>Détails</th>
                    </tr>
                  </thead>
                  <tbody className='text-gray-600 fw-semibold'>
                    {data.recent.map((of) => (
                      <tr key={of.id}>
                        <td className='fw-bold text-gray-900'>{of.reference}</td>
                        <td>
                          <span className='badge badge-light-primary fw-bold fs-8'>{of.itemNo || '—'}</span>
                        </td>
                        <td>
                          <span className='text-gray-900 fw-bolder'>{fmt(of.quantiteRealisee)} unités</span>
                          {of.scrapQuantity > 0 && (
                            <span className='badge badge-light-danger ms-1 fs-9'>{fmt(of.scrapQuantity)} reb.</span>
                          )}
                        </td>
                        <td>
                          <span className='badge badge-light-info fw-bold fs-8'>{of.machineNom || of.machineCode || '—'}</span>
                        </td>
                        <td className='text-end pe-2'>
                          <button
                            type='button'
                            className='btn btn-icon btn-bg-light btn-active-color-primary btn-sm'
                            onClick={() => setSelectedOf(of)}
                            title='Consulter la déclaration'
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

        <div className='col-lg-6'>
          <div className='card card-flush shadow-sm border-0 h-100'>
            <div className='card-header pt-6 pb-2 border-0'>
              <h3 className='card-title align-items-start flex-column'>
                <span className='card-label fw-bold text-gray-900 fs-4'>Inventaire par famille d'articles</span>
                <span className='text-muted fs-8 fw-semibold mt-1'>Instantané du {fmtDate(stock.dateStock)}</span>
              </h3>
              <div className='card-toolbar'>
                <a href='/stock' className='btn btn-sm btn-light-success fw-bold fs-8'>
                  Voir le stock →
                </a>
              </div>
            </div>
            <div className='card-body pt-2'>
              <div className='table-responsive'>
                <table className='table align-middle table-row-dashed fs-7 gy-3'>
                  <thead>
                    <tr className='text-start text-muted fw-bold fs-8 text-uppercase gs-0'>
                      <th>GroupeItem</th>
                      <th>Articles (No_)</th>
                      <th className='text-end'>Quantité</th>
                      <th className='text-end'>Cout</th>
                      <th className='ps-6'>Part du Cout</th>
                    </tr>
                  </thead>
                  <tbody className='text-gray-600 fw-semibold'>
                    {data.stockGroups.map((group) => (
                      <tr key={group.name}>
                        <td className='fw-bold text-gray-900'>{group.name}</td>
                        <td>
                          <span className='badge badge-light-primary text-primary fw-bolder fs-7 px-2 py-1'>{group.count} réf.</span>
                        </td>
                        <td className='text-end text-gray-800'>{fmt(group.quantity)}</td>
                        <td className='text-end fw-bolder text-gray-900'>{fmt(group.value)} TND</td>
                        <td className='ps-6'>
                          <div className='d-flex align-items-center gap-2'>
                            <span className='fw-bold text-gray-800 fs-8'>{group.percentage}%</span>
                            <div className='progress h-4px w-50px bg-light'>
                              <div className='progress-bar bg-success' role='progressbar' style={{ width: `${Math.min(100, group.percentage)}%` }} />
                            </div>
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

      {selectedOf && (
        <Modal show onHide={() => setSelectedOf(null)} centered size='lg'>
          <Modal.Header closeButton className='border-0 pt-6 px-8 bg-light'>
            <Modal.Title className='fw-bold text-gray-900 fs-4 d-flex align-items-center gap-2'>
              <KTIcon iconName='archive' className='fs-2 text-primary' />
              Ordre de fabrication : <span className='text-primary fw-bolder'>{selectedOf.reference}</span>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className='px-8 py-6'>
            <div className='row g-4'>
              {[
                { label: 'N° Document / OF', val: selectedOf.reference },
                { label: 'Article (Item No_)', val: selectedOf.itemNo || '—' },
                { label: 'Description', val: selectedOf.article || '—' },
                { label: 'Quantité produite', val: `${fmt(selectedOf.quantiteRealisee)} unités` },
                { label: 'Quantité rebutée', val: `${fmt(selectedOf.scrapQuantity)} unités` },
                { label: 'Temps de marche', val: `${fmt(selectedOf.runTime, 2)} h` },
                { label: 'Centre de charge', val: selectedOf.workCenter || '—' },
                { label: 'Machine', val: [selectedOf.machineCode, selectedOf.machineNom].filter(Boolean).join(' — ') || '—' },
                { label: 'Date de déclaration', val: fmtDate(selectedOf.dateDebut) },
                { label: 'Site', val: selectedOf.site || '—' },
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
            <button className='btn btn-light-primary btn-sm' onClick={() => setSelectedOf(null)}>Fermer</button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  )
}

const DashboardWrapper: FC = () => <DashboardPage />

export { DashboardWrapper }
