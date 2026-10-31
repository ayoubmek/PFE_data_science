import { useEffect, useRef, useState } from 'react'
import { apiErrorMessage } from '../config'
import { ForecastResult, TrainingStep, fetchTrainingStatus } from '../services/api'
import { fmt } from '../utils/format'

const POLL_MS = 1000
const MAX_POLL_FAILURES = 10

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

export function useLiveTraining(runKey: string | null, start: () => Promise<string>) {
  const [run, setRun] = useState(0)
  const [state, setState] = useState<LiveTrainingState>(INITIAL)
  const startRef = useRef(start)
  startRef.current = start

  useEffect(() => {
    if (runKey === null) {
      setState(INITIAL)
      return
    }
    let cancelled = false
    let timer: number | undefined
    setState({ ...INITIAL, status: 'starting', current: "Démarrage de l'entraînement…" })

    const fail = (err: unknown) => {
      if (!cancelled) setState((prev) => ({ ...prev, status: 'error', current: '', error: apiErrorMessage(err, "L'entraînement du modèle a échoué.") }))
    }

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

    startRef
      .current()
      .then((jobId) => {
        if (!cancelled) poll(jobId, 0, [])
      })
      .catch(fail)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [runKey, run])

  return { ...state, restart: () => setRun((r) => r + 1) }
}

const progressText = (live: LiveTrainingState) => {
  if (live.status === 'starting') return 'Démarrage…'
  const folds = live.steps.filter((s) => s.phase === 'cv' && s.fold)
  const total = folds[0]?.folds ?? 0
  if (total === 0) return 'Préparation des données…'
  if (folds.length < total) return `Validation du modèle : ${folds.length} / ${total} périodes`
  return 'Entraînement final du modèle…'
}

export function LiveTrainingCard({ live, subtitle }: { live: LiveTrainingState & { restart: () => void }; subtitle: string }) {
  const running = live.status === 'starting' || live.status === 'running'

  return (
    <div className='card border-0 shadow-sm bg-white p-6 rounded-3'>
      <div className='d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4'>
        <div>
          <h3 className='fs-5 fw-bold text-gray-900 mb-1'>
            {running ? 'Entraînement du modèle en cours' : live.status === 'done' ? 'Entraînement terminé' : 'Entraînement interrompu'}
          </h3>
          <div className='text-muted fs-8'>
            {subtitle} · {fmt(live.elapsed, 1)} s
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

      {running && (
        <div className='d-flex align-items-center text-gray-700 fs-7'>
          <span className='spinner-border spinner-border-sm text-primary me-2' role='status'></span>
          {progressText(live)}
        </div>
      )}
      {live.status === 'error' && <div className='text-danger fs-7'>{live.error}</div>}
    </div>
  )
}
