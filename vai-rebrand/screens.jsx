/* global React, MobileHeader, AvantiStrip, BottomNav, Tile, ClubHero, PageDots, SubGridRow, Badge, PlayDot,
   IconCalendar, IconUsers, IconChat, IconWallet, IconShare, IconConnect, IconLock, IconTrophy, IconChart,
   IconDollar, IconShield, IconQR, IconActivity, IconWhistle, IconSparkles, IconPlus, IconDotsH, IconClose,
   IconResize, IconReplace, IconHide, IconReset, IconMove, IconGrip, IconChevR, IconArrowUp, IconCheck, IconSend,
   VAIWingmark */

const { useState } = React;

// ============= A1 — Home: Free Tier =============
const A1Free = ({ onTileTap, activeNav, setActiveNav }) => {
  const [page, setPage] = useState(0);
  return (
    <>
      <MobileHeader tier="free" />
      <AvantiStrip scope="VAI">
        <span style={{ color: '#C8C8D0' }}>Welcome to VAI. </span>
        <span style={{ color: '#F5F0EB', fontWeight: 500 }}>Join a club to unlock Schedule, Wallet & more.</span>
      </AvantiStrip>
      <div style={{ padding: '14px 18px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="mono-label">YOUR VAI</span>
        <span className="mono-label" style={{ color: '#F7941E' }}>+ CUSTOMIZE</span>
      </div>
      <div style={{ padding: '10px 18px 0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', width: '300%', transform: `translateX(-${page * 33.333}%)`, transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)' }}>
          <div style={{ width: '33.333%', padding: '0 0 0 0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Tile icon={IconUsers} label="Groups" sub="Builder Club" badge="3" />
              <Tile icon={IconCalendar} label="Schedule" sub="2 events" badge="SAT" badgeVariant="orange" />
              <Tile icon={IconChat} label="Chat" sub="5 unread" badge="5" badgeVariant="red" />
              <Tile icon={IconWallet} label="Wallet" sub="$0 · 0 refs" />
              <Tile icon={IconShare} label="Share" sub="Refer & earn" badge="EARN" badgeVariant="green" />
              <Tile icon={IconConnect} label="Connect" sub="Unlock" locked />
            </div>
          </div>
          <div style={{ width: '33.333%' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Tile icon={IconActivity} label="PLAY Status" sub="GREEN · Clear" />
              <Tile icon={IconTrophy} label="Leagues" sub="Browse" />
              <Tile icon={IconShield} label="Passport" sub="1 grant" />
              <Tile icon={IconChart} label="Stats" sub="Unlock" locked />
              <Tile icon={IconDollar} label="Earnings" sub="VAI+" locked />
              <Tile icon={IconQR} label="My QR" sub="Show ID" />
            </div>
          </div>
          <div style={{ width: '33.333%' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Tile icon={IconSparkles} label="AVANTI Connect" sub="Unlock" locked />
              <Tile icon={IconPlus} label="Add Tile" sub="Browse all" />
            </div>
          </div>
        </div>
      </div>
      <PageDots count={3} active={page} />
      <BottomNav active={activeNav} onChange={setActiveNav} />
    </>
  );
};

// ============= A2 — Home: VAI+ (Club Member) =============
const A2Plus = ({ onTileTap, activeNav, setActiveNav, onClubDrill }) => (
  <>
    <MobileHeader tier="plus" />
    <AvantiStrip scope="VAI FC NORTH" chips={[
      { label: 'Yes, send it', variant: 'orange' },
      { label: 'Later', variant: 'muted' },
    ]}>
      <span style={{ color: '#F5F0EB', fontWeight: 500 }}>Saturday game</span> — Mia's payment is <span style={{ color: '#FF6B6B', fontWeight: 600 }}>RED</span> for VAI FC North. Want me to send a reminder?
    </AvantiStrip>
    <div style={{ padding: '14px 18px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span className="mono-label">YOUR VAI</span>
      <span className="mono-label" style={{ color: '#F7941E' }}>+ CUSTOMIZE</span>
    </div>
    <div style={{ padding: '10px 18px 0' }}>
      <div onClick={onClubDrill} style={{ cursor: 'pointer', marginBottom: 10 }}>
        <ClubHero name="Spring Invitational" sub="VAI FC North · Final" score="2–1" status="live" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Tile icon={IconUsers} label="Groups" sub="Builder Club" badge="3" />
        <Tile icon={IconCalendar} label="Schedule" sub="Sat 10am" badge="SAT" />
        <Tile icon={IconWallet} label="Wallet" sub="$247" />
        <Tile icon={IconConnect} label="Connect" sub="3 active" badge="$ 18" badgeVariant="green" />
        <Tile icon={IconShare} label="Share" sub="3 referred" badge="EARN" badgeVariant="green" />
        <Tile icon={IconActivity} label="PLAY Status" sub="GREEN · Clear" />
      </div>
    </div>
    <PageDots count={3} active={0} />
    <div style={{ height: 80 }}></div>
    <BottomNav active={activeNav} onChange={setActiveNav} />
  </>
);

// ============= A3 — Home: Mentor =============
const A3Mentor = ({ activeNav, setActiveNav }) => (
  <>
    <MobileHeader tier="mentor" />
    <AvantiStrip scope="MENTOR · INBOX" chips={[
      { label: 'Review bookings', variant: 'orange' },
      { label: 'Later', variant: 'muted' },
    ]}>
      <span style={{ color: '#F5F0EB', fontWeight: 500 }}>2 new booking requests</span> for Saturday. Earnings up <span style={{ color: '#34D399', fontWeight: 600 }}>+22% MTD</span>.
    </AvantiStrip>
    <div style={{ padding: '14px 18px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span className="mono-label">MENTOR TOOLS</span>
      <span className="mono-label" style={{ color: '#F7941E' }}>+ CUSTOMIZE</span>
    </div>
    <div style={{ padding: '10px 18px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      <Tile icon={IconCalendar} label="Bookings" sub="2 new" badge="2 NEW" badgeVariant="orange" />
      <Tile icon={IconDollar} label="Earnings" sub="$2,361 · MTD"
        badge="+22%" badgeVariant="green" />
      <Tile icon={IconChat} label="Chat" sub="3 unread" badge="3" badgeVariant="red" />
      <Tile icon={IconShare} label="Share" sub="Mentor link" />
      <Tile icon={IconActivity} label="PLAY Status" sub="GREEN · Clear" />
      <Tile icon={IconWallet} label="Wallet" sub="$612 pending" />
    </div>
    <PageDots count={3} active={0} />
    <div style={{ height: 60 }}></div>
    <BottomNav active={activeNav} onChange={setActiveNav} />
  </>
);

// ============= A4 — Club Sub-Grid =============
const A4Club = ({ activeNav, setActiveNav, onBack, onTileTap }) => (
  <>
    <MobileHeader tier="plus" />
    <SubGridRow club="VAI FC North" onBack={onBack} />
    <AvantiStrip scope="VAI FC NORTH" chips={[
      { label: 'Send reminder', variant: 'orange' },
    ]}>
      <span style={{ color: '#F5F0EB', fontWeight: 500 }}>1 athlete RED</span> — Mia blocked for Saturday.
    </AvantiStrip>
    <div style={{ padding: '14px 18px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span className="mono-label">CLUB FEATURES</span>
      <span className="mono-label" style={{ color: '#8888A0' }}>VAI FC NORTH</span>
    </div>
    <div style={{ padding: '10px 18px 0' }}>
      <div onClick={onTileTap} style={{ cursor: 'pointer', marginBottom: 10 }}>
        <ClubHero name="Spring Invitational" sub="Final · 12 min left" score="2–1" status="live" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Tile icon={IconUsers} label="Roster" sub="16 · 1 blocked" badge="1 BLOCKED" badgeVariant="red" />
        <Tile icon={IconChart} label="Standings" sub="#1 · Spring 2026" />
        <Tile icon={IconCalendar} label="Schedule" sub="Home 10am" badge="SAT" />
        <Tile icon={IconActivity} label="PLAY Status" sub="15 ✓ · 1 ⨯" badge="ACTION" badgeVariant="orange" />
        <Tile icon={IconChat} label="Chat" sub="2 drafts" />
        <Tile icon={IconShield} label="Compliance" sub="2 overdue" badge="2" badgeVariant="red" />
      </div>
    </div>
    <PageDots count={2} active={0} />
    <div style={{ height: 60 }}></div>
    <BottomNav active={activeNav} onChange={setActiveNav} />
  </>
);

// ============= A5a — Customize: Normal home with options dot =============
const A5Normal = ({ activeNav, setActiveNav, onCustomize }) => (
  <>
    <MobileHeader tier="mentor" />
    <AvantiStrip scope="MENTOR">
      <span style={{ color: '#F5F0EB', fontWeight: 500 }}>3 athletes not GREEN</span> for Saturday — send reminders?
    </AvantiStrip>
    <div style={{ padding: '14px 18px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span className="mono-label">YOUR VAI</span>
      <button onClick={onCustomize} style={{
        background: 'transparent', border: 'none', color: '#F7941E', cursor: 'pointer',
        fontFamily: 'JetBrains Mono', fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', padding: 0,
      }}>+ CUSTOMIZE</button>
    </div>
    <div style={{ padding: '10px 18px 0' }}>
      <div style={{ marginBottom: 10 }}>
        <ClubHero name="VAI FC North" sub="Spring Invitational · Live" score="2–1" status="live" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Tile icon={IconUsers} label="Roster" sub="16 athletes" options />
        <Tile icon={IconCalendar} label="Schedule" sub="2 events" options />
        <Tile icon={IconChat} label="Chat" sub="3 unread" options />
        <Tile icon={IconWallet} label="Wallet" sub="$247 · 3 refs" options />
      </div>
    </div>
    <PageDots count={3} active={0} />
    <div style={{ height: 100 }}></div>
    <BottomNav active={activeNav} onChange={setActiveNav} />
  </>
);

// ============= A5b — Edit mode (wobble) =============
const A5Edit = ({ activeNav, setActiveNav, onDone }) => (
  <>
    <MobileHeader tier="mentor" />
    <div style={{
      padding: '12px 18px', background: '#1E1000', borderTop: '1px solid #4A3200', borderBottom: '1px solid #4A3200',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', color: '#F7941E', marginBottom: 2 }}>EDIT MODE</div>
        <div style={{ fontSize: 12.5, color: '#F5F0EB' }}>Drag to move · ··· for options</div>
      </div>
      <button onClick={onDone} style={{
        background: '#F7941E', color: '#000', border: 'none',
        padding: '8px 18px', borderRadius: 8, fontFamily: 'Oswald', fontWeight: 700, fontSize: 13, letterSpacing: '0.05em', cursor: 'pointer',
      }}>DONE</button>
    </div>
    <div style={{ padding: '14px 18px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span className="mono-label">FROM YOU</span>
      <span className="mono-label" style={{ color: '#F7941E' }}>+ ADD TILE</span>
    </div>
    <div style={{ padding: '10px 18px 0' }}>
      <div className="tile-wobble" style={{
        background: '#0c0c10', border: '1px solid #4A3200', borderRadius: 12,
        padding: '14px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10,
        boxShadow: '0 0 20px -8px rgba(247,148,30,0.4)',
      }}>
        <span style={{ width: 28, height: 28, borderRadius: 8, background: '#1E1000', border: '1px solid #4A3200',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconTrophy size={14} stroke="#F7941E"/>
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 16, color: '#F5F0EB', lineHeight: 1.1 }}>VAI FC North</div>
          <div style={{ fontSize: 11.5, color: '#8888A0', marginTop: 3 }}>Spring Invitational · Live</div>
        </div>
        <IconGrip size={14} color="#4d4d60" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Tile icon={IconUsers} label="Roster" sub="16 athletes" customMode options />
        <Tile icon={IconCalendar} label="Schedule" sub="2 events" customMode options />
        <Tile icon={IconChat} label="Chat" sub="3 unread" customMode options />
        <Tile icon={IconWallet} label="Wallet" sub="$247 · 3 refs" customMode options />
      </div>
    </div>
    <PageDots count={3} active={0} />
    <div style={{ height: 100 }}></div>
    <BottomNav active={activeNav} onChange={setActiveNav} />
  </>
);

// ============= A5c — Card options bottom sheet =============
const A5Options = () => (
  <>
    <MobileHeader tier="mentor" />
    <AvantiStrip scope="MENTOR">
      <span style={{ color: '#C8C8D0' }}>Drag to new position…</span>
    </AvantiStrip>
    <div style={{ padding: '14px 18px 0', position: 'relative' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, opacity: 0.45 }}>
        <Tile icon={IconUsers} label="Roster" sub="16 athletes" />
        <Tile icon={IconCalendar} label="Schedule" sub="2 events" />
      </div>
    </div>
    {/* dim backdrop */}
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }}></div>
    {/* bottom sheet */}
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      background: '#141418', borderTop: '1px solid #1e1e26',
      borderRadius: '20px 20px 0 0',
      padding: '12px 0 28px',
      animation: 'sheetSlide 0.3s ease-out',
    }}>
      <div style={{ width: 36, height: 4, borderRadius: 99, background: '#2a2a32', margin: '4px auto 14px' }}></div>
      <div style={{ padding: '0 20px 8px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 28, height: 28, borderRadius: 7, background: '#1a1a20', border: '1px solid #1e1e26',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconUsers size={14} color="#C8C8D0"/>
        </span>
        <div>
          <div style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 16, color: '#F5F0EB' }}>Roster</div>
          <div style={{ fontSize: 11, color: '#8888A0' }}>Card options</div>
        </div>
      </div>
      {[
        { I: IconMove, label: 'Drag to new position', sub: '' },
        { I: IconResize, label: 'Resize Card', sub: 'Standard · Wide · Large' },
        { I: IconReplace, label: 'Replace Card', sub: 'Swap with another feature' },
        { I: IconHide, label: 'Hide Card', sub: 'Remove from your home' },
        { I: IconReset, label: 'Reset Home Layout', sub: 'Restore role default grid', danger: true },
      ].map((it, i) => (
        <button key={i} style={{
          width: '100%', textAlign: 'left',
          background: 'transparent', border: 'none', borderTop: '1px solid #1e1e26',
          padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14,
          cursor: 'pointer',
        }}>
          <span style={{ color: it.danger ? '#FF6B6B' : '#C8C8D0' }}><it.I size={18} /></span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: it.danger ? '#FF6B6B' : '#F5F0EB' }}>{it.label}</div>
            {it.sub && <div style={{ fontSize: 11.5, color: '#8888A0', marginTop: 2 }}>{it.sub}</div>}
          </div>
        </button>
      ))}
    </div>
  </>
);

// ============= A5d — Customize Home (browse tiles) =============
const A5Browse = ({ onClose }) => {
  const [filter, setFilter] = useState('All');
  const filters = ['All', 'Coaching', 'Team', 'Game Day', 'Payments', 'Recruiting', 'Performance'];
  const tiles = [
    { I: IconUsers, label: 'Roster', cat: 'Team' },
    { I: IconCalendar, label: 'Schedule', cat: 'Team' },
    { I: IconWallet, label: 'Wallet', cat: 'Payments' },
    { I: IconShield, label: 'Compliance', cat: 'Coaching' },
    { I: IconActivity, label: 'PLAY Status', cat: 'Performance' },
    { I: IconWhistle, label: 'Ref View', cat: 'Game Day' },
    { I: IconTrophy, label: 'Standings', cat: 'Game Day' },
    { I: IconShare, label: 'Affiliate', cat: 'Recruiting' },
  ];
  const list = filter === 'All' ? tiles : tiles.filter(t => t.cat === filter);
  return (
    <>
      <div style={{
        padding: '14px 18px', borderBottom: '1px solid #15151c',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 18, color: '#F5F0EB' }}>Customize Home</div>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#8888A0', cursor: 'pointer' }}>
          <IconClose size={18} />
        </button>
      </div>
      <div style={{ padding: '12px 18px', borderBottom: '1px solid #15151c', overflowX: 'auto' }} className="no-scrollbar">
        <div style={{ display: 'flex', gap: 8 }}>
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '6px 12px', borderRadius: 999,
              background: filter === f ? '#F7941E' : 'transparent',
              color: filter === f ? '#000' : '#C8C8D0',
              border: filter === f ? 'none' : '1px solid #1e1e26',
              fontFamily: 'DM Sans', fontWeight: 500, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap',
            }}>{f}</button>
          ))}
        </div>
      </div>
      <div style={{ padding: '14px 18px', overflowY: 'auto', maxHeight: 'calc(100% - 110px)' }} className="no-scrollbar">
        <div className="mono-label" style={{ marginBottom: 10 }}>AVAILABLE TILES · {list.length}</div>
        {list.map((t, i) => (
          <div key={i} style={{
            background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 10,
            padding: '12px 14px', marginBottom: 8,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <span style={{ width: 32, height: 32, borderRadius: 8, background: '#141418', border: '1px solid #1e1e26',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <t.I size={15} color="#C8C8D0"/>
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 15, color: '#F5F0EB' }}>{t.label}</div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: '#8888A0', marginTop: 2, letterSpacing: '0.05em' }}>{t.cat.toUpperCase()}</div>
            </div>
            <button style={{
              background: '#1E1000', border: '1px solid #4A3200', color: '#F7941E',
              borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
              fontFamily: 'DM Sans', fontWeight: 600, fontSize: 12,
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <IconPlus size={12} /> Add
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

Object.assign(window, { A1Free, A2Plus, A3Mentor, A4Club, A5Normal, A5Edit, A5Options, A5Browse });
