import {
  WeatherData,
  DailyForecastItem,
  HourlyForecastItem,
  TemperatureUnit,
  WeatherAdvice,
  ActivityScore,
} from '../types/weather';
import { getWeatherCondition } from './weatherCodes';

/**
 * Convert Celsius to Fahrenheit
 */
export function cToF(c: number): number {
  return Math.round((c * 9) / 5 + 32);
}

/**
 * Format temperature string with unit symbol
 */
export function formatTemp(tempC: number, unit: TemperatureUnit): string {
  if (tempC === undefined || tempC === null || isNaN(tempC)) return '--°';
  const val = unit === 'f' ? cToF(tempC) : Math.round(tempC);
  return `${val}°${unit.toUpperCase()}`;
}

/**
 * Format wind speed in km/h or mph
 */
export function formatWindSpeed(kmh: number, unit: TemperatureUnit): string {
  if (unit === 'f') {
    const mph = Math.round(kmh * 0.621371);
    return `${mph} mph`;
  }
  return `${Math.round(kmh)} km/h`;
}

/**
 * Convert wind direction degree angle (0-360) to compass direction
 */
export function getWindDirectionLabel(deg: number): string {
  if (deg === undefined || deg === null) return 'N/A';
  const val = Math.floor(deg / 22.5 + 0.5);
  const directions = [
    'N',
    'NNE',
    'NE',
    'ENE',
    'E',
    'ESE',
    'SE',
    'SSE',
    'S',
    'SSW',
    'SW',
    'WSW',
    'W',
    'WNW',
    'NW',
    'NNW',
  ];
  return directions[val % 16];
}

/**
 * Get UV Index risk classification level
 */
export function getUvRiskLevel(uv: number): {
  level: string;
  color: string;
  advice: string;
} {
  if (uv <= 2) {
    return {
      level: 'Low',
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      advice: 'Minimal sun hazard. Safe to stay outdoors.',
    };
  } else if (uv <= 5) {
    return {
      level: 'Moderate',
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      advice: 'Moderate hazard. Seek shade during midday hours.',
    };
  } else if (uv <= 7) {
    return {
      level: 'High',
      color: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
      advice: 'High UV risk! Wear SPF 30+ sunscreen, hat and sunglasses.',
    };
  } else if (uv <= 10) {
    return {
      level: 'Very High',
      color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
      advice: 'Very high UV hazard! Avoid direct sun exposure between 10am - 4pm.',
    };
  } else {
    return {
      level: 'Extreme',
      color: 'text-purple-600 bg-purple-500/10 border-purple-500/20',
      advice: 'Extreme UV! Unprotected skin can burn in minutes.',
    };
  }
}

/**
 * Format ISO Date string to Day Name (e.g. "Monday", "Tue")
 */
export function formatDayName(dateStr: string, format: 'short' | 'long' = 'short'): string {
  const date = new Date(dateStr + 'T00:00:00');
  return new Intl.DateTimeFormat('en-US', { weekday: format }).format(date);
}

/**
 * Format ISO Date string to "MMM D" e.g., "Aug 1"
 */
export function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
}

/**
 * Generate smart rule-based recommendations & activity scores based on prompt rules
 */
