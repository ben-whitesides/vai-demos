# Badinho Pack — VAI Public Profile Redesign

**Status:** APPROVED for handoff. Commit `0d82abb` on `ben-whitesides/vai-demos` main.

---

## TL;DR

Ben built a full public athlete profile template (the one recruiters/coaches land on when an athlete shares their profile link) + a Next.js port automation pack. Your remaining work: ~30 min to wire two data fetcher stubs.

**Live preview:** https://ben-whitesides.github.io/vai-demos/vai-profile-public-redesign.html
**Spec (data contract + architecture):** [BADINHO-PROFILE-SPEC.md](../BADINHO-PROFILE-SPEC.md)
**Quick install (one command):**

```bash
cd ~/code/vai-game-day
~/path/to/vai-demos/badinho-pack/install.sh
```

---

## What's in this pack

| File | Purpose | Wire work |
|---|---|---|
| `route.ts` | Next.js Route Handler. Fetches profile server-side, injects `window.VAI_PROFILE`, returns the self-hydrating template. XSS-safe JSON injection, 404 fallback, `no-store` cache for revocable tokens, function-replacer meta-tag personalization, security headers. | Wire `getVaiProfile()` at TODO #1 |
| `types.ts` | Complete `VaiProfile` TypeScript contract with JSDoc | None — import as-is |
| `og-route.tsx` | `@vercel/og` image generator for link previews (Slack, iMessage, Twitter). 1200x630, avatar + top 3 stats + VAI brand. Avatar https-guarded with initial-letter fallback. | Wire same fetcher at TODO #1 |
| `install.sh` | Idempotent installer. Creates feature branch, drops files at correct paths, installs `@vercel/og`. Repo identity guard refuses to run outside vai-game-day (override with `VAI_INSTALL_FORCE=1`). | None |
| `chat-route-probe.sh` | Curl probe for `/chat/[id]` — answers the open spec question about whether that app route exists | Run once |
| `find-redirect.sh` | Grep scanner that locates the legacy `/profile → /highlights` redirect so you can kill it cleanly | Run once |

---

## Quick Start — 30 min to a feature branch

### 1. Install (2 min)

```bash
cd ~/code/vai-game-day
git status   # confirm clean working tree
~/path/to/vai-demos/badinho-pack/install.sh
```

The installer creates `feat/public-profile-redesign-YYYYMMDD`, copies all files to their correct paths, and installs `@vercel/og`. It refuses to run if it can't detect this is the vai-game-day repo (override: `VAI_INSTALL_FORCE=1 ~/path/to/install.sh`).

### 2. Wire the fetcher (15 min)

Two files have `TODO #1` markers for the same function:
- `app/public-profile/[id]/route.ts`
- `app/api/og/[id]/route.tsx`

Replace both stubs with your existing profile fetcher:

```typescript
async function getVaiProfile(id: string, token: string): Promise<VaiProfile | null> {
  // Validate the public token against the user's share_tokens table
  const row = await db.users.findByIdWithToken(id, token);
  if (!row) return null;
  // Shape into VaiProfile — see types.ts for the full contract
  return shapeToVaiProfile(row);
}
```

Recommend: share a single fetcher module between both routes. OG uses lighter display fields; route.ts uses the full shape.

### 3. Run the probes (5 min)

```bash
~/path/to/vai-demos/badinho-pack/chat-route-probe.sh
~/path/to/vai-demos/badinho-pack/find-redirect.sh
```

The first tells you whether `/chat/[id]` exists in app.vai.app (if 404, add the route). The second locates the legacy `/profile/[id] → /highlights` redirect in your codebase so you can remove it cleanly — recommend killing it (template serves the canonical URL directly).

### 4. Dev-test + commit (8 min)

```bash
npm run dev
open "http://localhost:3000/public-profile/a812b6d8-b406-439b-9d6b-fc1d8a3313cd?public=<any-token>"
# Confirm: page renders, tabs switch, modal opens, share toast fires (desktop)
git add . && git commit -m "feat: public profile redesign (template + OG route)"
git push -u origin feat/public-profile-redesign-<date>
gh pr create
```

---

## The Self-Hydrating Contract

Your server-side render injects one global:

```html
<script>window.VAI_PROFILE = { user: {...}, coach: {...}, stats: [...], ... };</script>
```

Template handles the rest automatically:

- Attribution pill shows only with `?ref=` or `?share=` URL param
- Coached-by chip shows only when `coach.id` is present
- Meta chips (Class / Sport / Position / Location / HT+WT / 40-yd) hide individually when null
- Verified ✓ badges only activate when `stat.verified === true`
- Role badges render dynamically from `user.roles[]`
- Follower/following counts format with K/M suffixes
- Hero video falls back to poster image or placeholder when `topHighlight` is absent
- Highlights grid hides empty slots, detects video vs image by URL
- Ability tab renders stars based on `abilities[].stars` (1-5)
- Share URL auto-appends `?share=HANDLE` when `viewer.affiliateHandle` is set (5-tier commission attribution)
- AVANTI CTA auto-injects `utm_content=[user.id]`
- Accessibility: `prefers-reduced-motion` pauses hero video; connection-aware skips autoplay on 2G/3G
- Print stylesheet activates on Cmd+P

Full contract in [`types.ts`](./types.ts) and [spec §2](../BADINHO-PROFILE-SPEC.md).

---

## Security Posture (from Code Masters audits)

The template + pack went through 3 audit rounds on different model families:

| Round | Judge | Result |
|---|---|---|
| 1 | Claude Haiku 4.5 (advisory) | CONDITIONAL → 5 findings fixed |
| 2 | Cursor GPT-5.4 (binding) | CONDITIONAL → 10 findings fixed (incl. HIGH `String.replace` `$&` injection) |
| 3 | Gemini 3.1 via Antigravity (binding) | CONDITIONAL → 1 new finding fixed (classYear range) |
| 4 | Cursor GPT-5.4 re-audit | ✅ APPROVED (9.3 / 9.1 / 9.0) |
| 5 | Gemini 3.1 re-audit | ✅ APPROVED (9.8 / 9.5 / 9.5) |

Key protections baked in:

- **XSS-safe JSON injection** — `safeJSONStringify()` escapes `<`, `>`, `&`, U+2028/U+2029 before embedding in `<script>` tag
- **Function replacers for meta tag personalization** — avoids `String.prototype.replace`'s `$&` / `$1` / `$'` special tokens that would inject previous regex matches from attacker-controlled profile strings
- **URL scheme allowlist** — `isSafeURL()` accepts only `https:` and `vaiapp:`; blocks `javascript:`, `data:`, `http:`, `file:`
- **`no-store` cache headers** — share tokens are revocable; no CDN/proxy caching of share HTML
- **UUID validation gate** — rejects junk IDs before hitting DB
- **All external links** carry `rel="noopener noreferrer"`
- **Focus trap + restoration** on both modals (WCAG)
- **Encoding on dynamic URLs** — `encodeURIComponent` wraps user IDs + tokens

---

## Pushback Welcome

If the pack conflicts with vai-game-day patterns you care about (MUI wrap, existing middleware, routing conventions), break it. Ship idiomatic code. Ping Ben with anything that feels off.

The spec recommends shipping this as a standalone Route Handler (option B) rather than MUI-wrapped (option A) — template is a complete HTML document, bypasses the App Router shell cleanly. See spec §5.
