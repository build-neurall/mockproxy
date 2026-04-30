import { encode } from "gpt-tokenizer";
import { pricing } from "./config.ts";

export function calculateTokens(text: string): number {
  return encode(text).length;
}

export function calculateSavings(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const rates = pricing[model] || pricing["gpt-3.5-turbo"];
  const inputCost = (inputTokens / 1_000_000) * rates.input;
  const outputCost = (outputTokens / 1_000_000) * rates.output;
  return inputCost + outputCost;
}

export function getModelFromPath(path: string): string {
  // Extract model from path like /v1/chat/completions -> look at request body
  // Default to gpt-3.5-turbo for now
  return "gpt-3.5-turbo";
}