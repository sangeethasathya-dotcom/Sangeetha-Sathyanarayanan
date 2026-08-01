export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  feature_code?: string;
  country_code?: string;
  country?: string;
  admin1?: string;
  admin2?: string;
  timezone?: string;
  population?: number;
}

export type TemperatureUnit = 'c' | 'f';

export interface CurrentWeather {
  time: string;
  temperature: number; // °C
  apparentTemperature: number; // °C
  humidity: number; // %
  isDay: boolean;
  precipitation: number; // mm
  weatherCode: number;
  cloudCover: number; // %
  pressure: number; // hPa
  windSpeed: number; // km/h
  windDirection: number; // degrees
  windGusts: number; // km/h
}

export interface DailyForecastItem {
  date: string; // YYYY-MM-DD
  dayName: string;
  weatherCode: number;
  tempMax: number; // °C
  tempMin: number; // °C
  apparentMax: number;
  apparentMin: number;
  sunrise: string;
  sunset: string;
  uvIndexMax: number;
  precipitationSum: number; // mm
  precipitationProbabilityMax: number; // %
  windSpeedMax: number; // km/h
  windDirectionDominant: number;
}

export interface HourlyForecastItem {
  time: string; // ISO format or HH:mm
  rawTime: string;
  hourLabel: string;
  temperature: number; // °C
  apparentTemperature: number;
  humidity: number;
  precipitationProbability: number; // %
  precipitation: number;
  weatherCode: number;
  pressure: number;
  cloudCover: number;
  visibility: number; // meters
  windSpeed: number; // km/h
  uvIndex: number;
  isDay: boolean;
}

export interface WeatherData {
  location: GeocodingResult;
  current: CurrentWeather;
  daily: DailyForecastItem[];
  hourly: HourlyForecastItem[];
  timezone: string;
  updatedAt: Date;
}

export interface ActivityScore {
  name: string;
  score: number; // 0 - 10
  status: 'Ideal' | 'Good' | 'Moderate' | 'Poor' | 'Not Recommended';
  reason: string;
  iconName: string;
}

export interface WeatherAdvice {
  rainAdvice?: string;
  tempAdvice?: string;
  windAdvice?: string;
  uvAdvice?: string;
  humidityAdvice?: string;
  overallSummary: string;
  activityScores: ActivityScore[];
}
