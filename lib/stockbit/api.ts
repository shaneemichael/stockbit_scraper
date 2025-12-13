/**
 * Stockbit API client
 * Uses the auth token obtained from login to fetch data
 */

const STOCKBIT_API_BASE = "https://exodus.stockbit.com";

export interface StockbitAuthInfo {
  accessToken: string;
  cookies?: string;
}

/**
 * Create headers for authenticated Stockbit API requests
 */
export function createAuthHeaders(auth: StockbitAuthInfo): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  };

  if (auth.accessToken) {
    headers["Authorization"] = `Bearer ${auth.accessToken}`;
  }

  if (auth.cookies) {
    headers["Cookie"] = auth.cookies;
  }

  return headers;
}

/**
 * Fetch stock company profile
 */
export async function getStockProfile(auth: StockbitAuthInfo, symbol: string) {
  const response = await fetch(
    `${STOCKBIT_API_BASE}/v2.4/company/profile/${symbol}`,
    {
      method: "GET",
      headers: createAuthHeaders(auth),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch stock profile: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch stock price/quote data
 */
export async function getStockQuote(auth: StockbitAuthInfo, symbol: string) {
  const response = await fetch(
    `${STOCKBIT_API_BASE}/v2.4/quote/${symbol}`,
    {
      method: "GET",
      headers: createAuthHeaders(auth),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch stock quote: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch stock financial data
 */
export async function getStockFinancials(
  auth: StockbitAuthInfo,
  symbol: string,
  type: "annual" | "quarterly" = "annual"
) {
  const response = await fetch(
    `${STOCKBIT_API_BASE}/v2.4/company/financials/${symbol}?type=${type}`,
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

/**
 * Fetch stock key statistics
 */
export async function getStockKeyStats(auth: StockbitAuthInfo, symbol: string) {
  const response = await fetch(
    `${STOCKBIT_API_BASE}/v2.4/company/keystats/${symbol}`,
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

/**
 * Fetch stream/posts for a stock symbol
 */
export async function getStockStream(
  auth: StockbitAuthInfo,
  symbol: string,
  limit: number = 20
) {
  const response = await fetch(
    `${STOCKBIT_API_BASE}/v2.4/stream/symbol/${symbol}?limit=${limit}`,
    {
      method: "GET",
      headers: createAuthHeaders(auth),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch stream: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Search stocks
 */
export async function searchStocks(auth: StockbitAuthInfo, query: string) {
  const response = await fetch(
    `${STOCKBIT_API_BASE}/v2.4/search?q=${encodeURIComponent(query)}`,
    {
      method: "GET",
      headers: createAuthHeaders(auth),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to search stocks: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch watchlist
 */
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

/**
 * Refresh access token response
 */
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<RefreshTokenResponse> {
  const response = await fetch("https://api.stockbit.com/v1/refresh-token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Refresh token error response:", errorBody);
    throw new Error(
      `Failed to refresh token: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  return {
    accessToken: data.data?.access_token || data.access_token,
    refreshToken: data.data?.refresh_token || data.refresh_token,
    expiresIn: data.data?.expires_in || data.expires_in || 300,
  };
}

/**
 * Broker activity options
 */
export interface BrokerActivityOptions {
  brokerCode: string;
  page?: number;
  limit?: number;
  transactionType?: "TRANSACTION_TYPE_NET" | "TRANSACTION_TYPE_BUY" | "TRANSACTION_TYPE_SELL";
  marketBoard?: "MARKET_BOARD_REGULER" | "MARKET_BOARD_TUNAI" | "MARKET_BOARD_NEGO";
  investorType?: "INVESTOR_TYPE_ALL" | "INVESTOR_TYPE_DOMESTIC" | "INVESTOR_TYPE_FOREIGN";
  startDate?: string; // Format: YYYY-MM-DD
  endDate?: string;   // Format: YYYY-MM-DD
}

/**
 * Fetch broker activity detail
 */
export async function getBrokerActivity(
  auth: StockbitAuthInfo,
  options: BrokerActivityOptions
) {
  const {
    brokerCode,
    page = 1,
    limit = 50,
    transactionType = "TRANSACTION_TYPE_NET",
    marketBoard = "MARKET_BOARD_REGULER",
    investorType = "INVESTOR_TYPE_ALL",
    startDate,
    endDate,
  } = options;

  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    transaction_type: transactionType,
    market_board: marketBoard,
    investor_type: investorType,
  });

  // Add date range if provided
  if (startDate) {
    params.set("from", startDate);
  }
  if (endDate) {
    params.set("to", endDate);
  }

  const response = await fetch(
    `${STOCKBIT_API_BASE}/findata-view/marketdetectors/activity/${brokerCode}/detail?${params}`,
    {
      method: "GET",
      headers: createAuthHeaders(auth),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Broker activity error response:", errorBody);
    throw new Error(
      `Failed to fetch broker activity: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}
