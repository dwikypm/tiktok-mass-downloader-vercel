import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILES = 10;
const MAX_FILE_SIZE = 25 * 1024 * 1024;

function safeName(index: number, contentType: string | null) {
  const type = contentType?.toLowerCase() || "";

  let extension = ".mp4";

  if (type.includes("webm")) extension = ".webm";
  else if (type.includes("quicktime")) extension = ".mov";
  else if (type.includes("m4v")) extension = ".m4v";

  return `video-${String(index + 1).padStart(3, "0")}${extension}`;
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      !("urls" in body) ||
      !Array.isArray(body.urls)
    ) {
      return NextResponse.json(
        { error: "Format URL tidak valid." },
        { status: 400 }
      );
    }

    const urls = [
      ...new Set(
        body.urls
          .filter((value): value is string => typeof value === "string")
          .map((value) => value.trim())
          .filter(Boolean)
      ),
    ];

    if (!urls.length) {
      return NextResponse.json(
        { error: "Tidak ada URL." },
        { status: 400 }
      );
    }

    if (urls.length > MAX_FILES) {
      return NextResponse.json(
        {
          error: `Maksimal ${MAX_FILES} file per proses.`,
        },
        { status: 400 }
      );
    }

    const zip = new JSZip();
    let successCount = 0;

    for (let i = 0; i < urls.length; i++) {
      const rawUrl = urls[i];

      let parsed: URL;

      try {
        parsed = new URL(rawUrl);
      } catch {
        continue;
      }

      if (!["http:", "https:"].includes(parsed.protocol)) {
        continue;
      }

      try {
        const response = await fetch(parsed.toString(), {
          method: "GET",
          redirect: "follow",
          headers: {
            "User-Agent": "Mozilla/5.0",
            Accept: "video/*,application/octet-stream,*/*",
          },
        });

        if (!response.ok) {
          continue;
        }

        const contentType = response.headers.get("content-type");

        if (
          contentType &&
          !contentType.includes("video") &&
          !contentType.includes("octet-stream")
        ) {
          continue;
        }

        const contentLength = response.headers.get("content-length");

        if (
          contentLength &&
          Number(contentLength) > MAX_FILE_SIZE
        ) {
          continue;
        }

        const buffer = await response.arrayBuffer();

        if (buffer.byteLength > MAX_FILE_SIZE) {
          continue;
        }

        zip.file(safeName(successCount, contentType), buffer);
        successCount++;
      } catch {
        continue;
      }
    }

    if (successCount === 0) {
      return NextResponse.json(
        {
          error:
            "Tidak ada file yang berhasil diunduh. Pastikan URL merupakan direct media URL yang dapat diakses.",
        },
        { status: 400 }
      );
    }

    const zipBuffer = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: {
        level: 6,
      },
    });

    return new NextResponse(zipBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition":
          'attachment; filename="tiktok-mass-download.zip"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Server gagal memproses download.",
      },
      { status: 500 }
    );
  }
}
