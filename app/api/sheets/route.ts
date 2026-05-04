import { NextResponse } from "next/server";
import { getSheetTabs } from "@/lib/sheets";

export const revalidate = process.env.NEXT_PUBLIC_CACHE_REVALIDATE_TIME || 30;

export async function GET() {
  try {
    const tabs = await getSheetTabs();
    return NextResponse.json({ tabs });
  } catch (error) {
    console.error("Error fetching sheet tabs:", error);
    return NextResponse.json(
      { error: "Failed to fetch sheet tabs" },
      { status: 500 }
    );
  }
}
