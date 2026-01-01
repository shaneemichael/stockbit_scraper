import { StockbitAuthInfo } from "./components";

export function createAuthHeaders(auth: StockbitAuthInfo): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  };

  if (auth.accessToken) {
    headers["Authorization"] = `Bearer ${auth.accessToken}`;
  }

  if (auth.cookies) {
    headers["Cookie"] = auth.cookies;
  }

  return headers;
}