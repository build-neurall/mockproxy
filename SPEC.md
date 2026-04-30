# MockProxy: The AI Mock Layer (v2 Refined Spec)

**Test your AI app without burning API credits.**

Mock OpenAI, Anthropic, Gemini — and any AI service. Zero API costs. Zero rate limits.
*Built by Neurall • Open Source (MIT) • 2026*

---

## 1. Vision & Positioning

MockProxy is positioned as a developer-first AI testing proxy for modern AI applications that rely on multiple external model providers. It acts as a local interceptor to cache, replay, and simulate AI responses.

## 2. The 2026 Reality & Developer Pain

Modern apps depend on 3-5 AI services. Testing them is expensive and non-deterministic.
*   "I spent $200 testing my AI feature this month."
*   "My CI/CD pipeline hit OpenAI rate limits."
*   "I can't test my streaming UI because the cache returns it instantly."

## 3. Solution Overview

MockProxy sits between your app and AI services. 
**App -> MockProxy (localhost:4000) -> [Cache / NVIDIA NIM / Ollama] -> Real API**

### Operating Modes:
*   **Live Mode:** Passes requests to real AI and caches responses.
*   **Mock Mode:** Returns cached responses with zero API calls. Fallback to local AI.
*   **Hybrid Mode:** New requests go to real AI; repeated requests use cache.
*   **Test Mode:** Deterministic responses for CI/CD pipelines.

---

## 4. Core Features & Refinements (v2 Updates)

### A. Smart Caching & The "Dynamic Prompt" Fix

Cache keys are generated from the provider, model, parameters, and request body. 

**v2 Refinement:** AI apps often inject timestamps or UUIDs (e.g., `session_id: 12345`) which breaks caching hashes.
*   **Feature:** Use `--ignore-regex` to strip dynamic variables before hashing.
*   **Example:** `npx mockproxy --ignore-regex "timestamp: [0-9]+"` ensures the cache hits even if the time changes.

### B. Local AI Fallback (NVIDIA NIM & Ollama)

On a cache miss in mock mode, MockProxy generates responses without external API costs.

**v2 Refinement:** Separating Cloud Free-Tier from True Offline.
*   **NVIDIA NIM (Zero-Cost Cloud):** Uses your free developer credits to route missed cache requests to `Llama-3.1-8b` via cloud.
*   **Ollama (True Offline):** If you are on an airplane or air-gapped, use `--ollama`. MockProxy routes the request to your local RAM running `llama3.1:8b`.

### C. Streaming Support & "Instant Stream" UI Fix

**v2 Refinement:** If a cached stream replays instantly (0ms), it breaks frontend typewriter animations.
*   **Feature:** Simulated Latency via `--simulate-typing`.
*   **Example:** `npx mockproxy --simulate-typing=50` throttles the cached stream chunks to 50ms intervals, perfectly mimicking real OpenAI network latency so your UI tests are accurate.

### D. Deterministic Testing

Run tests with locked responses (`--strict --seed=42`). Ensures stable CI/CD pipelines with zero flaky AI responses and zero API cost.

### E. SDK Setup & Routing Quirks (The Anthropic/Gemini Fix)

**v2 Refinement:** While OpenAI's SDK easily accepts `OPENAI_API_BASE`, Anthropic and Gemini SDKs stubbornly resist custom base URLs.
*   **Feature:** MockProxy includes a native SDK patcher. 
*   **Docs Note:** The documentation will explicitly provide the boilerplate for initializing the Anthropic client (`new Anthropic({ baseURL: 'http://localhost:4000/v1' })`) and Gemini's custom fetch handlers to force them through the proxy.

---

## 5. CLI Interface (Updated)

```bash
npx mockproxy [options]

OPTIONS:
  --port NUMBER             Local port (default: 4000)
  --mode MODE               live | cache | mock | strict (default: cache)
  --ignore-regex REGEX      Strip dynamic text before hashing (e.g., "date:.*")

PROVIDERS:
  --openai KEY              OpenAI API key
  --nvidia                  Enable NVIDIA NIM fallback (Cloud)
  --ollama                  Enable true offline fallback (Local localhost:11434)

TESTING & UI:
  --strict                  Error on cache miss (deterministic mode)
  --simulate-typing MS      Delay stream chunks by MS to mimic network latency (default: 0)
  --errors PERCENT          Inject random 500/429 errors (0-100)

OUTPUT:
  --stats                   Show savings stats on exit
```

