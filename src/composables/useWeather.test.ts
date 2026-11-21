import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useWeather, WEATHER_MESSAGES } from './useWeather'
import { todayISO } from '../utils/dates'

const isoInDays = (n: number) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const okResponse = (date: string, temperature: number) =>
  new Response(
    JSON.stringify({
      daily: {
        time: [date],
        temperature_2m_max: [temperature],
        weathercode: [1],
        precipitation_probability_max: [null]
      }
    }),
    { status: 200 }
  )

let fetchMock: ReturnType<typeof vi.fn>

beforeEach(() => {
  fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useWeather', () => {
  it('maps the Open-Meteo response', async () => {
    const today = todayISO()
    fetchMock.mockResolvedValue(okResponse(today, 33.1))
    const w = useWeather()
    await w.fetchWeather('Siem Reap', today, today)
    expect(w.weather.value).toEqual([{ date: today, temperature: 33.1, weatherCode: 1, rainChance: 0 }])
    expect(w.error.value).toBeNull()
    expect(w.isLoading.value).toBe(false)
    expect(String(fetchMock.mock.calls[0][0])).toContain('latitude=13.3618')
  })

  it('does not guess a location for custom destinations', async () => {
    const w = useWeather()
    await w.fetchWeather('Grandma village', todayISO(), todayISO())
    expect(fetchMock).not.toHaveBeenCalled()
    expect(w.error.value).toBe(WEATHER_MESSAGES.unknownPlace)
  })

  it('skips the request for dates beyond the forecast window', async () => {
    const w = useWeather()
    await w.fetchWeather('Kep', isoInDays(30), isoInDays(32))
    expect(fetchMock).not.toHaveBeenCalled()
    expect(w.error.value).toBe(WEATHER_MESSAGES.tooFar)
  })

  it('reports a friendly error when the API fails', async () => {
    fetchMock.mockResolvedValue(new Response('{}', { status: 500 }))
    const w = useWeather()
    await w.fetchWeather('Kep', todayISO(), todayISO())
    expect(w.error.value).toBe(WEATHER_MESSAGES.unavailable)
    expect(w.weather.value).toEqual([])
  })

  it('REGRESSION: a slow older response cannot overwrite a newer one', async () => {
    const today = todayISO()
    const tomorrow = isoInDays(1)
    let resolveSlow!: (r: Response) => void
    fetchMock
      .mockImplementationOnce(() => new Promise<Response>(r => { resolveSlow = r }))
      .mockResolvedValueOnce(okResponse(tomorrow, 30))

    const w = useWeather()
    const first = w.fetchWeather('Kep', today, today)
    await w.fetchWeather('Kep', tomorrow, tomorrow)
    resolveSlow(okResponse(today, 99))
    await first

    expect(w.weather.value).toEqual([{ date: tomorrow, temperature: 30, weatherCode: 1, rainChance: 0 }])
    expect(w.isLoading.value).toBe(false)
  })
})
