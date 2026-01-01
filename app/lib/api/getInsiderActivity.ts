import { STOCKBIT_API_BASE } from "./components";
import { createAuthHeaders } from "./authHeader";
import { StockbitAuthInfo, InsiderActivityOptions } from "./components";

export async function getInsiderActivity(
  auth: StockbitAuthInfo,
  options: InsiderActivityOptions
) {
  const {
    page = 1,
    limit = 20,
    startDate,
    endDate,
    actionType = "ACTION_TYPE_UNSPECIFIED",
    sourceType = "SOURCE_TYPE_UNSPECIFIED",
  } = options;

  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    action_type: actionType,
    source_type: sourceType,
  });

  // Add date range if provided
  if (startDate) {
    params.set("date_start", startDate);
  }
  if (endDate) {
    params.set("date_end", endDate);
  }

  const response = await fetch(
    `${STOCKBIT_API_BASE}/insider/company/majorholder?${params}`,
    {
      method: "GET",
      headers: createAuthHeaders(auth),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Insider activity error response:", errorBody);
    throw new Error(
      `Failed to fetch insider activity: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}