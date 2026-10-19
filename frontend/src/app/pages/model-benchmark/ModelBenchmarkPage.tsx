import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import axios from 'axios'
import Chart from 'react-apexcharts'
import * as XLSX from 'xlsx'
import { API_BASE_URL, apiErrorMessage } from '../../config'

interface DataPoint {
  date: string
  value: number
}

const HORIZON = 30
const FORECAST_START = '2027-01-01'

const fmt = (n: number | null | undefined, digits = 0) =>
  n === null || n === undefined ? '—' : Number(n).toLocaleString('fr-FR', { maximumFractionDigits: digits })

const fmtParam = (v: unknown) => (v === null ? 'aucune' : Array.isArray(v) ? `(${v.join(',')})` : String(v))

export default function ModelBenchmarkPage() {
  const [mode, setMode] = useState<'dwh' | 'file'>('dwh')
  const [importedData, setImportedData] = useState<DataPoint[]>([])
  const [fileName, setFileName] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [result, setResult] = useState<any>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const runDwhBenchmark = useCallback(async () => {
    setIsProcessing(true)
    setErrorMessage('')
    try {
      const { data } = await axios.get(`${API_BASE_URL}/ml/predict/production`, {
        params: { horizon: HORIZON, start: FORECAST_START },
        timeout: 300000,
      })
      setResult(data)
    } catch (err) {
      setResult(null)
      setErrorMessage(apiErrorMessage(err, 'Benchmark sur dbDWH impossible.'))
    } finally {
      setIsProcessing(false)
    }
  }, [])

  useEffect(() => {
    if (mode === 'dwh') runDwhBenchmark()
    else setResult(null)
  }, [mode, runDwhBenchmark])

  const parseDataFromRows = (rows: any[], dateCol: string, valCol: string): DataPoint[] => {
    const dateMap = new Map<string, number>()

    rows.forEach((r) => {
      let dStr = r[dateCol]
      const raw = r[valCol]
      const vNum = typeof raw === 'number' ? raw : parseFloat(String(raw).replace(/\s/g, '').replace(',', '.'))

      if (typeof dStr === 'number') {
        const d = XLSX.SSF.parse_date_code(dStr)
        dStr = d ? `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}` : ''
      } else if (typeof dStr === 'string' && dStr.trim()) {
        const s = dStr.trim()
        if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
          dStr = s.slice(0, 10)
        } else {
          const parts = s.split(/[/.-]/)
          dStr = parts.length === 3 ? `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}` : ''
        }
      }

      if (dStr && !isNaN(vNum)) {
        dateMap.set(dStr, (dateMap.get(dStr) || 0) + Math.max(0, vNum))
      }
    })

    const points: DataPoint[] = []
    dateMap.forEach((val, dt) => points.push({ date: dt, value: val }))
    return points.sort((a, b) => a.date.localeCompare(b.date))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setErrorMessage('')
    setResult(null)
    setFileName(file.name)
    const reader = new FileReader()

    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target?.result, { type: 'binary', cellDates: false })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' })

        if (rows.length === 0) {
          setErrorMessage('Le fichier sélectionné est vide.')
          return
        }

        const cols = Object.keys(rows[0])

        const detectedDate = cols.find((c) => /date|jour|posting|time|periode|day/i.test(c)) || cols[0]
        const detectedVal =
          cols.find((c) => /trs|rendement/i.test(c)) ||
          cols.find((c) => /output.*quant|quant.*bonne|quantite_bonne/i.test(c)) ||
          cols.find((c) => /output|val|qte|quantite|cadence|prod|pieces|volume|count/i.test(c)) ||
          cols[1] ||
          cols[0]

        setImportedData(parseDataFromRows(rows, detectedDate, detectedVal))
      } catch (err: any) {
        setErrorMessage('Erreur lors de la lecture du fichier : ' + (err.message || 'Format non reconnu.'))
      }
    }

    reader.readAsBinaryString(file)
  }

  const runFileBenchmark = async () => {
    setIsProcessing(true)
    setErrorMessage('')
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/ml/predict/custom`,
        { data: importedData, horizon: HORIZON, start: FORECAST_START },
        { timeout: 300000 }
      )
      setResult(data)
    } catch (err) {
      setResult(null)
      setErrorMessage(apiErrorMessage(err, "L'évaluation des modèles a échoué."))
    } finally {
      setIsProcessing(false)
    }
  }

  const bestKey: string | undefined = result?.best_model
  const best: any = bestKey ? { key: bestKey, ...result.metrics?.[bestKey] } : null

  const dailyRows = useMemo(
    () =>
      (result?.predictions || []).map((p: any) => {
        const real = p.real_last_year === null || p.real_last_year === undefined ? null : Number(p.real_last_year)
        const pred = Number(p.best_quantity) || 0
        return {
          date: p.date,
          realDate: p.real_last_year_date ?? null,
          real,
          pred,
          delta: real === null ? null : pred - real,
        }
      }),
    [result]
  )
  const totalReal = dailyRows.reduce((s: number, r: any) => s + (r.real ?? 0), 0)
  const totalPred = dailyRows.reduce((s: number, r: any) => s + r.pred, 0)
  const hasReal = dailyRows.some((r: any) => r.real !== null)

  const chartConfig: any = useMemo(() => {
    const preds: any[] = result?.predictions || []
    if (!preds.length || !bestKey) return null
    return {
      series: [
        { name: `Prévision ${result.best_model_name}`, data: preds.map((p) => Math.round(p.best_quantity)) },
      ],
      options: {
        chart: { fontFamily: 'Inter, sans-serif', type: 'line', height: 380, toolbar: { show: false }, zoom: { enabled: false } },
        colors: ['#00A3FF'],
        stroke: { curve: 'smooth', width: 3 },
        dataLabels: { enabled: false },
        markers: { size: 4 },
        xaxis: {
          categories: preds.map((p) => p.date.slice(5).split('-').reverse().join('/')),
          labels: { rotate: 0, style: { colors: '#7E8299', fontSize: '11px' } },
        },
        yaxis: { min: 0, labels: { formatter: (v: number) => `${Math.round(v / 1000)}k`, style: { colors: '#7E8299' } } },
        legend: { show: true, position: 'bottom' },
        tooltip: { shared: true, intersect: false, y: { formatter: (v: number) => `${fmt(v)} pièces` } },
        grid: { borderColor: '#F1F1F4', strokeDashArray: 4 },
      },
    }
  }, [result, bestKey])

  const exportPredictions = () => {
    if (!result?.predictions || !best) return
    const rows = result.predictions.map((p: any) => ({ date: p.date, [`prevision_${best.key}`]: p.best_quantity }))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Previsions')
    const { key, ...metrics } = best
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([metrics]), 'Metriques')
    XLSX.writeFile(wb, `previsions_${key}_${HORIZON}_jours.xlsx`)
  }

  return (
    <div className='d-flex flex-column gap-6'>
      <div className='card border-0 shadow-sm bg-white p-5 rounded-3'>
        <div className='d-flex flex-wrap align-items-center justify-content-between gap-3'>
          <h2 className='fw-bold text-gray-900 fs-4 mb-0'>Benchmark des Modèles</h2>
          <div className='d-flex align-items-center gap-3'>
          <div className='btn-group'>
            <button type='button' className={`btn btn-sm ${mode === 'dwh' ? 'btn-primary' : 'btn-light'}`} onClick={() => setMode('dwh')}>
              Données dbDWH (FACT_CLE)
            </button>
            <button type='button' className={`btn btn-sm ${mode === 'file' ? 'btn-primary' : 'btn-light'}`} onClick={() => setMode('file')}>
              Fichier importé
            </button>
          </div>
          </div>
        </div>

        {mode === 'file' && (
          <>
            <div className='d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mt-4 pt-4 border-top'>
              <div className='d-flex align-items-center gap-3'>
                <input type='file' ref={fileInputRef} onChange={handleFileUpload} accept='.csv,.xlsx,.xls' className='d-none' />
                <button
                  type='button'
                  className='btn btn-sm btn-outline btn-outline-dashed btn-outline-primary'
                  onClick={() => fileInputRef.current?.click()}
                >
                  <i className='bi bi-upload me-1'></i>
                  Importer (.csv, .xlsx)
                </button>
                {fileName && (
                  <span className='badge badge-light-success fs-8 px-3 py-2'>
                    {fileName} ({importedData.length} jours)
                  </span>
                )}
              </div>
              <button
                type='button'
                className='btn btn-sm btn-primary fw-bold px-5'
                disabled={importedData.length === 0 || isProcessing}
                onClick={runFileBenchmark}
              >
                {isProcessing ? 'Évaluation…' : 'Évaluer les modèles'}
              </button>
            </div>
            <div className='text-muted fs-8 mt-2'>Au moins 90 jours consécutifs sont nécessaires pour un backtest fiable.</div>

          </>
        )}

        {errorMessage && (
          <div className='text-danger fs-7 mt-3'>
            <i className='bi bi-exclamation-circle me-1'></i>
            {errorMessage}
          </div>
        )}
      </div>

      {isProcessing && !result && (
        <div className='card border-0 shadow-sm p-10 text-center text-muted'>
          <div className='spinner-border text-primary mx-auto mb-4' role='status'></div>
          Calcul des prévisions…
        </div>
      )}

      {result && best && (
        <>
          <div className='card border-0 shadow-sm bg-white p-6 rounded-3'>
            <div className='d-flex flex-wrap justify-content-between align-items-start gap-3 mb-5'>
              <div>
                <h3 className='fs-4 fw-bold text-gray-900 mb-1'>
                  Meilleur modèle : <span className='text-primary'>{result.best_model_name}</span>
                </h3>
              </div>
              <button type='button' className='btn btn-sm btn-light-success' onClick={exportPredictions}>
                <i className='bi bi-download me-1'></i>
                Exporter (.xlsx)
              </button>
            </div>

            <div className='row g-4'>
              {[
                { label: "WAPE (même période l'an dernier)", value: `${fmt(best.wape_selection ?? best.wape, 2)} %`, color: 'text-success' },
                { label: 'MAE', value: `${fmt(best.mae)} pcs/j` },
                { label: 'RMSE', value: `${fmt(best.rmse)} pcs/j` },
                { label: 'MASE', value: fmt(best.mase, 3) },
                { label: 'R²', value: fmt(best.r2, 3) },
              ].map((k: any) => (
                <div className='col-xl-3 col-md-4 col-6' key={k.label}>
                  <div className='bg-light rounded-3 p-4 h-100'>
                    <div className='text-muted fs-8 fw-semibold mb-1'>{k.label}</div>
                    <div className={`fs-3 fw-bold ${k.color || 'text-gray-900'}`}>{k.value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className='mt-5 fs-7'>
              <span className='fw-bold text-gray-800 me-2'>Hyperparamètres retenus :</span>
              {best.params && Object.keys(best.params).length > 0 ? (
                <>
                  {Object.entries(best.params).map(([name, value]) => (
                    <span key={name} className='badge badge-light-primary fs-8 me-2'>
                      {name} = {fmtParam(value)}
                    </span>
                  ))}
                  <span className='text-muted'>
                    {best.tuning_criterion === 'aic'
                      ? '(choisis par AIC)'
                      : best.tuning_criterion === 'wape_cv'
                        ? '(choisis par validation croisée)'
                        : '(valeurs par défaut)'}
                  </span>
                </>
              ) : (
                <span className='text-muted'>aucun (modèle sans hyperparamètre)</span>
              )}
            </div>
          </div>

          {chartConfig && (
            <div className='card border-0 shadow-sm bg-white p-6 rounded-3'>
              <h3 className='fs-4 fw-bold text-gray-900 mb-1'>Prévision du mois</h3>
              <span className='text-muted fs-7 mb-4'>Modèle {result.best_model_name}</span>
              <Chart options={chartConfig.options} series={chartConfig.series} type='line' height={380} />
            </div>
          )}

          <div className='card border-0 shadow-sm bg-white p-5 rounded-3'>
            <div className='d-flex justify-content-between align-items-center'>
              <div>
                <h4 className='fs-6 fw-bold text-gray-900 mb-1'>
                  Prévisions {result.best_model_name} du {result.predictions?.[0]?.date?.split('-').reverse().join('/')} au{' '}
                  {result.predictions?.[result.predictions.length - 1]?.date?.split('-').reverse().join('/')}
                </h4>
              </div>
            </div>

              <div className='table-responsive mt-4'>
                <table className='table table-row-dashed align-middle gs-4 gy-2 mb-0'>
                  <thead className='sticky-top bg-light'>
                    <tr className='text-start text-gray-600 fw-bold fs-8 text-uppercase'>
                      <th>Date prévision</th>
                      {hasReal && <th>Date réel</th>}
                      {hasReal && <th className='text-end'>Réel {dailyRows[0]?.realDate?.slice(0, 4)}</th>}
                      <th className='text-end text-primary'>Prévision {result.predictions?.[0]?.date?.slice(0, 4)}</th>
                      {hasReal && <th className='text-end'>Écart</th>}
                    </tr>
                  </thead>
                  <tbody className='fs-8 fw-semibold text-gray-700'>
                    {dailyRows.map((row: any) => (
                      <tr key={row.date}>
                        <td className='text-gray-900 fw-bold'>{row.date.split('-').reverse().join('/')}</td>
                        {hasReal && <td className='text-muted'>{row.realDate ? row.realDate.split('-').reverse().join('/') : '—'}</td>}
                        {hasReal && <td className='text-end'>{row.real === null ? '—' : `${fmt(row.real)} pcs`}</td>}
                        <td className='text-end text-primary fw-bold'>{fmt(row.pred)} pcs</td>
                        {hasReal && (
                          <td className={`text-end ${row.delta === null ? 'text-muted' : row.delta >= 0 ? 'text-success' : 'text-danger'}`}>
                            {row.delta === null ? '—' : `${row.delta >= 0 ? '+' : ''}${fmt(row.delta)} pcs`}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                  {hasReal && (
                    <tfoot className='bg-light fw-bold text-gray-900 fs-8'>
                      <tr>
                        <td>Total</td>
                        <td></td>
                        <td className='text-end'>{fmt(totalReal)} pcs</td>
                        <td className='text-end text-primary'>{fmt(totalPred)} pcs</td>
                        <td className={`text-end ${totalPred - totalReal >= 0 ? 'text-success' : 'text-danger'}`}>
                          {totalPred - totalReal >= 0 ? '+' : ''}{fmt(totalPred - totalReal)} pcs
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
          </div>
        </>
      )}
    </div>
  )
}
