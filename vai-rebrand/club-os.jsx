/* global React, MobileHeader, AvantiStrip, BottomNav, Tile, ClubHero, PageDots, SubGridRow, PlayDot, TierBadge, Badge,
   IconUsers, IconCalendar, IconChat, IconWallet, IconShield, IconActivity, IconChart, IconTrophy, IconChevR */

const { useState: useStateC } = React;

// ====== Shared sub-grid header (VAI header + sub-grid row) ======
const ClubSubHeader = ({ section, club = 'VAI FC North' }) => (
  <>
    <MobileHeader tier="mentor" />
    <div style={{ padding: '11px 18px 10px', borderBottom: '1px solid #15151c', display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontFamily: 'DM Sans', fontWeight: 500, fontSize: 13, color: '#F7941E', cursor: 'pointer' }}>← {club}</span>
      {section && <span style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 18, color: '#F5F0EB', letterSpacing: '0.005em' }}>{section}</span>}
    </div>
  </>
);

// ============ C1 — Club OS Sub-Grid Home ============
const C1ClubHome = ({ onBack }) => (
  <>
    <MobileHeader tier="mentor" />
    <SubGridRow club="VAI FC North" onBack={onBack} />
    <AvantiStrip scope="VAI FC NORTH">
      <span style={{ color: '#F5F0EB', fontWeight: 500 }}>1 athlete RED</span> — Mia blocked for Saturday.
    </AvantiStrip>
    <div style={{ padding: '14px 18px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span className="mono-label">CLUB FEATURES</span>
      <span className="mono-label" style={{ color: '#4d4d60' }}>PG 1 / 2</span>
    </div>
    <div style={{ padding: '10px 18px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      <Tile icon={IconUsers} label="Roster" sub="16 athletes" badge="1 BLOCKED" badgeVariant="red" glow="red" />
      <Tile icon={IconShield} label="Compliance" sub="13/16 signed" badge="2 OVERDUE" badgeVariant="yellow" glow="yellow" />
      <Tile icon={IconCalendar} label="Schedule" sub="Sat home game" badge="SAT" badgeVariant="orange" />
      <Tile icon={IconTrophy} label="GAMEDAY" sub="Web portal" />
      <Tile icon={IconChat} label="Chat" sub="5 unread" badge="5" badgeVariant="red" />
      <Tile icon={IconChart} label="Standings" sub="#1 · 19 pts" />
    </div>
    <PageDots count={2} active={0} />
    <BottomNav active="home" />
  </>
);

// ============ C2 — Roster ============
const C2Roster = ({ onBack }) => {
  const [filter, setFilter] = useStateC('All');
  const filters = ['All (16)', 'Active', 'Inactive', 'By Team'];
  const athletes = [
    { initials: 'MC', name: 'Mia Chen', num: 7, team: 'U15 · Soccer', tier: 'plus', play: 'red' },
    { initials: 'JL', name: 'Jake Liu', num: 4, team: 'U15 · Soccer', tier: 'free', play: 'green' },
    { initials: 'SR', name: 'Sofia Reyes', num: 11, team: 'U15 · Soccer', tier: 'free', play: 'green' },
    { initials: 'DP', name: 'Darius Powell', num: 3, team: 'U15 · Soccer', tier: 'plus', play: 'yellow' },
    { initials: 'AK', name: 'Avery Kim', num: 9, team: 'U15 · Soccer', tier: 'free', play: 'green' },
    { initials: 'TM', name: 'Tyler Moore', num: 14, team: 'U15 · Soccer', tier: 'free', play: 'red' },
  ];
  return (
    <>
      <ClubSubHeader section="Roster" />
      <AvantiStrip scope="VAI FC NORTH">
        <span style={{ color: '#F5F0EB', fontWeight: 500 }}>2 athletes RED</span> — send reminders?
        <span style={{ marginLeft: 'auto' }}></span>
      </AvantiStrip>
      <div style={{ padding: '12px 18px 10px', display: 'flex', gap: 6, overflowX: 'auto' }} className="no-scrollbar">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            background: filter === f ? '#F7941E' : '#0c0c10',
            color: filter === f ? '#000' : '#C8C8D0',
            border: filter === f ? 'none' : '1px solid #1e1e26',
            borderRadius: 999, padding: '7px 14px',
            fontFamily: 'DM Sans', fontSize: 12.5, fontWeight: 500, whiteSpace: 'nowrap', cursor: 'pointer',
          }}>{f}</button>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px 90px' }} className="no-scrollbar">
        {athletes.map((a, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px',
            background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 12, marginBottom: 8,
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 999,
              background: '#1a1a20', border: '1px solid #1e1e26',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Oswald', fontWeight: 700, fontSize: 13, color: '#F7941E',
            }}>{a.initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: 14, color: '#F5F0EB' }}>
                {a.name} <span style={{ color: '#8888A0', fontWeight: 500 }}>#{a.num}</span>
              </div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#8888A0', letterSpacing: '0.04em', marginTop: 2 }}>
                {a.team}
              </div>
            </div>
            <TierBadge tier={a.tier} />
            <PlayDot status={a.play} />
          </div>
        ))}
        <div style={{ textAlign: 'center', padding: '12px 0', fontFamily: 'JetBrains Mono', fontSize: 10, color: '#4d4d60', letterSpacing: '0.06em' }}>
          10 MORE ATHLETES ↓
        </div>
      </div>
      {/* FAB */}
      <button style={{
        position: 'absolute', right: 18, bottom: 88, zIndex: 4,
        width: 52, height: 52, borderRadius: 999, background: '#F7941E', border: 'none',
        boxShadow: '0 8px 24px -4px rgba(247,148,30,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        fontFamily: 'DM Sans', fontSize: 26, fontWeight: 400, color: '#000', lineHeight: 1, paddingBottom: 3,
      }}>+</button>
      <BottomNav active="home" />
    </>
  );
};

