import React, { useState, useMemo, useRef } from 'react'
import * as XLSX from 'xlsx'
import { DataPoint, DEFAULT_FORECAST_MONTH, startCustomTraining } from '../../services/api'
import { fmt, fmtIsoDay } from '../../utils/format'
import { ForecastMonthSelect } from '../../components/ForecastMonthSelect'
import { LiveTrainingCard, useLiveTraining } from '../../components/LiveTraining'

type Cell = string | number | boolean | Date | null | undefined
type SheetRow = Record<string, Cell>

interface DailyRow {
  date: string
  realDate: string | null
  real: number | null
  pred: number
  delta: number | null
  actual: number | null
  deltaActual: number | null
}

const toIsoDate = (raw: Cell): string => {
  if (typeof raw === 'number') {
    const d = XLSX.SSF.parse_date_code(raw)
    return d ? `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}` : ''
  }
  if (typeof raw !== 'string' || !raw.trim()) return ''
  const s = raw.trim()
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10)
  const parts = s.split(/[/.-]/)
  return parts.length === 3 ? `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}` : ''
}

const parseDataFromRows = (rows: SheetRow[], dateCol: string, valCol: string): DataPoint[] => {
  const dateMap = new Map<string, number>()
  rows.forEach((r) => {
    const date = toIsoDate(r[dateCol])
    const raw = r[valCol]
    const value = typeof raw === 'number' ? raw : parseFloat(String(raw).replace(/\s/g, '').replace(',', '.'))
    if (date && !isNaN(value)) {
      dateMap.set(date, (dateMap.get(date) || 0) + value)
    }
  })
  return Array.from(dateMap, ([date, value]) => ({ date, value })).sort((a, b) => a.date.localeCompare(b.date))
}

