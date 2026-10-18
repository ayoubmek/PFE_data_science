import React, { useMemo } from 'react'
import axios from 'axios'
import Chart from 'react-apexcharts'
import { useQuery } from 'react-query'
import { API_BASE_URL, apiErrorMessage } from '../../config'

// Période prévue : les 30 jours qui suivent la dernière donnée consolidée du DWH
const HORIZON = 30

const fetchForecast = async () => {
  const { data } = await axios.get(`${API_BASE_URL}/ml/predict/production`, {
    params: { horizon: HORIZON },
    timeout: 300000,
  })
  return data
}

const fmt = (n: number | null | undefined, digits = 0) =>
  n === null || n === undefined ? '—' : Number(n).toLocaleString('fr-FR', { maximumFractionDigits: digits })
const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString('fr-FR') : '—')

export default function DataSciencePage() {
  const { data: result, isLoading, error } = useQuery(['productionForecast', 'next30'], fetchForecast, {
    staleTime: 1000 * 60 * 10,
    retry: false,
  })

  const predictions: any[] = useMemo(() => result?.predictions || [], [result])
  const bestMetrics = result?.metrics?.[result?.best_model]

  const totals = useMemo(() => {
    const values = predictions.map((p) => Number(p.best_quantity) || 0)
    const total = values.reduce((a, b) => a + b, 0)
    return { total, avg: values.length ? total / values.length : 0, peak: values.length ? Math.max(...values) : 0 }
  }, [predictions])

  const chart: any = useMemo(() => {
    if (!predictions.length) return null
    return {
      series: [
        { name: `Prévision ${result.best_model_name}`, data: predictions.map((p) => Math.round(p.best_quantity)) },
      ],
      options: {
        chart: { fontFamily: 'Inter, sans-serif', type: 'line', height: 380, toolbar: { show: false }, zoom: { enabled: false } },
        colors: ['#00A3FF'],
        stroke: { curve: 'smooth', width: 3 },
        dataLabels: { enabled: false },
        markers: { size: 4 },
        xaxis: {
          categories: predictions.map((p) => p.date.slice(5).split('-').reverse().join('/')),
          labels: { rotate: 0, style: { colors: '#7E8299', fontSize: '11px' } },
        },
        yaxis: { min: 0, labels: { formatter: (v: number) => `${Math.round(v / 1000)}k`, style: { colors: '#7E8299' } } },
        legend: { show: true, position: 'bottom' },
        tooltip: { shared: true, intersect: false, y: { formatter: (v: number) => `${fmt(v)} pièces` } },
        grid: { borderColor: '#F1F1F4', strokeDashArray: 4 },
      },
    }
  }, [result, predictions])

  const header = (
    <div className='card border-0 shadow-sm bg-white p-6 rounded-3'>
      <div className='d-flex flex-wrap justify-content-between align-items-center gap-3'>
        <div>
          <h2 className='fw-bold text-gray-900 fs-3 mb-1'>Prévisions de Production</h2>
          {result && !isLoading && (
            <>
              <div className='text-muted fs-7'>
                Du <span className='text-gray-900 fw-semibold'>{fmtDate(predictions[0]?.date)}</span> au{' '}
                <span className='text-gray-900 fw-semibold'>{fmtDate(predictions[predictions.length - 1]?.date)}</span> — modèle :{' '}
                <span className='text-primary fw-semibold'>{result.best_model_name}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )

  if (isLoading || error || !result) {
    return (
      <div className='d-flex flex-column gap-6'>
        {header}
        {isLoading ? (
          <div className='card border-0 shadow-sm p-10 text-center text-muted'>
            <div className='spinner-border text-primary mx-auto mb-4' role='status'></div>
            Calcul des prévisions…
          </div>
        ) : (
          <div className='alert alert-danger p-5'>{apiErrorMessage(error, 'Prévisions indisponibles.')}</div>
        )}
      </div>
    )
  }

  return (
    <div className='d-flex flex-column gap-6'>
      {header}

      <div className='row g-4'>
        {[
          { title: 'Volume total prévu', value: `${fmt(totals.total)} pcs`, color: 'text-gray-900' },
          { title: 'Moyenne journalière', value: `${fmt(totals.avg)} pcs/j`, color: 'text-primary' },
          { title: 'Pic journalier', value: `${fmt(totals.peak)} pcs`, color: 'text-gray-900' },
          { title: `Erreur du modèle (WAPE, ${result.backtest.n_origins} mois de tests)`, value: `${fmt(bestMetrics?.wape, 1)} %`, color: 'text-success' },
        ].map((k) => (
          <div className='col-xl-3 col-md-6' key={k.title}>
            <div className='card border-0 shadow-sm bg-white p-5 rounded-3 h-100'>
              <div className='text-muted fs-7 fw-semibold mb-2'>{k.title}</div>
              <div className={`fs-2 fw-bold ${k.color}`}>{k.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className='card border-0 shadow-sm bg-white p-6 rounded-3'>
        <h3 className='fs-4 fw-bold text-gray-900 mb-1'>Prévision du mois</h3>
        <span className='text-muted fs-7 mb-4'>Modèle {result.best_model_name}</span>
        {chart && <Chart options={chart.options} series={chart.series} type='line' height={380} />}
      </div>
    </div>
  )
}
