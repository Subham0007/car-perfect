import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises, RouterLinkStub } from '@vue/test-utils'
import HomeView from './HomeView.vue'
import type { Model, Company, ComputedScore } from '../types/car'

vi.mock('../services/carDataService', () => ({
  getModels: vi.fn().mockResolvedValue([
    { id: 'nexon', companyId: 'tata', name: 'Nexon', segment: 'Compact SUV', launchYear: 2023, priceMin: 800000, priceMax: 1560000 },
    { id: 'brezza', companyId: 'maruti', name: 'Brezza', segment: 'Compact SUV', launchYear: 2022, priceMin: 841000, priceMax: 1379000 },
  ] as Model[]),
  getCompanies: vi.fn().mockResolvedValue([
    { id: 'tata', name: 'Tata Motors', logoUrl: '/logos/tata.svg' },
    { id: 'maruti', name: 'Maruti Suzuki', logoUrl: '/logos/maruti.svg' },
  ] as Company[]),
  getAllComputedScores: vi.fn().mockResolvedValue([
    { modelId: 'nexon', reliabilityScore: 79, safetyScore: 100, repairabilityScore: 62, valueScore: 72, overallScore: 78, lastComputedAt: '2024-05-02' },
    { modelId: 'brezza', reliabilityScore: 84, safetyScore: 84, repairabilityScore: 82, valueScore: 73, overallScore: 81, lastComputedAt: '2024-05-02' },
  ] as ComputedScore[]),
}))

describe('HomeView', () => {
  it('renders the explainer heading', () => {
    const wrapper = mount(HomeView, { global: { stubs: { RouterLink: RouterLinkStub } } })
    expect(wrapper.text()).toContain('Know your car before you buy it')
  })

  it('renders the carousel with cars sorted by overall score descending once loaded', async () => {
    const wrapper = mount(HomeView, { global: { stubs: { RouterLink: RouterLinkStub } } })
    await flushPromises()
    const slides = wrapper.findAll('[data-testid^="carousel-slide-"]')
    expect(slides).toHaveLength(2)
    expect(slides[0].attributes('data-testid')).toBe('carousel-slide-brezza')
  })
})
