import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ScoreBadge from './ScoreBadge.vue'

describe('ScoreBadge', () => {
  it('renders the score value', () => {
    const wrapper = mount(ScoreBadge, { props: { score: 81 } })
    expect(wrapper.text()).toContain('81')
  })

  it('renders the label when provided', () => {
    const wrapper = mount(ScoreBadge, { props: { score: 81, label: 'Overall' } })
    expect(wrapper.text()).toContain('Overall')
  })

  it('applies the green tier class for high scores', () => {
    const wrapper = mount(ScoreBadge, { props: { score: 81 } })
    expect(wrapper.classes()).toContain('score-badge--green')
  })

  it('applies the red tier class for low scores', () => {
    const wrapper = mount(ScoreBadge, { props: { score: 49 } })
    expect(wrapper.classes()).toContain('score-badge--red')
  })
})
