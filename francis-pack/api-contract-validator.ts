/**
 * VAI Profile API Contract Validator
 *
 * Run this against your profile endpoint to verify the response shape matches
 * what the template expects. It uses Zod to enforce the schema and prints a
 * human-readable diff of any mismatches.
 *
 * Install:
 *   npm install zod tsx
 *
 * Run:
 *   tsx api-contract-validator.ts <profile_id> <public_token> [endpoint_base_url]
 *
 * Example:
 *   tsx api-contract-validator.ts \
 *     a812b6d8-b406-439b-9d6b-fc1d8a3313cd \
 *     8951bdc6-271d-4571-9f2e-85552a490b9e \
 *     https://api.vai.app/v1
 *
 * Exit codes:
 *   0 = all checks passed
 *   1 = schema violations (reported to stdout)
 *   2 = network/auth failure
 */

import { z } from 'zod';

const VaiUserSchema = z.object({
  id: z.string().uuid(),
  handle: z.string().regex(/^[a-zA-Z0-9_]+$/, 'handle must be alphanumeric/underscore only'),
  name: z.string().min(1),
  avatar: z.string().url().startsWith('https://'),
  classYear: z.number().int().min(2020).max(2040).nullable(),
  sports: z.array(z.string()),
  position: z.string().nullable(),
  location: z.string().nullable(),
  height: z.string().nullable(),
  weight: z.string().nullable(),
  measurables: z.record(z.string()),
  bio: z.string(),
  followers: z.number().int().nonnegative(),
  following: z.number().int().nonnegative(),
  roles: z.array(z.string()),
});

const VaiCoachSchema = z.object({
  id: z.string().uuid(),
  handle: z.string(),
}).nullable();

const VaiStatSchema = z.object({
  key: z.string().regex(/^[a-zA-Z0-9_-]+$/, 'stat.key must match /^[a-zA-Z0-9_-]+$/ (template allowlist)'),
  name: z.string(),
  value: z.union([z.string(), z.number()]),
  unit: z.string(),
  verified: z.boolean(),
  date: z.string(),
  increase: z.string().optional(),
  startDate: z.string().optional(),
  overall: z.union([z.string(), z.number()]).optional(),
  iconKey: z.enum(['dumbbell', 'bicep', 'flame']).optional(),
  videoUrl: z.string().url().startsWith('https://').optional(),
});

const VaiHighlightSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  poster: z.string().url(),
  caption: z.string().optional(),
});

const VaiAbilitySchema = z.object({
  level: z.string(),
  stars: z.number().int().min(1).max(5),
});

const VaiSportStatsSchema = z.object({
  sport: z.string(),
  metrics: z.array(z.object({
    name: z.string(),
    value: z.union([z.string(), z.number()]),
    total: z.boolean().optional(),
  })),
});

const VaiProfileSchema = z.object({
  user: VaiUserSchema,
  coach: VaiCoachSchema,
  stats: z.array(VaiStatSchema),
  highlights: z.array(VaiHighlightSchema),
  topHighlight: z.object({
    url: z.string().url(),
    poster: z.string().url(),
  }).nullable(),
  abilities: z.record(VaiAbilitySchema),
  sportStats: z.array(VaiSportStatsSchema),
  token: z.string().uuid(),
  viewer: z.object({
    affiliateHandle: z.string().optional(),
  }).optional(),
});

// ─────────────────────────────────────────────────────────────────

async function main() {
  const [, , id, token, baseUrl] = process.argv;
  if (!id || !token) {
    console.error('Usage: tsx api-contract-validator.ts <profile_id> <public_token> [endpoint_base_url]');
    process.exit(2);
  }

  const base = baseUrl ?? process.env.VAI_API_BASE ?? 'https://api.vai.app/v1';
  const url = `${base}/profiles/${id}?public=${encodeURIComponent(token)}`;

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('VAI Profile API Contract Validator');
  console.log('Endpoint:', url);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  let raw: unknown;
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) {
      console.error(`\n❌ HTTP ${res.status} ${res.statusText}`);
      console.error(await res.text());
      process.exit(2);
    }
    raw = await res.json();
  } catch (e) {
    console.error('\n❌ Network error:', e instanceof Error ? e.message : e);
    process.exit(2);
  }

  const parsed = VaiProfileSchema.safeParse(raw);
  if (parsed.success) {
    console.log('\n✅ CONTRACT MATCH — endpoint returns valid VaiProfile shape\n');
    // Spot-check XSS-hostile values
    const warnings: string[] = [];
    const d = parsed.data;
    if (d.user.handle.includes('<') || d.user.name.includes('<')) {
      warnings.push(`User fields contain HTML-like characters — template uses textContent so it's safe, but worth flagging`);
    }
    if (d.stats.some((s) => s.key.includes('<') || s.key.includes("'"))) {
      warnings.push('A stat.key contains suspicious characters — the template regex-allowlists /^[a-zA-Z0-9_-]+$/, but your backend should reject these at write time');
    }
    if (d.user.avatar.startsWith('http://')) {
      warnings.push('user.avatar uses http:// — template blocks this as mixed content. Must be https://');
    }
    if (warnings.length) {
      console.log('⚠️  Warnings:');
      warnings.forEach((w) => console.log('  •', w));
    }
    process.exit(0);
  }

  console.log('\n❌ CONTRACT VIOLATIONS:\n');
  parsed.error.errors.forEach((err, i) => {
    const path = err.path.join('.');
    console.log(`  ${i + 1}. ${path || '(root)'}`);
    console.log(`     ${err.message}`);
    if ('received' in err) console.log(`     received: ${JSON.stringify((err as any).received)}`);
  });
  console.log('\nFix these to match the contract. Reference: https://raw.githubusercontent.com/ben-whitesides/vai-demos/main/BADINHO-PROFILE-SPEC.md');
  process.exit(1);
}

main().catch((e) => {
  console.error('Unexpected error:', e);
  process.exit(2);
});
