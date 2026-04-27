import { google } from "googleapis";

export interface BlogPost {
  title: string;
  slug: string;
  date: string;
  content: string;
  image: string;
  tags: string[];
}

export const getSheetTabs = async (): Promise<string[]> => {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID!,
  });
  return (
    res.data.sheets
      ?.map((s) => s.properties?.title)
      .filter((t): t is string => Boolean(t)) ?? []
  );
};

export const getSheetsClient = () => {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n").replace(/"/g, "");
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  return google.sheets({ version: "v4", auth });
};

export const fetchSheet = async (range: string) => {
  const sheets = getSheetsClient();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID!,
    range,
  });

  return res.data.values || [];
};

/**
 * Fetches sheet data together with per-cell hyperlink URLs.
 * Uses spreadsheets.get with includeGridData so that the `hyperlink`
 * field (populated when a cell contains a HYPERLINK formula or was
 * linked via Insert > Link) is returned alongside the display value.
 */
export const fetchSheetWithLinks = async (
  range: string
): Promise<{ values: (string | null)[][]; hyperlinks: (string | null)[][] }> => {
  const sheets = getSheetsClient();

  const res = await sheets.spreadsheets.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID!,
    ranges: [range],
    includeGridData: true,
  });

  const rowData = res.data.sheets?.[0]?.data?.[0]?.rowData ?? [];
  const values: (string | null)[][] = [];
  const hyperlinks: (string | null)[][] = [];

  for (const row of rowData) {
    const cells = row.values ?? [];
    values.push(cells.map((c) => c.formattedValue ?? null));
    hyperlinks.push(cells.map((c) => c.hyperlink ?? null));
  }

  return { values, hyperlinks };
};

const BLOG_TAB = process.env.BLOG_TAB_NAME || "Blog";

export const fetchBlogPosts = async (): Promise<BlogPost[]> => {
  const raw = await fetchSheet(BLOG_TAB);
  if (raw.length < 2) return [];

  const headers = raw[0].map((h: string) => h.trim().toLowerCase());
  const titleIdx = headers.findIndex((h: string) => h === "title");
  const slugIdx = headers.findIndex((h: string) => h === "slug");
  const dateIdx = headers.findIndex((h: string) => /date|published/i.test(h));
  const contentIdx = headers.findIndex((h: string) => /content|body/i.test(h));
  const imageIdx = headers.findIndex((h: string) => /image|featured/i.test(h));
  const tagsIdx = headers.findIndex((h: string) => /tags?|categor/i.test(h));

  return raw
    .slice(1)
    .filter((row: string[]) => row[titleIdx] && row[slugIdx])
    .map((row: string[]) => ({
      title: row[titleIdx] || "",
      slug: row[slugIdx] || "",
      date: row[dateIdx] || "",
      content: row[contentIdx] || "",
      image: row[imageIdx] || "",
      tags: row[tagsIdx] ? row[tagsIdx].split(",").map((t: string) => t.trim()).filter(Boolean) : [],
    }))
    .sort((a: BlogPost, b: BlogPost) => new Date(b.date).getTime() - new Date(a.date).getTime());
};
