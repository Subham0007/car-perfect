import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ScoreGauge from './ScoreGauge.vue'

describe('ScoreGauge', () => {
  it('renders the label and score', () => {
    const wrapper = mount(ScoreGauge, { props: { label: 'Safety', score: 82 } })
    expect(wrapper.text()).toContain('Safety')
    expect(wrapper.text()).toContain('82/100')
  })

  it('sets the fill width to match the score', () => {
    const wrapper = mount(ScoreGauge, { props: { label: 'Safety', score: 82 } })
    const fill = wrapper.get('[data-testid="score-gauge-fill"]')
    expect(fill.attributes('style')).toContain('width: 82%')
  })

  it('applies the red tier class for low scores', () => {
    const wrapper = mount(ScoreGauge, { props: { label: 'Safety', score: 20 } })
    const fill = wrapper.get('[data-testid="score-gauge-fill"]')
    expect(fill.classes()).toContain('score-gauge__fill--red')
  })
})
