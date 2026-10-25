import { useEffect, useMemo, useRef, useState } from 'react'
import { apiErrorMessage } from '../config'
import { ForecastResult, TrainingPhase, TrainingStep, fetchTrainingStatus, startTraining } from '../services/api'
import { fmt } from '../utils/format'

const POLL_MS = 1000
const MAX_POLL_FAILURES = 10

const MODELS: { key: string; name: string }[] = [{ key: 'random_forest', name: 'Random Forest' }]

const PHASES: Record<TrainingPhase, { label: string; badge: string }> = {
  load: { label: 'Données', badge: 'badge-light-info' },
  tuning: { label: 'Réglage', badge: 'badge-light-warning' },
  cv: { label: 'Validation croisée', badge: 'badge-light-primary' },
  rank: { label: 'Résultat', badge: 'badge-light-dark' },
  final: { label: 'Entraînement final', badge: 'badge-light-success' },
  done: { label: 'Terminé', badge: 'badge-success' },
}

export interface LiveTrainingState {
  status: 'idle' | 'starting' | 'running' | 'done' | 'error'
  percent: number
  elapsed: number
  current: string
  steps: TrainingStep[]
  result: ForecastResult | null
  error: string
}

const INITIAL: LiveTrainingState = {
  status: 'idle',
  percent: 0,
  elapsed: 0,
  current: '',
  steps: [],
  result: null,
  error: '',
}

/** Lance un entraînement complet (sans cache) à chaque ouverture ou changement de mois, et suit ses étapes. */
export function useLiveTraining(month: string, enabled: boolean) {
  const [run, setRun] = useState(0)
  const [state, setState] = useState<LiveTrainingState>(INITIAL)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    let timer: number | undefined
    setState({ ...INITIAL, status: 'starting', current: "Démarrage de l'entraînement…" })

    const fail = (err: unknown) => {
      if (!cancelled) setState((prev) => ({ ...prev, status: 'error', current: '', error: apiErrorMessage(err, "L'entraînement du modèle a échoué.") }))
    }

    // L'entraînement continue côté service ML : une lecture d'état en échec est simplement retentée.
    const poll = async (jobId: string, since: number, steps: TrainingStep[], failures = 0) => {
      try {
        const s = await fetchTrainingStatus(jobId, since)
        if (cancelled) return
        const all = steps.concat(s.steps)
        setState({
          status: s.status,
          percent: s.percent,
          elapsed: s.elapsed,
          current: s.current,
          steps: all,
          result: s.result,
          error: s.error ?? '',
        })
        if (s.status === 'running') timer = window.setTimeout(() => poll(jobId, s.next, all), POLL_MS)
      } catch (err) {
        if (cancelled) return
        if (failures + 1 >= MAX_POLL_FAILURES) return fail(err)
        setState((prev) => ({ ...prev, current: 'Serveur occupé, nouvelle tentative…' }))
        timer = window.setTimeout(() => poll(jobId, since, steps, failures + 1), POLL_MS * 2)
      }
    }

    startTraining(month)
      .then((jobId) => {
        if (!cancelled) poll(jobId, 0, [])
      })
      .catch(fail)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [month, enabled, run])

  return { ...state, restart: () => setRun((r) => r + 1) }
}

interface ModelProgress {
  name: string
  folds: number
  totalFolds: number
  cvMae: number | null
  cvRmse: number | null
  cvR2: number | null
  cvMape: number | null
  cvVolume: number | null
  failed: boolean
}

const summarize = (steps: TrainingStep[]): ModelProgress[] =>
  MODELS.map(({ key, name }) => {
    const own = steps.filter((s) => s.model === key)
    const cv = own.filter((s) => s.phase === 'cv' && s.fold)
    const cvSummary = own.find((s) => s.cv_mae !== undefined)
    return {
      name,
      folds: cv.length,
      totalFolds: cv[0]?.folds ?? 0,
      cvMae: cvSummary?.cv_mae ?? null,
      cvRmse: cvSummary?.cv_rmse ?? null,
      cvR2: cvSummary?.cv_r2 ?? null,
      cvMape: cvSummary?.cv_mape ?? null,
      cvVolume: cvSummary?.cv_volume ?? null,
      failed: own.some((s) => s.failed),
    }
  })

