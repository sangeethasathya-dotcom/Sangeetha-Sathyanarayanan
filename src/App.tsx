import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { CurrentWeatherCard } from './components/CurrentWeatherCard';
import { SevenDayForecast } from './components/SevenDayForecast';
import { HourlyForecastSlider } from './components/HourlyForecastSlider';
import { WeatherCharts } from './components/WeatherCharts';
import { ActivityRecommendations } from './components/ActivityRecommendations';
import { AiWeatherBriefing } from './components/AiWeatherBriefing';
import { WeatherAlertsBanner } from './components/WeatherAlertsBanner';
import { SkeletonLoader } from './components/SkeletonLoader';
import { ErrorFallback } from './components/ErrorFallback';

import { GeocodingResult, WeatherData, TemperatureUnit } from './types/weather';
import { fetchWeatherData, reverseGeocode } from './services/openMeteo';
import { generateWeatherAdvice } from './utils/weatherUtils';
import { CloudSun, Sparkles, RefreshCw } from 'lucide-react';

const DEFAULT_LOCATION: GeocodingResult = {
  id: 2643743,
  name: 'London',
  latitude: 51.5074,
  longitude: -0.1278,
  country: 'United Kingdom',
  country_code: 'GB',
  admin1: 'England',
  timezone: 'Europe/London',
};

export default function App() {
  const [currentLocation, setCurrentLocation] = useState<GeocodingResult>(DEFAULT_LOCATION);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDateIndex, setSelectedDateIndex] = useState<number>(0);

  // Temperature unit state (°C / °F)
  const [tempUnit, setTempUnit] = useState<TemperatureUnit>('c');

  // Dark Mode state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('theme_mode');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return true;
    }
  });

  // Sync dark class on HTML root
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme_mode', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme_mode', 'light');
    }
  }, [isDarkMode]);

  // Load weather for location
  const loadWeather = async (location: GeocodingResult) => {
    setIsLoading(true);
    setError(null);
    setSelectedDateIndex(0);

    try {
      const data = await fetchWeatherData(location);
      setWeatherData(data);
      setCurrentLocation(location);
    } catch (err: any) {
      console.error('Failed to load weather:', err);
      setError(err.message || 'Unable to fetch weather data for this city.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load & automatic geolocation check
  useEffect(() => {
    if ('geolocation' in navigator) {
      setIsLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const geocoded = await reverseGeocode(
              position.coords.latitude,
              position.coords.longitude
            );
            loadWeather(geocoded);
          } catch {
            loadWeather(DEFAULT_LOCATION);
          } finally {
            setIsLoadingLocation(false);
          }
        },
        (geoErr) => {
          console.log('Geolocation permission denied or timeout, using default:', geoErr.message);
          setIsLoadingLocation(false);
          loadWeather(DEFAULT_LOCATION);
        },
        { timeout: 8000 }
      );
    } else {
      loadWeather(DEFAULT_LOCATION);
    }
  }, []);

  // Handle GPS location request
  const handleUseLocation = () => {
    if (!('geolocation' in navigator)) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const geocoded = await reverseGeocode(
            position.coords.latitude,
            position.coords.longitude
          );
          await loadWeather(geocoded);
        } catch (e: any) {
          setError('Failed to resolve current GPS location.');
        } finally {
          setIsLoadingLocation(false);
        }
      },
      (err) => {
        setIsLoadingLocation(false);
        alert('Geolocation request failed or permission was denied.');
      },
      { timeout: 8000 }
    );
  };

  // Filter hourly items for the selected day
  const filteredHourly = useMemo(() => {
    if (!weatherData || !weatherData.daily[selectedDateIndex]) return [];
    const targetDateStr = weatherData.daily[selectedDateIndex].date;
    const items = weatherData.hourly.filter((h) => h.rawTime.startsWith(targetDateStr));
    return items.length > 0 ? items : weatherData.hourly.slice(0, 24);
  }, [weatherData, selectedDateIndex]);

  // Generate dynamic weather rule advice
  const advice = useMemo(() => {
    if (!weatherData) return null;
    const selectedDaily = weatherData.daily[selectedDateIndex] || weatherData.daily[0];
    return generateWeatherAdvice(weatherData.current, selectedDaily, filteredHourly);
  }, [weatherData, selectedDateIndex, filteredHourly]);

  const selectedDayName = weatherData?.daily[selectedDateIndex]?.dayName || 'Today';

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-100 font-sans transition-colors duration-300 selection:bg-indigo-600 selection:text-white">
      {/* Navbar Header */}
      <Navbar
        onSelectCity={(city) => loadWeather(city)}
        onUseLocation={handleUseLocation}
        tempUnit={tempUnit}
        onToggleUnit={() => setTempUnit((u) => (u === 'c' ? 'f' : 'c'))}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((d) => !d)}
        isLoadingLocation={isLoadingLocation}
        currentCityName={currentLocation.name}
      />

      {/* Main Dashboard Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Loading State */}
        {isLoading && <SkeletonLoader />}

        {/* Error Fallback */}
        {!isLoading && error && (
          <ErrorFallback
            message={error}
            onRetry={() => loadWeather(currentLocation)}
            onSelectPopularCity={(name, lat, lon) =>
              loadWeather({
                id: Math.floor(Math.random() * 10000),
                name,
                latitude: lat,
                longitude: lon,
              })
            }
          />
        )}

        {/* Loaded Weather Dashboard */}
        {!isLoading && !error && weatherData && (
          <>
            {/* Severe Weather Alerts Banner */}
            <WeatherAlertsBanner weather={weatherData} tempUnit={tempUnit} />

            {/* Current Weather Card */}
            <CurrentWeatherCard
              weather={weatherData}
              tempUnit={tempUnit}
              onToggleUnit={() => setTempUnit((u) => (u === 'c' ? 'f' : 'c'))}
            />

            {/* AI Meteorologist Briefing (Server-Side Gemini API) */}
            <AiWeatherBriefing weather={weatherData} />

            {/* 7-Day Outlook Grid */}
            <SevenDayForecast
              daily={weatherData.daily}
              selectedDateIndex={selectedDateIndex}
              onSelectDay={(idx) => setSelectedDateIndex(idx)}
              tempUnit={tempUnit}
            />

            {/* Hourly Forecast Carousel for Selected Day */}
            <HourlyForecastSlider
              hourly={filteredHourly}
              tempUnit={tempUnit}
              selectedDayName={selectedDayName}
            />

            {/* Interactive Analytics & Trend Charts */}
            <WeatherCharts
              hourly={weatherData.hourly}
              daily={weatherData.daily}
              tempUnit={tempUnit}
              isDarkMode={isDarkMode}
            />

            {/* Activity Suitability & Weather Recommendations */}
            {advice && (
              <ActivityRecommendations advice={advice} tempUnit={tempUnit} />
            )}
          </>
        )}
      </main>

      {/* High-Density Engine Footer */}
      <footer className="border-t border-slate-800 bg-[#0b0e14] py-6 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
              <strong>AETHER ENGINE v2.4</strong> &bull; Open-Meteo V1 API &bull; Gemini 2.5 Flash
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => loadWeather(currentLocation)}
              className="hover:text-indigo-400 transition-colors flex items-center gap-1 font-semibold text-slate-400"
            >
              <RefreshCw className="w-3 h-3" /> Refresh Telemetry
            </button>
            <span>&bull;</span>
            <span className="text-emerald-400 font-mono text-[10px] uppercase">Systems Operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
