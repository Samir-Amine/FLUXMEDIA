import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { requireAdmin } from "@/lib/auth";

const DIR = path.join(process.cwd(), "public", "uploads");
const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml", "video/mp4"];
const MAX = 8 * 1024 * 1024;

export async function GET() {
  if (!requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!fs.existsSync(DIR)) return NextResponse.json([]);
  const files = fs.readdirSync(DIR).map((f) => {
    const st = fs.statSync(path.join(DIR, f));
    return { name: f, url: `/uploads/${f}`, size: st.size, at: st.mtime.toISOString() };
  }).sort((a, b) => (a.at < b.at ? 1 : -1));
  return NextResponse.json(files);
}

export async function POST(req: Request) {
  if (!requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: "Unsupported file type" }, { status: 415 });
  if (file.size > MAX) return NextResponse.json({ error: "File too large (max 8MB)" }, { status: 413 });
  fs.mkdirSync(DIR, { recursive: true });
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
  const name = `${Date.now()}-${safe}`;
  fs.writeFileSync(path.join(DIR, name), Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ name, url: `/uploads/${name}` }, { status: 201 });
}

export async function DELETE(req: Request) {
  if (!requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const name = new URL(req.url).searchParams.get("name") || "";
  if (!name || name.includes("/") || name.includes("..")) return NextResponse.json({ error: "Bad name" }, { status: 400 });
  const p = path.join(DIR, name);
  if (fs.existsSync(p)) fs.unlinkSync(p);
  return NextResponse.json({ ok: true });
}
