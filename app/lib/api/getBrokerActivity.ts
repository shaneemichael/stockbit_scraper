import { STOCKBIT_API_BASE } from "./components";
import { createAuthHeaders } from "./authHeader";
import { StockbitAuthInfo, BrokerActivityOptions } from "./components";

export async function getBrokerActivity(
  auth: StockbitAuthInfo,
  options: BrokerActivityOptions
) {
  const {
    brokerCode,
    page = 1,
    limit = 50,
    transactionType = "TRANSACTION_TYPE_NET",
    marketBoard = "MARKET_BOARD_REGULER",
    investorType = "INVESTOR_TYPE_ALL",
    startDate,
    endDate,
  } = options;

  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    transaction_type: transactionType,
    market_board: marketBoard,
    investor_type: investorType,
  });


  if (startDate) {
    params.set("from", startDate);
  }
  if (endDate) {
    params.set("to", endDate);
  }

  const response = await fetch(
    `${STOCKBIT_API_BASE}/findata-view/marketdetectors/activity/${brokerCode}/detail?${params}`,
    {
      method: "GET",
      headers: createAuthHeaders(auth),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Broker activity error response:", errorBody);
    throw new Error(
      `Failed to fetch broker activity: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}
