"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/pages/watchlist", label: "Watchlist" },
  { href: "/pages/broker", label: "Broker" },
  { href: "/pages/profile", label: "Profile" },
  { href: "/pages/quote", label: "Quote" },
  { href: "/pages/financials", label: "Financials" },
  { href: "/pages/keystats", label: "Key Stats" },
  { href: "/pages/stream", label: "Stream" },
  { href: "/pages/search", label: "Search" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-14 gap-8 overflow-x-auto">
          <Link
            href="/"
            className="text-lg font-bold text-white whitespace-nowrap"
          >
            📈 Stockbit
          </Link>
          <div className="flex gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  pathname === item.href
                    ? "bg-zinc-700 text-white"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
