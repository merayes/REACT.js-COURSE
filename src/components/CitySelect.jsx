import { memo } from 'react'
import { TR_CITIES } from '../data/tr-cities'
import { useWeather } from '../context/WeatherContext'

function CitySelectBase() {
  const { cityName, setCityName, loading } = useWeather()

  return (
    <div className="city-select">
      <label htmlFor="city" className="city-label">Şehir</label>
      <select
        id="city"
        className="city-dropdown"
        value={cityName}
        onChange={(e) => setCityName(e.target.value)}
        disabled={loading}
      >
        {TR_CITIES.map((c) => (
          <option key={c.name} value={c.name}>{c.name}</option>
        ))}
      </select>
    </div>
  )
}

export const CitySelect = memo(CitySelectBase)


