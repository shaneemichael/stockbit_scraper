"use client";

import { useState } from "react";

type DataType =
  | "profile"
  | "quote"
  | "financials"
  | "keystats"
  | "stream"
  | "search"
  | "watchlist";

export default function Home() {
  const [accessToken, setAccessToken] = useState("");
  const [dataType, setDataType] = useState<DataType>("profile");
  const [symbol, setSymbol] = useState("BBCA");
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState<"annual" | "quarterly">("annual");
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult("");

    try {
      const body: Record<string, string> = {
        type: dataType,
      };

      if (dataType === "search") {
        body.query = query;
      } else if (dataType !== "watchlist") {
        body.symbol = symbol;
      }

      if (dataType === "financials") {
        body.period = period;
      }

      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch data");
      }

      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Stockbit Scraper</h1>
        <p className="text-zinc-400 mb-8">
          Fetch data from Stockbit API using your access token
        </p>

        {/* Instructions */}
        <div className="bg-zinc-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            How to get your Access Token:
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-zinc-300">
            <li>
              Open{" "}
              <a
                href="https://stockbit.com/login"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                stockbit.com/login
              </a>{" "}
              and log in manually
            </li>
            <li>Open Browser DevTools (F12) → Application tab</li>
            <li>
              Go to Local Storage → https://stockbit.com
            </li>
            <li>
              Find the key containing your token (e.g., <code className="bg-zinc-700 px-1 rounded">persist:root</code>{" "}
              or <code className="bg-zinc-700 px-1 rounded">access_token</code>)
            </li>
            <li>Copy the access token value and paste it below</li>
          </ol>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Access Token */}
          <div>
            <label
              htmlFor="accessToken"
              className="block text-sm font-medium mb-2"
            >
              Access Token *
            </label>
            <input
              type="text"
              id="accessToken"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="Paste your access token here..."
              required
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Data Type */}
          <div>
            <label
              htmlFor="dataType"
              className="block text-sm font-medium mb-2"
            >
              Data Type
            </label>
            <select
              id="dataType"
              value={dataType}
              onChange={(e) => setDataType(e.target.value as DataType)}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="profile">Company Profile</option>
              <option value="quote">Stock Quote / Price</option>
              <option value="financials">Financial Data</option>
              <option value="keystats">Key Statistics</option>
              <option value="stream">Stream / Posts</option>
              <option value="search">Search Stocks</option>
              <option value="watchlist">My Watchlist</option>
            </select>
          </div>

          {/* Symbol (conditional) */}
          {dataType !== "search" && dataType !== "watchlist" && (
            <div>
              <label
                htmlFor="symbol"
                className="block text-sm font-medium mb-2"
              >
                Stock Symbol
              </label>
              <input
                type="text"
                id="symbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="e.g., BBCA, TLKM, BMRI"
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Query (for search) */}
          {dataType === "search" && (
            <div>
              <label htmlFor="query" className="block text-sm font-medium mb-2">
                Search Query
              </label>
              <input
                type="text"
                id="query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., bank, technology"
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Period (for financials) */}
          {dataType === "financials" && (
            <div>
              <label
                htmlFor="period"
                className="block text-sm font-medium mb-2"
              >
                Period
              </label>
              <select
                id="period"
                value={period}
                onChange={(e) =>
                  setPeriod(e.target.value as "annual" | "quarterly")
                }
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="annual">Annual</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !accessToken}
            className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
          >
            {loading ? "Fetching..." : "Fetch Data"}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="mt-6 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Result:</h3>
            <pre className="p-4 bg-zinc-800 rounded-lg overflow-x-auto text-sm text-zinc-300 max-h-[500px] overflow-y-auto">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
