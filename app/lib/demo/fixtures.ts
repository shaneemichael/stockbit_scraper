// Fake responses for demo mode (NEXT_PUBLIC_DEMO_MODE=1), used for screenshots
// and screen recordings. Prices and flows are made up, not real market data.
import type { SerializedStock, SerializedWatchlist } from "@/app/serializers/watchlist";
export { isDemoMode } from "./mode";

const fmtVolume = (v: number) =>
  v >= 1e9 ? (v / 1e9).toFixed(2) + "B" : (v / 1e6).toFixed(2) + "M";

function stock(
  symbol: string,
  name: string,
  previousClose: number,
  lastPrice: number,
  volume: number,
  extra: Partial<SerializedStock> = {}
): SerializedStock {
  const change = lastPrice - previousClose;
  return {
    symbol,
    name,
    exchange: "IDX",
    iconUrl: "",
    lastPrice,
    previousClose,
    openPrice: previousClose,
    highPrice: Math.max(previousClose, lastPrice) + Math.ceil(lastPrice * 0.006),
    lowPrice: Math.min(previousClose, lastPrice) - Math.ceil(lastPrice * 0.006),
    change,
    changePercent: (change / previousClose) * 100,
    isPositive: change > 0,
    isNegative: change < 0,
    volume,
    volumeFormatted: fmtVolume(volume),
    intradayPrices: [],
    bid: null,
    offer: null,
    hasCorporateAction: false,
    isUma: false,
    tradeable: true,
    ...extra,
  };
}

const watchlist: SerializedWatchlist = {
  id: 1,
  name: "Demo Watchlist",
  description: "",
  totalStocks: 6,
  isDefault: true,
  sortBy: "",
  sortDirection: "",
  stocks: [
    stock("BBCA", "Bank Central Asia Tbk.", 9850, 9975, 48_210_000),
    stock("BBRI", "Bank Rakyat Indonesia (Persero) Tbk.", 4520, 4480, 112_540_000),
    stock("TLKM", "Telkom Indonesia (Persero) Tbk.", 3120, 3170, 65_300_000, {
      hasCorporateAction: true,
    }),
    stock("ASII", "Astra International Tbk.", 5100, 5100, 21_870_000),
    stock("ICBP", "Indofood CBP Sukses Makmur Tbk.", 11250, 11475, 6_420_000),
    stock("GOTO", "GoTo Gojek Tokopedia Tbk.", 68, 66, 1_284_000_000, { isUma: true }),
  ],
};

const billions = (v: number) => (v / 1e9).toFixed(2) + "B";

const tx = (
  stockCode: string,
  type: "Lokal" | "Asing",
  side: "buy" | "sell",
  lot: number,
  avgPrice: number
) => {
  const value = lot * 100 * avgPrice;
  return {
    stockCode,
    type,
    side,
    lot,
    value,
    avgPrice,
    valueFormatted: billions(value),
    avgPriceFormatted: avgPrice.toLocaleString("id-ID"),
  };
};

const demoBuys = [
  tx("BBCA", "Lokal", "buy", 182_400, 9910),
  tx("BBRI", "Asing", "buy", 241_050, 4502),
  tx("BMRI", "Lokal", "buy", 73_640, 6215),
  tx("TLKM", "Lokal", "buy", 96_300, 3141),
  tx("ASII", "Asing", "buy", 54_200, 5088),
  tx("ICBP", "Lokal", "buy", 21_870, 11310),
];

const demoSells = [
  tx("BBRI", "Lokal", "sell", 118_900, 4495),
  tx("GOTO", "Lokal", "sell", 3_420_000, 67),
  tx("ASII", "Lokal", "sell", 33_700, 5112),
  tx("UNVR", "Asing", "sell", 40_150, 1985),
];

const sum = (rows: { value: number }[]) => rows.reduce((t, r) => t + r.value, 0);

const brokerSummary = (brokerCode: string) => ({
  brokerCode,
  brokerName: "Demo Sekuritas",
  date: "",
  buys: demoBuys,
  sells: demoSells,
  totalBuyValue: billions(sum(demoBuys)),
  totalSellValue: billions(sum(demoSells)),
  netValue: billions(sum(demoBuys) - sum(demoSells)),
});

const item = (id: string, name: string, value: string) => ({
  fitem: { id, name, value },
  hidden_graph_ico: false,
  is_new_update: false,
});

