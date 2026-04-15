/**
 * VAI Public Profile — OG Image Generator
 *
 * Target: app/api/og/[id]/route.tsx  (in vai-app/vai-game-day)
 *
 * Generates a 1200x630 Open Graph preview image per athlete for link previews
 * in Slack, iMessage, Twitter, LinkedIn, Gmail, etc. Uses @vercel/og which
 * renders JSX to a PNG on the edge — fast, no headless Chrome.
 *
 * Install (one-time):
 *   npm install next@^14 @vercel/og
 *
 * Wire your profile fetcher in TODO #1 — same one used by page.tsx.
 */

import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

// ----- TODO #1: Same fetcher as page.tsx. In production, import from a shared module. -----
async function getVaiProfile(id: string, token: string): Promise<{
  name: string;
  handle: string;
  avatar: string;
  classYear: number | null;
  sport: string;
  position: string | null;
  location: string | null;
  topStats: Array<{ value: string; unit: string; name: string }>;
} | null> {
  // Replace with your shared fetcher. For OG we only need the display fields.
  return null;
}

// Color constants — match the template exactly
const BG = '#0C0A09';
const ORANGE = '#F7941E';
const AVANTI_GREEN = '#34D399';
const TEXT = '#FAFAF9';
const MUTED = '#A8A29E';
const CARD_BG = '#151210';
const BORDER = '#2A2623';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const url = new URL(req.url);
  const token = url.searchParams.get('public');
  if (!token) return new Response('Missing token', { status: 400 });

  const profile = await getVaiProfile(params.id, token);

  // Fallback card when the profile is unavailable (expired token, deleted, etc.)
  if (!profile) {
    return new ImageResponse(
      (
        <div style={{
          width: '100%', height: '100%',
          background: BG, color: TEXT,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'system-ui',
        }}>
          <div style={{ fontSize: 42, fontWeight: 700, color: ORANGE, letterSpacing: 2 }}>VAI</div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  const classLabel = profile.classYear ? `Class of '${String(profile.classYear).slice(-2)}` : '';
  const meta = [classLabel, profile.sport, profile.position, profile.location].filter(Boolean).join(' · ');

  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%',
        background: `linear-gradient(135deg, ${BG} 0%, #1a1a2e 100%)`,
        color: TEXT,
        display: 'flex', flexDirection: 'column',
        padding: 60,
        fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
      }}>
        {/* Top row: avatar + name block */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, marginBottom: 40 }}>
          <img
            src={profile.avatar}
            width={180}
            height={180}
            style={{ borderRadius: 24, objectFit: 'cover', border: `3px solid ${ORANGE}` }}
            alt={profile.name}
          />
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ fontSize: 64, fontWeight: 900, lineHeight: 1.05, marginBottom: 12 }}>
              {profile.name}
            </div>
            <div style={{ fontSize: 22, color: ORANGE, fontWeight: 600 }}>
              @{profile.handle}
            </div>
            {meta && (
              <div style={{ fontSize: 20, color: MUTED, marginTop: 8 }}>
                {meta}
              </div>
            )}
          </div>
        </div>

        {/* Bottom row: up to 3 top performance stat cards */}
        <div style={{ display: 'flex', gap: 24, marginTop: 'auto' }}>
          {profile.topStats.slice(0, 3).map((s, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                background: CARD_BG,
                border: `2px solid ${ORANGE}`,
                borderRadius: 20,
                padding: 28,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
              }}
            >
              <div style={{ fontSize: 72, fontWeight: 900, color: ORANGE, letterSpacing: -2, lineHeight: 1 }}>
                {s.value}
              </div>
              <div style={{ fontSize: 16, color: MUTED, textTransform: 'uppercase', letterSpacing: 2, marginTop: 8 }}>
                {s.unit}
              </div>
              <div style={{ fontSize: 20, color: TEXT, marginTop: 10, fontWeight: 600 }}>
                {s.name}
              </div>
            </div>
          ))}
        </div>

        {/* Footer brand */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 36,
          paddingTop: 24,
          borderTop: `1px solid ${BORDER}`,
        }}>
          <div style={{ fontSize: 18, color: ORANGE, fontWeight: 700, letterSpacing: 2 }}>
            VAI
          </div>
          <div style={{ fontSize: 16, color: MUTED }}>
            Share your athletic profile with coaches, scouts, and recruiters
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      // Cache for 5 min at CDN, stale-while-revalidate 1 hour
      headers: {
        'cache-control': 'public, max-age=300, stale-while-revalidate=3600',
      },
    }
  );
}
