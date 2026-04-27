/* global React, VAIWingmark, VAIWingOnly, IconSearch, IconBell, IconHamburger, IconHome, IconWallet, IconMe, IconCalendar, IconUsers, IconChat, IconShare, IconConnect, IconLock, IconTrophy, IconChart, IconDollar, IconCheck, IconShield, IconQR, IconActivity, IconPlus, IconChevR, IconArrowL, IconArrowUp, IconDotsH, IconClose, IconSparkles, IconSend, IconGrip, IconWhistle */

// ============ PHONE SHELL ============
const Phone = ({ children, width = 375, height = 760, label }) =>
<div style={{ position: 'relative' }}>
    {label && <div className="mono-label" style={{ textAlign: 'center', marginBottom: 14, color: '#8888A0' }}>{label}</div>}
    <div style={{
    width, height, borderRadius: 44,
    background: '#0C0A09',
    border: '1px solid #1e1e26',
    boxShadow: '0 30px 80px -20px rgba(0,0,0,0.8), 0 0 0 6px #0a0a0c, 0 0 0 7px #1e1e26',
    overflow: 'hidden', position: 'relative',
    fontFamily: 'DM Sans, system-ui, sans-serif'
  }} className="ambient-glow">
      <StatusBar />
      <div style={{ position: 'absolute', inset: '44px 0 0 0', overflow: 'hidden', zIndex: 1 }}>
        {children}
      </div>
    </div>
  </div>;


const StatusBar = () =>
<div style={{
  position: 'absolute', top: 0, left: 0, right: 0, height: 44, zIndex: 5,
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '14px 28px 0',
  fontFamily: 'DM Sans', fontSize: 14, fontWeight: 600, color: '#F5F0EB'
}}>
    <span style={{ letterSpacing: '-0.01em' }}>9:41</span>
    <span style={{ color: '#8888A0', fontSize: 13, letterSpacing: '0.1em' }}>•••</span>
    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600 }}>
      <svg width="16" height="11" viewBox="0 0 16 11" fill="none"><path d="M8 1.5C5 1.5 2.7 2.7 1 4.4l1.4 1.4C3.7 4.4 5.7 3.5 8 3.5s4.3.9 5.6 2.3L15 4.4C13.3 2.7 11 1.5 8 1.5zM8 5.5c-1.7 0-3.2.7-4.3 1.8l1.4 1.4A4.1 4.1 0 0 1 8 7.5c1.1 0 2.2.4 3 1.2l1.3-1.4A6 6 0 0 0 8 5.5zM8 9.5a2 2 0 0 0-1.4.6L8 11.5l1.4-1.4A2 2 0 0 0 8 9.5z" fill="#F5F0EB" /></svg>
      WiFi
    </span>
  </div>;


