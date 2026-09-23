import { describe, it, expect } from 'vitest'
import { getCompanies, getModels, getModelById } from './carDataService'

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
