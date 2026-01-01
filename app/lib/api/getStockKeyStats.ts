import { STOCKBIT_API_BASE } from "./components";
import { createAuthHeaders } from "./authHeader";
import { StockbitAuthInfo } from "./components";

export async function getStockKeyStats(auth: StockbitAuthInfo, symbol: string) {
  const response = await fetch(
    `${STOCKBIT_API_BASE}/keystats/ratio/v1/${symbol}?year_limit=10`,
    {
      method: "GET",
      headers: createAuthHeaders(auth),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch key stats: ${response.statusText}`);
  }

  return response.json();
}