import { google } from "googleapis";
import * as XLSX from "xlsx";
import { driveProxyUrl as _driveProxyUrl } from "./drive-utils";

export type CellFormatting = {
  /** 6-char RGB hex, e.g. "FF6600" */
  bgColor?: string
  /** 6-char RGB hex */
  textColor?: string
  bold?: boolean
}

function extractCellFormatting(cell: XLSX.CellObject | undefined): CellFormatting | null {
  if (!cell) return null
  const s = (cell as any).s
  if (!s || typeof s !== 'object') return null

  const result: CellFormatting = {}

  // Background fill color (solid fill stores it in fgColor in xlsx spec)
  const fgRaw: unknown = s?.fill?.fgColor?.rgb ?? s?.fgColor?.rgb
  if (typeof fgRaw === 'string' && fgRaw.length >= 6) {
    // ARGB (8-char) or RGB (6-char) — strip alpha channel prefix
    const rgb = fgRaw.length === 8 ? fgRaw.slice(2) : fgRaw.slice(-6)
    if (!/^(FFFFFF|ffffff|000000)$/.test(rgb)) {
      result.bgColor = rgb.toUpperCase()
    }
  }

  // Font/text color
  const fontColorRaw: unknown = s?.font?.color?.rgb ?? s?.color?.rgb
  if (typeof fontColorRaw === 'string' && fontColorRaw.length >= 6) {
    const rgb = fontColorRaw.length === 8 ? fontColorRaw.slice(2) : fontColorRaw.slice(-6)
    if (!/^(000000|FFFFFF|ffffff)$/.test(rgb)) {
      result.textColor = rgb.toUpperCase()
    }
  }

  // Bold
  const bold: unknown = s?.font?.bold ?? s?.bold
  if (bold === true) result.bold = true

  return Object.keys(result).length > 0 ? result : null
}

/** Normalise a tab name for loose matching: lowercase, no spaces */
const normaliseTab = (s: string) => s.toLowerCase().replace(/\s+/g, '')

/**
 * Re-export with server-side logging so we can trace conversions in Next.js logs.
 */
export function driveProxyUrl(url: string | null | undefined): string | null {
  const result = _driveProxyUrl(url)
  return result
}

/** Tab name patterns to hide from public listings (normalised, substring match) */
export const HIDDEN_TAB_PATTERNS = ['newsletter'];

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
  // console.log('Fetching workbook from Google Drive file ID:', process.env.GOOGLE_SHEET_FILE_ID);
  const res = await drive.files.get(
    { fileId: process.env.GOOGLE_SHEET_FILE_ID!, alt: "media" },
    { responseType: "arraybuffer" }
  );
  const buffer = Buffer.from(res.data as ArrayBuffer);
  return XLSX.read(buffer, { type: "buffer", cellStyles: true });
};

export const getSheetTabs = async (): Promise<string[]> => {
  const wb = await getWorkbook();
  return wb.SheetNames.filter(
    (name) => !HIDDEN_TAB_PATTERNS.some((pattern) => normaliseTab(name).includes(pattern))
  );
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
): Promise<{ values: (string | null)[][]; hyperlinks: (string | null)[][]; formatting: (CellFormatting | null)[][] }> => {
  const wb = await getWorkbook();
  const ws = wb.Sheets[sheetName];
  if (!ws) return { values: [], hyperlinks: [], formatting: [] };

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

  const formatting: (CellFormatting | null)[][] = rows.map((row, R) =>
    row.map((_, C) => {
      if (!range) return null;
      const cellAddress = XLSX.utils.encode_cell({ r: R + range.s.r, c: C + range.s.c });
      return extractCellFormatting(ws[cellAddress]);
    })
  );

  // Convert any Google Drive share links to proxy URLs so the browser can display them
  const values: (string | null)[][] = rows.map((row) =>
    row.map((cell) => driveProxyUrl(cell) ?? cell)
  );
  const convertedHyperlinks: (string | null)[][] = hyperlinks.map((row) =>
    row.map((link) => driveProxyUrl(link) ?? link)
  );

  return { values, hyperlinks: convertedHyperlinks, formatting };
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
      image: (imageIdx >= 0 ? driveProxyUrl(row[imageIdx]) ?? row[imageIdx] : null) ?? "",
      tags: row[tagsIdx]
        ? (row[tagsIdx] as string).split(",").map((t) => t.trim()).filter(Boolean)
        : [],
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};
