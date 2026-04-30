import { NextResponse } from "next/server";
import { fetchSheetWithLinks, HIDDEN_TAB_PATTERNS } from "@/lib/sheets";

export const revalidate = 30;

const normaliseTab = (s: string) => s.toLowerCase().replace(/\s+/g, '')

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tab: string }> }
) {
  const { tab } = await params;

  if (HIDDEN_TAB_PATTERNS.some((pattern) => normaliseTab(tab).includes(pattern))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const { values, hyperlinks, formatting } = await fetchSheetWithLinks(tab);
    return NextResponse.json({ data: values, hyperlinks, formatting });
  } catch (error) {
    console.error("Error fetching sheet:", error);
    return NextResponse.json(
      { error: "Failed to fetch sheet data" },
      { status: 500 }
    );
  }
}
