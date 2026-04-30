import { Database } from "bun:sqlite";
import { createHash } from "crypto";
import { existsSync, mkdirSync } from "fs";
import { Config } from "./config.ts";

// Ensure cache directory exists
if (!existsSync(".mockproxy")) {
  mkdirSync(".mockproxy", { recursive: true });
}

const db = new Database(".mockproxy/cache.db");
db.run("PRAGMA journal_mode = WAL");

// Initialize tables
db.run(`
  CREATE TABLE IF NOT EXISTS cache (
    id TEXT PRIMARY KEY,
    method TEXT NOT NULL,
    path TEXT NOT NULL,
    request_body TEXT,
    response_body TEXT NOT NULL,
    headers TEXT,
    model TEXT,
    input_tokens INTEGER,
    output_tokens INTEGER,
    cost_saved REAL,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cache_hits INTEGER DEFAULT 0,
    cache_misses INTEGER DEFAULT 0,
    total_saved REAL DEFAULT 0,
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
  )
`);

db.run(`
  INSERT OR IGNORE INTO stats (id, cache_hits, cache_misses, total_saved) 
  VALUES (1, 0, 0, 0)
`);

export interface CacheEntry {
  id: string;
  method: string;
  path: string;
  request_body?: string;
  response_body: string;
  headers?: string;
  model?: string;
  input_tokens?: number;
  output_tokens?: number;
  cost_saved?: number;
}

export function generateCacheKey(
  method: string,
  path: string,
  body: string,
  ignoreRegex?: RegExp
): string {
  let normalizedBody = body;
  
  // Strip dynamic variables if regex provided
  if (ignoreRegex) {
    normalizedBody = normalizedBody.replace(ignoreRegex, "");
  }
  
  const content = `${method}:${path}:${normalizedBody}`;
  return createHash("sha256").update(content).digest("hex").slice(0, 16);
}

export function getCache(id: string): CacheEntry | null {
  const stmt = db.query("SELECT * FROM cache WHERE id = ?");
  return stmt.get(id) as CacheEntry | null;
}

export function setCache(entry: CacheEntry): void {
  db.run(`
    INSERT OR REPLACE INTO cache 
    (id, method, path, request_body, response_body, headers, model, input_tokens, output_tokens, cost_saved)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    entry.id,
    entry.method,
    entry.path,
    entry.request_body || null,
    entry.response_body,
    entry.headers || null,
    entry.model || null,
    entry.input_tokens || null,
    entry.output_tokens || null,
    entry.cost_saved || null
  ]);
  
  // Update stats
  db.run(`
    UPDATE stats 
    SET cache_hits = cache_hits + 1, 
        total_saved = total_saved + ?,
        updated_at = strftime('%s', 'now')
    WHERE id = 1
  `, [entry.cost_saved || 0]);
}

export function recordMiss(): void {
  db.run(`
    UPDATE stats 
    SET cache_misses = cache_misses + 1,
        updated_at = strftime('%s', 'now')
    WHERE id = 1
  `);
}

export function getStats(): { hits: number; misses: number; saved: number } {
  const row = db.query("SELECT cache_hits, cache_misses, total_saved FROM stats WHERE id = 1").get() as {
    cache_hits: number;
    cache_misses: number;
    total_saved: number;
  };
  return {
    hits: row.cache_hits,
    misses: row.cache_misses,
    saved: row.total_saved,
  };
}

export { db };