"use client";

import Link from "next/link";
import TokenInput from "./components/TokenInput";
import { useAuth } from "./context/AuthContext";

const features = [
  {
    href: "/pages/watchlist",
    title: "📋 Watchlist",
    description: "View your watchlist stocks with real-time prices and changes",
  },
  {
    href: "/pages/broker",
    title: "🏦 Broker Activity",
    description: "View broker buy and sell transactions with detailed analytics",
  },
  {
    href: "/pages/profile",
    title: "🏢 Company Profile",
    description: "Get detailed company information and background",
  },
  {
    href: "/pages/quote",
    title: "💰 Stock Quote",
    description: "View current stock price, volume, and market data",
  },
  {
    href: "/pages/financials",
    title: "📊 Financials",
    description: "Explore financial statements and reports",
  },
  {
    href: "/pages/keystats",
    title: "📈 Key Statistics",
    description: "View key metrics like P/E, P/B, ROE, and more",
  },
  {
    href: "/pages/stream",
    title: "💬 Stream",
    description: "Read community posts and discussions about stocks",
  },
  {
    href: "/pages/search",
    title: "🔍 Search",
    description: "Search for stocks by name or symbol",
  },
];

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Stockbit Scraper</h1>
        <p className="text-zinc-400">
          Fetch and display data from Stockbit API with a clean interface
        </p>
      </div>

      <TokenInput />

      {!isAuthenticated && (
        <div className="mb-8 p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg">
          <p className="text-yellow-300 text-sm">
            <strong>⚠️ Note:</strong> Please enter your access token above to
            start using the features. Get it from Stockbit&apos;s Local Storage
            after logging in.
          </p>
        </div>
      )}

      <h2 className="text-xl font-semibold mb-4">Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature) => (
          <Link
            key={feature.href}
            href={feature.href}
            className="block p-4 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 hover:border-zinc-600 rounded-lg transition-colors group"
          >
            <h3 className="text-lg font-medium mb-1 group-hover:text-blue-400 transition-colors">
              {feature.title}
            </h3>
            <p className="text-sm text-zinc-400">{feature.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