// ============ C3 — Compliance ============
const ComplianceSection = ({ title, signed, total, rows }) => {
  const pct = (signed / total) * 100;
  const allSigned = signed === total;
  return (
    <div style={{ padding: '14px 18px 14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 16, color: '#F5F0EB', letterSpacing: '0.01em' }}>{title}</div>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#8888A0', letterSpacing: '0.06em' }}>{signed}/{total}</div>
      </div>
      <div style={{ height: 4, background: '#15151c', borderRadius: 99, overflow: 'hidden', marginBottom: 12 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: allSigned ? '#34D399' : '#F7941E', borderRadius: 99 }}></div>
      </div>
      {allSigned ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}>
          <span style={{ color: '#34D399', fontSize: 14 }}>✓</span>
          <span style={{ fontFamily: 'DM Sans', fontSize: 13, color: '#C8C8D0' }}>All {total} signed</span>
        </div>
      ) : (
        rows.map((r, i) => {
          const c = r.status === 'overdue' ? '#FF6B6B' : r.status === 'pending' ? '#FBBF24' : '#34D399';
          const sym = r.status === 'overdue' ? '✕' : r.status === 'pending' ? '◷' : '✓';
          const lbl = r.status === 'overdue' ? 'OVERDUE' : r.status === 'pending' ? 'Pending' : r.date;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < rows.length - 1 ? '1px solid #15151c' : 'none' }}>
              <span style={{ color: c, fontFamily: 'JetBrains Mono', fontSize: 14, fontWeight: 700, width: 14, textAlign: 'center' }}>{sym}</span>
              <span style={{ flex: 1, fontFamily: 'DM Sans', fontSize: 13.5, color: '#F5F0EB' }}>{r.name}</span>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: c, letterSpacing: '0.06em' }}>{lbl}</span>
            </div>
          );
        })
      )}
    </div>
  );
};

const C3Compliance = () => (
  <>
    <ClubSubHeader section="Compliance" />
    <AvantiStrip scope="VAI FC NORTH">
      <span style={{ color: '#F5F0EB', fontWeight: 500 }}>2 waivers overdue</span> — Saturday game in 2 days.
    </AvantiStrip>
    <div style={{ flex: 1, overflowY: 'auto', padding: '0 0 90px' }} className="no-scrollbar">
      <ComplianceSection title="Liability Waiver" signed={14} total={16} rows={[
        { name: 'Mia Chen', status: 'signed', date: 'Apr 12' },
        { name: 'Tyler Moore', status: 'overdue' },
        { name: 'Darius Powell', status: 'pending' },
      ]} />
      <ComplianceSection title="Media Release" signed={16} total={16} rows={[]} />
      <ComplianceSection title="Medical Clearance" signed={13} total={16} rows={[
        { name: 'Sofia Reyes', status: 'overdue' },
        { name: 'Jake Liu', status: 'pending' },
      ]} />
      <div style={{ textAlign: 'center', fontFamily: 'JetBrains Mono', fontSize: 10, color: '#4d4d60', letterSpacing: '0.06em', padding: '4px 0 14px' }}>
        + 1 MORE PENDING
      </div>
      <ComplianceSection title="Code of Conduct" signed={16} total={16} rows={[]} />
    </div>
    <BottomNav active="home" />
  </>
);

