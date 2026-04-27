/* global React, MobileHeader, BottomNav, IconChevR, IconChevL, IconArrowL, IconPlus, IconActivity, VAIWingmark, TierBadge, IconSearch, IconBell, IconHamburger */

const { useState: useStateP } = React;

// =================================================================
//  Shared profile scaffold — `accent` color drives every blue spot
// =================================================================
const PScreen = ({ accent, accentSoft, children, nav = 'me' }) =>
<div style={{
  width: '100%', height: '100%', background: '#060608', color: '#F5F0EB',
  fontFamily: 'DM Sans', display: 'flex', flexDirection: 'column',
  '--accent': accent, minHeight: 0
}}>
    <div style={{ flexShrink: 0 }}>
      <MobileHeader tier="vai+" />
    </div>
    <div style={{ flex: '1 1 0', minHeight: 0, overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch' }} className="no-scrollbar">
      {children}
    </div>
    <div style={{ flexShrink: 0 }}>
      <BottomNav active={nav} />
    </div>
  </div>;


const Tab = ({ label, active, accent }) =>
<button style={{
  background: 'transparent', border: 'none', flex: 1,
  padding: '11px 4px', cursor: 'pointer',
  color: active ? accent : '#8888A0',
  fontFamily: 'DM Sans', fontWeight: active ? 600 : 500, fontSize: 14,
  borderBottom: active ? `2px solid ${accent}` : '2px solid transparent'
}}>{label}</button>;


const TabRow = ({ tabs, value, accent }) =>
<div style={{ display: 'flex', borderBottom: '1px solid #1e1e26', padding: '0 4px' }}>
    {tabs.map((t) => <Tab key={t} label={t} active={t === value} accent={accent} />)}
  </div>;


const SubChip = ({ label, active, accent }) =>
<button style={{
  background: active ? `${accent}20` : 'transparent',
  color: active ? accent : '#8888A0',
  border: active ? `1px solid ${accent}40` : '1px solid #1e1e26',
  padding: '6px 14px', borderRadius: 999, cursor: 'pointer',
  fontFamily: 'DM Sans', fontWeight: active ? 600 : 500, fontSize: 12.5
}}>{label}</button>;


const SectionHead = ({ children, accent = '#8888A0' }) =>
<div style={{
  fontFamily: 'JetBrains Mono', fontSize: 10, fontWeight: 600, color: accent,
  letterSpacing: '0.12em', textTransform: 'uppercase'
}}>{children}</div>;


const Spark = ({ accent, dir = 'up' }) =>
<svg width="48" height="14" viewBox="0 0 48 14" style={{ flexShrink: 0 }}>
    <path d={dir === 'up' ? 'M2 11 L12 9 L22 8 L32 5 L46 3' : 'M2 3 L12 5 L22 8 L32 9 L46 11'}
  stroke={accent} strokeWidth="1.5" fill="none" strokeLinecap="round" />
    {[2, 12, 22, 32, 46].map((x, i) => {
    const ys = dir === 'up' ? [11, 9, 8, 5, 3] : [3, 5, 8, 9, 11];
    return <circle key={i} cx={x} cy={ys[i]} r="1.4" fill={accent} />;
  })}
  </svg>;


const AvantiBanner = ({ children, ctaLabel, accent = '#34D399' }) =>
<div style={{
  margin: '12px 14px 0',
  padding: '11px 13px',
  background: 'linear-gradient(180deg, rgba(52,211,153,0.04), transparent)',
  border: '1px solid #0D4A28', borderRadius: 10
}}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
      <span className="avanti-dot" style={{ width: 6, height: 6 }}></span>
      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9.5, fontWeight: 700, color: '#34D399', letterSpacing: '0.1em' }}>AVANTI</span>
    </div>
    <div style={{ fontSize: 13, color: '#F5F0EB', lineHeight: 1.45 }}>{children}</div>
    {ctaLabel &&
  <button style={{
    marginTop: 9, background: '#F7941E', color: '#000', border: 'none',
    padding: '7px 12px', borderRadius: 6, cursor: 'pointer',
    fontFamily: 'DM Sans', fontWeight: 700, fontSize: 12.5
  }}>{ctaLabel}</button>
  }
  </div>;


