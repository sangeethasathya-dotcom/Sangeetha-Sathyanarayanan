import React from 'react';
import {
  MapPin,
  Droplets,
  Wind,
  Sun,
  Eye,
  Gauge,
  Cloud,
  Sunrise,
  Sunset,
  Thermometer,
  ShieldAlert,
} from 'lucide-react';
import { WeatherData, TemperatureUnit } from '../types/weather';
import { getWeatherCondition } from '../utils/weatherCodes';
import {
  formatTemp,
  formatWindSpeed,
  getWindDirectionLabel,
  getUvRiskLevel,
  formatDateLabel,
} from '../utils/weatherUtils';

interface CurrentWeatherCardProps {
  weather: WeatherData;
  tempUnit: TemperatureUnit;
  onToggleUnit: () => void;
}

export const CurrentWeatherCard: React.FC<CurrentWeatherCardProps> = ({
  weather,
  tempUnit,
  onToggleUnit,
}) => {
  const { location, current, daily } = weather;
  const condition = getWeatherCondition(current.weatherCode);
  const IconComponent = condition.icon;
  const uvInfo = getUvRiskLevel(daily[0]?.uvIndexMax || 0);

  // Format Local Time
  const now = new Date();
  const timeFormatted = new Intl.DateTimeFormat('en-US', {
    timeZone: weather.timezone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(now);

  const dateFormatted = new Intl.DateTimeFormat('en-US', {
    timeZone: weather.timezone,
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(now);

  // Format Sunrise / Sunset
  const sunriseTime = daily[0]?.sunrise
    ? new Date(daily[0].sunrise).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : '--';

  const sunsetTime = daily[0]?.sunset
    ? new Date(daily[0].sunset).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : '--';

  return (
    <div
      className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-indigo-900/40 via-slate-900 to-[#0b0e14] border border-white/10 shadow-2xl transition-all duration-500"
    >
      {/* Decorative Glow Orb */}
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      {/* Header Info: Location & Time */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold tracking-wider text-xs uppercase mb-1">
            <MapPin className="w-3.5 h-3.5 text-indigo-400" />
            <span>
              {[location.admin1, location.country].filter(Boolean).join(', ') || 'Current City'}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {location.name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            {dateFormatted} &bull; <span className="font-semibold text-slate-200">{timeFormatted}</span>
          </p>
        </div>

        {/* Condition Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 shadow-sm self-start sm:self-auto">
          <span className={`w-2 h-2 rounded-full ${current.isDay ? 'bg-amber-400 animate-ping' : 'bg-indigo-400'}`} />
          <span className="text-xs font-semibold text-slate-200">
            {current.isDay ? 'Daytime Node' : 'Nighttime Node'}
          </span>
        </div>
      </div>

      {/* Main Temperature & Visual Condition Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center py-4 my-2 border-y border-white/10 relative z-10">
        {/* Left: Temperature & Feels Like */}
        <div className="flex items-baseline gap-4">
          <div className="text-6xl sm:text-7xl font-light text-white tracking-tighter">
            {formatTemp(current.temperature, tempUnit)}
          </div>
          <div>
            <div className="text-sm font-medium text-slate-400 flex items-center gap-1">
              <Thermometer className="w-4 h-4 text-rose-400" />
              Feels like{' '}
              <span className="font-bold text-slate-200">
                {formatTemp(current.apparentTemperature, tempUnit)}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              High: <span className="text-slate-200 font-semibold">{formatTemp(daily[0]?.tempMax ?? 0, tempUnit)}</span> &bull; Low:{' '}
              <span className="text-slate-200 font-semibold">{formatTemp(daily[0]?.tempMin ?? 0, tempUnit)}</span>
            </div>
          </div>
        </div>

        {/* Right: Icon & Condition Description */}
        <div className="flex items-center gap-4 md:justify-end">
          <div className="p-4 rounded-3xl bg-white/5 border border-white/10 shadow-xl text-indigo-400">
            <IconComponent className="w-12 h-12 sm:w-16 sm:h-16 animate-bounce-slow" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              {condition.label}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xs mt-0.5">
              {condition.description}
            </p>
          </div>
        </div>
      </div>

      {/* Key Weather Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 relative z-10">
        {/* Humidity */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-sm flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-blue-400">
            <Droplets className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
              Humidity
            </div>
            <div className="text-sm font-semibold text-white">
              {current.humidity}%
            </div>
          </div>
        </div>

        {/* Wind Speed & Compass Direction */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-sm flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-emerald-400">
            <Wind className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
              Wind Speed
            </div>
            <div className="text-sm font-semibold text-white">
              {formatWindSpeed(current.windSpeed, tempUnit)}
            </div>
            <div className="text-[10px] text-slate-500 font-medium">
              {getWindDirectionLabel(current.windDirection)}
            </div>
          </div>
        </div>

        {/* UV Index Max */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-sm flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-amber-400">
            <Sun className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
              UV Index
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-white">
                {(daily[0]?.uvIndexMax ?? 0).toFixed(1)}
              </span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${uvInfo.color}`}>
                {uvInfo.level}
              </span>
            </div>
          </div>
        </div>

        {/* Surface Pressure */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-sm flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-indigo-400">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
              Pressure
            </div>
            <div className="text-sm font-semibold text-white">
              {Math.round(current.pressure)} hPa
            </div>
          </div>
        </div>

        {/* Cloud Cover */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-sm flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400">
            <Cloud className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
              Cloud Cover
            </div>
            <div className="text-sm font-semibold text-white">
              {current.cloudCover}%
            </div>
          </div>
        </div>

        {/* Sunrise & Sunset */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-sm flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-orange-400">
            <Sunrise className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
              Sunrise / Sunset
            </div>
            <div className="text-xs font-semibold text-white">
              {sunriseTime}
            </div>
            <div className="text-[10px] text-slate-500 font-medium">
              Sunset: {sunsetTime}
            </div>
          </div>
        </div>

        {/* Precipitation Probability Max */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-sm flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-cyan-400">
            <Droplets className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
              Rain Chance
            </div>
            <div className="text-sm font-semibold text-white">
              {daily[0]?.precipitationProbabilityMax ?? 0}%
            </div>
          </div>
        </div>

        {/* Wind Gusts */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-sm flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-teal-400">
            <Wind className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
              Wind Gusts
            </div>
            <div className="text-sm font-semibold text-white">
              {formatWindSpeed(current.windGusts, tempUnit)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
