import axios from 'axios'
import { API_BASE_URL } from '../config'

export type Period = 'mois' | 'annee' | 'tout'

export interface Declaration {
  id: number
  reference: string
  itemNo: string | null
  article: string | null
  quantiteRealisee: number
  scrapQuantity: number
  runTime: number
  dateDebut: string | null
  workCenter: string | null
  machineNom: string | null
  machineCode: string | null
  site: string | null
}

export interface DailyStat {
  date: string
  totalOutput: number
  totalScrap: number
  totalTrs: number
}

export interface ProductionKpi {
  period: Period
  periodStart: string
  periodEnd: string
  dataStart: string | null
  totalVolumeProduit: number
  totalRebut: number
  machinesTotal: number
}

export interface Machine {
  id: number
  code: string
  nom: string | null
  workCenter: string | null
  family: string | null
  emplacement: string | null
  operationCount: number
  totalOutput: number
  totalScrap: number
  tauxConformite: number | null
  efficaciteNominale: number | null
  bloquee: boolean
  derniereDeclaration: string | null
}

export interface StockItem {
  reference: string
  designation: string | null
  categorie: string | null
  emplacement: string | null
  dateStock: string | null
  genProdPostingGroup: string | null
  nomAbrege: string | null
  groupeClient: string | null
  quantite: number
  valeurTotale: number
}

export interface StockKpi {
  dateStock: string
  valeurTotaleStock: number
}

export interface StockGroup {
  name: string
  count: number
  quantity: number
  value: number
  percentage: number
}

export interface DashboardSummary {
  production: ProductionKpi
  stock: StockKpi
  stockGroups: StockGroup[]
}

export type ModelParams = Record<string, string | number | null | Array<number>>

export interface ModelMetrics {
  name: string
  mae: number | null
  rmse: number | null
  wape: number | null
  mase: number | null
  bias: number | null
  rank?: number
  params: ModelParams
  default_params: ModelParams
  tuning_criterion: 'aic' | 'mae_cv' | null
}

export interface ForecastPoint {
  date: string
  best_quantity: number
  real_last_year_date: string
  real_last_year: number | null
  real: number | null
}

export interface ForecastResult {
  best_model: string
  best_model_name: string
  metrics: Record<string, ModelMetrics>
  predictions: ForecastPoint[]
  computed_in_seconds: number
}

export interface DataPoint {
  date: string
  value: number
}

export const FORECAST_HORIZON = 30
export const DEFAULT_FORECAST_MONTH = '2026-05'
const ML_TIMEOUT = 300000
const DWH_TIMEOUT = 120000

export const fetchDashboardSummary = async (period: Period) =>
  (await axios.get<DashboardSummary>(`${API_BASE_URL}/dashboard/summary`, { params: { period }, timeout: DWH_TIMEOUT })).data

export const fetchProductionStats = async (period: Period, month?: string) =>
  (await axios.get<DailyStat[]>(`${API_BASE_URL}/production/fact-cle/stats`, { params: { period, month }, timeout: DWH_TIMEOUT })).data

export const fetchDeclarations = async () =>
  (await axios.get<Declaration[]>(`${API_BASE_URL}/production/orders`, { timeout: DWH_TIMEOUT })).data

export const fetchMachines = async () =>
  (await axios.get<Machine[]>(`${API_BASE_URL}/production/machines`, { timeout: DWH_TIMEOUT })).data

export const fetchStockItems = async () =>
  (await axios.get<StockItem[]>(`${API_BASE_URL}/stock/items`, { timeout: DWH_TIMEOUT })).data

export const fetchStockKpi = async () =>
  (await axios.get<StockKpi>(`${API_BASE_URL}/stock/kpi`, { timeout: DWH_TIMEOUT })).data

export const daysInMonth = (month: string) => {
  const [year, m] = month.split('-').map(Number)
  return new Date(year, m, 0).getDate()
}

const forecastParams = (month: string) =>
  month ? { horizon: daysInMonth(month), start: `${month}-01` } : { horizon: FORECAST_HORIZON }

export const fetchDwhForecast = async (month: string) =>
  (await axios.get<ForecastResult>(`${API_BASE_URL}/ml/predict/production`, {
    params: forecastParams(month),
    timeout: ML_TIMEOUT,
  })).data

export type TrainingPhase = 'load' | 'tuning' | 'cv' | 'rank' | 'final' | 'done'

export interface TrainingStep {
  t: number
  phase: TrainingPhase
  message: string
  model?: string
  fold?: number
  folds?: number
  mae?: number | null
  cv_mae?: number | null
  cv_rmse?: number | null
  cv_wape?: number | null
  cv_mase?: number | null
  cv_bias?: number | null
  failed?: boolean
  ranking?: { model: string; rank: number; mae: number | null }[]
}

export interface TrainingStatus {
  job_id: string
  status: 'running' | 'done' | 'error'
  percent: number
  elapsed: number
  current: string
  steps: TrainingStep[]
  next: number
  result: ForecastResult | null
  error: string | null
}

export const fetchTrainingStatus = async (jobId: string, since: number) =>
  (await axios.get<TrainingStatus>(`${API_BASE_URL}/ml/benchmark/${jobId}`, { params: { since }, timeout: DWH_TIMEOUT })).data

export const startCustomTraining = async (data: DataPoint[], month: string) =>
  (await axios.post<{ job_id: string }>(
    `${API_BASE_URL}/ml/benchmark/custom/start`,
    { data, ...forecastParams(month) },
    { timeout: DWH_TIMEOUT }
  )).data.job_id

export const forecastQueryKey = (month: string) => ['productionForecast', month || 'next']
