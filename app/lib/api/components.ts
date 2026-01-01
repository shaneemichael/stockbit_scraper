export const STOCKBIT_API_BASE = "https://exodus.stockbit.com";

export interface StockbitAuthInfo {
  accessToken: string;
  cookies?: string;
}

export interface InsiderActivityOptions {
  page?: number;
  limit?: number;
  startDate?: string; // Format: YYYY-MM-DD
  endDate?: string;   // Format: YYYY-MM-DD
  actionType?: "ACTION_TYPE_UNSPECIFIED" | "ACTION_TYPE_BUY" | "ACTION_TYPE_SELL" | "ACTION_TYPE_TRANSFER";
  sourceType?: "SOURCE_TYPE_UNSPECIFIED" | "SOURCE_TYPE_KSEI" | "SOURCE_TYPE_IDX";
}

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