import fs from "fs";
import path from "path";
import type { Db } from "./types";
import { seedDb } from "./seed";

/**
 * Built-in local CMS adapter.
 *
 * The data layer mirrors the Supabase schema (supabase/schema.sql).
 * When Supabase env vars are configured, server code can swap to it;
 * in this runtime the JSON store provides the exact same contract so
 * every CMS edit made in /admin is persisted and instantly visible on
 * the public site.
 */
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

let cache: Db | null = null;
let cacheMtime = 0;

function ensureSeed() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(seedDb(), null, 2), "utf8");
  }
}

export function getDb(): Db {
  ensureSeed();
  const mtime = fs.statSync(DB_FILE).mtimeMs;
  if (!cache || mtime !== cacheMtime) {
    cache = JSON.parse(fs.readFileSync(DB_FILE, "utf8")) as Db;
    cacheMtime = mtime;
  }
  return cache;
}

export function mutateDb<T>(fn: (db: Db) => T): T {
  ensureSeed();
  const db = JSON.parse(fs.readFileSync(DB_FILE, "utf8")) as Db;
  const result = fn(db);
  fs.writeFileSync(DB_FILE + ".tmp", JSON.stringify(db, null, 2), "utf8");
  fs.renameSync(DB_FILE + ".tmp", DB_FILE);
  cache = db;
  cacheMtime = fs.statSync(DB_FILE).mtimeMs;
  return result;
}

export const sortBy = <T,>(arr: T[], key: (t: T) => number) =>
  [...arr].sort((a, b) => key(a) - key(b));
