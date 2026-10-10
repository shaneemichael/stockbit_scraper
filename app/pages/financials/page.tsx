"use client";
import { POPULAR_STOCKS } from "../../consts/popularStocks";
import { useState, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import TokenInput from "../../components/TokenInput";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";
import { Button, Card, ChipGroup, EmptyState, PageHeader, inputClass, rowClass, thClass } from "../../components/ui";
import { findHtmlContent } from "../../utils/findHtmlObject";
import { formatValue } from "../../utils/formatValue";
import { parseHtmlTable } from "../../utils/parseHtmlTable";

interface FinancialsResponse {
  data?: {
    html?: string;
    [key: string]: unknown;
  };
}

export default function FinancialsPage() {
  const { accessToken, isAuthenticated } = useAuth();
  const [symbol, setSymbol] = useState("BBCA");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [financials, setFinancials] = useState<FinancialsResponse | null>(null);
  const [activeTableIndex, setActiveTableIndex] = useState(0);

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
    setActiveTableIndex(0);

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

  const parsedTables = useMemo(() => {
    if (!financials) return [];
    const htmlContent = findHtmlContent(financials);
    if (!htmlContent) return [];
    return parseHtmlTable(htmlContent);
  }, [financials]);

  const currentTable = parsedTables[activeTableIndex];

  const getValueColor = (value: string, colIndex: number): string => {
    if (colIndex === 0) return "text-zinc-200"; // First column is label
    if (!value || value === "-" || value === "") return "text-zinc-400";
    const cleaned = value.replace(/,/g, "").replace(/\s/g, "");
    const num = parseFloat(cleaned);
    if (isNaN(num)) return "text-zinc-300";
    if (num > 0) return "text-emerald-400";
    if (num < 0) return "text-red-400";
    return "text-zinc-300";
  };

  return (
    <div>
      <PageHeader
        title="Financials"
        description="Annual financial statements and reports."
      />

      <TokenInput />

      <form
        className="mb-4 flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          fetchFinancials();
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
          {loading ? "Loading..." : "Fetch financials"}
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

      {financials && !loading && (
        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="text-xl font-semibold">{symbol}</h2>
            <p className="text-sm text-zinc-500">Annual financial statements</p>
          </Card>

          {parsedTables.length > 1 && (
            <ChipGroup
              label="Table"
              options={parsedTables.map((_, idx) => ({ value: String(idx), label: `Table ${idx + 1}` }))}
              value={String(activeTableIndex)}
              onChange={(v) => setActiveTableIndex(Number(v))}
            />
          )}

          {currentTable && currentTable.rows.length > 0 ? (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-sm">
                  {currentTable.headers.length > 0 && (
                    <thead className="border-b border-zinc-800">
                      <tr>
                        {currentTable.headers.map((header, idx) => (
                          <th
                            key={idx}
                            className={`${thClass} ${
                              idx === 0
                                ? "text-left sticky left-0 z-10 bg-zinc-900 min-w-[220px]"
                                : "text-right min-w-[120px] bg-zinc-950/60"
                            }`}
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                  )}
                  <tbody className="divide-y divide-zinc-800">
                    {currentTable.rows.map((row, rowIdx) => (
                      <tr key={rowIdx} className={rowClass}>
                        {row.map((cell, cellIdx) => (
                          <td
                            key={cellIdx}
                            className={`px-4 py-2.5 ${
                              cellIdx === 0
                                ? "sticky left-0 bg-zinc-900 text-zinc-200"
                                : `text-right font-mono tabular-nums ${getValueColor(cell, cellIdx)}`
                            }`}
                          >
                            {cellIdx === 0 ? cell : formatValue(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : parsedTables.length === 0 ? (
            <Card className="p-4">
              <p className="mb-2 text-xs text-zinc-500">No table found. Raw response:</p>
              <pre className="max-h-[500px] overflow-auto custom-scrollbar text-xs text-zinc-300 whitespace-pre-wrap">
                {JSON.stringify(financials, null, 2)}
              </pre>
            </Card>
          ) : (
            <EmptyState>No data in this table.</EmptyState>
          )}
        </div>
      )}

      {!financials && !loading && !error && (
        <EmptyState>Pick a stock and click Fetch financials to see its statements.</EmptyState>
      )}
    </div>
  );
}