export default function ModelBenchmarkPage() {
  const [importedData, setImportedData] = useState<DataPoint[]>([])
  const [fileName, setFileName] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [month, setMonth] = useState(DEFAULT_FORECAST_MONTH)
  const [runKey, setRunKey] = useState<string | null>(null)

  const live = useLiveTraining(runKey, () => startCustomTraining(importedData, month))
  const isProcessing = live.status === 'starting' || live.status === 'running'
  const result = live.status === 'done' ? live.result : null

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setErrorMessage('')
    setRunKey(null)
    setFileName(file.name)
    const reader = new FileReader()

    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target?.result, { type: 'binary', cellDates: false })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json<SheetRow>(ws, { defval: '' })

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
      } catch (err) {
        setErrorMessage('Erreur lors de la lecture du fichier : ' + (err instanceof Error ? err.message : 'Format non reconnu.'))
      }
    }

    reader.readAsBinaryString(file)
  }

  const changeMonth = (m: string) => {
    setMonth(m)
    setRunKey(null)
  }

  const runFileBenchmark = () => {
    setErrorMessage('')
    setRunKey(`${fileName}|${month}|${Date.now()}`)
  }

  const bestKey = result?.best_model
  const best = result && bestKey ? result.metrics[bestKey] : null

  const dailyRows: DailyRow[] = useMemo(
    () =>
      (result?.predictions ?? []).map((p) => {
        const real = p.real_last_year === null ? null : Number(p.real_last_year)
        const pred = Number(p.best_quantity) || 0
        const actual = p.real === null || p.real === undefined ? null : Number(p.real)
        return {
          date: p.date,
          realDate: p.real_last_year_date ?? null,
          real,
          pred,
          delta: real === null ? null : pred - real,
          actual,
          deltaActual: actual === null ? null : pred - actual,
        }
      }),
    [result]
  )
  const totalReal = dailyRows.reduce((s, r) => s + (r.real ?? 0), 0)
  const totalPred = dailyRows.reduce((s, r) => s + r.pred, 0)
  const hasReal = dailyRows.some((r) => r.real !== null)
  const hasActual = dailyRows.some((r) => r.actual !== null)
  const actualRows = dailyRows.filter((r) => r.actual !== null)
  const totalActual = actualRows.reduce((s, r) => s + (r.actual ?? 0), 0)
  const totalPredOnActual = actualRows.reduce((s, r) => s + r.pred, 0)

  const exportPredictions = () => {
    if (!result || !best || !bestKey) return
    const rows = result.predictions.map((p) => ({ date: p.date, [`prevision_${bestKey}`]: p.best_quantity }))
    const { params, default_params, ...metrics } = best
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Previsions')
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet([{ ...metrics, params: JSON.stringify(params), default_params: JSON.stringify(default_params) }]),
      'Metriques'
    )
    XLSX.writeFile(wb, `previsions_${bestKey}_${result.predictions.length}_jours.xlsx`)
  }

  const firstDate = result?.predictions[0]?.date
  const lastDate = result?.predictions[result.predictions.length - 1]?.date

  return (
    <div className='d-flex flex-column gap-6'>
      <div className='card border-0 shadow-sm bg-white p-5 rounded-3'>
        <div className='d-flex flex-wrap align-items-center justify-content-between gap-3'>
          <h2 className='fw-bold text-gray-900 fs-4 mb-0'>Évaluation du Modèle</h2>
          <ForecastMonthSelect value={month} onChange={changeMonth} />
        </div>

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
            {isProcessing ? 'Évaluation…' : 'Évaluer le modèle'}
          </button>
        </div>
        {errorMessage && (
          <div className='text-danger fs-7 mt-3'>
            <i className='bi bi-exclamation-circle me-1'></i>
            {errorMessage}
          </div>
        )}
      </div>

      {live.status !== 'idle' && (
        <LiveTrainingCard live={live} subtitle={`Fichier ${fileName}`} />
      )}

      {result && best && (
        <>
          <div className='card border-0 shadow-sm bg-white p-6 rounded-3'>
            <div className='d-flex flex-wrap justify-content-between align-items-start gap-3 mb-5'>
              <h3 className='fs-4 fw-bold text-gray-900 mb-1'>
                Modèle : <span className='text-primary'>{result.best_model_name}</span>
              </h3>
              <button type='button' className='btn btn-sm btn-light-success' onClick={exportPredictions}>
                <i className='bi bi-download me-1'></i>
                Exporter (.xlsx)
              </button>
            </div>

            <div className='row g-4'>
              {[
                { label: 'MAE – validation croisée', value: `${fmt(best.mae)} unités/jour`, color: 'text-success' },
                { label: 'RMSE – validation croisée', value: `${fmt(best.rmse)} unités/jour` },
                { label: 'WAPE – validation croisée', value: best.wape === null ? '—' : `${fmt(best.wape, 1)} %` },
                { label: 'MASE – validation croisée', value: best.mase === null ? '—' : fmt(best.mase, 3) },
                { label: 'Biais – validation croisée', value: best.bias === null ? '—' : `${best.bias > 0 ? '+' : ''}${fmt(best.bias, 1)} %` },
              ].map((k) => (
                <div className='col-xl col-md-4 col-6' key={k.label}>
                  <div className='bg-light rounded-3 p-4 h-100'>
                    <div className='text-muted fs-8 fw-semibold mb-1'>{k.label}</div>
                    <div className={`fs-3 fw-bold ${k.color || 'text-gray-900'}`}>{k.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className='card border-0 shadow-sm bg-white p-5 rounded-3'>
            <h4 className='fs-6 fw-bold text-gray-900 mb-1'>
              Prévisions {result.best_model_name} du {fmtIsoDay(firstDate)} au {fmtIsoDay(lastDate)}
            </h4>

            <div className='table-responsive mt-4'>
              <table className='table table-row-dashed align-middle gs-4 gy-2 mb-0'>
                <thead className='sticky-top bg-light'>
                  <tr className='text-start text-gray-600 fw-bold fs-8 text-uppercase'>
                    <th>Date prévision</th>
                    {hasReal && <th>Date réel</th>}
                    {hasReal && <th className='text-end'>Réel {dailyRows[0]?.realDate?.slice(0, 4)}</th>}
                    <th className='text-end text-primary'>Prévision {firstDate?.slice(0, 4)}</th>
                    {hasReal && <th className='text-end'>Écart vs N-1</th>}
                    {hasActual && <th className='text-end'>Réel {firstDate?.slice(0, 4)}</th>}
                    {hasActual && <th className='text-end'>Écart vs réel</th>}
                  </tr>
                </thead>
                <tbody className='fs-8 fw-semibold text-gray-700'>
                  {dailyRows.map((row) => (
                    <tr key={row.date}>
                      <td className='text-gray-900 fw-bold'>{fmtIsoDay(row.date)}</td>
                      {hasReal && <td className='text-muted'>{fmtIsoDay(row.realDate)}</td>}
                      {hasReal && <td className='text-end'>{row.real === null ? '—' : `${fmt(row.real)} unités`}</td>}
                      <td className='text-end text-primary fw-bold'>{fmt(row.pred)} unités</td>
                      {hasReal && (
                        <td className={`text-end ${row.delta === null ? 'text-muted' : row.delta >= 0 ? 'text-success' : 'text-danger'}`}>
                          {row.delta === null ? '—' : `${row.delta >= 0 ? '+' : ''}${fmt(row.delta)} unités`}
                        </td>
                      )}
                      {hasActual && <td className='text-end text-gray-900 fw-bold'>{row.actual === null ? '—' : `${fmt(row.actual)} unités`}</td>}
                      {hasActual && (
                        <td className={`text-end ${row.deltaActual === null ? 'text-muted' : row.deltaActual >= 0 ? 'text-success' : 'text-danger'}`}>
                          {row.deltaActual === null ? '—' : `${row.deltaActual >= 0 ? '+' : ''}${fmt(row.deltaActual)} unités`}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
                {(hasReal || hasActual) && (
                  <tfoot className='bg-light fw-bold text-gray-900 fs-8'>
                    <tr>
                      <td>Total</td>
                      {hasReal && <td></td>}
                      {hasReal && <td className='text-end'>{fmt(totalReal)} unités</td>}
                      <td className='text-end text-primary'>{fmt(totalPred)} unités</td>
                      {hasReal && (
                        <td className={`text-end ${totalPred - totalReal >= 0 ? 'text-success' : 'text-danger'}`}>
                          {totalPred - totalReal >= 0 ? '+' : ''}{fmt(totalPred - totalReal)} unités
                        </td>
                      )}
                      {hasActual && <td className='text-end'>{fmt(totalActual)} unités</td>}
                      {hasActual && (
                        <td className={`text-end ${totalPredOnActual - totalActual >= 0 ? 'text-success' : 'text-danger'}`}>
                          {totalPredOnActual - totalActual >= 0 ? '+' : ''}{fmt(totalPredOnActual - totalActual)} unités
                        </td>
                      )}
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
