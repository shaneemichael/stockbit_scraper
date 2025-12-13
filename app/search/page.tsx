"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import TokenInput from "../components/TokenInput";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import Link from "next/link";

interface SearchResult {
  symbol: string;
  name: string;
  type: string;
  exchange: string;
  country: string;
  icon_url: string;
  is_tradeable: boolean;
  sector: string;
  industry: string;
}

export default function SearchPage() {
  const { accessToken, isAuthenticated } = useAuth();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  const searchStocks = async () => {
    if (!accessToken) {
      setError("Please enter your access token first");
      return;
    }

    if (!query) {
      setError("Please enter a search query");
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
        body: JSON.stringify({ type: "search", query }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to search");
      }

      // Handle different response structures
      const data = json.data?.data || json.data?.results || json.data || [];
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchStocks();
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">🔍 Search Stocks</h1>
        <p className="text-zinc-400">Search for stocks by name or symbol</p>
      </div>

      <TokenInput />

      {/* Search */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search stocks (e.g., bank, technology, BBCA)"
          className="flex-1 max-w-lg px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={searchStocks}
          disabled={loading || !isAuthenticated}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} />
        </div>
      )}

      {loading && <LoadingSpinner />}

      {results.length > 0 && !loading && (
        <div className="space-y-2">
          <p className="text-sm text-zinc-500 mb-4">
            Found {results.length} results
          </p>

          <div className="grid gap-2">
            {results.map((stock, index) => (
              <div
                key={stock.symbol || index}
                className="bg-zinc-800 border border-zinc-700 hover:border-zinc-600 rounded-lg p-4 flex items-center gap-4 transition-colors"
              >
                {stock.icon_url && (
                  <img
                    src={stock.icon_url}
                    alt={stock.symbol}
                    className="w-12 h-12 rounded-lg bg-zinc-700"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-lg">{stock.symbol}</span>
                    {stock.exchange && (
                      <span className="text-xs bg-zinc-700 text-zinc-400 px-2 py-0.5 rounded">
                        {stock.exchange}
                      </span>
                    )}
                    {stock.type && stock.type !== "stock" && (
                      <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">
                        {stock.type}
                      </span>
                    )}
                  </div>
                  <p className="text-zinc-400 text-sm truncate">{stock.name}</p>
                  {(stock.sector || stock.industry) && (
                    <div className="flex gap-2 mt-1">
                      {stock.sector && (
                        <span className="text-xs text-zinc-500">
                          {stock.sector}
                        </span>
                      )}
                      {stock.industry && (
                        <span className="text-xs text-zinc-600">
                          • {stock.industry}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/quote?symbol=${stock.symbol}`}
                    className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 rounded text-sm transition-colors"
                  >
                    Quote
                  </Link>
                  <Link
                    href={`/profile?symbol=${stock.symbol}`}
                    className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 rounded text-sm transition-colors"
                  >
                    Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {results.length === 0 && !loading && !error && query && (
        <p className="text-zinc-500 text-center py-8">
          No results found for &quot;{query}&quot;
        </p>
      )}

      {!query && !loading && (
        <div className="text-center py-12">
          <p className="text-zinc-500 mb-4">
            Enter a search term to find stocks
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {["bank", "mining", "technology", "consumer", "property"].map(
              (term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-full text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  {term}
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
