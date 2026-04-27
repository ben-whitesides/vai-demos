/* global React, GamedaySidebar, GamedayTopbar, GamedayBubble, GamedayAvantiStrip,
   IconSearch, IconBell, IconChevR, PlayDot */

const { useState: useStateD } = React;

// Shared shell wrapper
const GamedayShell = ({ children, active, breadcrumb }) => (
  <div style={{ display: 'flex', height: '100%', background: '#060608', fontFamily: 'DM Sans', position: 'relative' }} className="ambient-glow">
    <GamedaySidebar active={active} />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative', zIndex: 1 }}>
      <GamedayTopbar breadcrumb={breadcrumb} />
      {children}
      <GamedayBubble count={2} />
    </div>
  </div>
);

// Section header used in many screens
const PageTitle = ({ title, subtitle, action }) => (
  <div style={{
    background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 14,
    padding: '20px 22px', marginBottom: 18,
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16,
  }}>
    <div>
      <div style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 26, color: '#F5F0EB', letterSpacing: '0.005em' }}>{title}</div>
      {subtitle && <div style={{ fontSize: 13, color: '#8888A0', marginTop: 4 }}>{subtitle}</div>}
    </div>
    {action}
  </div>
);

const PrimaryBtn = ({ children, onClick }) => (
  <button onClick={onClick} style={{
    background: '#F7941E', color: '#000', border: 'none', padding: '9px 16px',
    borderRadius: 8, fontFamily: 'DM Sans', fontWeight: 600, fontSize: 13, cursor: 'pointer',
  }}>{children}</button>
);

const GhostBtn = ({ children, onClick }) => (
  <button onClick={onClick} style={{
    background: 'transparent', color: '#F5F0EB', border: '1px solid #1e1e26', padding: '8px 14px',
    borderRadius: 8, fontFamily: 'DM Sans', fontWeight: 500, fontSize: 13, cursor: 'pointer',
  }}>{children}</button>
);

const TabBar = ({ tabs, active, onChange }) => (
  <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid #1e1e26', marginBottom: 18, padding: '0 2px' }}>
    {tabs.map(t => (
      <button key={t} onClick={() => onChange && onChange(t)} style={{
        background: 'transparent', border: 'none', cursor: 'pointer',
        padding: '10px 0', fontFamily: 'DM Sans', fontSize: 13.5, fontWeight: 600,
        color: active === t ? '#F7941E' : '#8888A0',
        borderBottom: active === t ? '2px solid #F7941E' : '2px solid transparent',
        marginBottom: -1,
      }}>{t}</button>
    ))}
  </div>
);

const StatusPill = ({ kind, label }) => {
  const c = kind === 'red' ? '#FF6B6B' : kind === 'yellow' ? '#FBBF24' : kind === 'green' ? '#34D399' : kind === 'blue' ? '#5577DD' : '#8888A0';
  const bg = kind === 'red' ? '#1A0808' : kind === 'yellow' ? '#1A1000' : kind === 'green' ? '#051A10' : kind === 'blue' ? '#0A1020' : '#15151c';
  const bd = kind === 'red' ? '#4A1A1A' : kind === 'yellow' ? '#4A3000' : kind === 'green' ? '#0D4A28' : kind === 'blue' ? '#1A2A50' : '#1e1e26';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '3px 10px', borderRadius: 999,
      background: bg, border: `1px solid ${bd}`, color: c,
      fontFamily: 'JetBrains Mono', fontSize: 9.5, fontWeight: 600, letterSpacing: '0.08em',
    }}>
      {kind === 'green' && <span style={{ width: 5, height: 5, borderRadius: 99, background: c }}></span>}
      {label.toUpperCase()}
    </span>
  );
};

