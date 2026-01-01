"use client";

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import TokenInput from "../../components/TokenInput";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";

interface InsiderMovement {
  id: string;
  name: string;
  symbol: string;
  date: string;
  previous: {
    value: string;
    percentage: string;
  };
  current: {
    value: string;
    percentage: string;
  };
  changes: {
    value: string;
    percentage: string;
    formatted_value: string;
  };
  nationality: string;
  action_type: string;
  data_source: {
    label: string;
    type: string;
  };
  broker_detail: {
    code: string;
    group: string;
  };
  badges: string[];
}

interface InsiderData {
  is_more: boolean;
  movement: InsiderMovement[];
}

const ACTION_TYPES = [
  { value: "ACTION_TYPE_UNSPECIFIED", label: "All Actions" },
  { value: "ACTION_TYPE_BUY", label: "Buy" },
  { value: "ACTION_TYPE_SELL", label: "Sell" },
  { value: "ACTION_TYPE_TRANSFER", label: "Transfer" },
];

const SOURCE_TYPES = [
  { value: "SOURCE_TYPE_UNSPECIFIED", label: "All Sources" },
  { value: "SOURCE_TYPE_KSEI", label: "KSEI" },
  { value: "SOURCE_TYPE_IDX", label: "IDX" },
];

// Get today and 30 days ago as default date range
const getDefaultDates = () => {
  const today = new Date();
  const monthAgo = new Date();
  monthAgo.setDate(today.getDate() - 30);

  return {
    endDate: today.toISOString().split("T")[0],
    startDate: monthAgo.toISOString().split("T")[0],
  };
};