export function generateWeatherAdvice(
  current: WeatherData['current'],
  daily0: DailyForecastItem,
  hourly24: HourlyForecastItem[]
): WeatherAdvice {
  const tempC = current.temperature;
  const windKmh = current.windSpeed;
  const rainProb = daily0 ? daily0.precipitationProbabilityMax : 0;
  const uvMax = daily0 ? daily0.uvIndexMax : 0;
  const humidity = current.humidity;

  let rainAdvice = '';
  if (rainProb >= 60 || current.precipitation > 0.5) {
    rainAdvice = `Rain expected (${rainProb}% chance). Don't forget to carry an umbrella or raincoat!`;
  } else if (rainProb >= 30) {
    rainAdvice = `Slight chance of rain (${rainProb}%). A light jacket or compact umbrella is recommended.`;
  } else {
    rainAdvice = `Low chance of rain (${rainProb}%). Clear outdoor planning ahead.`;
  }

  let tempAdvice = '';
  if (tempC > 32) {
    tempAdvice = 'Hot conditions outside. Stay hydrated, wear light clothing, and apply SPF sunscreen.';
  } else if (tempC >= 18 && tempC <= 28) {
    tempAdvice = 'Great weather for outdoor activities, walking, or a park visit.';
  } else if (tempC >= 10 && tempC < 18) {
    tempAdvice = 'Mild to brisk conditions. Layering with a light sweater or jacket works best.';
  } else if (tempC >= 0 && tempC < 10) {
    tempAdvice = 'Chilly weather! Wear a warm coat, scarf, and warm layers.';
  } else {
    tempAdvice = 'Freezing conditions! Watch out for icy ground and wear thermal insulated layers.';
  }

  let windAdvice = '';
  if (windKmh > 35) {
    windAdvice = `Very strong winds (${Math.round(windKmh)} km/h)! Be cautious driving and secure loose outdoor belongings.`;
  } else if (windKmh > 25) {
    windAdvice = `Windy conditions ahead (${Math.round(windKmh)} km/h). Be cautious if driving or planning outdoor events.`;
  } else {
    windAdvice = `Calm to gentle breeze (${Math.round(windKmh)} km/h). Pleasant outdoor conditions.`;
  }

  let uvAdvice = '';
  if (uvMax >= 7) {
    uvAdvice = `High UV max (${uvMax.toFixed(1)}). Wear UV sunglasses, a wide-brim hat, and apply sunscreen.`;
  } else if (uvMax >= 4) {
    uvAdvice = `Moderate UV intensity (${uvMax.toFixed(1)}). Sun protection recommended around midday.`;
  } else {
    uvAdvice = `Low UV exposure (${uvMax.toFixed(1)}). Minimal sun protection required.`;
  }

  // Calculate Outdoor Activity Scores (0 - 10)
  const activityScores: ActivityScore[] = [
    calculateRunningScore(tempC, rainProb, windKmh, humidity),
    calculateCyclingScore(tempC, rainProb, windKmh),
    calculateOutdoorDiningScore(tempC, rainProb, windKmh),
    calculateBeachPoolScore(tempC, rainProb, current.cloudCover),
    calculateStargazingScore(current.cloudCover, rainProb, current.isDay),
    calculateHikingScore(tempC, rainProb, windKmh, current.weatherCode),
  ];

  return {
    rainAdvice,
    tempAdvice,
    windAdvice,
    uvAdvice,
    overallSummary: `${tempAdvice} ${rainAdvice}`,
    activityScores,
  };
}

function getStatusFromScore(score: number): ActivityScore['status'] {
  if (score >= 8.5) return 'Ideal';
  if (score >= 6.5) return 'Good';
  if (score >= 4.5) return 'Moderate';
  if (score >= 2.5) return 'Poor';
  return 'Not Recommended';
}

function calculateRunningScore(
  tempC: number,
  rainProb: number,
  windKmh: number,
  humidity: number
): ActivityScore {
  let score = 10;
  if (tempC < 5 || tempC > 30) score -= 3;
  else if (tempC < 10 || tempC > 25) score -= 1;
  if (rainProb > 50) score -= 4;
  else if (rainProb > 20) score -= 1.5;
  if (windKmh > 30) score -= 2.5;
  if (humidity > 85) score -= 1.5;

  score = Math.max(0, Math.min(10, Math.round(score * 10) / 10));
  return {
    name: 'Running & Jogging',
    score,
    status: getStatusFromScore(score),
    reason:
      score >= 7
        ? 'Comfortable temperatures and manageable humidity.'
        : 'Suboptimal due to temperature extremes or rain risk.',
    iconName: 'Footprints',
  };
}

