# Francis Pack — VAI Profile API Contract

**Status:** APPROVED for handoff. Commit `0d82abb` on `ben-whitesides/vai-demos` main.

---

## TL;DR

Ben built a full public athlete profile template (the one recruiters/coaches land on when an athlete shares their profile) + an API shaping pack for you. Your remaining work: ~20 min to run two SQL probes and report back, then shape the response.

**Live preview:** https://ben-whitesides.github.io/vai-demos/vai-profile-public-redesign.html
**Spec (data contract + open questions):** [BADINHO-PROFILE-SPEC.md](../BADINHO-PROFILE-SPEC.md)

---

## What's in this pack

| File | Purpose | Effort |
|---|---|---|
| `probe-stat-verified.sql` | 4-query psql probe that finds where `stat.verified` lives in your schema — column, enum, event log, or missing | 5 min |
| `probe-coach-linkage.sql` | Same pattern for coach ↔ athlete linkage — direct FK, junction table, or missing | 5 min |
| `api-contract-validator.ts` | Zod validator runs against your live profile endpoint and prints a field-by-field diff of any schema violations. Enforces `https://` on all media URLs, 15s fetch timeout, JSON-family content-type regex (accepts `application/vnd.api+json`, `application/ld+json`) | 5 min setup + run on demand |
| `example-response.json` | Complete reference `VaiProfile` payload — drop-in test fixture. Passes the Zod schema cleanly. | Fixture |
| `example-response.README.md` | Docs for the fixture | Read once |
| `../badinho-pack/types.ts` | TypeScript contract Badinho's route.ts uses — import to type-check your response shaper | Reference |

---

## Quick Start — ~20 min end-to-end

### 1. Run the schema probes (5 min)

```bash
psql $VAI_API_DATABASE_URL -f probe-stat-verified.sql > /tmp/stat-verified.txt
psql $VAI_API_DATABASE_URL -f probe-coach-linkage.sql > /tmp/coach-linkage.txt
```

Reply back with these four answers — they drive how we shape the response:

- Does the stat/PR table have a `verified BOOLEAN` column? *(Pattern A — direct flag)*
- Or a `source` enum with values like `"app" / "self" / "coach"`? *(Pattern B — derive verified)*
- Does the users table have a `coach_user_id` FK? *(Pattern A)*
- Or is there a `user_relationships` junction table? *(Pattern B)*

If no linkage exists yet → we hide the Coached-by chip for v1 and plan a migration for v2.

### 2. Shape the profile endpoint (10 min)

Match the `VaiProfile` structure in [`example-response.json`](./example-response.json) + [`../badinho-pack/types.ts`](../badinho-pack/types.ts):

**Nullable discipline matters.** Every optional field should be `null` (not empty string, not zero) when missing — the template uses `null` checks to hide chips conditionally. If a user has no coach, `coach: null`. No pinned highlight, `topHighlight: null`. No position, `user.position: null`.

**Token validation.** Endpoint must return 404 when `public` token is expired, revoked, or doesn't match the user's current share_token. Template already handles 404 via `notFound()`.

**HTTPS enforcement at write time.** All `avatar` / `highlight.url` / `highlight.poster` / `videoUrl` must be `https://`. Template's `isSafeURL()` blocks `http://` for mixed-content safety. Enforce in your DB layer validation.

### 3. Validate before merge (5 min)

```bash
npm install zod@^3.23 tsx
tsx api-contract-validator.ts \
  a812b6d8-b406-439b-9d6b-fc1d8a3313cd \
  8951bdc6-271d-4571-9f2e-85552a490b9e \
  https://api-staging.vai.app/v1
```

- Exit 0 = contract matches → template renders correctly
- Exit 1 = shape mismatch → script prints exact fields to fix
- Exit 2 = network/auth failure

---

## Security Notes (reinforce server-side)

The template + pack went through 3 audit rounds on different model families. Reinforcements that belong on your side:

- **Allowlist `stat.key` at write time:** must match `/^[a-zA-Z0-9_-]+$/`. Template defense-in-depths this; enforce at the DB write layer too.
- **Sanitize handles at signup:** `/^[a-zA-Z0-9_]+$/`. Template uses `textContent` so XSS is blocked client-side, but UX breaks with weird characters.
- **Rate-limit token lookups.** `?public=[token]` is a guessable target for brute-force. Standard auth rate limits apply.
- **CDN-only avatars.** Only accept `prod.media.vai.app` URLs for `user.avatar` on profile edit — prevents arbitrary image hosting injection.

---

## Audit Trail

| Round | Judge | Result |
|---|---|---|
| 1 | Claude Haiku 4.5 (advisory) | CONDITIONAL → 5 findings fixed |
| 2 | Cursor GPT-5.4 (binding) | CONDITIONAL → 10 findings fixed |
| 3 | Gemini 3.1 via Antigravity (binding) | CONDITIONAL → 1 new finding fixed |
| 4 | Cursor GPT-5.4 re-audit | ✅ APPROVED (9.3 / 9.1 / 9.0) |
| 5 | Gemini 3.1 re-audit | ✅ APPROVED (9.8 / 9.5 / 9.5) |

Final HEAD: `0d82abb` on `ben-whitesides/vai-demos` main.

---

## Open Questions for You

Flagged in the spec. Your answers unblock the final wire-up:

1. **Authoritative source for `stat.verified`** — measured-in-app event log? Flag on stat record? Enum field?
2. **Coach linkage field** — which column/table surfaces `coach.id` and `coach.handle` on the user record?
3. **Role taxonomy normalization** — memory shows bwhite's role is "Jumpers" in-app. Is that legacy, or is it a different taxonomy than Athlete/Coach/Trainer/Parent/Builder?
4. **`/chat/[USER_ID]` route** — Badinho will probe it, but if the route doesn't exist we need to add it (universal link fires regardless).

Ping Ben with blockers. The goal of this pack is to save you reverse-engineering time — if any probe surfaces something unexpected, realign before building.
