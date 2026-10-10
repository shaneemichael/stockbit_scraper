"use client";

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import TokenInput from "../../components/TokenInput";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";
import { Badge, Button, Card, DateRange, EmptyState, PageHeader, daysAgo, inputClass, rowClass, thClass, today } from "../../components/ui";
import { ChevronLeftIcon, ChevronRightIcon } from "../../components/icons";

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

const ACTION_BADGE: Record<string, { label: string; tone: "up" | "down" | "blue" }> = {
  ACTION_TYPE_BUY: { label: "Buy", tone: "up" },
  ACTION_TYPE_SELL: { label: "Sell", tone: "down" },
  ACTION_TYPE_TRANSFER: { label: "Transfer", tone: "blue" },
};

const NATIONALITY_BADGE: Record<string, { label: string; tone: "blue" | "purple" }> = {
  NATIONALITY_TYPE_LOCAL: { label: "Local", tone: "blue" },
  NATIONALITY_TYPE_FOREIGN: { label: "Foreign", tone: "purple" },
};

const BROKER_GROUP: Record<string, { label: string; color: string }> = {
  BROKER_GROUP_LOCAL: { label: "Local", color: "text-blue-400" },
  BROKER_GROUP_FOREIGN: { label: "Foreign", color: "text-violet-300" },
  BROKER_GROUP_GOVERNMENT: { label: "Gov", color: "text-amber-300" },
};

export default function InsiderPage() {
  const { accessToken, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<InsiderData | null>(null);

  const [startDate, setStartDate] = useState(() => daysAgo(30));
  const [endDate, setEndDate] = useState(today);

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

  const getChangeColor = (value: string) => {
    if (value.startsWith("+")) return "text-emerald-400";
    if (value.startsWith("-")) return "text-red-400";
    return "text-zinc-400";
  };

  const pager = data && (
    <div className="flex items-center gap-2">
      <Button
        variant="secondary"
        aria-label="Previous page"
        onClick={() => fetchInsiderActivity(page - 1)}
        disabled={page <= 1 || loading}
        className="px-2.5"
      >
        <ChevronLeftIcon />
      </Button>
      <span className="min-w-16 text-center text-sm text-zinc-400 tabular-nums">Page {page}</span>
      <Button
        variant="secondary"
        aria-label="Next page"
        onClick={() => fetchInsiderActivity(page + 1)}
        disabled={!data.is_more || loading}
        className="px-2.5"
      >
        <ChevronRightIcon />
      </Button>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Insider Activity"
        description="Major shareholder movements and insider transactions."
      />

      <TokenInput />

      <form
        className="mb-6 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          fetchInsiderActivity(1);
        }}
      >
        <DateRange
          startDate={startDate}
          endDate={endDate}
          onChange={(start, end) => {
            setStartDate(start);
            setEndDate(end);
          }}
          presets={[
            { label: "1W", days: 7 },
            { label: "1M", days: 30 },
            { label: "3M", days: 90 },
            { label: "6M", days: 180 },
          ]}
        />
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Action type"
            value={actionType}
            onChange={(e) => setActionType(e.target.value)}
            className={`${inputClass} cursor-pointer`}
          >
            {ACTION_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <select
            aria-label="Data source"
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value)}
            className={`${inputClass} cursor-pointer`}
          >
            {SOURCE_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <Button type="submit" disabled={loading || !isAuthenticated}>
            {loading ? "Loading..." : "Fetch activity"}
          </Button>
        </div>
      </form>

      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} />
        </div>
      )}

      {loading && <LoadingSpinner />}

      {data && !loading && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-zinc-500">
              {data.movement.length} movements on this page
            </p>
            {pager}
          </div>

          {data.movement.length > 0 ? (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-950/60 border-b border-zinc-800">
                    <tr>
                      <th className={`${thClass} text-left`}>Date</th>
                      <th className={`${thClass} text-left`}>Symbol</th>
                      <th className={`${thClass} text-left`}>Name</th>
                      <th className={`${thClass} text-center`}>Action</th>
                      <th className={`${thClass} text-right`}>Previous</th>
                      <th className={`${thClass} text-right`}>Current</th>
                      <th className={`${thClass} text-right`}>Change</th>
                      <th className={`${thClass} text-center`}>Nationality</th>
                      <th className={`${thClass} text-center`}>Broker</th>
                      <th className={`${thClass} text-center`}>Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {data.movement.map((item, index) => {
                      const action = ACTION_BADGE[item.action_type];
                      const nationality = NATIONALITY_BADGE[item.nationality];
                      const brokerGroup = BROKER_GROUP[item.broker_detail.group];
                      return (
                        <tr key={`${item.id}-${index}`} className={rowClass}>
                          <td className="px-4 py-2.5 text-zinc-400 whitespace-nowrap tabular-nums">
                            {item.date}
                          </td>
                          <td className="px-4 py-2.5 font-semibold">{item.symbol}</td>
                          <td className="px-4 py-2.5">
                            <div className="max-w-xs">
                              <p className="text-zinc-300 truncate" title={item.name}>
                                {item.name}
                              </p>
                              {item.badges.length > 0 && (
                                <div className="flex gap-1 mt-1">
                                  {item.badges.map((badge) => (
                                    <Badge key={badge} tone="amber">
                                      {badge.replace("SHAREHOLDER_BADGE_", "")}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            {action ? (
                              <Badge tone={action.tone}>{action.label}</Badge>
                            ) : (
                              <Badge>Unknown</Badge>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-right tabular-nums">
                            <p className="font-mono text-zinc-300">{item.previous.value}</p>
                            <p className="text-xs text-zinc-500">{item.previous.percentage}%</p>
                          </td>
                          <td className="px-4 py-2.5 text-right tabular-nums">
                            <p className="font-mono text-zinc-300">{item.current.value}</p>
                            <p className="text-xs text-zinc-500">{item.current.percentage}%</p>
                          </td>
                          <td className="px-4 py-2.5 text-right tabular-nums">
                            <p className={`font-mono ${getChangeColor(item.changes.value)}`}>
                              {item.changes.value}
                            </p>
                            <p className={`text-xs ${getChangeColor(item.changes.percentage)}`}>
                              {item.changes.percentage}%
                            </p>
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            {nationality ? (
                              <Badge tone={nationality.tone}>{nationality.label}</Badge>
                            ) : (
                              <span className="text-zinc-500">-</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            {item.broker_detail.code ? (
                              <>
                                <p className="font-medium">{item.broker_detail.code}</p>
                                <p className={`text-xs ${brokerGroup?.color ?? "text-zinc-500"}`}>
                                  {brokerGroup?.label ?? "-"}
                                </p>
                              </>
                            ) : (
                              <span className="text-zinc-500">-</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-center text-xs text-zinc-400">
                            {item.data_source.type.replace("SOURCE_TYPE_", "")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <EmptyState>No insider activity for the selected filters.</EmptyState>
          )}

          {data.movement.length > 0 && <div className="flex justify-center">{pager}</div>}
        </div>
      )}

      {!data && !loading && !error && (
        <EmptyState>Set your filters and click Fetch activity to see insider movements.</EmptyState>
      )}
    </div>
  );
}
