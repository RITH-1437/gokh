import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DateRangePicker from './DateRangePicker.vue'

const mountPicker = (startDate = '', endDate = '') =>
  mount(DateRangePicker, { props: { startDate, endDate } })

describe('DateRangePicker', () => {
  it('REGRESSION: reflects dates supplied after mount (shared link / restore / reset)', async () => {
    const wrapper = mountPicker()
    expect(wrapper.text()).toContain('Pick a date')

    await wrapper.setProps({ startDate: '2026-12-05', endDate: '2026-12-07' })
    expect(wrapper.text()).toContain('05')
    expect(wrapper.text()).toContain('DEC')
    expect(wrapper.text()).toContain('3 days')

    await wrapper.setProps({ startDate: '', endDate: '' })
    expect(wrapper.text()).toContain('Pick a date')
  })

  it('REGRESSION: picking a start date does not wipe the end date', async () => {
    const wrapper = mountPicker('2026-12-05', '2026-12-07')
    await wrapper.find('input[aria-label="Start date"]').setValue('2026-12-06')
    expect(wrapper.emitted('update:startDate')).toEqual([['2026-12-06']])
    expect(wrapper.emitted('update:endDate')).toBeUndefined()
  })

  it('clears the end date when the start moves past it', async () => {
    const wrapper = mountPicker('2026-12-05', '2026-12-07')
    await wrapper.find('input[aria-label="Start date"]').setValue('2026-12-10')
    expect(wrapper.emitted('update:startDate')).toEqual([['2026-12-10']])
    expect(wrapper.emitted('update:endDate')).toEqual([['']])
  })

  it('REGRESSION: date inputs cover the tiles so a phone tap opens the native picker', () => {
    const wrapper = mountPicker()
    for (const label of ['Start date', 'End date']) {
      const input = wrapper.find(`input[aria-label="${label}"]`)
      const classes = input.classes()
      // Not a visually-hidden 1px input opened from script (broken on iOS).
      expect(classes).not.toContain('sr-only')
      expect(classes).toEqual(expect.arrayContaining(['absolute', 'inset-0', 'opacity-0']))
      // >=16px font stops iOS Safari zooming the page on focus.
      expect(classes).toContain('text-base')
      expect(input.element.closest('label')).not.toBeNull()
    }
  })

  it('opening the picker does not throw when showPicker is unsupported or fails', async () => {
    const wrapper = mountPicker()
    const input = wrapper.find('input[aria-label="Start date"]')
    ;(input.element as HTMLInputElement).showPicker = () => {
      throw new DOMException('not allowed', 'NotAllowedError')
    }
    await expect(input.trigger('click')).resolves.not.toThrow()
  })

  it('does not emit anything on mount', () => {
    const wrapper = mountPicker('2026-12-05', '2026-12-07')
    expect(wrapper.emitted()).not.toHaveProperty('update:startDate')
    expect(wrapper.emitted()).not.toHaveProperty('update:endDate')
  })

  it('limits the end-date picker to the maximum trip length', () => {
    const wrapper = mountPicker('2026-12-01', '')
    expect(wrapper.find('input[aria-label="End date"]').attributes('max')).toBe('2027-02-28')
  })

  it('shows an error for an over-long range', async () => {
    const wrapper = mountPicker('2026-01-01', '2026-12-31')
    expect(wrapper.text()).toMatch(/up to 90 days/)
  })
})
