"use client";

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import TokenInput from "../../components/TokenInput";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";

interface BrokerTransaction {
  stockCode: string;
  type: "Lokal" | "Asing";
  side: "buy" | "sell";
  lot: number;
  value: number;
  avgPrice: number;
  valueFormatted: string;
  avgPriceFormatted: string;
}

interface BrokerSummary {
  brokerCode: string;
  brokerName: string;
  date: string;
  buys: BrokerTransaction[];
  sells: BrokerTransaction[];
  totalBuyValue: string;
  totalSellValue: string;
  netValue: string;
}

const POPULAR_BROKERS = [
  { code: "XL", name: "Stockbit Sekuritas Digital" },
  { code: "CC", name: "Mandiri Sekuritas" },
  { code: "YP", name: "Mirae Asset Sekuritas" },
  { code: "AK", name: "Indo Premier Sekuritas" },
  { code: "NI", name: "BNI Sekuritas" },
  { code: "PD", name: "CGS-CIMB Sekuritas" },
  { code: "KZ", name: "Ajaib Sekuritas" },
  { code: "GR", name: "Sinarmas Sekuritas" },
];

// Get today and 7 days ago as default date range
const getDefaultDates = () => {
  const today = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(today.getDate() - 7);
  
  return {
    endDate: today.toISOString().split("T")[0],
    startDate: weekAgo.toISOString().split("T")[0],
  };
};

export default function BrokerPage() {
  const { accessToken, isAuthenticated } = useAuth();
  const [brokerCode, setBrokerCode] = useState("XL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<BrokerSummary | null>(null);
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");
  
  // Date range state
  const defaultDates = getDefaultDates();
  const [startDate, setStartDate] = useState(defaultDates.startDate);
  const [endDate, setEndDate] = useState(defaultDates.endDate);

  const fetchBrokerActivity = async () => {
    if (!accessToken) {
      setError("Please enter your access token first");
      return;
    }

    if (!brokerCode) {
      setError("Please enter a broker code");
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
          type: "broker-summary",
          brokerCode: brokerCode.toUpperCase(),
          startDate,
          endDate,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to fetch broker activity");
      }

      setData(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatLot = (lot: number) => {
    if (lot >= 1e6) return (lot / 1e6).toFixed(2) + "M";
    if (lot >= 1e3) return (lot / 1e3).toFixed(2) + "K";
    return lot.toFixed(0);
  };

  const transactions = data
    ? activeTab === "buy"
      ? data.buys
      : data.sells
    : [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">🏦 Broker Activity</h1>
        <p className="text-zinc-400">
          View broker buy and sell transactions
        </p>
      </div>

      <TokenInput />

      {/* Search and Date Range */}
      <div className="space-y-4 mb-6">
        {/* Broker Code and Fetch Button */}
        <div className="flex flex-wrap gap-2">
          <div className="flex-1 max-w-xs">
            <input
              type="text"
              value={brokerCode}
              onChange={(e) => setBrokerCode(e.target.value.toUpperCase())}
              placeholder="Enter broker code (e.g., XL)"
              className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={fetchBrokerActivity}
            disabled={loading || !isAuthenticated}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
          >
            {loading ? "Loading..." : "Fetch Activity"}
          </button>
        </div>

        {/* Date Range */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-zinc-400">Date range:</span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <span className="text-zinc-500">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          {/* Quick date presets */}
          <div className="flex gap-1">
            {[
              { label: "1D", days: 1 },
              { label: "1W", days: 7 },
              { label: "1M", days: 30 },
              { label: "3M", days: 90 },
            ].map(({ label, days }) => (
              <button
                key={label}
                onClick={() => {
                  const end = new Date();
                  const start = new Date();
                  start.setDate(end.getDate() - days);
                  setEndDate(end.toISOString().split("T")[0]);
                  setStartDate(start.toISOString().split("T")[0]);
                }}
                className="px-2 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Brokers */}
      <div className="mb-6">
        <p className="text-sm text-zinc-500 mb-2">Popular brokers:</p>
        <div className="flex flex-wrap gap-2">
          {POPULAR_BROKERS.map((broker) => (
            <button
              key={broker.code}
              onClick={() => setBrokerCode(broker.code)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                brokerCode === broker.code
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700"
              }`}
              title={broker.name}
            >
              {broker.code}
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

      {data && !loading && (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">{data.brokerCode}</h2>
                <p className="text-zinc-400">{data.brokerName}</p>
              </div>
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-sm text-zinc-500">Total Buy</p>
                  <p className="text-xl font-bold text-green-400">
                    {data.totalBuyValue}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Total Sell</p>
                  <p className="text-xl font-bold text-red-400">
                    {data.totalSellValue}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Net</p>
                  <p
                    className={`text-xl font-bold ${
                      data.netValue.startsWith("-")
                        ? "text-red-400"
                        : "text-green-400"
                    }`}
                  >
                    {data.netValue}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("buy")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "buy"
                  ? "bg-green-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              Buy ({data.buys.length})
            </button>
            <button
              onClick={() => setActiveTab("sell")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "sell"
                  ? "bg-red-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              Sell ({data.sells.length})
            </button>
          </div>

          {/* Transactions Table */}
          <div className="bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">
                      Stock
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">
                      Type
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-zinc-400 uppercase">
                      Lot
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-zinc-400 uppercase">
                      Value
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-zinc-400 uppercase">
                      Avg Price
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-700">
                  {transactions.map((tx, index) => (
                    <tr
                      key={`${tx.stockCode}-${index}`}
                      className="hover:bg-zinc-750"
                    >
                      <td className="px-4 py-3">
                        <span className="font-medium">{tx.stockCode}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            tx.type === "Asing"
                              ? "bg-purple-500/20 text-purple-400"
                              : "bg-blue-500/20 text-blue-400"
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {formatLot(tx.lot)}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-mono font-medium ${
                          activeTab === "buy" ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {tx.valueFormatted}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-zinc-300">
                        {tx.avgPriceFormatted}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {transactions.length === 0 && (
            <p className="text-center text-zinc-500 py-8">
              No {activeTab} transactions found
            </p>
          )}
        </div>
      )}

      {!data && !loading && !error && (
        <p className="text-zinc-500 text-center py-8">
          Select a broker and click Fetch Activity to see transactions
        </p>
      )}
    </div>
  );
}
