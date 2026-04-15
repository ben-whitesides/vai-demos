# Francis Pack — VAI Public Profile API Contract

Ben built these probes so you don't have to hunt through schemas to answer the two open questions in the spec, plus a validator so you can confirm your endpoint matches the template's contract.

## What's here

| File | Purpose |
|---|---|
| `probe-stat-verified.sql` | Scans schemas for the source of `stat.verified`. Run once, report back. |
| `probe-coach-linkage.sql` | Finds how coach↔athlete linkage is stored (direct FK, junction table, or missing). |
| `api-contract-validator.ts` | Zod-based contract test. Runs against your profile endpoint and prints a diff of any schema violations. |
| `example-response.json` | Complete reference payload in the exact shape the template expects. Use as a fixture. |

## Quick start

### 1. Run the schema probes (5 min)

```bash
psql $VAI_API_DATABASE_URL -f probe-stat-verified.sql > /tmp/stat-verified-probe.txt
psql $VAI_API_DATABASE_URL -f probe-coach-linkage.sql > /tmp/coach-linkage-probe.txt
```

Then reply to Ben's DM with:
- Does the stat/PR table have a `verified BOOLEAN` column? (pattern A)
- Is there a `source` enum on the stat? (pattern B)
- Does the user table have `coach_user_id`? (pattern A)
- Or is there a `user_relationships` junction table? (pattern B)

Those four answers tell us how to wire the response shaper.

### 2. Validate your endpoint matches the contract (5 min)

Once the endpoint is shaped, run the validator against staging:

```bash
npm install zod tsx          # if not installed
tsx api-contract-validator.ts \
  a812b6d8-b406-439b-9d6b-fc1d8a3313cd \
  8951bdc6-271d-4571-9f2e-85552a490b9e \
  https://api-staging.vai.app/v1
```

- Exit 0 = contract matches, template will render correctly
- Exit 1 = shape mismatch; script prints exact fields to fix
- Exit 2 = network/auth failure

### 3. Use `example-response.json` as a fixture

Drop `example-response.json` into your test suite to lock the response shape. If your endpoint returns this exact structure (nullables respected), the template self-configures.

## Your remaining work

1. **Shape the response.** Once the probes tell us where `verified` and `coach` live, wire the response shaper in your profile endpoint to match `VaiProfile` (types in `../badinho-pack/types.ts`).

2. **Nullable discipline.** Every optional field should be `null` (not empty string, not zero) when missing. The template uses `null` checks to hide chips.

3. **Token validation.** Endpoint must 404 when `public` token is expired, revoked, or doesn't match the user's current share_token. Template already handles 404 via `notFound()`.

4. **HTTPS everywhere.** All `avatar` / `videoUrl` / highlight URLs must be `https://`. The template's `isSafeURL()` blocks `http://` for mixed-content safety. Enforce at write time in your DB layer.

5. **Run the validator before merging.** It's your contract test — if it passes, Badinho's Next.js port just works.

## Security notes (Code Masters remediation context)

The template passed 2 independent audits. Areas where your backend reinforces the security posture:

- **Allowlist `stat.key`** at write time: must match `/^[a-zA-Z0-9_-]+$/`. Template defense-in-depths this, but enforce server-side.
- **Sanitize handles** at signup: must match `/^[a-zA-Z0-9_]+$/`. Template uses `textContent` so XSS is blocked client-side, but UX breaks with weird chars.
- **Rate-limit token lookups**: `?public=[token]` is a share token; someone could try token brute-forcing. Standard auth rate limits apply.
- **CDN-only avatars**: Only accept `prod.media.vai.app` URLs for `user.avatar`. Prevents arbitrary image hosting from being injected via profile edit.

## Spec

Full data contract with every field documented: `../BADINHO-PROFILE-SPEC.md` §2.

Ping Ben with anything that feels off. The goal is to save you reverse-engineering time — if any probe surfaces something unexpected, let's realign before you build.
