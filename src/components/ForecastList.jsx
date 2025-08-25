import { memo, useMemo } from 'react'
import { useWeather } from '../context/WeatherContext'

const WEATHER_CODE_MAP = {
  0: { label: 'Açık', icon: '☀️' },
  1: { label: 'Güneşli', icon: '🌤️' },
  2: { label: 'Parçalı Bulutlu', icon: '⛅' },
  3: { label: 'Bulutlu', icon: '☁️' },
  45: { label: 'Sis', icon: '🌫️' },
  48: { label: 'Kırağılı Sis', icon: '🌫️' },
  51: { label: 'Çisenti', icon: '🌦️' },
  53: { label: 'Çisenti', icon: '🌦️' },
  55: { label: 'Yoğun Çisenti', icon: '🌧️' },
  61: { label: 'Yağmur', icon: '🌧️' },
  63: { label: 'Yağmur', icon: '🌧️' },
  65: { label: 'Kuvvetli Yağmur', icon: '⛈️' },
  71: { label: 'Kar', icon: '🌨️' },
  73: { label: 'Kar', icon: '🌨️' },
  75: { label: 'Yoğun Kar', icon: '❄️' },
  80: { label: 'Sağanak', icon: '🌦️' },
  81: { label: 'Sağanak', icon: '🌧️' },
  82: { label: 'Kuvvetli Sağanak', icon: '⛈️' },
  95: { label: 'Gök Gürültülü', icon: '⛈️' },
  96: { label: 'Dolu', icon: '⛈️' },
  99: { label: 'Kuvvetli Dolu', icon: '⛈️' },
}

function formatDateToDayName(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('tr-TR', { weekday: 'long' })
}

function ForecastListBase() {
  const { forecast, loading, error } = useWeather()

  const items = useMemo(() => {
    if (!forecast?.daily) return []
    const { time, weathercode, temperature_2m_max, temperature_2m_min } = forecast.daily
    return time.map((t, idx) => ({
      date: t,
      code: weathercode[idx],
      tmax: Math.round(temperature_2m_max[idx]),
      tmin: Math.round(temperature_2m_min[idx]),
    }))
  }, [forecast])

  const todayStr = new Date().toISOString().slice(0, 10)

  if (loading) return <div className="state">Yükleniyor…</div>
  if (error) return <div className="state error">{error}</div>
  if (!items.length) return <div className="state">Veri yok</div>

  return (
    <div className="forecast-grid">
      {items.map((it) => {
        const meta = WEATHER_CODE_MAP[it.code] || { label: 'Bilinmiyor', icon: '❔' }
        const isToday = it.date === todayStr
        return (
          <div key={it.date} className={`forecast-card${isToday ? ' today' : ''}`}>
            <div className="day">{formatDateToDayName(it.date)}</div>
            <div className="icon" title={meta.label}>{meta.icon}</div>
            <div className="temps">
              <span className="tmax">{it.tmax}°</span>
              <span className="tmin">{it.tmin}°</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export const ForecastList = memo(ForecastListBase)


