import React from 'react';
import { AlertCircle, RefreshCw, MapPin, Search } from 'lucide-react';

interface ErrorFallbackProps {
  message: string;
  onRetry: () => void;
  onSelectPopularCity: (name: string, lat: number, lon: number) => void;
}

const POPULAR_CITIES = [
  { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
  { name: 'London', lat: 51.5074, lon: -0.1278 },
  { name: 'New York', lat: 40.7128, lon: -74.006 },
  { name: 'Sydney', lat: -33.8688, lon: 151.2093 },
];

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  message,
  onRetry,
  onSelectPopularCity,
}) => {
  return (
    <div className="max-w-xl mx-auto my-12 p-8 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-xl text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
        <AlertCircle className="w-8 h-8 animate-bounce" />
      </div>

      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
        Unable to Load Weather Data
      </h3>

      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
        {message || 'Network error or city not found. Please try again or select a popular city below.'}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
        <button
          onClick={onRetry}
          className="px-5 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-lg shadow-sky-500/25 transition-all flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
          Or Select a Popular Location
        </span>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {POPULAR_CITIES.map((c) => (
            <button
              key={c.name}
              onClick={() => onSelectPopularCity(c.name, c.lat, c.lon)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-700 hover:text-sky-600 transition-colors flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5 text-sky-500" />
              {c.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
