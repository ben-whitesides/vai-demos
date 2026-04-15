# example-response.json

Reference `VaiProfile` payload in the exact shape the template expects.

**Use cases:**
- Drop-in test fixture — load into a mock server to verify your endpoint matches
- Reference when writing your `shapeToVaiProfile()` response mapper
- Passes the Zod schema in `api-contract-validator.ts` cleanly (verified)

**Coverage:** includes every field in the contract — required, nullable, optional — so you can see the full shape. Real responses for athletes without a coach will have `"coach": null`. Real responses without a pinned highlight will have `"topHighlight": null`. Etc.

**Contract source of truth:** `../badinho-pack/types.ts` + `../BADINHO-PROFILE-SPEC.md §2`.
