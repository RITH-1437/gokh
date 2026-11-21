import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import DestinationSelector from './DestinationSelector.vue'
import { CAMBODIAN_DESTINATIONS } from '../data/destinations'

describe('DestinationSelector', () => {
  it('lets you pick every place in the catalog without typing', () => {
    const wrapper = mount(DestinationSelector, { props: { modelValue: '' } })
    const text = wrapper.text()
    for (const dest of CAMBODIAN_DESTINATIONS) {
      expect(text, dest.name).toContain(dest.name)
    }
  })

  it('selects a place from the "More places" list', async () => {
    const wrapper = mount(DestinationSelector, { props: { modelValue: '' } })
    const chip = wrapper.findAll('button.chip').find(b => b.text() === 'Banteay Srei')
    expect(chip).toBeDefined()
    await chip!.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['Banteay Srei'])
  })

  it('marks the chosen place as pressed', () => {
    const wrapper = mount(DestinationSelector, { props: { modelValue: 'Koh Tonsay' } })
    const chip = wrapper.findAll('button.chip').find(b => b.text() === 'Koh Tonsay')
    expect(chip?.attributes('aria-pressed')).toBe('true')
  })
})
