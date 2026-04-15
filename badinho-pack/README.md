# Badinho Pack — VAI Public Profile Redesign

Drop-in automation for the Next.js port. Ben built this so you don't have to wire it from scratch.

## What's here

| File | Purpose |
|---|---|
| `route.ts` | Next.js Route Handler. Fetches profile, injects `window.VAI_PROFILE`, returns the full HTML template. Target: `app/public-profile/[id]/route.ts`. **Route Handler (not route.ts)** because the template is a complete HTML document — bypasses the App Router HTML shell, avoids nested `<html>` conflicts with `layout.tsx`. |
| `types.ts` | Full TypeScript contract for `VaiProfile`. Import in your fetcher to type-check the return shape. |
| `og-route.tsx` | `@vercel/og` image generator for link previews. Target: `app/api/og/[id]/route.tsx` |
| `install.sh` | One-shot installer. Copies all the files, creates a feature branch, installs deps. |
| `chat-route-probe.sh` | Curl probe to confirm `/chat/[id]` app route status. |
| `find-redirect.sh` | Grep-based scanner to locate the legacy `/profile → /highlights` redirect in your repo. |

## Quick start

```bash
cd ~/code/vai-game-day
~/vai-demos/badinho-pack/install.sh
```

That creates a feature branch, drops everything at the right paths, and installs `@vercel/og`. You're 15 minutes from a live PR.

## What you still own (the parts that need your codebase)

1. **Wire `getVaiProfile(id, token)` in `route.ts`** (TODO #1 marker in the file). Your existing user fetcher + token validator, shaped into `VaiProfile`. ~30 min.

2. **Wire the same fetcher in `og-route.tsx`** (TODO #1). Lighter display-only shape. Share a module with route.ts. ~10 min.

3. **Run `find-redirect.sh`** from the repo root. Tells you where the legacy redirect lives. Remove it. ~10 min.

4. **Run `chat-route-probe.sh`** to confirm whether `/chat/[id]` exists in the app. If 404, add the route; if 200 or redirects-to-app, leave it. ~5 min.

## Template self-hydrates

The template reads `window.VAI_PROFILE` on `DOMContentLoaded` and wires everything automatically:

- Attribution pill shows/hides based on `?ref=` / `?share=` URL param
- Coached-by chip shows/hides based on `coach` presence
- Meta chips (Class / Sport / Position / Location / HT+WT / 40-yd) hide individually when their field is null
- Verified badges only activate when `stat.verified === true`
- Role badges render dynamically from `user.roles` array
- Follower/following counts format with K/M suffixes
- Hero video falls back to poster image or placeholder when `topHighlight` is absent
- Highlights grid hides empty slots, supports video and image URLs
- Ability tab renders stars based on `abilities[].stars`
- Sport stats tab loops `sportStats[]`
- Share URL auto-appends `?share=HANDLE` when `viewer.affiliateHandle` is set
- AVANTI CTA gets `utm_content=[user.id]` injected automatically
- Accessibility: prefers-reduced-motion pauses video; connection-aware skips autoplay on 2G/3G
- Print stylesheet kicks in on Cmd+P

Nothing on the client needs you to wire it. Just inject the data.

## Audit trail

The template passed two independent Code Masters audits:

- **Cursor (GPT-5.4)** — two passes surfaced 14 findings → all remediated in commit 89d1fbe (attribute-injection, onkeydown desync, http:// allow, dead code)
- **Gemini 3.1 (Antigravity)** — independent re-audit on remediated code: Security 9.5 / Logic 9.2 / Quality 9.0 → APPROVED FOR HANDOFF

All attribute-injection vectors closed. All target="_blank" links carry `rel="noopener noreferrer"`. `isSafeURL()` allowlists `https:` and `vaiapp:` only. Focus trap on both modals with focus restoration. Data-attribute-based listeners (not inline event handlers).

Commit: `89d1fbe` on `ben-whitesides/vai-demos` main.

## Pushback welcome

If something in this pack doesn't match vai-game-day patterns, break it. I'd rather you ship idiomatic code than follow my scaffolding. Ping Ben with anything that feels off.
