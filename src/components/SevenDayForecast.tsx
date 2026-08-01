import React from 'react';
import { Calendar, Droplets, Wind, Sun } from 'lucide-react';
import { DailyForecastItem, TemperatureUnit } from '../types/weather';
import { getWeatherCondition } from '../utils/weatherCodes';
import { formatTemp, formatDateLabel, formatWindSpeed } from '../utils/weatherUtils';

interface SevenDayForecastProps {
  daily: DailyForecastItem[];
  selectedDateIndex: number;
  onSelectDay: (index: number) => void;
  tempUnit: TemperatureUnit;
}

export const SevenDayForecast: React.FC<SevenDayForecastProps> = ({
  daily,
  selectedDateIndex,
  onSelectDay,
  tempUnit,
}) => {
  // Find global max and min across 7 days for relative bar rendering
  const maxOverall = Math.max(...daily.map((d) => d.tempMax));
  const minOverall = Math.min(...daily.map((d) => d.tempMin));

  return (
    <div className="rounded-3xl p-6 bg-slate-900 border border-slate-800 shadow-xl">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              7-Day Forecast Matrix
            </h3>
            <p className="text-xs text-slate-500">
              Select any daily node to inspect high-density metrics
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md bg-slate-800 text-indigo-400 border border-slate-700">
          7 Days
        </span>
      </div>

      {/* Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {daily.map((day, idx) => {
          const isSelected = selectedDateIndex === idx;
          const condition = getWeatherCondition(day.weatherCode);
          const IconComponent = condition.icon;

          // Temperature range percentage for visual bar
          const tempRange = maxOverall - minOverall || 1;
          const leftPercent = Math.max(0, ((day.tempMin - minOverall) / tempRange) * 100);
          const widthPercent = Math.max(
            15,
            ((day.tempMax - day.tempMin) / tempRange) * 100
          );

          return (
            <button
              key={day.date}
              onClick={() => onSelectDay(idx)}
              className={`relative flex flex-col justify-between p-4 rounded-2xl text-center transition-all duration-300 ${
                isSelected
                  ? 'bg-indigo-600 border border-indigo-400 shadow-lg shadow-indigo-500/20 text-white scale-[1.02]'
                  : 'bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              {/* Day Name */}
              <span className={`text-[10px] font-bold uppercase ${isSelected ? 'text-white' : 'text-slate-500'}`}>
                {day.dayName}
              </span>

              {/* Weather Icon */}
              <div className="my-3 flex flex-col items-center">
                <div className={`p-2 rounded-xl ${isSelected ? 'text-white' : 'text-indigo-400 bg-slate-800/80'}`}>
                  <IconComponent className="w-6 h-6" />
                </div>
              </div>

              {/* Temperature High / Low */}
              <div className="text-center my-1">
                <p className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-100'}`}>
                  {formatTemp(day.tempMax, tempUnit)}
                </p>
                <p className={`text-[10px] ${isSelected ? 'text-white/70' : 'text-slate-500'}`}>
                  {formatTemp(day.tempMin, tempUnit)}
                </p>
              </div>

              {/* Rain Chance Badge */}
              <div className="mt-2 flex justify-center">
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    isSelected
                      ? 'text-white bg-white/20'
                      : 'text-indigo-400 bg-indigo-400/10'
                  }`}
                >
                  {day.precipitationProbabilityMax}%
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
