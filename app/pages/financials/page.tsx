"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import TokenInput from "../../components/TokenInput";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";

interface ParsedTable {
  headers: string[];
  rows: string[][];
}

interface FinancialsResponse {
  data?: {
    html?: string;
    [key: string]: unknown;
  };
}

const POPULAR_STOCKS = [
  { code: "BBCA", name: "Bank Central Asia" },
  { code: "BBRI", name: "Bank Rakyat Indonesia" },
  { code: "BMRI", name: "Bank Mandiri" },
  { code: "TLKM", name: "Telkom Indonesia" },
  { code: "ASII", name: "Astra International" },
  { code: "UNVR", name: "Unilever Indonesia" },
  { code: "ICBP", name: "Indofood CBP" },
  { code: "GOTO", name: "GoTo Gojek Tokopedia" },
];

// Parse HTML table string into structured data
function parseHtmlTable(html: string): ParsedTable[] {
  const tables: ParsedTable[] = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const tableElements = doc.querySelectorAll("table");

  tableElements.forEach((table) => {
    const headers: string[] = [];
    const rows: string[][] = [];

    // Parse headers from thead or first row
    const headerRow = table.querySelector("thead tr") || table.querySelector("tr");
    if (headerRow) {
      const headerCells = headerRow.querySelectorAll("th, td");
      headerCells.forEach((cell) => {
        headers.push(cell.textContent?.trim() || "");
      });
    }

    // Parse body rows
    const bodyRows = table.querySelectorAll("tbody tr");
    if (bodyRows.length > 0) {
      bodyRows.forEach((row) => {
        const cells: string[] = [];
        row.querySelectorAll("td, th").forEach((cell) => {
          cells.push(cell.textContent?.trim() || "");
        });
        if (cells.length > 0) {
          rows.push(cells);
        }
      });
    } else {
      // If no tbody, get all tr except the header
      const allRows = table.querySelectorAll("tr");
      allRows.forEach((row, idx) => {
        if (idx === 0 && headers.length > 0) return; // Skip header row
        const cells: string[] = [];
        row.querySelectorAll("td, th").forEach((cell) => {
          cells.push(cell.textContent?.trim() || "");
        });
        if (cells.length > 0) {
          rows.push(cells);
        }
      });
    }

    if (headers.length > 0 || rows.length > 0) {
      tables.push({ headers, rows });
    }
  });

  return tables;
}

// Try to find HTML content in the response recursively
function findHtmlContent(obj: unknown): string | null {
  if (typeof obj === "string") {
    // Check if it looks like HTML
    if (obj.includes("<table") || obj.includes("<tr") || obj.includes("<td")) {
      return obj;
    }
  }
  if (typeof obj === "object" && obj !== null) {
    for (const value of Object.values(obj)) {
      const found = findHtmlContent(value);
      if (found) return found;
    }
  }
  return null;
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

  // Parse the HTML tables from the response
  const parsedTables = useMemo(() => {
    if (!financials) return [];
    const htmlContent = findHtmlContent(financials);
    if (!htmlContent) return [];
    return parseHtmlTable(htmlContent);
  }, [financials]);

  const currentTable = parsedTables[activeTableIndex];

  const formatValue = (value: string): string => {
    if (!value || value === "-" || value === "") return "-";
    // Try to parse as number
    const cleaned = value.replace(/,/g, "").replace(/\s/g, "");
    const num = parseFloat(cleaned);
    if (!isNaN(num) && cleaned.match(/^-?\d+\.?\d*$/)) {
      if (Math.abs(num) >= 1e12) return (num / 1e12).toFixed(2) + "T";
      if (Math.abs(num) >= 1e9) return (num / 1e9).toFixed(2) + "B";
      if (Math.abs(num) >= 1e6) return (num / 1e6).toFixed(2) + "M";
      return num.toLocaleString("id-ID");
    }
    return value;
  };

  const getValueColor = (value: string, colIndex: number): string => {
    if (colIndex === 0) return "text-zinc-200"; // First column is label
    if (!value || value === "-" || value === "") return "text-zinc-400";
    const cleaned = value.replace(/,/g, "").replace(/\s/g, "");
    const num = parseFloat(cleaned);
    if (isNaN(num)) return "text-zinc-300";
    if (num > 0) return "text-green-400";
    if (num < 0) return "text-red-400";
    return "text-zinc-300";
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

      {/* Search and Period Selection */}
      <div className="space-y-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <div className="flex-1 max-w-xs">
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="Enter stock symbol (e.g., BBCA)"
              className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={fetchFinancials}
            disabled={loading || !isAuthenticated}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
          >
            {loading ? "Loading..." : "Fetch Financials"}
          </button>
        </div>
      </div>

      {/* Popular Stocks */}
      <div className="mb-6">
        <p className="text-sm text-zinc-500 mb-2">Popular stocks:</p>
        <div className="flex flex-wrap gap-2">
          {POPULAR_STOCKS.map((stock) => (
            <button
              key={stock.code}
              onClick={() => setSymbol(stock.code)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                symbol === stock.code
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700"
              }`}
              title={stock.name}
            >
              {stock.code}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} />
        </div>
      )}

      {loading && <LoadingSpinner />}

      {financials && !loading && (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">{symbol}</h2>
                <p className="text-zinc-400">
                  Annual Financial Statements
                </p>
              </div>
              <div className="flex gap-2">
                <span
                  className={`px-3 py-1 text-sm rounded-lg "bg-purple-500/20 text-purple-400"
                  }`}
                >
                </span>
              </div>
            </div>
          </div>

          {/* Table Tabs - if multiple tables found */}
          {parsedTables.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {parsedTables.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTableIndex(idx)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTableIndex === idx
                      ? "bg-blue-600 text-white"
                      : "bg-zinc-800 text-zinc-400 hover:text-white"
                  }`}
                >
                  Table {idx + 1}
                </button>
              ))}
            </div>
          )}

          {/* Financial Data Table */}
          {currentTable && currentTable.rows.length > 0 ? (
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full">
                  {currentTable.headers.length > 0 && (
                    <thead className="bg-zinc-900">
                      <tr>
                        {currentTable.headers.map((header, idx) => (
                          <th
                            key={idx}
                            className={`px-4 py-3 text-xs font-medium text-zinc-400 uppercase min-w-[120px] ${
                              idx === 0
                                ? "text-left sticky left-0 bg-zinc-900 min-w-[200px]"
                                : "text-right"
                            }`}
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                  )}
                  <tbody className="divide-y divide-zinc-700">
                    {currentTable.rows.map((row, rowIdx) => (
                      <tr key={rowIdx} className="hover:bg-zinc-750">
                        {row.map((cell, cellIdx) => (
                          <td
                            key={cellIdx}
                            className={`px-4 py-3 ${
                              cellIdx === 0
                                ? "sticky left-0 bg-zinc-800 font-medium text-zinc-200"
                                : `text-right font-mono ${getValueColor(cell, cellIdx)}`
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
            </div>
          ) : parsedTables.length === 0 ? (
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden">
              <div className="p-4">
                <p className="text-sm text-zinc-500 mb-2">Raw financial data:</p>
                <pre className="text-sm text-zinc-300 whitespace-pre-wrap overflow-x-auto max-h-[500px]">
                  {JSON.stringify(financials, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-8 text-center">
              <p className="text-zinc-500">No data available in this table</p>
            </div>
          )}
        </div>
      )}

      {!financials && !loading && !error && (
        <p className="text-zinc-500 text-center py-8">
          Select a stock and click Fetch Financials to see financial statements
        </p>
      )}
    </div>
  );
}
