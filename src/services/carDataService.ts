import companiesData from '../data/mock/companies.json'
import modelsData from '../data/mock/models.json'
import type { Company, Model } from '../types/car'

const companies = companiesData as Company[]
const models = modelsData as Model[]

export async function getCompanies(): Promise<Company[]> {
  return companies
}

export async function getModels(): Promise<Model[]> {
  return models
}

export async function getModelById(modelId: string): Promise<Model | null> {
  return models.find((m) => m.id === modelId) ?? null
}