// =================================================================
//  P1 — BIO tab
// =================================================================
const P1Bio = ({ accent }) => {
  const sportPills = ['Football', 'Basketball', 'Lacrosse'];
  return (
    <PScreen accent={accent}>
      <AvantiBanner ctaLabel="Complete Profile →">
        Profile <strong style={{ fontWeight: 600 }}>68% complete</strong> — add Wingspan + School to boost recruiter visibility.
      </AvantiBanner>

      <div style={{ marginTop: 14 }}>
        <TabRow tabs={['Highlights', 'Ability', 'Stats', 'Bio']} value="Bio" accent={accent} />
      </div>

      {/* Hero name block */}
      <div style={{
        margin: '0 0 0 0', padding: '24px 18px 20px',
        background: `linear-gradient(180deg, ${accent}14 0%, transparent 100%)`
      }}>
        <div style={{
          fontFamily: 'Oswald', fontWeight: 700, fontSize: 36, color: '#F5F0EB',
          lineHeight: 1, letterSpacing: '0.005em'
        }}>BEN</div>
        <div style={{
          fontFamily: 'Oswald', fontWeight: 700, fontSize: 36, color: '#F5F0EB',
          lineHeight: 1, letterSpacing: '0.005em', marginTop: 2
        }}>WHITESIDES</div>
        <div style={{
          marginTop: 10, fontFamily: 'JetBrains Mono', fontSize: 11, fontWeight: 600,
          color: accent, letterSpacing: '0.1em'
        }}>CLASS OF '26</div>

        {/* Sport pills */}
        <div style={{ marginTop: 14, display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          {sportPills.map((p) =>
          <span key={p} style={{
            background: `${accent}15`, color: accent,
            border: `1px solid ${accent}40`, padding: '5px 13px', borderRadius: 999,
            fontFamily: 'DM Sans', fontWeight: 600, fontSize: 12
          }}>{p}</span>
          )}
        </div>
      </div>

      {/* Profile Visibility */}
      <div style={{ padding: '14px 18px 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7 }}>
          <span style={{ fontSize: 12.5, color: '#C8C8D0' }}>Profile Visibility Score</span>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 12, fontWeight: 700, color: accent }}>68%</span>
        </div>
        <div style={{ height: 4, background: '#15151c', borderRadius: 99 }}>
          <div style={{ width: '68%', height: '100%', background: accent, borderRadius: 99 }}></div>
        </div>
      </div>

      {/* SPORTS & POSITION */}
      <div style={{ padding: '20px 18px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <SectionHead>SPORTS & POSITION</SectionHead>
        <button style={{ background: 'transparent', border: 'none', color: accent, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
          + Add Sport
        </button>
      </div>

      <div style={{ padding: '12px 14px 0', display: 'grid', gap: 10 }}>
        {[
        { sport: 'FOOTBALL', pos: 'QB', name: 'Quarterback', num: '#12', org: 'VAI FC North', stars: 4, totalStars: 5 },
        { sport: 'BASKETBALL', pos: 'PG', name: 'Point Guard', num: '#1', org: 'Builder Club', stars: 3, totalStars: 5 }].
        map((s, i) =>
        <div key={i} style={{
          background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 12,
          padding: '14px 14px'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 }}>
              <span style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 14, color: '#F5F0EB', letterSpacing: '0.04em' }}>{s.sport}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8888A0" strokeWidth="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                </span>
                <span style={{ fontSize: 14 }}>🏆</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 11, marginBottom: 6 }}>
              <span style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 22, color: accent }}>{s.pos}</span>
              <span style={{ fontFamily: 'DM Sans', fontWeight: 500, fontSize: 13.5, color: '#F5F0EB' }}>{s.name}</span>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: '#8888A0' }}>{s.num}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#8888A0' }}>
              <span>{s.org}</span>
              <span>·</span>
              <span>Stars:&nbsp;
                <span style={{ color: '#FBBF24' }}>{'★'.repeat(s.stars)}</span>
                <span style={{ color: '#3a3a48' }}>{'★'.repeat(s.totalStars - s.stars)}</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* BIOMETRICS — full row stack with visibility toggles */}
      <div style={{ padding: '22px 18px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <SectionHead>BIOMETRICS</SectionHead>
        <span style={{ fontSize: 14 }}>🏆</span>
      </div>
      <div style={{ padding: '0 14px 4px' }}>
        <div style={{
          background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 12,
          padding: '4px 14px'
        }}>
          {[
          { label: 'HEIGHT', value: '6\'2"', visible: true },
          { label: 'WEIGHT', value: '195 lb', visible: true },
          { label: 'WINGSPAN', value: '— add', visible: false, missing: true },
          { label: 'SHOE SIZE', value: '12 US', visible: true },
          { label: 'HAND SIZE', value: '9.5"', visible: false }].
          map((b, i, arr) =>
          <BioRow key={b.label} {...b} accent={accent} last={i === arr.length - 1} />
          )}
        </div>
      </div>

      {/* EDUCATION */}
      <div style={{ padding: '22px 18px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <SectionHead>EDUCATION</SectionHead>
        <button style={{ background: 'transparent', border: 'none', color: accent, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ Edit</button>
      </div>
      <div style={{ padding: '0 14px 4px' }}>
        <div style={{
          background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 12,
          padding: '4px 14px'
        }}>
          {[
          { label: 'SCHOOL', value: '— add', visible: false, missing: true },
          { label: 'GRADUATION', value: 'Spring 2026', visible: true },
          { label: 'GPA', value: '3.82 / 4.0', visible: true },
          { label: 'SAT', value: '1340', visible: false },
          { label: 'ACT', value: '— add', visible: false, missing: true }].
          map((e, i, arr) =>
          <BioRow key={e.label} {...e} accent={accent} last={i === arr.length - 1} />
          )}
        </div>
      </div>

      {/* CONTACT / RECRUITING */}
      <div style={{ padding: '22px 18px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <SectionHead>RECRUITING CONTACT</SectionHead>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9.5, color: '#34D399', letterSpacing: '0.08em' }}>● VERIFIED</span>
      </div>
      <div style={{ padding: '0 14px 4px' }}>
        <div style={{
          background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 12,
          padding: '4px 14px'
        }}>
          {[
          { label: 'EMAIL', value: 'ben.w@vai.app', visible: true },
          { label: 'PHONE', value: '(415) ••• •••2', visible: false },
          { label: 'LOCATION', value: 'Austin, TX', visible: true },
          { label: 'COACH REF', value: 'Coach Diaz · VAI FC North', visible: true }].
          map((e, i, arr) =>
          <BioRow key={e.label} {...e} accent={accent} last={i === arr.length - 1} />
          )}
        </div>
      </div>

      {/* HIGHLIGHTS / EXTERNAL LINKS */}
      <div style={{ padding: '22px 18px 6px' }}>
        <SectionHead>HIGHLIGHT REELS</SectionHead>
      </div>
      <div style={{ padding: '0 14px 28px', display: 'grid', gap: 8 }}>
        {[
        { name: 'Hudl · Junior Year', meta: '14 clips · Updated Mar 2026' },
        { name: 'YouTube · Spring Invitational', meta: '8 clips · Updated Apr 2026' }].
        map((h) =>
        <div key={h.name} style={{
          background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 10,
          padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12
        }}>
            <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: `${accent}18`, border: `1px solid ${accent}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: accent, fontSize: 14
          }}>▶</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: '#F5F0EB', fontWeight: 500 }}>{h.name}</div>
              <div style={{ fontSize: 11, color: '#8888A0', marginTop: 2 }}>{h.meta}</div>
            </div>
            <span style={{ color: '#8888A0', fontSize: 16 }}>›</span>
          </div>
        )}
      </div>
    </PScreen>);

};

// Eye icon — visibility toggle
const EyeIcon = ({ on, color }) =>
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={on ? color : '#5d5d70'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {on ?
  <>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </> :

  <>
        <path d="M9.88 9.88a3 3 0 0 0 4.24 4.24" />
        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
        <line x1="2" y1="2" x2="22" y2="22" />
      </>
  }
  </svg>;


// Single biometric/education row with visibility toggle + add CTA
const BioRow = ({ label, value, visible, missing, accent, last }) =>
<div style={{
  display: 'grid', gridTemplateColumns: '1fr auto auto', alignItems: 'center', gap: 12,
  padding: '12px 0',
  borderBottom: last ? 'none' : '1px solid #15151c'
}}>
    <div>
      <div className="mono-label" style={{ fontSize: 9.5, color: '#8888A0' }}>{label}</div>
      <div style={{
      fontFamily: 'Oswald', fontWeight: 600, fontSize: 15.5,
      color: missing ? '#5d5d70' : '#F5F0EB', marginTop: 4,
      letterSpacing: '0.01em'
    }}>{value}</div>
    </div>
    {missing ?
  <button style={{
    background: 'transparent', color: accent,
    border: `1px solid ${accent}40`, padding: '5px 11px', borderRadius: 6,
    cursor: 'pointer', fontFamily: 'DM Sans', fontWeight: 600, fontSize: 11.5
  }}>+ Add</button> :
  <span></span>}
    <button title={visible ? 'Visible to recruiters' : 'Hidden'} style={{
    background: 'transparent', border: 'none', cursor: 'pointer',
    width: 30, height: 30, borderRadius: 6,
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  }}>
      <EyeIcon on={visible} color={accent} />
    </button>
  </div>;


// =================================================================
//  P2 — ABILITY tab
// =================================================================
const P2Ability = ({ accent }) => {
  const sections = [
  { label: 'SPEED', metrics: [
    { name: '40YD DASH', date: 'Updated Sep 13, 2024', value: '5.08', unit: 'sec', dir: 'up', medals: ['🥇'] },
    { name: '3 CONE', date: 'Updated Mar 23, 2024', value: '6.92', unit: 'sec', dir: 'up', medals: ['🥇', '🥈'] }]
  },
  { label: 'POWER', metrics: [
    { name: 'VERTICAL JUMP', date: 'Updated Jan 15, 2025', value: '32', unit: 'in', dir: 'up', medals: ['🥇'] },
    { name: 'BENCH PRESS', date: 'Not tested', value: null, addBtn: true }]
  },
  { label: 'AGILITY', metrics: [
    { name: 'PRO AGILITY', date: 'Updated Feb 22, 2026', value: '4.88', unit: 'sec', dir: 'up', medals: ['🥇'] }]
  },
  { label: 'FOOTBALL', metrics: [
    { name: 'THROW VELOCITY', date: 'Updated Dec 10, 2024', value: '58', unit: 'mph', dir: 'up', medals: ['🥇'] },
    { name: 'THROW DISTANCE', date: 'Updated Dec 10, 2024', value: '55', unit: 'yds', dir: 'up', medals: ['🥇'] }]
  }];


  return (
    <PScreen accent={accent}>
      <AvantiBanner>
        Pro Agility improved 0.08s since Feb — log your next test to track progress.
      </AvantiBanner>

      <div style={{ marginTop: 14 }}>
        <TabRow tabs={['Highlights', 'Ability', 'Stats', 'Bio']} value="Ability" accent={accent} />
      </div>

      <div style={{ padding: '8px 0 24px' }}>
        {sections.map((sec) =>
        <React.Fragment key={sec.label}>
            <div style={{ padding: '14px 18px 6px', color: accent, fontFamily: 'JetBrains Mono', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em' }}>
              {sec.label}
            </div>
            {sec.metrics.map((m, i) =>
          <div key={i} style={{
            margin: '4px 14px',
            padding: '12px 14px',
            background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 10,
            display: 'flex', alignItems: 'center', gap: 12
          }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 13.5, color: '#F5F0EB', letterSpacing: '0.02em' }}>{m.name}</div>
                  <div style={{ fontSize: 11, color: '#8888A0', marginTop: 3 }}>{m.date}</div>
                </div>
                {m.value ?
            <>
                    <Spark accent={accent} />
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                      <span style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 22, color: '#F5F0EB' }}>{m.value}</span>
                      <span style={{ fontFamily: 'DM Sans', fontSize: 11, color: '#8888A0' }}>{m.unit}</span>
                    </div>
                    <span style={{ color: accent, fontSize: 13 }}>↑</span>
                    <div style={{ display: 'flex', gap: 1, fontSize: 13 }}>
                      {m.medals.map((md, j) => <span key={j}>{md}</span>)}
                    </div>
                    <button style={{ background: 'transparent', border: 'none', color: '#8888A0', fontSize: 18, cursor: 'pointer', padding: 0, lineHeight: 1 }}>+</button>
                  </> :

            <button style={{
              background: 'transparent', color: accent,
              border: `1px solid ${accent}40`, padding: '6px 12px', borderRadius: 6,
              cursor: 'pointer', fontFamily: 'DM Sans', fontWeight: 600, fontSize: 12
            }}>+ Add Result</button>
            }
              </div>
          )}
          </React.Fragment>
        )}
      </div>
    </PScreen>);

};

// =================================================================
//  P3 — STATS (unified Season + Game, internal sub-tab switcher)
// =================================================================
const ALL_GAMES = [
{ date: ['Apr', '24'], opp: 'vs City Select', res: 'W', resColor: '#34D399', cmp: '64%', yds: '247', td: '3' },
{ date: ['Apr', '17'], opp: 'vs FC Riverside', res: 'W', resColor: '#34D399', cmp: '71%', yds: '312', td: '2' },
{ date: ['Apr', '10'], opp: 'vs Boys Black', res: 'L', resColor: '#FF6B6B', cmp: '58%', yds: '198', td: '1' },
{ date: ['Mar', '28'], opp: 'vs Valley United', res: 'W', resColor: '#34D399', cmp: '68%', yds: '276', td: '4' },
{ date: ['Mar', '21'], opp: 'vs Eastside Prep', res: 'W', resColor: '#34D399', cmp: '72%', yds: '289', td: '3' },
{ date: ['Mar', '14'], opp: 'vs SC United', res: 'W', resColor: '#34D399', cmp: '66%', yds: '231', td: '2' },
{ date: ['Mar', '07'], opp: 'vs North Ridge', res: 'L', resColor: '#FF6B6B', cmp: '54%', yds: '174', td: '1' },
{ date: ['Feb', '28'], opp: 'vs Trinity Hall', res: 'W', resColor: '#34D399', cmp: '70%', yds: '258', td: '3' },
{ date: ['Feb', '21'], opp: 'vs Pacific FC', res: 'W', resColor: '#34D399', cmp: '63%', yds: '212', td: '2' },
{ date: ['Feb', '14'], opp: 'vs Lakewood', res: 'W', resColor: '#34D399', cmp: '69%', yds: '244', td: '2' },
{ date: ['Feb', '07'], opp: 'vs FC Mountain', res: 'L', resColor: '#FF6B6B', cmp: '52%', yds: '161', td: '0' },
{ date: ['Jan', '31'], opp: 'vs Cedar Valley', res: 'W', resColor: '#34D399', cmp: '67%', yds: '234', td: '3' }];


const PendingApprovalCard = ({ accent, title, body, stats }) =>
<div style={{ padding: '14px 14px 0' }}>
    <div style={{
    background: 'linear-gradient(180deg, rgba(251,191,36,0.06), transparent)',
    border: '1px solid #4A3200', borderRadius: 12, padding: '13px 14px'
  }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
        <span style={{ width: 7, height: 7, borderRadius: 99, background: '#FBBF24' }}></span>
        <span style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 13, color: '#FBBF24', letterSpacing: '0.06em' }}>{title}</span>
      </div>
      <div style={{ fontSize: 12.5, color: '#C8C8D0', lineHeight: 1.45, marginBottom: 10 }}>{body}</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 11 }}>
        {stats.map((t) =>
      <span key={t} style={{ fontFamily: 'JetBrains Mono', fontSize: 9.5, fontWeight: 600, color: '#C8C8D0', background: '#0a0a0e', border: '1px solid #1e1e26', padding: '4px 8px', borderRadius: 4, letterSpacing: '0.05em' }}>{t}</span>
      )}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={{
        flex: 1, background: '#34D399', color: '#000', border: 'none',
        padding: '11px 14px', borderRadius: 8, cursor: 'pointer',
        fontFamily: 'DM Sans', fontWeight: 700, fontSize: 13, letterSpacing: '0.04em'
      }}>APPROVE & POST</button>
        <button style={{
        background: 'transparent', color: '#C8C8D0', border: '1px solid #1e1e26',
        padding: '11px 18px', borderRadius: 8, cursor: 'pointer',
        fontFamily: 'DM Sans', fontWeight: 500, fontSize: 13
      }}>Edit</button>
      </div>
    </div>
  </div>;


const SeasonView = ({ accent }) => {
  const [hideRating, setHideRating] = useStateP(false);
  const attrs = [
  { label: 'SPD', value: 78 }, { label: 'ACC', value: 85 },
  { label: 'ARM', value: 82 }, { label: 'AWR', value: 88 },
  { label: 'AGI', value: 74 }];

  const tiles = [
  { label: 'COMPLETIONS', value: '68%', delta: '+8% vs last yr' },
  { label: 'PASS YARDS', value: '2,847', delta: '+420' },
  { label: 'TOUCHDOWNS', value: '24', delta: '+6' },
  { label: 'INTERCEPTIONS', value: '4', delta: '−2' },
  { label: 'PASSER RATING', value: '108.4', delta: '+11.2' },
  { label: 'YARDS/ATTEMPT', value: '8.6', delta: '+1.4' },
  { label: 'LONG', value: '67 yd', delta: 'Apr 17' },
  { label: 'GAMES', value: '12', delta: '9W · 3L' }];


  // tier-coloured fill — elite (85+) blue→light, mid (70-84) orange, low (<70) red
  const tierFill = (v) => {
    if (v >= 85) return 'linear-gradient(90deg, #2563EB 0%, #60A5FA 60%, #93C5FD 100%)';
    if (v >= 70) return 'linear-gradient(90deg, #EA580C 0%, #F59E0B 100%)';
    return 'linear-gradient(90deg, #B91C1C 0%, #EF4444 100%)';
  };
  const tierLabel = (v) => v >= 85 ? 'ELITE' : v >= 70 ? 'STRONG' : 'WORK';

  // Achievements: 5 earned + 1 locked next
  // Custom SVG glyphs — match the precision-instrument vocabulary (line icons, no emoji)
  const Glyph = ({ kind, color }) => {
    const s = { stroke: color, strokeWidth: 1.7, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };
    switch (kind) {
      case 'qb':return <svg width="22" height="22" viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="9" ry="5" transform="rotate(-20 12 12)" {...s} /><line x1="9" y1="11" x2="15" y2="13" {...s} /><line x1="10" y1="9.5" x2="10.5" y2="10" {...s} /><line x1="11" y1="11" x2="11.5" y2="11.5" {...s} /><line x1="12" y1="12.5" x2="12.5" y2="13" {...s} /><line x1="13" y1="14" x2="13.5" y2="14.5" {...s} /></svg>;
      case 'speed':return <svg width="22" height="22" viewBox="0 0 24 24"><path d="M13 3 L5 13 H11 L9 21 L17 11 H11 Z" {...s} /></svg>;
      case 'gpa':return <svg width="22" height="22" viewBox="0 0 24 24"><path d="M12 4 L22 9 L12 14 L2 9 Z" {...s} /><path d="M6 11 V16 C6 17 9 18.5 12 18.5 C15 18.5 18 17 18 16 V11" {...s} /></svg>;
      case 'mind':return <svg width="22" height="22" viewBox="0 0 24 24"><path d="M9 4.5 A4 4 0 0 0 5 8.5 A4 4 0 0 0 4.5 14 A4 4 0 0 0 8 19 V20 H12 V4.5 A4 4 0 0 0 9 4.5 Z" {...s} /><path d="M15 4.5 A4 4 0 0 1 19 8.5 A4 4 0 0 1 19.5 14 A4 4 0 0 1 16 19 V20 H12" {...s} /><line x1="12" y1="9" x2="9" y2="9" {...s} /><line x1="12" y1="13" x2="15" y2="13" {...s} /></svg>;
      case 'stadium':return <svg width="22" height="22" viewBox="0 0 24 24"><ellipse cx="12" cy="13" rx="9" ry="5" {...s} /><path d="M3 13 V15 C3 17 7 19 12 19 C17 19 21 17 21 15 V13" {...s} /><line x1="9" y1="9" x2="9" y2="17" {...s} /><line x1="12" y1="8" x2="12" y2="18" {...s} /><line x1="15" y1="9" x2="15" y2="17" {...s} /></svg>;
      case 'crown':return <svg width="22" height="22" viewBox="0 0 24 24"><path d="M3 17 L4.5 7 L9 11 L12 5 L15 11 L19.5 7 L21 17 Z" {...s} /><line x1="5" y1="20" x2="19" y2="20" {...s} /></svg>;
      default:return null;
    }
  };

  // Refined tiers: pull from VAI system + add an indigo "elite" — no greens (taken by AVANTI)
  const tiers = {
    bronze: {
      bg: 'linear-gradient(135deg, #2A1810 0%, #4A2818 100%)',
      border: '#7A4A22',
      glow: 'inset 0 1px 0 rgba(196,128,72,0.25)',
      icon: '#D4925A',
      label: '#A07050'
    },
    steel: { // (was silver) — cool slate, matches VAI dark grays
      bg: 'linear-gradient(135deg, #16161D 0%, #2A2A36 100%)',
      border: '#3A3A48',
      glow: 'inset 0 1px 0 rgba(200,200,208,0.12)',
      icon: '#C8C8D0',
      label: '#8888A0'
    },
    ember: { // (was gold) — VAI orange territory
      bg: 'linear-gradient(135deg, #2B1607 0%, #6B3206 100%)',
      border: '#F7941E',
      glow: '0 0 16px rgba(247,148,30,0.30), inset 0 1px 0 rgba(251,191,36,0.4)',
      icon: '#FBBF24',
      label: '#F7941E'
    },
    elite: { // indigo — "next tier above ember", reserved for top-shelf
      bg: 'linear-gradient(135deg, #0F0B2E 0%, #2D1B69 100%)',
      border: '#6366F1',
      glow: '0 0 18px rgba(99,102,241,0.35), inset 0 1px 0 rgba(165,180,252,0.35)',
      icon: '#A5B4FC',
      label: '#818CF8'
    },
    apex: { // accent-driven (team-color) — rarest
      bg: `linear-gradient(135deg, #050510 0%, ${accent}25 100%)`,
      border: accent,
      glow: `0 0 20px ${accent}40, inset 0 1px 0 ${accent}50`,
      icon: accent,
      label: accent
    },
    locked: {
      bg: '#0a0a0e',
      border: '#1e1e26',
      glow: 'none',
      icon: '#3a3a48',
      label: '#5d5d70'
    }
  };

  const badges = [
  { name: 'GOLD QB', tier: 'ember', glyph: 'qb' },
  { name: 'SPEED', tier: 'steel', glyph: 'speed' },
  { name: '4.0 GPA', tier: 'bronze', glyph: 'gpa' },
  { name: 'ELITE AWR', tier: 'elite', glyph: 'mind' },
  { name: '100 GAMES', tier: 'apex', glyph: 'stadium' },
  { name: 'ELITE QB', tier: 'locked', glyph: 'crown' }];


  // Next badge progress: OVR 84/89
  const ovrCurr = 84,ovrTarget = 89;
  const pct = Math.min(100, Math.round(ovrCurr / ovrTarget * 100));

  return (
    <>
      {/* Player Rating header w/ visibility toggle */}
      <div style={{ padding: '16px 18px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <SectionHead>PLAYER RATING</SectionHead>
        <button onClick={() => setHideRating(!hideRating)} style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6,
          color: hideRating ? '#5d5d70' : accent,
          fontFamily: 'JetBrains Mono', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em'
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {hideRating ?
            <>
                <path d="M9.88 9.88a3 3 0 0 0 4.24 4.24" />
                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                <line x1="2" y1="2" x2="22" y2="22" />
              </> :

            <>
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </>
            }
          </svg>
          {hideRating ? 'HIDDEN · SHOW' : 'VISIBLE · HIDE'}
        </button>
      </div>

      {/* OVR HERO CARD — Madden-style holographic rating card */}
      <div style={{ padding: '6px 14px 0' }}>
        <div style={{
          position: 'relative',
          borderRadius: 14,
          padding: '16px 14px 14px',
          background: hideRating ?
          'linear-gradient(135deg, #0a0a0e 0%, #14141c 100%)' :
          `linear-gradient(135deg, #050510 0%, ${accent}18 35%, ${accent}30 70%, #050510 100%)`,
          border: hideRating ? '1px dashed #2a2a36' : `1px solid ${accent}55`,
          boxShadow: hideRating ? 'none' : `0 12px 28px rgba(0,0,0,0.5), 0 0 24px ${accent}25, inset 0 1px 0 ${accent}30`,
          overflow: 'hidden'
        }}>
          {/* Holographic diagonal sweep */}
          {!hideRating && <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(115deg, transparent 0%, ${accent}10 30%, rgba(255,255,255,0.07) 48%, rgba(255,255,255,0.02) 52%, ${accent}10 70%, transparent 100%)`,
            pointerEvents: 'none'
          }}></div>}
          {/* Subtle scanline texture */}
          {!hideRating && <div style={{
            position: 'absolute', inset: 0, opacity: 0.18,
            background: 'repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(255,255,255,0.04) 2px, rgba(255,255,255,0.04) 3px)',
            pointerEvents: 'none', mixBlendMode: 'overlay'
          }}></div>}

          {/* Top frame: hairlines + corner ticks */}
          <div style={{ position: 'absolute', top: 8, left: 10, right: 10, height: 1, background: hideRating ? '#1e1e26' : `${accent}40` }}></div>
          <div style={{ position: 'absolute', top: 5, left: 7, width: 6, height: 6, borderTop: `1.5px solid ${hideRating ? '#3a3a48' : accent}`, borderLeft: `1.5px solid ${hideRating ? '#3a3a48' : accent}` }}></div>
          <div style={{ position: 'absolute', top: 5, right: 7, width: 6, height: 6, borderTop: `1.5px solid ${hideRating ? '#3a3a48' : accent}`, borderRight: `1.5px solid ${hideRating ? '#3a3a48' : accent}` }}></div>
          <div style={{ position: 'absolute', bottom: 5, left: 7, width: 6, height: 6, borderBottom: `1.5px solid ${hideRating ? '#3a3a48' : accent}`, borderLeft: `1.5px solid ${hideRating ? '#3a3a48' : accent}` }}></div>
          <div style={{ position: 'absolute', bottom: 5, right: 7, width: 6, height: 6, borderBottom: `1.5px solid ${hideRating ? '#3a3a48' : accent}`, borderRight: `1.5px solid ${hideRating ? '#3a3a48' : accent}` }}></div>

          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '108px 1fr', gap: 14, alignItems: 'stretch' }}>
            {/* LEFT: rating block */}
            <div style={{
              position: 'relative',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '4px 0',
              borderRight: `1px solid ${hideRating ? '#1e1e26' : accent + '30'}`
            }}>
              <span style={{
                fontFamily: 'JetBrains Mono', fontSize: 9, fontWeight: 700,
                letterSpacing: '0.22em',
                color: hideRating ? '#5d5d70' : `${accent}`,
                opacity: hideRating ? 1 : 0.85
              }}>OVERALL</span>
              <div style={{ position: 'relative', marginTop: 2 }}>
                {/* Shadow stamp behind */}
                {!hideRating && <span style={{
                  position: 'absolute', top: 3, left: 3,
                  fontFamily: 'Oswald', fontWeight: 700, fontSize: 72, lineHeight: 0.85,
                  fontStyle: 'italic', letterSpacing: '-0.04em',
                  color: 'rgba(0,0,0,0.55)', filter: 'blur(4px)', pointerEvents: 'none'
                }}>84</span>}
                <span style={{
                  position: 'relative',
                  fontFamily: 'Oswald', fontWeight: 700, fontSize: 72, lineHeight: 0.85,
                  fontStyle: 'italic', letterSpacing: '-0.04em',
                  color: hideRating ? '#3a3a48' : '#F5F0EB',
                  WebkitTextStroke: hideRating ? 0 : `0.5px ${accent}`,
                  textShadow: hideRating ? 'none' : `0 0 18px ${accent}80, 0 2px 0 rgba(0,0,0,0.4)`
                }}>{hideRating ? '—' : '84'}</span>
              </div>
              {/* Tier hairline + label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
                <span style={{ width: 14, height: 1, background: hideRating ? '#3a3a48' : accent, opacity: 0.7 }}></span>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, fontWeight: 700, letterSpacing: '0.18em', color: hideRating ? '#5d5d70' : '#F5F0EB' }}>
                  {hideRating ? 'HIDDEN' : 'STRONG'}
                </span>
                <span style={{ width: 14, height: 1, background: hideRating ? '#3a3a48' : accent, opacity: 0.7 }}></span>
              </div>
              {/* Position badge */}
              <div style={{
                marginTop: 8,
                padding: '3px 10px', borderRadius: 4,
                background: hideRating ? '#15151c' : '#000',
                border: `1px solid ${hideRating ? '#2a2a36' : accent}`,
                fontFamily: 'Oswald', fontWeight: 700, fontSize: 14,
                color: hideRating ? '#5d5d70' : accent,
                letterSpacing: '0.14em'
              }}>QB</div>
              {/* Class tag */}
              <div style={{
                marginTop: 6,
                fontFamily: 'JetBrains Mono', fontSize: 8, fontWeight: 700,
                color: hideRating ? '#3a3a48' : 'rgba(245,240,235,0.55)', letterSpacing: '0.14em'
              }}>CLASS '26</div>
            </div>

            {/* RIGHT: attribute bars w/ chevron fills */}
            <div style={{ display: 'grid', gap: 7, alignContent: 'center' }}>
              {attrs.map((a) => {
                const isElite = a.value >= 85;
                const isStrong = a.value >= 70 && a.value < 85;
                const tierColor = isElite ? '#60A5FA' : isStrong ? '#F59E0B' : '#EF4444';
                return (
                  <div key={a.label} style={{ display: 'grid', gridTemplateColumns: '34px 1fr 30px', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 13, color: hideRating ? '#3a3a48' : '#F5F0EB', letterSpacing: '0.06em' }}>{a.label}</span>
                    <div style={{ position: 'relative', height: 12, display: 'flex', alignItems: 'center' }}>
                      {/* Track */}
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 2, clipPath: 'polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)' }}></div>
                      {/* Fill */}
                      {!hideRating && <div style={{
                        position: 'absolute', top: 1, left: 1, bottom: 1,
                        width: `calc(${a.value}% - 2px)`,
                        background: tierFill(a.value),
                        clipPath: 'polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)',
                        boxShadow: `0 0 8px ${tierColor}80`
                      }}></div>}
                      {/* Tick marks at 50/70/85 */}
                      {[50, 70, 85].map((t) =>
                      <div key={t} style={{ position: 'absolute', top: 2, bottom: 2, left: `${t}%`, width: 1, background: 'rgba(255,255,255,0.18)', pointerEvents: 'none' }}></div>
                      )}
                    </div>
                    <span style={{
                      fontFamily: 'Oswald', fontWeight: 700, fontSize: 16,
                      color: hideRating ? '#3a3a48' : tierColor, textAlign: 'right',
                      letterSpacing: '-0.02em',
                      textShadow: hideRating ? 'none' : `0 0 8px ${tierColor}50`
                    }}>
                      {hideRating ? '—' : a.value}
                    </span>
                  </div>);

              })}
            </div>
          </div>

          {/* Bottom meta row */}
          {!hideRating && <div style={{
            position: 'relative', marginTop: 10, paddingTop: 8,
            borderTop: `1px solid ${accent}25`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontFamily: 'JetBrains Mono', fontSize: 8.5, fontWeight: 700, letterSpacing: '0.14em'
          }}>
            <span style={{ color: 'rgba(245,240,235,0.55)' }}>● VAI VERIFIED</span>
            <span style={{ color: accent }}>↑ +6 SINCE LAST SEASON</span>
            <span style={{ color: 'rgba(245,240,235,0.55)' }}>TIER 02 / 05</span>
          </div>}
        </div>
      </div>

      {/* Achievements row */}
      <div style={{ padding: '20px 18px 8px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <SectionHead>ACHIEVEMENTS · 6 EARNED</SectionHead>
        <button style={{ background: 'transparent', border: 'none', color: accent, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>View all ›</button>
      </div>
      <div style={{ padding: '0 14px', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 7 }}>
        {badges.map((b) => {
          const t = tiers[b.tier];
          const locked = b.tier === 'locked';
          return (
            <div key={b.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <div style={{
                width: '100%', aspectRatio: '1', borderRadius: 10,
                background: t.bg,
                border: `1px solid ${t.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
                boxShadow: t.glow
              }}>
                <Glyph kind={b.glyph} color={t.icon} />
                {locked &&
                <div style={{
                  position: 'absolute', top: 4, right: 4,
                  width: 14, height: 14, borderRadius: 99,
                  background: 'rgba(0,0,0,0.7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#8888A0" strokeWidth="2.5" strokeLinecap="round">
                      <rect x="5" y="11" width="14" height="10" rx="2" />
                      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                    </svg>
                  </div>
                }
              </div>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, fontWeight: 700, color: t.label, letterSpacing: '0.02em', textAlign: 'center', lineHeight: 1.2 }}>
                {b.name}
              </span>
            </div>);

        })}
      </div>

      {/* Next badge progress */}
      <div style={{ padding: '14px 14px 0' }}>
        <div style={{
          background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 12,
          padding: '13px 14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 7 }}>
            <div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9, fontWeight: 700, color: '#5d5d70', letterSpacing: '0.1em' }}>NEXT BADGE</div>
              <div style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 14, color: '#F5F0EB', marginTop: 4, letterSpacing: '0.02em' }}>
                ELITE QB · OVR {ovrTarget} NEEDED
              </div>
            </div>
            <span style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 18, color: '#818CF8' }}>
              {ovrCurr}<span style={{ color: '#5d5d70', fontSize: 13 }}>/{ovrTarget}</span>
            </span>
          </div>
          <div style={{ height: 8, background: '#15151c', borderRadius: 99, overflow: 'hidden', marginTop: 8 }}>
            <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #4338CA 0%, #818CF8 60%, #C7D2FE 100%)', borderRadius: 99 }}></div>
          </div>
          <div style={{ marginTop: 9, fontSize: 11.5, color: '#C8C8D0', lineHeight: 1.45 }}>
            Improve <strong style={{ color: '#F59E0B', fontWeight: 600 }}>AWR +5</strong> to unlock — log a film session or new combine to update.
          </div>
        </div>
      </div>

      <div style={{ padding: '18px 14px 0' }}>
        <PendingApprovalCard accent={accent}
        title="STATS PENDING APPROVAL"
        body="Spring Invitational stats submitted by Coach Diaz — review before posting to profile."
        stats={['COMP 18/28', 'YDS 247', 'TD 3', 'INT 0']} />
      </div>

      {/* 8 season tiles */}
      <div style={{ padding: '14px 14px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {tiles.map((t) =>
        <div key={t.label} style={{
          background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 12,
          padding: '13px 14px'
        }}>
            <div className="mono-label" style={{ fontSize: 9 }}>{t.label}</div>
            <div style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 26, color: '#F5F0EB', marginTop: 6, lineHeight: 1 }}>{t.value}</div>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: t.delta.startsWith('−') ? '#FF6B6B' : '#34D399', letterSpacing: '0.04em', marginTop: 7 }}>↑ {t.delta}</div>
          </div>
        )}
      </div>
    </>);

};

