import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises, RouterLinkStub } from '@vue/test-utils'
import BrowseView from './BrowseView.vue'
import type { Model, Company, ComputedScore } from '../types/car'

vi.mock('../services/carDataService', () => {
  const models: Model[] = [
    { id: 'nexon', companyId: 'tata', name: 'Nexon', segment: 'Compact SUV', launchYear: 2023, priceMin: 800000, priceMax: 1560000 },
    { id: 'seltos', companyId: 'kia', name: 'Seltos', segment: 'Compact SUV', launchYear: 2023, priceMin: 1090000, priceMax: 2020000 },
  ]
  const companies: Company[] = [
    { id: 'tata', name: 'Tata Motors', logoUrl: '/logos/tata.svg' },
    { id: 'kia', name: 'Kia', logoUrl: '/logos/kia.svg' },
  ]
  const scores: ComputedScore[] = [
    { modelId: 'nexon', reliabilityScore: 79, safetyScore: 100, repairabilityScore: 62, valueScore: 72, overallScore: 78, lastComputedAt: '2024-05-02' },
    { modelId: 'seltos', reliabilityScore: 82, safetyScore: 82, repairabilityScore: 51, valueScore: 59, overallScore: 69, lastComputedAt: '2024-05-02' },
  ]
  return {
    getModels: vi.fn().mockResolvedValue(models),
    getCompanies: vi.fn().mockResolvedValue(companies),
    getAllComputedScores: vi.fn().mockResolvedValue(scores),
  }
})

describe('BrowseView', () => {
  it('renders one CarCard per model once data loads', async () => {
    const wrapper = mount(BrowseView, { global: { stubs: { RouterLink: RouterLinkStub } } })
    await flushPromises()
    expect(wrapper.findAll('[data-testid="car-card"]')).toHaveLength(2)
  })

  it('filters the grid when a company is selected', async () => {
    const wrapper = mount(BrowseView, { global: { stubs: { RouterLink: RouterLinkStub } } })
    await flushPromises()
    await wrapper.get('[data-testid="company-filter-kia"]').trigger('click')
    await flushPromises()
    const cards = wrapper.findAll('[data-testid="car-card"]')
    expect(cards).toHaveLength(1)
    expect(cards[0].text()).toContain('Seltos')
  })
})