const keystats = {
  data: {
    stats: {
      current_share_outstanding: "123.28 B",
      market_cap: "1,229.7 T",
      enterprise_value: "1,105.2 T",
      free_float: "42.47%",
    },
    closure_fin_items_results: [
      {
        keystats_name: "Current Valuation",
        fin_name_results: [
          item("1", "Current PE Ratio (TTM)", "22.41"),
          item("2", "Current Price to Book Value", "4.62"),
          item("3", "Current Price to Sales (TTM)", "11.08"),
          item("4", "EV to EBITDA (TTM)", "16.37"),
          item("5", "Earnings Yield (TTM)", "4.46%"),
        ],
      },
      {
        keystats_name: "Per Share",
        fin_name_results: [
          item("6", "Current EPS (TTM)", "445.10"),
          item("7", "Book Value Per Share", "2,159"),
          item("8", "Revenue Per Share (TTM)", "900.24"),
          item("9", "Cash Per Share (Quarter)", "702.66"),
        ],
      },
      {
        keystats_name: "Profitability",
        fin_name_results: [
          item("10", "Net Profit Margin (TTM)", "49.44%"),
          item("11", "Operating Margin (TTM)", "60.12%"),
          item("12", "Pre-Tax Margin (TTM)", "61.03%"),
        ],
      },
      {
        keystats_name: "Management Effectiveness",
        fin_name_results: [
          item("13", "Return on Equity (TTM)", "21.58%"),
          item("14", "Return on Assets (TTM)", "3.71%"),
          item("15", "Return on Invested Capital", "20.94%"),
        ],
      },
      {
        keystats_name: "Growth",
        fin_name_results: [
          item("16", "Revenue (YoY)", "8.12%"),
          item("17", "Net Income (YoY)", "12.73%"),
          item("18", "EPS (YoY)", "12.70%"),
          item("19", "Revenue (QoQ)", "-1.45%"),
        ],
      },
      {
        keystats_name: "Dividend",
        fin_name_results: [
          item("20", "Dividend Yield", "2.71%"),
          item("21", "Payout Ratio", "60.15%"),
          item("22", "Dividend (TTM)", "270.00"),
        ],
      },
    ],
  },
};

const pricePerformance = {
  data: {
    prices: [
      ["1D", 1.27],
      ["1W", 2.05],
      ["1M", -1.48],
      ["3M", 4.39],
      ["6M", 7.82],
      ["YTD", 6.11],
      ["1Y", 9.64],
      ["3Y", 31.2],
      ["5Y", 58.47],
      ["10Y", 214.6],
    ].map(([timeframe, pct]) => ({
      timeframe,
      percentage: { raw: pct, formatted: `${pct}%` },
      close: { raw: 0, formatted: "" },
      high: { raw: 0, formatted: "" },
      low: { raw: 0, formatted: "" },
    })),
  },
};

const movement = (
  id: string,
  date: string,
  symbol: string,
  name: string,
  action: string,
  prev: [string, string],
  curr: [string, string],
  change: [string, string],
  nationality: string,
  broker: [string, string]
) => ({
  id,
  name,
  symbol,
  date,
  previous: { value: prev[0], percentage: prev[1] },
  current: { value: curr[0], percentage: curr[1] },
  changes: { value: change[0], percentage: change[1], formatted_value: change[0] },
  nationality,
  action_type: action,
  data_source: { label: "KSEI", type: "SOURCE_TYPE_KSEI" },
  broker_detail: { code: broker[0], group: broker[1] },
  badges: [] as string[],
});

const insider = {
  is_more: true,
  movement: [
    movement("1", "08 Oct 26", "BBRI", "Demo Holdings Ltd.", "ACTION_TYPE_BUY", ["1,204,500,000", "7.95"], ["1,251,800,000", "8.26"], ["+47,300,000", "+0.31"], "NATIONALITY_TYPE_FOREIGN", ["YP", "BROKER_GROUP_FOREIGN"]),
    movement("2", "07 Oct 26", "TLKM", "Sample Pension Fund", "ACTION_TYPE_SELL", ["5,880,000,000", "5.94"], ["5,812,400,000", "5.87"], ["-67,600,000", "-0.07"], "NATIONALITY_TYPE_LOCAL", ["CC", "BROKER_GROUP_LOCAL"]),
    movement("3", "07 Oct 26", "ICBP", "Example Capital Pte.", "ACTION_TYPE_BUY", ["612,000,000", "5.25"], ["640,250,000", "5.49"], ["+28,250,000", "+0.24"], "NATIONALITY_TYPE_FOREIGN", ["AK", "BROKER_GROUP_LOCAL"]),
    movement("4", "06 Oct 26", "ASII", "Placeholder Investama", "ACTION_TYPE_TRANSFER", ["2,430,000,000", "6.00"], ["2,430,000,000", "6.00"], ["0", "0.00"], "NATIONALITY_TYPE_LOCAL", ["", ""]),
    movement("5", "03 Oct 26", "BMRI", "Demo Sovereign Fund", "ACTION_TYPE_BUY", ["4,102,000,000", "4.40"], ["4,190,500,000", "4.49"], ["+88,500,000", "+0.09"], "NATIONALITY_TYPE_FOREIGN", ["NI", "BROKER_GROUP_GOVERNMENT"]),
  ],
};

export function getDemoData(body: { type?: string; brokerCode?: string }) {
  switch (body.type) {
    case "watchlist":
      return watchlist;
    case "broker-summary":
      return brokerSummary(body.brokerCode ?? "XL");
    case "keystats":
      return keystats;
    case "price-performance":
      return pricePerformance;
    case "insider":
      return insider;
    default:
      return null;
  }
}
