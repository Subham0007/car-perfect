export interface Company {
  id: string
  name: string
  logoUrl: string
}

export interface Model {
  id: string
  companyId: string
  name: string
  segment: string
  launchYear: number
  priceMin: number
  priceMax: number
}

export type RecallSeverity = 'low' | 'medium' | 'high'

export interface Recall {
  id: string
  modelId: string
  date: string
  severity: RecallSeverity
  description: string
}

export type SafetySource = 'global_ncap' | 'bharat_ncap'

export interface SafetyRating {
  id: string
  modelId: string
  source: SafetySource
  tested: boolean
  adultStars: number | null
  childStars: number | null
  testedVariant: string | null
  abs: boolean
  esc: boolean
  airbagsCount: number
  adasPresent: boolean
}

export interface CsiReport {
  id: string
  modelId: string
  source: string
  year: number
  score: number
}

export interface DealershipData {
  id: string
  companyId: string
  serviceCenterCount: number
  dealershipCount: number
}

export interface PartsPrice {
  id: string
  modelId: string
  avgPriceIndex: number
}

export type ForumAspect = 'reliability' | 'service' | 'value'

export interface ForumSentiment {
  id: string
  modelId: string
  source: string
  threadUrl: string
  aspect: ForumAspect
  sentimentScore: number
  collectedAt: string
}

export interface ComputedScore {
  modelId: string
  reliabilityScore: number
  safetyScore: number
  repairabilityScore: number
  valueScore: number
  overallScore: number
  lastComputedAt: string
}

export interface ModelRawSignals {
  recalls: Recall[]
  safetyRating: SafetyRating | null
  csiReport: CsiReport | null
  dealership: DealershipData | null
  partsPrice: PartsPrice | null
  forumSentiment: ForumSentiment[]
}