// ============ C4 — Schedule + Live ============
const ScheduleCard = ({ kind, title, time, field, referee, score, status, statusColor }) => {
  const tagBg = kind === 'GAME' ? '#1E1000' : kind === 'PRACTICE' ? '#0c0c10' : '#051A10';
  const tagBd = kind === 'GAME' ? '#4A3200' : kind === 'PRACTICE' ? '#1e1e26' : '#0D4A28';
  const tagFg = kind === 'GAME' ? '#F7941E' : kind === 'PRACTICE' ? '#8888A0' : '#34D399';
  return (
    <div style={{ background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 12, padding: '12px 14px', marginBottom: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{
          fontFamily: 'JetBrains Mono', fontSize: 9, fontWeight: 600, letterSpacing: '0.1em',
          color: tagFg, background: tagBg, border: `1px solid ${tagBd}`, padding: '2px 7px', borderRadius: 4,
        }}>{kind}</span>
        {status === 'tournament' && <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', color: '#8888A0' }}>· TOURNAMENT MATCH</span>}
        {status === 'final' && <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', color: '#8888A0' }}>· FINAL</span>}
      </div>
      <div style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 16, color: '#F5F0EB', marginBottom: 8, letterSpacing: '0.005em' }}>{title}</div>
      {score && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '5px 10px', borderRadius: 6, marginBottom: 8,
          background: statusColor === 'live' ? '#1E1000' : statusColor === 'final' ? '#051A10' : '#0c0c10',
          border: `1px solid ${statusColor === 'live' ? '#4A3200' : statusColor === 'final' ? '#0D4A28' : '#1e1e26'}`,
        }}>
          {statusColor === 'live' && <span style={{ width: 6, height: 6, borderRadius: 99, background: '#F7941E', boxShadow: '0 0 6px #F7941E80' }}></span>}
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, fontWeight: 600, color: statusColor === 'live' ? '#F7941E' : '#34D399', letterSpacing: '0.08em' }}>
            {statusColor === 'final' ? `Final · ${score}` : score}
          </span>
          {statusColor === 'live' && <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, fontWeight: 600, color: '#F7941E', letterSpacing: '0.08em' }}>· LIVE</span>}
        </div>
      )}
      <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10.5, color: '#8888A0', letterSpacing: '0.04em' }}>
        {field}{time ? ` · ${time}` : ''}{referee ? ` · Ref: ${referee}` : ''}
      </div>
    </div>
  );
};

