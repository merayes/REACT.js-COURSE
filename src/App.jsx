import './App.css'
import { WeatherProvider } from './context/WeatherContext'
import { CitySelect } from './components/CitySelect'
import { ForecastList } from './components/ForecastList'

function App() {
  return (
    <div className="app">
      <WeatherProvider>
        <header className="app-header">
          <h1>Hava Durumu</h1>
          <CitySelect />
        </header>
        <main>
          <ForecastList />
        </main>
      </WeatherProvider>
    </div>
  )
}

export default App
