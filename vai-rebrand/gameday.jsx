/* global React, IconClose, IconArrowUp, IconCalendar, IconUsers, IconWallet, IconShield, IconActivity, IconChat, IconSparkles, IconSearch, IconBell, IconHome, IconChart, IconDollar, IconTrophy, IconWhistle, IconChevR */

const { useState: useStateB } = React;

// ============ AVANTI Card (Action Card with colored left-border) ============
const ActionCard = ({ kind = 'green', label, title, body, ctaLabel, ctaKind = 'orange', tags = [] }) => {
  const accent = kind === 'green' ? '#34D399' : kind === 'yellow' ? '#FBBF24' : kind === 'red' ? '#FF6B6B' : '#5577DD';
  const accentBg = kind === 'green' ? '#051A10' : kind === 'yellow' ? '#1A1000' : kind === 'red' ? '#1A0808' : '#0A1020';
  const accentBd = kind === 'green' ? '#0D4A28' : kind === 'yellow' ? '#4A3000' : kind === 'red' ? '#4A1A1A' : '#1A2A50';
  return (
    <div style={{
      background: '#0c0c10', border: '1px solid #1e1e26',
      borderLeft: `3px solid ${accent}`, borderRadius: 10, padding: '14px 14px 14px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        {kind === 'green' && <span className="avanti-dot" style={{ width: 6, height: 6 }}></span>}
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9.5, fontWeight: 600, color: accent, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</div>
        {tags.map((t, i) =>
        <span key={i} style={{
          fontFamily: 'JetBrains Mono', fontSize: 8.5, fontWeight: 600, letterSpacing: '0.08em',
          color: accent, background: accentBg, border: `1px solid ${accentBd}`,
          padding: '2px 7px', borderRadius: 999, textTransform: 'uppercase'
        }}>{t}</span>
        )}
      </div>
      {title && <div style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 16, color: '#F5F0EB', marginBottom: 4, letterSpacing: '0.005em' }}>{title}</div>}
      <div style={{ fontSize: 13.5, color: '#C8C8D0', lineHeight: 1.45, marginBottom: ctaLabel ? 12 : 0 }}>{body}</div>
      {ctaLabel && (
      ctaKind === 'red' ?
      <button style={{ background: '#FF6B6B', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: 8, fontFamily: 'DM Sans', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>{ctaLabel}</button> :
      ctaKind === 'orange' ?
      <button style={{ background: '#F7941E', color: '#000', border: 'none', padding: '9px 16px', borderRadius: 8, fontFamily: 'DM Sans', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>{ctaLabel}</button> :

      <button style={{ background: 'transparent', color: '#F5F0EB', border: '1px solid #1e1e26', padding: '9px 16px', borderRadius: 8, fontFamily: 'DM Sans', fontWeight: 500, fontSize: 13, cursor: 'pointer' }}>{ctaLabel}</button>)

      }
    </div>);

};

// ============ B2 — AVANTI Overlay: Club Context ============
const AvantiOverlayClub = ({ onClose }) =>
<>
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 8 }}></div>
    <div style={{
    position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 9,
    background: '#141418', borderTop: '1px solid #1e1e26', borderRadius: '20px 20px 0 0',
    maxHeight: '78%', overflowY: 'auto', paddingBottom: 18
  }} className="no-scrollbar">
      <div style={{ width: 36, height: 4, borderRadius: 99, background: '#2a2a32', margin: '8px auto 12px' }}></div>
      <div style={{ padding: '0 18px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="avanti-dot lg"></span>
          <div>
            <div style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 18, color: '#34D399', letterSpacing: '0.04em' }}>AVANTI</div>
            <div className="mono-label" style={{ marginTop: 2 }}>VAI FC NORTH · CLUB CONTEXT</div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#8888A0', cursor: 'pointer' }}><IconClose size={18} /></button>
      </div>
      <div style={{ padding: '0 18px 12px' }}>
        <div className="mono-label" style={{ marginBottom: 8 }}>QUICK ACTIONS</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {['Saturday lineup', 'Roster risk', 'Send reminder', 'Game-day brief'].map((q) =>
        <button key={q} style={{
          background: '#1a1a20', border: '1px solid #1e1e26', color: '#F5F0EB',
          borderRadius: 10, padding: '12px', textAlign: 'left',
          fontFamily: 'DM Sans', fontSize: 13, fontWeight: 500, cursor: 'pointer'
        }}>{q} →</button>
        )}
        </div>
      </div>
      <div style={{ padding: '8px 18px 0', display: 'grid', gap: 10 }}>
        <ActionCard kind="red" label="URGENT" tags={['ACTION']} title="Mia Rodriguez — PLAY blocked"
      body="Payment 4 days overdue. She cannot play Saturday. Notify parent now?"
      ctaLabel="Notify Parent" ctaKind="red" />
        <ActionCard kind="yellow" label="CONFIRM NEEDED"
      body={<><strong style={{ color: '#F5F0EB', fontWeight: 600 }}>3 families overdue</strong> on Spring dues — total $470. Prepare a reminder?</>}
      ctaLabel="Prepare reminder" ctaKind="orange" />
        <ActionCard kind="green" label="READ-ONLY · SCHEDULE"
      body={<>2 events this week. Saturday home game vs Salt Lake Storm — <strong style={{ color: '#F5F0EB', fontWeight: 600 }}>16 GREEN of 16 active</strong>.</>} />
      </div>
      <div style={{ padding: '14px 18px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 999, padding: '8px 14px' }}>
          <input placeholder="Ask AVANTI…" style={{ background: 'transparent', border: 'none', outline: 'none', color: '#F5F0EB', flex: 1, fontFamily: 'DM Sans', fontSize: 13 }} />
        </div>
        <button style={{ width: 36, height: 36, borderRadius: 999, background: '#F7941E', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <IconArrowUp size={16} stroke="#000" strokeWidth={2} />
        </button>
      </div>
      <div style={{ padding: '10px 18px 0', textAlign: 'center', fontFamily: 'JetBrains Mono', fontSize: 9, color: '#4d4d60', letterSpacing: '0.05em' }}>
        AVANTI READS DATA · NEVER ACTS WITHOUT YOUR CONFIRMATION
      </div>
    </div>
  </>;


// =========== GAMEDAY web — sidebar / topbar / floating bubble / card feed ============
const GAMEDAY_NAV = [
{ section: 'CLUB OS', items: [
  { id: 'overview', label: 'Overview', icon: IconHome },
  { id: 'athletes', label: 'Athletes', icon: IconUsers },
  { id: 'play', label: 'PLAY Status', icon: IconActivity },
  { id: 'schedule', label: 'Schedule', icon: IconCalendar },
  { id: 'roster', label: 'Roster', icon: IconUsers },
  { id: 'comms', label: 'Comms', icon: IconChat },
  { id: 'compliance', label: 'Compliance', icon: IconShield }]
},
{ section: 'LIVE OPS', items: [
  { id: 'tournaments', label: 'Tournaments', icon: IconTrophy },
  { id: 'standings', label: 'Standings', icon: IconChart },
  { id: 'leagues', label: 'Leagues', icon: IconWhistle }]
},
{ section: 'MY MENTOR', items: [
  { id: 'sessions', label: 'My Sessions', icon: IconCalendar, badge: '3' }]
},
{ section: 'FINANCE', items: [
  { id: 'finances', label: 'Finances', icon: IconDollar }]
},
{ section: 'COMING SOON', items: [
  { id: 'fundraising', label: 'Fundraising', icon: IconDollar, dim: true },
  { id: 'payments', label: 'Payments', icon: IconWallet, dim: true }]
}];


const GamedaySidebar = ({ active = 'overview' }) =>
<div style={{
  width: 220, flexShrink: 0,
  background: '#0c0c10', borderRight: '1px solid #1e1e26',
  padding: '22px 0 24px', overflowY: 'auto',
  fontFamily: 'DM Sans'
}}>
    <div style={{ padding: '0 22px 22px', borderBottom: '1px solid #1e1e26', marginBottom: 14 }}>
      <img src="assets/gameday-wordmark.png?v=4" alt="GAMEDAY"
    style={{ display: 'block', background: 'transparent', objectFit: "contain", width: "155px", height: "22px" }} />
    </div>
    {GAMEDAY_NAV.map((group) =>
  <div key={group.section} style={{ marginBottom: 14 }}>
        <div style={{ padding: '0 22px 8px', fontFamily: 'JetBrains Mono', fontSize: 9.5, fontWeight: 600, letterSpacing: '0.12em', color: '#4d4d60', textTransform: 'uppercase' }}>
          {group.section}
        </div>
        {group.items.map((it) => {
      const isActive = active === it.id;
      return (
        <div key={it.id} style={{
          padding: '8px 22px', display: 'flex', alignItems: 'center', gap: 10,
          cursor: 'pointer', position: 'relative',
          color: isActive ? '#F7941E' : it.dim ? '#4d4d60' : '#C8C8D0',
          background: isActive ? 'rgba(247,148,30,0.08)' : 'transparent',
          borderLeft: isActive ? '2px solid #F7941E' : '2px solid transparent',
          fontWeight: isActive ? 600 : 500, fontSize: 13.5
        }}>
              <it.icon size={15} />
              <span style={{ flex: 1 }}>{it.label}</span>
              {it.badge &&
          <span style={{ background: '#F7941E', color: '#000', fontFamily: 'JetBrains Mono', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 999 }}>{it.badge}</span>
          }
            </div>);

    })}
      </div>
  )}
  </div>;


const GamedayTopbar = ({ breadcrumb = ['VAI FC North', 'Overview'] }) =>
<div style={{
  height: 56, flexShrink: 0,
  borderBottom: '1px solid #1e1e26', background: 'rgba(6,6,8,0.85)', backdropFilter: 'blur(8px)',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '0 24px', fontFamily: 'DM Sans'
}}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
      {breadcrumb.map((b, i) =>
    <React.Fragment key={i}>
          <span style={{ color: i === breadcrumb.length - 1 ? '#F5F0EB' : '#8888A0', fontWeight: i === breadcrumb.length - 1 ? 600 : 500 }}>{b}</span>
          {i < breadcrumb.length - 1 && <span style={{ color: '#4d4d60' }}>›</span>}
        </React.Fragment>
    )}
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, color: '#C8C8D0' }}>
      <div style={{
      background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 8,
      padding: '7px 12px', display: 'flex', alignItems: 'center', gap: 8,
      width: 220, fontSize: 12.5
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
      letterSpacing: '0.08em'
    }}>
        <span className="avanti-dot" style={{ width: 6, height: 6 }}></span>
        AVANTI ON
      </div>
      <div style={{
      width: 32, height: 32, borderRadius: 999, background: '#F7941E',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Oswald', fontWeight: 700, fontSize: 14, color: '#000'
    }}>M</div>
    </div>
  </div>;


const GamedayBubble = ({ count = 2 }) =>
<div style={{
  position: 'absolute', bottom: 24, right: 24, zIndex: 5,
  display: 'flex', alignItems: 'center', gap: 10
}}>
    <div style={{
    background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 999,
    padding: '8px 14px', fontFamily: 'DM Sans', fontSize: 12.5, color: '#8888A0'
  }}>Ask AVANTI about this page…</div>
    <button style={{
    width: 52, height: 52, borderRadius: 999, background: '#34D399', border: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
    boxShadow: '0 8px 24px -4px rgba(52,211,153,0.5)', position: 'relative'
  }}>
      <IconSparkles size={22} stroke="#000" strokeWidth={2} />
      {count > 0 &&
    <span style={{
      position: 'absolute', top: -4, right: -4, minWidth: 20, height: 20, padding: '0 5px',
      background: '#F7941E', color: '#000', borderRadius: 999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'JetBrains Mono', fontSize: 10.5, fontWeight: 700,
      border: '2px solid #060608'
    }}>{count}</span>
    }
    </button>
  </div>;


// AVANTI strip for GAMEDAY (full-width)
const GamedayAvantiStrip = ({ rows }) =>
<div style={{
  background: 'rgba(5, 26, 16, 0.18)', borderBottom: '1px solid #15151c',
  padding: '14px 24px'
}}>
    {rows.map((r, i) => {
    const accent = r.kind === 'red' ? '#FF6B6B' : r.kind === 'yellow' ? '#FBBF24' : '#34D399';
    return (
      <div key={i} style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0',
        borderBottom: i < rows.length - 1 ? '1px solid #15151c' : 'none'
      }}>
          <span style={{ width: 7, height: 7, borderRadius: 99, background: accent, boxShadow: `0 0 6px ${accent}80`, flexShrink: 0 }}></span>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9.5, fontWeight: 600, color: accent, letterSpacing: '0.1em' }}>AVANTI</span>
          <span style={{ flex: 1, fontSize: 13.5, color: '#F5F0EB' }}>{r.text}</span>
          {r.tags && r.tags.map((t, j) =>
        <span key={j} style={{
          fontFamily: 'JetBrains Mono', fontSize: 9, fontWeight: 600, letterSpacing: '0.08em',
          color: accent, padding: '3px 8px', borderRadius: 999,
          background: r.kind === 'red' ? '#1A0808' : r.kind === 'yellow' ? '#1A1000' : '#051A10',
          border: `1px solid ${r.kind === 'red' ? '#4A1A1A' : r.kind === 'yellow' ? '#4A3000' : '#0D4A28'}`
        }}>{t}</span>
        )}
          {r.cta &&
        <button style={{
          background: r.kind === 'red' ? '#FF6B6B' : '#F7941E',
          color: r.kind === 'red' ? '#fff' : '#000',
          border: 'none', padding: '6px 12px', borderRadius: 6,
          fontFamily: 'DM Sans', fontWeight: 600, fontSize: 12, cursor: 'pointer'
        }}>{r.cta}</button>
        }
        </div>);

  })}
  </div>;