// ============ D2 — GAMEDAY Roster ============
const D2Roster = () => {
  const rows = [
    { name: 'Mia Rodriguez', team: 'U15 · Soccer', jersey: 7, play: 'red', waiver: 'Overdue', joined: 'Aug 14' },
    { name: 'Kai Tanaka', team: 'U15 · Soccer', jersey: 11, play: 'green', waiver: 'Signed', joined: 'Aug 14' },
    { name: 'Sofia Reyes', team: 'U15 · Soccer', jersey: 4, play: 'green', waiver: 'Signed', joined: 'Aug 16' },
    { name: 'Darius Powell', team: 'U15 · Soccer', jersey: 3, play: 'yellow', waiver: 'Pending', joined: 'Aug 18' },
    { name: 'Avery Kim', team: 'U15 · Soccer', jersey: 9, play: 'green', waiver: 'Signed', joined: 'Aug 22' },
    { name: 'Tyler Moore', team: 'U15 · Soccer', jersey: 14, play: 'red', waiver: 'Overdue', joined: 'Aug 22' },
    { name: 'Jordan Lee', team: 'U15 · Soccer', jersey: 21, play: 'green', waiver: 'Signed', joined: 'Sep 02' },
    { name: 'Riley Park', team: 'U15 · Soccer', jersey: 5, play: 'green', waiver: 'Signed', joined: 'Sep 04' },
  ];
  return (
    <GamedayShell active="roster" breadcrumb={['VAI FC North', 'Roster']}>
      <GamedayAvantiStrip rows={[
        { kind: 'yellow', text: <><strong style={{ fontWeight: 600 }}>2 athletes</strong> have overdue waivers — Saturday game in 2 days.</>, tags: ['CONFIRM'], cta: 'Send reminders' },
      ]} />
      <div style={{ flex: 1, overflowY: 'auto', padding: '22px 24px 80px' }} className="no-scrollbar">
        <PageTitle title="Roster" subtitle="16 athletes · 14 active · 2 pending"
          action={<div style={{ display: 'flex', gap: 8 }}><GhostBtn>Export CSV</GhostBtn><PrimaryBtn>+ Add Athlete</PrimaryBtn></div>} />
        {/* Search + filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 8, padding: '8px 12px', maxWidth: 320 }}>
            <IconSearch size={14} color="#8888A0" />
            <span style={{ color: '#8888A0', fontSize: 12.5 }}>Search by name, jersey…</span>
          </div>
          <GhostBtn>Team: All</GhostBtn>
          <GhostBtn>Status: All</GhostBtn>
          <div style={{ marginLeft: 'auto', fontFamily: 'JetBrains Mono', fontSize: 10, color: '#8888A0', letterSpacing: '0.06em' }}>0 SELECTED</div>
        </div>
        {/* Table */}
        <div style={{ background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '32px 2fr 1.5fr 80px 1fr 1fr 1fr 40px',
            gap: 16, padding: '12px 18px', borderBottom: '1px solid #1e1e26',
            fontFamily: 'JetBrains Mono', fontSize: 9.5, fontWeight: 600, letterSpacing: '0.1em', color: '#8888A0', textTransform: 'uppercase',
          }}>
            <span></span>
            <span>Name</span>
            <span>Team</span>
            <span>Jersey</span>
            <span>PLAY Status</span>
            <span>Waiver</span>
            <span>Joined</span>
            <span></span>
          </div>
          {rows.map((r, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '32px 2fr 1.5fr 80px 1fr 1fr 1fr 40px',
              gap: 16, padding: '14px 18px', alignItems: 'center',
              borderTop: i ? '1px solid #15151c' : 'none',
            }}>
              <input type="checkbox" style={{ accentColor: '#F7941E' }} />
              <span style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: 13.5, color: '#F5F0EB' }}>{r.name}</span>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10.5, color: '#8888A0', letterSpacing: '0.04em' }}>{r.team}</span>
              <span style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 14, color: '#F5F0EB' }}>#{r.jersey}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <PlayDot status={r.play} />
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: r.play === 'red' ? '#FF6B6B' : r.play === 'yellow' ? '#FBBF24' : '#34D399', letterSpacing: '0.06em' }}>
                  {r.play === 'red' ? 'BLOCKED' : r.play === 'yellow' ? 'PENDING' : 'CLEAR'}
                </span>
              </div>
              <StatusPill kind={r.waiver === 'Signed' ? 'green' : r.waiver === 'Overdue' ? 'red' : 'yellow'} label={r.waiver} />
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: '#C8C8D0' }}>{r.joined}</span>
              <IconChevR size={14} color="#4d4d60" />
            </div>
          ))}
        </div>
      </div>
    </GamedayShell>
  );
};

