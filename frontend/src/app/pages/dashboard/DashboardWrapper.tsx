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
  StockGroup,
  StockSite,
  fetchDashboardSummary,
  fetchDeclarations,
  fetchProductionStats,
} from '../../services/api'
import { fmt, fmtDate } from '../../utils/format'

const PERIODS: { key: Period; label: string }[] = [
  { key: 'mois', label: 'Mois' },
  { key: 'annee', label: 'Année' },
  { key: 'tout', label: 'Tout' },
]

interface DashboardData extends DashboardSummary {
  daily: DailyStat[]
  recent: Declaration[]
}

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
      return `année ${new Date(end).getFullYear()}`
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

const DashboardPage: FC = () => {
  const [period, setPeriod] = useState<Period>('mois')
  const query = useQuery(['dashboard', period], () => fetchDashboard(period), { keepPreviousData: true })
  const data = query.data
  const loading = query.isFetching
  const error = query.error ? apiErrorMessage(query.error, 'Impossible de charger les données du Data Warehouse.') : ''

  const [selectedOf, setSelectedOf] = useState<Declaration | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<StockGroup | null>(null)
  const [selectedSite, setSelectedSite] = useState<StockSite | null>(null)

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

  const chartOptions: { series: ApexAxisChartSeries; options: ApexOptions } = {
    series: [
      { name: 'Production déclarée (Output)', type: 'area', data: data.daily.map((d) => Math.round(d.totalOutput)) },
      { name: 'Unités rebutées', type: 'line', data: data.daily.map((d) => Math.round(d.totalScrap)) },
    ],
    options: {
      chart: { fontFamily: 'Inter, sans-serif', type: 'line', height: 310, toolbar: { show: false }, zoom: { enabled: false } },
      stroke: { curve: 'smooth', width: [3, 4] },
      markers: {
        size: data.daily.length > 40 ? [0, 0] : [4, 5],
        colors: ['#FFFFFF', '#FFFFFF'],
        strokeColors: ['#3E97FF', '#F1416C'],
        strokeWidth: 2,
        hover: { size: 7 },
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories: data.daily.map((d) => (monthly ? fmtMonth(d.date) : fmtDate(d.date))),
        axisBorder: { show: false },
        axisTicks: { show: false },
        tooltip: { enabled: false },
        labels: { style: { colors: '#7E8299', fontSize: '11px', fontWeight: '600' } },
      },
      yaxis: [
        {
          seriesName: 'Production déclarée (Output)',
          min: 0,
          labels: { style: { colors: '#7E8299', fontSize: '11px' }, formatter: fmtAxis },
        },
        {
          seriesName: 'Unités rebutées',
          opposite: true,
          min: 0,
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
  const ruptures = stock.statuts?.RUPTURE ?? 0
  const critiques = stock.statuts?.CRITIQUE ?? 0

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
                onClick={() => setPeriod(p.key)}
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
            subtitle={`${fmt(production.totalOrdres)} ordres de fabrication déclarés`}
            className='h-100'
          />
        </div>

        <div className='col-md-6 col-xl-3'>
          <StatisticsWidget
            color='success'
            icon='gear'
            title='Parc machines'
            value={`${fmt(production.machinesTotal)} machines`}
            subtitle={`${fmt(production.machinesActives)} actives sur la période · ${fmt(production.machinesBloquees)} bloquées`}
            className='h-100'
          />
        </div>

        <div className='col-md-6 col-xl-3'>
          <StatisticsWidget
            color='info'
            icon='parcel'
            title='Valeur du stock'
            value={`${fmt(stock.valeurTotaleStock / 1e6, 2)} M TND`}
            subtitle={`${fmt(stock.quantiteTotale)} unités · ${fmt(stock.totalArticles)} articles`}
            className='h-100'
          />
        </div>

        <div className='col-md-6 col-xl-3'>
          <StatisticsWidget
            color='danger'
            icon='cross-circle'
            title='Rebuts sur la période'
            value={`${fmt(production.totalRebut)} unités`}
            subtitle={
              production.tauxConformite !== null
                ? `Taux de conformité : ${fmt(production.tauxConformite, 2)} %`
                : 'Aucune déclaration sur la période'
            }
            badgeText={`${ruptures} ruptures · ${critiques} critiques`}
            badgeColor='danger'
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
                  Flux de production et rebuts ({name}, par {monthly ? 'mois' : 'jour'})
                </span>
              </h3>
            </div>
            <div className='card-body pt-0 pb-4'>
              {data.daily.length === 0 ? (
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
                      <th>Famille d'articles</th>
                      <th>Articles</th>
                      <th>Valeur</th>
                      <th>Part valeur</th>
                      <th className='text-end pe-2'>Détails</th>
                    </tr>
                  </thead>
                  <tbody className='text-gray-600 fw-semibold'>
                    {data.stockGroups.map((group) => (
                      <tr key={group.name}>
                        <td className='fw-bold text-gray-900'>{group.name}</td>
                        <td>
                          <span className='badge badge-light-primary text-primary fw-bolder fs-7 px-2 py-1'>{group.count} réf.</span>
                        </td>
                        <td className='fw-bolder text-gray-900'>{fmt(group.value)} TND</td>
                        <td>
                          <div className='d-flex align-items-center gap-2'>
                            <span className='fw-bold text-gray-800 fs-8'>{group.percentage}%</span>
                            <div className='progress h-4px w-50px bg-light'>
                              <div className='progress-bar bg-success' role='progressbar' style={{ width: `${Math.min(100, group.percentage)}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className='text-end pe-2'>
                          <button
                            type='button'
                            className='btn btn-icon btn-bg-light btn-active-color-success btn-sm'
                            onClick={() => setSelectedGroup(group)}
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

      <div className='row g-5 mb-7'>
        <div className='col-12'>
          <div className='card card-flush shadow-sm border-0'>
            <div className='card-header pt-6 pb-2 border-0'>
              <h3 className='card-title align-items-start flex-column'>
                <span className='card-label fw-bold text-gray-900 fs-4'>Consolidation multi-sites</span>
              </h3>
            </div>
            <div className='card-body pt-2'>
              <div className='row g-4'>
                {data.stockSites.map((site) => {
                  const key = site.site.toLowerCase()
                  const color = key.includes('kondar') ? 'primary' : key.includes('brno') ? 'warning' : 'info'
                  return (
                    <div className='col-md-4' key={site.site}>
                      <div className={`card bg-light-${color} border border-dashed border-${color} p-5 rounded-3 h-100`}>
                        <div className='d-flex justify-content-between align-items-center mb-3'>
                          <span className={`fw-bolder fs-5 text-${color}`}>{site.site}</span>
                        </div>
                        <div className='d-flex flex-column gap-2 text-gray-700 fs-7'>
                          <div className='d-flex justify-content-between'>
                            <span className='text-muted'>Articles en stock :</span>
                            <strong>{fmt(site.count)}</strong>
                          </div>
                          <div className='d-flex justify-content-between'>
                            <span className='text-muted'>Volume physique :</span>
                            <strong className='text-gray-900'>{fmt(site.quantity)} unités</strong>
                          </div>
                          <div className='d-flex justify-content-between'>
                            <span className='text-muted'>Valeur :</span>
                            <strong className='text-gray-900'>{fmt(site.value)} TND</strong>
                          </div>
                          <div className='d-flex justify-content-between'>
                            <span className='text-muted'>Machines rattachées :</span>
                            <strong className={`text-${color}`}>{fmt(site.machines)}</strong>
                          </div>
                        </div>
                        <div className='mt-4 pt-3 border-top border-secondary border-opacity-10 d-flex justify-content-end'>
                          <button type='button' className={`btn btn-xs btn-${color} fw-bold`} onClick={() => setSelectedSite(site)}>
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

      {selectedGroup && (
        <Modal show onHide={() => setSelectedGroup(null)} centered size='lg'>
          <Modal.Header closeButton className='border-0 pt-6 px-8 bg-light'>
            <Modal.Title className='fw-bold text-gray-900 fs-4 d-flex align-items-center gap-2'>
              <KTIcon iconName='category' className='fs-2 text-success' />
              Famille d'articles : <span className='text-success fw-bolder'>{selectedGroup.name}</span>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className='px-8 py-6'>
            <div className='row g-4'>
              {[
                { label: 'Articles distincts', val: `${fmt(selectedGroup.count)}` },
                { label: 'Quantité en stock', val: `${fmt(selectedGroup.quantity)} unités` },
                { label: 'Valeur du stock', val: `${fmt(selectedGroup.value)} TND` },
                { label: 'Part de la valeur totale', val: `${selectedGroup.percentage} %` },
              ].map(({ label, val }) => (
                <div className='col-md-6' key={label}>
                  <div className='bg-light p-4 rounded'>
                    <div className='fs-8 text-muted fw-semibold mb-1'>{label}</div>
                    <div className='fs-4 fw-bolder text-gray-900'>{val}</div>
                  </div>
                </div>
              ))}
            </div>
          </Modal.Body>
          <Modal.Footer className='border-0 bg-light py-3 px-8'>
            <button className='btn btn-light-success btn-sm' onClick={() => setSelectedGroup(null)}>Fermer</button>
          </Modal.Footer>
        </Modal>
      )}

      {selectedSite && (
        <Modal show onHide={() => setSelectedSite(null)} centered size='lg'>
          <Modal.Header closeButton className='border-0 pt-6 px-8 bg-light'>
            <Modal.Title className='fw-bold text-gray-900 fs-4 d-flex align-items-center gap-2'>
              <KTIcon iconName='geolocation' className='fs-2 text-warning' />
              Site : <span className='text-warning fw-bolder'>{selectedSite.site}</span>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className='px-8 py-6'>
            <div className='row g-4'>
              {[
                { label: 'Articles en stock', val: fmt(selectedSite.count) },
                { label: 'Volume physique', val: `${fmt(selectedSite.quantity)} unités` },
                { label: 'Valeur du stock', val: `${fmt(selectedSite.value)} TND` },
                { label: 'Machines rattachées', val: fmt(selectedSite.machines) },
              ].map(({ label, val }) => (
                <div className='col-md-6' key={label}>
                  <div className='bg-light p-4 rounded'>
                    <div className='fs-8 text-muted fw-semibold mb-1'>{label}</div>
                    <div className='fs-4 fw-bolder text-gray-900'>{val}</div>
                  </div>
                </div>
              ))}
            </div>
          </Modal.Body>
          <Modal.Footer className='border-0 bg-light py-3 px-8'>
            <button className='btn btn-light-warning btn-sm' onClick={() => setSelectedSite(null)}>Fermer</button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  )
}

const DashboardWrapper: FC = () => <DashboardPage />

export { DashboardWrapper }
