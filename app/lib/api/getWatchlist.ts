import { STOCKBIT_API_BASE } from "./components";
import { createAuthHeaders } from "./authHeader";
import { StockbitAuthInfo } from "./components";

export async function getWatchlist(auth: StockbitAuthInfo) {
  const response = await fetch(
    `${STOCKBIT_API_BASE}/watchlist?page=1&limit=500`,
    {
      method: "GET",
      headers: createAuthHeaders(auth),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Watchlist error response:", errorBody);
    throw new Error(
      `Failed to fetch watchlist: ${response.status} ${response.statusText}`
    );
  }

  const response_json = await response.json();
  const watchlistId = await response_json.data[0].watchlist_id;

  const watchlist = await fetch(
    `${STOCKBIT_API_BASE}/watchlist/${watchlistId}?page=1&limit=500&setfincol=1`,
    {
      method: "GET",
      headers: createAuthHeaders(auth),
    }
  )

  return watchlist.json();
}