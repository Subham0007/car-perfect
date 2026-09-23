import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CompanyFilter from './CompanyFilter.vue'
import type { Company } from '../types/car'

const companies: Company[] = [
  { id: 'tata', name: 'Tata Motors', logoUrl: '/logos/tata.svg' },
  { id: 'kia', name: 'Kia', logoUrl: '/logos/kia.svg' },
]

describe('CompanyFilter', () => {
  it('renders an "All" option plus one button per company', () => {
    const wrapper = mount(CompanyFilter, { props: { companies, modelValue: null } })
    expect(wrapper.get('[data-testid="company-filter-all"]').text()).toBe('All')
    expect(wrapper.get('[data-testid="company-filter-tata"]').text()).toBe('Tata Motors')
    expect(wrapper.get('[data-testid="company-filter-kia"]').text()).toBe('Kia')
  })

  it('emits update:modelValue with the company id when a company is clicked', async () => {
    const wrapper = mount(CompanyFilter, { props: { companies, modelValue: null } })
    await wrapper.get('[data-testid="company-filter-tata"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['tata'])
  })

  it('emits update:modelValue with null when "All" is clicked', async () => {
    const wrapper = mount(CompanyFilter, { props: { companies, modelValue: 'tata' } })
    await wrapper.get('[data-testid="company-filter-all"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([null])
  })
})
