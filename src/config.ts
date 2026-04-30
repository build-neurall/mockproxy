import pricingData from "../pricing.json" with { type: "json" };

export interface Config {
  port: number;
  mode: "live" | "cache" | "mock" | "strict";
  target?: string;
  ignoreRegex?: RegExp;
  simulateTyping: number;
  errorRate: number;
  providers: {
    openai?: string;
    nvidia?: boolean;
    ollama?: boolean;
  };
}

export const pricing = pricingData.models as Record<string, { input: number; output: number }>;

export function parseArgs(args: string[]): Config {
  const config: Config = {
    port: 4000,
    mode: "cache",
    simulateTyping: 0,
    errorRate: 0,
    providers: {},
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === "--port" && args[i + 1]) {
      config.port = parseInt(args[i + 1], 10);
      i++;
    } else if (arg === "--mode" && args[i + 1]) {
      config.mode = args[i + 1] as Config["mode"];
      i++;
    } else if (arg === "--target" && args[i + 1]) {
      config.target = args[i + 1];
      i++;
    } else if (arg === "--ignore-regex" && args[i + 1]) {
      config.ignoreRegex = new RegExp(args[i + 1], "g");
      i++;
    } else if (arg === "--simulate-typing" && args[i + 1]) {
      config.simulateTyping = parseInt(args[i + 1], 10);
      i++;
    } else if (arg === "--errors" && args[i + 1]) {
      config.errorRate = parseInt(args[i + 1], 10);
      i++;
    } else if (arg === "--openai" && args[i + 1]) {
      config.providers.openai = args[i + 1];
      i++;
    } else if (arg === "--nvidia") {
      config.providers.nvidia = true;
    } else if (arg === "--ollama") {
      config.providers.ollama = true;
    } else if (arg === "--strict") {
      config.mode = "strict";
    }
  }

  return config;
}