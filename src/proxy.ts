import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { streamSSE } from "hono/streaming";
import chalk from "chalk";
import { Config } from "./config.ts";
import {
  generateCacheKey,
  getCache,
  setCache,
  recordMiss,
  getStats,
} from "./cache.ts";
import { calculateTokens, calculateSavings, getModelFromPath } from "./tokenizer.ts";
import { generateWithNVIDIA, buildMockPrompt } from "./nvidia.ts";
import { generateWithOllama } from "./ollama.ts";

// Store config globally for the proxy
let proxyConfig: Config;

const app = new Hono();

// Stats endpoint
app.get("/__mockproxy/stats", (c) => {
  const stats = getStats();
  return c.json(stats);
});

// Health check
app.get("/__mockproxy/health", (c) => {
  return c.json({ status: "ok" });
});

// Main proxy handler
app.all("/*", async (c) => {
  const config = proxyConfig;
  const method = c.req.method;
  const path = c.req.path;
  const body = method !== "GET" ? await c.req.text() : "";
  
  // Error injection for testing
  if (config.errorRate > 0 && Math.random() * 100 < config.errorRate) {
    const errorTypes = [500, 429, 502];
    const errorType = errorTypes[Math.floor(Math.random() * errorTypes.length)];
    const messages: Record<number, string> = {
      500: "Internal Server Error (injected by MockProxy)",
      429: "Rate limit exceeded (injected by MockProxy)",
      502: "Bad Gateway (injected by MockProxy)",
    };
    console.log(chalk.red(`[ERROR INJECTED]`), chalk.gray(`${method}`), path, chalk.red(`(${errorType})`));
    return c.json({ error: messages[errorType], mockproxy_injected: true }, errorType);
  }
  
  // Generate cache key
  const cacheKey = generateCacheKey(method, path, body, config.ignoreRegex);
  
  // Check cache
  if (config.mode !== "live") {
    const cached = getCache(cacheKey);
    
    if (cached) {
      console.log(
        chalk.green(`[HIT]`),
        chalk.gray(`${method}`),
        path,
        chalk.yellow(`Saved $${cached.cost_saved?.toFixed(4) || "0.00"}`)
      );
      
      const headers = cached.headers ? JSON.parse(cached.headers) : {};
      
      // Handle simulated typing for streams
      if (config.simulateTyping > 0 && headers["content-type"]?.includes("stream")) {
        return streamSSE(c, async (stream) => {
          const lines = cached.response_body.split("\n");
          for (const line of lines) {
            if (line.trim()) {
              await stream.writeSSE({ data: line + "\n" });
              await new Promise((r) => setTimeout(r, config.simulateTyping));
            }
          }
        });
      }
      
      return new Response(cached.response_body, {
        status: 200,
        headers,
      });
    }
    
    // Cache miss in strict mode = error
    if (config.mode === "strict") {
      console.log(chalk.red(`[MISS]`), chalk.gray(`${method}`), path, chalk.red("(strict mode)"));
      return c.json({ error: "Cache miss in strict mode" }, 503);
    }
    
    recordMiss();
    console.log(chalk.yellow(`[MISS]`), chalk.gray(`${method}`), path);
    
    // Try AI fallbacks in mock mode
    if (config.mode === "mock" || config.mode === "cache") {
      let generatedResponse: string | null = null;
      
      // Try NVIDIA first (if enabled)
      if (config.providers.nvidia) {
        const prompt = buildMockPrompt(method, path, body);
        generatedResponse = await generateWithNVIDIA(prompt);
      }
      
      // Try Ollama if NVIDIA failed (if enabled)
      if (!generatedResponse && config.providers.ollama) {
        const prompt = buildMockPrompt(method, path, body);
        generatedResponse = await generateWithOllama(prompt);
      }
      
      // If we got a generated response, return it
      if (generatedResponse) {
        console.log(chalk.magenta(`[GENERATED]`), chalk.gray(`${method}`), path);
        return new Response(generatedResponse, {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
    }
  }
  
  // Forward to real API
  if (!config.target) {
    return c.json({ error: "No target URL configured. Use --target <url>" }, 500);
  }
  
  const targetUrl = `${config.target}${path}`;
  const headers: Record<string, string> = {};
  
  // Forward auth headers
  const authHeader = c.req.header("authorization");
  if (authHeader) headers["authorization"] = authHeader;
  
  const apiKey = c.req.header("x-api-key");
  if (apiKey) headers["x-api-key"] = apiKey;
  
  // Forward content-type
  const contentType = c.req.header("content-type");
  if (contentType) headers["content-type"] = contentType;
  
  try {
    const response = await fetch(targetUrl, {
      method,
      headers,
      body: method !== "GET" ? body : undefined,
    });
    
    const responseBody = await response.text();
    
    // Cache the response
    if (config.mode !== "live") {
      const model = getModelFromPath(path);
      const inputTokens = body ? calculateTokens(body) : 0;
      const outputTokens = calculateTokens(responseBody);
      const costSaved = calculateSavings(model, inputTokens, outputTokens);
      
      setCache({
        id: cacheKey,
        method,
        path,
        request_body: body || undefined,
        response_body: responseBody,
        headers: JSON.stringify(Object.fromEntries(response.headers)),
        model,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        cost_saved: costSaved,
      });
      
      console.log(
        chalk.blue(`[CACHED]`),
        chalk.gray(`${method}`),
        path,
        chalk.gray(`(${inputTokens} in + ${outputTokens} out tokens)`)
      );
    }
    
    return new Response(responseBody, {
      status: response.status,
      headers: Object.fromEntries(response.headers),
    });
  } catch (error) {
    console.error(chalk.red(`[ERROR]`), error);
    return c.json({ error: "Proxy error", details: String(error) }, 502);
  }
});

export function startProxy(config: Config) {
  proxyConfig = config;
  
  console.log(chalk.cyan.bold("\n  MockProxy — AI Mock Layer\n"));
  console.log(chalk.gray("  Mode:"), config.mode);
  console.log(chalk.gray("  Port:"), config.port);
  if (config.target) {
    console.log(chalk.gray("  Target:"), config.target);
  }
  console.log();
  
  serve({
    fetch: app.fetch,
    port: config.port,
  });
  
  console.log(chalk.green(`  ✓ Running on http://localhost:${config.port}\n`));
}

export { app };