const GameView = ({ accent }) =>
<>
    <PendingApprovalCard accent={accent}
  title="PENDING APPROVAL · SPRING INVITATIONAL"
  body="Submitted by Coach Diaz · Apr 24, 2026 · vs City Select"
  stats={['18/28 COMP', '247 YDS', '3 TD', '0 INT']} />

    <div style={{ padding: '20px 18px 6px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
      <SectionHead>GAME LOG · 2025–26 SEASON</SectionHead>
      <span style={{ fontSize: 11.5, color: '#8888A0' }}>{ALL_GAMES.length} games</span>
    </div>
    <div style={{ padding: '8px 18px 4px', display: 'grid', gridTemplateColumns: '52px 1fr 26px 44px 44px 26px', gap: 8, fontFamily: 'JetBrains Mono', fontSize: 9.5, fontWeight: 600, color: '#5d5d70', letterSpacing: '0.06em' }}>
      <span>DATE</span><span>OPPONENT</span><span>W/L</span><span>CMP%</span><span>YDS</span><span>TD</span>
    </div>
    <div style={{ padding: '0 14px 12px' }}>
      {ALL_GAMES.map((g, i) =>
    <div key={i} style={{
      display: 'grid', gridTemplateColumns: '52px 1fr 26px 44px 44px 26px', gap: 8,
      alignItems: 'center', padding: '11px 4px',
      borderTop: '1px solid #15151c'
    }}>
          <div>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10.5, color: '#8888A0' }}>{g.date[0]}</div>
            <div style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 16, color: '#F5F0EB', lineHeight: 1, marginTop: 1 }}>{g.date[1]}</div>
          </div>
          <span style={{ fontSize: 12.5, color: '#F5F0EB' }}>{g.opp}</span>
          <span style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 13, color: g.resColor }}>{g.res}</span>
          <span style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 13, color: '#F5F0EB' }}>{g.cmp}</span>
          <span style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 13, color: '#F5F0EB' }}>{g.yds}</span>
          <span style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 13, color: '#F5F0EB' }}>{g.td}</span>
        </div>
    )}
    </div>
  </>;