// ============ B4 main view — AVANTI in GAMEDAY ============
const B4Gameday = () =>
<div style={{ display: 'flex', height: '100%', background: '#060608', fontFamily: 'DM Sans', position: 'relative' }} className="ambient-glow">
    <GamedaySidebar active="overview" />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative', zIndex: 1 }}>
      <GamedayTopbar breadcrumb={['VAI FC North', 'Overview']} />
      <GamedayAvantiStrip rows={[
    { kind: 'red', text: <><strong style={{ fontWeight: 600 }}>Mia Rodriguez</strong> — payment 4 days overdue, PLAY blocked Saturday.</>, tags: ['URGENT'], cta: 'Notify' },
    { kind: 'yellow', text: <><strong style={{ fontWeight: 600 }}>3 families</strong> overdue on Spring dues — total $470.</>, tags: ['CONFIRM'], cta: 'Prepare reminder' },
    { kind: 'green', text: <><strong style={{ fontWeight: 600 }}>Schedule:</strong> Saturday home game vs Salt Lake Storm. 16 of 16 GREEN.</>, tags: ['CLEAR'] }]
    } />
      <div style={{ flex: 1, overflowY: 'auto', padding: '22px 24px 80px' }} className="no-scrollbar">
        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
          {[
        { label: 'TOTAL ATHLETES', value: '16', sub: '14 active · 2 pending', accent: '#F5F0EB' },
        { label: 'SESSIONS THIS WEEK', value: '04', sub: '2 games · 2 practices', accent: '#F5F0EB' },
        { label: 'OPEN SPOTS', value: '03', sub: 'across 2 sessions', accent: '#34D399' },
        { label: 'PENDING DUES', value: '$470', sub: '3 families', accent: '#FBBF24' }].
        map((c, i) =>
        <div key={i} style={{
          background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 12,
          padding: '16px 18px'
        }}>
              <div className="mono-label" style={{ marginBottom: 8 }}>{c.label}</div>
              <div style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 36, color: c.accent, lineHeight: 1, letterSpacing: '0.005em' }}>{c.value}</div>
              <div style={{ fontSize: 12, color: '#8888A0', marginTop: 6 }}>{c.sub}</div>
            </div>
        )}
        </div>
        {/* Recent activity */}
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
          { time: 'Yest.', who: 'Jordan Lee', action: 'Joined VAI FC North', kind: 'green' }].
          map((row, i) => {
            const c = row.kind === 'red' ? '#FF6B6B' : row.kind === 'yellow' ? '#FBBF24' : '#34D399';
            return (
              <div key={i} style={{
                padding: '12px 18px', borderTop: i ? '1px solid #15151c' : 'none',
                display: 'flex', alignItems: 'center', gap: 14
              }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: '#4d4d60', width: 44 }}>{row.time}</span>
                  <span style={{ width: 6, height: 6, borderRadius: 99, background: c }}></span>
                  <span style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 14, color: '#F5F0EB' }}>{row.who}</span>
                  <span style={{ flex: 1, fontSize: 13, color: '#C8C8D0' }}>{row.action}</span>
                  <IconChevR size={14} color="#4d4d60" />
                </div>);

          })}
          </div>
        </div>
      </div>
      <GamedayBubble count={3} />
    </div>
  </div>;


Object.assign(window, { ActionCard, AvantiOverlayClub, GamedaySidebar, GamedayTopbar, GamedayBubble, GamedayAvantiStrip, B4Gameday });