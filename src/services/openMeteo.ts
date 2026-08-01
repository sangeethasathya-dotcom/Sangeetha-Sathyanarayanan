import { GeocodingResult, WeatherData, DailyForecastItem, HourlyForecastItem } from '../types/weather';
import { formatDayName } from '../utils/weatherUtils';

const GEOCODING_API_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_API_URL = 'https://api.open-meteo.com/v1/forecast';

/**
 * Search cities using Open-Meteo Geocoding API
 */
export async function searchCities(query: string): Promise<GeocodingResult[]> {
  if (!query || query.trim().length < 2) return [];

  const url = `${GEOCODING_API_URL}?name=${encodeURIComponent(query.trim())}&count=10&language=en&format=json`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Geocoding search failed: ${res.statusText}`);
    }
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error('Error searching cities:', error);
    throw error;
  }
}

/**
 * Reverse Geocode latitude/longitude to a city name
 */
export async function reverseGeocode(lat: number, lon: number): Promise<GeocodingResult> {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const city = data.city || data.locality || data.principalSubdivision || 'Current Location';
      const country = data.countryName || '';
      const admin1 = data.principalSubdivision || '';
      return {
        id: Math.floor(Math.random() * 1000000),
        name: city,
        latitude: lat,
        longitude: lon,
        country: country,
        country_code: data.countryCode,
        admin1: admin1,
      };
    }
  } catch (err) {
    console.warn('Reverse geocoding failed, using coordinates:', err);
  }

  return {
    id: Math.floor(Math.random() * 1000000),
    name: `Location (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
    latitude: lat,
    longitude: lon,
    country: '',
  };
}

/**
 * Fetch full weather data (Current, Daily, Hourly) from Open-Meteo Forecast API
 */
export async function fetchWeatherData(
  location: GeocodingResult
): Promise<WeatherData> {
  const { latitude: lat, longitude: lon } = location;

  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'is_day',
      'precipitation',
      'weather_code',
      'cloud_cover',
      'pressure_msl',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m',
    ].join(','),
    hourly: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'precipitation_probability',
      'precipitation',
      'weather_code',
      'pressure_msl',
      'cloud_cover',
      'visibility',
      'wind_speed_10m',
      'uv_index',
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'apparent_temperature_max',
      'apparent_temperature_min',
      'sunrise',
      'sunset',
      'uv_index_max',
      'precipitation_sum',
      'precipitation_probability_max',
      'wind_speed_10m_max',
      'wind_direction_10m_dominant',
    ].join(','),
    timezone: location.timezone || 'auto',
    forecast_days: '7',
  });

  const url = `${FORECAST_API_URL}?${params.toString()}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Open-Meteo Forecast API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();

    // Map Current Weather
    const currData = data.current || {};
    const current = {
      time: currData.time || new Date().toISOString(),
      temperature: currData.temperature_2m ?? 0,
      apparentTemperature: currData.apparent_temperature ?? currData.temperature_2m ?? 0,
      humidity: currData.relative_humidity_2m ?? 0,
      isDay: currData.is_day !== undefined ? Boolean(currData.is_day) : true,
      precipitation: currData.precipitation ?? 0,
      weatherCode: currData.weather_code ?? 0,
      cloudCover: currData.cloud_cover ?? 0,
      pressure: currData.pressure_msl ?? 1013,
      windSpeed: currData.wind_speed_10m ?? 0,
      windDirection: currData.wind_direction_10m ?? 0,
      windGusts: currData.wind_gusts_10m ?? 0,
    };

    // Map Daily Forecast (7 Days)
    const dailyRaw = data.daily || {};
    const dailyTimes: string[] = dailyRaw.time || [];
    const daily: DailyForecastItem[] = dailyTimes.map((timeStr: string, idx: number) => {
      const isToday = idx === 0;
      return {
        date: timeStr,
        dayName: isToday ? 'Today' : formatDayName(timeStr, 'short'),
        weatherCode: dailyRaw.weather_code?.[idx] ?? 0,
        tempMax: dailyRaw.temperature_2m_max?.[idx] ?? 0,
        tempMin: dailyRaw.temperature_2m_min?.[idx] ?? 0,
        apparentMax: dailyRaw.apparent_temperature_max?.[idx] ?? 0,
        apparentMin: dailyRaw.apparent_temperature_min?.[idx] ?? 0,
        sunrise: dailyRaw.sunrise?.[idx] || '',
        sunset: dailyRaw.sunset?.[idx] || '',
        uvIndexMax: dailyRaw.uv_index_max?.[idx] ?? 0,
        precipitationSum: dailyRaw.precipitation_sum?.[idx] ?? 0,
        precipitationProbabilityMax: dailyRaw.precipitation_probability_max?.[idx] ?? 0,
        windSpeedMax: dailyRaw.wind_speed_10m_max?.[idx] ?? 0,
        windDirectionDominant: dailyRaw.wind_direction_10m_dominant?.[idx] ?? 0,
      };
    });

    // Map Hourly Forecast (up to 168 hours = 7 days)
    const hourlyRaw = data.hourly || {};
    const hourlyTimes: string[] = hourlyRaw.time || [];
    const hourly: HourlyForecastItem[] = hourlyTimes.map((timeStr: string, idx: number) => {
      const dateObj = new Date(timeStr);
      const hours = dateObj.getHours();
      const hourLabel = `${hours.toString().padStart(2, '0')}:00`;
      const isDay = hours >= 6 && hours < 20;

      return {
        time: timeStr,
        rawTime: timeStr,
        hourLabel,
        temperature: hourlyRaw.temperature_2m?.[idx] ?? 0,
        apparentTemperature: hourlyRaw.apparent_temperature?.[idx] ?? 0,
        humidity: hourlyRaw.relative_humidity_2m?.[idx] ?? 0,
        precipitationProbability: hourlyRaw.precipitation_probability?.[idx] ?? 0,
        precipitation: hourlyRaw.precipitation?.[idx] ?? 0,
        weatherCode: hourlyRaw.weather_code?.[idx] ?? 0,
        pressure: hourlyRaw.pressure_msl?.[idx] ?? 1013,
        cloudCover: hourlyRaw.cloud_cover?.[idx] ?? 0,
        visibility: hourlyRaw.visibility?.[idx] ?? 10000,
        windSpeed: hourlyRaw.wind_speed_10m?.[idx] ?? 0,
        uvIndex: hourlyRaw.uv_index?.[idx] ?? 0,
        isDay,
      };
    });

    return {
      location,
      current,
      daily,
      hourly,
      timezone: data.timezone || 'UTC',
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error('Error fetching weather data from Open-Meteo:', error);
    throw error;
  }
}