// ============ D3 — GAMEDAY Schedule ============
const D3Schedule = () => {
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const buildMonth = () => {
    const cells = [];
    for (let i = 0; i < 35; i++) {
      const day = i - 1; // pad
      cells.push(day);
    }
    return cells;
  };
  const events = {
    3: [{ kind: 'green', label: 'Practice' }],
    5: [{ kind: 'green', label: 'Practice' }],
    8: [{ kind: 'orange', label: 'Game' }],
    11: [{ kind: 'green', label: 'Practice' }],
    14: [{ kind: 'orange', label: 'Game' }],
    17: [{ kind: 'green', label: 'Practice' }],
    20: [{ kind: 'green', label: 'Practice' }],
    24: [{ kind: 'orange', label: 'Tournament' }, { kind: 'orange', label: 'Tournament' }],
    25: [{ kind: 'orange', label: 'Tournament' }],
  };
  return (
    <GamedayShell active="schedule" breadcrumb={['VAI FC North', 'Schedule']}>
      <GamedayAvantiStrip rows={[
        { kind: 'green', text: <>Next session in <strong style={{ fontWeight: 600 }}>2 days</strong> — 4 spots open in Speed & Agility Clinic.</>, tags: ['INFO'] },
      ]} />
      <div style={{ flex: 1, overflowY: 'auto', padding: '22px 24px 80px' }} className="no-scrollbar">
        <PageTitle title="Schedule" subtitle="April 2026 · 12 sessions · 4 games"
          action={<div style={{ display: 'flex', gap: 8 }}><GhostBtn>Today</GhostBtn><GhostBtn>Month</GhostBtn><GhostBtn>Week</GhostBtn><GhostBtn>List</GhostBtn><PrimaryBtn>+ New Session</PrimaryBtn></div>} />
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 18 }}>
          {/* Calendar */}
          <div style={{ background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button style={{ background: '#1a1a20', border: '1px solid #1e1e26', color: '#C8C8D0', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}>‹</button>
                <span style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 18, color: '#F5F0EB', letterSpacing: '0.01em' }}>April 2026</span>
                <button style={{ background: '#1a1a20', border: '1px solid #1e1e26', color: '#C8C8D0', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}>›</button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 6 }}>
              {days.map(d => (
                <div key={d} style={{ fontFamily: 'JetBrains Mono', fontSize: 9.5, color: '#4d4d60', letterSpacing: '0.1em', textAlign: 'center', padding: '4px 0' }}>{d}</div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
              {buildMonth().map((d, i) => {
                const valid = d > 0 && d <= 30;
                const isToday = d === 24;
                const dayEvents = events[d] || [];
                return (
                  <div key={i} style={{
                    minHeight: 64, padding: 6, borderRadius: 6,
                    background: isToday ? 'rgba(247,148,30,0.06)' : '#060608',
                    border: isToday ? '1px solid #4A3200' : '1px solid #15151c',
                    opacity: valid ? 1 : 0.3,
                  }}>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: 11, fontWeight: 600, color: isToday ? '#F7941E' : '#8888A0', marginBottom: 4 }}>
                      {valid ? d : ''}
                    </div>
                    {dayEvents.slice(0, 2).map((ev, j) => (
                      <div key={j} style={{
                        fontSize: 9, fontFamily: 'JetBrains Mono', fontWeight: 500,
                        color: ev.kind === 'orange' ? '#F7941E' : '#34D399',
                        background: ev.kind === 'orange' ? '#1E1000' : '#051A10',
                        border: `1px solid ${ev.kind === 'orange' ? '#4A3200' : '#0D4A28'}`,
                        padding: '1px 4px', borderRadius: 3, marginBottom: 2, letterSpacing: '0.04em',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>{ev.label}</div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
          {/* Upcoming sessions list */}
          <div>
            <div className="mono-label" style={{ marginBottom: 10 }}>UPCOMING</div>
            {[
              { day: 'SAT 26', time: '9:00 AM', title: '2011 Girls Blue vs City Select', loc: 'Field 2 · Tournament', spots: '11/11', kind: 'orange' },
              { day: 'SAT 26', time: '11:00 AM', title: '2012 Boys Black vs Valley United', loc: 'Field 3 · Tournament', spots: '11/11', kind: 'orange' },
              { day: 'MON 28', time: '5:30 PM', title: 'U15 Practice', loc: 'Field 1', spots: '12/16 · 4 spots', kind: 'green' },
              { day: 'TUE 29', time: '6:00 PM', title: 'Speed & Agility Clinic', loc: 'Provo Sports Complex', spots: '5/8', kind: 'green' },
            ].map((s, i) => (
              <div key={i} style={{ background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 10, padding: '12px 14px', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, fontWeight: 600, color: s.kind === 'orange' ? '#F7941E' : '#34D399', letterSpacing: '0.08em' }}>{s.day} · {s.time}</span>
                  <PlayDot status={s.kind === 'orange' ? 'green' : 'green'} size={5} />
                </div>
                <div style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 14, color: '#F5F0EB', marginBottom: 4, letterSpacing: '0.005em' }}>{s.title}</div>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#8888A0', letterSpacing: '0.04em' }}>{s.loc} · {s.spots}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GamedayShell>
  );
};

// ============ D4 — GAMEDAY Mentor Dashboard ============
const D4Mentor = () => (
  <GamedayShell active="sessions" breadcrumb={['Provo Sports Club', 'My Sessions']}>
    <GamedayAvantiStrip rows={[
      { kind: 'yellow', text: <><strong style={{ fontWeight: 600 }}>Speed Combine Prep (May 1)</strong> is full with 2 waitlisted — open a second slot to capture demand?</>, tags: ['CONFIRM'], cta: 'Open slot →' },
    ]} />
    <div style={{ flex: 1, overflowY: 'auto', padding: '22px 24px 80px' }} className="no-scrollbar">
      <TabBar tabs={['Upcoming', 'Past', 'Roster & Waitlist', 'Attendance']} active="Upcoming" />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <div style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 26, color: '#F5F0EB', letterSpacing: '0.005em' }}>My Sessions</div>
          <div style={{ fontSize: 13, color: '#8888A0', marginTop: 4 }}>3 upcoming · Apr 28 – May 5</div>
        </div>
        <PrimaryBtn>+ New Session</PrimaryBtn>
      </div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 18 }}>
        {[
          { label: 'THIS MONTH', value: '12', sub: 'sessions total', accent: '#F7941E' },
          { label: 'CONFIRMED SPOTS', value: '47', sub: 'across all sessions', accent: '#34D399' },
          { label: 'WAITLISTED', value: '08', sub: 'awaiting openings', accent: '#FBBF24' },
          { label: 'EARNINGS MTD', value: '$1,840', sub: 'after VAI fee', accent: '#F7941E' },
        ].map((c, i) => (
          <div key={i} style={{ background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 12, padding: '16px 18px' }}>
            <div className="mono-label" style={{ marginBottom: 8 }}>{c.label}</div>
            <div style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 36, color: c.accent, lineHeight: 1, letterSpacing: '0.005em' }}>{c.value}</div>
            <div style={{ fontSize: 12, color: '#8888A0', marginTop: 6 }}>{c.sub}</div>
          </div>
        ))}
      </div>
      {/* Upcoming Sessions table */}
      <div style={{ background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #1e1e26', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 16, color: '#F5F0EB' }}>Upcoming Sessions</div>
          <GhostBtn>Filter</GhostBtn>
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1.4fr 0.8fr 1fr 1fr 1.4fr',
          gap: 16, padding: '12px 20px', borderBottom: '1px solid #1e1e26',
          fontFamily: 'JetBrains Mono', fontSize: 9.5, fontWeight: 600, letterSpacing: '0.1em', color: '#8888A0', textTransform: 'uppercase',
        }}>
          <span>Session</span>
          <span>Date & Time</span>
          <span>Type</span>
          <span>Spots</span>
          <span>Status</span>
          <span>Actions</span>
        </div>
        {[
          { name: 'Speed & Agility Clinic', loc: 'Provo Sports Complex · Field 3', date: 'Mon Apr 28 · 9:00 AM', type: 'Group', typeKind: 'orange', spots: '5 / 8', spotsSub: '3 spots left', status: 'Active', statusKind: 'green' },
          { name: '1-on-1 Route Running', loc: 'Provo Sports Complex · Field 1', date: 'Tue Apr 29 · 7:00 AM', type: 'Private', typeKind: 'blue', spots: '1 / 1', spotsSub: 'FULL', status: 'Full', statusKind: 'yellow' },
          { name: 'Speed Combine Prep', loc: 'Provo Sports Complex · Field 3', date: 'Thu May 1 · 4:00 PM', type: 'Group', typeKind: 'orange', spots: '8 / 8', spotsSub: 'Full · 2 waiting', status: 'Full', statusKind: 'red' },
        ].map((r, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '2fr 1.4fr 0.8fr 1fr 1fr 1.4fr',
            gap: 16, padding: '14px 20px', alignItems: 'center',
            borderTop: i ? '1px solid #15151c' : 'none',
          }}>
            <div>
              <div style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: 13.5, color: '#F5F0EB' }}>{r.name}</div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#8888A0', letterSpacing: '0.04em', marginTop: 2 }}>{r.loc}</div>
            </div>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: '#C8C8D0' }}>{r.date}</span>
            <span style={{
              display: 'inline-block', alignSelf: 'center', justifySelf: 'flex-start',
              padding: '3px 10px', borderRadius: 999,
              background: r.typeKind === 'blue' ? '#0A1020' : '#1E1000',
              border: `1px solid ${r.typeKind === 'blue' ? '#1A2A50' : '#4A3200'}`,
              color: r.typeKind === 'blue' ? '#5577DD' : '#F7941E',
              fontFamily: 'JetBrains Mono', fontSize: 10, fontWeight: 600, letterSpacing: '0.06em',
            }}>{r.type}</span>
            <div>
              <div style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 14, color: '#F5F0EB' }}>{r.spots}</div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: r.spotsSub.includes('FULL') || r.spotsSub.includes('waiting') ? '#FBBF24' : '#8888A0', letterSpacing: '0.06em', marginTop: 2 }}>{r.spotsSub.toUpperCase()}</div>
            </div>
            <StatusPill kind={r.statusKind} label={r.status} />
            <div style={{ display: 'flex', gap: 6 }}>
              <button style={{ background: 'transparent', border: '1px solid #1e1e26', color: '#C8C8D0', borderRadius: 6, padding: '4px 10px', fontFamily: 'DM Sans', fontSize: 11, fontWeight: 500, cursor: 'pointer' }}>Roster</button>
              <button style={{ background: 'transparent', border: '1px solid #4A1A1A', color: '#FF6B6B', borderRadius: 6, padding: '4px 10px', fontFamily: 'DM Sans', fontSize: 11, fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </GamedayShell>
);

// ============ D5 / D6 — Finances ============
const ProviderCard = ({ name, sub, status, statusKind, rows, ctaLabel, ctaColor, icon, isShortcut }) => (
  <div style={{ background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 12, padding: '18px 20px' }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8, background: '#1a1a20',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Oswald', fontWeight: 700, fontSize: 16, color: icon.color,
        }}>{icon.letter}</div>
        <div>
          <div style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 16, color: '#F5F0EB', letterSpacing: '0.005em' }}>{name}</div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#8888A0', letterSpacing: '0.04em', marginTop: 2 }}>{sub}</div>
        </div>
      </div>
      {isShortcut ? (
        <StatusPill kind="blue" label="Shortcut" />
      ) : (
        <StatusPill kind={statusKind} label={`• ${status}`} />
      )}
    </div>
    {rows && rows.map((r, i) => (
      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 12.5 }}>
        <span style={{ color: '#8888A0' }}>{r.label}</span>
        <span style={{ fontFamily: r.mono ? 'JetBrains Mono' : 'DM Sans', fontWeight: r.bold ? 700 : 500, color: r.color || '#F5F0EB' }}>{r.value}</span>
      </div>
    ))}
    <button style={{
      width: '100%', marginTop: 12, padding: '10px',
      background: ctaColor === 'green' ? 'rgba(52,211,153,0.08)' : ctaColor === 'purple' ? 'rgba(85,119,221,0.08)' : ctaColor === 'blue' ? 'rgba(85,119,221,0.08)' : 'rgba(85,119,221,0.08)',
      border: `1px solid ${ctaColor === 'green' ? '#0D4A28' : ctaColor === 'purple' ? '#1A2A50' : '#1A2A50'}`,
      color: ctaColor === 'green' ? '#34D399' : ctaColor === 'purple' ? '#8B9DEE' : '#5577DD',
      borderRadius: 8, fontFamily: 'DM Sans', fontWeight: 600, fontSize: 13, cursor: 'pointer',
    }}>{ctaLabel}</button>
  </div>
);

