import { describe, it, expect } from 'vitest'
import { getCompanies, getModels, getModelById, getModelRawSignals } from './carDataService'

describe('carDataService: companies and models', () => {
  it('getCompanies returns all 6 mock companies', async () => {
    const companies = await getCompanies()
    expect(companies).toHaveLength(6)
    expect(companies.map((c) => c.id)).toContain('maruti')
  })

  it('getModels returns all 10 mock models', async () => {
    const models = await getModels()
    expect(models).toHaveLength(10)
  })

  it('getModelById returns the matching model', async () => {
    const model = await getModelById('scorpio-n')
    expect(model?.name).toBe('Scorpio-N')
  })

  it('getModelById returns null for an unknown id', async () => {
    const model = await getModelById('does-not-exist')
    expect(model).toBeNull()
  })
})

describe('carDataService: getModelRawSignals', () => {
  it('includes recalls for a model that has them', async () => {
    const signals = await getModelRawSignals('scorpio-n')
    expect(signals.recalls).toHaveLength(1)
    expect(signals.recalls[0].severity).toBe('high')
  })

  it('returns an empty recalls array for a model with no recalls', async () => {
    const signals = await getModelRawSignals('brezza')
    expect(signals.recalls).toHaveLength(0)
  })

  it('marks an NCAP-untested model as tested: false with null star ratings', async () => {
    const signals = await getModelRawSignals('baleno')
    expect(signals.safetyRating?.tested).toBe(false)
    expect(signals.safetyRating?.adultStars).toBeNull()
  })

  it('returns null csiReport when the model has no CSI report on file', async () => {
    const signals = await getModelRawSignals('seltos')
    expect(signals.csiReport).toBeNull()
  })

  it('resolves dealership data via the model\'s companyId', async () => {
    const signals = await getModelRawSignals('nexon')
    expect(signals.dealership?.serviceCenterCount).toBe(1600)
  })

  it('includes all three forum sentiment aspects for a model', async () => {
    const signals = await getModelRawSignals('city')
    expect(signals.forumSentiment).toHaveLength(3)
    expect(signals.forumSentiment.map((s) => s.aspect).sort()).toEqual(['reliability', 'service', 'value'])
  })
})

import { getComputedScore, getAllComputedScores } from './carDataService'

describe('carDataService: computed scores', () => {
  it('getAllComputedScores returns a score for every model', async () => {
    const scores = await getAllComputedScores()
    expect(scores).toHaveLength(10)
  })

  it('getComputedScore returns the score for a specific model', async () => {
    const score = await getComputedScore('scorpio-n')
    expect(score?.overallScore).toBe(49)
  })

  it('getComputedScore returns null for an unknown model', async () => {
    const score = await getComputedScore('does-not-exist')
    expect(score).toBeNull()
  })
})
