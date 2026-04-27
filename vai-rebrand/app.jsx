/* global React, ReactDOM, A1Free, A2Plus, A3Mentor, A4Club, A5Normal, A5Edit, A5Options, A5Browse,
   AvantiOverlay, TileContext, Phone, useTweaks, TweaksPanel, TweakSection, TweakRadio,
   DesignCanvas, DCSection, DCArtboard */
const { useState, useEffect } = React;

// =================== INTERACTIVE PROTOTYPE FRAME ===================
const Prototype = ({ tier, setTier }) => {
  const [screen, setScreen] = useState('home'); // home | club | edit | options | browse
  const [activeNav, setActiveNav] = useState('home');
  const [overlay, setOverlay] = useState(null); // null | 'avanti' | 'tile-schedule' | 'tile-roster' | 'tile-wallet'

  // tab change → if AVANTI, open overlay
  const handleNavChange = (id) => {
    if (id === 'avanti') {
      setOverlay('avanti');
    } else {
      setActiveNav(id);
      setOverlay(null);
    }
  };

  let body = null;
  if (screen === 'home') {
    if (tier === 'free') body = <A1Free activeNav={activeNav} setActiveNav={handleNavChange} />;
    else if (tier === 'plus') body = <A2Plus activeNav={activeNav} setActiveNav={handleNavChange} onClubDrill={() => setScreen('club')} />;
    else if (tier === 'mentor') body = <A3Mentor activeNav={activeNav} setActiveNav={handleNavChange} />;
    else if (tier === 'coach') body = <A5Normal activeNav={activeNav} setActiveNav={handleNavChange} onCustomize={() => setScreen('edit')} />;
  } else if (screen === 'club') {
    body = <A4Club activeNav={activeNav} setActiveNav={handleNavChange} onBack={() => setScreen('home')} onTileTap={() => setOverlay('tile-schedule')} />;
  } else if (screen === 'edit') {
    body = <A5Edit activeNav={activeNav} setActiveNav={handleNavChange} onDone={() => setScreen('home')} />;
  } else if (screen === 'browse') {
    body = <A5Browse onClose={() => setScreen('home')} />;
  }

  return (
    <Phone width={390} height={812}>
      {body}
      {overlay === 'avanti' && <AvantiOverlay onClose={() => setOverlay(null)} scope={tier === 'plus' ? 'VAI FC NORTH' : 'YOUR VAI'} />}
      {overlay === 'tile-schedule' && <TileContext tile="schedule" onClose={() => setOverlay(null)} />}
      {overlay === 'tile-roster' && <TileContext tile="roster" onClose={() => setOverlay(null)} />}
      {overlay === 'tile-wallet' && <TileContext tile="wallet" onClose={() => setOverlay(null)} />}
    </Phone>
  );
};