function calculateCyclingScore(tempC: number, rainProb: number, windKmh: number): ActivityScore {
  let score = 10;
  if (tempC < 8 || tempC > 32) score -= 3;
  if (windKmh > 30) score -= 4;
  else if (windKmh > 20) score -= 2;
  if (rainProb > 40) score -= 4;

  score = Math.max(0, Math.min(10, Math.round(score * 10) / 10));
  return {
    name: 'Road & Park Cycling',
    score,
    status: getStatusFromScore(score),
    reason:
      windKmh > 25
        ? 'Strong headwind gusts may hinder road stability.'
        : rainProb > 40
        ? 'Slippery road conditions probable.'
        : 'Great road conditions and favorable breeze.',
    iconName: 'Bike',
  };
}

function calculateOutdoorDiningScore(
  tempC: number,
  rainProb: number,
  windKmh: number
): ActivityScore {
  let score = 10;
  if (tempC < 16 || tempC > 30) score -= 3.5;
  if (rainProb > 25) score -= 4;
  if (windKmh > 22) score -= 2.5;

  score = Math.max(0, Math.min(10, Math.round(score * 10) / 10));
  return {
    name: 'Patio & Outdoor Dining',
    score,
    status: getStatusFromScore(score),
    reason:
      rainProb > 25
        ? 'Covered indoor seating recommended.'
        : tempC >= 18 && tempC <= 26
        ? 'Balmy temperatures ideal for alfresco dining.'
        : 'Chilly or hot conditions for patio seating.',
    iconName: 'Utensils',
  };
}

function calculateBeachPoolScore(
  tempC: number,
  rainProb: number,
  cloudCover: number
): ActivityScore {
  let score = 10;
  if (tempC < 24) score -= (24 - tempC) * 0.8;
  if (cloudCover > 60) score -= 2.5;
  if (rainProb > 30) score -= 4;

  score = Math.max(0, Math.min(10, Math.round(score * 10) / 10));
  return {
    name: 'Beach & Swimming',
    score,
    status: getStatusFromScore(score),
    reason:
      tempC < 22
        ? 'Too cool for swimming outdoors.'
        : cloudCover > 70
        ? 'Overcast skies reduce thermal comfort.'
        : 'Warm and sunny condition for water activity.',
    iconName: 'Sun',
  };
}

function calculateStargazingScore(
  cloudCover: number,
  rainProb: number,
  isDay: boolean
): ActivityScore {
  let score = 10;
  if (isDay) score -= 4; // daytime stargazing not possible
  score -= (cloudCover / 100) * 6;
  if (rainProb > 30) score -= 3;

  score = Math.max(0, Math.min(10, Math.round(score * 10) / 10));
  return {
    name: 'Night Stargazing',
    score,
    status: getStatusFromScore(score),
    reason:
      cloudCover < 20
        ? 'Crystal clear night sky ahead.'
        : cloudCover > 70
        ? 'Dense cloud cover obscuring celestial visibility.'
        : 'Partly clear skies for star viewing.',
    iconName: 'Sparkles',
  };
}

function calculateHikingScore(
  tempC: number,
  rainProb: number,
  windKmh: number,
  weatherCode: number
): ActivityScore {
  let score = 10;
  const condition = getWeatherCondition(weatherCode);
  if (condition.category === 'stormy') score = 0;
  if (rainProb > 50) score -= 4;
  if (tempC > 30 || tempC < 5) score -= 2.5;
  if (windKmh > 30) score -= 2;

  score = Math.max(0, Math.min(10, Math.round(score * 10) / 10));
  return {
    name: 'Trail Hiking',
    score,
    status: getStatusFromScore(score),
    reason:
      condition.category === 'stormy'
        ? 'Hazardous thunderstorm threat on open trails.'
        : rainProb > 40
        ? 'Muddy trails and wet rock hazards.'
        : 'Great visibility and trail conditions.',
    iconName: 'Mountain',
  };
}