// ============ MOBILE HEADER (always identical) ============
const MobileHeader = ({ tier = 'free', onSearch, onBell, onMenu }) => {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 18px 12px', borderBottom: '1px solid #15151c', position: 'relative', zIndex: 4,
      background: 'rgba(12,10,9,0.85)', backdropFilter: 'blur(8px)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <VAIWingmark size={30} />
        <span style={{ display: 'inline-flex', alignSelf: 'center', transform: 'translateY(4px)' }}>
          <TierBadge tier={tier} />
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, color: '#C8C8D0' }}>
        <span style={{ width: 20, height: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconSearch size={18} />
        </span>
        <span style={{ width: 20, height: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <IconBell size={18} />
          <span style={{ position: 'absolute', top: 1, right: 1, width: 7, height: 7, borderRadius: 99, background: '#FF6B6B', border: '1.5px solid #0C0A09' }}></span>
        </span>
        <span style={{ width: 20, height: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconHamburger size={18} />
        </span>
      </div>
    </div>);

};

// ============ TIER BADGE ============
const TierBadge = ({ tier }) => {
  if (tier === 'free') {
    return <span style={{
      fontFamily: 'JetBrains Mono', fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
      color: '#F7941E', background: '#1E1000', border: '1px solid #4A3200',
      padding: '3px 8px', borderRadius: 999
    }}>Free</span>;
  }
  if (tier === 'plus') {
    return <span style={{
      width: 20, height: 20, borderRadius: 999, background: '#34D399',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Oswald', color: '#000', margin: "4px", borderStyle: "solid", borderWidth: "0px", padding: "0px", fontWeight: "800", lineHeight: "1.4", fontSize: "26px"
    }}>+</span>;
  }
  if (tier === 'mentor') {
    return <span style={{
      width: 20, height: 20, borderRadius: 999, background: '#F7941E',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Oswald', fontWeight: 700, fontSize: 11, color: '#000'
    }}>M</span>;
  }
  if (tier === 'coach') {
    return <span style={{
      fontFamily: 'JetBrains Mono', fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
      color: '#000', background: '#F7941E', padding: '3px 8px', borderRadius: 999
    }}>Coach</span>;
  }
  return null;
};

// ============ AVANTI STRIP ============
const AvantiStrip = ({ children, scope, chips }) =>
<div style={{
  padding: '12px 18px 14px', borderBottom: '1px solid #15151c',
  background: 'rgba(5, 26, 16, 0.18)', position: 'relative', zIndex: 3
}}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
      <span className="avanti-dot"></span>
      <span style={{
      fontFamily: 'JetBrains Mono', fontSize: 10, fontWeight: 600,
      letterSpacing: '0.12em', color: '#34D399'
    }}>AVANTI</span>
      {scope && <span style={{ color: '#4d4d60', fontSize: 10 }}>·</span>}
      {scope && <span className="mono-label" style={{ color: '#8888A0' }}>{scope}</span>}
    </div>
    <div style={{ fontSize: 13.5, lineHeight: 1.45, color: '#F5F0EB', fontWeight: 400 }}>{children}</div>
    {chips &&
  <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
        {chips.map((c, i) => <ActionChip key={i} {...c} />)}
      </div>
  }
  </div>;


const ActionChip = ({ label, variant = 'orange', onClick }) => {
  if (variant === 'orange') {
    return <button onClick={onClick} style={{
      background: '#F7941E', color: '#000', border: 'none',
      padding: '8px 16px', borderRadius: 999,
      fontFamily: 'DM Sans', fontWeight: 600, fontSize: 13,
      cursor: 'pointer'
    }}>{label}</button>;
  }
  if (variant === 'muted') {
    return <button onClick={onClick} style={{
      background: 'transparent', color: '#C8C8D0',
      border: '1px solid #1e1e26',
      padding: '7px 15px', borderRadius: 999,
      fontFamily: 'DM Sans', fontWeight: 500, fontSize: 13,
      cursor: 'pointer'
    }}>{label}</button>;
  }
  return null;
};

// ============ BOTTOM NAV ============
const BottomNav = ({ active = 'home', onChange }) => {
  const items = [
  { id: 'home', label: 'Home', icon: IconHome },
  { id: 'feed', label: 'Feed', wing: true },
  { id: 'avanti', label: 'AVANTI', isAvanti: true },
  { id: 'wallet', label: 'Wallet', icon: IconWallet },
  { id: 'me', label: 'Me', icon: IconMe }];

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      background: 'rgba(6,6,8,0.92)', backdropFilter: 'blur(12px)',
      borderTop: '1px solid #1e1e26',
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      padding: '10px 8px 22px', zIndex: 5
    }}>
      {items.map((it) => {
        const isActive = active === it.id;
        if (it.isAvanti) {
          return (
            <button key={it.id} onClick={() => onChange?.(it.id)} style={{
              background: '#34D399', color: '#000',
              border: 'none', padding: '8px 18px', borderRadius: 999,
              fontFamily: 'Oswald', fontWeight: 700, fontSize: 13,
              letterSpacing: '0.08em', cursor: 'pointer',
              boxShadow: '0 0 18px -4px rgba(52,211,153,0.55)'
            }}>AVANTI</button>);

        }
        return (
          <button key={it.id} onClick={() => onChange?.(it.id)} style={{
            background: 'transparent', border: 'none',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            color: isActive ? '#F7941E' : '#8888A0',
            padding: '4px 10px', cursor: 'pointer',
            fontFamily: 'DM Sans', fontSize: 10, fontWeight: 500
          }}>
            {it.wing ? <VAIWingOnly size={18} color={isActive ? '#F7941E' : '#8888A0'} /> : <it.icon size={20} />}
            <span>{it.label}</span>
          </button>);

      })}
    </div>);

};

// ============ TILE ============
const Tile = ({ icon: I, label, sub, badge, badgeVariant = 'orange', glow, locked, onClick, big, customMode, dragging, options, dueColor, hot }) => {
  const borderColor = glow === 'green' ? 'rgba(52,211,153,0.5)' :
  glow === 'yellow' ? 'rgba(251,191,36,0.5)' :
  glow === 'red' ? 'rgba(255,107,107,0.5)' :
  '#1e1e26';
  const glowShadow = glow === 'green' ? '0 0 24px -6px rgba(52,211,153,0.5)' :
  glow === 'yellow' ? '0 0 24px -6px rgba(251,191,36,0.5)' :
  glow === 'red' ? '0 0 24px -6px rgba(255,107,107,0.5)' :
  'none';

  return (
    <button onClick={onClick} className={customMode && !dragging ? 'tile-wobble' : ''} style={{
      position: 'relative', textAlign: 'left',
      background: locked ? 'rgba(20,20,24,0.4)' : '#0c0c10',
      border: `1px solid ${borderColor}`,
      borderRadius: 12, padding: '14px 14px 13px',
      cursor: 'pointer', overflow: 'hidden',
      boxShadow: glowShadow,
      opacity: locked ? 0.55 : 1,
      transformOrigin: 'center',
      transition: customMode ? 'none' : 'transform 0.15s, box-shadow 0.15s',
      gridColumn: big ? 'span 2' : 'auto',
      minHeight: big ? 88 : 100
    }}>
      {/* top icon row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: big ? 6 : 18 }}>
        <span style={{ color: '#C8C8D0' }}>{I && <I size={18} />}</span>
        {badge && <Badge variant={badgeVariant}>{badge}</Badge>}
        {locked && !badge && <IconLock size={14} color="#8888A0" />}
        {customMode && options && <IconDotsH size={16} color="#8888A0" />}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 6 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 17, color: '#F5F0EB', lineHeight: 1.1, letterSpacing: '0.005em' }}>{label}</div>
          {sub && <div style={{ fontSize: 11.5, color: dueColor || '#8888A0', marginTop: 4, fontWeight: 500 }}>{sub}</div>}
        </div>
        {customMode && <IconGrip size={14} color="#4d4d60" />}
      </div>
      {locked &&
      <div style={{
        position: 'absolute', top: 10, right: 10,
        fontFamily: 'JetBrains Mono', fontSize: 8, fontWeight: 600,
        color: '#34D399', background: '#051A10', border: '1px solid #0D4A28',
        padding: '2px 6px', borderRadius: 999, letterSpacing: '0.08em'
      }}>VAI+</div>
      }
    </button>);

};

const Badge = ({ children, variant = 'orange' }) => {
  const styles = {
    orange: { color: '#F7941E', bg: '#1E1000', bd: '#4A3200' },
    green: { color: '#34D399', bg: '#051A10', bd: '#0D4A28' },
    red: { color: '#FF6B6B', bg: '#1A0808', bd: '#4A1A1A' },
    yellow: { color: '#FBBF24', bg: '#1A1000', bd: '#4A3000' },
    avanti: { color: '#34D399', bg: '#051A10', bd: '#0D4A28' }
  };
  const s = styles[variant] || styles.orange;
  return (
    <span style={{
      fontFamily: 'JetBrains Mono', fontSize: 8.5, fontWeight: 600,
      letterSpacing: '0.08em', textTransform: 'uppercase',
      color: s.color, background: s.bg, border: `1px solid ${s.bd}`,
      padding: '3px 7px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 4,
      whiteSpace: 'nowrap'
    }}>
      {variant === 'avanti' && <span className="avanti-dot" style={{ width: 5, height: 5 }}></span>}
      {children}
    </span>);

};

// ============ PLAY DOT ============
const PlayDot = ({ status = 'green', size = 8 }) => {
  const c = status === 'green' ? '#34D399' : status === 'yellow' ? '#FBBF24' : '#FF6B6B';
  return <span style={{ display: 'inline-block', width: size, height: size, borderRadius: 999, background: c, boxShadow: `0 0 6px ${c}80` }}></span>;
};

// ============ HERO CLUB CARD ============
const ClubHero = ({ name, sub, status = 'live', score }) =>
<div style={{
  background: '#0c0c10', border: '1px solid #4A3200',
  borderRadius: 12, padding: '14px 14px',
  boxShadow: '0 0 24px -8px rgba(247,148,30,0.3)',
  position: 'relative', overflow: 'hidden'
}}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
      <span style={{
      width: 28, height: 28, borderRadius: 8, background: '#1E1000', border: '1px solid #4A3200',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
    }}><IconTrophy size={14} stroke="#F7941E" /></span>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 16, color: '#F5F0EB', lineHeight: 1.1 }}>{name}</div>
        <div style={{ fontSize: 11.5, color: '#8888A0', marginTop: 2 }}>{sub}{score && <> · <span style={{ color: '#F5F0EB', fontFamily: 'JetBrains Mono', fontWeight: 600 }}>{score}</span></>}</div>
      </div>
    </div>
    {status === 'live' &&
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 999, background: '#1E1000', border: '1px solid #4A3200' }}>
        <span style={{ width: 6, height: 6, borderRadius: 99, background: '#F7941E', boxShadow: '0 0 6px #F7941E' }}></span>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, fontWeight: 600, color: '#F7941E', letterSpacing: '0.1em' }}>LIVE NOW</span>
      </div>
  }
  </div>;


// ============ PAGE DOTS ============
const PageDots = ({ count = 3, active = 0 }) =>
<div style={{
  position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
  display: 'flex', flexDirection: 'column', gap: 6,
  zIndex: 2, pointerEvents: 'none',
}}>
    {Array.from({ length: count }).map((_, i) =>
  <span key={i} style={{
    width: 5, height: i === active ? 18 : 5,
    borderRadius: 999,
    background: i === active ? '#F7941E' : '#2a2a32',
    transition: 'all 0.25s'
  }}></span>
  )}
  </div>;


// ============ SUB-GRID ROW ============
const SubGridRow = ({ club, onBack }) =>
<div style={{
  padding: '11px 18px 10px',
  borderBottom: '1px solid #15151c',
  display: 'flex', alignItems: 'center', gap: 12,
  background: 'rgba(6,6,8,0.5)'
}}>
    <button onClick={onBack} style={{
    background: 'transparent', border: 'none', color: '#F7941E', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'DM Sans', fontSize: 13, fontWeight: 600, padding: 0
  }}>
      <IconArrowL size={14} /> Home
    </button>
    <span style={{ color: '#2a2a32' }}>|</span>
    <span style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 16, color: '#F5F0EB' }}>{club}</span>
  </div>;


Object.assign(window, {
  Phone, MobileHeader, TierBadge, AvantiStrip, ActionChip, BottomNav,
  Tile, Badge, PlayDot, ClubHero, PageDots, SubGridRow
});