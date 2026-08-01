import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import { TrendingUp, Calendar, Clock, Sun, Wind } from 'lucide-react';
import { DailyForecastItem, HourlyForecastItem, TemperatureUnit } from '../types/weather';
import { cToF, formatTemp } from '../utils/weatherUtils';

interface WeatherChartsProps {
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  tempUnit: TemperatureUnit;
  isDarkMode: boolean;
}

type ChartMode = '24h-temp' | '7d-trend' | 'uv-humidity' | 'wind';

export const WeatherCharts: React.FC<WeatherChartsProps> = ({
  hourly,
  daily,
  tempUnit,
  isDarkMode,
}) => {
  const [activeMode, setActiveMode] = useState<ChartMode>('24h-temp');

  // Format 24-hour chart dataset
  const hourlyData = hourly.slice(0, 24).map((h) => ({
    time: h.hourLabel,
    temp: tempUnit === 'f' ? cToF(h.temperature) : Math.round(h.temperature),
    rainProb: h.precipitationProbability,
    uv: h.uvIndex,
    humidity: h.humidity,
    wind: Math.round(h.windSpeed),
  }));

  // Format 7-day chart dataset
  const dailyData = daily.map((d) => ({
    day: d.dayName,
    maxTemp: tempUnit === 'f' ? cToF(d.tempMax) : Math.round(d.tempMax),
    minTemp: tempUnit === 'f' ? cToF(d.tempMin) : Math.round(d.tempMin),
    rainProb: d.precipitationProbabilityMax,
    uvMax: d.uvIndexMax,
    windMax: Math.round(d.windSpeedMax),
  }));

  const chartColors = {
    grid: '#1e293b',
    text: '#64748b',
    tooltipBg: '#0f172a',
    tooltipBorder: '#1e293b',
  };

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 shadow-xl backdrop-blur-md text-xs font-semibold">
          <p className="text-white font-bold mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 my-0.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-slate-400">{entry.name}:</span>
              <span className="text-slate-100 font-bold">
                {entry.value}
                {entry.unit || ''}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-3xl p-6 bg-slate-900 border border-slate-800 shadow-xl">
      {/* Header & Chart Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Visual Intelligence Analytics
            </h3>
            <p className="text-xs text-slate-500">
              Interactive telemetry curves for temperature, rain probability & wind dynamics
            </p>
          </div>
        </div>

        {/* Chart Selector Pills */}
        <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setActiveMode('24h-temp')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeMode === '24h-temp'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> 24h Temp & Rain
          </button>
          <button
            onClick={() => setActiveMode('7d-trend')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeMode === '7d-trend'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> 7-Day High/Low
          </button>
          <button
            onClick={() => setActiveMode('uv-humidity')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeMode === 'uv-humidity'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-200'
            }`}
          >
            <Sun className="w-3.5 h-3.5" /> UV & Humidity
          </button>
          <button
            onClick={() => setActiveMode('wind')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeMode === 'wind'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-200'
            }`}
          >
            <Wind className="w-3.5 h-3.5" /> Wind Speed
          </button>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="w-full h-72 sm:h-80 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {activeMode === '24h-temp' ? (
            <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis dataKey="time" stroke={chartColors.text} tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" stroke={chartColors.text} tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" stroke="#38bdf8" tick={{ fontSize: 11 }} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="temp"
                name={`Temperature (°${tempUnit.toUpperCase()})`}
                stroke="#6366f1"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#tempGradient)"
                unit={`°${tempUnit.toUpperCase()}`}
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="rainProb"
                name="Rain Prob."
                stroke="#38bdf8"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#rainGradient)"
                unit="%"
              />
            </AreaChart>
          ) : activeMode === '7d-trend' ? (
            <LineChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis dataKey="day" stroke={chartColors.text} tick={{ fontSize: 11 }} />
              <YAxis stroke={chartColors.text} tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="maxTemp"
                name={`Max Temp (°${tempUnit.toUpperCase()})`}
                stroke="#f43f5e"
                strokeWidth={3}
                dot={{ r: 4, fill: '#f43f5e' }}
                unit={`°${tempUnit.toUpperCase()}`}
              />
              <Line
                type="monotone"
                dataKey="minTemp"
                name={`Min Temp (°${tempUnit.toUpperCase()})`}
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ r: 4, fill: '#6366f1' }}
                unit={`°${tempUnit.toUpperCase()}`}
              />
            </LineChart>
          ) : activeMode === 'uv-humidity' ? (
            <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="uvGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis dataKey="time" stroke={chartColors.text} tick={{ fontSize: 11 }} />
              <YAxis yAxisId="uv" stroke="#f59e0b" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="hum" orientation="right" stroke="#6366f1" tick={{ fontSize: 11 }} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                yAxisId="uv"
                type="monotone"
                dataKey="uv"
                name="UV Index"
                stroke="#f59e0b"
                strokeWidth={2.5}
                fill="url(#uvGradient)"
              />
              <Line
                yAxisId="hum"
                type="monotone"
                dataKey="humidity"
                name="Humidity"
                stroke="#6366f1"
                strokeWidth={2}
                dot={false}
                unit="%"
              />
            </AreaChart>
          ) : (
            <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis dataKey="time" stroke={chartColors.text} tick={{ fontSize: 11 }} />
              <YAxis stroke={chartColors.text} tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="wind"
                name="Wind Speed"
                fill="#6366f1"
                radius={[6, 6, 0, 0]}
                unit={tempUnit === 'f' ? ' mph' : ' km/h'}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
