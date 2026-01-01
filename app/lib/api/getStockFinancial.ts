import { STOCKBIT_API_BASE } from "./components";
import { createAuthHeaders } from "./authHeader";
import { StockbitAuthInfo } from "./components";

export async function getStockFinancials(
  auth: StockbitAuthInfo,
  symbol: string,
) {
  const response = await fetch(
    `${STOCKBIT_API_BASE}/findata-view/company/financial?symbol=${symbol}&data_type=1&report_type=1&statement_type=1`,
    {
      method: "GET",
      headers: createAuthHeaders(auth),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch financials: ${response.statusText}`);
  }

  return response.json();
}