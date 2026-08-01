import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  MapPin,
  Sun,
  Moon,
  Sparkles,
  X,
  Clock,
  Compass,
  CloudSun,
} from 'lucide-react';
import { GeocodingResult, TemperatureUnit } from '../types/weather';
import { searchCities } from '../services/openMeteo';

interface NavbarProps {
  onSelectCity: (city: GeocodingResult) => void;
  onUseLocation: () => void;
  tempUnit: TemperatureUnit;
  onToggleUnit: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isLoadingLocation: boolean;
  currentCityName?: string;
}

const POPULAR_CITIES = [
  { name: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278 },
  { name: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.006 },
  { name: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503 },
  { name: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522 },
  { name: 'Sydney', country: 'Australia', latitude: -33.8688, longitude: 151.2093 },
  { name: 'Mumbai', country: 'India', latitude: 19.076, longitude: 72.8777 },
  { name: 'Dubai', country: 'United Arab Emirates', latitude: 25.2048, longitude: 55.2708 },
];

export const Navbar: React.FC<NavbarProps> = ({
  onSelectCity,
  onUseLocation,
  tempUnit,
  onToggleUnit,
  isDarkMode,
  onToggleDarkMode,
  isLoadingLocation,
  currentCityName,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<GeocodingResult[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('recent_city_searches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search for city geocoding
  useEffect(() => {
    if (!searchTerm.trim() || searchTerm.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchCities(searchTerm);
        setSearchResults(results);
        setIsOpen(true);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSelect = (city: GeocodingResult) => {
    onSelectCity(city);
    setSearchTerm('');
    setIsOpen(false);

    // Save to recent searches
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.id !== city.id);
      const updated = [city, ...filtered].slice(0, 5);
      localStorage.setItem('recent_city_searches', JSON.stringify(updated));
      return updated;
    });
  };

  const handleQuickCity = (city: typeof POPULAR_CITIES[0]) => {
    handleSelect({
      id: Math.floor(Math.random() * 1000000),
      name: city.name,
      country: city.country,
      latitude: city.latitude,
      longitude: city.longitude,
    });
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#0b0e14]/90 dark:bg-[#0b0e14]/90 border-b border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Logo & Branding */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <CloudSun className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">
                  AETHER <span className="text-indigo-400">INTELLIGENCE</span>
                </h1>
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-semibold">
                  Meteorological Data Engine v2.4
                </p>
              </div>
            </div>

            {/* Mobile Actions Toggle */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={onToggleUnit}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 text-xs font-bold text-slate-200 border border-slate-800"
              >
                °{tempUnit.toUpperCase()}
              </button>
              <button
                onClick={onToggleDarkMode}
                className="p-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-800"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
              </button>
            </div>
          </div>

          {/* City Search Bar with Geocoding Dropdown */}
          <div className="relative w-full md:max-w-md" ref={dropdownRef}>
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search city or location (e.g., Tokyo, London)..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                className="w-full pl-10 pr-24 py-2 bg-slate-900 text-sm text-slate-200 placeholder-slate-500 rounded-full border border-slate-800 focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
              />

              <div className="absolute right-12 hidden sm:flex items-center gap-1 pointer-events-none">
                <span className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] text-slate-400 border border-slate-700 font-mono">
                  ⌘ K
                </span>
              </div>

              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-12 p-1 rounded-full text-slate-400 hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* GPS Geolocation Button */}
              <button
                onClick={onUseLocation}
                disabled={isLoadingLocation}
                title="Use Current GPS Location"
                className="absolute right-2 p-1.5 rounded-full bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors disabled:opacity-50"
              >
                <MapPin className={`w-4 h-4 ${isLoadingLocation ? 'animate-bounce' : ''}`} />
              </button>
            </div>

            {/* Dropdown Suggestions */}
            {isOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-80 overflow-y-auto divide-y divide-slate-800/80">
                {/* Search Loading */}
                {isSearching && (
                  <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    Querying engine...
                  </div>
                )}

                {/* Search Results */}
                {!isSearching && searchResults.length > 0 && (
                  <div className="py-2">
                    <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                      Matching Cities
                    </div>
                    {searchResults.map((city) => (
                      <button
                        key={city.id}
                        onClick={() => handleSelect(city)}
                        className="w-full text-left px-4 py-2.5 hover:bg-slate-800/80 transition-colors flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2.5">
                          <Compass className="w-4 h-4 text-indigo-400" />
                          <div>
                            <div className="text-sm font-medium text-slate-100 group-hover:text-indigo-300">
                              {city.name}
                            </div>
                            <div className="text-xs text-slate-400">
                              {[city.admin1, city.country].filter(Boolean).join(', ')}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {city.latitude.toFixed(1)}°, {city.longitude.toFixed(1)}°
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* No Search Results */}
                {!isSearching && searchTerm.length >= 2 && searchResults.length === 0 && (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No location data found for "{searchTerm}".
                  </div>
                )}

                {/* Recent Searches */}
                {!searchTerm && recentSearches.length > 0 && (
                  <div className="py-2">
                    <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-slate-500 uppercase flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-indigo-400" /> Recent Queries
                    </div>
                    {recentSearches.map((city) => (
                      <button
                        key={city.id}
                        onClick={() => handleSelect(city)}
                        className="w-full text-left px-4 py-2 hover:bg-slate-800/60 transition-colors flex items-center justify-between"
                      >
                        <span className="text-xs font-medium text-slate-300">
                          {city.name}, {city.country}
                        </span>
                        <span className="text-[10px] text-slate-500">History</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Popular Quick Cities */}
                {!searchTerm && (
                  <div className="p-3 bg-slate-900/60">
                    <div className="text-[10px] font-bold tracking-wider text-slate-500 uppercase mb-2">
                      Frequent Nodes
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {POPULAR_CITIES.map((c) => (
                        <button
                          key={c.name}
                          onClick={() => handleQuickCity(c)}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:border-indigo-500 hover:text-indigo-300 transition-colors"
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop Controls: Unit Switcher & Dark Mode Toggle */}
          <div className="hidden md:flex items-center gap-3">
            {/* °C / °F Segmented Toggle */}
            <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800 text-[11px] font-bold">
              <button
                onClick={() => tempUnit !== 'c' && onToggleUnit()}
                className={`px-3 py-1 rounded transition-all ${
                  tempUnit === 'c'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-200'
                }`}
              >
                °C
              </button>
              <button
                onClick={() => tempUnit !== 'f' && onToggleUnit()}
                className={`px-3 py-1 rounded transition-all ${
                  tempUnit === 'f'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-200'
                }`}
              >
                °F
              </button>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-800 hover:border-indigo-500 transition-colors"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-400" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