## 6. Architecture & Tech Stack (8GB PC Optimized)

*   **Runtime:** Bun (Lightning fast startup)
*   **HTTP Framework:** Hono (Minimal RAM footprint)
*   **Storage:** SQLite (`better-sqlite3`)
*   **State Memory:** ~40MB Idle, ~60MB Active Proxying.

## 7. Launch Strategy (The Viral Hook)

**The Hook:** *"I tested my AI app 10,000 times this month. It cost me $0. Last month it cost $400."*

**The Video:** 
1. Show an app running standard OpenAI tests -> Costs $5.00.
2. Run `npx mockproxy`. Change 1 line of code.
3. Run tests again -> Shows typewriter streaming perfectly, but Terminal prints `[HIT] Cache - Saved $5.00`.
4. Turn off WiFi. Run tests again -> Fallback to Ollama works perfectly.

## 8. Competitive Differentiation (The "Anti-aimock" Strategy)

While competitors build heavy testing infrastructure (Docker, Drift Detection, A2A), MockProxy wins by being the lightest, fastest, cost-saving proxy.

| Feature | aimock (CopilotKit) | MockProxy (Neurall) | Why it matters |
|---------|---------------------|---------------------|----------------|
| **Focus** | QA & Drift Testing | **Wallet Savings** | Devs care more about their own credit card bills than drift detection. |
| **Offline** | Provider-based only | **Ollama Auto-Offline** | True airplane-mode coding without internet. |
| **Cloud Free**| None | **NVIDIA NIM Fallback** | Uses free developer credits to mock expensive GPT-4 calls. |
| **Metrics** | Pass/Fail Rates | **`--stats` Dashboard** | Shows literal dollars saved. Highly viral for screenshots. |

---

## 9. The Pricing Engine (Fueling the `--stats` Dashboard)

To make the "Money Saved: $47.80" terminal output mathematically accurate, MockProxy requires an internal pricing dictionary.

### The `pricing.json` Map (2026 Rates per 1M Tokens)

```json
{
  "models": {
    "gpt-4o": { "input": 5.00, "output": 15.00 },
    "gpt-3.5-turbo": { "input": 0.50, "output": 1.50 },
    "claude-3-5-sonnet": { "input": 3.00, "output": 15.00 },
    "claude-3-haiku": { "input": 0.25, "output": 1.25 },
    "gemini-1.5-pro": { "input": 3.50, "output": 10.50 },
    "gemini-1.5-flash": { "input": 0.35, "output": 1.05 }
  }
}
```

### The Calculation Logic

When a cache hit occurs:
1. Count the tokens of the cached prompt (Input)
2. Count the tokens of the cached response (Output)
3. Multiply by the model's rate from `pricing.json`
4. Add to the SQLite `stats` table

---

## 10. Fast Token Counting (Bun Optimized)

Instead of relying on the slow, heavy official `tiktoken` library, MockProxy uses a lightweight JS/WASM tokenizer optimized for Bun.

```typescript
// src/tokenizer.ts
import { encode } from "gpt-tokenizer/cjs/model/gpt-4o";

export function calculateTokens(text: string): number {
    // Fast, synchronous token counting
    return encode(text).length;
}

export function calculateSavings(model: string, inputTokens: number, outputTokens: number): number {
    const rates = pricingMap.models[model] || pricingMap.models["gpt-3.5-turbo"]; // fallback
    const inputCost = (inputTokens / 1000000) * rates.input;
    const outputCost = (outputTokens / 1000000) * rates.output;
    return inputCost + outputCost;
}
```

---

## 11. Final Polish Checklist (Before Coding)

- [x] **Dynamic Prompt Hashing:** Implemented `--ignore-regex` to strip timestamps/UUIDs before generating the SQLite cache key.
- [x] **UI Streaming Fix:** Implemented `--simulate-typing=MS` to throttle cached text chunks, preventing frontend UI animations from breaking on instant cache hits.
- [x] **SDK Routing Patches:** Documentation updated to show developers how to force Anthropic and Gemini SDKs to accept `localhost:4000` as their base URL.
- [x] **True Offline:** Replaced the cloud-only NVIDIA fallback in "offline mode" with a local `Ollama` fallback for true air-gapped development.

---

## 12. Status: READY TO BUILD

**Project Spec:** 100% Complete  
**Ready for:** Phase 1 Scaffolding

---

*Built by Neurall • Open Source (MIT) • 2026*