export default function InsiderPage() {
  const { accessToken, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<InsiderData | null>(null);

  // Date range state
  const defaultDates = getDefaultDates();
  const [startDate, setStartDate] = useState(defaultDates.startDate);
  const [endDate, setEndDate] = useState(defaultDates.endDate);

  // Filter state
  const [actionType, setActionType] = useState("ACTION_TYPE_UNSPECIFIED");
  const [sourceType, setSourceType] = useState("SOURCE_TYPE_UNSPECIFIED");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const fetchInsiderActivity = async (newPage: number = page) => {
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
        body: JSON.stringify({
          type: "insider",
          startDate,
          endDate,
          page: newPage,
          limit,
          actionType,
          sourceType,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to fetch insider activity");
      }

      setData(json.data);
      setPage(newPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case "ACTION_TYPE_BUY":
        return "bg-green-500/20 text-green-400";
      case "ACTION_TYPE_SELL":
        return "bg-red-500/20 text-red-400";
      case "ACTION_TYPE_TRANSFER":
        return "bg-blue-500/20 text-blue-400";
      default:
        return "bg-zinc-500/20 text-zinc-400";
    }
  };

  const getActionLabel = (actionType: string) => {
    switch (actionType) {
      case "ACTION_TYPE_BUY":
        return "Buy";
      case "ACTION_TYPE_SELL":
        return "Sell";
      case "ACTION_TYPE_TRANSFER":
        return "Transfer";
      default:
        return "Unknown";
    }
  };

  const getNationalityLabel = (nationality: string) => {
    switch (nationality) {
      case "NATIONALITY_TYPE_LOCAL":
        return { label: "Local", color: "bg-blue-500/20 text-blue-400" };
      case "NATIONALITY_TYPE_FOREIGN":
        return { label: "Foreign", color: "bg-purple-500/20 text-purple-400" };
      default:
        return { label: "-", color: "bg-zinc-500/20 text-zinc-400" };
    }
  };

  const getBrokerGroupLabel = (group: string) => {
    switch (group) {
      case "BROKER_GROUP_LOCAL":
        return { label: "Local", color: "text-blue-400" };
      case "BROKER_GROUP_FOREIGN":
        return { label: "Foreign", color: "text-purple-400" };
      case "BROKER_GROUP_GOVERNMENT":
        return { label: "Gov", color: "text-yellow-400" };
      default:
        return { label: "-", color: "text-zinc-400" };
    }
  };

  const getChangeColor = (value: string) => {
    if (value.startsWith("+")) return "text-green-400";
    if (value.startsWith("-")) return "text-red-400";
    return "text-zinc-400";
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">👔 Insider Activity</h1>
        <p className="text-zinc-400">
          Track major shareholder movements and insider transactions
        </p>
      </div>

      <TokenInput />

      {/* Filters */}
      <div className="space-y-4 mb-6">
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
              { label: "1W", days: 7 },
              { label: "1M", days: 30 },
              { label: "3M", days: 90 },
              { label: "6M", days: 180 },
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

        {/* Action Type and Source Type Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-400">Action:</span>
            <select
              value={actionType}
              onChange={(e) => setActionType(e.target.value)}
              className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              {ACTION_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-400">Source:</span>
            <select
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value)}
              className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              {SOURCE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => fetchInsiderActivity(1)}
            disabled={loading || !isAuthenticated}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
          >
            {loading ? "Loading..." : "Fetch Activity"}
          </button>
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
          {/* Summary */}
          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-sm text-zinc-500">Total Results</p>
                  <p className="text-xl font-bold">{data.movement.length}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Page</p>
                  <p className="text-xl font-bold">{page}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchInsiderActivity(page - 1)}
                  disabled={page <= 1 || loading}
                  className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => fetchInsiderActivity(page + 1)}
                  disabled={!data.is_more || loading}
                  className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* Movements Table */}
          <div className="bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden">
            <div className="overflow-x-auto custom-sc">
              <table className="w-full">
                <thead className="bg-zinc-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">
                      Symbol
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">
                      Name
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-zinc-400 uppercase">
                      Action
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-zinc-400 uppercase">
                      Previous (%)
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-zinc-400 uppercase">
                      Current (%)
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-zinc-400 uppercase">
                      Change
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-zinc-400 uppercase">
                      Nationality
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-zinc-400 uppercase">
                      Broker
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-zinc-400 uppercase">
                      Source
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-700">
                  {data.movement.map((item, index) => {
                    const nationality = getNationalityLabel(item.nationality);
                    const brokerGroup = getBrokerGroupLabel(item.broker_detail.group);
                    return (
                      <tr
                        key={`${item.id}-${index}`}
                        className="hover:bg-zinc-750"
                      >
                        <td className="px-4 py-3 text-sm text-zinc-300">
                          {item.date}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-white">
                            {item.symbol}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="max-w-xs">
                            <p className="text-sm text-zinc-300 truncate" title={item.name}>
                              {item.name}
                            </p>
                            {item.badges.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {item.badges.map((badge) => (
                                  <span
                                    key={badge}
                                    className="text-xs bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded"
                                  >
                                    {badge.replace("SHAREHOLDER_BADGE_", "")}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`text-xs px-2 py-1 rounded ${getActionColor(
                              item.action_type
                            )}`}
                          >
                            {getActionLabel(item.action_type)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="text-sm">
                            <p className="text-zinc-300 font-mono">
                              {item.previous.value}
                            </p>
                            <p className="text-xs text-zinc-500">
                              {item.previous.percentage}%
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="text-sm">
                            <p className="text-zinc-300 font-mono">
                              {item.current.value}
                            </p>
                            <p className="text-xs text-zinc-500">
                              {item.current.percentage}%
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="text-sm">
                            <p
                              className={`font-mono font-medium ${getChangeColor(
                                item.changes.value
                              )}`}
                            >
                              {item.changes.value}
                            </p>
                            <p
                              className={`text-xs ${getChangeColor(
                                item.changes.percentage
                              )}`}
                            >
                              {item.changes.percentage}%
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`text-xs px-2 py-1 rounded ${nationality.color}`}
                          >
                            {nationality.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {item.broker_detail.code ? (
                            <div className="text-sm">
                              <p className="font-medium text-white">
                                {item.broker_detail.code}
                              </p>
                              <p className={`text-xs ${brokerGroup.color}`}>
                                {brokerGroup.label}
                              </p>
                            </div>
                          ) : (
                            <span className="text-zinc-500">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-xs text-zinc-400">
                            {item.data_source.type.replace("SOURCE_TYPE_", "")}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {data.movement.length === 0 && (
            <p className="text-center text-zinc-500 py-8">
              No insider activity found for the selected filters
            </p>
          )}

          {/* Pagination at bottom */}
          {data.movement.length > 0 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => fetchInsiderActivity(page - 1)}
                disabled={page <= 1 || loading}
                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-zinc-400">Page {page}</span>
              <button
                onClick={() => fetchInsiderActivity(page + 1)}
                disabled={!data.is_more || loading}
                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {!data && !loading && !error && (
        <p className="text-zinc-500 text-center py-8">
          Configure your filters and click Fetch Activity to see insider movements
        </p>
      )}
    </div>
  );
}
