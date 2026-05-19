import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

/**
 * GET /api/whitepaper-download
 *
 * Serves the whitepaper file with explicit Content-Type and
 * Content-Disposition headers. This avoids heuristic flags from
 * browser security extensions that distrust untyped static-file
 * downloads initiated via programmatic anchor clicks.
 */
export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public", "the-phygital-imperative.docx");
    const fileBuffer = await fs.readFile(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition":
          'attachment; filename="The Phygital Imperative.docx"',
        "Content-Length": fileBuffer.byteLength.toString(),
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("[Whitepaper Download] File read error:", error);
    return NextResponse.json(
      { error: "File not found" },
      { status: 404 }
    );
  }
}
