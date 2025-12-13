/**
 * Broker Activity Serializer
 * Transforms raw broker activity API response to a cleaner format
 */

// Raw types from API
export interface RawBrokerActivityResponse {
  message: string;
  data: {
    bandar_detector: RawBandarDetector;
    broker_summary: {
      brokers_buy: RawBrokerBuy[];
      brokers_sell: RawBrokerSell[];
      symbol: string;
    };
    from: string;
    to: string;
    broker_code: string;
    broker_name: string;
  };
}

export interface RawBandarDetector {
  average: number;
  avg: RawAccDistInfo;
  avg5: RawAccDistInfo;
  broker_accdist: string;
  number_broker_buysell: number;
  top1: RawAccDistInfo;
  top3: RawAccDistInfo;
  top5: RawAccDistInfo;
  top10: RawAccDistInfo;
  total_buyer: number;
  total_seller: number;
  value: number;
  volume: number;
}

export interface RawAccDistInfo {
  accdist: string;
  amount: number;
  percent: number;
  vol: number;
}

export interface RawBrokerBuy {
  blot: string; // Buy lot (scientific notation string)
  blotv: string;
  bval: string; // Buy value (scientific notation string)
  bvalv: string;
  netbs_broker_code: string;
  netbs_buy_avg_price: string;
  netbs_date: string;
  netbs_stock_code: string;
  type: string; // "Lokal" or "Asing"
}

export interface RawBrokerSell {
  netbs_broker_code: string;
  netbs_date: string;
  netbs_sell_avg_price: string;
  netbs_stock_code: string;
  slot: string; // Sell lot (negative, scientific notation)
  slotv: string;
  sval: string; // Sell value (negative, scientific notation)
  svalv: string;
  type: string;
}

// Serialized types
export interface SerializedBrokerTransaction {
  stockCode: string;
  brokerCode: string;
  date: string;
  type: "Lokal" | "Asing";

  // Buy side
  buyLot: number;
  buyValue: number;
  buyAvgPrice: number;

  // Sell side
  sellLot: number;
  sellValue: number;
  sellAvgPrice: number;

  // Net
  netLot: number;
  netValue: number;

  // Formatted values
  buyValueFormatted: string;
  sellValueFormatted: string;
  netValueFormatted: string;
  buyAvgPriceFormatted: string;
  sellAvgPriceFormatted: string;
}

export interface SerializedBandarDetector {
  averagePrice: number;
  totalValue: number;
  totalVolume: number;
  totalBuyers: number;
  totalSellers: number;
  brokerAccDist: string;

  // Aggregated stats
  average: {
    accDist: string;
    amount: number;
    percent: number;
    volume: number;
  };
  average5Day: {
    accDist: string;
    amount: number;
    percent: number;
    volume: number;
  };
  top1: {
    accDist: string;
    amount: number;
    percent: number;
    volume: number;
  };
  top3: {
    accDist: string;
    amount: number;
    percent: number;
    volume: number;
  };
  top5: {
    accDist: string;
    amount: number;
    percent: number;
    volume: number;
  };
  top10: {
    accDist: string;
    amount: number;
    percent: number;
    volume: number;
  };
}

export interface SerializedBrokerActivity {
  brokerCode: string;
  brokerName: string;
  dateFrom: string;
  dateTo: string;

  // Summary stats
  bandarDetector: SerializedBandarDetector;

  // Buy transactions
  buyTransactions: SerializedBrokerTransaction[];
  totalBuyValue: number;
  totalBuyLot: number;

  // Sell transactions
  sellTransactions: SerializedBrokerTransaction[];
  totalSellValue: number;
  totalSellLot: number;

  // Net
  netValue: number;
  netLot: number;

  // Formatted totals
  totalBuyValueFormatted: string;
  totalSellValueFormatted: string;
  netValueFormatted: string;
}

/**
 * Format large numbers with K, M, B, T suffixes
 */
