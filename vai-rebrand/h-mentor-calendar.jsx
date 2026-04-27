/* global React, MobileHeader, BottomNav, IconChevR, IconChevL, IconArrowL, IconSearch */

const { useState: useStateH } = React;

// ============ Shared scaffold ============
const HScreen = ({ header = true, nav = 'avanti', children, scroll = true }) => (
  <div style={{ width: '100%', height: '100%', background: '#060608', color: '#F5F0EB', fontFamily: 'DM Sans', display: 'flex', flexDirection: 'column' }}>
    {header && <MobileHeader tier="mentor" />}
    <div style={{ flex: 1, overflowY: scroll ? 'auto' : 'hidden', overflowX: 'hidden' }} className="no-scrollbar">
      {children}
    </div>
    <BottomNav active={nav} />
  </div>
);

const Avatar = ({ initials, color = '#F7941E', size = 44 }) => (
  <div style={{
    width: size, height: size, borderRadius: 999, background: color, flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'Oswald', fontWeight: 700, fontSize: size * 0.36, color: '#000', letterSpacing: '0.02em',
  }}>{initials}</div>
);

const StatusPill = ({ status }) => {
  const map = {
    open:  { bg: '#051A10', border: '#0D4A28', color: '#34D399', label: 'OPEN' },
    few:   { bg: '#1A1000', border: '#4A3200', color: '#FBBF24', label: '2 LEFT' },
    full:  { bg: '#1A0808', border: '#4A1818', color: '#FF6B6B', label: 'FULL' },
  };
  const m = map[status] || map.open;
  return (
    <span style={{
      fontFamily: 'JetBrains Mono', fontSize: 9.5, fontWeight: 700, color: m.color,
      background: m.bg, border: `1px solid ${m.border}`, padding: '3px 8px', borderRadius: 4,
      letterSpacing: '0.08em',
    }}>{m.label}</span>
  );
};

const SectionLabel = ({ children, accent = '#8888A0' }) => (
  <div style={{
    fontFamily: 'JetBrains Mono', fontSize: 9.5, fontWeight: 600, color: accent,
    letterSpacing: '0.12em', textTransform: 'uppercase',
  }}>{children}</div>
);

