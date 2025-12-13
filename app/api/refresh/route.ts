import { NextRequest, NextResponse } from "next/server";
import { refreshAccessToken } from "@/lib/stockbit/api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token is required" },
        { status: 400 }
      );
    }

    const result = await refreshAccessToken(refreshToken);

    return NextResponse.json({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresIn: result.expiresIn,
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to refresh token",
      },
      { status: 401 }
    );
  }
}
