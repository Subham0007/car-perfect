import { describe, it, expect } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import CarCarousel from './CarCarousel.vue'
import type { Model, Company } from '../types/car'

function makeCar(id: string, name: string): { model: Model; company: Company; overallScore: number } {
  return {
    model: { id, companyId: 'tata', name, segment: 'SUV', launchYear: 2023, priceMin: 800000, priceMax: 1500000 },
    company: { id: 'tata', name: 'Tata Motors', logoUrl: '/logos/tata.svg' },
    overallScore: 78,
  }
}

const cars = [makeCar('nexon', 'Nexon'), makeCar('punch', 'Punch'), makeCar('creta', 'Creta')]

describe('CarCarousel', () => {
  it('marks the first slide as active initially and disables the prev button', () => {
    const wrapper = mount(CarCarousel, { props: { cars }, global: { stubs: { RouterLink: RouterLinkStub } } })
    expect(wrapper.get('[data-testid="carousel-slide-nexon"]').classes()).toContain('car-carousel__slide--active')
    expect(wrapper.get('[data-testid="carousel-prev"]').attributes('disabled')).toBeDefined()
  })

  it('advances to the next slide when next is clicked', async () => {
    const wrapper = mount(CarCarousel, { props: { cars }, global: { stubs: { RouterLink: RouterLinkStub } } })
    await wrapper.get('[data-testid="carousel-next"]').trigger('click')
    expect(wrapper.get('[data-testid="carousel-slide-punch"]').classes()).toContain('car-carousel__slide--active')
    expect(wrapper.get('[data-testid="carousel-slide-nexon"]').classes()).not.toContain('car-carousel__slide--active')
  })

  it('disables the next button on the last slide', async () => {
    const wrapper = mount(CarCarousel, { props: { cars }, global: { stubs: { RouterLink: RouterLinkStub } } })
    await wrapper.get('[data-testid="carousel-next"]').trigger('click')
    await wrapper.get('[data-testid="carousel-next"]').trigger('click')
    expect(wrapper.get('[data-testid="carousel-next"]').attributes('disabled')).toBeDefined()
  })

  it('jumps to a slide when a non-active peeking slide is clicked', async () => {
    const wrapper = mount(CarCarousel, { props: { cars }, global: { stubs: { RouterLink: RouterLinkStub } } })
    await wrapper.get('[data-testid="carousel-slide-creta"]').trigger('click')
    expect(wrapper.get('[data-testid="carousel-slide-creta"]').classes()).toContain('car-carousel__slide--active')
  })
})