// =================================================================
//  M1 — Browse Mentors
// =================================================================
const M1Browse = () => {
  const [filter, setFilter] = useStateH('All');
  const filters = ['All', 'Soccer', 'Basketball', 'Football', 'Speed & Agility'];
  const mentors = [
    { initials: 'MR', color: '#F7941E', name: 'Marcus Riley', sport: 'Soccer · Attacking Midfielder', rating: 4.9, sessions: 148, price: 85, status: 'open' },
    { initials: 'TJ', color: '#5577DD', name: 'T.J. Washington', sport: 'Basketball · Guard Development', rating: 4.8, sessions: null, price: 110, status: 'few' },
    { initials: 'AK', color: '#5d5d70', name: 'Amara Kofi', sport: 'Speed & Agility · All Sports', rating: 4.7, sessions: null, price: 95, status: 'full' },
    { initials: 'LP', color: '#34D399', name: 'Lisa Park', sport: 'Football · Route Running', rating: 5.0, sessions: null, price: 75, status: 'open', openCount: 6 },
  ];
  return (
    <HScreen nav="home">
      {/* AVANTI insight banner */}
      <div style={{ padding: '14px 18px 0' }}>
        <div style={{
          background: 'linear-gradient(180deg, rgba(52,211,153,0.06), transparent)',
          border: '1px solid #0D4A28', borderRadius: 10, padding: '11px 13px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
            <span className="avanti-dot" style={{ width: 6, height: 6 }}></span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9.5, fontWeight: 700, color: '#34D399', letterSpacing: '0.1em' }}>AVANTI</span>
          </div>
          <div style={{ fontSize: 13, color: '#F5F0EB', lineHeight: 1.45 }}>
            <strong style={{ fontWeight: 600 }}>Marcus Riley</strong> is available Sat 10am — matches your training schedule.
          </div>
        </div>
      </div>

      {/* Title row */}
      <div style={{ padding: '18px 18px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <IconArrowL size={18} color="#8888A0" />
        <span style={{ color: '#8888A0', fontSize: 13, fontWeight: 500 }}>Home</span>
        <span style={{ color: '#F5F0EB', fontFamily: 'Oswald', fontWeight: 600, fontSize: 17, letterSpacing: '0.005em', marginLeft: 4 }}>Book a Mentor</span>
      </div>

      {/* Sport filters */}
      <div style={{ padding: '0 18px 14px', display: 'flex', gap: 7, overflowX: 'auto' }} className="no-scrollbar">
        {filters.map(f => {
          const active = filter === f;
          return (
            <button key={f} onClick={() => setFilter(f)} style={{
              background: active ? '#F7941E' : '#0c0c10',
              color: active ? '#000' : '#C8C8D0',
              border: active ? 'none' : '1px solid #1e1e26',
              padding: '7px 14px', borderRadius: 999, cursor: 'pointer', flexShrink: 0,
              fontFamily: 'DM Sans', fontWeight: 600, fontSize: 12.5,
            }}>{f}</button>
          );
        })}
      </div>

      <div style={{ padding: '0 18px 6px' }}>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9.5, fontWeight: 600, color: '#5d5d70', letterSpacing: '0.08em', marginBottom: 8 }}>
          12 MENTORS AVAILABLE
        </div>
      </div>

      {/* Mentor cards */}
      <div style={{ padding: '0 18px 24px', display: 'grid', gap: 10 }}>
        {mentors.map((m, i) => {
          const dim = m.status === 'full';
          return (
            <div key={i} style={{
              background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 12,
              padding: '14px 14px', display: 'flex', alignItems: 'center', gap: 13,
              opacity: dim ? 0.55 : 1, cursor: 'pointer',
            }}>
              <Avatar initials={m.initials} color={m.color} size={48} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 16, color: '#F5F0EB', letterSpacing: '0.005em' }}>{m.name}</div>
                <div style={{ fontSize: 12, color: '#8888A0', marginTop: 2 }}>{m.sport}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 7 }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10.5, color: '#FBBF24', fontWeight: 600 }}>★ {m.rating.toFixed(1)}</span>
                  {m.sessions && <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#8888A0' }}>· {m.sessions} sessions</span>}
                  <StatusPill status={m.status === 'open' && m.openCount ? 'open' : m.status} />
                  {m.openCount && <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9.5, color: '#34D399', fontWeight: 600 }}>{m.openCount} OPEN</span>}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 16, color: '#F7941E' }}>${m.price}</div>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: '#8888A0', letterSpacing: '0.05em', marginTop: 1 }}>/hr</div>
              </div>
            </div>
          );
        })}
      </div>
    </HScreen>
  );
};

