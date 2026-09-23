import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PillarBreakdown from './PillarBreakdown.vue'
import type { ComputedScore, ModelRawSignals, Model } from '../types/car'

const computedScore: ComputedScore = {
  modelId: 'baleno',
  reliabilityScore: 73,
  safetyScore: 14,
  repairabilityScore: 83,
  valueScore: 77,
  overallScore: 62,
  lastComputedAt: '2024-05-02',
}

const model: Model = {
  id: 'baleno',
  companyId: 'maruti',
  name: 'Baleno',
  segment: 'Hatchback',
  launchYear: 2022,
  priceMin: 650000,
  priceMax: 950000,
}

const rawSignals: ModelRawSignals = {
  recalls: [{ id: 'r2', modelId: 'baleno', date: '2022-07-01', severity: 'medium', description: 'Airbag control unit software update' }],
  safetyRating: {
    id: 's3',
    modelId: 'baleno',
    source: 'global_ncap',
    tested: false,
    adultStars: null,
    childStars: null,
    testedVariant: null,
    abs: true,
    esc: false,
    airbagsCount: 2,
    adasPresent: false,
  },
  csiReport: { id: 'c3', modelId: 'baleno', source: 'JD Power India CSI', year: 2023, score: 800 },
  dealership: { id: 'd1', companyId: 'maruti', serviceCenterCount: 4200, dealershipCount: 3500 },
  partsPrice: { id: 'p3', modelId: 'baleno', avgPriceIndex: 0.88 },
  forumSentiment: [
    { id: 'f7', modelId: 'baleno', source: 'teambhp', threadUrl: 'https://www.team-bhp.com/forum/baleno-review-reliability', aspect: 'reliability', sentimentScore: 68, collectedAt: '2024-05-01' },
    { id: 'f8', modelId: 'baleno', source: 'teambhp', threadUrl: 'https://www.team-bhp.com/forum/baleno-review-service', aspect: 'service', sentimentScore: 55, collectedAt: '2024-05-01' },
    { id: 'f9', modelId: 'baleno', source: 'teambhp', threadUrl: 'https://www.team-bhp.com/forum/baleno-review-value', aspect: 'value', sentimentScore: 82, collectedAt: '2024-05-01' },
  ],
}

describe('PillarBreakdown', () => {
  it('renders all four pillar gauges with their scores', () => {
    const wrapper = mount(PillarBreakdown, { props: { computedScore, rawSignals, model } })
    expect(wrapper.text()).toContain('Reliability')
    expect(wrapper.text()).toContain('Safety')
    expect(wrapper.text()).toContain('Repairability')
    expect(wrapper.text()).toContain('Value for money')
  })

  it('shows the NCAP-untested note when the safety pillar is expanded', async () => {
    const wrapper = mount(PillarBreakdown, { props: { computedScore, rawSignals, model } })
    await wrapper.get('[data-testid="pillar-toggle-safety"]').trigger('click')
    expect(wrapper.get('[data-testid="safety-untested-note"]').text()).toContain('treated as 0★')
  })

  it('shows the recall description when the reliability pillar is expanded', async () => {
    const wrapper = mount(PillarBreakdown, { props: { computedScore, rawSignals, model } })
    await wrapper.get('[data-testid="pillar-toggle-reliability"]').trigger('click')
    expect(wrapper.get('[data-testid="pillar-detail-reliability"]').text()).toContain('Airbag control unit software update')
  })

  it('shows "No CSI report available" when csiReport is null', async () => {
    const wrapper = mount(PillarBreakdown, {
      props: { computedScore, rawSignals: { ...rawSignals, csiReport: null }, model },
    })
    await wrapper.get('[data-testid="pillar-toggle-reliability"]').trigger('click')
    expect(wrapper.get('[data-testid="pillar-detail-reliability"]').text()).toContain('No CSI report available')
  })

  it('shows only the reliability-aspect sentiment in the reliability panel', async () => {
    const wrapper = mount(PillarBreakdown, { props: { computedScore, rawSignals, model } })
    await wrapper.get('[data-testid="pillar-toggle-reliability"]').trigger('click')
    const text = wrapper.get('[data-testid="pillar-detail-reliability"]').text()
    expect(text).toContain('Sentiment: 68/100')
    expect(text).not.toContain('55/100')
    expect(text).not.toContain('82/100')
  })

  it('shows only the service-aspect sentiment in the repairability panel', async () => {
    const wrapper = mount(PillarBreakdown, { props: { computedScore, rawSignals, model } })
    await wrapper.get('[data-testid="pillar-toggle-repairability"]').trigger('click')
    const text = wrapper.get('[data-testid="pillar-detail-repairability"]').text()
    expect(text).toContain('Sentiment: 55/100')
    expect(text).not.toContain('68/100')
    expect(text).not.toContain('82/100')
  })

  it('shows only the value-aspect sentiment and the price range in the value panel', async () => {
    const wrapper = mount(PillarBreakdown, { props: { computedScore, rawSignals, model } })
    await wrapper.get('[data-testid="pillar-toggle-value"]').trigger('click')
    const text = wrapper.get('[data-testid="pillar-detail-value"]').text()
    expect(text).toContain('Price range: ₹6.50L – ₹9.50L')
    expect(text).toContain('Sentiment: 82/100')
    expect(text).not.toContain('68/100')
    expect(text).not.toContain('55/100')
  })

  it('shows a fallback message and no fabricated values when safetyRating is null', async () => {
    const wrapper = mount(PillarBreakdown, {
      props: { computedScore, rawSignals: { ...rawSignals, safetyRating: null }, model },
    })
    await wrapper.get('[data-testid="pillar-toggle-safety"]').trigger('click')
    const text = wrapper.get('[data-testid="pillar-detail-safety"]').text()
    expect(text).toContain('No active-safety data available.')
    expect(text).not.toContain('ABS')
    expect(text).not.toContain('airbags')
  })
})