export function LiveTrainingCard({ live }: { live: LiveTrainingState & { restart: () => void } }) {
  const running = live.status === 'starting' || live.status === 'running'
  const [showLog, setShowLog] = useState(true)
  const logRef = useRef<HTMLDivElement | null>(null)
  const models = useMemo(() => summarize(live.steps), [live.steps])

  useEffect(() => {
    setShowLog(running)
  }, [running])

  useEffect(() => {
    if (running && logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [live.steps.length, running])

  return (
    <div className='card border-0 shadow-sm bg-white p-6 rounded-3'>
      <div className='d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4'>
        <div>
          <h3 className='fs-5 fw-bold text-gray-900 mb-1'>
            {running ? 'Entraînement du modèle en cours' : live.status === 'done' ? 'Entraînement terminé' : 'Entraînement interrompu'}
          </h3>
          <div className='text-muted fs-8'>
            Données de production relues et modèle Random Forest réentraîné à chaque ouverture de la page · {fmt(live.elapsed, 1)} s
          </div>
        </div>
        <div className='d-flex align-items-center gap-3'>
          <span className='fs-2 fw-bold text-primary'>{live.percent} %</span>
          {!running && (
            <button type='button' className='btn btn-sm btn-light-primary' onClick={live.restart}>
              <i className='bi bi-arrow-repeat me-1'></i>
              Relancer
            </button>
          )}
        </div>
      </div>

      <div className='progress h-8px bg-light-primary mb-3'>
        <div
          className={`progress-bar ${live.status === 'error' ? 'bg-danger' : running ? 'progress-bar-striped progress-bar-animated' : 'bg-success'}`}
          role='progressbar'
          style={{ width: `${Math.max(live.percent, running ? 2 : 0)}%` }}
        ></div>
      </div>

      {running && live.current && (
        <div className='d-flex align-items-center text-gray-700 fs-7 mb-4'>
          <span className='spinner-border spinner-border-sm text-primary me-2' role='status'></span>
          {live.current}
        </div>
      )}
      {live.status === 'error' && <div className='text-danger fs-7 mb-4'>{live.error}</div>}

      <div className='table-responsive mb-4'>
        <table className='table table-row-dashed align-middle gs-3 gy-2 mb-0 fs-7'>
          <thead>
            <tr className='text-gray-600 fw-bold fs-8 text-uppercase'>
              <th>Modèle</th>
              <th className='min-w-150px'>Validation croisée</th>
              <th className='text-end'>MAE (CV)</th>
              <th className='text-end'>RMSE (CV)</th>
              <th className='text-end'>R² (CV)</th>
              <th className='text-end'>MAPE (CV)</th>
              <th className='text-end'>Écart volume (CV)</th>
            </tr>
          </thead>
          <tbody>
            {models.map((m) => (
              <tr key={m.name}>
                <td className='fw-bold text-gray-900'>{m.name}</td>
                <td>
                  {m.failed ? (
                    <span className='badge badge-light-danger'>Échec</span>
                  ) : (
                    <div className='d-flex align-items-center gap-2'>
                      <div className='progress h-6px w-100px bg-light'>
                        <div
                          className='progress-bar bg-primary'
                          style={{ width: `${m.totalFolds ? (100 * m.folds) / m.totalFolds : 0}%` }}
                        ></div>
                      </div>
                      <span className='text-muted fs-8'>
                        {m.folds}/{m.totalFolds || '…'}
                      </span>
                    </div>
                  )}
                </td>
                <td className='text-end'>{m.cvMae === null ? '—' : `${fmt(m.cvMae)} unités/j`}</td>
                <td className='text-end'>{m.cvRmse === null ? '—' : `${fmt(m.cvRmse)} unités/j`}</td>
                <td className='text-end'>{m.cvR2 === null ? '—' : fmt(m.cvR2, 3)}</td>
                <td className='text-end'>{m.cvMape === null ? '—' : `${fmt(m.cvMape, 1)} %`}</td>
                <td className='text-end'>{m.cvVolume === null ? '—' : `${fmt(m.cvVolume, 1)} %`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button type='button' className='btn btn-link btn-sm p-0 fs-7 mb-2 text-start' onClick={() => setShowLog((v) => !v)}>
        <i className={`bi ${showLog ? 'bi-chevron-up' : 'bi-chevron-down'} me-1`}></i>
        {showLog ? 'Masquer' : 'Afficher'} le journal des étapes ({live.steps.length})
      </button>
      {showLog && (
        <div ref={logRef} className='bg-light rounded-3 p-3 overflow-auto' style={{ maxHeight: 320 }}>
          {live.steps.length === 0 && <div className='text-muted fs-8'>En attente des premières étapes…</div>}
          {live.steps.map((s, i) => (
            <div key={i} className='d-flex align-items-start gap-3 py-1 fs-8'>
              <span className='text-muted text-nowrap' style={{ minWidth: 48 }}>
                {fmt(s.t, 1)} s
              </span>
              <span className={`badge ${PHASES[s.phase]?.badge ?? 'badge-light'} text-nowrap`}>{PHASES[s.phase]?.label ?? s.phase}</span>
              <span className={s.failed ? 'text-danger' : 'text-gray-800'}>{s.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
