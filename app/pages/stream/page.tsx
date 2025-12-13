"use client";

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import TokenInput from "../../components/TokenInput";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";

interface StreamPost {
  id: string;
  user_id: string;
  username: string;
  user_photo: string;
  content: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  reposts_count: number;
  symbol: string;
  is_verified: boolean;
  is_premium: boolean;
}

interface StreamData {
  data: StreamPost[];
}

export default function StreamPage() {
  const { accessToken, isAuthenticated } = useAuth();
  const [symbol, setSymbol] = useState("BBCA");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stream, setStream] = useState<StreamPost[]>([]);

  const fetchStream = async () => {
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

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ type: "stream", symbol: symbol.toUpperCase() }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to fetch stream");
      }

      // Handle different response structures
      const posts = json.data?.data || json.data?.posts || json.data || [];
      setStream(Array.isArray(posts) ? posts : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const formatNumber = (num: number) => {
    if (!num) return "0";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">💬 Stream</h1>
        <p className="text-zinc-400">
          Read community posts and discussions about stocks
        </p>
      </div>

      <TokenInput />

      {/* Search */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="Enter stock symbol (e.g., BBCA)"
          className="flex-1 max-w-xs px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={fetchStream}
          disabled={loading || !isAuthenticated}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
        >
          {loading ? "Loading..." : "Fetch Stream"}
        </button>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} />
        </div>
      )}

      {loading && <LoadingSpinner />}

      {stream.length > 0 && !loading && (
        <div className="space-y-4">
          <p className="text-sm text-zinc-500">{stream.length} posts</p>

          {stream.map((post, index) => (
            <div
              key={post.id || index}
              className="bg-zinc-800 border border-zinc-700 rounded-lg p-4"
            >
              {/* Author */}
              <div className="flex items-center gap-3 mb-3">
                {post.user_photo && (
                  <img
                    src={post.user_photo}
                    alt={post.username}
                    className="w-10 h-10 rounded-full bg-zinc-700"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {post.username || "Anonymous"}
                    </span>
                    {post.is_verified && (
                      <svg
                        className="w-4 h-4 text-blue-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {post.is_premium && (
                      <span className="text-xs bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded">
                        Premium
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500">
                    {formatDate(post.created_at)}
                  </p>
                </div>
                {post.symbol && (
                  <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                    ${post.symbol}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="text-zinc-300 text-sm leading-relaxed mb-3 whitespace-pre-wrap">
                {post.content}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-6 text-xs text-zinc-500">
                <span className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  {formatNumber(post.likes_count)}
                </span>
                <span className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  {formatNumber(post.comments_count)}
                </span>
                <span className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  {formatNumber(post.reposts_count)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {stream.length === 0 && !loading && !error && (
        <p className="text-zinc-500 text-center py-8">
          Enter a symbol and click Fetch Stream to see posts
        </p>
      )}
    </div>
  );
}