// =================================================================
//  M2 — Pick a Date
// =================================================================
const M2Date = () => {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  // May 2026 starts on Friday (May 1 = Fri). 30/Apr is Thu.
  const cells = [
    { d: 27, prev: true }, { d: 28, prev: true }, { d: 29, prev: true }, { d: 30, prev: true },
    { d: 1,  status: 'open' }, { d: 2, status: 'open' }, { d: 3, status: 'open' },
    { d: 4,  status: 'open' }, { d: 5, status: 'open' }, { d: 6, status: 'open' }, { d: 7, status: 'open' }, { d: 8, status: 'few' }, { d: 9, status: 'open' }, { d: 10, status: 'few', selected: true },
    { d: 11, status: 'open' }, { d: 12, status: 'open' }, { d: 13, status: 'open' }, { d: 14, status: 'open' }, { d: 15, status: 'open' }, { d: 16, status: 'open' }, { d: 17, status: 'open' },
    { d: 18, status: 'open' }, { d: 19, status: 'open' }, { d: 20, status: 'open' }, { d: 21, status: 'open' }, { d: 22, status: 'open' }, { d: 23, status: 'few' }, { d: 24, status: 'open' },
    { d: 25, status: 'open' }, { d: 26, status: 'open' }, { d: 27, status: 'open' }, { d: 28, status: 'open' }, { d: 29, status: 'open' }, { d: 30, status: 'open' }, { d: 31, status: 'open' },
  ];
  return (
    <HScreen>
      {/* Mentor heading */}
      <div style={{ padding: '14px 18px 6px', display: 'flex', alignItems: 'center', gap: 9, color: '#F7941E', fontSize: 13 }}>
        <IconArrowL size={16} />
        <span style={{ fontWeight: 500 }}>Mentors</span>
        <span style={{ color: '#5d5d70' }}>›</span>
        <span style={{ color: '#F5F0EB', fontWeight: 600 }}>Marcus Riley</span>
      </div>
      <div style={{ padding: '8px 18px 18px', display: 'flex', alignItems: 'center', gap: 13 }}>
        <Avatar initials="MR" color="#F7941E" size={52} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 17, color: '#F5F0EB' }}>Marcus Riley</div>
          <div style={{ fontSize: 12, color: '#8888A0', marginTop: 2 }}>Soccer · Attacking Midfielder</div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10.5, color: '#FBBF24', fontWeight: 600, marginTop: 5 }}>★ 4.9 <span style={{ color: '#8888A0' }}>· 148 sessions</span></div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 17, color: '#F7941E' }}>$85</div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9.5, color: '#8888A0' }}>per hour</div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ padding: '0 18px 14px', display: 'flex', alignItems: 'center', gap: 14, fontFamily: 'JetBrains Mono', fontSize: 10, color: '#8888A0', letterSpacing: '0.05em' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 6, height: 6, borderRadius: 99, background: '#34D399' }}></span>OPEN</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 6, height: 6, borderRadius: 99, background: '#FBBF24' }}></span>FEW LEFT</span>
      </div>

      {/* Calendar */}
      <div style={{ margin: '0 14px', padding: '14px 12px', background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, padding: '0 4px' }}>
          <div style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 17, color: '#F5F0EB', letterSpacing: '0.01em' }}>May 2026</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ background: '#141418', border: '1px solid #1e1e26', color: '#C8C8D0', width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><IconChevL size={14} /></button>
            <button style={{ background: '#141418', border: '1px solid #1e1e26', color: '#C8C8D0', width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><IconChevR size={14} /></button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 6 }}>
          {days.map((d, i) => (
            <div key={i} style={{ textAlign: 'center', fontFamily: 'JetBrains Mono', fontSize: 10, color: '#5d5d70', letterSpacing: '0.05em', padding: '4px 0' }}>{d}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {cells.map((c, i) => {
            const dotColor = c.status === 'few' ? '#FBBF24' : c.status === 'open' ? '#34D399' : 'transparent';
            return (
              <button key={i} disabled={c.prev} style={{
                aspectRatio: '1', padding: 0,
                background: c.selected ? '#F7941E' : 'transparent', border: 'none',
                borderRadius: 8,
                color: c.selected ? '#000' : c.prev ? '#3a3a48' : '#F5F0EB',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2,
                cursor: c.prev ? 'default' : 'pointer',
                fontFamily: 'DM Sans', fontWeight: c.selected ? 700 : 500, fontSize: 13.5,
              }}>
                <span>{c.d}</span>
                {!c.prev && <span style={{ width: 4, height: 4, borderRadius: 99, background: c.selected ? '#000' : dotColor }}></span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day strip */}
      <div style={{ padding: '20px 18px 0', display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10.5, fontWeight: 700, color: '#F7941E', letterSpacing: '0.1em' }}>SATURDAY, MAY 10</span>
      </div>

      {/* CTA */}
      <div style={{ padding: '14px 18px 24px' }}>
        <button style={{
          width: '100%', background: '#F7941E', color: '#000', border: 'none',
          padding: '15px 18px', borderRadius: 10, cursor: 'pointer',
          fontFamily: 'DM Sans', fontWeight: 700, fontSize: 14.5,
        }}>See Available Times →</button>
      </div>
    </HScreen>
  );
};

// =================================================================
//  M3 — Pick a Time
// =================================================================
const M3Time = () => {
  const morning = [
    { time: '7:00 AM', dur: '60 min', status: 'open' },
    { time: '8:00 AM', dur: '60 min', status: 'open' },
    { time: '10:00 AM', dur: '60 min', status: 'few', selected: true },
  ];
  const afternoon = [
    { time: '1:00 PM', dur: '60 min', status: 'open' },
    { time: '2:30 PM', dur: '90 min', status: 'open' },
    { time: '4:00 PM', dur: '60 min', status: 'full' },
  ];
  const Slot = ({ s }) => {
    const dim = s.status === 'full';
    const sel = s.selected;
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 14px', borderRadius: 10,
        background: sel ? 'rgba(247,148,30,0.08)' : '#0c0c10',
        border: sel ? '1.5px solid #F7941E' : '1px solid #1e1e26',
        opacity: dim ? 0.45 : 1, cursor: dim ? 'default' : 'pointer',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 16, color: sel ? '#F7941E' : '#F5F0EB', letterSpacing: '0.01em' }}>{s.time}</div>
        </div>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10.5, color: '#8888A0' }}>{s.dur}</div>
        <StatusPill status={s.status === 'few' ? 'few' : s.status} />
        <span style={{
          width: 18, height: 18, borderRadius: 99,
          border: sel ? 'none' : '1.5px solid #3a3a48',
          background: sel ? '#F7941E' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>{sel && <span style={{ width: 7, height: 7, background: '#000', borderRadius: 99 }}></span>}</span>
      </div>
    );
  };
  return (
    <HScreen>
      <div style={{ padding: '14px 18px 4px', display: 'flex', alignItems: 'center', gap: 9, color: '#F7941E', fontSize: 13 }}>
        <IconArrowL size={16} />
        <span style={{ fontWeight: 500 }}>May 10</span>
        <span style={{ color: '#5d5d70' }}>›</span>
        <span style={{ color: '#F5F0EB', fontWeight: 600 }}>Select Time</span>
      </div>
      <div style={{ padding: '6px 18px 16px', fontSize: 12.5, color: '#8888A0' }}>Marcus Riley · Sat May 10, 2026</div>

      <div style={{ padding: '0 18px 6px' }}>
        <SectionLabel>MORNING</SectionLabel>
      </div>
      <div style={{ padding: '8px 18px 14px', display: 'grid', gap: 8 }}>
        {morning.map((s, i) => <Slot key={i} s={s} />)}
      </div>

      <div style={{ padding: '0 18px 6px' }}>
        <SectionLabel>AFTERNOON</SectionLabel>
      </div>
      <div style={{ padding: '8px 18px 24px', display: 'grid', gap: 8 }}>
        {afternoon.map((s, i) => <Slot key={i} s={s} />)}
      </div>

      <div style={{ padding: '4px 18px 24px' }}>
        <button style={{
          width: '100%', background: '#F7941E', color: '#000', border: 'none',
          padding: '15px 18px', borderRadius: 10, cursor: 'pointer',
          fontFamily: 'DM Sans', fontWeight: 700, fontSize: 14.5,
        }}>Continue → Confirm & Pay</button>
      </div>
    </HScreen>
  );
};

// =================================================================
//  M3a — FULL slot · Join Waitlist
// =================================================================
const M3aWaitlist = () => {
  return (
    <HScreen nav="home">
      <div style={{ padding: '14px 18px 4px' }}>
        <SectionLabel>SATURDAY, MAY 10</SectionLabel>
      </div>
      {/* Greyed-out slots */}
      <div style={{ padding: '10px 18px 8px', display: 'grid', gap: 8, opacity: 0.45 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 14px', background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 10 }}>
          <div style={{ flex: 1, fontFamily: 'Oswald', fontWeight: 700, fontSize: 16, color: '#F5F0EB' }}>8:00 AM</div>
          <StatusPill status="open" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 14px', background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 10 }}>
          <div style={{ flex: 1, fontFamily: 'Oswald', fontWeight: 700, fontSize: 16, color: '#F5F0EB' }}>10:00 AM</div>
          <StatusPill status="full" />
        </div>
      </div>

      {/* Slot is full notice */}
      <div style={{ padding: '20px 18px 6px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 20, height: 20, borderRadius: 99, border: '1.5px solid #FF6B6B',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ width: 8, height: 2, background: '#FF6B6B' }}></span>
        </div>
        <span style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 14.5, color: '#F5F0EB' }}>This slot is full</span>
      </div>
      <div style={{ padding: '0 18px 0', fontSize: 12.5, color: '#8888A0', marginLeft: 30 }}>
        Marcus Riley · Saturday May 10 · 10:00 AM
      </div>

      {/* Waitlist position card */}
      <div style={{ padding: '16px 18px 0' }}>
        <div style={{
          background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 12,
          padding: '14px', display: 'flex', alignItems: 'center', gap: 13,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 9, background: '#1A1000', border: '1px solid #4A3200',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Oswald', fontWeight: 700, fontSize: 17, color: '#FBBF24',
          }}>#2</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 14, color: '#F5F0EB' }}>You'd be 2nd on the waitlist</div>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#8888A0', letterSpacing: '0.04em', marginTop: 3 }}>1 PERSON AHEAD · AVG WAIT 3 DAYS</div>
          </div>
        </div>
      </div>

      {/* AVANTI promise */}
      <div style={{ padding: '16px 18px 0' }}>
        <div style={{
          background: 'linear-gradient(180deg, rgba(52,211,153,0.06), transparent)',
          border: '1px solid #0D4A28', borderRadius: 10, padding: '12px 13px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
            <span className="avanti-dot" style={{ width: 6, height: 6 }}></span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9.5, fontWeight: 700, color: '#34D399', letterSpacing: '0.1em' }}>AVANTI</span>
          </div>
          <div style={{ fontSize: 12.5, color: '#C8C8D0', lineHeight: 1.5 }}>
            I'll notify you the instant a spot opens. You'll have <strong style={{ color: '#F5F0EB', fontWeight: 600 }}>2 hours</strong> to confirm before it moves to the next person.
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div style={{ padding: '20px 18px 8px' }}>
        <button style={{
          width: '100%', background: '#F7941E', color: '#000', border: 'none',
          padding: '15px 18px', borderRadius: 10, cursor: 'pointer',
          fontFamily: 'DM Sans', fontWeight: 700, fontSize: 14.5,
        }}>Join Waitlist — Saturday 10am</button>
      </div>
      <div style={{ padding: '0 18px 24px' }}>
        <button style={{
          width: '100%', background: 'transparent', color: '#C8C8D0', border: '1px solid #1e1e26',
          padding: '13px 18px', borderRadius: 10, cursor: 'pointer',
          fontFamily: 'DM Sans', fontWeight: 500, fontSize: 13,
        }}>See other available times</button>
      </div>
    </HScreen>
  );
};

// =================================================================
//  M3b — Waitlist Confirmed (#2)
// =================================================================
const M3bConfirmed = () => {
  return (
    <HScreen>
      {/* Position medallion */}
      <div style={{ padding: '32px 18px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: 110, height: 110, marginBottom: 16 }}>
          <svg width="110" height="110" viewBox="0 0 110 110" style={{ position: 'absolute', inset: 0 }}>
            <circle cx="55" cy="55" r="50" fill="none" stroke="#4A3200" strokeWidth="2" />
            <circle cx="55" cy="55" r="50" fill="none" stroke="#F7941E" strokeWidth="2" strokeDasharray="20 4" />
          </svg>
          <div style={{ position: 'absolute', inset: 12, borderRadius: 999, background: '#0c0c10', border: '1px solid #1e1e26', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: 8.5, fontWeight: 700, color: '#F7941E', letterSpacing: '0.15em' }}>POSITION</div>
            <div style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 38, color: '#F7941E', lineHeight: 1, marginTop: 2 }}>#2</div>
          </div>
        </div>
        <div style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 24, color: '#F5F0EB', textAlign: 'center', letterSpacing: '0.005em' }}>You're on the Waitlist</div>
        <div style={{ marginTop: 8, fontSize: 13, color: '#8888A0', textAlign: 'center', lineHeight: 1.5, padding: '0 22px' }}>
          Saturday May 10 · 10:00 AM with Marcus Riley.<br />We'll notify you the moment a spot opens.
        </div>
      </div>

      {/* Details panel */}
      <div style={{ padding: '24px 18px 0' }}>
        <div style={{ background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 12, padding: '14px' }}>
          <SectionLabel>WAITLIST DETAILS</SectionLabel>
          <div style={{ marginTop: 12, display: 'grid', gap: 10, fontSize: 13 }}>
            <Row label="Your position" value={<span style={{ color: '#F7941E', fontWeight: 600 }}>#2 of 3</span>} />
            <Row label="Confirmation window" value="2 hours" />
            <Row label="Alert via" value="AVANTI + Push" />
            <div style={{ borderTop: '1px solid #1e1e26', margin: '4px 0' }}></div>
            <Row label="No charge now" value={<span style={{ color: '#34D399', fontWeight: 600 }}>$0.00</span>} />
          </div>
        </div>
      </div>

      {/* AVANTI promise */}
      <div style={{ padding: '14px 18px 0' }}>
        <div style={{
          background: 'linear-gradient(180deg, rgba(52,211,153,0.06), transparent)',
          border: '1px solid #0D4A28', borderRadius: 10, padding: '12px 13px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
            <span className="avanti-dot" style={{ width: 6, height: 6 }}></span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9.5, fontWeight: 700, color: '#34D399', letterSpacing: '0.1em' }}>AVANTI</span>
          </div>
          <div style={{ fontSize: 12.5, color: '#C8C8D0', lineHeight: 1.5 }}>
            I'll watch this slot for you. If it opens I'll alert you immediately — even if you're mid-session.
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div style={{ padding: '20px 18px 8px' }}>
        <button style={{
          width: '100%', background: 'transparent', color: '#C8C8D0', border: '1px solid #1e1e26',
          padding: '13px 18px', borderRadius: 10, cursor: 'pointer',
          fontFamily: 'DM Sans', fontWeight: 500, fontSize: 13,
        }}>See other times with Marcus</button>
      </div>
      <div style={{ padding: '0 18px 24px' }}>
        <button style={{
          width: '100%', background: '#F7941E', color: '#000', border: 'none',
          padding: '15px 18px', borderRadius: 10, cursor: 'pointer',
          fontFamily: 'DM Sans', fontWeight: 700, fontSize: 14.5,
        }}>Back to Home</button>
      </div>
    </HScreen>
  );
};

const Row = ({ label, value }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
    <span style={{ color: '#8888A0' }}>{label}</span>
    <span style={{ color: '#F5F0EB' }}>{value}</span>
  </div>
);

// =================================================================
//  M3c — Group Session Signup
// =================================================================
const M3cGroup = () => {
  const joinedDots = [
    { initials: 'J', color: '#5577DD' },
    { initials: 'S', color: '#34D399' },
    { initials: 'R', color: '#F7941E' },
    { initials: 'D', color: '#FF6B6B' },
  ];
  return (
    <HScreen>
      <div style={{ padding: '14px 18px 4px', display: 'flex', alignItems: 'center', gap: 9, color: '#F7941E', fontSize: 13 }}>
        <IconArrowL size={16} />
        <span style={{ fontWeight: 500 }}>Sessions</span>
        <span style={{ color: '#5d5d70' }}>›</span>
        <span style={{ color: '#F5F0EB', fontWeight: 600 }}>Group Session</span>
      </div>

      {/* Hero card */}
      <div style={{ padding: '14px 14px 0' }}>
        <div style={{ background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 14, padding: '16px 16px' }}>
          <div style={{ display: 'flex', gap: 13, alignItems: 'flex-start' }}>
            <Avatar initials="MR" color="#F7941E" size={44} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 17, color: '#F5F0EB', letterSpacing: '0.005em' }}>Speed & Agility Group</div>
              <div style={{ fontSize: 12, color: '#8888A0', marginTop: 3 }}>Marcus Riley · Sat May 10 · 9:00 AM</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 18, color: '#F7941E' }}>$45</div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: '#8888A0' }}>/athlete</div>
            </div>
          </div>

          {/* Spots progress */}
          <div style={{ marginTop: 16, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
            <SectionLabel>SPOTS FILLED</SectionLabel>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, fontWeight: 700, color: '#F7941E', letterSpacing: '0.04em' }}>
              <span style={{ color: '#F5F0EB' }}>8</span> of 12
            </span>
          </div>
          <div style={{ height: 6, background: '#15151c', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ width: `${(8/12)*100}%`, height: '100%', background: 'linear-gradient(90deg, #F7941E, #FBBF24)' }}></div>
          </div>
          <div style={{ marginTop: 8, fontFamily: 'JetBrains Mono', fontSize: 9.5, color: '#FBBF24', letterSpacing: '0.05em' }}>
            4 SPOTS LEFT — FILLING FAST
          </div>

          {/* Joined avatars */}
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="mono-label" style={{ fontSize: 9 }}>JOINED:</span>
            <div style={{ display: 'flex' }}>
              {joinedDots.map((d, i) => (
                <div key={i} style={{
                  width: 26, height: 26, borderRadius: 99, background: d.color,
                  border: '2px solid #0c0c10', marginLeft: i ? -6 : 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Oswald', fontWeight: 700, fontSize: 10, color: '#000',
                }}>{d.initials}</div>
              ))}
              <div style={{
                width: 26, height: 26, borderRadius: 99, background: '#1a1a20',
                border: '2px solid #0c0c10', marginLeft: -6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'JetBrains Mono', fontSize: 9, fontWeight: 700, color: '#C8C8D0',
              }}>+5</div>
            </div>
          </div>
        </div>
      </div>

      {/* Session details */}
      <div style={{ padding: '14px 14px 0' }}>
        <div style={{ background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 12, padding: '14px' }}>
          <SectionLabel>SESSION DETAILS</SectionLabel>
          <div style={{ marginTop: 12, display: 'grid', gap: 10, fontSize: 13 }}>
            <Row label="Duration" value="90 min" />
            <Row label="Location" value="Field 3 · Provo Sports" />
            <Row label="Level" value="All levels welcome" />
            <Row label="PLAY gated" value={<span style={{ color: '#34D399', fontWeight: 600 }}>● GREEN required</span>} />
          </div>
        </div>
      </div>

      {/* Waitlist note */}
      <div style={{ padding: '14px 18px 0', fontSize: 12, color: '#8888A0', lineHeight: 1.5 }}>
        Not able to make it? You can join the <span style={{ color: '#34D399', fontWeight: 600 }}>waitlist</span> after spots fill.
      </div>

      {/* CTA */}
      <div style={{ padding: '18px 18px 24px' }}>
        <button style={{
          width: '100%', background: '#F7941E', color: '#000', border: 'none',
          padding: '15px 18px', borderRadius: 10, cursor: 'pointer',
          fontFamily: 'DM Sans', fontWeight: 700, fontSize: 14.5,
        }}>Join Group Session — $45</button>
      </div>
    </HScreen>
  );
};

Object.assign(window, { M1Browse, M2Date, M3Time, M3aWaitlist, M3bConfirmed, M3cGroup });
