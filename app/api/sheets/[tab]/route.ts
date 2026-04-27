import { NextResponse } from "next/server";
import { fetchSheetWithLinks, HIDDEN_TABS } from "@/lib/sheets";

export const revalidate = 30;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tab: string }> }
) {
  const { tab } = await params;

  if (HIDDEN_TABS.includes(tab)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const { values, hyperlinks } = await fetchSheetWithLinks(tab);
    return NextResponse.json({ data: values, hyperlinks });
  } catch (error) {
    console.error("Error fetching sheet:", error);
    return NextResponse.json(
      { error: "Failed to fetch sheet data" },
      { status: 500 }
    );
  }
}
