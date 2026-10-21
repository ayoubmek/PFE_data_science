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
}

export interface ProductionKpi {
  period: Period
  periodStart: string
  periodEnd: string
  periodDays: number
  totalOrdres: number
  totalVolumeProduit: number
  totalRebut: number
  tauxConformite: number | null
  machinesTotal: number
  machinesActives: number
  machinesBloquees: number
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

export type StockStatus = 'RUPTURE' | 'CRITIQUE' | 'NORMAL' | 'SURSTOCK' | 'INACTIF' | 'SANS_CONSOMMATION'

export interface StockItem {
  id: string
  reference: string
  designation: string | null
  categorie: string | null
  emplacement: string | null
  dateStock: string | null
  encours: number | null
  genProdPostingGroup: string | null
  nomAbrege: string | null
  groupeClient: string | null
  quantite: number
  valeurUnitaire: number | null
  valeurTotale: number
  statut: StockStatus | null
  couvertureJours: number | null
  consommationJournaliere: number | null
}

export interface StockKpi {
  dateStock: string
  totalArticles: number
  quantiteTotale: number
  valeurTotaleStock: number
  statuts: Partial<Record<StockStatus, number>>
  reapprovisionnement: {
    horizonJours: number
    nbReferences: number
    quantiteTotale: number
    budgetTnd: number
    nbReferencesSansCout: number
  } | null
}

export interface StockGroup {
  name: string
  count: number
  quantity: number
  value: number
  percentage: number
}

export interface StockSite {
  site: string
  count: number
  quantity: number
  value: number
  machines: number
}

export interface DashboardSummary {
  production: ProductionKpi
  stock: StockKpi
  stockGroups: StockGroup[]
  stockSites: StockSite[]
}

export type ModelParams = Record<string, string | number | null | Array<number>>

export interface ModelMetrics {
  name: string
  mae: number | null
  rmse: number | null
  r2: number | null
  mape: number | null
  mae_selection: number | null
  mae_default: number | null
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

export const fetchProductionStats = async (period: Period) =>
  (await axios.get<DailyStat[]>(`${API_BASE_URL}/production/fact-cle/stats`, { params: { period }, timeout: DWH_TIMEOUT })).data

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

export type TrainingPhase = 'load' | 'tuning' | 'cv' | 'n1' | 'rank' | 'final' | 'done'

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
  cv_r2?: number | null
  cv_mape?: number | null
  mae_n1?: number | null
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

export const startTraining = async (month: string) =>
  (await axios.post<{ job_id: string }>(`${API_BASE_URL}/ml/benchmark/start`, null, {
    params: forecastParams(month),
    timeout: DWH_TIMEOUT,
  })).data.job_id

export const fetchTrainingStatus = async (jobId: string, since: number) =>
  (await axios.get<TrainingStatus>(`${API_BASE_URL}/ml/benchmark/${jobId}`, { params: { since }, timeout: DWH_TIMEOUT })).data

export const fetchCustomForecast = async (data: DataPoint[]) =>
  (await axios.post<ForecastResult>(
    `${API_BASE_URL}/ml/predict/custom`,
    { data, horizon: FORECAST_HORIZON },
    { timeout: ML_TIMEOUT }
  )).data

export const forecastQueryKey = (month: string) => ['productionForecast', month || 'next']
