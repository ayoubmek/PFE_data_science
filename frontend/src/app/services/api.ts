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
  wape: number | null
  mase: number | null
  r2: number | null
  wape_selection: number | null
  wape_default: number | null
  rank?: number
  params: ModelParams
  default_params: ModelParams
  tuning_criterion: 'aic' | 'wape_cv' | null
}

export interface ForecastPoint {
  date: string
  best_quantity: number
  real_last_year_date: string
  real_last_year: number | null
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

export const FORECAST_START = '2027-01-01'
export const FORECAST_HORIZON = 30
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

export const fetchDwhForecast = async () =>
  (await axios.get<ForecastResult>(`${API_BASE_URL}/ml/predict/production`, {
    params: { horizon: FORECAST_HORIZON, start: FORECAST_START },
    timeout: ML_TIMEOUT,
  })).data

export const fetchCustomForecast = async (data: DataPoint[]) =>
  (await axios.post<ForecastResult>(
    `${API_BASE_URL}/ml/predict/custom`,
    { data, horizon: FORECAST_HORIZON, start: FORECAST_START },
    { timeout: ML_TIMEOUT }
  )).data

export const forecastQueryKey = ['productionForecast', FORECAST_START, FORECAST_HORIZON]
