# VAI Demos

Public repository for VAI prototype demos, design references, and spec handoffs.

---

## 🏗 Current active work — VAI Wallet Phase 4: Send Money

**Spec:** [`vai-wallet-spec.md`](./vai-wallet-spec.md)
**Screen mockups:** [`vai-wallet-screens.html`](./vai-wallet-screens.html) → live at [ben-whitesides.github.io/vai-demos/vai-wallet-screens.html](https://ben-whitesides.github.io/vai-demos/vai-wallet-screens.html)

Architecture spec for the VAI Wallet Phase 4 Send Money feature. Covers Stripe Treasury, commission lifecycle, cashout flow, user-to-user send money, subscription-from-wallet bridge, $14.95 fee logic, full mobile UX, API contracts, webhook handlers, and 5-phase migration plan.

**For:** Francis Terrero (C#/.NET backend) · Badinho (React Native / Expo mobile)

Start with the spec. Read it straight through — Appendix E lists the handful of open product decisions to raise with Ben during the build.

---

## Note on git history

This repository hosts VAI demo and reference content. Git commit history may include earlier iterations, sandbox exploration, and retired prototypes from multiple parallel tracks that are no longer relevant.

**The current HEAD is the authoritative state.** Older commits are historical exploration artifacts and should be ignored unless Ben specifically points you at one. Do not chase references to prior versions, supersede banners, or earlier sandbox paths that may appear in past commits — they are not part of the current handoff.

For the Wallet Phase 4 build, read only the files linked above.

---

## Other content in this repo (unrelated to wallet)

| Path | What it is |
|------|------------|
| `avanti-connect/` | AVANTI Connect recruiting flow prototypes |
| `avanti-connect-icons/` | Icon set for AVANTI Connect |
| `chatem-concept.html` | ChatEm concept page |
| `claude-usage-v2/` | Claude usage dashboard prototype |
| `onboarding/` | Onboarding flow mockups |
| `vai-gold-standard-flow.html` | Gold Standard onboarding flow (mermaid diagram) |
| `vai-homepage-hybrid-demo.html` | Homepage hybrid concept demo |
| `vai-onboarding-audit.html` | Onboarding audit mockup |

These are separate tracks and not part of the current wallet handoff.

---

## Questions

Reach out to Ben via Slack (`#vai-team` or DM).
