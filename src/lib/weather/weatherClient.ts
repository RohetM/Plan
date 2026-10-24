/**
 * Weather Client for Outdoor Event Planning.
 * Uses Open-Meteo (open API, no key required) with graceful offline fallback.
 */

export interface WeatherForecast {
  available: boolean;
  locationName: string;
  rainProbabilityPercent: number;
  precipitationMm: number;
  temperatureC: number;
  summary: string;
  source: "live" | "seasonal_fallback";
}

export async function fetchWeatherForecast(
  lat: number = 37.7749,
  lon: number = -122.4194,
  locationName: string = "Event Location"
): Promise<WeatherForecast> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=precipitation_probability_mean,precipitation_sum,temperature_2m_max&timezone=auto`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`Weather service returned ${res.status}`);
    }

    const data = await res.json();
    const rainProb = data?.daily?.precipitation_probability_mean?.[0] ?? 25;
    const precipSum = data?.daily?.precipitation_sum?.[0] ?? 0;
    const tempMax = data?.daily?.temperature_2m_max?.[0] ?? 22;

    let summary = "Mild and clear conditions expected.";
    if (rainProb > 50) {
      summary = `High risk of precipitation (${rainProb}%). Outdoor rain canopy mandatory.`;
    } else if (rainProb > 25) {
      summary = `Moderate chance of scattered showers (${rainProb}%). Have indoor transition plan ready.`;
    }

    return {
      available: true,
      locationName,
      rainProbabilityPercent: rainProb,
      precipitationMm: precipSum,
      temperatureC: tempMax,
      summary,
      source: "live",
    };
  } catch (err) {
    // Graceful offline fallback
    return {
      available: false,
      locationName,
      rainProbabilityPercent: 30, // Standard baseline planning assumption
      precipitationMm: 1.5,
      temperatureC: 21,
      summary: "Simulated seasonal weather forecast: 30% precipitation probability assumed.",
      source: "seasonal_fallback",
    };
  }
}
