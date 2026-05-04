import { NextResponse } from "next/server";
import { fetchBlogPosts } from "@/lib/sheets";

export const revalidate = process.env.NEXT_PUBLIC_CACHE_REVALIDATE_TIME || 30;

export async function GET() {
  try {
    const posts = await fetchBlogPosts();
    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog posts" },
      { status: 500 }
    );
  }
}
