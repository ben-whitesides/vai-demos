/* global React, IconClose, IconArrowUp, IconSparkles, IconChevR,
   IconUsers, IconCalendar, IconChat, IconShield, IconActivity, IconHome, IconChart, IconDollar, IconTrophy, IconWhistle, IconSearch, IconBell, IconWallet */

const { useState: useStateF6 } = React;

// =================================================================
//  Shared GAMEDAY chrome — inlined here so this file is self-contained
// =================================================================
const GamedayTopbar = ({ breadcrumb }) => (
  <div style={{
    height: 56, flexShrink: 0,
    borderBottom: '1px solid #1e1e26', background: 'rgba(6,6,8,0.85)', backdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 24px', fontFamily: 'DM Sans',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
      {breadcrumb.map((b, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span style={{ color: '#4d4d60' }}>›</span>}
          <span style={{
            color: i === breadcrumb.length - 1 ? '#F5F0EB' : '#8888A0',
            fontWeight: i === breadcrumb.length - 1 ? 600 : 500,
          }}>{b}</span>
        </React.Fragment>
      ))}
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, color: '#C8C8D0' }}>
      <div style={{
        background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 8,
        padding: '7px 12px', display: 'flex', alignItems: 'center', gap: 8,
        width: 220, fontSize: 12.5,
      }}>
        <IconSearch size={14} color="#8888A0" />
        <span style={{ color: '#8888A0' }}>Search…</span>
        <span style={{ marginLeft: 'auto', fontFamily: 'JetBrains Mono', fontSize: 9.5, color: '#4d4d60', border: '1px solid #1e1e26', padding: '1px 5px', borderRadius: 4 }}>⌘K</span>
      </div>
      <div style={{ position: 'relative', cursor: 'pointer' }}>
        <IconBell size={17} />
        <span style={{ position: 'absolute', top: -2, right: -2, width: 7, height: 7, borderRadius: 99, background: '#FF6B6B', border: '1.5px solid #060608' }}></span>
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 7, padding: '5px 11px 5px 8px',
        background: '#051A10', border: '1px solid #0D4A28', borderRadius: 999,
        fontFamily: 'JetBrains Mono', fontSize: 10.5, fontWeight: 600, color: '#34D399',
        letterSpacing: '0.08em',
      }}>
        <span className="avanti-dot" style={{ width: 6, height: 6 }}></span>
        AVANTI ON
      </div>
      <div style={{
        width: 32, height: 32, borderRadius: 999, background: '#F7941E',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Oswald', fontWeight: 700, fontSize: 14, color: '#000',
      }}>A</div>
    </div>
  </div>
);

const GamedayAvantiStrip = ({ rows }) => (
  <div style={{ flexShrink: 0, padding: '12px 24px', borderBottom: '1px solid #1e1e26', background: 'linear-gradient(180deg, rgba(52,211,153,0.04), transparent)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
      <div style={{
        width: 22, height: 22, borderRadius: 999,
        background: 'radial-gradient(circle, rgba(52,211,153,0.5) 0%, rgba(52,211,153,0.12) 60%, transparent 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid #0D4A28',
      }}>
        <span className="avanti-dot" style={{ width: 6, height: 6 }}></span>
      </div>
      <span style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 13, color: '#34D399', letterSpacing: '0.08em' }}>AVANTI</span>
      <span className="mono-label" style={{ fontSize: 9 }}>READS · NEVER ACTS WITHOUT YOUR CONFIRMATION</span>
    </div>
    <div style={{ display: 'grid', gap: 8 }}>
      {rows.map((r, i) => {
        const c = r.kind === 'red' ? '#FF6B6B' : r.kind === 'yellow' ? '#FBBF24' : '#34D399';
        const bg = r.kind === 'red' ? '#1A0808' : r.kind === 'yellow' ? '#1A1000' : '#051A10';
        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '9px 12px', background: bg, border: `1px solid ${c}30`, borderRadius: 8,
            fontSize: 13, color: '#C8C8D0',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 99, background: c, flexShrink: 0 }}></span>
            <span style={{ flex: 1 }}>{r.text}</span>
            {r.tags && r.tags.map(t => (
              <span key={t} style={{ fontFamily: 'JetBrains Mono', fontSize: 9, fontWeight: 700, color: c, letterSpacing: '0.08em', background: 'rgba(0,0,0,0.3)', padding: '3px 7px', borderRadius: 4, border: `1px solid ${c}40` }}>{t}</span>
            ))}
            {r.cta && (
              <button style={{ background: c === '#34D399' ? 'transparent' : c, border: c === '#34D399' ? `1px solid ${c}` : 'none', color: c === '#34D399' ? c : '#000', padding: '6px 11px', borderRadius: 6, fontFamily: 'DM Sans', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>{r.cta}</button>
            )}
          </div>
        );
      })}
    </div>
  </div>
);

const ActionCard = ({ kind = 'green', label, tags = [], title, body, ctaLabel, ctaKind }) => {
  const c = kind === 'red' ? '#FF6B6B' : kind === 'yellow' ? '#FBBF24' : '#34D399';
  const bg = kind === 'red' ? '#1A0808' : kind === 'yellow' ? '#1A1000' : '#051A10';
  const ctaBg = ctaKind === 'red' ? '#FF6B6B' : ctaKind === 'orange' ? '#F7941E' : '#34D399';
  return (
    <div style={{
      background: bg, border: `1px solid ${c}30`, borderRadius: 10,
      padding: '13px 14px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ width: 6, height: 6, borderRadius: 99, background: c }}></span>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, fontWeight: 700, color: c, letterSpacing: '0.1em' }}>{label}</span>
        <div style={{ flex: 1 }}></div>
        {tags.map(t => (
          <span key={t} style={{ fontFamily: 'JetBrains Mono', fontSize: 8.5, fontWeight: 600, color: '#8888A0', letterSpacing: '0.08em' }}>{t}</span>
        ))}
      </div>
      {title && <div style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 14, color: '#F5F0EB', marginBottom: 5 }}>{title}</div>}
      <div style={{ fontSize: 12.5, color: '#C8C8D0', lineHeight: 1.5 }}>{body}</div>
      {ctaLabel && (
        <button style={{
          marginTop: 10, background: ctaBg, color: '#000', border: 'none',
          padding: '7px 12px', borderRadius: 6, fontFamily: 'DM Sans', fontWeight: 600, fontSize: 12, cursor: 'pointer',
        }}>{ctaLabel}</button>
      )}
    </div>
  );
};

