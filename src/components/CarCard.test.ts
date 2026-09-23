import { describe, it, expect } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import CarCard from './CarCard.vue'
import type { Model, Company } from '../types/car'

const model: Model = {
  id: 'nexon',
  companyId: 'tata',
  name: 'Nexon',
  segment: 'Compact SUV',
  launchYear: 2023,
  priceMin: 800000,
  priceMax: 1560000,
}

const company: Company = { id: 'tata', name: 'Tata Motors', logoUrl: '/logos/tata.svg' }

describe('CarCard', () => {
  it('renders the model name, company name, and price range', () => {
    const wrapper = mount(CarCard, {
      props: { model, company, overallScore: 78 },
      global: { stubs: { RouterLink: RouterLinkStub } },
    })
    expect(wrapper.text()).toContain('Nexon')
    expect(wrapper.text()).toContain('Tata Motors')
    expect(wrapper.text()).toContain('8.00L')
  })

  it('links to the model detail page', () => {
    const wrapper = mount(CarCard, {
      props: { model, company, overallScore: 78 },
      global: { stubs: { RouterLink: RouterLinkStub } },
    })
    expect(wrapper.findComponent(RouterLinkStub).props('to')).toBe('/cars/nexon')
  })

  it('renders the overall score via ScoreBadge', () => {
    const wrapper = mount(CarCard, {
      props: { model, company, overallScore: 78 },
      global: { stubs: { RouterLink: RouterLinkStub } },
    })
    expect(wrapper.text()).toContain('78')
  })
})
