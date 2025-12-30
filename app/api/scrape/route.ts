import { NextRequest, NextResponse } from "next/server";
import {
  getStockFinancials,
  getStockKeyStats,
  getStockPricePerformance,
  searchStocks,
  getWatchlist,
  getBrokerActivity,
  getInsiderActivity,
  type StockbitAuthInfo,
  type BrokerActivityOptions,
  type InsiderActivityOptions,
} from "@/lib/stockbit/api";
import {
  serializeWatchlist,
  serializeWatchlistSummary,
} from "@/app/serializers/watchlist";
import {
  serializeBrokerActivity,
  serializeBrokerActivitySummary,
} from "@/app/serializers/broker";

type DataType =
  | "profile"
  | "quote"
  | "financials"
  | "keystats"
  | "price-performance"
  | "stream"
  | "search"
  | "watchlist"
  | "watchlist-summary"
  | "watchlist-raw"
  | "broker"
  | "broker-summary"
  | "broker-raw"
  | "insider";

/**
 * GET /api/scrape - Fetch stock data from Stockbit
 *
 * Headers:
 * - Authorization: Bearer <your_access_token> (required)
 *
 * Query params:
 * - type: profile | quote | financials | keystats | stream | search | watchlist
 * - symbol: stock symbol (e.g., BBCA, TLKM)
 * - query: search query (for type=search)
 * - period: annual | quarterly (for type=financials)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = (searchParams.get("type") as DataType) || "profile";
    const symbol = searchParams.get("symbol");
    const query = searchParams.get("query");
    const period =
      (searchParams.get("period") as "annual" | "quarterly") || "annual";

    // Get access token from Authorization header
    const authHeader = request.headers.get("Authorization");
    let accessToken: string | null = null;

    if (authHeader?.startsWith("Bearer ")) {
      accessToken = authHeader.slice(7); // Remove "Bearer " prefix
    }

    // Validate access token
    if (!accessToken) {
      return NextResponse.json(
        { error: "Access token is required. Use Authorization: Bearer <token> header" },
        { status: 401 }
      );
    }

    // Create auth object from provided token
    const auth: StockbitAuthInfo = {
      accessToken,
    };

    let data;

    switch (type) {
      case "financials":
        if (!symbol) {
          return NextResponse.json(
            { error: "Symbol is required for financials" },
            { status: 400 }
          );
        }
        data = await getStockFinancials(auth, symbol);
        break;

      case "keystats":
        if (!symbol) {
          return NextResponse.json(
            { error: "Symbol is required for keystats" },
            { status: 400 }
          );
        }
        data = await getStockKeyStats(auth, symbol);
        break;

      case "price-performance":
        if (!symbol) {
          return NextResponse.json(
            { error: "Symbol is required for price-performance" },
            { status: 400 }
          );
        }
        data = await getStockPricePerformance(auth, symbol);
        break;

      case "search":
        if (!query) {
          return NextResponse.json(
            { error: "Query is required for search" },
            { status: 400 }
          );
        }
        data = await searchStocks(auth, query);
        break;

      case "watchlist": {
        const rawData = await getWatchlist(auth);
        data = serializeWatchlist(rawData);
        break;
      }

      case "watchlist-summary": {
        const rawData = await getWatchlist(auth);
        data = serializeWatchlistSummary(rawData);
        break;
      }

      case "watchlist-raw":
        data = await getWatchlist(auth);
        break;

      default:
        return NextResponse.json(
          { error: `Invalid type: ${type}` },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, data });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

interface ScrapeRequestBody {
  type?: DataType;
  symbol?: string;
  query?: string;
  period?: "annual" | "quarterly";
  // Broker activity params
  brokerCode?: string;
  page?: number;
  limit?: number;
  transactionType?: "TRANSACTION_TYPE_NET" | "TRANSACTION_TYPE_BUY" | "TRANSACTION_TYPE_SELL";
  marketBoard?: "MARKET_BOARD_REGULER" | "MARKET_BOARD_TUNAI" | "MARKET_BOARD_NEGO";
  investorType?: "INVESTOR_TYPE_ALL" | "INVESTOR_TYPE_DOMESTIC" | "INVESTOR_TYPE_FOREIGN";
  startDate?: string; // Format: YYYY-MM-DD
  endDate?: string;   // Format: YYYY-MM-DD
  // Insider activity params
  actionType?: "ACTION_TYPE_UNSPECIFIED" | "ACTION_TYPE_BUY" | "ACTION_TYPE_SELL" | "ACTION_TYPE_TRANSFER";
  sourceType?: "SOURCE_TYPE_UNSPECIFIED" | "SOURCE_TYPE_KSEI" | "SOURCE_TYPE_IDX";
}

/**
 * POST /api/scrape - Fetch stock data from Stockbit
 *
 * Headers:
 * - Authorization: Bearer <your_access_token> (required)
 *
 * Body (JSON):
 * - type: profile | quote | financials | keystats | stream | search | watchlist | broker | insider
 * - symbol: stock symbol (e.g., BBCA, TLKM)
 * - query: search query (for type=search)
 * - period: annual | quarterly (for type=financials)
 * - brokerCode: broker code (e.g., XL, CC) for broker activity
 * - page, limit, transactionType, marketBoard, investorType: broker filters
 * - actionType, sourceType: insider filters
 */
