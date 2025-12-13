"use client";

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import TokenInput from "../../components/TokenInput";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";

interface KeyStats {
  symbol: string;
  // Valuation
  pe_ratio: number;
  pb_ratio: number;
  ps_ratio: number;
  peg_ratio: number;
  ev_ebitda: number;
  // Profitability
  roe: number;
  roa: number;
  npm: number;
  opm: number;
  gpm: number;
  // Debt
  der: number;
  current_ratio: number;
  quick_ratio: number;
  // Dividend
  dividend_yield: number;
  payout_ratio: number;
  // Growth
  revenue_growth: number;
  earnings_growth: number;
  // Per share
  eps: number;
  bvps: number;
  dps: number;
  // Other
  beta: number;
  avg_volume: number;
  shares_outstanding: number;
  market_cap: number;
  enterprise_value: number;
}

export default function KeystatsPage() {
  const { accessToken, isAuthenticated } = useAuth();
  const [symbol, setSymbol] = useState("BBCA");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<KeyStats | null>(null);
  const [rawData, setRawData] = useState<unknown>(null);

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
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ type: "keystats", symbol: symbol.toUpperCase() }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to fetch key stats");
      }

      setRawData(json.data);
      setStats(json.data?.data || json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number, decimals = 2) => {
    if (num === undefined || num === null || isNaN(num)) return "-";
    return num.toFixed(decimals);
  };

  const formatPercent = (num: number) => {
    if (num === undefined || num === null || isNaN(num)) return "-";
    return (num * 100).toFixed(2) + "%";
  };

  const formatLargeNumber = (num: number) => {
    if (!num) return "-";
    if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
    if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
    return num.toLocaleString("id-ID");
  };

  const StatCard = ({
    title,
    items,
  }: {
    title: string;
    items: { label: string; value: string; highlight?: boolean }[];
  }) => (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
      <h3 className="font-semibold mb-3 text-zinc-300">{title}</h3>
      <dl className="space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex justify-between">
            <dt className="text-zinc-500 text-sm">{item.label}</dt>
            <dd
              className={`font-medium ${
                item.highlight ? "text-blue-400" : "text-zinc-200"
              }`}
            >
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );

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
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="Enter stock symbol (e.g., BBCA)"
          className="flex-1 max-w-xs px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={fetchStats}
          disabled={loading || !isAuthenticated}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
        >
          {loading ? "Loading..." : "Fetch Stats"}
        </button>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} />
        </div>
      )}

      {loading && <LoadingSpinner />}

      {stats && !loading && (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
            <h2 className="text-xl font-bold">{symbol}</h2>
            <p className="text-zinc-400">Key Statistics</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              title="Valuation"
              items={[
                { label: "P/E Ratio", value: formatNumber(stats.pe_ratio), highlight: true },
                { label: "P/B Ratio", value: formatNumber(stats.pb_ratio) },
                { label: "P/S Ratio", value: formatNumber(stats.ps_ratio) },
                { label: "PEG Ratio", value: formatNumber(stats.peg_ratio) },
                { label: "EV/EBITDA", value: formatNumber(stats.ev_ebitda) },
              ]}
            />

            <StatCard
              title="Profitability"
              items={[
                { label: "ROE", value: formatPercent(stats.roe), highlight: true },
                { label: "ROA", value: formatPercent(stats.roa) },
                { label: "Net Profit Margin", value: formatPercent(stats.npm) },
                { label: "Operating Margin", value: formatPercent(stats.opm) },
                { label: "Gross Margin", value: formatPercent(stats.gpm) },
              ]}
            />

            <StatCard
              title="Debt & Liquidity"
              items={[
                { label: "Debt/Equity", value: formatNumber(stats.der), highlight: true },
                { label: "Current Ratio", value: formatNumber(stats.current_ratio) },
                { label: "Quick Ratio", value: formatNumber(stats.quick_ratio) },
              ]}
            />

            <StatCard
              title="Dividend"
              items={[
                { label: "Dividend Yield", value: formatPercent(stats.dividend_yield), highlight: true },
                { label: "Payout Ratio", value: formatPercent(stats.payout_ratio) },
                { label: "DPS", value: formatNumber(stats.dps) },
              ]}
            />

            <StatCard
              title="Per Share Data"
              items={[
                { label: "EPS", value: formatNumber(stats.eps), highlight: true },
                { label: "Book Value/Share", value: formatNumber(stats.bvps) },
              ]}
            />

            <StatCard
              title="Size & Scale"
              items={[
                { label: "Market Cap", value: formatLargeNumber(stats.market_cap), highlight: true },
                { label: "Enterprise Value", value: formatLargeNumber(stats.enterprise_value) },
                { label: "Avg Volume", value: formatLargeNumber(stats.avg_volume) },
                { label: "Beta", value: formatNumber(stats.beta) },
              ]}
            />
          </div>

          {/* Raw Data */}
          <details className="bg-zinc-800 border border-zinc-700 rounded-lg">
            <summary className="p-4 cursor-pointer text-zinc-400 hover:text-white">
              View Raw Data
            </summary>
            <pre className="p-4 text-xs text-zinc-400 overflow-x-auto border-t border-zinc-700">
              {JSON.stringify(rawData, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