const D5Connected = () => {
  const [tab, setTab] = useStateD('Connected');
  return (
    <GamedayShell active="finances" breadcrumb={['VAI FC North', 'Finances']}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '22px 24px 80px' }} className="no-scrollbar">
        <TabBar tabs={['Connected', 'Setup State']} active={tab} onChange={setTab} />
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 26, color: '#F5F0EB', letterSpacing: '0.005em' }}>Finances</div>
            <div style={{ fontSize: 13, color: '#8888A0', marginTop: 4 }}>Connected financial tools and club data imports.</div>
          </div>
          <GhostBtn>⚙ Settings</GhostBtn>
        </div>
        {/* AVANTI insight bar */}
        <div style={{
          background: 'linear-gradient(90deg, rgba(5,26,16,0.8) 0%, rgba(5,26,16,0.2) 100%)',
          border: '1px solid #0D4A28', borderRadius: 10, padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18,
        }}>
          <span className="avanti-dot"></span>
          <div style={{ flex: 1, fontSize: 13, color: '#F5F0EB' }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, fontWeight: 600, color: '#34D399', letterSpacing: '0.1em', marginRight: 8 }}>AVANTI — FINANCIAL INSIGHTS</span>
            3 outstanding dues · Stripe balance $4,280 · Last payout Apr 22 · QuickBooks, Stripe, PayPal connected
          </div>
          <button style={{ background: '#1A1000', border: '1px solid #4A3000', color: '#FBBF24', borderRadius: 6, padding: '5px 10px', fontFamily: 'DM Sans', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>⚠ Dues Reminder</button>
          <button style={{ background: 'transparent', border: '1px solid #1e1e26', color: '#C8C8D0', borderRadius: 6, padding: '5px 10px', fontFamily: 'DM Sans', fontSize: 11, fontWeight: 500, cursor: 'pointer' }}>↗ Summarize</button>
        </div>
        {/* Provider cards 2x2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
          <ProviderCard name="QuickBooks" sub="Accounting & Invoicing"
            statusKind="green" status="Connected"
            icon={{ letter: 'QB', color: '#34D399' }}
            rows={[
              { label: 'Outstanding invoices', value: '3' },
              { label: 'Total receivable', value: '$1,240', mono: true, bold: true },
              { label: 'Recent transactions', value: '14' },
            ]}
            ctaLabel="Open QuickBooks ↗" ctaColor="green" />
          <ProviderCard name="Stripe" sub="Payments & Payouts"
            statusKind="green" status="Connected"
            icon={{ letter: 'S', color: '#8B9DEE' }}
            rows={[
              { label: 'Available balance', value: '$4,280', color: '#34D399', mono: true, bold: true },
              { label: 'Last payout', value: 'Apr 22' },
              { label: 'Pending', value: '$320', mono: true },
            ]}
            ctaLabel="Open Stripe ↗" ctaColor="purple" />
          <ProviderCard name="PayPal" sub="Online Payments"
            statusKind="green" status="Connected"
            icon={{ letter: 'P', color: '#5577DD' }}
            rows={[
              { label: 'Merchant status', value: 'Authorized', color: '#34D399', bold: true },
              { label: 'Connected', value: 'Apr 25, 2026', mono: true },
            ]}
            ctaLabel="Open PayPal ↗" ctaColor="blue" />
          <ProviderCard name="Venmo Business" sub="Dashboard Shortcut"
            isShortcut
            icon={{ letter: 'V', color: '#5577DD' }}
            rows={[
              { label: 'Profile', value: '@vaifcnorth', color: '#5577DD', mono: true },
              { label: '', value: 'Dashboard access only.', color: '#8888A0' },
            ]}
            ctaLabel="Open Venmo ↗" ctaColor="blue" />
        </div>
        {/* Import club data */}
        <div style={{ background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #1e1e26', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 16, color: '#F5F0EB' }}>Import Club Data</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <GhostBtn>Preview Import</GhostBtn>
              <PrimaryBtn>Commit Staged</PrimaryBtn>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '1px solid #1e1e26' }}>
            {[
              { v: '47', l: 'TOTAL ROWS', c: '#F5F0EB' },
              { v: '44', l: 'VALID', c: '#34D399' },
              { v: '02', l: 'WARNINGS', c: '#FBBF24' },
              { v: '01', l: 'ERRORS', c: '#FF6B6B' },
            ].map((s, i) => (
              <div key={i} style={{ padding: '18px', textAlign: 'center', borderRight: i < 3 ? '1px solid #1e1e26' : 'none' }}>
                <div style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 28, color: s.c, lineHeight: 1 }}>{s.v}</div>
                <div className="mono-label" style={{ marginTop: 6 }}>{s.l}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: '12px 20px', display: 'grid', gridTemplateColumns: '40px 2fr 2fr 1fr 1fr', gap: 16,
            fontFamily: 'JetBrains Mono', fontSize: 9.5, fontWeight: 600, letterSpacing: '0.1em', color: '#8888A0', textTransform: 'uppercase' }}>
            <span>#</span><span>Athlete</span><span>Guardian Email</span><span>Team</span><span>Status</span>
          </div>
          {[
            { n: 1, name: 'Mia Torres', email: 'p.torres@gmail.com', team: 'U12 Blue', status: 'valid', kind: 'green' },
            { n: 2, name: 'Jake Liu', email: 'j.liu@example.com', team: 'U12 Blue', status: 'valid', kind: 'green' },
            { n: 3, name: 'Sofia Reyes', email: 's.reyes@gmail.com', team: 'U15 Soccer', status: 'warning', kind: 'yellow' },
          ].map((r, i) => (
            <div key={i} style={{ padding: '12px 20px', display: 'grid', gridTemplateColumns: '40px 2fr 2fr 1fr 1fr', gap: 16, alignItems: 'center', borderTop: '1px solid #15151c' }}>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: '#8888A0' }}>{r.n}</span>
              <span style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: 13, color: '#F5F0EB' }}>{r.name}</span>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: '#C8C8D0' }}>{r.email}</span>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: '#C8C8D0' }}>{r.team}</span>
              <StatusPill kind={r.kind} label={r.status} />
            </div>
          ))}
        </div>
      </div>
    </GamedayShell>
  );
};

