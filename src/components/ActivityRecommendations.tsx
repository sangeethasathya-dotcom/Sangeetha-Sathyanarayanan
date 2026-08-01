import React from 'react';
import {
  Compass,
  Umbrella,
  Thermometer,
  Wind,
  Sun,
  Activity,
  Footprints,
  Bike,
  Utensils,
  Mountain,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { WeatherAdvice, TemperatureUnit } from '../types/weather';

interface ActivityRecommendationsProps {
  advice: WeatherAdvice;
  tempUnit: TemperatureUnit;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Footprints,
  Bike,
  Utensils,
  Sun,
  Sparkles,
  Mountain,
};

export const ActivityRecommendations: React.FC<ActivityRecommendationsProps> = ({
  advice,
}) => {
  return (
    <div className="rounded-3xl p-6 bg-slate-900 border border-slate-800 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Planning & Activity Intelligence
            </h3>
            <p className="text-xs text-slate-500">
              Rule-based outdoor suitability & practical environmental advice
            </p>
          </div>
        </div>
      </div>

      {/* 1. Practical Rule-Based Advice Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-8">
        {/* Rain / Umbrella Card */}
        <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 text-slate-200">
          <div className="flex items-center gap-2.5 font-bold text-xs uppercase tracking-wider mb-2 text-cyan-400">
            <Umbrella className="w-4 h-4" />
            <span>Precipitation Protection</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-300">
            {advice.rainAdvice}
          </p>
        </div>

        {/* Temperature Advice Card */}
        <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 text-slate-200">
          <div className="flex items-center gap-2.5 font-bold text-xs uppercase tracking-wider mb-2 text-amber-400">
            <Thermometer className="w-4 h-4" />
            <span>Thermal Comfort</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-300">
            {advice.tempAdvice}
          </p>
        </div>

        {/* Wind Condition Card */}
        <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 text-slate-200">
          <div className="flex items-center gap-2.5 font-bold text-xs uppercase tracking-wider mb-2 text-emerald-400">
            <Wind className="w-4 h-4" />
            <span>Wind & Air Mobility</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-300">
            {advice.windAdvice}
          </p>
        </div>

        {/* UV Sun Exposure Card */}
        <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 text-slate-200">
          <div className="flex items-center gap-2.5 font-bold text-xs uppercase tracking-wider mb-2 text-orange-400">
            <Sun className="w-4 h-4" />
            <span>UV Sun Safety</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-300">
            {advice.uvAdvice}
          </p>
        </div>
      </div>

      {/* 2. Outdoor Activity Suitability Scorecard */}
      <div>
        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3.5 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-indigo-400" /> Outdoor Activity Index Scorecard
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {advice.activityScores.map((act) => {
            const IconComp = ICON_MAP[act.iconName] || Activity;

            // Score badge color
            let statusBadgeClass =
              'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            let scoreBarColor = 'from-emerald-500 to-teal-400';

            if (act.score < 4) {
              statusBadgeClass =
                'bg-rose-500/10 text-rose-400 border-rose-500/20';
              scoreBarColor = 'from-rose-500 to-red-400';
            } else if (act.score < 7) {
              statusBadgeClass =
                'bg-amber-500/10 text-amber-400 border-amber-500/20';
              scoreBarColor = 'from-amber-500 to-orange-400';
            }

            return (
              <div
                key={act.name}
                className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 font-bold text-sm text-white">
                      <div className="p-1.5 rounded-lg bg-slate-800 text-indigo-400 border border-slate-700">
                        <IconComp className="w-4 h-4" />
                      </div>
                      <span>{act.name}</span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadgeClass}`}
                    >
                      {act.status} ({act.score}/10)
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-1 mb-3">
                    {act.reason}
                  </p>
                </div>

                {/* Score Progress Bar */}
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${scoreBarColor} transition-all duration-500`}
                    style={{ width: `${act.score * 10}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