// =================== APP ===================
const App = () => {
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "tier": "plus",
    "activeScreen": "prototype"
  }/*EDITMODE-END*/;
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#060608' }}>
      <DesignCanvas
        title="VAI — Group A · Home"
        subtitle="Mobile · Free · VAI+ · Mentor · Club Sub-Grid · Customize · Interactive Prototype"
        defaultZoom={0.55}
      >
        {/* INTERACTIVE PROTOTYPE — pinned first */}
        <DCSection id="proto" title="Interactive Prototype">
          <DCArtboard id="proto-frame" label="Tap nav · drill into club · open AVANTI" width={460} height={920}>
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060608' }} className="ambient-glow">
              <Prototype tier={tweaks.tier} setTier={(t) => setTweak('tier', t)} />
            </div>
          </DCArtboard>
        </DCSection>

        {/* GROUP A SCREENS */}
        <DCSection id="group-a-tier" title="A1 / A2 / A3 — Home, all tiers">
          <DCArtboard id="A1" label="A1 — Free Tier" width={460} height={900}>
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060608' }} className="ambient-glow">
              <StaticFrame><A1Free activeNav="home" setActiveNav={() => {}} /></StaticFrame>
            </div>
          </DCArtboard>
          <DCArtboard id="A2" label="A2 — VAI+ Tier (Club Member)" width={460} height={900}>
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060608' }} className="ambient-glow">
              <StaticFrame><A2Plus activeNav="home" setActiveNav={() => {}} onClubDrill={() => {}} /></StaticFrame>
            </div>
          </DCArtboard>
          <DCArtboard id="A3" label="A3 — Mentor Tier" width={460} height={900}>
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060608' }} className="ambient-glow">
              <StaticFrame><A3Mentor activeNav="home" setActiveNav={() => {}} /></StaticFrame>
            </div>
          </DCArtboard>
        </DCSection>

        <DCSection id="group-a-club" title="A4 — Club Sub-Grid (drilled in)">
          <DCArtboard id="A4" label="A4 — VAI FC North" width={460} height={900}>
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060608' }} className="ambient-glow">
              <StaticFrame><A4Club activeNav="home" setActiveNav={() => {}} onBack={() => {}} onTileTap={() => {}} /></StaticFrame>
            </div>
          </DCArtboard>
          <DCArtboard id="A4-tile" label="A4 — Tile Context (Roster red)" width={460} height={900}>
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060608' }} className="ambient-glow">
              <StaticFrame>
                <A4Club activeNav="home" setActiveNav={() => {}} onBack={() => {}} onTileTap={() => {}} />
                <TileContext tile="roster" onClose={() => {}} />
              </StaticFrame>
            </div>
          </DCArtboard>
          <DCArtboard id="A4-avanti" label="A4 — AVANTI Overlay (Mode 2)" width={460} height={900}>
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060608' }} className="ambient-glow">
              <StaticFrame>
                <A4Club activeNav="avanti" setActiveNav={() => {}} onBack={() => {}} onTileTap={() => {}} />
                <AvantiOverlay scope="VAI FC NORTH" onClose={() => {}} />
              </StaticFrame>
            </div>
          </DCArtboard>
        </DCSection>

        <DCSection id="group-a-custom" title="A5 — Home Grid Customization Flow">
          <DCArtboard id="A5a" label="A5.1 — Normal w/ + Customize" width={460} height={900}>
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060608' }} className="ambient-glow">
              <StaticFrame><A5Normal activeNav="home" setActiveNav={() => {}} onCustomize={() => {}} /></StaticFrame>
            </div>
          </DCArtboard>
          <DCArtboard id="A5b" label="A5.2 — Edit mode (wobble)" width={460} height={900}>
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060608' }} className="ambient-glow">
              <StaticFrame><A5Edit activeNav="home" setActiveNav={() => {}} onDone={() => {}} /></StaticFrame>
            </div>
          </DCArtboard>
          <DCArtboard id="A5c" label="A5.3 — Card options sheet" width={460} height={900}>
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060608' }} className="ambient-glow">
              <StaticFrame><A5Options /></StaticFrame>
            </div>
          </DCArtboard>
          <DCArtboard id="A5d" label="A5.4 — Customize Home (browse)" width={460} height={900}>
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060608' }} className="ambient-glow">
              <StaticFrame><A5Browse onClose={() => {}} /></StaticFrame>
            </div>
          </DCArtboard>
        </DCSection>
      </DesignCanvas>

      <TweaksPanel title="Tweaks">
        <TweakSection title="Tier (prototype only)">
          <TweakRadio value={tweaks.tier} onChange={(v) => setTweak('tier', v)}
            options={[
              { value: 'free', label: 'Free' },
              { value: 'plus', label: 'VAI+' },
              { value: 'mentor', label: 'Mentor' },
              { value: 'coach', label: 'Coach' },
            ]} />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
};

// Wrapper that scales a phone to fill the artboard
const StaticFrame = ({ children }) => (
  <Phone width={390} height={812}>{children}</Phone>
);

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
