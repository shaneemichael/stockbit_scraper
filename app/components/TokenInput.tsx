"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function TokenInput() {
  const {
    accessToken,
    refreshToken,
    setAccessToken,
    setRefreshToken,
    refreshAccessToken,
    isAuthenticated,
  } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState(!isAuthenticated);
  const [message, setMessage] = useState("");

  const handleRefresh = async () => {
    setRefreshing(true);
    setMessage("");
    const success = await refreshAccessToken();
    if (success) {
      setMessage("Token refreshed successfully!");
    } else {
      setMessage("Failed to refresh token");
    }
    setRefreshing(false);
  };

  return (
    <div className="bg-zinc-800 rounded-lg border border-zinc-700 mb-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {isAuthenticated ? "🔓 Authenticated" : "🔒 Authentication Required"}
          </span>
          {isAuthenticated && (
            <span className="text-xs text-zinc-500">
              (click to {expanded ? "hide" : "show"})
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-zinc-400 transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-zinc-700 pt-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-zinc-300">
              Access Token
            </label>
            <input
              type="text"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="Paste your access token..."
              className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {message && (
            <p
              className={`text-sm ${
                message.includes("success") ? "text-green-400" : "text-red-400"
              }`}
            >
              {message}
            </p>
          )}

          <p className="text-xs text-zinc-500">
            Get tokens from Stockbit: DevTools → Application → Local Storage →
            persist:root → auth
          </p>
        </div>
      )}
    </div>
  );
}
