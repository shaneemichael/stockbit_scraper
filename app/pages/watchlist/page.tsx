"use client";

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import TokenInput from "../../components/TokenInput";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";
import type { SerializedStock } from "../../serializers/watchlist";

interface WatchlistData {
  id: number;
  name: string;
  description: string;
  totalStocks: number;
  stocks: SerializedStock[];
}

function StockCard({ stock }: { stock: SerializedStock }) {
  const changeColor = stock.isPositive
    ? "text-green-400"
    : stock.isNegative
    ? "text-red-400"
    : "text-zinc-400";

  const changeBg = stock.isPositive
    ? "bg-green-500/10"
    : stock.isNegative
    ? "bg-red-500/10"
    : "bg-zinc-500/10";

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 hover:border-zinc-600 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {stock.iconUrl && (
            <img
              src={stock.iconUrl}
              alt={stock.symbol}
              className="w-10 h-10 rounded-lg bg-zinc-700"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          )}
          <div>
            <h3 className="font-semibold text-white">{stock.symbol}</h3>
            <p className="text-xs text-zinc-500 line-clamp-1">{stock.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {stock.hasCorporateAction && (
            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">
              CA
            </span>
          )}
          {stock.isUma && (
            <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">
              UMA
            </span>
          )}
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-white">
            {stock.lastPrice.toLocaleString("id-ID")}
          </p>
          <p className="text-xs text-zinc-500">
            Vol: {stock.volumeFormatted}
          </p>
        </div>
        <div className={`${changeBg} ${changeColor} px-3 py-1.5 rounded-lg text-right`}>
          <p className="font-semibold">
            {stock.isPositive ? "+" : ""}
            {stock.change.toLocaleString("id-ID")}
          </p>
          <p className="text-xs">
            {stock.isPositive ? "+" : ""}
            {stock.changePercent.toFixed(2)}%
          </p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-zinc-700 grid grid-cols-4 gap-2 text-xs">
        <div>
          <p className="text-zinc-500">Open</p>
          <p className="text-zinc-300">{stock.openPrice.toLocaleString("id-ID")}</p>
        </div>
        <div>
          <p className="text-zinc-500">High</p>
          <p className="text-green-400">{stock.highPrice.toLocaleString("id-ID")}</p>
        </div>
        <div>
          <p className="text-zinc-500">Low</p>
          <p className="text-red-400">{stock.lowPrice.toLocaleString("id-ID")}</p>
        </div>
        <div>
          <p className="text-zinc-500">Prev</p>
          <p className="text-zinc-300">{stock.previousClose.toLocaleString("id-ID")}</p>
        </div>
      </div>
    </div>
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">📋 My Watchlist</h1>
        <p className="text-zinc-400">
          View your watchlist stocks with real-time prices
        </p>
      </div>

      <TokenInput />

      <button
        onClick={fetchWatchlist}
        disabled={loading || !isAuthenticated}
        className="mb-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
      >
        {loading ? "Loading..." : "Fetch Watchlist"}
      </button>

      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} />
        </div>
      )}

      {loading && <LoadingSpinner />}

      {watchlist && !loading && (
        <>
          {/* Header */}
          <div className="mb-6 p-4 bg-zinc-800 border border-zinc-700 rounded-lg">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">{watchlist.name}</h2>
                <p className="text-sm text-zinc-400">
                  {watchlist.totalStocks} stocks
                </p>
              </div>
              <div className="flex gap-4">
                <div className="text-center">
                  <p className="text-xl font-bold text-green-400">
                    {stats?.gainers}
                  </p>
                  <p className="text-xs text-zinc-500">Gainers</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-red-400">
                    {stats?.losers}
                  </p>
                  <p className="text-xs text-zinc-500">Losers</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-zinc-400">
                    {stats?.unchanged}
                  </p>
                  <p className="text-xs text-zinc-500">Unchanged</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stock Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {watchlist.stocks.map((stock) => (
              <StockCard key={stock.symbol} stock={stock} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
