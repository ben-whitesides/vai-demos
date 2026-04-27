/* global React, useTweaks, VAIWingmark, IconSearch, IconBell,
   IconHome, IconUsers, IconShield, IconChart, IconActivity, IconDollar, IconCalendar, IconSparkles, IconChat, IconWallet */

const { useState: useStateF5 } = React;

// Tiny helpers
const TextPill = ({ children, color = '#8888A0', bg = '#15151c', border = '#1e1e26' }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 5,
    fontFamily: 'JetBrains Mono', fontSize: 9.5, fontWeight: 600, letterSpacing: '0.06em',
    color, background: bg, border: `1px solid ${border}`, padding: '2.5px 8px', borderRadius: 999,
  }}>{children}</span>
);

// =============== Sidebar nav model — matches GAMEDAY style ===============
const F5_NAV = [
  { section: 'OPERATIONS', items: [
    { id: 'users', label: 'Users & Tiers', icon: IconUsers, badge: '2.4k' },
    { id: 'orgs', label: 'Organizations', icon: IconShield },
    { id: 'affiliate', label: 'Affiliate Ledger', icon: IconChart, badge: '14' },
    { id: 'payouts', label: 'Payouts', icon: IconDollar },
  ]},
  { section: 'AVANTI', items: [
    { id: 'avanti', label: 'Action Log', icon: IconActivity },
    { id: 'models', label: 'Models', icon: IconSparkles },
    { id: 'flags', label: 'Feature Flags', icon: IconShield },
  ]},
  { section: 'COMPLIANCE', items: [
    { id: 'audit', label: 'Audit Log', icon: IconChart },
    { id: 'flagsmod', label: 'Moderation Queue', icon: IconChat, badge: '3' },
  ]},
];