function formatValue(value: number): string {
  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (absValue >= 1e12) {
    return sign + (absValue / 1e12).toFixed(2) + "T";
  }
  if (absValue >= 1e9) {
    return sign + (absValue / 1e9).toFixed(2) + "B";
  }
  if (absValue >= 1e6) {
    return sign + (absValue / 1e6).toFixed(2) + "M";
  }
  if (absValue >= 1e3) {
    return sign + (absValue / 1e3).toFixed(2) + "K";
  }
  return sign + absValue.toFixed(0);
}

/**
 * Format price with thousand separators
 */
function formatPrice(value: number): string {
  return value.toLocaleString("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

/**
 * Parse scientific notation string to number
 */
function parseScientific(value: string | number | undefined): number {
  if (value === undefined || value === null || value === "") return 0;
  if (typeof value === "number") return value;
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
}

/**
 * Format date from YYYYMMDD to readable format
 */
function formatDate(dateStr: string): string {
  if (!dateStr || dateStr.length !== 8) return dateStr;
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);
  return `${year}-${month}-${day}`;
}

/**
 * Serialize a buy transaction
 */
function serializeBuyTransaction(raw: RawBrokerBuy): SerializedBrokerTransaction {
  const buyLot = parseScientific(raw.blot);
  const buyValue = parseScientific(raw.bval);
  const buyAvgPrice = parseScientific(raw.netbs_buy_avg_price);

  return {
    stockCode: raw.netbs_stock_code,
    brokerCode: raw.netbs_broker_code,
    date: formatDate(raw.netbs_date),
    type: raw.type as "Lokal" | "Asing",

    buyLot,
    buyValue,
    buyAvgPrice,

    sellLot: 0,
    sellValue: 0,
    sellAvgPrice: 0,

    netLot: buyLot,
    netValue: buyValue,

    buyValueFormatted: formatValue(buyValue),
    sellValueFormatted: "-",
    netValueFormatted: formatValue(buyValue),
    buyAvgPriceFormatted: formatPrice(buyAvgPrice),
    sellAvgPriceFormatted: "-",
  };
}

/**
 * Serialize a sell transaction
 */
function serializeSellTransaction(raw: RawBrokerSell): SerializedBrokerTransaction {
  const sellLot = Math.abs(parseScientific(raw.slot));
  const sellValue = Math.abs(parseScientific(raw.sval));
  const sellAvgPrice = parseScientific(raw.netbs_sell_avg_price);

  return {
    stockCode: raw.netbs_stock_code,
    brokerCode: raw.netbs_broker_code,
    date: formatDate(raw.netbs_date),
    type: raw.type as "Lokal" | "Asing",

    buyLot: 0,
    buyValue: 0,
    buyAvgPrice: 0,

    sellLot,
    sellValue,
    sellAvgPrice,

    netLot: -sellLot,
    netValue: -sellValue,

    buyValueFormatted: "-",
    sellValueFormatted: formatValue(sellValue),
    netValueFormatted: formatValue(-sellValue),
    buyAvgPriceFormatted: "-",
    sellAvgPriceFormatted: formatPrice(sellAvgPrice),
  };
}

/**
 * Serialize AccDist info
 */
function serializeAccDistInfo(raw: RawAccDistInfo) {
  return {
    accDist: raw.accdist,
    amount: raw.amount,
    percent: raw.percent,
    volume: raw.vol,
  };
}

/**
 * Serialize bandar detector
 */
function serializeBandarDetector(raw: RawBandarDetector): SerializedBandarDetector {
  return {
    averagePrice: raw.average,
    totalValue: raw.value,
    totalVolume: raw.volume,
    totalBuyers: raw.total_buyer,
    totalSellers: raw.total_seller,
    brokerAccDist: raw.broker_accdist,

    average: serializeAccDistInfo(raw.avg),
    average5Day: serializeAccDistInfo(raw.avg5),
    top1: serializeAccDistInfo(raw.top1),
    top3: serializeAccDistInfo(raw.top3),
    top5: serializeAccDistInfo(raw.top5),
    top10: serializeAccDistInfo(raw.top10),
  };
}

/**
 * Main serializer for broker activity
 */
export function serializeBrokerActivity(
  raw: RawBrokerActivityResponse
): SerializedBrokerActivity {
  const data = raw.data;
  const summary = data.broker_summary;

  // Serialize transactions
  const buyTransactions = (summary.brokers_buy || []).map(serializeBuyTransaction);
  const sellTransactions = (summary.brokers_sell || []).map(serializeSellTransaction);

  // Calculate totals
  const totalBuyValue = buyTransactions.reduce((sum, t) => sum + t.buyValue, 0);
  const totalBuyLot = buyTransactions.reduce((sum, t) => sum + t.buyLot, 0);
  const totalSellValue = sellTransactions.reduce((sum, t) => sum + t.sellValue, 0);
  const totalSellLot = sellTransactions.reduce((sum, t) => sum + t.sellLot, 0);
  const netValue = totalBuyValue - totalSellValue;
  const netLot = totalBuyLot - totalSellLot;

  return {
    brokerCode: data.broker_code,
    brokerName: data.broker_name,
    dateFrom: data.from,
    dateTo: data.to,

    bandarDetector: serializeBandarDetector(data.bandar_detector),

    buyTransactions,
    totalBuyValue,
    totalBuyLot,

    sellTransactions,
    totalSellValue,
    totalSellLot,

    netValue,
    netLot,

    totalBuyValueFormatted: formatValue(totalBuyValue),
    totalSellValueFormatted: formatValue(totalSellValue),
    netValueFormatted: formatValue(netValue),
  };
}

/**
 * Simplified summary for quick view
 */
export interface BrokerTransactionSummary {
  stockCode: string;
  type: "Lokal" | "Asing";
  side: "buy" | "sell";
  lot: number;
  value: number;
  avgPrice: number;
  valueFormatted: string;
  avgPriceFormatted: string;
}

export function serializeBrokerActivitySummary(
  raw: RawBrokerActivityResponse
): {
  brokerCode: string;
  brokerName: string;
  date: string;
  buys: BrokerTransactionSummary[];
  sells: BrokerTransactionSummary[];
  totalBuyValue: string;
  totalSellValue: string;
  netValue: string;
} {
  const data = raw.data;
  const summary = data.broker_summary;

  const buys: BrokerTransactionSummary[] = (summary.brokers_buy || []).map((b) => ({
    stockCode: b.netbs_stock_code,
    type: b.type as "Lokal" | "Asing",
    side: "buy" as const,
    lot: parseScientific(b.blot),
    value: parseScientific(b.bval),
    avgPrice: parseScientific(b.netbs_buy_avg_price),
    valueFormatted: formatValue(parseScientific(b.bval)),
    avgPriceFormatted: formatPrice(parseScientific(b.netbs_buy_avg_price)),
  }));

  const sells: BrokerTransactionSummary[] = (summary.brokers_sell || []).map((s) => ({
    stockCode: s.netbs_stock_code,
    type: s.type as "Lokal" | "Asing",
    side: "sell" as const,
    lot: Math.abs(parseScientific(s.slot)),
    value: Math.abs(parseScientific(s.sval)),
    avgPrice: parseScientific(s.netbs_sell_avg_price),
    valueFormatted: formatValue(Math.abs(parseScientific(s.sval))),
    avgPriceFormatted: formatPrice(parseScientific(s.netbs_sell_avg_price)),
  }));

  const totalBuy = buys.reduce((sum, b) => sum + b.value, 0);
  const totalSell = sells.reduce((sum, s) => sum + s.value, 0);

  return {
    brokerCode: data.broker_code,
    brokerName: data.broker_name,
    date: data.from,
    buys,
    sells,
    totalBuyValue: formatValue(totalBuy),
    totalSellValue: formatValue(totalSell),
    netValue: formatValue(totalBuy - totalSell),
  };
}
