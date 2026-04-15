/**
 * VAI Public Profile — Type Contract
 *
 * This is the exact shape of `window.VAI_PROFILE` that the self-hydrating template reads.
 * Wire your profile fetcher to return this shape; the template will self-configure.
 *
 * See: BADINHO-PROFILE-SPEC.md §2 Data Injection Contract
 */

export type Role = 'Athlete' | 'Coach' | 'Trainer' | 'Parent' | 'Builder' | string;

export interface VaiUser {
  /** UUID */
  id: string;
  /** Handle without @ prefix (e.g. "bwhite", not "@bwhite") */
  handle: string;
  /** Full display name */
  name: string;
  /** HTTPS URL — CDN (prod.media.vai.app). Anything else is rejected by isSafeURL() */
  avatar: string;
  /** 4-digit graduation year (e.g. 2026). null → Class chip hides */
  classYear: number | null;
  /** Primary sports list. Template uses sports[0]. Empty array → Sport chip hides */
  sports: string[];
  /** Position (e.g. "QB", "RB", "SS"). null → Position chip hides */
  position: string | null;
  /** "City, ST". null → Location chip hides */
  location: string | null;
  /** Measured height, e.g. "6'2\"". null → HT/WT chip hides */
  height: string | null;
  /** Measured weight with unit, e.g. "190 LBS". null → HT/WT chip hides */
  weight: string | null;
  /** Key-value sport-specific measurables (40-yd dash, bench, vertical, etc.) */
  measurables: Record<string, string>;
  /** Long-form bio text. Rendered as textContent (XSS-safe). */
  bio: string;
  followers: number;
  following: number;
  /** Dynamic role taxonomy. Each role becomes a badge. */
  roles: Role[];
}

export interface VaiCoach {
  id: string;
  handle: string;
}

export interface VaiStat {
  /** Used for modal routing. Must match /^[a-zA-Z0-9_-]+$/ — template allowlists */
  key: string;
  /** Display name (e.g. "Back Squat") */
  name: string;
  /** Numeric or display string */
  value: string | number;
  /** Unit label (lbs, reps, seconds) */
  unit: string;
  /** true → Verified ✓ badge appears. self-reported stats MUST be false. */
  verified: boolean;
  /** ISO 8601 date string */
  date: string;
  /** For ability detail modal: % increase vs starting point */
  increase?: string;
  /** ISO 8601 date of first recorded value */
  startDate?: string;
  /** Starting value (for "Overall Increase" footer in modal) */
  overall?: string | number;
  /** Icon key: "dumbbell" | "bicep" | "flame" — maps to inline SVG in template */
  iconKey?: 'dumbbell' | 'bicep' | 'flame';
  /** HTTPS URL to the highlight video for this ability (mp4/webm/mov) */
  videoUrl?: string;
}

export interface VaiHighlight {
  id: string;
  /** Video URL (mp4/webm/mov) OR image URL */
  url: string;
  /** Poster/thumbnail image (always an image, even for video URLs) */
  poster: string;
  /** Optional alt text / tooltip */
  caption?: string;
}

export interface VaiTopHighlight {
  url: string;
  poster: string;
}

export interface VaiAbility {
  /** Level label, e.g. "Athlete", "Starter", "Elite" */
  level: string;
  /** 1-5. Template renders star count */
  stars: number;
}

export interface VaiSportMetric {
  name: string;
  value: string | number;
  /** Shows "Total" meta label below the name */
  total?: boolean;
}

export interface VaiSportStats {
  sport: string;
  metrics: VaiSportMetric[];
}

export interface VaiViewer {
  /** Handle of the logged-in viewer (for affiliate 5-tier attribution).
   *  When set, shareProfile() appends ?share=HANDLE to outgoing URLs. */
  affiliateHandle?: string;
}

export interface VaiProfile {
  user: VaiUser;
  /** null → Coached-by chip hides entirely */
  coach: VaiCoach | null;
  /** Ordered list (first 3 render in Top Performance Stats) */
  stats: VaiStat[];
  /** Up to 6 rendered in the highlights grid */
  highlights: VaiHighlight[];
  /** Hero video — auto-plays muted on desktop. null → hero stays placeholder */
  topHighlight: VaiTopHighlight | null;
  /** Object keyed by sport name (cycling/running/strength). Rendered on Ability tab */
  abilities: Record<string, VaiAbility>;
  /** Rendered on Stats tab, grouped by sport */
  sportStats: VaiSportStats[];
  /** Public share token from the URL query param */
  token: string;
  /** Optional viewer context for affiliate attribution */
  viewer?: VaiViewer;
}