export async function POST(request: NextRequest) {
  try {
    const body: ScrapeRequestBody = await request.json();
    const {
      type = "profile",
      symbol,
      query,
      period = "annual",
      brokerCode,
      page = 1,
      limit = 50,
      transactionType = "TRANSACTION_TYPE_NET",
      marketBoard = "MARKET_BOARD_REGULER",
      investorType = "INVESTOR_TYPE_ALL",
      startDate,
      endDate,
      actionType = "ACTION_TYPE_UNSPECIFIED",
      sourceType = "SOURCE_TYPE_UNSPECIFIED",
    } = body;

    // Get access token from Authorization header
    const authHeader = request.headers.get("Authorization");
    let accessToken: string | null = null;

    if (authHeader?.startsWith("Bearer ")) {
      accessToken = authHeader.slice(7); // Remove "Bearer " prefix
    }

    // Validate access token
    if (!accessToken) {
      return NextResponse.json(
        { error: "Access token is required. Use Authorization: Bearer <token> header" },
        { status: 401 }
      );
    }

    // Create auth object from provided token
    const auth: StockbitAuthInfo = {
      accessToken,
    };

    let data;

    switch (type) {
      case "financials":
        if (!symbol) {
          return NextResponse.json(
            { error: "Symbol is required for financials" },
            { status: 400 }
          );
        }
        data = await getStockFinancials(auth, symbol);
        break;

      case "keystats":
        if (!symbol) {
          return NextResponse.json(
            { error: "Symbol is required for keystats" },
            { status: 400 }
          );
        }
        data = await getStockKeyStats(auth, symbol);
        break;

      case "price-performance":
        if (!symbol) {
          return NextResponse.json(
            { error: "Symbol is required for price-performance" },
            { status: 400 }
          );
        }
        data = await getStockPricePerformance(auth, symbol);
        break;

      case "search":
        if (!query) {
          return NextResponse.json(
            { error: "Query is required for search" },
            { status: 400 }
          );
        }
        data = await searchStocks(auth, query);
        break;

      case "watchlist": {
        const rawData = await getWatchlist(auth);
        console.log(rawData);
        data = serializeWatchlist(rawData);
        break;
      }

      case "watchlist-summary": {
        const rawData = await getWatchlist(auth);
        console.log(rawData);
        data = serializeWatchlistSummary(rawData);
        break;
      }

      case "watchlist-raw":
        data = await getWatchlist(auth);
        console.log(data);
        break;

      case "broker": {
        if (!brokerCode) {
          return NextResponse.json(
            { error: "Broker code is required for broker activity" },
            { status: 400 }
          );
        }
        const brokerOptions: BrokerActivityOptions = {
          brokerCode,
          page,
          limit,
          transactionType,
          marketBoard,
          investorType,
          startDate,
          endDate,
        };
        const rawData = await getBrokerActivity(auth, brokerOptions);
        data = serializeBrokerActivity(rawData);
        break;
      }

      case "broker-summary": {
        if (!brokerCode) {
          return NextResponse.json(
            { error: "Broker code is required for broker activity" },
            { status: 400 }
          );
        }
        const brokerOptions: BrokerActivityOptions = {
          brokerCode,
          page,
          limit,
          transactionType,
          marketBoard,
          investorType,
          startDate,
          endDate,
        };
        const rawData = await getBrokerActivity(auth, brokerOptions);
        data = serializeBrokerActivitySummary(rawData);
        break;
      }

      case "broker-raw": {
        if (!brokerCode) {
          return NextResponse.json(
            { error: "Broker code is required for broker activity" },
            { status: 400 }
          );
        }
        const brokerOptions: BrokerActivityOptions = {
          brokerCode,
          page,
          limit,
          transactionType,
          marketBoard,
          investorType,
          startDate,
          endDate,
        };
        data = await getBrokerActivity(auth, brokerOptions);
        break;
      }

      case "insider": {
        const insiderOptions: InsiderActivityOptions = {
          page,
          limit,
          startDate,
          endDate,
          actionType,
          sourceType,
        };
        const rawData = await getInsiderActivity(auth, insiderOptions);
        data = rawData.data;
        break;
      }

      default:
        return NextResponse.json(
          { error: `Invalid type: ${type}` },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, data });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
