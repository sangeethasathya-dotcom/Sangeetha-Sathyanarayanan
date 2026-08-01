import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Bot, AlertCircle } from 'lucide-react';
import { WeatherData } from '../types/weather';

interface AiWeatherBriefingProps {
  weather: WeatherData;
}

export const AiWeatherBriefing: React.FC<AiWeatherBriefingProps> = ({ weather }) => {
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAiSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: weather.location,
          current: weather.current,
          daily: weather.daily,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch AI briefing.');
      }

      setSummary(data.summary || 'AI Briefing ready.');
    } catch (err: any) {
      console.warn('AI Summary API notice:', err);
      setError(err.message || 'Unable to connect to AI server briefing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAiSummary();
  }, [weather.location.name]);

  return (
    <div className="relative overflow-hidden rounded-3xl p-6 bg-slate-900 border border-indigo-500/30 shadow-2xl text-white">
      {/* Decorative AI Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 blur-3xl rounded-full pointer-events-none" />

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Bot className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Aether AI Synthesis Engine
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Gemini Pro
              </span>
            </div>
            <p className="text-xs text-slate-400">
              High-density intelligence brief for {weather.location.name}
            </p>
          </div>
        </div>

        <button
          onClick={fetchAiSummary}
          disabled={loading}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 transition-colors disabled:opacity-50 flex items-center gap-1.5 text-xs font-bold"
          title="Regenerate AI Weather Briefing"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Re-Synthesize</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="relative z-10">
        {loading ? (
          <div className="py-8 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-indigo-300 font-medium animate-pulse">
              Synthesizing real-time atmospheric telemetry & outfit directives...
            </p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{error}</p>
              <p className="text-[11px] opacity-80 mt-0.5">
                Ensure GEMINI_API_KEY secret is configured or click Re-Synthesize to try again.
              </p>
            </div>
          </div>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none text-slate-200 text-xs sm:text-sm leading-relaxed space-y-2">
            {summary.split('\n\n').map((paragraph, i) => (
              <p key={i} className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
                {paragraph.split('**').map((part, index) =>
                  index % 2 === 1 ? (
                    <strong key={index} className="text-indigo-400 font-bold">
                      {part}
                    </strong>
                  ) : (
                    part
                  )
                )}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
