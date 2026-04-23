import { NextResponse } from "next/server";
import { fetchSheet } from "@/lib/sheets";

export const revalidate = 30;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tab: string }> }
) {
  const { tab } = await params;

  try {
    const data = await fetchSheet(tab);
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching sheet:", error);
    return NextResponse.json(
      { error: "Failed to fetch sheet data" },
      { status: 500 }
    );
  }
}
