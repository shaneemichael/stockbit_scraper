"use client";

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import TokenInput from "../../components/TokenInput";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";
import { Badge, Button, Card, ChipGroup, EmptyState, PageHeader, Stat, inputClass, rowClass, thClass } from "../../components/ui";
import { POPULAR_STOCKS } from "../../consts/popularStocks";

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
        if (num > 0) return "text-emerald-400";
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
      <PageHeader
        title="Key Statistics"
        description="Valuation, profitability and growth ratios for a stock."
      />

      <TokenInput />

      <form
        className="mb-4 flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          fetchStats();
        }}
      >
        <input
          type="text"
          aria-label="Stock symbol"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="Symbol, e.g. BBCA"
          className={`${inputClass} w-full max-w-xs font-mono uppercase`}
        />
        <Button type="submit" disabled={loading || !isAuthenticated}>
          {loading ? "Loading..." : "Fetch stats"}
        </Button>
      </form>

      <div className="mb-6">
        <ChipGroup
          label="Popular"
          options={POPULAR_STOCKS.map((s) => ({ value: s.code, label: s.code, title: s.name }))}
          value={symbol}
          onChange={setSymbol}
        />
      </div>

      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} />
        </div>
      )}

      {loading && <LoadingSpinner />}

      {keystats && !loading && (
        <div className="space-y-4">
          <Card className="p-5 flex flex-wrap items-start justify-between gap-6">
            <div>
              <h2 className="text-xl font-semibold">{symbol}</h2>
              <p className="text-sm text-zinc-500">Key statistics &amp; ratios</p>
            </div>
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4">
                <Stat label="Market cap" value={stats.market_cap} tone="accent" />
                <Stat label="Enterprise value" value={stats.enterprise_value} />
                <Stat label="Shares outstanding" value={stats.current_share_outstanding} />
                <Stat label="Free float" value={stats.free_float} />
              </div>
            )}
          </Card>

          {prices.length > 0 && (
            <Card className="p-4">
              <h3 className="mb-3 text-sm font-medium text-zinc-400">Price performance</h3>
              <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-10 gap-2">
                {prices.map((price) => {
                  const pct = price.percentage.raw;
                  return (
                    <div key={price.timeframe} className="p-2 rounded-lg bg-zinc-950 text-center">
                      <p className="text-xs text-zinc-500">{price.timeframe}</p>
                      <p
                        className={`mt-0.5 text-sm font-medium tabular-nums ${
                          pct > 0 ? "text-emerald-400" : pct < 0 ? "text-red-400" : "text-zinc-300"
                        }`}
                      >
                        {pct > 0 ? "+" : ""}
                        {pct.toFixed(2)}%
                      </p>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          <ChipGroup
            label="Category"
            options={groups.map((g) => ({ value: g.keystats_name, label: g.keystats_name }))}
            value={activeTab}
            onChange={setActiveTab}
          />

          {activeGroup && (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-950/60 border-b border-zinc-800">
                    <tr>
                      <th className={`${thClass} text-left`}>Metric</th>
                      <th className={`${thClass} text-right`}>Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {activeGroup.fin_name_results.map((item, idx) => (
                      <tr key={item.fitem.id || idx} className={rowClass}>
                        <td className="px-4 py-2.5 text-zinc-300">
                          {item.fitem.name}
                          {item.is_new_update && (
                            <span className="ml-2">
                              <Badge tone="up">New</Badge>
                            </span>
                          )}
                        </td>
                        <td
                          className={`px-4 py-2.5 text-right font-mono tabular-nums ${getValueColor(
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
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {groups.slice(0, 6).map((group) => (
              <button
                key={group.keystats_name}
                type="button"
                onClick={() => setActiveTab(group.keystats_name)}
                className={`text-left p-4 bg-zinc-900 border rounded-xl cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  activeTab === group.keystats_name
                    ? "border-blue-500/50"
                    : "border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <h3 className="mb-3 text-sm font-medium">{group.keystats_name}</h3>
                <dl className="space-y-1.5">
                  {group.fin_name_results.slice(0, 4).map((item, idx) => (
                    <div key={item.fitem.id || idx} className="flex justify-between gap-2 text-sm">
                      <dt className="text-zinc-500 truncate">{item.fitem.name}</dt>
                      <dd className={`tabular-nums ${getValueColor(item.fitem.value)}`}>
                        {item.fitem.value || "-"}
                      </dd>
                    </div>
                  ))}
                </dl>
                {group.fin_name_results.length > 4 && (
                  <p className="mt-2 text-xs text-zinc-500">
                    +{group.fin_name_results.length - 4} more
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {!keystats && !loading && !error && (
        <EmptyState>Pick a stock and click Fetch stats to see its key statistics.</EmptyState>
      )}
    </div>
  );
}