const F5Sidebar = ({ active, onSelect }) => (
  <div style={{
    width: 220, flexShrink: 0,
    background: '#0c0c10', borderRight: '1px solid #1e1e26',
    padding: '22px 0 24px', overflowY: 'auto',
    fontFamily: 'DM Sans',
  }} className="no-scrollbar">
    <div style={{ padding: '0 22px 20px', borderBottom: '1px solid #1e1e26', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
      <VAIWingmark size={26} />
      <span style={{
        fontFamily: 'JetBrains Mono', fontSize: 9.5, fontWeight: 600, color: '#F7941E',
        letterSpacing: '0.14em', padding: '2px 7px', border: '1px solid #4A3200',
        background: '#1E1000', borderRadius: 4,
      }}>ADMIN</span>
    </div>
    {F5_NAV.map(group => (
      <div key={group.section} style={{ marginBottom: 14 }}>
        <div style={{ padding: '0 22px 8px', fontFamily: 'JetBrains Mono', fontSize: 9.5, fontWeight: 600, letterSpacing: '0.12em', color: '#4d4d60', textTransform: 'uppercase' }}>
          {group.section}
        </div>
        {group.items.map(it => {
          const isActive = active === it.id;
          return (
            <div key={it.id} onClick={() => onSelect(it.id)} style={{
              padding: '8px 22px', display: 'flex', alignItems: 'center', gap: 10,
              cursor: 'pointer', position: 'relative',
              color: isActive ? '#F7941E' : '#C8C8D0',
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

// ============ F5 — Admin Portal v2 (one big web screen) ============
const F5Admin = () => {
  const [tab, setTab] = useStateF5('users');
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#060608', color: '#F5F0EB', fontFamily: 'DM Sans', overflow: 'hidden' }}>
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* Sidebar — matches GAMEDAY exactly */}
        <F5Sidebar active={tab} onSelect={setTab} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Topbar — matches GAMEDAY pattern */}
          <div style={{
            height: 56, flexShrink: 0,
            borderBottom: '1px solid #1e1e26', background: 'rgba(6,6,8,0.85)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 24px', fontFamily: 'DM Sans',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <span style={{ color: '#8888A0', fontWeight: 500 }}>Admin</span>
              <span style={{ color: '#4d4d60' }}>›</span>
              <span style={{ color: '#F5F0EB', fontWeight: 600 }}>
                {tab === 'users' ? 'Users & Tiers' : tab === 'orgs' ? 'Organizations' : tab === 'affiliate' ? 'Affiliate Ledger' : tab === 'avanti' ? 'AVANTI · Action Log' : tab === 'payouts' ? 'Payouts' : tab === 'models' ? 'Models' : tab === 'flags' ? 'Feature Flags' : tab === 'audit' ? 'Audit Log' : 'Moderation Queue'}
              </span>
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

          {/* Main */}
          <main style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 32px', minWidth: 0 }} className="no-scrollbar">

          {tab === 'users' && (
            <>
              {/* KPI strip */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 18 }}>
                {[
                  { l: 'TOTAL USERS', v: '2,438', s: '+128 / 30D', c: '#F5F0EB', sc: '#34D399' },
                  { l: 'ACTIVE MENTORS', v: '412', s: '+22 / 30D', c: '#F5F0EB', sc: '#34D399' },
                  { l: 'PAID ORGANIZATIONS', v: '47', s: '+3 / 30D', c: '#F7941E', sc: '#34D399' },
                  { l: 'CHURN RATE', v: '2.1%', s: '−0.4 vs MAR', c: '#F5F0EB', sc: '#34D399' },
                ].map((s, i) => (
                  <div key={i} style={{ background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 10, padding: '12px 14px' }}>
                    <div className="mono-label" style={{ fontSize: 9, marginBottom: 6 }}>{s.l}</div>
                    <div style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 26, color: s.c, lineHeight: 1 }}>{s.v}</div>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: s.sc, letterSpacing: '0.05em', marginTop: 6 }}>{s.s}</div>
                  </div>
                ))}
              </div>

              {/* Toolbar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <input placeholder="Search users by name, email, or ID…" style={{
                  flex: 1, background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 8, color: '#F5F0EB',
                  padding: '8px 12px', fontFamily: 'DM Sans', fontSize: 13, outline: 'none',
                }} />
                {['Tier: ALL', 'Status: ACTIVE', 'Organization: —'].map(f => (
                  <button key={f} style={{ background: '#0c0c10', border: '1px solid #1e1e26', color: '#C8C8D0', padding: '8px 11px', borderRadius: 8, fontFamily: 'JetBrains Mono', fontSize: 10.5, fontWeight: 600, letterSpacing: '0.05em', cursor: 'pointer' }}>{f.toUpperCase()}</button>
                ))}
                <button style={{ background: '#F7941E', color: '#000', border: 'none', padding: '8px 14px', borderRadius: 8, fontFamily: 'DM Sans', fontWeight: 600, fontSize: 12.5, cursor: 'pointer' }}>+ Invite User</button>
              </div>

              {/* User table */}
              <div style={{ background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '24px 1.6fr 1.2fr 130px 110px 130px 90px', gap: 12, padding: '10px 14px', borderBottom: '1px solid #15151c', fontFamily: 'JetBrains Mono', fontSize: 9.5, fontWeight: 600, color: '#5d5d70', letterSpacing: '0.07em' }}>
                  <span></span>
                  <span>USER</span>
                  <span>ORGANIZATION</span>
                  <span>TIER</span>
                  <span>STATUS</span>
                  <span>LAST ACTIVE</span>
                  <span>AVANTI</span>
                </div>
                {[
                  { n: 'Marcus Rivera', e: 'm.rivera@vandy.edu', org: 'Vanderbilt Baseball', tier: 'MENTOR', tierC: '#F7941E', s: 'ACTIVE', sc: '#34D399', la: '2 min ago', av: 'ON' },
                  { n: 'Sarah Kim', e: 'sk@vai.app', org: '— STAFF —', tier: 'ADMIN', tierC: '#FF6B6B', s: 'ACTIVE', sc: '#34D399', la: 'Now', av: 'ON' },
                  { n: 'David Chen', e: 'dc@maple.edu', org: 'Maple Heights HS', tier: 'ORGANIZATION ADMIN', tierC: '#5577DD', s: 'ACTIVE', sc: '#34D399', la: '14 min ago', av: 'ON' },
                  { n: 'Lila Park', e: 'lila@gmail.com', org: '—', tier: 'BASIC', tierC: '#8888A0', s: 'ACTIVE', sc: '#34D399', la: '1 hr ago', av: 'OFF' },
                  { n: 'Coach J. Ortiz', e: 'jortiz@stm.org', org: 'St Mary High', tier: 'MENTOR', tierC: '#F7941E', s: 'PENDING', sc: '#FBBF24', la: '—', av: 'OFF' },
                  { n: 'Janelle Reed', e: 'janelle@maple.edu', org: 'Maple Heights HS', tier: 'ORGANIZATION MANAGER', tierC: '#5577DD', s: 'ACTIVE', sc: '#34D399', la: '4 hr ago', av: 'ON' },
                  { n: 'Anika Williams', e: 'a.williams@uci.edu', org: 'UCI Softball', tier: 'MENTOR', tierC: '#F7941E', s: 'ACTIVE', sc: '#34D399', la: '6 hr ago', av: 'ON' },
                  { n: 'C. Reynolds', e: 'creyno@gmail.com', org: '—', tier: 'VAI+', tierC: '#34D399', s: 'INACTIVE', sc: '#FF6B6B', la: '23 days ago', av: 'OFF' },
                  { n: 'Tom Bell', e: 'tom@gameday.io', org: 'GAMEDAY (paid)', tier: 'ORGANIZATION ADMIN', tierC: '#5577DD', s: 'ACTIVE', sc: '#34D399', la: '12 min ago', av: 'ON' },
                  { n: 'Riya Shah', e: 'riya@gmail.com', org: '—', tier: 'VAI+', tierC: '#34D399', s: 'ACTIVE', sc: '#34D399', la: '1 day ago', av: 'OFF' },
                ].map((u, i, arr) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '24px 1.6fr 1.2fr 130px 110px 130px 90px', gap: 12, padding: '10px 14px', borderBottom: i < arr.length - 1 ? '1px solid #15151c' : 'none', alignItems: 'center', fontSize: 12.5 }}>
                    <input type="checkbox" style={{ accentColor: '#F7941E' }} />
                    <div>
                      <div style={{ fontWeight: 600, color: '#F5F0EB' }}>{u.n}</div>
                      <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9.5, color: '#8888A0', marginTop: 2 }}>{u.e}</div>
                    </div>
                    <div style={{ color: '#C8C8D0', fontSize: 12.5 }}>{u.org}</div>
                    <TextPill color={u.tierC} bg="#0c0c10" border={u.tierC + '40'}>{u.tier}</TextPill>
                    <TextPill color={u.sc} bg={u.sc === '#34D399' ? '#051A10' : u.sc === '#FBBF24' ? '#1A1000' : '#1A0808'} border={u.sc + '40'}>● {u.s}</TextPill>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10.5, color: '#8888A0' }}>{u.la}</span>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, fontWeight: 600, color: u.av === 'ON' ? '#34D399' : '#5d5d70', letterSpacing: '0.05em' }}>{u.av === 'ON' ? '● ON' : '○ OFF'}</span>
                  </div>
                ))}
              </div>

              {/* Tier override panel */}
              <div style={{ background: '#0c0c10', border: '1px solid #4A3200', borderRadius: 10, padding: '14px 16px', marginTop: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: '#1E1000', border: '1px solid #4A3200', color: '#F7941E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Oswald', fontWeight: 700, fontSize: 14 }}>!</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 14, color: '#F5F0EB', letterSpacing: '0.005em' }}>Tier Override (selected: 2 users)</div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#8888A0', letterSpacing: '0.04em', marginTop: 3 }}>USE WITH CARE · LOGGED TO AUDIT TRAIL</div>
                </div>
                <select style={{ background: '#0a0a0e', border: '1px solid #1e1e26', color: '#F5F0EB', padding: '7px 11px', borderRadius: 7, fontFamily: 'DM Sans', fontSize: 12 }}>
                  <option>Promote → VAI+</option>
                  <option>Promote → Mentor</option>
                  <option>Promote → Organization Manager</option>
                  <option>Promote → Organization Admin</option>
                  <option>Demote → Basic</option>
                  <option>Suspend</option>
                </select>
                <button style={{ background: '#F7941E', color: '#000', border: 'none', padding: '8px 13px', borderRadius: 7, fontFamily: 'DM Sans', fontWeight: 600, fontSize: 12.5, cursor: 'pointer' }}>Apply</button>
              </div>
            </>
          )}

          {tab === 'affiliate' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 18 }}>
                {[
                  { l: 'TOTAL PAID', v: '$18,420', s: 'ALL TIME', c: '#F7941E' },
                  { l: 'PENDING PAYOUT', v: '$2,310', s: 'NEXT MAY 1', c: '#FBBF24' },
                  { l: 'ACTIVE AFFILIATES', v: '142', s: '+11 / 30D', c: '#F5F0EB' },
                  { l: 'CONVERSION', v: '24.8%', s: 'CLICK → SIGNUP', c: '#34D399' },
                ].map((s, i) => (
                  <div key={i} style={{ background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 10, padding: '12px 14px' }}>
                    <div className="mono-label" style={{ fontSize: 9, marginBottom: 6 }}>{s.l}</div>
                    <div style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 26, color: s.c, lineHeight: 1 }}>{s.v}</div>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: '#8888A0', letterSpacing: '0.05em', marginTop: 6 }}>{s.s}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ padding: '12px 14px', borderBottom: '1px solid #15151c', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 14, letterSpacing: '0.01em' }}>LEDGER · APR 2025</span>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#F7941E', letterSpacing: '0.06em', cursor: 'pointer' }}>EXPORT CSV</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '110px 1.4fr 1fr 110px 110px 90px 90px', gap: 12, padding: '9px 14px', borderBottom: '1px solid #15151c', fontFamily: 'JetBrains Mono', fontSize: 9.5, fontWeight: 600, color: '#5d5d70', letterSpacing: '0.06em' }}>
                  <span>DATE</span>
                  <span>AFFILIATE</span>
                  <span>REFERRED</span>
                  <span>EVENT</span>
                  <span>TIER</span>
                  <span>AMOUNT</span>
                  <span>STATUS</span>
                </div>
                {[
                  { d: 'APR 24', a: 'Marcus Rivera', r: 'Coach J. Ortiz', e: 'SIGNUP', t: 'MENTOR', amt: '+$15.00', s: 'PAID', sc: '#34D399' },
                  { d: 'APR 24', a: 'Sarah Kim', r: 'Tom Bell (Gameday)', e: 'SIGNUP', t: 'ORGANIZATION', amt: '+$50.00', s: 'PAID', sc: '#34D399' },
                  { d: 'APR 23', a: 'Marcus Rivera', r: 'D. Reynolds', e: 'SIGNUP', t: 'MENTOR', amt: '+$15.00', s: 'PAID', sc: '#34D399' },
                  { d: 'APR 22', a: 'Coach Z. Hill', r: 'Maple Heights HS', e: 'SIGNUP', t: 'ORGANIZATION', amt: '+$100.00', s: 'PENDING', sc: '#FBBF24' },
                  { d: 'APR 21', a: 'A. Williams', r: 'C. Patel', e: 'SIGNUP', t: 'BASIC', amt: '+$10.00', s: 'PAID', sc: '#34D399' },
                  { d: 'APR 21', a: 'Marcus Rivera', r: 'A. Williams', e: 'CONVERSION', t: 'MENTOR', amt: '+$15.00', s: 'PAID', sc: '#34D399' },
                  { d: 'APR 20', a: 'D. Chen', r: 'Vanderbilt B.', e: 'UPGRADE', t: 'ORGANIZATION', amt: '+$100.00', s: 'PENDING', sc: '#FBBF24' },
                  { d: 'APR 20', a: 'Marcus Rivera', r: 'C. Kim', e: 'SIGNUP', t: 'VAI+', amt: '+$10.00', s: 'PAID', sc: '#34D399' },
                  { d: 'APR 19', a: 'Sarah Kim', r: 'St Mary High', e: 'SIGNUP', t: 'ORGANIZATION', amt: '+$100.00', s: 'CLAWBACK', sc: '#FF6B6B' },
                  { d: 'APR 18', a: 'A. Williams', r: 'L. Park', e: 'SIGNUP', t: 'BASIC', amt: '+$10.00', s: 'PAID', sc: '#34D399' },
                ].map((r, i, arr) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '110px 1.4fr 1fr 110px 110px 90px 90px', gap: 12, padding: '10px 14px', borderBottom: i < arr.length - 1 ? '1px solid #15151c' : 'none', alignItems: 'center', fontSize: 12.5 }}>
                    <span style={{ fontFamily: 'JetBrains Mono', color: '#8888A0' }}>{r.d}</span>
                    <span style={{ color: '#F5F0EB', fontWeight: 600 }}>{r.a}</span>
                    <span style={{ color: '#C8C8D0' }}>{r.r}</span>
                    <TextPill>{r.e}</TextPill>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#8888A0' }}>{r.t}</span>
                    <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 600, color: '#34D399' }}>{r.amt}</span>
                    <TextPill color={r.sc} bg={r.sc === '#34D399' ? '#051A10' : r.sc === '#FBBF24' ? '#1A1000' : '#1A0808'} border={r.sc + '40'}>{r.s}</TextPill>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === 'avanti' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span className="avanti-dot"></span>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10.5, fontWeight: 600, color: '#34D399', letterSpacing: '0.08em' }}>AVANTI · ACTION LOG · LIVE</span>
                <span style={{ flex: 1 }}></span>
                <button style={{ background: '#0c0c10', border: '1px solid #1e1e26', color: '#C8C8D0', padding: '7px 11px', borderRadius: 7, fontFamily: 'JetBrains Mono', fontSize: 10.5, fontWeight: 600, letterSpacing: '0.05em', cursor: 'pointer' }}>SCOPE: ALL</button>
                <button style={{ background: '#0c0c10', border: '1px solid #1e1e26', color: '#C8C8D0', padding: '7px 11px', borderRadius: 7, fontFamily: 'JetBrains Mono', fontSize: 10.5, fontWeight: 600, letterSpacing: '0.05em', cursor: 'pointer' }}>LAST 24H</button>
              </div>

              {/* KPI strip */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 18 }}>
                {[
                  { l: 'ACTIONS · 24H', v: '4,820', s: 'AVG 201/HR', c: '#34D399' },
                  { l: 'INSIGHTS · 24H', v: '1,124', s: 'SHOWN TO USERS', c: '#F5F0EB' },
                  { l: 'TASKS QUEUED', v: '37', s: 'PENDING USER', c: '#F7941E' },
                  { l: 'CONFIDENCE AVG', v: '87%', s: '+3 vs MAR', c: '#34D399' },
                ].map((s, i) => (
                  <div key={i} style={{ background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 10, padding: '12px 14px' }}>
                    <div className="mono-label" style={{ fontSize: 9, marginBottom: 6 }}>{s.l}</div>
                    <div style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 26, color: s.c, lineHeight: 1 }}>{s.v}</div>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: '#8888A0', letterSpacing: '0.05em', marginTop: 6 }}>{s.s}</div>
                  </div>
                ))}
              </div>

              {/* Stream */}
              <div style={{ background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 10, overflow: 'hidden' }}>
                {[
                  { t: '14:32:18', kind: 'INSIGHT', kc: '#34D399', user: 'm.rivera@vandy', sub: 'Surfaced "low Stripe balance" alert · home strip', conf: '94%' },
                  { t: '14:31:54', kind: 'TASK', kc: '#F7941E', user: 'admin@maple.edu', sub: 'Drafted reply: 3 SafeSport reminders to families', conf: '88%' },
                  { t: '14:31:11', kind: 'READ', kc: '#5577DD', user: 'sk@vai.app', sub: 'Stripe charges + balance · scope: read-only', conf: '—' },
                  { t: '14:30:48', kind: 'INSIGHT', kc: '#34D399', user: 'tom@gameday.io', sub: 'Roster 87% complete · 2 athletes missing waivers', conf: '99%' },
                  { t: '14:30:22', kind: 'BLOCKED', kc: '#FF6B6B', user: 'lila@gmail.com', sub: 'Refused: "transfer $ to other account" — out of scope', conf: '—' },
                  { t: '14:29:51', kind: 'INSIGHT', kc: '#34D399', user: 'jortiz@stm.org', sub: 'Recovery 62% — flag tonight\'s practice intensity', conf: '82%' },
                  { t: '14:29:14', kind: 'TASK', kc: '#F7941E', user: 'm.rivera@vandy', sub: 'Auto-payout proposal queued · awaiting confirm', conf: '76%' },
                  { t: '14:28:40', kind: 'READ', kc: '#5577DD', user: 'a.williams@uci', sub: 'WHOOP recovery + sleep · last 7 days', conf: '—' },
                  { t: '14:28:02', kind: 'INSIGHT', kc: '#34D399', user: 'creyno@gmail', sub: 'Lila is at 92% practice attendance · positive nudge', conf: '91%' },
                  { t: '14:27:33', kind: 'BLOCKED', kc: '#FF6B6B', user: 'dc@maple.edu', sub: 'Refused: "post on social" — out of scope', conf: '—' },
                ].map((row, i, arr) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '90px 90px 1.2fr 1.6fr 70px 70px', gap: 12, padding: '9px 14px', borderBottom: i < arr.length - 1 ? '1px solid #15151c' : 'none', alignItems: 'center', fontSize: 12 }}>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10.5, color: '#8888A0' }}>{row.t}</span>
                    <TextPill color={row.kc} bg={row.kc === '#34D399' ? '#051A10' : row.kc === '#F7941E' ? '#1E1000' : row.kc === '#5577DD' ? '#0A1020' : '#1A0808'} border={row.kc + '40'}>{row.kind}</TextPill>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: '#C8C8D0' }}>{row.user}</span>
                    <span style={{ color: '#F5F0EB' }}>{row.sub}</span>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#8888A0', textAlign: 'right' }}>{row.conf}</span>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#F7941E', letterSpacing: '0.05em', cursor: 'pointer', textAlign: 'right' }}>VIEW</span>
                  </div>
                ))}
              </div>

              {/* Refusal explainer */}
              <div style={{ background: '#0c0c10', borderLeft: '3px solid #FF6B6B', border: '1px solid #1e1e26', borderLeftWidth: 3, borderLeftColor: '#FF6B6B', borderRadius: 10, padding: '12px 16px', marginTop: 14 }}>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, fontWeight: 600, color: '#FF6B6B', letterSpacing: '0.08em', marginBottom: 6 }}>● REFUSAL POLICY · ENFORCED</div>
                <div style={{ fontSize: 12.5, color: '#C8C8D0', lineHeight: 1.5 }}>
                  AVANTI never moves money, posts on behalf of users, or takes write actions on connected accounts. All refusals are logged with user, timestamp, and reason.
                </div>
              </div>
            </>
          )}

          {tab !== 'users' && tab !== 'affiliate' && tab !== 'avanti' && (
            <div style={{ background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 10, padding: '40px 24px', textAlign: 'center', color: '#8888A0' }}>
              <div className="mono-label" style={{ marginBottom: 8 }}>SECTION</div>
              <div style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 22, color: '#F5F0EB', letterSpacing: '0.005em' }}>{tab.toUpperCase()}</div>
              <div style={{ fontSize: 13, marginTop: 8 }}>Detail design not in this group — see other artboards.</div>
            </div>
          )}
          </main>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { F5Admin });
