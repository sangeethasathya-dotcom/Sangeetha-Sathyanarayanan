import React from 'react';
import { Clock, Droplets, Wind } from 'lucide-react';
import { HourlyForecastItem, TemperatureUnit } from '../types/weather';
import { getWeatherCondition } from '../utils/weatherCodes';
import { formatTemp, formatWindSpeed } from '../utils/weatherUtils';

interface HourlyForecastSliderProps {
  hourly: HourlyForecastItem[];
  tempUnit: TemperatureUnit;
  selectedDayName: string;
}

export const HourlyForecastSlider: React.FC<HourlyForecastSliderProps> = ({
  hourly,
  tempUnit,
  selectedDayName,
}) => {
  return (
    <div className="rounded-3xl p-6 bg-slate-900 border border-slate-800 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Hourly Telemetry ({selectedDayName})
            </h3>
            <p className="text-xs text-slate-500">
              Granular hour-by-hour temperature, precipitation risk, and wind vector updates
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md bg-slate-800 text-indigo-400 border border-slate-700">
          24 Hours
        </span>
      </div>

      {/* Horizontal Scrollable Carousel */}
      <div className="flex items-center gap-3 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-slate-800">
        {hourly.slice(0, 24).map((item, idx) => {
          const condition = getWeatherCondition(item.weatherCode);
          const IconComponent = condition.icon;

          return (
            <div
              key={item.time || idx}
              className="flex-shrink-0 w-24 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col items-center justify-between text-center hover:border-indigo-500/50 hover:scale-105 transition-all"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {item.hourLabel}
              </span>

              <div className="my-2 p-2 rounded-xl bg-slate-800/80 text-indigo-400">
                <IconComponent className="w-6 h-6" />
              </div>

              <div className="text-sm font-bold text-white my-0.5">
                {formatTemp(item.temperature, tempUnit)}
              </div>

              <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-400 mt-1">
                <Droplets className="w-3 h-3" />
                <span>{item.precipitationProbability}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
