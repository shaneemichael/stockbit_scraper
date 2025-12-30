"use client";

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import TokenInput from "../../components/TokenInput";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";

interface FinItem {
  id: string;
  name: string;
  value: string;
}

interface FinNameResult {
  fitem: FinItem;
  hidden_graph_ico: boolean;
  is_new_update: boolean;
}

interface KeystatsGroup {
  keystats_name: string;
  fin_name_results: FinNameResult[];
}

interface Stats {
  current_share_outstanding: string;
  market_cap: string;
  enterprise_value: string;
  free_float: string;
}

interface PriceData {
  close: { raw: number; formatted: string };
  high: { raw: number; formatted: string };
  low: { raw: number; formatted: string };
  percentage: { raw: number; formatted: string };
  timeframe: string;
}

interface KeystatsResponse {
  data?: {
    closure_fin_items_results?: KeystatsGroup[];
    stats?: Stats;
  };
}

interface PricePerformanceResponse {
  data?: {
    prices?: PriceData[];
  };
}

const POPULAR_STOCKS = [
  { code: "BBCA", name: "Bank Central Asia" },
  { code: "BBRI", name: "Bank Rakyat Indonesia" },
  { code: "BMRI", name: "Bank Mandiri" },
  { code: "TLKM", name: "Telkom Indonesia" },
  { code: "ASII", name: "Astra International" },
  { code: "UNVR", name: "Unilever Indonesia" },
  { code: "ICBP", name: "Indofood CBP" },
  { code: "GOTO", name: "GoTo Gojek Tokopedia" },
];

// Map keystats group names to icons
const KEYSTATS_ICONS: Record<string, string> = {
  "Current Valuation": "💰",
  "Per Share": "📊",
  "Solvency": "🏦",
  "Management Effectiveness": "📈",
  "Profitability": "💵",
  "Growth": "🚀",
  "Dividend": "💎",
  "Market Rank": "🏆",
  "Income Statement": "📋",
  "Balance Sheet": "📑",
  "Cash Flow Statement": "💸",
  "Price Performance": "📉",
};

