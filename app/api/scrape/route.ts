import { NextRequest, NextResponse } from "next/server";
import {
  getStockProfile,
  getStockQuote,
  getStockFinancials,
  getStockKeyStats,
  getStockStream,
  searchStocks,
  getWatchlist,
  type StockbitAuthInfo,
} from "@/lib/stockbit/api";

type DataType =
  | "profile"
  | "quote"
  | "financials"
  | "keystats"
  | "stream"
  | "search"
  | "watchlist";

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
      case "profile":
        if (!symbol) {
          return NextResponse.json(
            { error: "Symbol is required for profile" },
            { status: 400 }
          );
        }
        data = await getStockProfile(auth, symbol);
        break;

      case "quote":
        if (!symbol) {
          return NextResponse.json(
            { error: "Symbol is required for quote" },
            { status: 400 }
          );
        }
        data = await getStockQuote(auth, symbol);
        break;

      case "financials":
        if (!symbol) {
          return NextResponse.json(
            { error: "Symbol is required for financials" },
            { status: 400 }
          );
        }
        data = await getStockFinancials(auth, symbol, period);
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

      case "stream":
        if (!symbol) {
          return NextResponse.json(
            { error: "Symbol is required for stream" },
            { status: 400 }
          );
        }
        data = await getStockStream(auth, symbol);
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

      case "watchlist":
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
}

/**
 * POST /api/scrape - Fetch stock data from Stockbit
 *
 * Headers:
 * - Authorization: Bearer <your_access_token> (required)
 *
 * Body (JSON):
 * - type: profile | quote | financials | keystats | stream | search | watchlist
 * - symbol: stock symbol (e.g., BBCA, TLKM)
 * - query: search query (for type=search)
 * - period: annual | quarterly (for type=financials)
 */
export async function POST(request: NextRequest) {
  try {
    const body: ScrapeRequestBody = await request.json();
    const { type = "profile", symbol, query, period = "annual" } = body;

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
      case "profile":
        if (!symbol) {
          return NextResponse.json(
            { error: "Symbol is required for profile" },
            { status: 400 }
          );
        }
        data = await getStockProfile(auth, symbol);
        break;

      case "quote":
        if (!symbol) {
          return NextResponse.json(
            { error: "Symbol is required for quote" },
            { status: 400 }
          );
        }
        data = await getStockQuote(auth, symbol);
        break;

      case "financials":
        if (!symbol) {
          return NextResponse.json(
            { error: "Symbol is required for financials" },
            { status: 400 }
          );
        }
        data = await getStockFinancials(auth, symbol, period);
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

      case "stream":
        if (!symbol) {
          return NextResponse.json(
            { error: "Symbol is required for stream" },
            { status: 400 }
          );
        }
        data = await getStockStream(auth, symbol);
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

      case "watchlist":
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
