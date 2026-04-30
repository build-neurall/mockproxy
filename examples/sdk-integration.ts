/**
 * MockProxy SDK Integration Examples
 * 
 * This file shows how to configure different AI SDKs to route through MockProxy
 */

// ============================================
// OPENAI SDK (Easiest - supports custom baseURL)
// ============================================

import OpenAI from "openai";

// Method 1: Using OPENAI_BASE_URL environment variable
// export OPENAI_BASE_URL=http://localhost:4000/v1
// Then use OpenAI normally

// Method 2: Pass baseURL in constructor
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "http://localhost:4000/v1", // Route through MockProxy
});

async function testOpenAI() {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: "Say hello!" }],
  });
  
  console.log(completion.choices[0].message.content);
}

// ============================================
// ANTHROPIC SDK (Requires baseURL override)
// ============================================

import Anthropic from "@anthropic-ai/sdk";

// Anthropic SDK accepts baseURL in constructor
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: "http://localhost:4000", // Route through MockProxy
});

async function testAnthropic() {
  const message = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    messages: [{ role: "user", content: "Say hello!" }],
  });
  
  console.log(message.content[0]);
}

// ============================================
// GOOGLE GEMINI SDK (Custom fetch required)
// ============================================

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function testGemini() {
  // Gemini doesn't support baseURL directly, but you can use fetch:
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    // Use custom fetch that routes through MockProxy
    baseUrl: "http://localhost:4000/v1beta", 
  });
  
  const result = await model.generateContent("Say hello!");
  console.log(result.response.text());
}

// ============================================
// VERCEL AI SDK (Easy - supports baseURL)
// ============================================

import { generateText } from "ai";
import { openai as openaiProvider } from "@ai-sdk/openai";
import { anthropic as anthropicProvider } from "@ai-sdk/anthropic";

// Configure providers to use MockProxy
const mockOpenAI = openaiProvider({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "http://localhost:4000/v1",
});

const mockAnthropic = anthropicProvider({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: "http://localhost:4000/v1",
});

async function testVercelAI() {
  const { text } = await generateText({
    model: mockOpenAI("gpt-4o-mini"),
    prompt: "Say hello!",
  });
  
  console.log(text);
}

// ============================================
// STREAMING EXAMPLE
// ============================================

async function testStreaming() {
  const stream = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: "Count from 1 to 10" }],
    stream: true,
  });
  
  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content || "");
  }
}

// ============================================
// TESTING WITH MOCKPROXY
// ============================================

/**
 * Step-by-step:
 * 
 * 1. Start MockProxy:
 *    npx mockproxy --target https://api.openai.com --port 4000
 * 
 * 2. Run your code with the SDK configured to use localhost:4000
 * 
 * 3. First request -> Goes to real API, gets cached
 * 4. Second request -> Returns cached response, saves money
 * 
 * For CI/CD (deterministic tests):
 *    npx mockproxy --target https://api.openai.com --strict
 * 
 * For offline development:
 *    npx mockproxy --target https://api.openai.com --ollama
 * 
 * For testing error handling:
 *    npx mockproxy --target https://api.openai.com --errors 20
 */

export { testOpenAI, testAnthropic, testGemini, testVercelAI, testStreaming };