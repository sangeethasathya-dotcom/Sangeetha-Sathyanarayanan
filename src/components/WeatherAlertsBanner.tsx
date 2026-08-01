import React from 'react';
import { AlertTriangle, ShieldAlert, Wind, Umbrella, Sun, Flame, Snowflake } from 'lucide-react';
import { WeatherData, TemperatureUnit } from '../types/weather';
import { formatWindSpeed, formatTemp } from '../utils/weatherUtils';

interface WeatherAlertsBannerProps {
  weather: WeatherData;
  tempUnit: TemperatureUnit;
}

export const WeatherAlertsBanner: React.FC<WeatherAlertsBannerProps> = ({
  weather,
  tempUnit,
}) => {
  const { current, daily } = weather;
  const alerts: { title: string; desc: string; icon: any; color: string }[] = [];

  // Heavy Rain / Storm Alert
  if (current.weatherCode >= 95) {
    alerts.push({
      title: 'Thunderstorm Hazard Alert',
      desc: 'Active lightning and heavy rain reported in the region. Seek indoor shelter.',
      icon: AlertTriangle,
      color: 'bg-purple-500/10 text-purple-600 border-purple-500/30 dark:text-purple-300',
    });
  } else if (daily[0]?.precipitationProbabilityMax >= 70 || current.precipitation >= 2.0) {
    alerts.push({
      title: 'High Precipitation & Rain Alert',
      desc: `High probability of rainfall (${daily[0]?.precipitationProbabilityMax}%). Carry rain gear and umbrella.`,
      icon: Umbrella,
      color: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30 dark:text-cyan-300',
    });
  }

  // High Wind Alert
  if (current.windSpeed > 30 || current.windGusts > 45) {
    alerts.push({
      title: 'High Wind Velocity Alert',
      desc: `Strong wind speeds recorded at ${formatWindSpeed(current.windSpeed, tempUnit)} with gusts up to ${formatWindSpeed(current.windGusts, tempUnit)}.`,
      icon: Wind,
      color: 'bg-teal-500/10 text-teal-600 border-teal-500/30 dark:text-teal-300',
    });
  }

  // High UV Alert
  if ((daily[0]?.uvIndexMax || 0) >= 8) {
    alerts.push({
      title: 'Very High UV Exposure Alert',
      desc: `Peak UV Index will reach ${(daily[0]?.uvIndexMax || 0).toFixed(1)}. Wear sun protection & limit mid-day exposure.`,
      icon: Sun,
      color: 'bg-orange-500/10 text-orange-600 border-orange-500/30 dark:text-orange-300',
    });
  }

  // Temperature Extremes Alert
  if (current.temperature > 32) {
    alerts.push({
      title: 'Extreme High Temperature Warning',
      desc: `Hot conditions reaching ${formatTemp(current.temperature, tempUnit)}. Stay hydrated in climate-controlled areas.`,
      icon: Flame,
      color: 'bg-rose-500/10 text-rose-600 border-rose-500/30 dark:text-rose-300',
    });
  } else if (current.temperature < 0) {
    alerts.push({
      title: 'Freezing Temperature & Ice Warning',
      desc: `Freezing temperatures recorded at ${formatTemp(current.temperature, tempUnit)}. Watch for icy road conditions.`,
      icon: Snowflake,
      color: 'bg-sky-500/10 text-sky-600 border-sky-500/30 dark:text-sky-300',
    });
  }

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2 mb-6">
      {alerts.map((alert, idx) => {
        const IconComponent = alert.icon;
        return (
          <div
            key={idx}
            className={`p-4 rounded-2xl border backdrop-blur-md flex items-start gap-3 shadow-md ${alert.color}`}
          >
            <div className="p-1.5 rounded-xl bg-white/20 dark:bg-black/20 flex-shrink-0">
              <IconComponent className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold tracking-tight">{alert.title}</h4>
              <p className="text-xs opacity-90 mt-0.5">{alert.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
