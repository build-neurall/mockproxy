#!/usr/bin/env bun
import { parseArgs } from "./config.ts";
import { startProxy } from "./proxy.ts";
import { getStats } from "./cache.ts";
import chalk from "chalk";

const args = process.argv.slice(2);

// Handle --stats flag
if (args.includes("--stats")) {
  const stats = getStats();
  console.log(chalk.cyan.bold("\n  MockProxy Stats\n"));
  console.log(chalk.gray("  Cache Hits:"), chalk.green(stats.hits.toString()));
  console.log(chalk.gray("  Cache Misses:"), chalk.yellow(stats.misses.toString()));
  console.log(chalk.gray("  Total Saved:"), chalk.green(`$${stats.saved.toFixed(4)}`));
  console.log();
  process.exit(0);
}

// Handle --help flag
if (args.includes("--help") || args.includes("-h")) {
  console.log(chalk.cyan.bold("\n  MockProxy — AI Mock Layer\n"));
  console.log(chalk.white("  Usage: npx mockproxy [options]\n"));
  console.log(chalk.white("  Options:"));
  console.log(chalk.gray("    --port NUMBER          Local port (default: 4000)"));
  console.log(chalk.gray("    --mode MODE            live | cache | mock | strict (default: cache)"));
  console.log(chalk.gray("    --target URL           Real API to proxy"));
  console.log(chalk.gray("    --ignore-regex REGEX   Strip dynamic text before hashing"));
  console.log();
  console.log(chalk.white("  Providers:"));
  console.log(chalk.gray("    --openai KEY           OpenAI API key"));
  console.log(chalk.gray("    --nvidia               Enable NVIDIA NIM fallback"));
  console.log(chalk.gray("    --ollama               Enable Ollama offline fallback"));
  console.log();
  console.log(chalk.white("  Testing & UI:"));
  console.log(chalk.gray("    --strict               Error on cache miss (deterministic mode)"));
  console.log(chalk.gray("    --simulate-typing MS   Delay stream chunks to mimic latency"));
  console.log(chalk.gray("    --errors PERCENT       Inject random errors (0-100)"));
  console.log();
  console.log(chalk.white("  Output:"));
  console.log(chalk.gray("    --stats                Show savings stats"));
  console.log();
  process.exit(0);
}

const config = parseArgs(args);

// Create cache directory if needed
import { mkdirSync } from "fs";
mkdirSync(".mockproxy", { recursive: true });

// Start the proxy
startProxy(config);

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log(chalk.yellow("\n  Shutting down..."));
  const stats = getStats();
  console.log(chalk.cyan.bold("\n  Session Stats:"));
  console.log(chalk.gray("    Requests served from cache:"), chalk.green(stats.hits.toString()));
  console.log(chalk.gray("    Total saved:"), chalk.green(`$${stats.saved.toFixed(4)}`));
  console.log();
  process.exit(0);
});