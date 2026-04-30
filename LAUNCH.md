# MockProxy Launch Materials

## Product Hunt Launch

**Tagline:** Test your AI app without burning API credits

**Description:**
MockProxy is a local proxy that caches AI API responses. Run your tests 1000x without paying 1000x. Works with OpenAI, Anthropic, Gemini, and any AI API. Use offline with Ollama. Save 90%+ on API costs.

**Topics:** Developer Tools, Open Source, Artificial Intelligence, Testing

---

## Hacker News (Show HN)

**Title:** Show HN: MockProxy – Test your AI app without burning API credits

**Body:**
Hi HN,

I built MockProxy after spending $200 on API costs just testing an AI feature.

The idea is simple: a local proxy that sits between your app and AI APIs (OpenAI, Anthropic, Gemini). It caches responses and returns them on repeat requests.

Key features:
- One command setup: `npx @neurall.build/mockproxy --target https://api.openai.com`
- Works with any AI SDK (OpenAI, Anthropic, Vercel AI SDK, etc.)
- Accurate cost tracking with token counting
- Offline mode with Ollama integration
- Chaos testing with random error injection
- <1ms cache hit latency, ~40MB RAM

Example:
```bash
# First request → $0.002 (goes to OpenAI)
# Second request → $0.000 (cached response)
# Stats: {"hits": 1, "misses": 1, "saved": 0.002}
```

Built with Bun + Hono + SQLite. MIT licensed.

GitHub: https://github.com/Neurall-build/mockproxy
npm: https://www.npmjs.com/package/@neurall.build/mockproxy

Would love feedback from anyone building AI apps!

---

## Reddit (r/programming, r/webdev, r/reactjs, r/node)

**Title:** I built a local proxy that caches AI API responses. Saved 90% on testing costs.

**Body:**
Hey everyone,

Like many of you, I've been building AI-powered apps. The problem? Testing them gets expensive fast. I spent $200 last month just on API calls during development.

So I built MockProxy - a lightweight proxy that sits between your app and AI APIs:

```bash
npx @neurall.build/mockproxy --target https://api.openai.com
```

Then point your OpenAI SDK to `http://localhost:4000/v1` instead of the real API.

**How it works:**
1. First request → Goes to real API, gets cached
2. Second request → Returns cached response instantly
3. See exactly how much you saved: `{"hits": 42, "saved": 2.84}`

**Features:**
- Works offline with Ollama
- Chaos testing (inject random errors)
- Streaming support (with simulated latency for UI testing)
- Deterministic mode for CI/CD

It's open source (MIT) and runs on Bun with ~40MB RAM.

Would love feedback: [GitHub link]

---

## Twitter/X Thread

1/6
I spent $200 testing my AI app last month.

So I built MockProxy - a local proxy that caches AI API responses.

Now I can run 1000 tests for the price of 1.

Here's how it works: 🧵

2/6
Run one command:
npx @neurall.build/mockproxy --target https://api.openai.com

Point your OpenAI SDK to localhost:4000

First request → Goes to OpenAI, gets cached
Second request → Returns cached response

3/6
Real savings:

Before: 1000 API calls × $0.002 = $2.00
After: 1 API call + 999 cache hits = $0.002

The proxy tracks tokens and shows exactly how much you saved.

4/6
Works with:
→ OpenAI (GPT-4, GPT-3.5)
→ Anthropic (Claude 3.5)
→ Google Gemini
→ Any OpenAI-compatible API

Also supports offline mode with Ollama.

5/6
Built with Bun + Hono + SQLite.
~40MB RAM, <1ms cache latency.
MIT licensed.

6/6
Try it now:
npx @neurall.build/mockproxy --help

GitHub: https://github.com/Neurall-build/mockproxy

What would you add?

---

## Dev.to Article Title

**Title:** How I Cut My AI API Testing Costs by 90% with a Local Proxy

---

## LinkedIn Post

Built this after realizing I was spending more on API testing than my actual app usage.

MockProxy is a simple idea: intercept AI API calls, cache the responses, reuse them.

One command setup. Works with any AI SDK. Shows exactly how much you saved.

Open source, MIT licensed.

Link in comments 👇

---

## Email to Newsletter

Subject: New tool for AI developers: Save 90% on API testing costs

Hi [Name],

I just released MockProxy - a free, open-source tool that caches AI API responses during development and testing.

**Problem:** Testing AI features is expensive. I spent $200 last month just on test API calls.

**Solution:** MockProxy sits between your app and AI APIs, caches responses, and returns them on repeat requests.

**Quick start:**
```bash
npx @neurall.build/mockproxy --target https://api.openai.com
```

Then configure your SDK:
```javascript
const openai = new OpenAI({
  baseURL: "http://localhost:4000/v1"
});
```

First request → Real API call (cached)
Subsequent requests → Cached response (free)

**Features:**
- Works with OpenAI, Anthropic, Gemini
- Offline mode with Ollama
- Accurate cost tracking
- Chaos testing for error handling
- <1ms cache latency

MIT licensed. Built with Bun + Hono.

GitHub: https://github.com/Neurall-build/mockproxy

Happy building!

---

## Short Descriptions for Directories

**npm description (already set):**
Test your AI app without burning API credits - Mock OpenAI, Anthropic, Gemini and any AI service

**GitHub description:**
A lightweight proxy that caches AI API responses. Save 90%+ on testing costs. Works with OpenAI, Anthropic, Gemini. Offline support with Ollama.

**Product Hunt one-liner:**
Test your AI app 1000 times, pay for 1 API call.