// =================================================================
//  CONCEPT 1 — AVANTI Flagship Floating Pill
//  - Large 180x52 pill, breathing radial rings, click → right panel
// =================================================================
const FlagshipPill = ({ active = true, count = 4, onClick }) => (
  <div style={{
    position: 'absolute', bottom: 24, right: 24, zIndex: 6,
    width: 196, height: 64,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    pointerEvents: 'none',
  }}>
    {/* Radial rings — sit behind pill */}
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <span className="flagship-ring r1"></span>
      <span className="flagship-ring r2"></span>
      {active && <span className="flagship-ring r3"></span>}
      {active && <span className="flagship-ring r4"></span>}
    </div>
    {/* The pill */}
    <button
      onClick={onClick}
      className={'flagship-pill' + (active ? ' active' : '')}
      style={{
        position: 'relative', zIndex: 1, pointerEvents: 'auto',
        width: 184, height: 56, borderRadius: 999, border: 'none',
        background: 'linear-gradient(180deg, #4DDFA8 0%, #34D399 60%, #2BB587 100%)',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 11,
      }}>
      {/* Inner sparkles glyph */}
      <div style={{
        width: 28, height: 28, borderRadius: 999,
        background: 'rgba(0,0,0,0.18)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <IconSparkles size={16} stroke="#000" strokeWidth={2.2} />
      </div>
      <span style={{
        fontFamily: 'Oswald', fontWeight: 700, fontSize: 19, color: '#000',
        letterSpacing: '0.14em',
      }}>AVANTI</span>
      {/* Live status dot */}
      <span style={{
        width: 7, height: 7, borderRadius: 999, background: '#000',
        opacity: 0.75, boxShadow: '0 0 6px #000',
      }}></span>

      {/* Pending insight badge */}
      {count > 0 && (
        <span style={{
          position: 'absolute', top: -6, right: -6,
          minWidth: 26, height: 26, padding: '0 7px',
          background: '#F7941E', color: '#000', borderRadius: 999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'JetBrains Mono', fontSize: 11.5, fontWeight: 700,
          border: '2px solid #060608',
          boxShadow: '0 4px 12px -2px rgba(247,148,30,0.5)',
        }}>{count}</span>
      )}
    </button>
  </div>
);

// =================================================================
//  AVANTI Right-Side Slide-In Panel (replaces the bottom-sheet model
//  for the GAMEDAY web context — works alongside the flagship pill)
// =================================================================
const AvantiRightPanel = ({ onClose, scope = 'club', subject }) => {
  const isAthlete = scope === 'athlete';
  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, zIndex: 8,
        background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)',
      }}></div>
      <div className="avanti-panel-slide" style={{
        position: 'absolute', right: 0, top: 0, bottom: 0,
        width: 420, zIndex: 9,
        background: '#0c0c10', borderLeft: '1px solid #1e1e26',
        display: 'flex', flexDirection: 'column',
        boxShadow: '-20px 0 60px -10px rgba(0,0,0,0.7)',
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 20px', borderBottom: '1px solid #1e1e26',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 999,
            background: 'radial-gradient(circle, rgba(52,211,153,0.4) 0%, rgba(52,211,153,0.1) 60%, transparent 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid #0D4A28',
          }}>
            <span className="avanti-dot lg"></span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 17, color: '#34D399', letterSpacing: '0.04em' }}>AVANTI</div>
            <div className="mono-label" style={{ marginTop: 2, fontSize: 9 }}>
              {isAthlete ? `ATHLETE CONTEXT · ${(subject || 'MARCUS RIVERA').toUpperCase()}` : 'VAI FC NORTH · CLUB CONTEXT'}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#8888A0', cursor: 'pointer', padding: 6 }}>
            <IconClose size={18} />
          </button>
        </div>

        {/* Body — scrolls */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px' }} className="no-scrollbar">
          {!isAthlete && (
            <>
              <div className="mono-label" style={{ marginBottom: 8 }}>QUICK ACTIONS</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                {['Saturday lineup', 'Roster risk', 'Send reminder', 'Game-day brief'].map(q => (
                  <button key={q} style={{
                    background: '#141418', border: '1px solid #1e1e26', color: '#F5F0EB',
                    borderRadius: 8, padding: '11px 12px', textAlign: 'left',
                    fontFamily: 'DM Sans', fontSize: 12.5, fontWeight: 500, cursor: 'pointer',
                  }}>{q} →</button>
                ))}
              </div>
              <div style={{ display: 'grid', gap: 10 }}>
                <ActionCard kind="red" label="URGENT" tags={['ACTION']} title="Mia Rodriguez · PLAY blocked"
                  body="Payment 4 days overdue. Cannot play Saturday. Notify parent now?"
                  ctaLabel="Notify parent" ctaKind="red" />
                <ActionCard kind="yellow" label="CONFIRM NEEDED"
                  body={<><strong style={{ color: '#F5F0EB', fontWeight: 600 }}>3 families overdue</strong> on Spring dues — total $470. Prepare reminder?</>}
                  ctaLabel="Prepare reminder" ctaKind="orange" />
                <ActionCard kind="green" label="READ-ONLY"
                  body={<>Saturday vs Salt Lake Storm — <strong style={{ color: '#F5F0EB', fontWeight: 600 }}>16 of 16 GREEN</strong>. Lineup looks healthy.</>} />
              </div>
            </>
          )}
          {isAthlete && (
            <>
              {/* Athlete head */}
              <div style={{
                background: '#141418', border: '1px solid #1e1e26', borderRadius: 10,
                padding: '14px', marginBottom: 14, display: 'flex', gap: 12, alignItems: 'center',
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 99, background: '#1a1a20', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Oswald', fontWeight: 700, fontSize: 16, color: '#F7941E',
                }}>{(subject || 'MR').split(' ').map(s => s[0]).slice(0, 2).join('')}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 16, color: '#F5F0EB' }}>{subject || 'Marcus Rivera'}</div>
                  <div className="mono-label" style={{ marginTop: 2 }}>QB1 · #12 · SR</div>
                </div>
                <span style={{
                  fontFamily: 'JetBrains Mono', fontSize: 9, fontWeight: 700, color: '#34D399',
                  background: '#051A10', border: '1px solid #0D4A28', padding: '4px 9px',
                  borderRadius: 999, letterSpacing: '0.08em',
                }}>● PLAY: GREEN</span>
              </div>
              <div style={{ display: 'grid', gap: 10 }}>
                <ActionCard kind="green" label="READINESS" tags={['BIO']}
                  body={<>Recovery <strong style={{ color: '#F5F0EB', fontWeight: 600 }}>87/100</strong> · cleared for full reps. Last 3 sessions all green.</>} />
                <ActionCard kind="green" label="COMPLIANCE"
                  body="Waivers signed · physical current · SafeSport up to date." />
                <ActionCard kind="yellow" label="WATCH"
                  body={<>Throwing volume <strong style={{ color: '#F5F0EB', fontWeight: 600 }}>+22%</strong> over 14-day baseline. Consider scaling Saturday warmup.</>}
                  ctaLabel="Suggest warmup" ctaKind="orange" />
              </div>
            </>
          )}
        </div>

        {/* Composer */}
        <div style={{ padding: '14px 18px', borderTop: '1px solid #1e1e26', background: '#0a0a0e' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#141418', border: '1px solid #1e1e26', borderRadius: 999, padding: '8px 14px' }}>
              <input placeholder={isAthlete ? `Ask AVANTI about ${subject || 'Marcus'}…` : 'Ask AVANTI about VAI FC North…'} style={{ background: 'transparent', border: 'none', outline: 'none', color: '#F5F0EB', flex: 1, fontFamily: 'DM Sans', fontSize: 13 }} />
            </div>
            <button style={{ width: 36, height: 36, borderRadius: 999, background: '#F7941E', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <IconArrowUp size={16} stroke="#000" strokeWidth={2} />
            </button>
          </div>
          <div style={{ marginTop: 9, fontFamily: 'JetBrains Mono', fontSize: 9, color: '#4d4d60', letterSpacing: '0.06em', textAlign: 'center' }}>
            READS DATA · NEVER ACTS WITHOUT YOUR CONFIRMATION
          </div>
        </div>
      </div>
    </>
  );
};

// =================================================================
//  CONCEPT 2 — Formation / Depth Chart View
// =================================================================

// Football 4-3-3-style positions (top-down, offense)
// (x, y) percentages on the field
const FORMATIONS = {
  football: {
    label: 'I-Form 11 Personnel',
    options: ['I-Form 11', 'Spread 10', 'Pistol 21'],
    positions: [
      { id: 'WR1', label: 'WR', x: 8,  y: 78, depth: ['Tyrese James #84', 'Marcus Lin #89'] },
      { id: 'LT',  label: 'LT', x: 28, y: 72, depth: ['Big A. Cole #74'] },
      { id: 'LG',  label: 'LG', x: 38, y: 70, depth: ['Pat Reyes #66'] },
      { id: 'C',   label: 'C',  x: 50, y: 70, depth: ['Sam Q. #58'] },
      { id: 'RG',  label: 'RG', x: 62, y: 70, depth: ['Will K. #67'] },
      { id: 'RT',  label: 'RT', x: 72, y: 72, depth: ['T. Brown #76'] },
      { id: 'TE',  label: 'TE', x: 80, y: 70, depth: ['Caleb F. #87', 'M. Diaz #82'] },
      { id: 'WR2', label: 'WR', x: 92, y: 78, depth: ['Jay Park #11', 'A. Hayes #17'] },
      { id: 'QB',  label: 'QB', x: 50, y: 56, depth: ['Marcus Rivera #12', 'Jordan Lee #7'], starter: true, play: 'green', recovery: 87 },
      { id: 'RB',  label: 'RB', x: 50, y: 38, depth: ['Devin Hill #22', 'C. Strickland #28'] },
      { id: 'FB',  label: 'FB', x: 38, y: 46, depth: ['Hank P. #34'] },
    ],
    bench: [
      { name: 'Jordan Lee', pos: 'QB2', play: 'green' },
      { name: 'C. Strickland', pos: 'RB2', play: 'yellow' },
      { name: 'Marcus Lin', pos: 'WR3', play: 'green' },
      { name: 'A. Hayes', pos: 'WR4', play: 'green' },
      { name: 'M. Diaz', pos: 'TE2', play: 'red' },
      { name: 'B. Tate', pos: 'OL', play: 'green' },
    ],
  },
  soccer: {
    label: '4-3-3',
    options: ['4-3-3', '3-5-2', '4-4-2'],
    positions: [
      { id: 'GK',  label: 'GK',  x: 50, y: 90, depth: ['L. Park #1', 'D. Cho #22'] },
      { id: 'LB',  label: 'LB',  x: 18, y: 70, depth: ['F. Ahmed #3'] },
      { id: 'CB1', label: 'CB',  x: 38, y: 72, depth: ['T. Cruz #5'] },
      { id: 'CB2', label: 'CB',  x: 62, y: 72, depth: ['J. Park #4'] },
      { id: 'RB',  label: 'RB',  x: 82, y: 70, depth: ['M. Lopez #2'] },
      { id: 'CDM', label: 'CDM', x: 50, y: 52, depth: ['R. Vega #8'] },
      { id: 'LM',  label: 'CM',  x: 30, y: 44, depth: ['I. Yong #10'] },
      { id: 'RM',  label: 'CM',  x: 70, y: 44, depth: ['S. Boateng #6'] },
      { id: 'LW',  label: 'LW',  x: 18, y: 24, depth: ['K. Mensah #11'] },
      { id: 'ST',  label: 'ST',  x: 50, y: 16, depth: ['Marcus Rivera #9', 'D. Hugo #19'], starter: true, play: 'green', recovery: 87 },
      { id: 'RW',  label: 'RW',  x: 82, y: 24, depth: ['F. Costa #7'] },
    ],
    bench: [
      { name: 'D. Cho', pos: 'GK2', play: 'green' },
      { name: 'D. Hugo', pos: 'ST2', play: 'yellow' },
      { name: 'A. Reyes', pos: 'CM', play: 'green' },
      { name: 'B. Sims', pos: 'CB', play: 'red' },
      { name: 'T. Long', pos: 'WIN', play: 'green' },
    ],
  },
  basketball: {
    label: 'Starting 5',
    options: ['Starting 5', 'Small Ball', 'Big'],
    positions: [
      { id: 'PG', label: 'PG', x: 50, y: 78, depth: ['Marcus Rivera #3', 'A. Khan #11'], starter: true, play: 'green', recovery: 87 },
      { id: 'SG', label: 'SG', x: 22, y: 60, depth: ['T. Boyd #5'] },
      { id: 'SF', label: 'SF', x: 78, y: 60, depth: ['J. Cole #12'] },
      { id: 'PF', label: 'PF', x: 32, y: 30, depth: ['B. Reed #21'] },
      { id: 'C',  label: 'C',  x: 68, y: 30, depth: ['M. Pierce #34'] },
    ],
    bench: [
      { name: 'A. Khan', pos: 'PG2', play: 'green' },
      { name: 'D. Lee', pos: 'SG2', play: 'green' },
      { name: 'R. Smith', pos: 'F', play: 'yellow' },
      { name: 'T. Webb', pos: 'C2', play: 'red' },
    ],
  },
};

// Force a couple of red/yellow on the football roster for AVANTI strip drama
const PLAY_OVERRIDES = {
  TE: 'red',     // Caleb F. → blocked
  WR2: 'red',    // Jay Park → blocked
  RB: 'yellow',  // Devin Hill → questionable
  FB: 'yellow',
};

// Position marker
const PositionMarker = ({ p, sport, onClick }) => {
  const play = p.play || PLAY_OVERRIDES[p.id] || 'green';
  const playColor = play === 'red' ? '#FF6B6B' : play === 'yellow' ? '#FBBF24' : '#34D399';
  const starter = p.depth[0];
  const depthCount = p.depth.length;
  return (
    <div onClick={() => onClick && onClick(p, starter)} style={{
      position: 'absolute',
      left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%, -50%)',
      cursor: 'pointer', zIndex: 3,
    }}>
      {/* Wearable ring + position chip */}
      <div style={{ position: 'relative', width: 64, height: 64, margin: '0 auto' }}>
        {/* Recovery ring (only on starter QB-equivalent here) */}
        {p.recovery && (
          <svg width="64" height="64" viewBox="0 0 64 64" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
            <circle cx="32" cy="32" r="29" stroke="#1a1a20" strokeWidth="3" fill="none" />
            <circle cx="32" cy="32" r="29" stroke="#34D399" strokeWidth="3" fill="none"
              strokeDasharray={`${(p.recovery / 100) * 182} 182`} strokeLinecap="round" />
          </svg>
        )}
        {/* Position chip */}
        <div style={{
          position: 'absolute', inset: p.recovery ? 6 : 4,
          borderRadius: 999,
          background: '#0c0c10',
          border: `2px solid ${playColor}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: 1,
          boxShadow: `0 0 18px -4px ${playColor}80, 0 6px 16px -4px rgba(0,0,0,0.6)`,
        }}>
          <span style={{
            fontFamily: 'Oswald', fontWeight: 700, fontSize: 13.5, color: '#F5F0EB',
            letterSpacing: '0.04em', lineHeight: 1,
          }}>{p.label}</span>
          {p.recovery && (
            <span style={{
              fontFamily: 'JetBrains Mono', fontSize: 8, fontWeight: 600, color: '#34D399',
              letterSpacing: '0.05em', lineHeight: 1,
            }}>{p.recovery}</span>
          )}
        </div>
        {/* PLAY dot */}
        <div style={{
          position: 'absolute', top: -2, right: -2,
          width: 12, height: 12, borderRadius: 999, background: playColor,
          border: '2px solid #060608',
          boxShadow: `0 0 8px ${playColor}`,
        }}></div>
      </div>
      {/* Athlete name + depth */}
      <div style={{ marginTop: 6, textAlign: 'center', minWidth: 96 }}>
        <div style={{
          fontFamily: 'DM Sans', fontWeight: 600, fontSize: 11.5, color: '#F5F0EB',
          lineHeight: 1.2, whiteSpace: 'nowrap',
        }}>{starter}</div>
        {depthCount > 1 && (
          <div style={{
            fontFamily: 'JetBrains Mono', fontSize: 8.5, color: '#8888A0',
            letterSpacing: '0.05em', marginTop: 2,
          }}>+{depthCount - 1} DEPTH</div>
        )}
      </div>
    </div>
  );
};

// Field background — sport-specific
const FieldBackground = ({ sport }) => {
  if (sport === 'football') {
    return (
      <>
        {/* End zones + yard lines */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '12%', background: 'linear-gradient(180deg, rgba(247,148,30,0.18), rgba(247,148,30,0.05))', borderBottom: '1px solid rgba(247,148,30,0.35)' }}></div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '12%', background: 'linear-gradient(0deg, rgba(247,148,30,0.18), rgba(247,148,30,0.05))', borderTop: '1px solid rgba(247,148,30,0.35)' }}></div>
        {[20, 30, 40, 50, 60, 70, 80].map(y => (
          <div key={y} style={{
            position: 'absolute', left: 0, right: 0, top: `${y}%`, height: 1,
            background: y === 50 ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.06)',
          }}>
            {y % 10 === 0 && (
              <span style={{
                position: 'absolute', left: 14, top: -8,
                fontFamily: 'Oswald', fontWeight: 700, fontSize: 12, color: 'rgba(255,255,255,0.16)',
                letterSpacing: '0.05em',
              }}>{y === 50 ? '50' : Math.abs(50 - y)}</span>
            )}
          </div>
        ))}
        {/* Hash marks */}
        {[...Array(20)].map((_, i) => (
          <React.Fragment key={i}>
            <div style={{ position: 'absolute', left: '32%', top: `${10 + i * 4}%`, width: 8, height: 1, background: 'rgba(255,255,255,0.08)' }}></div>
            <div style={{ position: 'absolute', left: '68%', top: `${10 + i * 4}%`, width: 8, height: 1, background: 'rgba(255,255,255,0.08)' }}></div>
          </React.Fragment>
        ))}
      </>
    );
  }
  if (sport === 'soccer') {
    return (
      <>
        {/* Center line + circle */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 1, background: 'rgba(255,255,255,0.18)' }}></div>
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: 110, height: 110, borderRadius: 999, border: '1px solid rgba(255,255,255,0.18)' }}></div>
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: 6, height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.4)' }}></div>
        {/* Penalty boxes */}
        <div style={{ position: 'absolute', top: 0, left: '22%', right: '22%', height: '14%', borderLeft: '1px solid rgba(255,255,255,0.18)', borderRight: '1px solid rgba(255,255,255,0.18)', borderBottom: '1px solid rgba(255,255,255,0.18)' }}></div>
        <div style={{ position: 'absolute', bottom: 0, left: '22%', right: '22%', height: '14%', borderLeft: '1px solid rgba(255,255,255,0.18)', borderRight: '1px solid rgba(255,255,255,0.18)', borderTop: '1px solid rgba(255,255,255,0.18)' }}></div>
        <div style={{ position: 'absolute', top: 0, left: '34%', right: '34%', height: '5%', borderLeft: '1px solid rgba(255,255,255,0.18)', borderRight: '1px solid rgba(255,255,255,0.18)', borderBottom: '1px solid rgba(255,255,255,0.18)' }}></div>
        <div style={{ position: 'absolute', bottom: 0, left: '34%', right: '34%', height: '5%', borderLeft: '1px solid rgba(255,255,255,0.18)', borderRight: '1px solid rgba(255,255,255,0.18)', borderTop: '1px solid rgba(255,255,255,0.18)' }}></div>
        {/* Vertical pitch stripes */}
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute', top: 0, bottom: 0, left: `${(i / 8) * 100}%`, width: '12.5%',
            background: i % 2 === 0 ? 'rgba(52,211,153,0.025)' : 'transparent',
          }}></div>
        ))}
      </>
    );
  }
  // basketball — half court
  return (
    <>
      {/* Half court line */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 1, background: 'rgba(255,255,255,0.18)' }}></div>
      <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: 90, height: 90, borderRadius: 999, border: '1px solid rgba(255,255,255,0.16)' }}></div>
      {/* 3pt arc top */}
      <div style={{ position: 'absolute', top: '0', left: '15%', right: '15%', height: '34%', borderBottomLeftRadius: 999, borderBottomRightRadius: 999, border: '1px solid rgba(255,255,255,0.16)', borderTop: 'none' }}></div>
      {/* Key top */}
      <div style={{ position: 'absolute', top: '0', left: '37%', right: '37%', height: '20%', borderLeft: '1px solid rgba(255,255,255,0.18)', borderRight: '1px solid rgba(255,255,255,0.18)', borderBottom: '1px solid rgba(255,255,255,0.18)' }}></div>
      {/* 3pt arc bottom */}
      <div style={{ position: 'absolute', bottom: '0', left: '15%', right: '15%', height: '34%', borderTopLeftRadius: 999, borderTopRightRadius: 999, border: '1px solid rgba(255,255,255,0.16)', borderBottom: 'none' }}></div>
      <div style={{ position: 'absolute', bottom: '0', left: '37%', right: '37%', height: '20%', borderLeft: '1px solid rgba(255,255,255,0.18)', borderRight: '1px solid rgba(255,255,255,0.18)', borderTop: '1px solid rgba(255,255,255,0.18)' }}></div>
    </>
  );
};

const FormationView = ({ onAthleteClick }) => {
  const [sport, setSport] = useStateF6('football');
  const [formationIdx, setFormationIdx] = useStateF6(0);
  const f = FORMATIONS[sport];
  const fieldBg = sport === 'football'
    ? 'linear-gradient(180deg, #08130C 0%, #0A1810 50%, #08130C 100%)'
    : sport === 'soccer'
      ? 'linear-gradient(180deg, #08130C 0%, #0A1A10 50%, #08130C 100%)'
      : 'linear-gradient(180deg, #1A0F08 0%, #1A1208 50%, #1A0F08 100%)';

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '18px 24px 100px', minWidth: 0 }} className="no-scrollbar">
      {/* Sport + Formation control row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
        <div style={{ display: 'flex', background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 8, padding: 3 }}>
          {[
            { id: 'football', label: 'Football' },
            { id: 'soccer', label: 'Soccer' },
            { id: 'basketball', label: 'Basketball' },
          ].map(s => (
            <button key={s.id} onClick={() => { setSport(s.id); setFormationIdx(0); }} style={{
              background: sport === s.id ? '#F7941E' : 'transparent',
              color: sport === s.id ? '#000' : '#C8C8D0',
              border: 'none', padding: '7px 14px', borderRadius: 6, cursor: 'pointer',
              fontFamily: 'DM Sans', fontWeight: 600, fontSize: 12.5,
            }}>{s.label}</button>
          ))}
        </div>
        <div style={{ flex: 1 }}></div>
        <span className="mono-label" style={{ fontSize: 9 }}>FORMATION</span>
        <div style={{ display: 'flex', background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 8, padding: 3 }}>
          {f.options.map((opt, i) => (
            <button key={opt} onClick={() => setFormationIdx(i)} style={{
              background: formationIdx === i ? '#34D399' : 'transparent',
              color: formationIdx === i ? '#000' : '#C8C8D0',
              border: 'none', padding: '7px 12px', borderRadius: 6, cursor: 'pointer',
              fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 11, letterSpacing: '0.05em',
            }}>{opt.toUpperCase()}</button>
          ))}
        </div>
      </div>

      {/* Field */}
      <div style={{
        position: 'relative', width: '100%', height: 560,
        background: fieldBg,
        border: '1px solid #1e1e26', borderRadius: 14, overflow: 'hidden',
        boxShadow: 'inset 0 0 80px -20px rgba(0,0,0,0.7)',
      }}>
        <FieldBackground sport={sport} />
        {/* Sideline labels */}
        <div style={{ position: 'absolute', top: 12, left: 14, fontFamily: 'JetBrains Mono', fontSize: 9.5, fontWeight: 600, color: '#5d5d70', letterSpacing: '0.12em' }}>
          {sport === 'football' ? 'OPP. END ZONE' : sport === 'soccer' ? 'ATTACK →' : 'OPPONENT BASKET'}
        </div>
        <div style={{ position: 'absolute', bottom: 12, left: 14, fontFamily: 'JetBrains Mono', fontSize: 9.5, fontWeight: 600, color: '#5d5d70', letterSpacing: '0.12em' }}>
          {sport === 'football' ? 'OWN END ZONE' : sport === 'soccer' ? '← DEFEND' : 'HOME BASKET'}
        </div>
        <div style={{
          position: 'absolute', top: 12, right: 14,
          fontFamily: 'Oswald', fontWeight: 700, fontSize: 13, color: '#F5F0EB',
          letterSpacing: '0.04em',
          background: 'rgba(0,0,0,0.4)', padding: '4px 10px', borderRadius: 6, border: '1px solid #1e1e26',
        }}>{f.options[formationIdx]}</div>

        {/* Position markers */}
        {f.positions.map(p => (
          <PositionMarker key={p.id} p={p} sport={sport} onClick={onAthleteClick} />
        ))}
      </div>

      {/* Bench / Subs */}
      <div style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
          <span className="mono-label">BENCH · SUBSTITUTES ({f.bench.length})</span>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9.5, color: '#F7941E', letterSpacing: '0.06em', cursor: 'pointer' }}>EDIT DEPTH CHART →</span>
        </div>
        <div style={{
          background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 12,
          padding: '14px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10,
        }}>
          {f.bench.map((b, i) => {
            const c = b.play === 'red' ? '#FF6B6B' : b.play === 'yellow' ? '#FBBF24' : '#34D399';
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', background: '#141418', border: '1px solid #1e1e26',
                borderRadius: 8, cursor: 'pointer',
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 99, background: '#0c0c10',
                  border: `1.5px solid ${c}`, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Oswald', fontWeight: 700, fontSize: 10, color: c, letterSpacing: '0.04em',
                }}>{b.pos}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: 12.5, color: '#F5F0EB', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.name}</div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: c, letterSpacing: '0.06em', marginTop: 2 }}>● {b.play.toUpperCase()}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// =================================================================
//  Updated nav (adds Formation under CLUB OS)
// =================================================================
const FLAGSHIP_NAV = [
  { section: 'CLUB OS', items: [
    { id: 'overview', label: 'Overview', icon: IconHome },
    { id: 'athletes', label: 'Athletes', icon: IconUsers },
    { id: 'play', label: 'PLAY Status', icon: IconActivity },
    { id: 'roster', label: 'Roster', icon: IconUsers },
    { id: 'formation', label: 'Formation', icon: IconShield },
    { id: 'schedule', label: 'Schedule', icon: IconCalendar },
    { id: 'comms', label: 'Comms', icon: IconChat },
    { id: 'compliance', label: 'Compliance', icon: IconShield },
  ]},
  { section: 'LIVE OPS', items: [
    { id: 'tournaments', label: 'Tournaments', icon: IconTrophy },
    { id: 'standings', label: 'Standings', icon: IconChart },
    { id: 'leagues', label: 'Leagues', icon: IconWhistle },
  ]},
  { section: 'MY MENTOR', items: [
    { id: 'sessions', label: 'My Sessions', icon: IconCalendar, badge: '3' },
  ]},
  { section: 'FINANCE', items: [
    { id: 'finances', label: 'Finances', icon: IconDollar },
  ]},
  { section: 'COMING SOON', items: [
    { id: 'fundraising', label: 'Fundraising', icon: IconDollar, dim: true },
    { id: 'payments', label: 'Payments', icon: IconWallet, dim: true },
  ]},
];

const FlagshipSidebar = ({ active = 'formation' }) => (
  <div style={{
    width: 220, flexShrink: 0,
    background: '#0c0c10', borderRight: '1px solid #1e1e26',
    padding: '22px 0 24px', overflowY: 'auto',
    fontFamily: 'DM Sans',
  }} className="no-scrollbar">
    <div style={{ padding: '0 22px 22px', borderBottom: '1px solid #1e1e26', marginBottom: 14 }}>
      <img src="assets/gameday-wordmark.png?v=4" alt="GAMEDAY"
        style={{ display: 'block', background: 'transparent', objectFit: 'contain', width: '155px', height: '22px' }} />
    </div>
    {FLAGSHIP_NAV.map(group => (
      <div key={group.section} style={{ marginBottom: 14 }}>
        <div style={{ padding: '0 22px 8px', fontFamily: 'JetBrains Mono', fontSize: 9.5, fontWeight: 600, letterSpacing: '0.12em', color: '#4d4d60', textTransform: 'uppercase' }}>
          {group.section}
        </div>
        {group.items.map(it => {
          const isActive = active === it.id;
          return (
            <div key={it.id} style={{
              padding: '8px 22px', display: 'flex', alignItems: 'center', gap: 10,
              cursor: 'pointer', position: 'relative',
              color: isActive ? '#F7941E' : it.dim ? '#4d4d60' : '#C8C8D0',
              background: isActive ? 'rgba(247,148,30,0.08)' : 'transparent',
              borderLeft: isActive ? '2px solid #F7941E' : '2px solid transparent',
              fontWeight: isActive ? 600 : 500, fontSize: 13.5,
            }}>
              <it.icon size={15} />
              <span style={{ flex: 1 }}>{it.label}</span>
              {it.badge && (
                <span style={{ background: '#F7941E', color: '#000', fontFamily: 'JetBrains Mono', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 999 }}>{it.badge}</span>
              )}
            </div>
          );
        })}
      </div>
    ))}
  </div>
);

// =================================================================
//  Top-level Concept screens
// =================================================================

// CONCEPT 1: Overview (existing dashboard) but with new flagship pill
const G1FlagshipOverview = () => {
  const [panel, setPanel] = useStateF6(null);
  return (
    <div style={{ display: 'flex', height: '100%', background: '#060608', fontFamily: 'DM Sans', position: 'relative', overflow: 'hidden' }}>
      <FlagshipSidebar active="overview" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>
        <GamedayTopbar breadcrumb={['VAI FC North', 'Overview']} />
        <GamedayAvantiStrip rows={[
          { kind: 'red', text: <><strong style={{ fontWeight: 600 }}>Mia Rodriguez</strong> — payment 4 days overdue, PLAY blocked Saturday.</>, tags: ['URGENT'], cta: 'Notify' },
          { kind: 'yellow', text: <><strong style={{ fontWeight: 600 }}>3 families</strong> overdue on Spring dues — total $470.</>, tags: ['CONFIRM'], cta: 'Prepare reminder' },
          { kind: 'green', text: <><strong style={{ fontWeight: 600 }}>Schedule:</strong> Saturday home game vs Salt Lake Storm. 16 of 16 GREEN.</>, tags: ['CLEAR'] },
        ]} />
        <div style={{ flex: 1, overflowY: 'auto', padding: '22px 24px 110px' }} className="no-scrollbar">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
            {[
              { label: 'TOTAL ATHLETES', value: '16', sub: '14 active · 2 pending', accent: '#F5F0EB' },
              { label: 'SESSIONS THIS WEEK', value: '04', sub: '2 games · 2 practices', accent: '#F5F0EB' },
              { label: 'OPEN SPOTS', value: '03', sub: 'across 2 sessions', accent: '#34D399' },
              { label: 'PENDING DUES', value: '$470', sub: '3 families', accent: '#FBBF24' },
            ].map((c, i) => (
              <div key={i} style={{ background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 12, padding: '16px 18px' }}>
                <div className="mono-label" style={{ marginBottom: 8 }}>{c.label}</div>
                <div style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 36, color: c.accent, lineHeight: 1, letterSpacing: '0.005em' }}>{c.value}</div>
                <div style={{ fontSize: 12, color: '#8888A0', marginTop: 6 }}>{c.sub}</div>
              </div>
            ))}
          </div>
          <div style={{ background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #1e1e26', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 16, color: '#F5F0EB' }}>Recent Activity</div>
              <span className="mono-label">LAST 24H</span>
            </div>
            <div>
              {[
                { time: '11:42', who: 'Mia Rodriguez', action: 'Payment marked OVERDUE', kind: 'red' },
                { time: '10:17', who: 'Kai Tanaka', action: 'Waiver signed', kind: 'green' },
                { time: '09:55', who: 'AVANTI', action: 'Sent reminder to 3 families', kind: 'yellow' },
                { time: '08:30', who: 'Coach Diaz', action: 'Created Saturday lineup', kind: 'green' },
              ].map((row, i) => {
                const c = row.kind === 'red' ? '#FF6B6B' : row.kind === 'yellow' ? '#FBBF24' : '#34D399';
                return (
                  <div key={i} style={{ padding: '12px 18px', borderTop: i ? '1px solid #15151c' : 'none', display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: '#4d4d60', width: 44 }}>{row.time}</span>
                    <span style={{ width: 6, height: 6, borderRadius: 99, background: c }}></span>
                    <span style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 14, color: '#F5F0EB' }}>{row.who}</span>
                    <span style={{ flex: 1, fontSize: 13, color: '#C8C8D0' }}>{row.action}</span>
                    <IconChevR size={14} color="#4d4d60" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <FlagshipPill active={true} count={4} onClick={() => setPanel({ scope: 'club' })} />
        {panel && <AvantiRightPanel onClose={() => setPanel(null)} scope={panel.scope} subject={panel.subject} />}
      </div>
    </div>
  );
};

// CONCEPT 2: Formation screen
const G2Formation = () => {
  const [panel, setPanel] = useStateF6(null);
  return (
    <div style={{ display: 'flex', height: '100%', background: '#060608', fontFamily: 'DM Sans', position: 'relative', overflow: 'hidden' }}>
      <FlagshipSidebar active="formation" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>
        <GamedayTopbar breadcrumb={['VAI FC North', 'Formation']} />
        <GamedayAvantiStrip rows={[
          {
            kind: 'red',
            text: <><strong style={{ fontWeight: 600 }}>2 starters RED</strong> for Saturday — Caleb F. (TE) and Jay Park (WR2). Depth chart shows adjusted lineup below.</>,
            tags: ['LINEUP'], cta: 'View adjustments',
          },
          {
            kind: 'yellow',
            text: <>Devin Hill (RB) flagged YELLOW — recovery 64, throwing volume +18%. Watch Saturday warmup.</>,
            tags: ['WATCH'],
          },
        ]} />
        <FormationView onAthleteClick={(p, starter) => setPanel({ scope: 'athlete', subject: starter.replace(/ #\d+$/, '') })} />
        <FlagshipPill active={true} count={4} onClick={() => setPanel({ scope: 'club' })} />
        {panel && <AvantiRightPanel onClose={() => setPanel(null)} scope={panel.scope} subject={panel.subject} />}
      </div>
    </div>
  );
};

// Idle (no insights) variant of the pill — for comparison artboard
const G3PillStates = () => (
  <div style={{ display: 'flex', height: '100%', background: '#060608', fontFamily: 'DM Sans', position: 'relative', overflow: 'hidden' }}>
    <FlagshipSidebar active="overview" />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>
      <GamedayTopbar breadcrumb={['VAI FC North', 'AVANTI · Pill States']} />
      <div style={{ flex: 1, padding: '32px 24px', overflowY: 'auto' }} className="no-scrollbar">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {[
            { title: 'IDLE', sub: 'No pending insights · slow 3s breath · 2 rings', count: 0, active: false },
            { title: 'ACTIVE', sub: 'Insights pending · faster 2.2s breath · 4 rings · badge', count: 4, active: true },
          ].map((variant, i) => (
            <div key={i} style={{
              position: 'relative', height: 360,
              background: 'radial-gradient(ellipse at bottom right, rgba(52,211,153,0.08), transparent 60%), #0a0a0e',
              border: '1px solid #1e1e26', borderRadius: 14, padding: '18px 20px',
              overflow: 'hidden',
            }}>
              <div style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 13, color: '#F5F0EB', letterSpacing: '0.1em' }}>{variant.title}</div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#8888A0', letterSpacing: '0.05em', marginTop: 4 }}>{variant.sub.toUpperCase()}</div>
              <div style={{ position: 'absolute', bottom: 24, right: 24 }}>
                <div style={{ position: 'relative', width: 196, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                    <span className="flagship-ring r1"></span>
                    <span className="flagship-ring r2"></span>
                    {variant.active && <span className="flagship-ring r3"></span>}
                    {variant.active && <span className="flagship-ring r4"></span>}
                  </div>
                  <button className={'flagship-pill' + (variant.active ? ' active' : '')} style={{
                    position: 'relative', zIndex: 1,
                    width: 184, height: 56, borderRadius: 999, border: 'none',
                    background: 'linear-gradient(180deg, #4DDFA8 0%, #34D399 60%, #2BB587 100%)',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 11,
                  }}>
                    <div style={{ width: 28, height: 28, borderRadius: 999, background: 'rgba(0,0,0,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <IconSparkles size={16} stroke="#000" strokeWidth={2.2} />
                    </div>
                    <span style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 19, color: '#000', letterSpacing: '0.14em' }}>AVANTI</span>
                    <span style={{ width: 7, height: 7, borderRadius: 999, background: '#000', opacity: 0.75 }}></span>
                    {variant.count > 0 && (
                      <span style={{
                        position: 'absolute', top: -6, right: -6,
                        minWidth: 26, height: 26, padding: '0 7px',
                        background: '#F7941E', color: '#000', borderRadius: 999,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'JetBrains Mono', fontSize: 11.5, fontWeight: 700,
                        border: '2px solid #060608',
                      }}>{variant.count}</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Top-level switcher for the design canvas — lets one artboard show all three Group G screens
const G_TABS = [
  { id: 'overview', label: 'G1 · Overview + Flagship Pill', Comp: G1FlagshipOverview },
  { id: 'formation', label: 'G2 · Formation / Depth Chart', Comp: G2Formation },
  { id: 'pillstates', label: 'G3 · Pill States (Idle vs Active)', Comp: G3PillStates },
];

const GroupGPrototype = () => {
  const [tab, setTab] = useStateF6('formation');
  const Comp = G_TABS.find(t => t.id === tab).Comp;
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      {/* Tab bar overlay */}
      <div style={{
        position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
        zIndex: 20, display: 'flex', gap: 6,
        background: 'rgba(12,12,16,0.92)', backdropFilter: 'blur(8px)',
        border: '1px solid #1e1e26', borderRadius: 999, padding: 4,
      }}>
        {G_TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: tab === t.id ? '#F7941E' : 'transparent',
            color: tab === t.id ? '#000' : '#C8C8D0',
            border: 'none', padding: '6px 14px', borderRadius: 999, cursor: 'pointer',
            fontFamily: 'DM Sans', fontWeight: 600, fontSize: 11.5,
          }}>{t.label}</button>
        ))}
      </div>
      <Comp />
    </div>
  );
};

Object.assign(window, {
  FlagshipPill, AvantiRightPanel, FormationView, FlagshipSidebar,
  G1FlagshipOverview, G2Formation, G3PillStates, GroupGPrototype,
  GamedayTopbar, GamedayAvantiStrip, ActionCard,
});
