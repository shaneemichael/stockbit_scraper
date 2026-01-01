import { STOCKBIT_API_BASE } from "./components";
import { createAuthHeaders } from "./authHeader";
import { StockbitAuthInfo } from "./components";

export async function getStockPricePerformance(auth: StockbitAuthInfo, symbol: string) {
  const response = await fetch(
    `${STOCKBIT_API_BASE}/company-price-feed/price-performance/${symbol}`,
    {
      method: "GET",
      headers: createAuthHeaders(auth),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch price performance: ${response.statusText}`);
  }

  return response.json();
}