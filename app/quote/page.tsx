"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import TokenInput from "../components/TokenInput";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

interface QuoteData {
  symbol: string;
  company_name: string;
  last: number;
  change: number;
  percent: number;
  open: number;
  high: number;
  low: number;
  close: number;
  previous: number;
  volume: number;
  value: number;
  frequency: number;
  bid: number;
  offer: number;
  bid_volume: number;
  offer_volume: number;
  market_cap: number;
  one_day: number;
  one_week: number;
  one_month: number;
  three_month: number;
  six_month: number;
  ytd: number;
  one_year: number;
}

export default function QuotePage() {
  const { accessToken, isAuthenticated } = useAuth();
  const [symbol, setSymbol] = useState("BBCA");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quote, setQuote] = useState<QuoteData | null>(null);

  const fetchQuote = async () => {
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
        body: JSON.stringify({ type: "quote", symbol: symbol.toUpperCase() }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to fetch quote");
      }

      setQuote(json.data?.data || json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num === undefined || num === null) return "-";
    return num.toLocaleString("id-ID");
  };

  const formatVolume = (num: number) => {
    if (!num) return "-";
    if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
    if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
    return num.toLocaleString("id-ID");
  };

  const getChangeColor = (value: number) => {
    if (value > 0) return "text-green-400";
    if (value < 0) return "text-red-400";
    return "text-zinc-400";
  };

  const formatPercent = (value: number) => {
    if (value === undefined || value === null) return "-";
    return (value > 0 ? "+" : "") + value.toFixed(2) + "%";
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">💰 Stock Quote</h1>
        <p className="text-zinc-400">
          View current stock price, volume, and market data
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
          onClick={fetchQuote}
          disabled={loading || !isAuthenticated}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
        >
          {loading ? "Loading..." : "Fetch Quote"}
        </button>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} />
        </div>
      )}

      {loading && <LoadingSpinner />}

      {quote && !loading && (
        <div className="space-y-6">
          {/* Main Price Card */}
          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">{quote.symbol}</h2>
                <p className="text-zinc-400">{quote.company_name}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{formatNumber(quote.last)}</p>
                <p className={`text-lg font-medium ${getChangeColor(quote.change)}`}>
                  {quote.change > 0 ? "+" : ""}
                  {formatNumber(quote.change)} ({formatPercent(quote.percent)})
                </p>
              </div>
            </div>

            {/* OHLC */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-zinc-700">
              <div>
                <p className="text-xs text-zinc-500 uppercase">Open</p>
                <p className="text-lg font-medium">{formatNumber(quote.open)}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase">High</p>
                <p className="text-lg font-medium text-green-400">
                  {formatNumber(quote.high)}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase">Low</p>
                <p className="text-lg font-medium text-red-400">
                  {formatNumber(quote.low)}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase">Prev Close</p>
                <p className="text-lg font-medium">{formatNumber(quote.previous)}</p>
              </div>
            </div>
          </div>

          {/* Volume & Value */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
              <p className="text-xs text-zinc-500 uppercase mb-1">Volume</p>
              <p className="text-xl font-bold">{formatVolume(quote.volume)}</p>
            </div>
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
              <p className="text-xs text-zinc-500 uppercase mb-1">Value</p>
              <p className="text-xl font-bold">{formatVolume(quote.value)}</p>
            </div>
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
              <p className="text-xs text-zinc-500 uppercase mb-1">Frequency</p>
              <p className="text-xl font-bold">{formatNumber(quote.frequency)}</p>
            </div>
          </div>

          {/* Bid/Offer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-zinc-400 mb-3">Bid</h3>
              <div className="flex justify-between items-center">
                <p className="text-2xl font-bold text-green-400">
                  {formatNumber(quote.bid)}
                </p>
                <p className="text-zinc-500">
                  Vol: {formatVolume(quote.bid_volume)}
                </p>
              </div>
            </div>
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-zinc-400 mb-3">Offer</h3>
              <div className="flex justify-between items-center">
                <p className="text-2xl font-bold text-red-400">
                  {formatNumber(quote.offer)}
                </p>
                <p className="text-zinc-500">
                  Vol: {formatVolume(quote.offer_volume)}
                </p>
              </div>
            </div>
          </div>

          {/* Performance */}
          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
            <h3 className="font-semibold mb-4">Performance</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {[
                { label: "1D", value: quote.one_day },
                { label: "1W", value: quote.one_week },
                { label: "1M", value: quote.one_month },
                { label: "3M", value: quote.three_month },
                { label: "6M", value: quote.six_month },
                { label: "YTD", value: quote.ytd },
                { label: "1Y", value: quote.one_year },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <p className="text-xs text-zinc-500 mb-1">{item.label}</p>
                  <p className={`font-semibold ${getChangeColor(item.value)}`}>
                    {formatPercent(item.value)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Market Cap */}
          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
            <p className="text-xs text-zinc-500 uppercase mb-1">Market Cap</p>
            <p className="text-xl font-bold">{formatVolume(quote.market_cap)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
