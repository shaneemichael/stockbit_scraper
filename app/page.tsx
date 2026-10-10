"use client";

import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import TokenInput from "./components/TokenInput";
import { useAuth } from "./context/AuthContext";
import { PageHeader } from "./components/ui";
import {
  ArrowRightIcon,
  BarChartIcon,
  BuildingIcon,
  FileTextIcon,
  InfoIcon,
  ListIcon,
  SearchIcon,
  UsersIcon,
} from "./components/icons";

const features: {
  href: string;
  title: string;
  description: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}[] = [
  {
    href: "/pages/watchlist",
    title: "Watchlist",
    description: "Your watchlist with live prices and daily change",
    Icon: ListIcon,
  },
  {
    href: "/pages/broker",
    title: "Broker Activity",
    description: "Broker buy and sell transactions over a date range",
    Icon: BuildingIcon,
  },
  {
    href: "/pages/insider",
    title: "Insider Activity",
    description: "Major shareholder movements from KSEI and IDX",
    Icon: UsersIcon,
  },
  {
    href: "/pages/financials",
    title: "Financials",
    description: "Annual financial statements and reports",
    Icon: FileTextIcon,
  },
  {
    href: "/pages/keystats",
    title: "Key Statistics",
    description: "Valuation, profitability and growth ratios",
    Icon: BarChartIcon,
  },
  {
    href: "/pages/search",
    title: "Search",
    description: "Find stocks by name or symbol",
    Icon: SearchIcon,
  },
];

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      <PageHeader
        title="Stockbit Scraper"
        description="Fetch and browse Stockbit market data in one place."
      />

      <TokenInput />

      {!isAuthenticated && (
        <div className="mb-6 flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-sm text-amber-200">
          <InfoIcon className="w-4 h-4 mt-0.5 shrink-0" />
          <p>
            Enter your access token above to use the features. Click Guide in
            the token panel to see where to find it.
          </p>
        </div>
      )}

      <h2 className="mb-3 text-sm font-medium text-zinc-400">Features</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {features.map(({ href, title, description, Icon }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-start gap-3 p-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <span className="grid place-items-center w-9 h-9 shrink-0 rounded-lg bg-zinc-800 text-zinc-300 group-hover:text-blue-400 transition-colors">
              <Icon className="w-[18px] h-[18px]" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="flex items-center justify-between text-sm font-medium">
                {title}
                <ArrowRightIcon className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition" />
              </span>
              <span className="mt-0.5 block text-sm text-zinc-500">{description}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
