# MockProxy Demo Video Script

**Duration:** 45-60 seconds
**Format:** Screen recording + voiceover + on-screen text

---

## SCENE 1: The Problem (5 seconds)

**Visual:** Terminal showing a wallet/app with -$200 balance or a billing dashboard showing high API costs

**Voiceover:** "I spent $200 testing my AI app last month."

**On-screen text:** "Testing AI apps = $$$"

---

## SCENE 2: The Solution (3 seconds)

**Visual:** MockProxy logo/title card

**Voiceover:** "So I built MockProxy."

**On-screen text:** "MockProxy — AI Mock Layer"

---

## SCENE 3: One Command Setup (5 seconds)

**Visual:** Terminal

```bash
npx @neurall.build/mockproxy --target https://api.openai.com
```

**Voiceover:** "One command. That's it."

**On-screen text:** "npx @neurall.build/mockproxy"

---

## SCENE 4: Before (10 seconds)

**Visual:** Split screen - terminal on left, code on right

**Terminal:**
```bash
$ curl https://api.openai.com/v1/chat/completions ...
Response received. Cost: $0.002
$ curl https://api.openai.com/v1/chat/completions ...
Response received. Cost: $0.002
$ curl https://api.openai.com/v1/chat/completions ...
Response received. Cost: $0.002
Total: $0.006 for 3 requests
```

**Voiceover:** "Without MockProxy, every test costs money."

**On-screen text:** "3 requests = $0.006"

---

## SCENE 5: After (10 seconds)

**Visual:** Same split screen, but requests go through localhost:4000

**Terminal:**
```bash
$ curl http://localhost:4000/v1/chat/completions ...
[MISS] Request cached. Cost: $0.002
$ curl http://localhost:4000/v1/chat/completions ...
[HIT] From cache. Cost: $0.000
$ curl http://localhost:4000/v1/chat/completions ...
[HIT] From cache. Cost: $0.000
Total: $0.002 for 3 requests (saved $0.004)
```

**Voiceover:** "With MockProxy, repeat requests are free."

**On-screen text:** "3 requests = $0.002 (saved 67%)"

---

## SCENE 6: Features Montage (15 seconds)

**Visual:** Quick cuts of different features

**Cut 1:** Stats endpoint
```bash
$ curl http://localhost:4000/__mockproxy/stats
{"hits": 42, "misses": 10, "saved": 2.84}
```
**Text:** "Track your savings"

**Cut 2:** Offline mode
```bash
$ mockproxy --ollama
[HIT] From cache
[MISS] Generated via Ollama (offline)
```
**Text:** "Works offline with Ollama"

**Cut 3:** Chaos testing
```bash
$ mockproxy --errors 20
[ERROR] Injected 502 Bad Gateway
```
**Text:** "Test error handling"

**Cut 4:** SDK integration
```typescript
const openai = new OpenAI({
  baseURL: "http://localhost:4000/v1"
});
```
**Text:** "Works with any SDK"

---

## SCENE 7: Call to Action (7 seconds)

**Visual:** Terminal + QR code / link

```bash
npx @neurall.build/mockproxy --help
```

**Voiceover:** "Try it now. Open source. MIT licensed."

**On-screen text:** 
"Try: npx @neurall.build/mockproxy"
"GitHub: github.com/Neurall-build/mockproxy"
"npm: @neurall.build/mockproxy"

---

## END CARD (3 seconds)

**Visual:** MockProxy logo + Neurall logo

**Text:** "Built by Neurall"
"Open Source • MIT License"

---

## Thumbnail Options

1. **Split wallet:** Left side empty wallet "$0", right side full wallet "$saved"
2. **Graph:** Bar chart showing "Before: $200" vs "After: $20"
3. **Terminal focus:** Bold text "Saved $180" with green checkmark
4. **Simple:** MockProxy logo with tagline "Test AI for $0"

---

## B-Roll Suggestions

- Typing in terminal (hands visible)
- Split screen showing code + response
- Browser tab with OpenAI billing dashboard
- "Wifi off" icon for offline demo
- Green "HIT" and red "MISS" indicators flashing

---

## Background Music

- Upbeat tech/lo-fi beat
- Low volume, non-distracting
- Building momentum toward the end

---

## Hashtags for Social

#AI #OpenAI #Anthropic #Gemini #DeveloperTools #OpenSource #Testing #SaveMoney #BunJS #TypeScript