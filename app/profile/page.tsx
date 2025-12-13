"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import TokenInput from "../components/TokenInput";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

interface CompanyProfile {
  symbol: string;
  company_name: string;
  company_name_en: string;
  listing_date: string;
  shares_outstanding: number;
  public_shares: number;
  secretary: string;
  phone: string;
  fax: string;
  email: string;
  website: string;
  address: string;
  npwp: string;
  description: string;
  industry: string;
  sector: string;
  sub_industry: string;
  logo_url: string;
  employees: number;
  market_cap: number;
}

export default function ProfilePage() {
  const { accessToken, isAuthenticated } = useAuth();
  const [symbol, setSymbol] = useState("BBCA");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<CompanyProfile | null>(null);

  const fetchProfile = async () => {
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
        body: JSON.stringify({ type: "profile", symbol: symbol.toUpperCase() }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to fetch profile");
      }

      // The API returns nested data
      setProfile(json.data?.data || json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (!num) return "-";
    if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
    if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
    return num.toLocaleString("id-ID");
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">🏢 Company Profile</h1>
        <p className="text-zinc-400">
          Get detailed company information and background
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
          onClick={fetchProfile}
          disabled={loading || !isAuthenticated}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
        >
          {loading ? "Loading..." : "Fetch Profile"}
        </button>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} />
        </div>
      )}

      {loading && <LoadingSpinner />}

      {profile && !loading && (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
            <div className="flex items-start gap-4">
              {profile.logo_url && (
                <img
                  src={profile.logo_url}
                  alt={profile.symbol}
                  className="w-16 h-16 rounded-lg bg-zinc-700"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
              <div className="flex-1">
                <h2 className="text-xl font-bold">{profile.symbol}</h2>
                <p className="text-lg text-zinc-300">
                  {profile.company_name || profile.company_name_en}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.sector && (
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                      {profile.sector}
                    </span>
                  )}
                  {profile.industry && (
                    <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">
                      {profile.industry}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-zinc-500">Market Cap</p>
                <p className="text-xl font-bold text-green-400">
                  {formatNumber(profile.market_cap)}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          {profile.description && (
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
              <h3 className="font-semibold mb-3">About</h3>
              <p className="text-zinc-300 text-sm leading-relaxed">
                {profile.description}
              </p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Info */}
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
              <h3 className="font-semibold mb-4">Company Information</h3>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-zinc-500">Listing Date</dt>
                  <dd className="text-zinc-300">{profile.listing_date || "-"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-500">Employees</dt>
                  <dd className="text-zinc-300">
                    {profile.employees?.toLocaleString() || "-"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-500">Shares Outstanding</dt>
                  <dd className="text-zinc-300">
                    {formatNumber(profile.shares_outstanding)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-500">Public Shares</dt>
                  <dd className="text-zinc-300">
                    {formatNumber(profile.public_shares)}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Contact Info */}
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
              <h3 className="font-semibold mb-4">Contact Information</h3>
              <dl className="space-y-3">
                {profile.website && (
                  <div className="flex justify-between">
                    <dt className="text-zinc-500">Website</dt>
                    <dd>
                      <a
                        href={
                          profile.website.startsWith("http")
                            ? profile.website
                            : `https://${profile.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        {profile.website}
                      </a>
                    </dd>
                  </div>
                )}
                {profile.email && (
                  <div className="flex justify-between">
                    <dt className="text-zinc-500">Email</dt>
                    <dd className="text-zinc-300">{profile.email}</dd>
                  </div>
                )}
                {profile.phone && (
                  <div className="flex justify-between">
                    <dt className="text-zinc-500">Phone</dt>
                    <dd className="text-zinc-300">{profile.phone}</dd>
                  </div>
                )}
                {profile.secretary && (
                  <div className="flex justify-between">
                    <dt className="text-zinc-500">Secretary</dt>
                    <dd className="text-zinc-300">{profile.secretary}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Address */}
          {profile.address && (
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
              <h3 className="font-semibold mb-3">Address</h3>
              <p className="text-zinc-300 text-sm">{profile.address}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
