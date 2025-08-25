import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

const WeatherContext = createContext(null)

const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1/forecast'
const GEOCODING_BASE = 'https://geocoding-api.open-meteo.com/v1'

export function WeatherProvider({ children, defaultCityName = 'İstanbul' }) {
  const [cityName, setCityName] = useState(defaultCityName)
  const [coordinates, setCoordinates] = useState(null) // { latitude, longitude }
  const [forecast, setForecast] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const geocodeAbortRef = useRef(null)
  const forecastAbortRef = useRef(null)

  const geocodeCity = useCallback(async (name) => {
    if (!name) return null
    geocodeAbortRef.current?.abort()
    const controller = new AbortController()
    geocodeAbortRef.current = controller
    const url = `${GEOCODING_BASE}/search?name=${encodeURIComponent(name)}&count=1&language=tr&format=json&country=TR`
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) throw new Error('Geocoding failed')
    const data = await res.json()
    const place = data?.results?.[0]
    if (!place) throw new Error('Şehir bulunamadı!!')
    return { latitude: place.latitude, longitude: place.longitude, resolvedName: place.name }
  }, [])

  const reverseGeocode = useCallback(async (lat, lon) => {
    const url = `${GEOCODING_BASE}/reverse?latitude=${lat}&longitude=${lon}&language=tr&format=json&count=1`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    const place = data?.results?.[0]
    if (!place) return null
    return place
  }, [])

  useEffect(() => {
    let cancelled = false
    // Try geolocation once on mount
    if (!('geolocation' in navigator)) return
    navigator.geolocation.getCurrentPosition(async (pos) => {
      if (cancelled) return
      const lat = pos.coords.latitude
      const lon = pos.coords.longitude
      setCoordinates({ latitude: lat, longitude: lon })
      try {
        const place = await reverseGeocode(lat, lon)
        if (place?.country_code === 'TR' && place?.name) {
          setCityName(place.name)
        }
      } catch {}
    }, () => {}, { enableHighAccuracy: false, timeout: 5000 })
    return () => { cancelled = true }
  }, [reverseGeocode])

  useEffect(() => {
    setError(null)
    setForecast(null)
    if (!cityName) return
    let active = true
    setLoading(true)
    geocodeCity(cityName)
      .then((coords) => {
        if (!active) return
        setCoordinates({ latitude: coords.latitude, longitude: coords.longitude })
        // Keep possibly corrected name
        if (coords.resolvedName && coords.resolvedName !== cityName) {
          setCityName(coords.resolvedName)
        }
      })
      .catch((e) => {
        if (!active) return
        setError(e.message)
        setLoading(false)
      })
    return () => { active = false }
  }, [cityName, geocodeCity])

  useEffect(() => {
    if (!coordinates) return
    setError(null)
    setForecast(null)
    forecastAbortRef.current?.abort()
    const controller = new AbortController()
    forecastAbortRef.current = controller

    const url = `${OPEN_METEO_BASE}?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}` +
      `&daily=weathercode,temperature_2m_max,temperature_2m_min` +
      `&timezone=auto&forecast_days=7`

    setLoading(true)
    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error('Hava durumu verisi alınamadı!!!')
        return res.json()
      })
      .then((data) => {
        setForecast(data)
        setLoading(false)
      })
      .catch((e) => {
        if (e.name === 'AbortError') return
        setError(e.message)
        setLoading(false)
      })
  }, [coordinates])

  const value = useMemo(() => ({
    cityName,
    setCityName,
    coordinates,
    forecast,
    loading,
    error,
  }), [cityName, coordinates, forecast, loading, error])

  return (
    <WeatherContext.Provider value={value}>
      {children}
    </WeatherContext.Provider>
  )
}

export function useWeather() {
  const ctx = useContext(WeatherContext)
  if (!ctx) throw new Error('useWeather must be used within WeatherProvider')
  return ctx
}


