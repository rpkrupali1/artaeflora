import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getAdminSession } from "@/lib/auth";
import { logger } from "@/lib/logger";

const log = logger.child({ scope: "upload" });

// POST /api/upload  (multipart: file, folder) — admin only.
// One upload path for the whole app: Cloudinary when CLOUDINARY_URL is set
// (production), local public/uploads otherwise (development).

const FOLDERS = new Set(["products", "gallery", "hero"]);
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/webm"]);
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_VIDEO_BYTES = 60 * 1024 * 1024;

export async function POST(req: Request) {
  if (!(await getAdminSession())) {
    log.warn("upload.unauthorized_attempt");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  const folder = String(form.get("folder") ?? "products");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (!FOLDERS.has(folder)) {
    return NextResponse.json({ error: "Invalid folder." }, { status: 400 });
  }

  const isImage = IMAGE_TYPES.has(file.type);
  const isVideo = VIDEO_TYPES.has(file.type);
  if (!isImage && !isVideo) {
    return NextResponse.json(
      { error: "Use JPEG, PNG, WebP, GIF images or MP4/WebM video." },
      { status: 415 }
    );
  }
  if (isVideo && folder !== "hero") {
    return NextResponse.json({ error: "Video is only supported for hero slides." }, { status: 400 });
  }
  const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (file.size > maxBytes) {
    return NextResponse.json(
      { error: `File too large (max ${Math.round(maxBytes / 1024 / 1024)} MB).` },
      { status: 413 }
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());

  if (process.env.CLOUDINARY_URL) {
    const uploaded = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: `artaeflora/${folder}`,
            resource_type: isVideo ? "video" : "image",
          },
          (err, result) => (err || !result ? reject(err) : resolve(result))
        )
        .end(bytes);
    });
    log.info("upload.stored_cloudinary", { folder, bytes: file.size, video: isVideo });
    return NextResponse.json({ url: uploaded.secure_url, mediaType: isVideo ? "VIDEO" : "IMAGE" });
  }

  // Dev fallback: public/uploads/<folder>/<random>.<ext>
  const ext = (file.name.match(/\.[a-z0-9]+$/i)?.[0] ?? ".bin").toLowerCase();
  const filename = `${crypto.randomUUID()}${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), bytes);
  log.info("upload.stored_local", { folder, bytes: file.size, filename });
  return NextResponse.json({
    url: `/uploads/${folder}/${filename}`,
    mediaType: isVideo ? "VIDEO" : "IMAGE",
  });
}
