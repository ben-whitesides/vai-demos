/**
 * VAI Public Profile — Next.js Route Handler
 *
 * Target: app/public-profile/[id]/route.ts  (in vai-app/vai-game-day)
 *
 * Route Handler (not page.tsx) because the template is a complete HTML document
 * with its own <html>, <head>, <body>, <script>, and <style> blocks. Returning
 * raw HTML from a Route Handler bypasses the Next.js App Router HTML shell
 * (avoids nested <html> tags from layout.tsx) and gives us full control over
 * the response — including the inline <script> that injects window.VAI_PROFILE.
 *
 * If you later want React hydration or MUI composition, this can be promoted to
 * a page.tsx with the template split into components. For v1, HTML delivery is
 * the right shape.
 *
 * Wire your real fetcher in TODO #1.
 */

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { NextRequest } from 'next/server';
import type { VaiProfile } from './types';

// ----- TODO #1: Wire your real profile fetcher here -----
async function getVaiProfile(id: string, token: string): Promise<VaiProfile | null> {
  // Example:
  //   const row = await db.users.findByIdWithToken(id, token);
  //   if (!row) return null;
  //   return shapeToVaiProfile(row);
  return null;
}

// ----- TEMPLATE LOADER (promise-cached; concurrent-safe on cold start) -----
// Storing the in-flight Promise (not the resolved string) means concurrent
// first-requests share one readFile() call instead of racing.
let templatePromise: Promise<string> | null = null;
function loadTemplate(): Promise<string> {
  if (templatePromise) return templatePromise;
  const path = join(process.cwd(), 'app', 'public-profile', '[id]', 'template.html');
  templatePromise = readFile(path, 'utf8').catch((err) => {
    // Clear on failure so a retry can attempt again (don't cache the rejection)
    templatePromise = null;
    throw err;
  });
  return templatePromise;
}

// ----- XSS-SAFE JSON INJECTION -----
// Escapes characters that could break out of the <script> tag or HTML context.
// Safe even with hostile strings anywhere in profile data.
// Throws if the object graph has circular references or unserializable values
// (BigInt, functions, symbols) — caller must wrap in try/catch.
function safeJSONStringify(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

// ----- HTML RESPONSE HELPER -----
// No caching on share-token responses: the token can be revoked at any time
// and we must not serve stale HTML after revocation. Browsers may still keep
// their own bfcache for same-tab back/forward — that's out of our control,
// but CDN / intermediary caching is blocked.
function htmlResponse(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store, no-cache, must-revalidate, private',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'strict-origin-when-cross-origin',
    },
  });
}

// ----- 404 FALLBACK -----
const NOT_FOUND_HTML = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>Profile Not Found — VAI</title>
<style>body{background:#0C0A09;color:#FAFAF9;font-family:-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center}
.box{max-width:420px;padding:40px}h1{color:#F7941E;font-size:32px;margin:0 0 16px}p{color:#A8A29E;line-height:1.6}
a{color:#34D399;text-decoration:none}</style></head>
<body><div class="box"><h1>Profile Not Found</h1>
<p>This share link has expired, been revoked, or doesn't exist. Ask the athlete for a new link.</p>
<p><a href="https://vai.app">vai.app</a></p></div></body></html>`;

// ─────────────────────────────────────────────────────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<Response> {
  const { id } = params;
  const url = new URL(req.url);
  const token = url.searchParams.get('public');

  // Missing token → 404 (same treatment as invalid token — don't leak enumeration)
  if (!token) return htmlResponse(NOT_FOUND_HTML, 404);

  // Simple UUID-ish validation on id + token to reject obvious junk before hitting DB
  const UUID_RE = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
  if (!UUID_RE.test(id) || !UUID_RE.test(token)) {
    return htmlResponse(NOT_FOUND_HTML, 404);
  }

  let profile: VaiProfile | null;
  let profileJSON: string;
  let template: string;
  try {
    profile = await getVaiProfile(id, token);
    if (!profile) return htmlResponse(NOT_FOUND_HTML, 404);
    template = await loadTemplate();
    profileJSON = safeJSONStringify(profile);
  } catch (err) {
    // Circular reference in profile, BigInt in stats, template file missing, etc.
    console.error('[public-profile] serialization error for id=%s:', id, err);
    return htmlResponse(NOT_FOUND_HTML, 500);
  }

  // Inject right before the template's closing </head> so it's available before DOMContentLoaded.
  // Using a <script> with a fixed id makes it idempotent if someone rehydrates client-side later.
  const injectionScript =
    `<script id="vai-profile-data">window.VAI_PROFILE = ${profileJSON};</script>\n</head>`;

  // Swap ONLY the first closing </head> for injection + </head>. If </head> missing, 500.
  const headCloseIndex = template.indexOf('</head>');
  if (headCloseIndex === -1) {
    console.error('[public-profile] template malformed: </head> not found');
    return htmlResponse(NOT_FOUND_HTML, 500);
  }
  const html = template.slice(0, headCloseIndex) + injectionScript + template.slice(headCloseIndex + '</head>'.length);

  // Dynamically rewrite the <title> + OG URL with this athlete's identity.
  // (The template ships with generic defaults; we personalize per-request.)
  const name = profile.user.name || 'VAI Athlete';
  const classLabel = profile.user.classYear ? `Class of '${String(profile.user.classYear).slice(-2)}` : '';
  const sport = profile.user.sports[0] || '';
  const desc = [classLabel, sport].filter(Boolean).join(' · ') || 'Athletic profile on VAI';
  const canonicalURL = `https://app.vai.app/profile/${id}?public=${encodeURIComponent(token)}`;
  const ogImage = `https://app.vai.app/api/og/${id}?public=${encodeURIComponent(token)}`;

  // Helper: escape for HTML attribute values
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const personalizedHTML = html
    .replace(/<title>[^<]*<\/title>/i, `<title>${esc(`${name} — VAI Athlete Profile`)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/i, `$1${esc(desc)}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/i, `$1${esc(`${name} — VAI Athlete Profile`)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/i, `$1${esc(desc)}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/i, `$1${esc(canonicalURL)}$2`)
    .replace(/(<meta property="og:image" content=")[^"]*(")/gi, `$1${esc(ogImage)}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/i, `$1${esc(`${name} — VAI Athlete Profile`)}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/i, `$1${esc(desc)}$2`)
    .replace(/(<meta name="twitter:image" content=")[^"]*(")/i, `$1${esc(ogImage)}$2`);

  return htmlResponse(personalizedHTML);
}