// fix syntax error in literal above
const C4Schedule = () => (
  <>
    <ClubSubHeader section="Schedule" />
    <AvantiStrip scope="VAI FC NORTH">
      <span style={{ color: '#F5F0EB', fontWeight: 500 }}>2 games LIVE</span> — Spring Invitational
    </AvantiStrip>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px' }}>
      <span style={{ fontFamily: 'DM Sans', fontWeight: 500, fontSize: 13, color: '#F7941E' }}>← Prev</span>
      <span style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 14, color: '#F5F0EB', letterSpacing: '0.01em' }}>Week of Apr 24</span>
      <span style={{ fontFamily: 'DM Sans', fontWeight: 500, fontSize: 13, color: '#F7941E' }}>Next →</span>
    </div>
    <div style={{ flex: 1, overflowY: 'auto', padding: '0 18px 90px' }} className="no-scrollbar">
      <ScheduleCard kind="GAME" status="tournament" title="2011 Girls Blue vs City Select"
        score="2 – 1" statusColor="live"
        field="Field 2" time="Sat Apr 26 · 9:00 AM" referee="Alex" />
      <ScheduleCard kind="PRACTICE" title="2011 Girls Blue"
        field="Field 1" time="Thu Apr 24 · 5:30 PM" />
      <ScheduleCard kind="GAME" title="2012 Boys Black vs Valley United"
        score="3 – 0" statusColor="live"
        field="Field 3" time="Sat Apr 26 · 11:00 AM" referee="Jordan" />
      <ScheduleCard kind="GAME" status="final" title="2011 Girls Blue vs FC Riverside"
        score="2 – 0" statusColor="final"
        field="Field 1" time="Wed Apr 23 · 6:00 PM" />
      <div style={{ marginTop: 4, fontFamily: 'JetBrains Mono', fontSize: 10, color: '#4d4d60', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        Tournament Match · Final
      </div>
    </div>
    <BottomNav active="home" />
  </>
);

// ============ C5 — Ref Scoring ============
const C5Ref = () => {
  const [tab, setTab] = useStateC('Goal');
  const tabs = ['Goal', 'Yellow Card', 'Sub', 'Period End'];
  const eventTypes = ['goal', 'own_goal', 'yellow_card', 'red_card', 'sub', 'period_end'];
  const [selectedType, setSelectedType] = useStateC('goal');
  return (
    <>
      <ClubSubHeader section="Live Scoring" club="Schedule" />
      {/* Scoreboard */}
      <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid #15151c' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#8888A0', letterSpacing: '0.06em', marginBottom: 4 }}>2012 BOYS BLACK</div>
            <div style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 56, color: '#F7941E', lineHeight: 1 }}>2</div>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#1E1000', border: '1px solid #4A3200', padding: '5px 10px', borderRadius: 99 }}>
            <span style={{ width: 6, height: 6, borderRadius: 99, background: '#F7941E', boxShadow: '0 0 6px #F7941E80' }}></span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, fontWeight: 600, color: '#F7941E', letterSpacing: '0.08em' }}>P2 · 67'</span>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#8888A0', letterSpacing: '0.06em', marginBottom: 4 }}>2011 GIRLS BLUE</div>
            <div style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 56, color: '#F5F0EB', lineHeight: 1 }}>1</div>
          </div>
        </div>
      </div>
      {/* Quick chips */}
      <div style={{ padding: '16px 18px 12px', display: 'flex', gap: 8, overflowX: 'auto' }} className="no-scrollbar">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: tab === t ? '#F7941E' : '#0c0c10',
            color: tab === t ? '#000' : '#C8C8D0',
            border: tab === t ? 'none' : '1px solid #1e1e26',
            borderRadius: 999, padding: '8px 16px',
            fontFamily: 'DM Sans', fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer',
          }}>{t}</button>
        ))}
      </div>
      {/* Event type form */}
      <div style={{ padding: '0 18px 12px' }}>
        <div style={{ background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 10, padding: '14px' }}>
          <div className="mono-label" style={{ marginBottom: 10 }}>EVENT TYPE</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            {eventTypes.map(t => (
              <button key={t} onClick={() => setSelectedType(t)} style={{
                background: selectedType === t ? '#1E1000' : 'transparent',
                color: selectedType === t ? '#F7941E' : '#8888A0',
                border: `1px solid ${selectedType === t ? '#4A3200' : '#1e1e26'}`,
                borderRadius: 6, padding: '5px 10px',
                fontFamily: 'JetBrains Mono', fontSize: 10.5, fontWeight: 500, cursor: 'pointer',
              }}>{t}</button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            <div>
              <div className="mono-label" style={{ marginBottom: 6 }}>MINUTE</div>
              <div style={{ background: '#060608', border: '1px solid #1e1e26', borderRadius: 8, padding: '8px 12px', fontFamily: 'JetBrains Mono', fontSize: 13, color: '#F5F0EB' }}>67'</div>
            </div>
            <div>
              <div className="mono-label" style={{ marginBottom: 6 }}>PERIOD</div>
              <div style={{ background: '#060608', border: '1px solid #1e1e26', borderRadius: 8, padding: '8px 12px', fontFamily: 'JetBrains Mono', fontSize: 13, color: '#F5F0EB' }}>2</div>
            </div>
          </div>
          <button style={{
            width: '100%', background: '#F7941E', color: '#000', border: 'none',
            padding: '11px', borderRadius: 8, fontFamily: 'DM Sans', fontWeight: 600, fontSize: 13.5, cursor: 'pointer',
          }}>Submit Event</button>
        </div>
      </div>
      {/* Event log */}
      <div style={{ padding: '4px 18px 0' }}>
        <div className="mono-label" style={{ marginBottom: 8 }}>EVENT LOG</div>
        {[
          { p: 'P1', m: '14', team: 'orange', label: 'Goal — 2012 Boys Black' },
          { p: 'P1', m: '31', team: 'blue', label: 'Goal — 2011 Girls Blue' },
          { p: 'P2', m: '58', team: 'orange', label: 'Goal — 2012 Boys Black' },
          { p: 'P2', m: '63', team: 'yellow', label: 'Yellow card — Boys Black' },
        ].map((e, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '1px solid #15151c' }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#8888A0', width: 50 }}>{e.p} · {e.m}'</span>
            <span style={{ width: 6, height: 6, borderRadius: 99, background: e.team === 'orange' ? '#F7941E' : e.team === 'blue' ? '#5577DD' : '#FBBF24' }}></span>
            <span style={{ flex: 1, fontFamily: 'DM Sans', fontSize: 13, color: '#C8C8D0' }}>{e.label}</span>
          </div>
        ))}
      </div>
      <div style={{ padding: '14px 18px 16px' }}>
        <button style={{
          width: '100%', background: '#1A0808', color: '#FF6B6B', border: '1px solid #4A1A1A',
          padding: '11px', borderRadius: 8, fontFamily: 'DM Sans', fontWeight: 600, fontSize: 13.5, cursor: 'pointer',
        }}>Finalize Match</button>
      </div>
      <BottomNav active="home" />
    </>
  );
};