const CareerView = ({ accent }) => {
  const seasons = [
  { yr: '2025–26', team: 'VAI FC North', g: 12, cmp: '68%', yds: '2,847', td: 24, ovr: 84 },
  { yr: '2024–25', team: 'VAI FC North', g: 14, cmp: '60%', yds: '2,427', td: 18, ovr: 78 },
  { yr: '2023–24', team: 'JV — VAI North', g: 10, cmp: '55%', yds: '1,432', td: 11, ovr: 71 }];

  return (
    <>
      <div style={{ padding: '20px 18px 6px' }}>
        <SectionHead>CAREER TOTALS</SectionHead>
      </div>
      <div style={{ padding: '0 14px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[
        { label: 'GAMES', value: '36' },
        { label: 'PASS YDS', value: '6,706' },
        { label: 'TD', value: '53' },
        { label: 'CAREER CMP%', value: '63%' }].
        map((t) =>
        <div key={t.label} style={{ background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 12, padding: '13px 14px' }}>
            <div className="mono-label" style={{ fontSize: 9 }}>{t.label}</div>
            <div style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 28, color: '#F5F0EB', marginTop: 6, lineHeight: 1 }}>{t.value}</div>
          </div>
        )}
      </div>
      <div style={{ padding: '20px 18px 6px' }}>
        <SectionHead>SEASON HISTORY</SectionHead>
      </div>
      <div style={{ padding: '0 14px 12px', display: 'grid', gap: 8 }}>
        {seasons.map((s) =>
        <div key={s.yr} style={{ background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <div style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 16, color: '#F5F0EB' }}>{s.yr}</div>
                <div style={{ fontSize: 11.5, color: '#8888A0', marginTop: 2 }}>{s.team}</div>
              </div>
              <span style={{ background: accent, color: '#000', fontFamily: 'Oswald', fontWeight: 700, fontSize: 13, padding: '3px 9px', borderRadius: 6 }}>OVR {s.ovr}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
              {[['G', s.g], ['CMP', s.cmp], ['YDS', s.yds], ['TD', s.td]].map(([k, v]) =>
            <div key={k}>
                  <div className="mono-label" style={{ fontSize: 8.5 }}>{k}</div>
                  <div style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 14, color: '#F5F0EB', marginTop: 2 }}>{v}</div>
                </div>
            )}
            </div>
          </div>
        )}
      </div>
    </>);

};

