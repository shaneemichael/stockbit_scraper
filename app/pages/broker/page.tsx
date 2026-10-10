"use client";

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import TokenInput from "../../components/TokenInput";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";
import { Badge, Button, Card, ChipGroup, DateRange, EmptyState, PageHeader, Stat, daysAgo, inputClass, rowClass, thClass, today } from "../../components/ui";

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

export default function BrokerPage() {
  const { accessToken, isAuthenticated } = useAuth();
  const [brokerCode, setBrokerCode] = useState("XL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<BrokerSummary | null>(null);
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");
  
  const [startDate, setStartDate] = useState(() => daysAgo(7));
  const [endDate, setEndDate] = useState(today);

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
      <PageHeader
        title="Broker Activity"
        description="Broker buy and sell transactions over a date range."
      />

      <TokenInput />

      <form
        className="mb-4 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          fetchBrokerActivity();
        }}
      >
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            aria-label="Broker code"
            value={brokerCode}
            onChange={(e) => setBrokerCode(e.target.value.toUpperCase())}
            placeholder="Broker code, e.g. XL"
            className={`${inputClass} w-full max-w-xs font-mono uppercase`}
          />
          <Button type="submit" disabled={loading || !isAuthenticated}>
            {loading ? "Loading..." : "Fetch activity"}
          </Button>
        </div>
        <DateRange
          startDate={startDate}
          endDate={endDate}
          onChange={(start, end) => {
            setStartDate(start);
            setEndDate(end);
          }}
          presets={[
            { label: "1D", days: 1 },
            { label: "1W", days: 7 },
            { label: "1M", days: 30 },
            { label: "3M", days: 90 },
          ]}
        />
      </form>

      <div className="mb-6">
        <ChipGroup
          label="Popular"
          options={POPULAR_BROKERS.map((b) => ({ value: b.code, label: b.code, title: b.name }))}
          value={brokerCode}
          onChange={setBrokerCode}
        />
      </div>

      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} />
        </div>
      )}

      {loading && <LoadingSpinner />}

      {data && !loading && (
        <div className="space-y-4">
          <Card className="p-5 flex flex-wrap items-start justify-between gap-6">
            <div>
              <h2 className="text-xl font-semibold">{data.brokerCode}</h2>
              <p className="text-sm text-zinc-500">{data.brokerName}</p>
            </div>
            <div className="grid grid-cols-3 gap-8">
              <Stat label="Total buy" value={data.totalBuyValue} tone="up" />
              <Stat label="Total sell" value={data.totalSellValue} tone="down" />
              <Stat
                label="Net"
                value={data.netValue}
                tone={data.netValue.startsWith("-") ? "down" : "up"}
              />
            </div>
          </Card>

          <ChipGroup
            options={[
              { value: "buy" as const, label: `Buy (${data.buys.length})` },
              { value: "sell" as const, label: `Sell (${data.sells.length})` },
            ]}
            value={activeTab}
            onChange={setActiveTab}
          />

          {transactions.length > 0 ? (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-950/60 border-b border-zinc-800">
                    <tr>
                      <th className={`${thClass} text-left`}>Stock</th>
                      <th className={`${thClass} text-left`}>Type</th>
                      <th className={`${thClass} text-right`}>Lot</th>
                      <th className={`${thClass} text-right`}>Value</th>
                      <th className={`${thClass} text-right`}>Avg price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {transactions.map((tx, index) => (
                      <tr key={`${tx.stockCode}-${index}`} className={rowClass}>
                        <td className="px-4 py-2.5 font-medium">{tx.stockCode}</td>
                        <td className="px-4 py-2.5">
                          <Badge tone={tx.type === "Asing" ? "purple" : "blue"}>{tx.type}</Badge>
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono tabular-nums text-zinc-300">
                          {formatLot(tx.lot)}
                        </td>
                        <td
                          className={`px-4 py-2.5 text-right font-mono tabular-nums ${
                            activeTab === "buy" ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          {tx.valueFormatted}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono tabular-nums text-zinc-300">
                          {tx.avgPriceFormatted}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <EmptyState>No {activeTab} transactions in this range.</EmptyState>
          )}
        </div>
      )}

      {!data && !loading && !error && (
        <EmptyState>Pick a broker and click Fetch activity to see transactions.</EmptyState>
      )}
    </div>
  );
}