// ============ C6 — Bracket Viewer ============
const BracketMatch = ({ phase, field, time, teams, status, score }) => (
  <div style={{ background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 12, padding: '12px 14px', marginBottom: 10 }}>
    <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: '#8888A0', letterSpacing: '0.1em', marginBottom: 8 }}>
      {phase} · {field} · {time}
    </div>
    {teams.map((t, i) => (
      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 0', borderBottom: i === 0 ? '1px solid #15151c' : 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#4d4d60' }}>{t.seed}</span>
          <span style={{ fontFamily: 'Oswald', fontWeight: t.winner ? 700 : 500, fontSize: 14, color: t.winner ? '#F5F0EB' : '#C8C8D0', letterSpacing: '0.005em' }}>
            {t.name}
          </span>
        </div>
        <span style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 18, color: t.winner ? '#F5F0EB' : '#8888A0' }}>{t.score}</span>
      </div>
    ))}
    <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6,
      background: status === 'live' ? '#1E1000' : '#051A10',
      border: `1px solid ${status === 'live' ? '#4A3200' : '#0D4A28'}`,
      padding: '3px 10px', borderRadius: 99,
    }}>
      {status === 'live' && <span style={{ width: 5, height: 5, borderRadius: 99, background: '#F7941E', boxShadow: '0 0 6px #F7941E80' }}></span>}
      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, fontWeight: 600, color: status === 'live' ? '#F7941E' : '#34D399', letterSpacing: '0.08em' }}>
        {status === 'live' ? `LIVE · ${score}` : `Final · ${score}`}
      </span>
    </div>
  </div>
);

const C6Bracket = () => (
  <>
    <ClubSubHeader section="Spring Invitational 2026" />
    <div style={{ padding: '4px 18px 12px' }}>
      <div style={{ fontFamily: 'DM Sans', fontSize: 12, color: '#8888A0' }}>
        Single elimination · U14 · May 10–11 · Westfield Sports Complex
      </div>
    </div>
    <div style={{ flex: 1, overflowY: 'auto', padding: '0 18px 90px' }} className="no-scrollbar">
      <div className="mono-label" style={{ marginBottom: 8 }}>SEEDINGS</div>
      <div style={{ marginBottom: 18 }}>
        {[
          { n: 1, name: '2012 Boys Black', star: false },
          { n: 2, name: '2011 Girls Blue', star: false },
          { n: 3, name: 'FC Riverside', star: true },
          { n: 4, name: 'City Select', star: false },
        ].map(s => (
          <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '8px 0', borderBottom: '1px solid #15151c' }}>
            <span style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 18, color: '#F7941E', width: 18 }}>{s.n}</span>
            <span style={{ fontFamily: 'DM Sans', fontWeight: 500, fontSize: 14, color: '#F5F0EB' }}>{s.name}</span>
            {s.star && <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#F7941E', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 4 }}>★ Guest</span>}
          </div>
        ))}
      </div>
      <div className="mono-label" style={{ marginBottom: 8 }}>BRACKET</div>
      <BracketMatch phase="QUARTERFINAL" field="FIELD A" time="MAY 10 · 9:00 AM"
        status="final" score="3–0"
        teams={[
          { seed: 1, name: '2012 Boys Black', score: 3, winner: true },
          { seed: 4, name: 'City Select', score: 0, winner: false },
        ]} />
      <BracketMatch phase="QUARTERFINAL" field="FIELD B" time="MAY 10 · 11:00 AM"
        status="final" score="2–1"
        teams={[
          { seed: 2, name: '2011 Girls Blue', score: 2, winner: true },
          { seed: 3, name: 'FC Riverside', score: 1, winner: false },
        ]} />
      <BracketMatch phase="FINAL" field="FIELD A" time="MAY 11 · 2:00 PM"
        status="live" score="2–1"
        teams={[
          { seed: 1, name: '2012 Boys Black', score: 2, winner: true },
          { seed: 2, name: '2011 Girls Blue', score: 1, winner: false },
        ]} />
    </div>
    <BottomNav active="home" />
  </>
);

Object.assign(window, { C1ClubHome, C2Roster, C3Compliance, C4Schedule, C5Ref, C6Bracket, ClubSubHeader });
