import companiesData from '../data/mock/companies.json'
import modelsData from '../data/mock/models.json'
import recallsData from '../data/mock/recalls.json'
import safetyRatingsData from '../data/mock/safetyRatings.json'
import csiReportsData from '../data/mock/csiReports.json'
import dealershipDataRaw from '../data/mock/dealershipData.json'
import partsPriceData from '../data/mock/partsPrice.json'
import forumSentimentData from '../data/mock/forumSentiment.json'
import computedScoresData from '../data/mock/computedScores.json'
import type {
  Company,
  Model,
  Recall,
  SafetyRating,
  CsiReport,
  DealershipData,
  PartsPrice,
  ForumSentiment,
  ComputedScore,
  ModelRawSignals,
} from '../types/car'

const companies = companiesData as Company[]
const models = modelsData as Model[]
const recalls = recallsData as Recall[]
const safetyRatings = safetyRatingsData as SafetyRating[]
const csiReports = csiReportsData as CsiReport[]
const dealershipData = dealershipDataRaw as DealershipData[]
const partsPrice = partsPriceData as PartsPrice[]
const forumSentiment = forumSentimentData as ForumSentiment[]
const computedScores = computedScoresData as ComputedScore[]

export async function getCompanies(): Promise<Company[]> {
  return companies
}

export async function getModels(): Promise<Model[]> {
  return models
}

export async function getModelById(modelId: string): Promise<Model | null> {
  return models.find((m) => m.id === modelId) ?? null
}

export async function getModelRawSignals(modelId: string): Promise<ModelRawSignals> {
  const model = await getModelById(modelId)
  const companyId = model?.companyId ?? null

  return {
    recalls: recalls.filter((r) => r.modelId === modelId),
    safetyRating: safetyRatings.find((s) => s.modelId === modelId) ?? null,
    csiReport: csiReports.find((c) => c.modelId === modelId) ?? null,
    dealership: dealershipData.find((d) => d.companyId === companyId) ?? null,
    partsPrice: partsPrice.find((p) => p.modelId === modelId) ?? null,
    forumSentiment: forumSentiment.filter((f) => f.modelId === modelId),
  }
}

export async function getComputedScore(modelId: string): Promise<ComputedScore | null> {
  return computedScores.find((c) => c.modelId === modelId) ?? null
}

export async function getAllComputedScores(): Promise<ComputedScore[]> {
  return computedScores
}
