import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getDb, mutateDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { uid } from "@/lib/utils";
import type { Db } from "@/lib/types";

/**
 * Generic admin CMS API.
 *
 * Collections (arrays of records with `id`):
 *   navigation, categories, automations, packages, socialLinks, faqs,
 *   requests, messages, posts, inbox, clients, accounts
 *
 * Singletons (objects):
 *   settings, socialPage
 *
 * GET    → list / get singleton
 * POST   → create record       { ...fields }
 * PUT    → update record       { id, ...fields }
 *          replace singleton   { ...fields }
 * PATCH  → bulk reorder        { order: [id, id, ...] }
 * DELETE → remove record       ?id=
 */

const COLLECTIONS = [
  "navigation",
  "categories",
  "automations",
  "packages",
  "socialLinks",
  "faqs",
  "requests",
  "messages",
  "posts",
  "inbox",
  "clients",
  "accounts",
] as const;

const SINGLETONS = ["settings", "socialPage"] as const;

type Col = (typeof COLLECTIONS)[number];
type Single = (typeof SINGLETONS)[number];

const isCol = (s: string): s is Col =>
  (COLLECTIONS as readonly string[]).includes(s);

const isSingle = (s: string): s is Single =>
  (SINGLETONS as readonly string[]).includes(s);

function revalidateAll() {
  [
    "/",
    "/automations",
    "/social-media",
    "/social",
    "/about",
    "/contact",
    "/request",
    "/request/social-media",
  ].forEach((p) => revalidatePath(p));

  revalidatePath("/automations/[slug]", "page");
  revalidatePath("/", "layout");
}

function guard() {
  if (!requireAdmin()) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/* GET                                                                         */
/* -------------------------------------------------------------------------- */

export async function GET(
  _: Request,
  { params }: { params: { collection: string } }
) {
  const g = guard();
  if (g) return g;

  const db = await getDb();
  const c = params.collection;

  if (isCol(c)) {
    return NextResponse.json(db[c]);
  }

  if (isSingle(c)) {
    return NextResponse.json(db[c]);
  }

  return NextResponse.json(
    { error: "Unknown collection" },
    { status: 404 }
  );
}

/* -------------------------------------------------------------------------- */
/* POST                                                                        */
/* -------------------------------------------------------------------------- */

export async function POST(
  req: Request,
  { params }: { params: { collection: string } }
) {
  const g = guard();
  if (g) return g;

  const c = params.collection;

  if (!isCol(c)) {
    return NextResponse.json(
      { error: "Not a collection" },
      { status: 400 }
    );
  }

  const body = await req.json();

  const record = {
    ...body,
    id: uid(),
  };

  await mutateDb((db) => {
    const arr = db[c] as unknown as Record<string, unknown>[];

    if (
      record.order === undefined &&
      arr.length &&
      "order" in (arr[0] || {})
    ) {
      record.order =
        Math.max(
          0,
          ...arr.map((r) => Number(r.order) || 0)
        ) + 1;
    }

    arr.push(record);
  });

  revalidateAll();

  return NextResponse.json(record, { status: 201 });
}

/* -------------------------------------------------------------------------- */
/* PUT                                                                         */
/* -------------------------------------------------------------------------- */

export async function PUT(
  req: Request,
  { params }: { params: { collection: string } }
) {
  const g = guard();
  if (g) return g;

  const c = params.collection;
  const body = await req.json();

  /* ----------------------------- Singleton ----------------------------- */

  if (isSingle(c)) {
    await mutateDb((db) => {
      (db as Db)[c] = {
        ...(db[c] as object),
        ...body,
      } as never;
    });

    revalidateAll();

    return NextResponse.json({ ok: true });
  }

  /* ----------------------------- Collection ---------------------------- */

  if (!isCol(c)) {
    return NextResponse.json(
      { error: "Unknown collection" },
      { status: 404 }
    );
  }

  if (!body.id) {
    return NextResponse.json(
      { error: "id required" },
      { status: 400 }
    );
  }

  let found = false;

  await mutateDb((db) => {
    const arr = db[c] as unknown as Record<string, unknown>[];

    const i = arr.findIndex(
      (r) => r.id === body.id
    );

    if (i >= 0) {
      arr[i] = {
        ...arr[i],
        ...body,
      };

      found = true;
    }
  });

  if (!found) {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404 }
    );
  }

  revalidateAll();

  return NextResponse.json({ ok: true });
}

/* -------------------------------------------------------------------------- */
/* PATCH                                                                       */
/* -------------------------------------------------------------------------- */

export async function PATCH(
  req: Request,
  { params }: { params: { collection: string } }
) {
  const g = guard();
  if (g) return g;

  const c = params.collection;

  if (!isCol(c)) {
    return NextResponse.json(
      { error: "Not a collection" },
      { status: 400 }
    );
  }

  const { order } = (await req.json()) as {
    order: string[];
  };

  await mutateDb((db) => {
    const arr = db[c] as unknown as Record<string, unknown>[];

    order.forEach((id, idx) => {
      const r = arr.find(
        (x) => x.id === id
      );

      if (r) {
        r.order = idx + 1;
      }
    });
  });

  revalidateAll();

  return NextResponse.json({ ok: true });
}

/* -------------------------------------------------------------------------- */
/* DELETE                                                                      */
/* -------------------------------------------------------------------------- */

export async function DELETE(
  req: Request,
  { params }: { params: { collection: string } }
) {
  const g = guard();
  if (g) return g;

  const c = params.collection;

  if (!isCol(c)) {
    return NextResponse.json(
      { error: "Not a collection" },
      { status: 400 }
    );
  }

  const id = new URL(req.url).searchParams.get(
    "id"
  );

  if (!id) {
    return NextResponse.json(
      { error: "id required" },
      { status: 400 }
    );
  }

  await mutateDb((db) => {
    (
      db as unknown as Record<
        string,
        Record<string, unknown>[]
      >
    )[c] = (
      db[c] as unknown as Record<string, unknown>[]
    ).filter((r) => r.id !== id);
  });

  revalidateAll();

  return NextResponse.json({ ok: true });
}
