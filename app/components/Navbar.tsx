"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUpIcon } from "./icons";
import { isDemoMode } from "../lib/demo/mode";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/pages/watchlist", label: "Watchlist" },
  { href: "/pages/broker", label: "Broker" },
  { href: "/pages/insider", label: "Insider" },
  { href: "/pages/financials", label: "Financials" },
  { href: "/pages/keystats", label: "Key Stats" },
  { href: "/pages/search", label: "Search" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 bg-zinc-950/85 backdrop-blur border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-14 gap-6 overflow-x-auto custom-scrollbar">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold whitespace-nowrap"
          >
            <span className="grid place-items-center w-7 h-7 rounded-md bg-blue-600 text-white">
              <TrendingUpIcon className="w-4 h-4" />
            </span>
            Stockbit Scraper
            {isDemoMode && (
              <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-[10px] font-medium uppercase tracking-wide text-amber-300">
                Demo data
              </span>
            )}
          </Link>
          <div className="flex gap-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`px-3 py-1.5 rounded-md text-sm whitespace-nowrap transition-colors ${
                    active
                      ? "bg-zinc-800 text-white font-medium"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
