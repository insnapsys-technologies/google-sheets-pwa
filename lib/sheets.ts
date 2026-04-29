import { google } from "googleapis";
import * as XLSX from "xlsx";

/** Tabs that must never be exposed in listings or data APIs */
export const HIDDEN_TABS = ['Newsletter Subscribers'];

export interface BlogPost {
  title: string;
  slug: string;
  date: string;
  content: string;
  image: string;
  tags: string[];
}

const getDriveClient = () => {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n").replace(/"/g, "");
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });
  return google.drive({ version: "v3", auth });
};

const getWorkbook = async (): Promise<XLSX.WorkBook> => {
  const drive = getDriveClient();
  const res = await drive.files.get(
    { fileId: process.env.GOOGLE_SHEET_FILE_ID!, alt: "media" },
    { responseType: "arraybuffer" }
  );
  const buffer = Buffer.from(res.data as ArrayBuffer);
  return XLSX.read(buffer, { type: "buffer" });
};

export const getSheetTabs = async (): Promise<string[]> => {
  const wb = await getWorkbook();
  return wb.SheetNames.filter((name) => !HIDDEN_TABS.includes(name));
};

export const fetchSheet = async (sheetName: string): Promise<(string | null)[][]> => {
  const wb = await getWorkbook();
  const ws = wb.Sheets[sheetName];
  if (!ws) return [];
  return XLSX.utils.sheet_to_json<(string | null)[]>(ws, {
    header: 1,
    defval: null,
    raw: false,
  });
};

export const fetchSheetWithLinks = async (
  sheetName: string
): Promise<{ values: (string | null)[][]; hyperlinks: (string | null)[][] }> => {
  const wb = await getWorkbook();
  const ws = wb.Sheets[sheetName];
  if (!ws) return { values: [], hyperlinks: [] };

  const rows: (string | null)[][] = XLSX.utils.sheet_to_json<(string | null)[]>(ws, {
    header: 1,
    defval: null,
    raw: false,
  });

  const ref = ws["!ref"];
  const range = ref ? XLSX.utils.decode_range(ref) : null;

  const hyperlinks: (string | null)[][] = rows.map((row, R) =>
    row.map((_, C) => {
      if (!range) return null;
      const cellAddress = XLSX.utils.encode_cell({ r: R + range.s.r, c: C + range.s.c });
      const cell: XLSX.CellObject | undefined = ws[cellAddress];
      return cell?.l?.Target ?? null;
    })
  );

  return { values: rows, hyperlinks };
};

const BLOG_TAB = process.env.BLOG_TAB_NAME || "Blog";

export const fetchBlogPosts = async (tabName?: string): Promise<BlogPost[]> => {
  const raw = await fetchSheet(tabName || BLOG_TAB);
  if (raw.length < 2) return [];

  const headers = (raw[0] as (string | null)[]).map((h) => (h ?? "").trim().toLowerCase());
  const titleIdx = headers.findIndex((h) => /^title$/i.test(h) || /^post.?title/i.test(h));
  const slugIdx = headers.findIndex((h) => h === "slug");
  const dateIdx = headers.findIndex((h) => /date|published/i.test(h));
  const contentIdx = headers.findIndex((h) => /content|body/i.test(h));
  const imageIdx = headers.findIndex((h) => /image|featured/i.test(h));
  const tagsIdx = headers.findIndex((h) => /tags?|categor/i.test(h));

  const makeSlug = (title: string) =>
    title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  return raw
    .slice(1)
    .filter((row) => row[titleIdx])
    .map((row) => ({
      title: row[titleIdx] ?? "",
      slug: slugIdx >= 0 && row[slugIdx] ? (row[slugIdx] as string) : makeSlug((row[titleIdx] as string) ?? ""),
      date: row[dateIdx] ?? "",
      content: row[contentIdx] ?? "",
      image: row[imageIdx] ?? "",
      tags: row[tagsIdx]
        ? (row[tagsIdx] as string).split(",").map((t) => t.trim()).filter(Boolean)
        : [],
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};
