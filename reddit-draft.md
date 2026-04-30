# MockProxy — Test your AI app without burning API credits (open source)

Hey r/webdev,

I built MockProxy after hitting the same wall too many times: "I spent $200 testing my AI feature this month."

**What it does:**

MockProxy sits between your app and AI APIs (OpenAI, Anthropic, Gemini). It:
- Caches every response automatically
- Returns cached data on repeat requests (zero API cost)
- Shows you exactly how much money you saved

**The hook:**

```bash
npx @neurall.build/mockproxy --target https://api.openai.com
```

Change your app's API base URL to `http://localhost:4000`. That's it. Every request now:
- First time → Calls real API, caches response
- Second time → Returns cached response, saves you money

**Example output:**
```
[MISS] POST /v1/chat/completions (245 in + 512 out tokens)
[HIT] POST /v1/chat/completions Saved $0.0089
```

**Features:**

- **Streaming support** — Works with SSE/chat streams
- **`--simulate-typing`** — Throttles cached streams so your typewriter UI animations don't break
- **`--errors 30`** — Injects random 500/429 errors to test your error handling
- **Ollama fallback** — Works offline with local LLMs
- **NVIDIA NIM** — Free cloud AI fallback using dev program credits
- **`--ignore-regex`** — Strips timestamps/UUIDs so cache keys actually work

**Use cases:**

1. Dev iteration — Stop paying to test the same prompt 50 times
2. CI/CD — Deterministic tests, no flaky AI responses
3. Offline work — Airplane mode coding with Ollama
4. Chaos testing — See if your app handles errors gracefully

**Why I built this:**

Modern apps depend on 3-5 AI services. Testing is expensive and non-deterministic. I wanted something that just works — no config files, no Docker, no enterprise features. Just `npx` and go.

**Links:**

- GitHub: https://github.com/build-neurall/mockproxy
- npm: https://npmjs.com/package/@neurall.build/mockproxy

MIT licensed. BYOK (bring your own NVIDIA/Ollama keys).

Would love feedback from anyone building AI apps. What's your current workflow for testing without burning credits?