const P3Stats = ({ accent, initialTab = 'Season' }) => {
  const sports = ['FOOTBALL', 'BASKETBALL', 'BASEBALL', 'SOCCER', 'LAC'];
  const subTabs = ['Career', 'Season', 'Game'];
  const [tab, setTab] = useStateP(initialTab);

  const banner = tab === 'Game' ?
  { ctaLabel: 'Review Now →', body: <><strong style={{ fontWeight: 600 }}>2 games</strong> have stats pending your approval — approve to update your season averages.</> } :
  tab === 'Career' ?
  { ctaLabel: null, body: <>Your <strong style={{ fontWeight: 600 }}>3-year trajectory</strong> ranks top 15% nationally for QBs in your class.</> } :
  { ctaLabel: null, body: <>Completion rate <strong style={{ fontWeight: 600 }}>+8% this season</strong> — top 20% for your position nationally.</> };

  return (
    <PScreen accent={accent}>
      <AvantiBanner ctaLabel={banner.ctaLabel}>{banner.body}</AvantiBanner>

      <div style={{ marginTop: 14 }}>
        <TabRow tabs={['Highlights', 'Ability', 'Stats', 'Bio']} value="Stats" accent={accent} />
      </div>

      {/* Sport switcher */}
      <div style={{ display: 'flex', gap: 18, padding: '14px 18px 4px', borderBottom: '1px solid #1e1e26', overflowX: 'auto' }} className="no-scrollbar">
        {sports.map((s, i) =>
        <button key={s} style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          padding: '6px 0', flexShrink: 0,
          color: i === 0 ? accent : '#8888A0',
          fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 11.5, letterSpacing: '0.08em',
          borderBottom: i === 0 ? `2px solid ${accent}` : '2px solid transparent'
        }}>{s}</button>
        )}
      </div>

      {/* Career/Season/Game — interactive */}
      <div style={{ display: 'flex', gap: 7, padding: '14px 18px 4px' }}>
        {subTabs.map((t) =>
        <button key={t} onClick={() => setTab(t)} style={{
          background: t === tab ? `${accent}20` : 'transparent',
          color: t === tab ? accent : '#8888A0',
          border: t === tab ? `1px solid ${accent}40` : '1px solid #1e1e26',
          padding: '6px 14px', borderRadius: 999, cursor: 'pointer',
          fontFamily: 'DM Sans', fontWeight: t === tab ? 600 : 500, fontSize: 12.5
        }}>{t}</button>
        )}
      </div>

      {tab === 'Season' && <SeasonView accent={accent} />}
      {tab === 'Game' && <GameView accent={accent} />}
      {tab === 'Career' && <CareerView accent={accent} />}

      <div style={{ padding: '12px 14px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }} />

    </PScreen>);

};

// P5 alias — Stats with Game tab pre-selected (kept for canvas labelling)
const P5StatsGame = ({ accent }) => <P3Stats accent={accent} initialTab="Game" />;

