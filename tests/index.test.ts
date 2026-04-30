// Core functionality tests for MockProxy

import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { serve } from "@hono/node-server";
import { Hono } from "hono";

// Mock target server
const mockTarget = new Hono();
mockTarget.get("/api/test", (c) => c.json({ message: "Hello from target", id: 123 }));
mockTarget.post("/api/chat", async (c) => {
  const body = await c.req.json();
  return c.json({ response: `Echo: ${body.message}` });
});

let targetServer: ReturnType<typeof serve>;
const TARGET_PORT = 9999;

beforeAll(() => {
  targetServer = serve({
    fetch: mockTarget.fetch,
    port: TARGET_PORT,
  });
});

afterAll(() => {
  targetServer?.close();
});

describe("MockProxy Core", () => {
  const PROXY_PORT = 4005;
  let proxyProcess: Bun.Subprocess<"ignore", "pipe", "inherit"> | null = null;

  beforeAll(async () => {
    // Start proxy
    proxyProcess = Bun.spawn([
      "bun",
      "run",
      "src/index.ts",
      "--target",
      `http://localhost:${TARGET_PORT}`,
      "--port",
      String(PROXY_PORT),
    ], {
      cwd: import.meta.dir + "/..",
      stdout: "ignore",
      stderr: "pipe",
    });
    
    // Wait for proxy to start
    await new Promise((r) => setTimeout(r, 2000));
  });

  afterAll(() => {
    proxyProcess?.kill();
  });

  it("should proxy GET requests", async () => {
    const response = await fetch(`http://localhost:${PROXY_PORT}/api/test`);
    const data = await response.json();
    
    expect(data.message).toBe("Hello from target");
    expect(data.id).toBe(123);
  });

  it("should cache responses", async () => {
    // First request - should miss cache
    const r1 = await fetch(`http://localhost:${PROXY_PORT}/api/test`);
    await r1.json();
    
    // Second request - should hit cache
    const r2 = await fetch(`http://localhost:${PROXY_PORT}/api/test`);
    const data = await r2.json();
    
    expect(data.message).toBe("Hello from target");
  });

  it("should proxy POST requests with body", async () => {
    const response = await fetch(`http://localhost:${PROXY_PORT}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Test message" }),
    });
    const data = await response.json();
    
    expect(data.response).toBe("Echo: Test message");
  });

  it("should return stats", async () => {
    const response = await fetch(`http://localhost:${PROXY_PORT}/__mockproxy/stats`);
    const stats = await response.json();
    
    expect(typeof stats.hits).toBe("number");
    expect(typeof stats.misses).toBe("number");
    expect(typeof stats.saved).toBe("number");
  });

  it("should have health endpoint", async () => {
    const response = await fetch(`http://localhost:${PROXY_PORT}/__mockproxy/health`);
    const data = await response.json();
    
    expect(data.status).toBe("ok");
  });
});

describe("Error Injection", () => {
  const PROXY_PORT = 4006;
  let proxyProcess: Bun.Subprocess<"ignore", "pipe", "inherit"> | null = null;

  beforeAll(async () => {
    proxyProcess = Bun.spawn([
      "bun",
      "run",
      "src/index.ts",
      "--target",
      `http://localhost:${TARGET_PORT}`,
      "--port",
      String(PROXY_PORT),
      "--errors",
      "100", // 100% error rate for testing
    ], {
      cwd: import.meta.dir + "/..",
      stdout: "ignore",
      stderr: "pipe",
    });
    
    await new Promise((r) => setTimeout(r, 2000));
  });

  afterAll(() => {
    proxyProcess?.kill();
  });

  it("should inject errors when rate is 100%", async () => {
    const response = await fetch(`http://localhost:${PROXY_PORT}/api/test`);
    
    expect(response.status).toBeGreaterThanOrEqual(500);
  });
});

describe("Strict Mode", () => {
  const PROXY_PORT = 4007;
  let proxyProcess: Bun.Subprocess<"ignore", "pipe", "inherit"> | null = null;

  beforeAll(async () => {
    proxyProcess = Bun.spawn([
      "bun",
      "run",
      "src/index.ts",
      "--target",
      `http://localhost:${TARGET_PORT}`,
      "--port",
      String(PROXY_PORT),
      "--strict",
    ], {
      cwd: import.meta.dir + "/..",
      stdout: "ignore",
      stderr: "pipe",
    });
    
    await new Promise((r) => setTimeout(r, 2000));
  });

  afterAll(() => {
    proxyProcess?.kill();
  });

  it("should error on cache miss in strict mode", async () => {
    const response = await fetch(`http://localhost:${PROXY_PORT}/api/unknown-endpoint`);
    
    expect(response.status).toBe(503);
  });
});