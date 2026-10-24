import { describe, it, expect, vi } from "vitest";
import { fetchWeatherForecast } from "../src/lib/weather/weatherClient";

describe("Weather Client", () => {
  it("returns fallback forecast on network failure or timeout", async () => {
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockRejectedValue(new Error("Network offline"));

    try {
      const forecast = await fetchWeatherForecast(37.77, -122.42, "Test Venue");
      expect(forecast.available).toBe(false);
      expect(forecast.source).toBe("seasonal_fallback");
      expect(forecast.rainProbabilityPercent).toBe(30);
      expect(forecast.locationName).toBe("Test Venue");
    } finally {
      global.fetch = originalFetch;
    }
  });

  it("parses weather forecast data correctly when API succeeds", async () => {
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        daily: {
          precipitation_probability_mean: [65],
          precipitation_sum: [12.4],
          temperature_2m_max: [19],
        },
      }),
    } as unknown as Response);

    try {
      const forecast = await fetchWeatherForecast(37.77, -122.42, "Park Pavilion");
      expect(forecast.available).toBe(true);
      expect(forecast.source).toBe("live");
      expect(forecast.rainProbabilityPercent).toBe(65);
      expect(forecast.summary).toContain("High risk of precipitation");
    } finally {
      global.fetch = originalFetch;
    }
  });
});