// ============ D6 — Finances Setup ============
const D6Setup = () => (
  <GamedayShell active="finances" breadcrumb={['VAI FC North', 'Finances · Setup']}>
    <div style={{ flex: 1, overflowY: 'auto', padding: '22px 24px 80px' }} className="no-scrollbar">
      <TabBar tabs={['Connected', 'Setup State']} active="Setup State" />
      <PageTitle title="Connect Finances"
        subtitle="Link your accounting + payment tools so AVANTI can read balances, receivables, and reconcile dues."
        action={null} />
      {/* Entity selector */}
      <div style={{ background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 12, padding: '18px 20px', marginBottom: 18 }}>
        <div className="mono-label" style={{ marginBottom: 8 }}>ENTITY</div>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '11px 14px', borderRadius: 8, background: '#060608', border: '1px solid #1e1e26',
        }}>
          <div>
            <div style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: 14, color: '#F5F0EB' }}>VAI FC North LLC</div>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10.5, color: '#8888A0', letterSpacing: '0.04em', marginTop: 2 }}>EIN •• 4729 · UT, USA</div>
          </div>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: '#8888A0' }}>change ▾</span>
        </div>
      </div>
      {/* AVANTI data toggle */}
      <div style={{ background: 'rgba(5,26,16,0.4)', border: '1px solid #0D4A28', borderRadius: 12, padding: '14px 18px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
        <span className="avanti-dot"></span>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: 13.5, color: '#F5F0EB' }}>Allow AVANTI to read this data</div>
          <div style={{ fontSize: 12, color: '#8888A0', marginTop: 2 }}>Read-only. AVANTI surfaces insights and never moves money.</div>
        </div>
        <div style={{
          width: 38, height: 22, background: '#34D399', borderRadius: 99, position: 'relative', cursor: 'pointer',
        }}>
          <div style={{ position: 'absolute', top: 2, left: 18, width: 18, height: 18, background: '#000', borderRadius: 99 }}></div>
        </div>
      </div>
      {/* 4 provider connect cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {[
          { name: 'QuickBooks', sub: 'Accounting & Invoicing', letter: 'QB', color: '#34D399', desc: 'Sync invoices, receivables, and recent transactions.' },
          { name: 'Stripe', sub: 'Payments & Payouts', letter: 'S', color: '#8B9DEE', desc: 'Track balance, payouts, and pending charges.' },
          { name: 'PayPal', sub: 'Online Payments', letter: 'P', color: '#5577DD', desc: 'Authorize merchant access for read-only insights.' },
          { name: 'Venmo Business', sub: 'Dashboard Shortcut', letter: 'V', color: '#5577DD', desc: 'Quick link to your Venmo Business dashboard.' },
        ].map((p, i) => (
          <div key={i} style={{ background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 12, padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8, background: '#1a1a20',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Oswald', fontWeight: 700, fontSize: 14, color: p.color,
                }}>{p.letter}</div>
                <div>
                  <div style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 16, color: '#F5F0EB', letterSpacing: '0.005em' }}>{p.name}</div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#8888A0', letterSpacing: '0.04em', marginTop: 2 }}>{p.sub}</div>
                </div>
              </div>
              <StatusPill kind="default" label="Not Connected" />
            </div>
            <div style={{ fontSize: 12.5, color: '#C8C8D0', marginBottom: 14, lineHeight: 1.4 }}>{p.desc}</div>
            <button style={{
              width: '100%', padding: '10px',
              background: '#F7941E', color: '#000', border: 'none',
              borderRadius: 8, fontFamily: 'DM Sans', fontWeight: 600, fontSize: 13, cursor: 'pointer',
            }}>Connect {p.name} →</button>
          </div>
        ))}
      </div>
    </div>
  </GamedayShell>
);

Object.assign(window, { D2Roster, D3Schedule, D4Mentor, D5Connected, D6Setup });
