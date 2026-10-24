import { NextRequest, NextResponse } from "next/server";
import { fetchWeatherForecast } from "@/lib/weather/weatherClient";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const lat = parseFloat(searchParams.get("lat") || "37.7749");
  const lon = parseFloat(searchParams.get("lon") || "-122.4194");
  const name = searchParams.get("name") || "Event Location";

  const forecast = await fetchWeatherForecast(lat, lon, name);
  return NextResponse.json(forecast, {
    status: 200,
    headers: { "Cache-Control": "public, s-maxage=1800" },
  });
}
