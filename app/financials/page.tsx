"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import TokenInput from "../components/TokenInput";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

interface FinancialRow {
  [key: string]: string | number;
}

interface FinancialsData {
  symbol: string;
  type: string;
  data: FinancialRow[];
  headers?: string[];
}

export default function FinancialsPage() {
  const { accessToken, isAuthenticated } = useAuth();
  const [symbol, setSymbol] = useState("BBCA");
  const [period, setPeriod] = useState<"annual" | "quarterly">("annual");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [financials, setFinancials] = useState<FinancialsData | null>(null);

  const fetchFinancials = async () => {
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
        body: JSON.stringify({
          type: "financials",
          symbol: symbol.toUpperCase(),
          period,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to fetch financials");
      }

      setFinancials(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "number") {
      if (Math.abs(value) >= 1e12) return (value / 1e12).toFixed(2) + "T";
      if (Math.abs(value) >= 1e9) return (value / 1e9).toFixed(2) + "B";
      if (Math.abs(value) >= 1e6) return (value / 1e6).toFixed(2) + "M";
      return value.toLocaleString("id-ID");
    }
    return String(value);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">📊 Financial Data</h1>
        <p className="text-zinc-400">
          Explore financial statements and reports
        </p>
      </div>

      <TokenInput />

      {/* Search */}
      <div className="flex flex-wrap gap-2 mb-6">
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="Enter stock symbol (e.g., BBCA)"
          className="flex-1 max-w-xs px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as "annual" | "quarterly")}
          className="px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="annual">Annual</option>
          <option value="quarterly">Quarterly</option>
        </select>
        <button
          onClick={fetchFinancials}
          disabled={loading || !isAuthenticated}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
        >
          {loading ? "Loading..." : "Fetch Financials"}
        </button>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} />
        </div>
      )}

      {loading && <LoadingSpinner />}

      {financials && !loading && (
        <div className="space-y-4">
          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
            <h2 className="text-lg font-semibold">
              {symbol} - {period === "annual" ? "Annual" : "Quarterly"} Financials
            </h2>
          </div>

          <div className="bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <pre className="p-4 text-sm text-zinc-300 whitespace-pre-wrap">
                {JSON.stringify(financials, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
