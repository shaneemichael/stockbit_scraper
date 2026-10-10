"use client";

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import TokenInput from "../../components/TokenInput";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";
import { Badge, Button, Card, EmptyState, PageHeader, inputClass } from "../../components/ui";
import { SearchIcon } from "../../components/icons";

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
  const [searchedQuery, setSearchedQuery] = useState("");

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
      setSearchedQuery(query);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Search" description="Find stocks by name or symbol." />

      <TokenInput />

      <form
        className="flex gap-2 mb-6"
        onSubmit={(e) => {
          e.preventDefault();
          searchStocks();
        }}
      >
        <div className="relative flex-1 max-w-lg">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
          <input
            type="search"
            aria-label="Search stocks"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="bank, technology, BBCA..."
            className={`${inputClass} w-full pl-9`}
          />
        </div>
        <Button type="submit" disabled={loading || !isAuthenticated}>
          {loading ? "Searching..." : "Search"}
        </Button>
      </form>

      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} />
        </div>
      )}

      {loading && <LoadingSpinner />}

      {results.length > 0 && !loading && (
        <div>
          <p className="mb-3 text-sm text-zinc-500">{results.length} results</p>
          <div className="grid gap-2">
            {results.map((stock, index) => (
              <Card
                key={stock.symbol || index}
                className="p-4 flex items-center gap-4 hover:border-zinc-700 transition-colors"
              >
                {stock.icon_url && (
                  <img
                    src={stock.icon_url}
                    alt=""
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-lg bg-zinc-800 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{stock.symbol}</span>
                    {stock.exchange && <Badge>{stock.exchange}</Badge>}
                    {stock.type && stock.type !== "stock" && (
                      <Badge tone="purple">{stock.type}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-zinc-400 truncate">{stock.name}</p>
                  {(stock.sector || stock.industry) && (
                    <p className="mt-0.5 text-xs text-zinc-500 truncate">
                      {[stock.sector, stock.industry].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {results.length === 0 && !loading && !error && searchedQuery && (
        <EmptyState>No results for &quot;{searchedQuery}&quot;</EmptyState>
      )}

      {!query && !searchedQuery && !loading && (
        <EmptyState>
          <p className="mb-4">Enter a search term, or try one of these:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {["bank", "mining", "technology", "consumer", "property"].map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => setQuery(term)}
                className="h-8 px-3 rounded-full border border-zinc-800 text-xs text-zinc-400 hover:text-zinc-100 hover:border-zinc-600 cursor-pointer transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </EmptyState>
      )}
    </div>
  );
}
