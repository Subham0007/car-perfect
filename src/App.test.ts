import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import routes from './router/routes'

describe('App', () => {
  it('renders the site title and nav links', async () => {
    const router = createRouter({ history: createWebHistory(), routes })
    router.push('/')
    await router.isReady()
    const wrapper = mount(App, { global: { plugins: [router] } })
    expect(wrapper.text()).toContain('Car Perfect')
    expect(wrapper.get('[data-testid="nav-home"]').text()).toBe('Home')
    expect(wrapper.get('[data-testid="nav-browse"]').text()).toBe('Browse')
  })

  it('renders HomeView content at the root route', async () => {
    const router = createRouter({ history: createWebHistory(), routes })
    router.push('/')
    await router.isReady()
    const wrapper = mount(App, { global: { plugins: [router] } })
    expect(wrapper.text()).toContain('Know your car before you buy it')
  })
})
