# VAI Public Profile — Implementation Spec

**Handoff:** Tommy (Gold Standard recon + template) → Badinho (Next.js wire-up)
**Template:** [vai-profile-public-redesign.html](./vai-profile-public-redesign.html)
**Target route:** `app.vai.app/profile/[id]?public=[token]`
**Date:** 2026-04-14

---

## TL;DR

The HTML template is **self-hydrating**. Inject one global object (`window.VAI_PROFILE`) server-side and the template wires the following automatically:

**✅ Hydrated by template (zero Badinho work):**
- Profile header (name, handle, avatar, CTA hrefs)
- Attribution pill (shows only with `?ref=` or `?share=` URL param)
- Meta chips (Class / Sport / Position / Location / HT+WT / 40-yd — each hides when its field is null)
- Coached-by chip (hides when `coach` absent)
- Role badges (loops `user.roles` dynamically; drops hardcoded Trainer/Coach/Parent)
- Follow/Following counts (formatted 1.2K / 3.4M style)
- Hero video + poster (wired from `P.topHighlight`; falls back to poster image if no video; gracefully hides if neither)
- Top Performance stat cards (Verified ✓ badges only show when `stat.verified === true`)
- Highlights grid (populates from `P.highlights`; hides empty slots; up to 6 shown)
- Highlight modal supports both video (`.mp4/.webm/.mov`) and image; auto-plays muted video with native controls
- Bio tab (athlete card name + class year + bio text, all XSS-safe via `textContent`)
- Ability tab (loops `P.abilities` with dynamic star count 1–5)
- Stats tab (loops `P.sportStats` per-sport with name + value + total flag)
- AVANTI CTA (auto-injects UTM params including `utm_content=[user.id]`)
- Share URL (auto-appends `?share=HANDLE` when `viewer.affiliateHandle` set, for 5-tier commission)
- Accessibility: `prefers-reduced-motion` pauses hero video; stat cards are real `<button>` elements (keyboard+SR accessible)
- Connection-aware: 2G/3G/save-data skips video autoplay
- Print stylesheet: clean printable layout when recruiter hits Cmd+P

**🔨 Your remaining work:**
1. Port to Next.js — decide: MUI wrap or standalone route (recommend standalone — reasoning in §5)
2. Server-render the `window.VAI_PROFILE` JSON payload from your user fetcher
3. Build the `/api/og/[id]` OG image generator (stub code in §3)
4. Kill the legacy `/profile/[id] → /profile/[id]/highlights` redirect (or serve at `/highlights`; recommend killing)
5. Confirm `/chat/[id]` app route exists (universal link will fire either way)
6. Answer open questions in §9 (coach linkage field, verified source, role taxonomy)

**🔐 Security notes (Code Masters audit remediations):**
- All user-injected strings use `textContent` / DOM node creation — no `innerHTML` concat
- All `target="_blank"` links carry `rel="noopener noreferrer"`
- `isSafeURL()` gates image/video/href assignment to `https:` / `http:` / `vaiapp:` schemes only — blocks `javascript:` / `data:` URIs
- User IDs + tokens in dynamic URLs are `encodeURIComponent`-wrapped
- Attribution pill handle is echoed via `textContent` (never `innerHTML`)
- Stat cards are semantic `<button>` elements with `aria-label` (not `<div onclick>`)

---

## 1. Data Injection Contract

The template reads a single global. Server-render it inline in a `<script>` tag above the existing script block:

```html
<script>
  window.VAI_PROFILE = {
    user: {
      id: "a812b6d8-b406-439b-9d6b-fc1d8a3313cd",
      handle: "bwhite",
      name: "Ben Whitesides",
      avatar: "https://prod.media.vai.app/avatars/a812b6d8.jpg",
      classYear: 2026,                    // null if not set → Class chip hides
      sports: ["Football"],                // empty [] → Sport chip hides
      position: "QB",                      // null → Position chip hides
      location: "Kaysville, UT",           // null → Location chip hides
      height: "6'2\"",                    // null → HT/WT chip hides
      weight: "190 LBS",
      measurables: { "40-yd": "4.6" },    // {} → 40-yd chip hides
      bio: "High-performance coach...",
      followers: 46,
      following: 138,
      roles: ["Trainer", "Coach", "Parent"]   // dynamic role taxonomy
    },
    coach: {                               // null → Coached-by chip hides
      id: "c4f9a...",
      handle: "coachjones"
    },
    stats: [                               // top performance stats (ordered)
      { key: "squat",   name: "Back Squat", value: "320", unit: "lbs",  verified: true,  date: "2023-12-08" },
      { key: "pushups", name: "Push Ups",   value: "72",  unit: "reps", verified: true,  date: "2023-12-08" },
      { key: "situps",  name: "Sit Ups",    value: "45",  unit: "reps", verified: false, date: "2023-12-08" }
      // verified:false → "Verified" badge hides on that card
    ],
    highlights: [                          // array of highlight objects
      { id: "h1", url: "https://prod.media.vai.app/highlights/...", poster: "..." },
      // up to N — template renders first 6, rest paginated (TODO: pagination logic if >6)
    ],
    topHighlight: {                        // pinned highlight for hero video
      url: "https://prod.media.vai.app/highlights/top.mp4",
      poster: "https://prod.media.vai.app/highlights/top.jpg"
    },
    abilities: {                           // ability-per-sport levels
      cycling:  { level: "Athlete", stars: 4 },
      running:  { level: "Athlete", stars: 4 },
      strength: { level: "Athlete", stars: 5 }
    },
    sportStats: [                          // per-sport Stats tab content
      { sport: "Tennis",   metrics: [{ name: "Tournament Won", value: "15", total: true }] },
      { sport: "Golf",     metrics: [{ name: "Handicap", value: "8.5", total: true }, { name: "Driving Distance", value: "310", total: true }] },
      { sport: "Football", metrics: [{ name: "Completion %", value: "66.5", total: true }] }
    ],
    token: "8951bdc6-271d-4571-9f2e-85552a490b9e",  // passed through to Open-in-VAI-App CTA
    viewer: {                              // logged-in viewer context (optional)
      affiliateHandle: "scoutA"             // appended to share URL as ?share=scoutA for 5-tier commission attribution
    }
  };
</script>
```

