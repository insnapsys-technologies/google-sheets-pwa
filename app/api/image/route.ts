import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export const dynamic = "force-dynamic";

const getDriveClient = () => {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n").replace(/"/g, "");
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });
  return google.drive({ version: "v3", auth });
};

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  // Validate: Google Drive file IDs are alphanumeric + hyphens + underscores
  if (!id || !/^[A-Za-z0-9_-]{10,}$/.test(id)) {
    return new NextResponse("Invalid file ID", { status: 400 });
  }

  try {
    const drive = getDriveClient();

    // Fetch metadata to get the MIME type
    const meta = await drive.files.get({ fileId: id, fields: "mimeType,name" });
    const mimeType = meta.data.mimeType ?? "application/octet-stream";

    // Only serve image files
    if (!mimeType.startsWith("image/")) {
      return new NextResponse("Not an image", { status: 400 });
    }

    // Fetch the file content
    const res = await drive.files.get(
      { fileId: id, alt: "media" },
      { responseType: "arraybuffer" }
    );

    const buffer = Buffer.from(res.data as ArrayBuffer);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (error: any) {
    const errCode = error?.code ?? error?.status ?? error?.response?.status;
    console.error('[/api/image] Error (code', errCode, ') for id', id, ':', error?.message ?? error);

    // For permission errors (403) or not-found (404), try the public Google Drive CDN URL.
    // This works for files shared as "anyone with the link can view".
    if (errCode === 403 || errCode === 404) {
      try {
        const publicUrl = `https://lh3.googleusercontent.com/d/${id}`;
        const pubRes = await fetch(publicUrl, { redirect: 'follow' });
        if (pubRes.ok) {
          const contentType = pubRes.headers.get('content-type') ?? 'image/jpeg';
          const pubBuffer = Buffer.from(await pubRes.arrayBuffer());
          return new NextResponse(pubBuffer, {
            headers: {
              "Content-Type": contentType,
              "Cache-Control": "public, max-age=86400, s-maxage=86400",
            },
          });
        }
      } catch (pubErr: any) {
        console.error('[/api/image] Public CDN fallback error:', pubErr?.message ?? pubErr);
      }
    }

    const status = errCode === 404 ? 404 : errCode === 403 ? 403 : 500;
    return new NextResponse(errCode === 404 ? "File not found" : errCode === 403 ? "Access denied" : "Failed to fetch image", { status });
  }
}
