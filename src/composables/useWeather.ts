import { ref } from 'vue'
import type { WeatherDay } from '../types/trip'
import { findDestination } from '../data/destinations'
import { parseISODate } from '../utils/dates'

export const WEATHER_MESSAGES = {
  tooFar: 'Forecasts are available for trips within 14 days of today — check back closer to your dates. The trip plan keeps working fine.',
  unknownPlace: 'Live forecasts are available for featured destinations. Your plan keeps working fine without one.',
  unavailable: "We couldn't load the forecast right now. Your plan keeps working fine — try again later."
} as const

const FORECAST_DAYS = 14

export const useWeather = () => {
  const weather = ref<WeatherDay[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  // Each fetch gets a sequence number; only the latest one may write state,
  // so quickly changing dates can't show the forecast for an older range.
  let requestSeq = 0
  let controller: AbortController | null = null

  // Only featured destinations have coordinates. Unknown (custom) places no
  // longer fall back to Siem Reap, which showed weather for the wrong city.
  const getCoordinatesForDestination = (destination: string) =>
    findDestination(destination)?.coordinates ?? null

  const clear = () => {
    requestSeq++
    controller?.abort()
    weather.value = []
    error.value = null
    isLoading.value = false
  }

  const fetchWeather = async (destination: string, startDate: string, endDate: string): Promise<void> => {
    const seq = ++requestSeq
    controller?.abort()
    controller = typeof AbortController !== 'undefined' ? new AbortController() : null
    const isCurrent = () => seq === requestSeq

    weather.value = []
    error.value = null

    const coordinates = getCoordinatesForDestination(destination)
    if (!coordinates) {
      error.value = WEATHER_MESSAGES.unknownPlace
      isLoading.value = false
      return
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const maxDate = new Date(today)
    maxDate.setDate(today.getDate() + FORECAST_DAYS)
    if (parseISODate(startDate) > maxDate || parseISODate(endDate) > maxDate || parseISODate(endDate) < today) {
      error.value = WEATHER_MESSAGES.tooFar
      isLoading.value = false
      return
    }

    isLoading.value = true
    try {
      // Open-Meteo API (free, no API key required)
      const params = new URLSearchParams({
        latitude: String(coordinates.lat),
        longitude: String(coordinates.lon),
        daily: 'temperature_2m_max,precipitation_probability_max,weathercode',
        timezone: 'auto',
        start_date: startDate,
        end_date: endDate
      })
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
        signal: controller?.signal
      })
      if (!response.ok) throw new Error(`Weather API request failed (${response.status})`)

      const data = await response.json()
      if (data?.error) throw new Error(data.reason || 'Weather API returned an error')
      const daily = data?.daily
      if (!daily || !Array.isArray(daily.time)) throw new Error('Unexpected weather response')

      if (!isCurrent()) return
      weather.value = daily.time.map((date: string, index: number) => ({
        date,
        temperature: Number(daily.temperature_2m_max?.[index] ?? 0),
        weatherCode: Number(daily.weathercode?.[index] ?? 0),
        rainChance: Number(daily.precipitation_probability_max?.[index] ?? 0) || 0
      }))
    } catch (err) {
      if (!isCurrent() || (err instanceof DOMException && err.name === 'AbortError')) return
      error.value = WEATHER_MESSAGES.unavailable
      console.error('Weather fetch error:', err)
      weather.value = []
    } finally {
      if (isCurrent()) isLoading.value = false
    }
  }

  const getWeatherIcon = (weatherCode: number): string => {
    // WMO weather codes
    if (weatherCode === 0) return '☀️' // Clear
    if (weatherCode <= 3) return '⛅' // Partly cloudy
    if (weatherCode <= 49) return '🌫️' // Fog
    if (weatherCode <= 69) return '🌧️' // Rain
    if (weatherCode <= 79) return '❄️' // Snow
    if (weatherCode <= 99) return '⛈️' // Thunderstorm
    return '🌤️' // Default
  }

  const getWeatherDescription = (weatherCode: number): string => {
    if (weatherCode === 0) return 'Clear'
    if (weatherCode <= 3) return 'Partly cloudy'
    if (weatherCode <= 49) return 'Foggy'
    if (weatherCode <= 69) return 'Rainy'
    if (weatherCode <= 79) return 'Snowy'
    if (weatherCode <= 99) return 'Thunderstorm'
    return 'Partly cloudy'
  }

  return {
    weather,
    isLoading,
    error,
    fetchWeather,
    clear,
    getWeatherIcon,
    getWeatherDescription
  }
}
