export interface RawWatchlistResponse {
  message: string;
  data: {
    watchlist_id: number;
    descriptions: string;
    header: string[];
    header_custom: string[];
    result: RawStockItem[];
    total: number;
    type: string;
    name: string;
    is_default: boolean;
    emoji: string;
    pagination: {
      is_last_page: boolean;
    };
    sort_by: string;
    sort_dir: string;
    sort_desc: string;
  };
}

export interface RawStockItem {
  id: string;
  symbol: string;
  name: string;
  last: string;
  previous: string;
  change: string;
  percent: string;
  volume: string;
  prices: string[];
  formatted_price: string;
  icon_url: string;
  exchange: string;
  country: string;
  type: string;
  tradeable: boolean;
  sequence_no: number;
  orderbook: {
    bid: string;
    offer: string;
  };
  corp_action: {
    active: boolean;
    icon: string;
    text: string;
  };
  uma: boolean;
  notations: string[];
  notation: string[];
  status: number;
  extra_attributes: unknown;
}

// Serialized output types
export interface SerializedStock {
  symbol: string;
  name: string;
  exchange: string;
  iconUrl: string;

  // Prices
  lastPrice: number;
  previousClose: number;
  openPrice: number;
  highPrice: number;
  lowPrice: number;

  // Changes
  change: number;
  changePercent: number;
  isPositive: boolean;
  isNegative: boolean;

  // Volume
  volume: number;
  volumeFormatted: string;

  // Intraday prices (for sparkline/chart)
  intradayPrices: number[];

  // Additional info
  bid: number | null;
  offer: number | null;
  hasCorporateAction: boolean;
  isUma: boolean;
  tradeable: boolean;
}

export interface SerializedWatchlist {
  id: number;
  name: string;
  description: string;
  totalStocks: number;
  isDefault: boolean;
  sortBy: string;
  sortDirection: string;
  stocks: SerializedStock[];
}

/**
 * Format large numbers with K, M, B suffixes
 */
function formatVolume(volume: number): string {
  if (volume >= 1_000_000_000_000) {
    return (volume / 1_000_000_000_000).toFixed(2) + "T";
  }
  if (volume >= 1_000_000_000) {
    return (volume / 1_000_000_000).toFixed(2) + "B";
  }
  if (volume >= 1_000_000) {
    return (volume / 1_000_000).toFixed(2) + "M";
  }
  if (volume >= 1_000) {
    return (volume / 1_000).toFixed(2) + "K";
  }
  return volume.toString();
}

/**
 * Parse a numeric string, returning 0 if invalid
 */
function parseNumber(value: string | undefined | null): number {
  if (!value) return 0;
  const cleaned = value.replace(/[+,]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Serialize a single stock item
 */
export function serializeStock(raw: RawStockItem): SerializedStock {
  const lastPrice = parseNumber(raw.last);
  const previousClose = parseNumber(raw.previous);
  const change = parseNumber(raw.change);
  const changePercent = parseNumber(raw.percent);
  const volume = parseNumber(raw.volume);

  // Parse intraday prices
  const intradayPrices = (raw.prices || []).map((p) => parseNumber(p));

  // Calculate high, low, open from intraday prices
  const openPrice = intradayPrices.length > 0 ? intradayPrices[0] : lastPrice;
  const highPrice =
    intradayPrices.length > 0 ? Math.max(...intradayPrices) : lastPrice;
  const lowPrice =
    intradayPrices.length > 0 ? Math.min(...intradayPrices) : lastPrice;

  return {
    symbol: raw.symbol,
    name: raw.name,
    exchange: raw.exchange,
    iconUrl: raw.icon_url,

    // Prices
    lastPrice,
    previousClose,
    openPrice,
    highPrice,
    lowPrice,

    // Changes
    change,
    changePercent,
    isPositive: change > 0,
    isNegative: change < 0,

    // Volume
    volume,
    volumeFormatted: formatVolume(volume),

    // Intraday prices
    intradayPrices,

    // Additional info
    bid: raw.orderbook?.bid ? parseNumber(raw.orderbook.bid) : null,
    offer: raw.orderbook?.offer ? parseNumber(raw.orderbook.offer) : null,
    hasCorporateAction: raw.corp_action?.active ?? false,
    isUma: raw.uma ?? false,
    tradeable: raw.tradeable ?? true,
  };
}

export function serializeWatchlist(
  raw: RawWatchlistResponse
): SerializedWatchlist {
  const data = raw.data;

  return {
    id: data.watchlist_id,
    name: data.name,
    description: data.descriptions,
    totalStocks: data.total,
    isDefault: data.is_default,
    sortBy: data.sort_by,
    sortDirection: data.sort_dir,
    stocks: (data.result || []).map(serializeStock),
  };
}

export interface StockSummary {
  symbol: string;
  name: string;
  openPrice: number;
  closePrice: number;
  change: number;
  changePercent: number;
  volume: string;
  trend: "up" | "down" | "flat";
}

export function serializeWatchlistSummary(
  raw: RawWatchlistResponse
): StockSummary[] {
  return (raw.data.result || []).map((stock) => {
    const change = parseNumber(stock.change);
    return {
      icon: stock.icon_url,
      symbol: stock.symbol,
      name: stock.name,
      openPrice: parseNumber(stock.previous),
      closePrice: parseNumber(stock.last),
      change,
      changePercent: parseNumber(stock.percent),
      volume: formatVolume(parseNumber(stock.volume)),
      trend: change > 0 ? "up" : change < 0 ? "down" : "flat",
    };
  });
}
