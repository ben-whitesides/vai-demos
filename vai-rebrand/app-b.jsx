/* global React, ReactDOM, Phone, MobileHeader, AvantiStrip, BottomNav, Tile, ClubHero, PageDots, AvantiOverlay, AvantiOverlayClub, TileContext, B4Gameday,
   IconUsers, IconCalendar, IconChat, IconWallet, IconShare, IconConnect, IconActivity, IconShield, IconChart, IconTrophy,
   useTweaks, TweaksPanel, TweakSection, TweakRadio, DesignCanvas, DCSection, DCArtboard */

const { useState } = React;

// ============ B1 — Home Grid with glow tiles (Mode 3 entry state) ============
const B3HomeGlow = () => (
  <>
    <MobileHeader tier="mentor" />
    <AvantiStrip scope="VAI FC NORTH">
      <span style={{ color: '#F5F0EB', fontWeight: 500 }}>Mia is RED</span> · tap Roster for details. 3 tiles have insights.
    </AvantiStrip>
    <div style={{ padding: '14px 18px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span className="mono-label">YOUR VAI</span>
      <span className="mono-label" style={{ color: '#F7941E' }}>+ CUSTOMIZE</span>
    </div>
    <div style={{ padding: '10px 18px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      <Tile icon={IconCalendar} label="Schedule" sub="Sat 10am" badge="AVANTI" badgeVariant="avanti" glow="green" />
      <Tile icon={IconUsers} label="Roster" sub="16 athletes" badge="1 BLOCKED" badgeVariant="red" glow="red" />
      <Tile icon={IconWallet} label="Wallet" sub="$247 · 3 pending" badge="DUES" badgeVariant="yellow" glow="yellow" />
      <Tile icon={IconChat} label="Chat" sub="5 unread" badge="5" badgeVariant="red" />
    </div>
    <div style={{ padding: '14px 18px 0', textAlign: 'center', fontFamily: 'JetBrains Mono', fontSize: 9, color: '#4d4d60', letterSpacing: '0.05em' }}>
      TILES WITH AVANTI BADGE OR COLORED GLOW HAVE ACTIVE INSIGHTS — TAP TO SEE
    </div>
    <PageDots count={3} active={0} />
    <BottomNav active="home" />
  </>
);

// ============ Prototype with B3 tile-tap flow ============
const Prototype = ({ overlayCtx }) => {
  const [overlay, setOverlay] = useState(null); // null | 'avanti' | 'tile-schedule' | 'tile-roster' | 'tile-wallet'
  const [activeNav, setActiveNav] = useState('home');

  const handleNav = (id) => {
    if (id === 'avanti') setOverlay('avanti');
    else { setActiveNav(id); setOverlay(null); }
  };

  return (
    <Phone width={390} height={812}>
      <MobileHeader tier="mentor" />
      <AvantiStrip scope="VAI FC NORTH">
        <span style={{ color: '#F5F0EB', fontWeight: 500 }}>3 tiles have insights</span> — tap any glowing tile to see details.
      </AvantiStrip>
      <div style={{ padding: '14px 18px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="mono-label">YOUR VAI</span>
        <span className="mono-label" style={{ color: '#F7941E' }}>+ CUSTOMIZE</span>
      </div>
      <div style={{ padding: '10px 18px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Tile icon={IconCalendar} label="Schedule" sub="Sat 10am" badge="AVANTI" badgeVariant="avanti" glow="green" onClick={() => setOverlay('tile-schedule')} />
        <Tile icon={IconUsers} label="Roster" sub="16 athletes" badge="1 BLOCKED" badgeVariant="red" glow="red" onClick={() => setOverlay('tile-roster')} />
        <Tile icon={IconWallet} label="Wallet" sub="$247 · 3 pending" badge="DUES" badgeVariant="yellow" glow="yellow" onClick={() => setOverlay('tile-wallet')} />
        <Tile icon={IconChat} label="Chat" sub="5 unread" badge="5" badgeVariant="red" />
        <Tile icon={IconActivity} label="PLAY Status" sub="GREEN · Clear" />
        <Tile icon={IconShare} label="Share" sub="3 referred" badge="EARN" badgeVariant="green" />
      </div>
      <PageDots count={3} active={0} />
      <BottomNav active={activeNav} onChange={handleNav} />
      {overlay === 'avanti' && (overlayCtx === 'club'
        ? <AvantiOverlayClub onClose={() => setOverlay(null)} />
        : <AvantiOverlay scope="YOUR VAI" onClose={() => setOverlay(null)} />)}
      {overlay === 'tile-schedule' && <TileContext tile="schedule" onClose={() => setOverlay(null)} />}
      {overlay === 'tile-roster' && <TileContext tile="roster" onClose={() => setOverlay(null)} />}
      {overlay === 'tile-wallet' && <TileContext tile="wallet" onClose={() => setOverlay(null)} />}
    </Phone>
  );
};

const StaticPhone = ({ children }) => <Phone width={390} height={812}>{children}</Phone>;

const App = () => {
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "overlayContext": "home"
  }/*EDITMODE-END*/;
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#060608' }}>
      <DesignCanvas
        title="VAI — Group B · AVANTI OS"
        subtitle="B1 Home Overlay · B2 Club Overlay · B3 Tile Context Flow · B4 GAMEDAY Web · Interactive Prototype"
        defaultZoom={0.5}
      >
        <DCSection id="proto" title="Interactive Prototype — B3 Flow">
          <DCArtboard id="proto-frame" label="Tap glowing tiles · open AVANTI nav · use Tweaks to switch overlay context" width={460} height={920}>
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060608' }} className="ambient-glow">
              <Prototype overlayCtx={tweaks.overlayContext} />
            </div>
          </DCArtboard>
        </DCSection>

        <DCSection id="b1-b2" title="B1 / B2 — AVANTI Overlay (Mode 2)">
          <DCArtboard id="B1" label="B1 — Home Context" width={460} height={920}>
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060608' }} className="ambient-glow">
              <StaticPhone>
                <MobileHeader tier="plus" />
                <div style={{ padding: '14px 18px 0', opacity: 0.4 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <Tile icon={IconUsers} label="Groups" sub="Builder Club" />
                    <Tile icon={IconCalendar} label="Schedule" sub="Sat 10am" />
                    <Tile icon={IconWallet} label="Wallet" sub="$247" />
                    <Tile icon={IconActivity} label="PLAY Status" sub="GREEN" />
                  </div>
                </div>
                <AvantiOverlay scope="YOUR VAI" onClose={() => {}} />
              </StaticPhone>
            </div>
          </DCArtboard>
          <DCArtboard id="B2" label="B2 — Club Context (urgent)" width={460} height={920}>
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060608' }} className="ambient-glow">
              <StaticPhone>
                <MobileHeader tier="plus" />
                <div style={{ padding: '14px 18px 0', opacity: 0.35 }}>
                  <ClubHero name="Spring Invitational" sub="VAI FC North · Final" score="2–1" status="live" />
                </div>
                <AvantiOverlayClub onClose={() => {}} />
              </StaticPhone>
            </div>
          </DCArtboard>
        </DCSection>

        <DCSection id="b3" title="B3 — Tile Context Panel · 3-panel flow">
          <DCArtboard id="B3-1" label="B3.1 — Glowing tiles signal insight" width={460} height={920}>
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060608' }} className="ambient-glow">
              <StaticPhone><B3HomeGlow /></StaticPhone>
            </div>
          </DCArtboard>
          <DCArtboard id="B3-2" label="B3.2 — Schedule tile (green · all clear)" width={460} height={920}>
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060608' }} className="ambient-glow">
              <StaticPhone>
                <B3HomeGlow />
                <TileContext tile="schedule" onClose={() => {}} />
              </StaticPhone>
            </div>
          </DCArtboard>
          <DCArtboard id="B3-3" label="B3.3 — Roster tile (red · action)" width={460} height={920}>
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060608' }} className="ambient-glow">
              <StaticPhone>
                <B3HomeGlow />
                <TileContext tile="roster" onClose={() => {}} />
              </StaticPhone>
            </div>
          </DCArtboard>
          <DCArtboard id="B3-4" label="B3.4 — Wallet tile (yellow · confirm)" width={460} height={920}>
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060608' }} className="ambient-glow">
              <StaticPhone>
                <B3HomeGlow />
                <TileContext tile="wallet" onClose={() => {}} />
              </StaticPhone>
            </div>
          </DCArtboard>
        </DCSection>

        <DCSection id="b4" title="B4 — AVANTI in GAMEDAY (Web)">
          <DCArtboard id="B4" label="B4 — GAMEDAY Overview · AVANTI strip + card feed + floating bubble" width={1280} height={800}>
            <B4Gameday />
          </DCArtboard>
        </DCSection>
      </DesignCanvas>

      <TweaksPanel title="Tweaks">
        <TweakSection title="AVANTI overlay context (prototype)">
          <TweakRadio value={tweaks.overlayContext} onChange={(v) => setTweak('overlayContext', v)}
            options={[
              { value: 'home', label: 'Home' },
              { value: 'club', label: 'Club' },
            ]} />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