export default function KeystatsPage() {
  const { accessToken, isAuthenticated } = useAuth();
  const [symbol, setSymbol] = useState("BBCA");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [keystats, setKeystats] = useState<KeystatsResponse | null>(null);
  const [pricePerformance, setPricePerformance] = useState<PricePerformanceResponse | null>(null);
  const [activeTab, setActiveTab] = useState<string>("Current Valuation");

  const fetchStats = async () => {
    if (!accessToken) {
      setError("Please enter your access token first");
      return;
    }

    if (!symbol) {
      setError("Please enter a stock symbol");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Fetch both keystats and price performance in parallel
      const [keystatsRes, priceRes] = await Promise.all([
        fetch("/api/scrape", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ type: "keystats", symbol: symbol.toUpperCase() }),
        }),
        fetch("/api/scrape", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ type: "price-performance", symbol: symbol.toUpperCase() }),
        }),
      ]);

      const keystatsJson = await keystatsRes.json();
      const priceJson = await priceRes.json();

      if (!keystatsRes.ok) {
        throw new Error(keystatsJson.error || "Failed to fetch key stats");
      }

      setKeystats(keystatsJson.data);
      setPricePerformance(priceJson.data);

      // Set default active tab to first available group
      const groups = keystatsJson.data?.data?.closure_fin_items_results || [];
      if (groups.length > 0) {
        setActiveTab(groups[0].keystats_name);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getValueColor = (value: string): string => {
    if (!value || value === "-") return "text-zinc-400";
    // Check for percentage values
    if (value.includes("%")) {
      const num = parseFloat(value.replace(/[%,]/g, ""));
      if (!isNaN(num)) {
        if (num > 0) return "text-green-400";
        if (num < 0) return "text-red-400";
      }
    }
    // Check for parentheses (negative)
    if (value.startsWith("(") && value.endsWith(")")) {
      return "text-red-400";
    }
    return "text-zinc-200";
  };

  const groups = keystats?.data?.closure_fin_items_results || [];
  const stats = keystats?.data?.stats;
  const prices = pricePerformance?.data?.prices || [];

  const activeGroup = groups.find((g) => g.keystats_name === activeTab);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">📈 Key Statistics</h1>
        <p className="text-zinc-400">
          View key metrics like P/E, P/B, ROE, and more
        </p>
      </div>

      <TokenInput />

      {/* Search */}
      <div className="space-y-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <div className="flex-1 max-w-xs">
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="Enter stock symbol (e.g., BBCA)"
              className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={fetchStats}
            disabled={loading || !isAuthenticated}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
          >
            {loading ? "Loading..." : "Fetch Stats"}
          </button>
        </div>
      </div>

      {/* Popular Stocks */}
      <div className="mb-6">
        <p className="text-sm text-zinc-500 mb-2">Popular stocks:</p>
        <div className="flex flex-wrap gap-2">
          {POPULAR_STOCKS.map((stock) => (
            <button
              key={stock.code}
              onClick={() => setSymbol(stock.code)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                symbol === stock.code
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700"
              }`}
              title={stock.name}
            >
              {stock.code}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} />
        </div>
      )}

      {loading && <LoadingSpinner />}

      {keystats && !loading && (
        <div className="space-y-6">
          {/* Header with Stats */}
          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">{symbol}</h2>
                <p className="text-zinc-400">Key Statistics & Ratios</p>
              </div>
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-xs text-zinc-500">Market Cap</p>
                    <p className="text-lg font-bold text-blue-400">{stats.market_cap}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Enterprise Value</p>
                    <p className="text-lg font-bold text-zinc-200">{stats.enterprise_value}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Shares Outstanding</p>
                    <p className="text-lg font-bold text-zinc-200">{stats.current_share_outstanding}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Free Float</p>
                    <p className="text-lg font-bold text-zinc-200">{stats.free_float}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Price Performance */}
          {prices.length > 0 && (
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
              <h3 className="font-semibold mb-3 text-zinc-300">📉 Price Performance</h3>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                {prices.map((price) => (
                  <div
                    key={price.timeframe}
                    className="text-center p-2 bg-zinc-900 rounded-lg"
                  >
                    <p className="text-xs text-zinc-500 mb-1">{price.timeframe}</p>
                    <p
                      className={`text-sm font-medium ${
                        price.percentage.raw > 0
                          ? "text-green-400"
                          : price.percentage.raw < 0
                          ? "text-red-400"
                          : "text-zinc-300"
                      }`}
                    >
                      {price.percentage.raw > 0 ? "+" : ""}
                      {price.percentage.raw.toFixed(2)}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 overflow-x-auto custom-scrollbar pb-2">
            {groups.map((group) => (
              <button
                key={group.keystats_name}
                onClick={() => setActiveTab(group.keystats_name)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === group.keystats_name
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                {KEYSTATS_ICONS[group.keystats_name] || "📊"} {group.keystats_name}
              </button>
            ))}
          </div>

          {/* Active Group Data */}
          {activeGroup && (
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full">
                  <thead className="bg-zinc-900">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">
                        Metric
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-zinc-400 uppercase">
                        Value
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-700">
                    {activeGroup.fin_name_results.map((item, idx) => (
                      <tr key={item.fitem.id || idx} className="hover:bg-zinc-750">
                        <td className="px-4 py-3 text-zinc-300">
                          {item.fitem.name}
                          {item.is_new_update && (
                            <span className="ml-2 text-xs px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded">
                              NEW
                            </span>
                          )}
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-mono font-medium ${getValueColor(
                            item.fitem.value
                          )}`}
                        >
                          {item.fitem.value || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.slice(0, 6).map((group) => (
              <div
                key={group.keystats_name}
                className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 cursor-pointer hover:border-zinc-600 transition-colors"
                onClick={() => setActiveTab(group.keystats_name)}
              >
                <h3 className="font-semibold mb-3 text-zinc-300">
                  {KEYSTATS_ICONS[group.keystats_name] || "📊"} {group.keystats_name}
                </h3>
                <dl className="space-y-2">
                  {group.fin_name_results.slice(0, 4).map((item, idx) => (
                    <div key={item.fitem.id || idx} className="flex justify-between">
                      <dt className="text-zinc-500 text-sm truncate mr-2">
                        {item.fitem.name}
                      </dt>
                      <dd
                        className={`font-medium text-sm ${getValueColor(item.fitem.value)}`}
                      >
                        {item.fitem.value || "-"}
                      </dd>
                    </div>
                  ))}
                </dl>
                {group.fin_name_results.length > 4 && (
                  <p className="text-xs text-zinc-500 mt-2">
                    +{group.fin_name_results.length - 4} more items
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!keystats && !loading && !error && (
        <p className="text-zinc-500 text-center py-8">
          Select a stock and click Fetch Stats to see key statistics
        </p>
      )}
    </div>
  );
}