// =================================================================
//  P4 — Throw Velocity drill-down
// =================================================================
const P4Velocity = ({ accent }) => {
  // 12 month points climbing 52 → 58
  const points = [
  { m: 'Jan', v: 52 }, { m: 'Feb', v: 53 }, { m: 'Mar', v: 53 },
  { m: 'May', v: 54 }, { m: 'Jul', v: 55 }, { m: 'Sep', v: 56 },
  { m: 'Dec', v: 58 }];

  const min = 50,max = 60;
  const W = 320,H = 130,padL = 26,padR = 10,padT = 14,padB = 18;
  const xStep = (W - padL - padR) / (points.length - 1);
  const yFor = (v) => padT + (1 - (v - min) / (max - min)) * (H - padT - padB);
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${padL + i * xStep} ${yFor(p.v)}`).join(' ');
  const areaPath = `${path} L ${padL + (points.length - 1) * xStep} ${H - padB} L ${padL} ${H - padB} Z`;

  return (
    <PScreen accent={accent} nav="me">
      {/* Title block */}
      <div style={{ padding: '18px 18px 6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontFamily: 'JetBrains Mono', fontSize: 11, fontWeight: 600, color: accent, letterSpacing: '0.1em' }}>
          <span>FOOTBALL</span>
          <span style={{ color: '#3a3a48' }}>·</span>
          <span>POWER</span>
        </div>
        <div style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 18, color: '#F5F0EB', letterSpacing: '0.04em', marginTop: 6 }}>THROW VELOCITY</div>
      </div>

      {/* Headline value */}
      <div style={{ padding: '4px 18px 10px', display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 64, color: '#F5F0EB', lineHeight: 1 }}>58</span>
        <span style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 22, color: accent, letterSpacing: '0.02em' }}>MPH</span>
      </div>
      <div style={{ padding: '0 18px 8px', fontSize: 12, color: '#8888A0' }}>Last updated: Dec 10, 2024</div>

      {/* +6 chip */}
      <div style={{ padding: '6px 18px 0' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontFamily: 'JetBrains Mono', fontSize: 11, fontWeight: 600, color: accent,
          border: `1px solid ${accent}40`, padding: '6px 12px', borderRadius: 999,
          letterSpacing: '0.05em'
        }}>
          ↑ +6 MPH OVER 12 MONTHS
        </span>
      </div>

      {/* Range chips */}
      <div style={{ padding: '20px 18px 8px', display: 'flex', gap: 8 }}>
        <SubChip label="12 MOS" active={true} accent={accent} />
        <SubChip label="3 YEAR" active={false} accent={accent} />
      </div>

      {/* Chart */}
      <div style={{ margin: '4px 14px 0', background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 12, padding: '14px 10px' }}>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: 'block' }}>
          <defs>
            <linearGradient id="velArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accent} stopOpacity="0.35" />
              <stop offset="100%" stopColor={accent} stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* y labels */}
          {[57, 55, 50].map((v) =>
          <g key={v}>
              <text x="2" y={yFor(v) + 3} fontFamily="JetBrains Mono" fontSize="9" fill="#5d5d70">{v}</text>
              <line x1={padL} y1={yFor(v)} x2={W - padR} y2={yFor(v)} stroke="#15151c" />
            </g>
          )}
          <path d={areaPath} fill="url(#velArea)" />
          <path d={path} stroke={accent} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((p, i) =>
          <circle key={i} cx={padL + i * xStep} cy={yFor(p.v)} r="3" fill={accent} stroke="#0c0c10" strokeWidth="1.5" />
          )}
        </svg>
      </div>

      {/* Stats row */}
      <div style={{ padding: '18px 18px 0', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {[
        { label: 'STARTING', value: '52', unit: 'MPH', color: '#F5F0EB' },
        { label: 'CURRENT', value: '58', unit: 'MPH', color: '#F5F0EB' },
        { label: 'INCREASE', value: '+6', unit: 'MPH', color: accent }].
        map((s) =>
        <div key={s.label}>
            <div className="mono-label" style={{ fontSize: 9.5 }}>{s.label}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 6 }}>
              <span style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 22, color: s.color }}>{s.value}</span>
              <span style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 12, color: s.color, letterSpacing: '0.04em' }}>{s.unit}</span>
            </div>
          </div>
        )}
      </div>

      {/* AVANTI Coaching */}
      <div style={{ padding: '20px 14px 24px' }}>
        <div style={{
          background: 'linear-gradient(180deg, rgba(52,211,153,0.05), transparent)',
          border: '1px solid #0D4A28', borderRadius: 12, padding: '13px 14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
            <span className="avanti-dot" style={{ width: 6, height: 6 }}></span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, fontWeight: 700, color: '#34D399', letterSpacing: '0.1em' }}>AVANTI COACHING</span>
          </div>
          <div style={{ fontSize: 13, color: '#C8C8D0', lineHeight: 1.5 }}>
            58 MPH is above average for your age group. Elite QBs average 60–65 MPH. Aim for 62 MPH by next combine — add shoulder/rotational strength work.
          </div>
        </div>
      </div>
    </PScreen>);

};

// =================================================================
//  P0 — HIGHLIGHTS tab (recruiting card / first impression)
//  Full-bleed action photo + giant ghost stat numbers + identity overlay
// =================================================================
// Helper — convert hex to rgba (used by both P0 + P0b)
const _rgba = (hex, a) => {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
};

const HERO_PHOTO = 'assets/action-bg.png';
const AVATAR_PHOTO = 'assets/avatar.png';

// VAI wingmark + wordmark + Mentor M
// VAI logo — canonical wingmark + tier badge (matches header used across all other designs)
const VAILogo = () =>
<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <VAIWingmark size={30} />
    <span style={{ display: 'inline-flex', alignSelf: 'center', transform: 'translateY(4px)' }}>
      <TierBadge tier="mentor" />
    </span>
  </div>;


const P0Highlights = ({ accent, onChangeMetrics }) => {
  const rgba = _rgba;

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: '#060608', color: '#F5F0EB', fontFamily: 'DM Sans',
      display: 'flex', flexDirection: 'column'
    }}>
      {/* ============ HERO BACKGROUND PHOTO ============ */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url(${HERO_PHOTO})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 35%',
        filter: 'contrast(1.04) saturate(0.95)'
      }}></div>

      {/* Top-darken gradient (header legibility) */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '32%',
        background: 'linear-gradient(180deg, rgba(6,6,8,0.85) 0%, rgba(6,6,8,0.5) 50%, transparent 100%)'
      }}></div>

      {/* Bottom team-color wash (30% of screen) */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '42%',
        background: `linear-gradient(180deg, transparent 0%, ${rgba(accent, 0.25)} 35%, ${rgba(accent, 0.55)} 70%, rgba(6,6,8,0.95) 100%)`
      }}></div>

      {/* Subtle vignette for cinematic feel */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.45) 100%)',
        pointerEvents: 'none'
      }}></div>

      {/* ============ MAIN STACK ============ */}
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>

        {/* HEADER ROW — canonical VAI header (logo + tier badge · search/bell/menu) */}
        <div style={{
          flexShrink: 0, padding: '14px 18px 12px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <VAILogo />
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, color: '#C8C8D0' }}>
            <span style={{ width: 20, height: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconSearch size={18} />
            </span>
            <span style={{ width: 20, height: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <IconBell size={18} />
              <span style={{ position: 'absolute', top: 1, right: 1, width: 7, height: 7, borderRadius: 99, background: '#FF6B6B', border: '1.5px solid #060608' }}></span>
            </span>
            <span style={{ width: 20, height: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconHamburger size={18} />
            </span>
          </div>
        </div>

        {/* AVANTI strip */}
        <div style={{
          flexShrink: 0, margin: '0 14px 10px',
          padding: '8px 12px',
          background: 'rgba(13, 74, 40, 0.55)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(52, 211, 153, 0.4)',
          borderRadius: 8,
          display: 'flex', alignItems: 'center', gap: 8
        }}>
          <span style={{ width: 7, height: 7, borderRadius: 99, background: '#34D399', boxShadow: '0 0 8px rgba(52,211,153,0.8)', flexShrink: 0 }}></span>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, fontWeight: 700, color: '#34D399', letterSpacing: '0.1em', flexShrink: 0 }}>AVANTI</span>
          <span style={{ fontSize: 12, color: '#F5F0EB', lineHeight: 1.3 }}>
            Viewed by <strong style={{ fontWeight: 700, color: '#34D399' }}>4 coaches</strong> this week · <strong style={{ fontWeight: 700, color: '#F5F0EB' }}>1 D1 program</strong>
          </span>
        </div>

        {/* IDENTITY OVERLAY — name typography as design hero */}
        <div style={{ flexShrink: 0, padding: '8px 18px 0', position: 'relative' }}>
          {/* Vertical "QB" sentinel */}
          <div style={{
            position: 'absolute', left: 0, top: 14, bottom: 0,
            writingMode: 'vertical-rl', transform: 'rotate(180deg)',
            fontFamily: 'JetBrains Mono', fontSize: 10, fontWeight: 700,
            color: accent, letterSpacing: '0.4em',
            display: 'flex', alignItems: 'center', gap: 8,
            textAlign: 'center'
          }}>
            <span style={{ width: 18, height: 1, background: accent, transform: 'rotate(90deg)', display: 'inline-block', marginBottom: 4 }}></span>
          </div>

          <div style={{ paddingLeft: 22 }}>
            {/* HANDLE / PROMO CODE — featured visual chip (shareable discount code) */}
            <div style={{
              display: 'inline-flex', alignItems: 'stretch',
              marginBottom: 12,
              borderRadius: 6, overflow: 'hidden',
              background: 'rgba(6,6,8,0.78)', backdropFilter: 'blur(10px)',
              border: `1px solid ${accent}`,
              boxShadow: `0 6px 18px rgba(0,0,0,0.55), 0 0 14px ${accent}40`
            }}>
              {/* Left accent bar */}
              <div style={{
                width: 4, background: accent,
                boxShadow: `0 0 10px ${accent}80`
              }}></div>
              {/* Avatar */}
              <div style={{
                alignSelf: 'center', marginLeft: 10,
                width: 36, height: 36, borderRadius: 99,
                backgroundImage: `url(${AVATAR_PHOTO})`,
                backgroundSize: 'cover', backgroundPosition: 'center',
                border: `1.5px solid ${accent}`,
                boxShadow: `0 0 8px ${accent}60`,
                flexShrink: 0
              }}></div>
              {/* Handle */}
              <div style={{ padding: '8px 12px 8px 10px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  fontFamily: 'Oswald', fontWeight: 700, fontSize: 26,
                  color: '#F5F0EB', letterSpacing: '0.02em',
                  lineHeight: 1,
                  display: 'flex', alignItems: 'baseline', gap: 1
                }}>
                  <span style={{ color: accent, fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 22, marginRight: 1 }}>@</span>
                  bwhite
                </div>
                {/* Vertical divider */}
                <div style={{ width: 1, alignSelf: 'stretch', background: 'rgba(245,240,235,0.18)' }}></div>
                {/* Jersey number */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 28 }}>
                  <div style={{
                    fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 7,
                    color: 'rgba(245,240,235,0.5)', letterSpacing: '0.18em'
                  }}>NO.</div>
                  <div style={{
                    fontFamily: 'Oswald', fontWeight: 700, fontSize: 22,
                    color: accent, letterSpacing: '-0.02em',
                    lineHeight: 1, fontStyle: 'italic'
                  }}>07</div>
                </div>
                {/* Copy icon */}
                <div style={{
                  width: 26, height: 26, borderRadius: 4,
                  background: 'rgba(245,240,235,0.06)',
                  border: '1px solid rgba(245,240,235,0.18)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F5F0EB" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                </div>
              </div>
            </div>
            {/* First name — small, light, muted (the label) */}
            <div style={{

              letterSpacing: '0.04em',
              lineHeight: 1, marginBottom: 2, fontFamily: "Oswald", color: "rgb(255, 255, 255)", fontWeight: "600", fontSize: "45px"
            }}>BEN</div>
            {/* Last name — massive, bold italic (the identity) */}
            <div style={{
              fontFamily: 'Oswald', fontWeight: 700,
              color: '#F5F0EB', letterSpacing: '-0.03em', lineHeight: 0.85,
              textShadow: '0 4px 22px rgba(0,0,0,0.85)',
              fontStyle: 'italic',
              whiteSpace: 'nowrap', fontSize: "65px"
            }}>WHITESIDES</div>
            {/* Class line — accent color */}
            <div style={{
              marginTop: 8,
              fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 11,
              color: accent, letterSpacing: '0.22em',
              textShadow: '0 1px 6px rgba(0,0,0,0.6)'
            }}>CLASS OF 2026</div>
          </div>

          {/* Sport pills */}
          <div style={{ display: 'flex', gap: 5, marginTop: 12, paddingLeft: 22, flexWrap: 'wrap' }}>
            {[
            { label: 'FOOTBALL · QB', primary: true },
            { label: 'BASKETBALL · G', primary: false },
            { label: 'LACROSSE · A', primary: false }].
            map((p) =>
            <span key={p.label} style={{
              padding: '4px 10px', borderRadius: 99,
              fontFamily: 'JetBrains Mono', fontSize: 9, fontWeight: 700,
              letterSpacing: '0.05em',
              color: p.primary ? '#000' : accent,
              background: p.primary ? accent : 'transparent',
              border: `1.5px solid ${accent}`
            }}>{p.label}</span>
            )}
          </div>
        </div>

        {/* SPACER */}
        <div style={{ flex: '1 1 auto', minHeight: 8 }}></div>

        {/* HERO STAT BLOCK — asymmetric drama. Giant 5.08 left, vertical OVR card right */}
        <div style={{ flexShrink: 0, position: 'relative' }}>
          {/* Vertical accent line down the right edge */}
          <div style={{
            position: 'absolute', right: 0, top: 0, bottom: 0,
            width: 3, background: `linear-gradient(180deg, transparent 0%, ${accent} 30%, ${accent} 70%, transparent 100%)`,
            opacity: 0.85
          }}></div>

          {/* "FEATURED ABILITIES" eyebrow */}
          <div style={{
            padding: '0 18px 10px',
            display: 'flex', alignItems: 'center', gap: 8,
            fontFamily: 'JetBrains Mono', fontSize: 9, fontWeight: 700,
            color: 'rgba(245,240,235,0.7)', letterSpacing: '0.18em'
          }}>
            <span style={{ width: 16, height: 1, background: accent }}></span>
            FEATURED ABILITIES
            <span style={{ flex: 1, height: 1, background: 'rgba(245,240,235,0.15)' }}></span>
            <span style={{ color: '#34D399' }}>● LIVE</span>
          </div>

          {/* THE big composition */}
          <div style={{
            padding: '0 16px 0 18px',
            display: 'block',
            alignItems: 'flex-start'
          }}>
            {/* LEFT: 5.08 hero + dual mini stats below */}
            <div style={{ minWidth: 0 }}>
              {/* MASSIVE 5.08 — italic, slightly cropped at bottom for cinematic feel */}
              <div style={{ position: 'relative' }}>
                {/* Big shadow number behind for depth */}
                <div style={{
                  position: 'absolute', top: 4, left: 4,
                  fontFamily: 'Oswald', fontWeight: 700, fontSize: 168,
                  color: 'rgba(0,0,0,0.35)', letterSpacing: '-0.05em',
                  fontStyle: 'italic', lineHeight: 0.82,
                  filter: 'blur(8px)',
                  pointerEvents: 'none'
                }}>5.08</div>
                <div style={{
                  position: 'relative',
                  fontFamily: 'Oswald', fontWeight: 700,
                  color: '#F5F0EB', letterSpacing: '-0.05em',
                  fontStyle: 'italic', lineHeight: 0.82,
                  textShadow: '0 6px 28px rgba(0,0,0,0.7)',
                  WebkitTextStroke: '0.5px rgba(245,240,235,0.4)',
                  fontSize: "96px",
                  display: 'inline-flex', alignItems: 'flex-start', gap: 6
                }}>
                  <span>5.08</span>
                  <span style={{
                    fontFamily: 'JetBrains Mono', fontSize: 11, fontWeight: 700,
                    color: accent, letterSpacing: '0.1em',
                    fontStyle: 'normal',
                    WebkitTextStroke: 0,
                    marginTop: 14
                  }}>
</span>
                </div>
              </div>
              {/* Label slug — crops below the number */}
              <div style={{ marginTop: 4,
                display: 'flex', alignItems: 'center', gap: 8,
                fontFamily: 'Oswald', fontWeight: 700, fontSize: 18,
                color: '#F5F0EB', letterSpacing: '0.04em'
              }}>
                40YD DASH
                <span style={{ flex: 1, height: 1, background: 'rgba(245,240,235,0.2)' }}></span>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'rgba(245,240,235,0.5)', letterSpacing: '0.1em' }}>01</span>
              </div>

              {/* DUAL MINI STATS — divided by vertical hairline */}
              <div style={{
                marginTop: 14,
                display: 'grid', gridTemplateColumns: '1fr 1px 1fr', gap: 12,
                alignItems: 'flex-start'
              }}>
                <div>
                  <div style={{
                    fontFamily: 'Oswald', fontWeight: 700, fontSize: 42,
                    color: '#F5F0EB', letterSpacing: '-0.03em', lineHeight: 0.85,
                    fontStyle: 'italic',
                    textShadow: '0 3px 12px rgba(0,0,0,0.5)'
                  }}>4.88<span style={{ fontSize: 16, color: accent, marginLeft: 3, fontStyle: 'normal', fontFamily: 'JetBrains Mono', fontWeight: 700, letterSpacing: '0.05em' }}>sec</span></div>
                  <div style={{
                    marginTop: 4, fontFamily: 'JetBrains Mono', fontSize: 9, fontWeight: 700,
                    color: 'rgba(245,240,235,0.65)', letterSpacing: '0.15em'
                  }}>PRO AGILITY </div>
                </div>
                <div style={{ background: 'rgba(245,240,235,0.18)', alignSelf: 'stretch', minHeight: 44 }}></div>
                <div>
                  <div style={{
                    fontFamily: 'Oswald', fontWeight: 700, fontSize: 42,
                    color: '#F5F0EB', letterSpacing: '-0.03em', lineHeight: 0.85,
                    fontStyle: 'italic',
                    textShadow: '0 3px 12px rgba(0,0,0,0.5)'
                  }}>320<span style={{ fontSize: 16, color: accent, marginLeft: 3, fontStyle: 'normal', fontFamily: 'JetBrains Mono', fontWeight: 700, letterSpacing: '0.05em' }}>lb</span></div>
                  <div style={{
                    marginTop: 4, fontFamily: 'JetBrains Mono', fontSize: 9, fontWeight: 700,
                    color: 'rgba(245,240,235,0.65)', letterSpacing: '0.15em'
                  }}>SQUAT </div>
                </div>
              </div>
            </div>

          </div>

          {/* Trust strip + Change Metrics */}
          <div style={{
            marginTop: 14, padding: '10px 18px 0',
            borderTop: '1px solid rgba(245,240,235,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
              fontFamily: 'JetBrains Mono', fontSize: 9, fontWeight: 600, color: 'rgba(245,240,235,0.55)',
              letterSpacing: '0.08em'
            }}>
              <span>TESTED MAR 12</span>
              <span style={{ width: 2, height: 2, borderRadius: 99, background: 'rgba(245,240,235,0.3)' }}></span>
              <span>AUSTIN, TX</span>
              <span style={{ width: 2, height: 2, borderRadius: 99, background: 'rgba(245,240,235,0.3)' }}></span>
              <span>247 VIEWS</span>
            </div>
            <button onClick={onChangeMetrics} style={{
              flexShrink: 0,
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: accent, fontFamily: 'JetBrains Mono', fontSize: 9.5, fontWeight: 700,
              letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 4,
              padding: 0
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
              </svg>
              EDIT
            </button>
          </div>
        </div>

        {/* SHARE FAB — top right */}
        <button style={{
          position: 'absolute', top: 76, right: 16, zIndex: 10,
          width: 38, height: 38, borderRadius: 99,
          background: 'rgba(12,12,16,0.85)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(245,240,235,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F5F0EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </button>

        {/* TAB BAR — Highlights active */}
        <div style={{
          flexShrink: 0, marginTop: 18,
          background: 'rgba(6,6,8,0.92)', backdropFilter: 'blur(12px)',
          borderTop: '1px solid #1e1e26',
          padding: '0 4px',
          display: 'flex'
        }}>
          {['Highlights', 'Ability', 'Stats', 'Bio'].map((label) =>
          <button key={label} style={{
            background: 'transparent', border: 'none', flex: 1,
            padding: '11px 4px', cursor: 'pointer',
            color: label === 'Highlights' ? accent : '#8888A0',
            fontFamily: 'DM Sans', fontWeight: label === 'Highlights' ? 600 : 500, fontSize: 14,
            borderBottom: label === 'Highlights' ? `2px solid ${accent}` : '2px solid transparent'
          }}>{label}</button>
          )}
        </div>

        {/* BOTTOM NAV (locked) */}
        <div style={{ flexShrink: 0 }}>
          <BottomNav active="me" />
        </div>
      </div>
    </div>);

};

// =================================================================
//  P0b — CHANGE METRICS picker
//  Customization screen for which 3 stats appear on the Highlights card
// =================================================================
const P0bChangeMetrics = ({ accent, onBack }) => {
  // Available abilities — selected in order (1, 2, 3 → max 3)
  const initial = [
  { id: '40yd', name: '40yd Dash', value: '5.08', unit: 'sec', cat: 'SPEED' },
  { id: 'pro', name: 'Pro Agility', value: '4.88', unit: 'sec', cat: 'AGILITY' },
  { id: 'squat', name: 'Squat 1RM', value: '320', unit: 'lbs', cat: 'POWER' },
  { id: 'broad', name: 'Broad Jump', value: '88', unit: 'in', cat: 'POWER' },
  { id: 'bat', name: 'Bat Swing Speed', value: '80', unit: 'mph', cat: 'POWER' },
  { id: 'vert', name: 'Vertical Jump', value: '34', unit: 'in', cat: 'POWER' },
  { id: 'velo', name: 'Throw Velocity', value: '58', unit: 'mph', cat: 'POWER' },
  { id: 'bench', name: 'Bench 1RM', value: '245', unit: 'lbs', cat: 'POWER' },
  { id: 'mile', name: '1mi Run', value: '5:42', unit: '', cat: 'ENDURANCE' }];

  const [selected, setSelected] = useStateP(['40yd', 'pro', 'squat']); // ordered
  const [showOvr, setShowOvr] = useStateP(true);
  const [bumpKey, setBumpKey] = useStateP(0);

  const toggle = (id) => {
    setSelected((curr) => {
      if (curr.includes(id)) return curr.filter((x) => x !== id);
      if (curr.length >= 3) return [...curr.slice(1), id];
      return [...curr, id];
    });
    setBumpKey((k) => k + 1);
  };

  const indexOf = (id) => selected.indexOf(id);
  const orderGlyph = (i) => ['①', '②', '③'][i];
  const sel = selected.map((id) => initial.find((a) => a.id === id));

  return (
    <div style={{
      width: '100%', height: '100%', background: '#060608', color: '#F5F0EB',
      fontFamily: 'DM Sans', display: 'flex', flexDirection: 'column', minHeight: 0
    }}>
      {/* HEADER */}
      <div style={{
        flexShrink: 0, padding: '14px 16px 12px',
        display: 'flex', alignItems: 'center', gap: 12,
        borderBottom: '1px solid #1e1e26'
      }}>
        <button onClick={onBack} style={{
          background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
          display: 'flex', alignItems: 'center', gap: 6,
          color: accent, fontFamily: 'DM Sans', fontWeight: 600, fontSize: 13
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back
        </button>
        <div style={{ flex: 1 }}></div>
      </div>
      <div style={{ padding: '14px 16px 4px' }}>
        <div style={{
          fontFamily: 'Oswald', fontWeight: 700, fontSize: 30, color: '#F5F0EB',
          letterSpacing: '-0.01em', lineHeight: 1
        }}>
          CHANGE <span style={{ color: accent }}>METRICS</span>
        </div>
        <div style={{ fontSize: 12.5, color: '#8888A0', marginTop: 6, lineHeight: 1.4 }}>
          Choose up to <strong style={{ color: '#F5F0EB', fontWeight: 700 }}>3 stats</strong> to feature on your public Highlights card.
        </div>
      </div>

      {/* SCROLL */}
      <div className="no-scrollbar" style={{
        flex: '1 1 0', minHeight: 0, overflowY: 'auto', overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch', paddingBottom: 12
      }}>
        {/* PREVIEW CARD */}
        <div style={{ padding: '14px 14px 0' }}>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9.5, fontWeight: 700, color: '#8888A0', letterSpacing: '0.12em', marginBottom: 8 }}>PREVIEW</div>
          <div key={bumpKey} style={{
            position: 'relative', borderRadius: 12, overflow: 'hidden',
            height: 200,
            background: '#0c0c10', border: '1px solid #1e1e26'
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: `url(${HERO_PHOTO})`,
              backgroundSize: 'cover', backgroundPosition: 'center 30%',
              filter: 'contrast(1.05) saturate(0.9) brightness(0.7)'
            }}></div>
            <div style={{
              position: 'absolute', inset: 0,
              background: `linear-gradient(180deg, rgba(6,6,8,0.55) 0%, transparent 40%, ${_rgba(accent, 0.45)} 100%)`
            }}></div>
            <div style={{ position: 'relative', zIndex: 2, padding: '12px 14px', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 18, color: '#F5F0EB', letterSpacing: '-0.01em', lineHeight: 0.95 }}>BEN WHITESIDES</div>
              <div style={{ flex: 1 }}></div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
                  {sel.map((s, i) => s &&
                  <div key={s.id}>
                      <div style={{
                      fontFamily: 'Oswald', fontWeight: 700,
                      fontSize: i === 0 ? 44 : 26,
                      color: '#F5F0EB', fontStyle: 'italic', letterSpacing: '-0.03em',
                      lineHeight: 0.85, textShadow: '0 2px 12px rgba(0,0,0,0.6)'
                    }}>{s.value}</div>
                      <div style={{ marginTop: 3, fontFamily: 'JetBrains Mono', fontSize: 7.5, fontWeight: 700, color: 'rgba(245,240,235,0.85)', letterSpacing: '0.06em' }}>
                        {s.unit && <span style={{ opacity: 0.7 }}>{s.unit.toUpperCase()} </span>}{s.name.toUpperCase()}
                      </div>
                    </div>
                  )}
                </div>
                {showOvr &&
                <div style={{
                  flexShrink: 0,
                  padding: '6px 8px 5px', borderRadius: 6,
                  background: `linear-gradient(155deg, ${accent} 0%, ${_rgba(accent, 0.7)} 100%)`,
                  border: `1px solid ${_rgba(accent, 0.9)}`,
                  boxShadow: `0 3px 12px ${_rgba(accent, 0.4)}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#0a0a0a'
                }}>
                    <span style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 22, lineHeight: 1, fontStyle: 'italic' }}>84</span>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 7, fontWeight: 700, letterSpacing: '0.1em' }}>OVR · QB</span>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>

        {/* OVR TOGGLE */}
        <div style={{ padding: '16px 14px 0' }}>
          <button onClick={() => setShowOvr((v) => !v)} style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '13px 14px', background: '#0c0c10', border: '1px solid #1e1e26',
            borderRadius: 10, cursor: 'pointer'
          }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: 13.5, color: '#F5F0EB' }}>Show OVR Rating on card</div>
              <div style={{ fontSize: 11, color: '#8888A0', marginTop: 2 }}>FIFA-style 84 QB badge</div>
            </div>
            <div style={{
              width: 38, height: 22, borderRadius: 99, position: 'relative',
              background: showOvr ? accent : '#1e1e26',
              transition: 'background 0.15s'
            }}>
              <div style={{
                position: 'absolute', top: 2, left: showOvr ? 18 : 2,
                width: 18, height: 18, borderRadius: 99, background: '#F5F0EB',
                transition: 'left 0.15s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.4)'
              }}></div>
            </div>
          </button>
        </div>

        {/* ABILITIES LIST */}
        <div style={{ padding: '20px 14px 4px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <SectionHead>SELECT ABILITIES · {selected.length}/3</SectionHead>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: accent, letterSpacing: '0.08em', fontWeight: 700 }}>
            ORDERED
          </span>
        </div>
        <div style={{ padding: '4px 14px 14px', display: 'grid', gap: 7 }}>
          {initial.map((a) => {
            const idx = indexOf(a.id);
            const on = idx !== -1;
            return (
              <button key={a.id} onClick={() => toggle(a.id)} style={{
                width: '100%', display: 'grid', gridTemplateColumns: '32px 1fr auto auto', gap: 10,
                alignItems: 'center', padding: '11px 13px',
                background: on ? `${accent}10` : '#0c0c10',
                border: on ? `1.5px solid ${accent}` : '1px solid #1e1e26',
                borderRadius: 10, cursor: 'pointer', textAlign: 'left'
              }}>
                {/* Order badge / radio */}
                {on ?
                <div style={{
                  width: 24, height: 24, borderRadius: 99,
                  background: accent, color: '#000',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Oswald', fontWeight: 700, fontSize: 14
                }}>{idx + 1}</div> :

                <div style={{
                  width: 22, height: 22, borderRadius: 99,
                  border: '1.5px solid #2a2a36'
                }}></div>
                }
                {/* Name + cat */}
                <div>
                  <div style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: 13.5, color: on ? '#F5F0EB' : '#C8C8D0' }}>{a.name}</div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: on ? accent : '#5d5d70', letterSpacing: '0.08em', fontWeight: 700, marginTop: 2 }}>{a.cat}</div>
                </div>
                {/* Value */}
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 18, color: on ? '#F5F0EB' : '#8888A0', fontStyle: 'italic' }}>{a.value}</span>
                  {a.unit && <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: '#5d5d70', marginLeft: 3 }}>{a.unit}</span>}
                </div>
                {/* Chevron */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={on ? accent : '#3a3a48'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>);

          })}
        </div>
      </div>

      {/* SAVE CTA */}
      <div style={{
        flexShrink: 0, padding: '12px 14px 14px',
        background: '#060608', borderTop: '1px solid #1e1e26'
      }}>
        <button style={{
          width: '100%', padding: '14px', borderRadius: 10,
          background: '#F7941E', border: 'none', cursor: 'pointer',
          fontFamily: 'Oswald', fontWeight: 700, fontSize: 16, color: '#000',
          letterSpacing: '0.05em'
        }}>SAVE METRICS</button>
      </div>
    </div>);

};

Object.assign(window, { P0Highlights, P0bChangeMetrics, P1Bio, P2Ability, P3Stats, P4Velocity, P5StatsGame });