import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb, mutateDb } from "@/lib/db";
import { uid } from "@/lib/utils";
import type { ServiceRequest } from "@/lib/types";

const base = {
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  whatsapp: z.string().trim().min(6).max(40),
  company: z.string().trim().max(160).optional().default(""),
  description: z.string().trim().min(10).max(4000),
  additional: z.string().trim().max(4000).optional().default(""),
  website: z.string().max(0).optional(), // honeypot
};

const AutomationSchema = z.object({
  kind: z.literal("automation"),
  selectedId: z.string().min(1),
  selectedName: z.string().max(200),
  ...base,
});

const SocialSchema = z.object({
  kind: z.literal("social_media"),
  selectedId: z.string().min(1),
  selectedName: z.string().max(200),
  selectedPrice: z.string().max(80).optional(),
  platforms: z.array(z.string()).max(10).optional().default([]),
  goals: z.string().trim().max(3000).optional().default(""),
  brandInfo: z.string().trim().max(3000).optional().default(""),
  ...base,
});

const ContactSchema = z.object({
  kind: z.literal("contact"),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  whatsapp: z.string().trim().max(40).optional().default(""),
  company: z.string().trim().max(160).optional().default(""),
  message: z.string().trim().min(10).max(4000),
  website: z.string().max(0).optional(),
});

// simple in-memory rate limit per IP
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > 8;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "local";
  if (limited(ip)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = z.discriminatedUnion("kind", [AutomationSchema, SocialSchema, ContactSchema]).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 422 });
  const d = parsed.data;
  const db = getDb();

  if (d.kind === "contact") {
    mutateDb((s) => {
      s.messages.unshift({ id: uid(), name: d.name, email: d.email, whatsapp: d.whatsapp, company: d.company, message: d.message, status: "new", createdAt: new Date().toISOString() });
    });
    return NextResponse.json({ ok: true });
  }

  // Resolve selected item from the database so stored names/prices are authoritative
  const request: ServiceRequest = {
    id: uid(),
    type: d.kind,
    fullName: d.fullName,
    email: d.email,
    whatsapp: d.whatsapp,
    company: d.company,
    selectedId: d.selectedId,
    selectedName: d.selectedName,
    description: d.description,
    additional: d.additional,
    status: "new",
    createdAt: new Date().toISOString(),
  };

  if (d.kind === "automation") {
    const a = db.automations.find((x) => x.id === d.selectedId);
    if (!a) return NextResponse.json({ error: "Unknown automation" }, { status: 422 });
    request.selectedName = a.title.en;
  } else {
    const p = db.packages.find((x) => x.id === d.selectedId);
    if (!p) return NextResponse.json({ error: "Unknown package" }, { status: 422 });
    request.selectedName = p.name;
    request.selectedPrice = `${p.price} ${p.currency} ${p.billingPeriod.en}`;
    request.platforms = d.platforms;
    request.goals = d.goals;
    request.brandInfo = d.brandInfo;
  }

  mutateDb((s) => {
    s.requests.unshift(request);
  });
  return NextResponse.json({ ok: true, id: request.id });
}