The template handles:

| Behavior | Auto-applied when |
|---|---|
| Attribution pill shows | URL has `?ref=handle` or `?share=handle` |
| Coached-by chip shows | `VAI_PROFILE.coach.id` truthy |
| Verified ✓ badge on stat card | `stat.verified === true` |
| Meta chip (Class/Sport/Position/Location/HT/WT/40-yd) shows | Corresponding field populated |
| Share URL includes viewer's affiliate handle | `viewer.affiliateHandle` set |
| AVANTI CTA has UTM params | Always (auto-injects `utm_content=[user.id]`) |
| Video hero pauses | User has `prefers-reduced-motion: reduce` |
| Video hero skips autoplay | `navigator.connection.effectiveType` is 2G/3G or save-data on |
| `<title>` + OG tags personalized | `VAI_PROFILE.user.name` present |

---

## 2. Route Decision

**Recommended:** Kill the legacy redirect. Serve this template at `/profile/[id]?public=[token]` directly.

Reasoning:
- Current prod redirects `/profile/[id]` → `/profile/[id]/highlights` (per memory #7312)
- Template already defaults to Highlights tab as the active tab
- Single canonical URL = cleaner sharing + better SEO
- Eliminates an unnecessary server hop

**If keeping the redirect:** Serve at `/profile/[id]/highlights` and make the other 3 tabs (Ability / Stats / Bio) accessible in-page (they already are — tab switching is client-side).

---

## 3. OG Image Generator (`/api/og/[id]/route.ts`)

Drop-in Next.js route using `@vercel/og`:

```typescript
// app/api/og/[id]/route.ts
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { fetchPublicProfile } from '@/lib/profile'; // your existing fetcher

export const runtime = 'edge';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const url = new URL(req.url);
  const token = url.searchParams.get('public');
  const profile = await fetchPublicProfile(params.id, token);
  if (!profile) return new Response('Not found', { status: 404 });

  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        background: 'linear-gradient(135deg, #0C0A09 0%, #1a1a2e 100%)',
        color: '#FAFAF9', padding: 60, fontFamily: 'system-ui'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 40 }}>
          <img src={profile.avatar} width={140} height={140} style={{ borderRadius: 24, objectFit: 'cover' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 54, fontWeight: 900 }}>{profile.name}</div>
            <div style={{ fontSize: 22, color: '#F7941E', marginTop: 8 }}>
              @{profile.handle} · Class of '{String(profile.classYear).slice(-2)} · {profile.sports[0]}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 24, marginTop: 'auto' }}>
          {profile.stats.slice(0, 3).map(s => (
            <div key={s.key} style={{
              flex: 1, background: '#151210', border: '2px solid #F7941E',
              borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center'
            }}>
              <div style={{ fontSize: 64, fontWeight: 900, color: '#F7941E' }}>{s.value}</div>
              <div style={{ fontSize: 16, color: '#A8A29E', textTransform: 'uppercase', letterSpacing: 2 }}>{s.unit}</div>
              <div style={{ fontSize: 18, color: '#FAFAF9', marginTop: 8 }}>{s.name}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 40, fontSize: 18, color: '#A8A29E' }}>vai.app · Share your athletic profile</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

Replace the template's `[PLACEHOLDER: OG_IMAGE_URL_1200x630]` with `https://app.vai.app/api/og/[id]?public=[token]`.

---

## 4. Universal Link Infrastructure — ✅ VERIFIED

I curl-checked your existing infra:

| Config | URL | Status | Coverage |
|---|---|---|---|
| Apple AASA | `https://app.vai.app/.well-known/apple-app-site-association` | 200 | `/*` — all paths |
| Android assetlinks | `https://app.vai.app/.well-known/assetlinks.json` | 200 | `handle_all_urls` — all paths |

**All `app.vai.app/*` links in the template will open the VAI app automatically on iOS/Android.** No Branch.io needed — your existing universal link config handles it for both prod (`com.vai.app` / `com.nla.vaiapp`) and stage (`com.nla.vaiapp.stage`).

This includes:
- `/profile/[id]?public=[token]` (Open in VAI App CTA)
- `/chat/[USER_ID]` (Chat CTA) — ⚠️ you still need to add this route in the app if it doesn't exist; the universal link fires regardless

---

## 5. MUI Integration Decision

Template is vanilla CSS. Two options:

**Option A: Port to MUI components** — Rewrite the template as React components using your existing MUI theme. Consistent with rest of app.vai.app. ~1 day of work.

**Option B: Ship as standalone Next.js route with the template CSS scoped** — Faster. Put template's `<style>` block in a CSS module or `<style jsx global>`. Ship as-is. ~2 hours.

**Recommendation:** Option B. This profile is a public-facing sales/sharing surface — doesn't need to share components with the authenticated dashboard. Faster, less risk, still matches VAI brand.

---

## 6. Pagination / Empty States

The template assumes 6 highlights. Real data may have 0 / 1 / 3 / 12.

**Add in your render:**
- `highlights.length === 0` → Show empty state: *"No highlights yet. [USER] is just getting started."*
- `highlights.length < 6` → Render what exists, no placeholder fill
- `highlights.length > 6` → Render first 6 + *"See all N highlights →"* link routes to `/profile/[id]/highlights?public=[token]` (the existing /highlights sub-route if you keep it, or a modal gallery)

Same pattern for sport stats (`sportStats.length > 3` → collapse into accordion or "Show all sports").

---

## 7. Affiliate Attribution — Wire Check

Template's share function calls `getShareURL()` which reads `VAI_PROFILE.viewer.affiliateHandle` and appends `?share=HANDLE` to the outgoing URL.

**Your job server-side:** When rendering the page for a logged-in VAI viewer, resolve their handle and populate `viewer.affiliateHandle`. If the viewer isn't logged in / not a VAI user, leave it null — share URL stays clean.

**Attribution flow:**
1. Recruiter views `app.vai.app/profile/bwhite` (no `?share=` param)
2. Recruiter is logged-in coach on VAI with handle `coachA`
3. Recruiter clicks Share → URL becomes `app.vai.app/profile/bwhite?share=coachA`
4. Recipient clicks link, signs up → `coachA` credited on VAI's 5-tier commission (25/10/5/3/2%)

Matches the 5-tier commission structure in CLAUDE.md.

---

## 8. Checklist Before Shipping

- [ ] `window.VAI_PROFILE` server-injected from real user record
- [ ] `/api/og/[id]` endpoint live and tested (Slack paste preview confirms)
- [ ] Legacy `/profile/[id] → /highlights` redirect killed (or template served at `/highlights`)
- [ ] Tested: attribution pill shows only with `?ref=` or `?share=` param
- [ ] Tested: missing fields hide their chips cleanly (nullable class year, no position, no coach)
- [ ] Tested: Verified badge respects `stat.verified` boolean
- [ ] Tested: Share button → native sheet on iOS/Android, copy-toast on desktop
- [ ] Tested: Open in VAI App button opens app on iOS + Android (universal link intercept confirms)
- [ ] Tested: video hero stops on `prefers-reduced-motion` + 2G/3G connections
- [ ] Tested: AVANTI CTA URL includes UTM params including user.id
- [ ] OG preview renders correctly when URL pasted in Slack / iMessage / Twitter
- [ ] iOS Smart App Banner shows at top of Safari

---

## 9. Open Questions (ping back to Tommy if blocked)

1. Does `/chat/[USER_ID]` route exist in the app codebase? If not, add it as part of this PR.
2. Coach linkage: how is a coach "linked" to an athlete in the user record? Which field surfaces `coach.id` and `coach.handle`?
3. What's the authoritative source for `stat.verified`? Measured-in-app event log? Flag on stat record?
4. Role taxonomy normalization — memory shows bwhite's role in-app is "Jumpers." Is that a legacy artifact or a different taxonomy than Athlete/Coach/Trainer/Parent/Builder?

---

## 10. Reference

- **Locked Gold Standard Brief (competitive recon):** Covered Hudl, MaxPreps, SportsRecruits, NCSA, On3, 247Sports. Dark-mode is category-differentiating. Video-first hero, measurables chip strip, composite-style ability ratings, coach authority signal (VAI's moat), copy-link-toast share fallback.
- **Onboarding recon intel applied:** Attribution pill (+12-20% from referrer personalization), social-first auth (flagged for Chat landing), affiliate URL preservation (prevents 20-30% attribution loss).
- **Universal links:** Leverages existing VAI AASA + assetlinks config (no Branch.io needed).
