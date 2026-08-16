import { ref } from 'vue'
import type { WeatherDay } from '../types/trip'
import { CAMBODIAN_DESTINATIONS } from '../data/destinations'

export const useWeather = () => {
  const weather = ref<WeatherDay[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const getCoordinatesForDestination = (destination: string): { lat: number; lon: number } | null => {
    // Find matching destination
    const matchedDest = CAMBODIAN_DESTINATIONS.find(
      dest => dest.name.toLowerCase() === destination.toLowerCase()
    )
    
    if (matchedDest?.coordinates) {
      return matchedDest.coordinates
    }
    
    // Default to Siem Reap if no match found
    const defaultDest = CAMBODIAN_DESTINATIONS.find(d => d.name === 'Siem Reap')
    return defaultDest?.coordinates || null
  }

  const fetchWeather = async (destination: string, startDate: string, endDate: string): Promise<void> => {
    isLoading.value = true
    error.value = null
    
    try {
      const coordinates = getCoordinatesForDestination(destination)
      if (!coordinates) {
        throw new Error('Could not find coordinates for destination')
      }

      // Check if dates are within API range (Open-Meteo typically supports ~14 days forecast)
      const start = new Date(startDate)
      const end = new Date(endDate)
      const now = new Date()
      const maxDate = new Date()
      maxDate.setDate(now.getDate() + 14) // 14 days from now
      
      if (start > maxDate || end > maxDate) {
        // Dates are too far in the future for weather API
        weather.value = []
        error.value = 'Weather forecast only available for dates within 14 days'
        return
      }

      // Open-Meteo API (free, no API key required)
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${coordinates.lat}&longitude=${coordinates.lon}&daily=temperature_2m_max,precipitation_probability_max,weathercode&timezone=auto&start_date=${startDate}&end_date=${endDate}`
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Weather API request failed')
      }
      
      const data = await response.json()
      
      // Check for API error response
      if (data.error) {
        throw new Error(data.reason || 'Weather API returned an error')
      }
      
      // Parse the response
      const weatherData: WeatherDay[] = data.daily.time.map((date: string, index: number) => ({
        date,
        temperature: data.daily.temperature_2m_max[index],
        weatherCode: data.daily.weathercode[index],
        rainChance: data.daily.precipitation_probability_max[index] || 0
      }))
      
      weather.value = weatherData
    } catch (err) {
      error.value = 'Weather forecast unavailable for selected dates'
      console.error('Weather fetch error:', err)
      weather.value = []
    } finally {
      isLoading.value = false
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
    getWeatherIcon,
    getWeatherDescription
  }
}
