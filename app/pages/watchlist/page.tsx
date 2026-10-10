"use client";

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import TokenInput from "../../components/TokenInput";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";
import { Badge, Button, Card, EmptyState, PageHeader, Stat } from "../../components/ui";
import type { SerializedStock } from "../../serializers/watchlist";

interface WatchlistData {
  id: number;
  name: string;
  description: string;
  totalStocks: number;
  stocks: SerializedStock[];
}

function StockCard({ stock }: { stock: SerializedStock }) {
  const tone = stock.isPositive ? "up" : stock.isNegative ? "down" : "neutral";
  const changeColor = {
    up: "text-emerald-400",
    down: "text-red-400",
    neutral: "text-zinc-400",
  }[tone];
  const sign = stock.isPositive ? "+" : "";
  const fmt = (n: number) => n.toLocaleString("id-ID");

  return (
    <Card className="p-4 hover:border-zinc-700 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {stock.iconUrl && (
            <img
              src={stock.iconUrl}
              alt=""
              width={36}
              height={36}
              className="w-9 h-9 rounded-lg bg-zinc-800 shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          )}
          <div className="min-w-0">
            <h3 className="font-semibold">{stock.symbol}</h3>
            <p className="text-xs text-zinc-500 truncate">{stock.name}</p>
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          {stock.hasCorporateAction && <Badge tone="amber">CA</Badge>}
          {stock.isUma && <Badge tone="purple">UMA</Badge>}
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-2xl font-semibold tabular-nums">{fmt(stock.lastPrice)}</p>
          <p className="text-xs text-zinc-500">Vol {stock.volumeFormatted}</p>
        </div>
        <div className={`text-right tabular-nums ${changeColor}`}>
          <p className="text-sm font-semibold">
            {sign}
            {fmt(stock.change)}
          </p>
          <p className="text-xs">
            {sign}
            {stock.changePercent.toFixed(2)}%
          </p>
        </div>
      </div>

      <dl className="mt-4 pt-3 border-t border-zinc-800 grid grid-cols-4 gap-2 text-xs tabular-nums">
        {[
          ["Open", stock.openPrice],
          ["High", stock.highPrice],
          ["Low", stock.lowPrice],
          ["Prev", stock.previousClose],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-zinc-500">{label}</dt>
            <dd className="text-zinc-300">{fmt(value as number)}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

export default function WatchlistPage() {
  const { accessToken, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [watchlist, setWatchlist] = useState<WatchlistData | null>(null);

  const fetchWatchlist = async () => {
    if (!accessToken) {
      setError("Please enter your access token first");
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
        body: JSON.stringify({ type: "watchlist" }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to fetch watchlist");
      }

      setWatchlist(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary stats
  const stats = watchlist
    ? {
        gainers: watchlist.stocks.filter((s) => s.isPositive).length,
        losers: watchlist.stocks.filter((s) => s.isNegative).length,
        unchanged: watchlist.stocks.filter(
          (s) => !s.isPositive && !s.isNegative
        ).length,
      }
    : null;

  return (
    <div>
      <PageHeader
        title="Watchlist"
        description="Your watchlist stocks with live prices."
      />

      <TokenInput />

      <Button
        onClick={fetchWatchlist}
        disabled={loading || !isAuthenticated}
        className="mb-6"
      >
        {loading ? "Loading..." : "Fetch watchlist"}
      </Button>

      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} />
        </div>
      )}

      {loading && <LoadingSpinner />}

      {watchlist && !loading && (
        <>
          <Card className="mb-6 p-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold">{watchlist.name}</h2>
              <p className="text-sm text-zinc-500">{watchlist.totalStocks} stocks</p>
            </div>
            <div className="flex gap-8 text-center">
              <Stat label="Gainers" value={stats?.gainers} tone="up" />
              <Stat label="Losers" value={stats?.losers} tone="down" />
              <Stat label="Unchanged" value={stats?.unchanged} />
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {watchlist.stocks.map((stock) => (
              <StockCard key={stock.symbol} stock={stock} />
            ))}
          </div>
        </>
      )}

      {!watchlist && !loading && !error && (
        <EmptyState>Click Fetch watchlist to load your stocks.</EmptyState>
      )}
    </div>
  );
}
