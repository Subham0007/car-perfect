import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ModelDetailView from './ModelDetailView.vue'
import { getModelById, getModelRawSignals } from '../services/carDataService'

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { id: 'nexon' } }),
}))

vi.mock('../services/carDataService', () => ({
  getModelById: vi.fn().mockResolvedValue({
    id: 'nexon',
    companyId: 'tata',
    name: 'Nexon',
    segment: 'Compact SUV',
    launchYear: 2023,
    priceMin: 800000,
    priceMax: 1560000,
  }),
  getCompanies: vi.fn().mockResolvedValue([
    { id: 'tata', name: 'Tata Motors', logoUrl: '/logos/tata.svg' },
  ]),
  getComputedScore: vi.fn().mockResolvedValue({
    modelId: 'nexon',
    reliabilityScore: 79,
    safetyScore: 100,
    repairabilityScore: 62,
    valueScore: 72,
    overallScore: 78,
    lastComputedAt: '2024-05-02',
  }),
  getModelRawSignals: vi.fn().mockResolvedValue({
    recalls: [],
    safetyRating: null,
    csiReport: null,
    dealership: null,
    partsPrice: null,
    forumSentiment: [],
  }),
}))

describe('ModelDetailView', () => {
  it('shows a loading state before data resolves', () => {
    const wrapper = mount(ModelDetailView)
    expect(wrapper.find('[data-testid="model-detail-loading"]').exists()).toBe(true)
  })

  it('renders the model name, company, and overall score once loaded', async () => {
    const wrapper = mount(ModelDetailView)
    await flushPromises()
    expect(wrapper.text()).toContain('Nexon')
    expect(wrapper.text()).toContain('Tata Motors')
    expect(wrapper.text()).toContain('78')
  })

  it('renders the PillarBreakdown once loaded', async () => {
    const wrapper = mount(ModelDetailView)
    await flushPromises()
    expect(wrapper.findComponent({ name: 'PillarBreakdown' }).exists()).toBe(true)
  })

  it('shows a not-found message when getModelById resolves null', async () => {
    vi.mocked(getModelById).mockResolvedValueOnce(null)
    const wrapper = mount(ModelDetailView)
    await flushPromises()
    expect(wrapper.find('[data-testid="model-detail-not-found"]').exists()).toBe(true)
  })

  it('shows an error message when a service call rejects', async () => {
    vi.mocked(getModelRawSignals).mockRejectedValueOnce(new Error('network error'))
    const wrapper = mount(ModelDetailView)
    await flushPromises()
    expect(wrapper.find('[data-testid="model-detail-error"]').exists()).toBe(true)
  })
})
