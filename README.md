# MockProxy — AI Mock Layer

**Test your AI app without burning API credits.**

[![npm version](https://badge.fury.io/js/@neurall.build/mockproxy.svg)](https://badge.fury.io/js/@neurall.build/mockproxy)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Mock OpenAI, Anthropic, Gemini — and any AI service. Zero API costs. Zero rate limits. Works offline.

```
npm install -g @neurall.build/mockproxy
# or
npx @neurall.build/mockproxy --target https://api.openai.com
```

---

## Why MockProxy?

**The Problem:**
- "I spent $200 testing my AI feature this month."
- "My CI/CD pipeline hit OpenAI rate limits."
- "I can't test offline because my app needs AI."

**The Solution:**
MockProxy sits between your app and AI services. It caches responses and returns them on repeat requests. Save 90%+ on API costs.

---

## Quick Start

### 1. Install & Run

```bash
# Run instantly with npx
npx @neurall.build/mockproxy --target https://api.openai.com

# Or install globally
npm install -g @neurall.build/mockproxy
mockproxy --target https://api.openai.com
```

### 2. Configure Your SDK

**OpenAI SDK:**
```typescript
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "http://localhost:4000/v1", // Route through MockProxy
});
```

**Anthropic SDK:**
```typescript
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: "http://localhost:4000", // Route through MockProxy
});
```

**Vercel AI SDK:**
```typescript
import { openai } from "@ai-sdk/openai";

const model = openai({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "http://localhost:4000/v1",
});
```

### 3. Test & Save

```bash
# First request -> Goes to real API, gets cached
curl http://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model": "gpt-4o-mini", "messages": [{"role": "user", "content": "Hello"}]}'

# Check stats
curl http://localhost:4000/__mockproxy/stats
# {"hits": 0, "misses": 1, "saved": 0.0002}

# Second request -> Returns cached response, saves money
curl http://localhost:4000/v1/chat/completions ...

# Check stats again
curl http://localhost:4000/__mockproxy/stats
# {"hits": 1, "misses": 1, "saved": 0.0004}
```

---

## CLI Reference

```bash
npx @neurall.build/mockproxy [options]

OPTIONS:
  --target URL        Real API to proxy (required)
  --port NUMBER       Local port (default: 4000)
  --mode MODE         live | cache | mock | strict (default: cache)

PROVIDERS:
  --nvidia            Enable NVIDIA NIM fallback (cloud, free tier)
  --ollama            Enable Ollama fallback (offline, requires Ollama)

TESTING:
  --strict            Error on cache miss (deterministic mode for CI/CD)
  --errors PERCENT    Inject random errors (0-100) for chaos testing
  --simulate-typing MS  Delay stream chunks to mimic real network latency

CACHING:
  --ignore-regex REGEX  Strip dynamic text before hashing (e.g., "timestamp:.*")

OUTPUT:
  --stats             Show savings summary on exit
  --help              Show help message
```

---

## Operating Modes

### Live Mode (`--mode live`)
Passes all requests to real API and caches responses. Good for initial data collection.

### Cache Mode (`--mode cache`) **[DEFAULT]**
Returns cached responses when available. On cache miss, calls real API and caches.

### Mock Mode (`--mode mock`)
Returns cached responses only. On cache miss, generates AI response via NVIDIA NIM or Ollama. **Never calls real API.**

### Strict Mode (`--strict`)
Errors on cache miss. Perfect for CI/CD pipelines where you want deterministic tests.

---

## SDK Integration

### OpenAI (Easiest)
```typescript
// Option 1: Environment variable
export OPENAI_BASE_URL=http://localhost:4000/v1

// Option 2: Constructor
const openai = new OpenAI({
  baseURL: "http://localhost:4000/v1",
});
```

### Anthropic
```typescript
const anthropic = new Anthropic({
  baseURL: "http://localhost:4000",
});
```

### Google Gemini
```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(API_KEY, {
  baseUrl: "http://localhost:4000/v1beta",
});
```

### Vercel AI SDK
```typescript
import { openai } from "@ai-sdk/openai";

const model = openai({
  baseURL: "http://localhost:4000/v1",
});
```

See [examples/sdk-integration.ts](examples/sdk-integration.ts) for complete examples.

---

## Features

### 💰 Cost Savings
Accurate token counting and pricing. See exactly how much you saved:
```bash
curl http://localhost:4000/__mockproxy/stats
# {"hits": 42, "misses": 10, "saved": 2.847}
```

### 🔄 Streaming Support
Works with SSE streaming responses. Use `--simulate-typing` to preserve typewriter UI animations:
```bash
mockproxy --simulate-typing 50  # 50ms delay per chunk
```

### 🔌 Offline Mode
With `--ollama`, cache misses go to your local Ollama instance:
```bash
# Install Ollama first
ollama pull llama3.1:8b

# Start MockProxy with offline support
mockproxy --target https://api.openai.com --ollama
```

### ⚡ NVIDIA NIM Fallback
Use your free NVIDIA developer credits for AI generation:
```bash
mockproxy --target https://api.openai.com --nvidia
```

### 🧪 Chaos Testing
Inject random errors to test your app's error handling:
```bash
mockproxy --errors 20  # 20% of requests will fail
```

### 📊 Deterministic CI/CD
Use strict mode for reproducible tests:
```bash
mockproxy --strict --seed 42
```

---

## Use Cases

| Use Case | Command |
|----------|---------|
| **Development** | `mockproxy --target https://api.openai.com` |
| **Offline coding** | `mockproxy --target https://api.openai.com --ollama` |
| **CI/CD testing** | `mockproxy --target https://api.openai.com --strict` |
| **Error handling tests** | `mockproxy --target https://api.openai.com --errors 20` |
| **Streaming UI tests** | `mockproxy --target https://api.openai.com --simulate-typing 50` |

---

## Supported AI Providers

- ✅ OpenAI (GPT-4, GPT-3.5, etc.)
- ✅ Anthropic (Claude 3.5 Sonnet, Haiku, etc.)
- ✅ Google Gemini (1.5 Pro, Flash, etc.)
- ✅ Any OpenAI-compatible API (Together, Groq, etc.)

---

## How It Works

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  Your App   │ ───▶ │  MockProxy  │ ───▶ │  Real API   │
└─────────────┘      └─────────────┘      └─────────────┘
                            │
                            ▼
                     ┌─────────────┐
                     │   Cache     │
                     │  (SQLite)   │
                     └─────────────┘
```

1. App sends request to MockProxy
2. MockProxy checks cache
3. **Cache HIT** → Return cached response, save money
4. **Cache MISS** → Forward to real API, cache response

---

## Benchmarks

| Metric | Value |
|--------|-------|
| Memory (idle) | ~40MB |
| Memory (active) | ~60MB |
| Cache hit latency | <1ms |
| Startup time | <100ms |

---

## Roadmap

- [ ] Web UI for cache management
- [ ] Export/import cache as JSON
- [ ] Semantic similarity caching
- [ ] Team shared cache server
- [ ] Custom model pricing config

---

## Contributing

Contributions welcome! See [SPEC.md](SPEC.md) for architecture details.

```bash
# Clone and develop
git clone https://github.com/Neurall-build/mockproxy
cd mockproxy
bun install
bun run src/index.ts --help
```

---

## License

MIT © [Neurall](https://github.com/Neurall-build)

---

## Links

- [npm](https://www.npmjs.com/package/@neurall.build/mockproxy)
- [GitHub](https://github.com/Neurall-build/mockproxy)
- [Documentation](https://github.com/Neurall-build/mockproxy#readme)