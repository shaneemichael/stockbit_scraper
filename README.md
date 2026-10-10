# 📈 Stockbit Scraper

A modern web application built with Next.js to fetch and display Indonesian stock market data from Stockbit's API. This app provides a clean, dark-themed interface for viewing stock profiles, quotes, financial statements, broker activities, insider trading, and more.

![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.2-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38bdf8?style=flat-square&logo=tailwindcss)

## ✨ Features

- **📋 Watchlist** - View your watchlist stocks with real-time prices and changes
- **🏦 Broker Activity** - Track broker buy/sell transactions with detailed analytics and date range filtering
- **👔 Insider Trading** - Monitor insider activities including management transactions
- **📊 Financials** - Explore financial statements with parsed HTML tables and formatted data
- **📈 Key Statistics** - Analyze key metrics like P/E ratio, P/B ratio, ROE, and more
- **💬 Stream** - Read community posts and discussions about stocks

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or yarn package manager
- Stockbit account with valid access token

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd stockbit-scraper
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## 🔑 Authentication

This app requires a Stockbit access token to fetch data from the API. 

1. Enter your access token in the token input field (appears on every page)
2. The token is kept in memory only, never saved, and is cleared when you reload or close the tab
3. All API requests use this token for authentication

**Note:** The access token is stored client-side only and never sent to any third-party servers except Stockbit's API.

## 📱 Pages Overview

### Home (`/`)
Landing page with overview of all features and quick access links.

### Watchlist (`/pages/watchlist`)
- View all stocks in your watchlist
- Real-time price updates
- Color-coded changes (gain/loss)
- Market cap and volume information

### Broker Activity (`/pages/broker`)
- Search broker transactions by code
- Date range filtering with quick presets (1D, 1W, 1M, 3M)
- Buy/Sell tabs with detailed transaction tables
- Total buy/sell value and net calculation
- Popular brokers quick-select

### Insider Trading (`/pages/insider`)
- Track insider activities
- Management transaction history
- Detailed ownership changes

### Financials (`/pages/financials`)
- Annual financial statements
- Multiple statement types support
- Formatted financial values

### Key Statistics (`/pages/keystats`)
- P/E, P/B, ROE ratios
- Dividend yield
- Financial metrics
- Performance indicators

## 🛠️ Tech Stack

- **Framework:** Next.js 16.0 (App Router)
- **Language:** TypeScript 5.x
- **UI Library:** React 19.2
- **Styling:** Tailwind CSS 4.x
- **API:** Stockbit Exodus API

## 📂 Project Structure

```
stockbit-scraper/
├── app/
│   ├── api/              # API routes
│   │   ├── scrape/       # Main data fetching endpoint
│   │   └── refresh/      # Token refresh endpoint
│   ├── components/       # Reusable components
│   │   ├── ErrorMessage.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── Navbar.tsx
│   │   └── TokenInput.tsx
│   ├── context/          # React context
│   │   └── AuthContext.tsx
│   ├── pages/            # Page components
│   │   ├── broker/
│   │   ├── financials/
│   │   ├── insider/
│   │   ├── keystats/
│   │   ├── search/
│   │   └── watchlist/
│   ├── serializers/      # Data serialization
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── lib/
│   └── stockbit/         # Stockbit API client
│       ├── api.ts        # API functions
│       └── index.ts
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

## ⚠️ Disclaimer

This is an unofficial tool and is not affiliated with or endorsed by Stockbit. Use at your own risk. Always verify critical information from official sources before making investment decisions.

## 📧 Support

For issues, questions, or suggestions, please open an issue on the repository.

---