/* global React, ReactDOM, F1Home, F1Affiliate, F1Payout, F2Entry, F2Provider, F2Permission, F2Success,
   F3Entry, F3Auth, F4Apple, F4Whoop, F4Garmin, F4HomeWithBio, F5Admin, Phone,
   DesignCanvas, DCSection, DCArtboard */

const { useState: useStateAppF } = React;

const Frame = ({ children }) => (
  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060608' }} className="ambient-glow">
    {children}
  </div>
);

const WebFrame = ({ children }) => (
  <div style={{ width: '100%', height: '100%', background: '#060608', display: 'flex', alignItems: 'stretch', justifyContent: 'stretch' }}>
    <div style={{ flex: 1, background: '#060608', border: '1px solid #1e1e26', borderRadius: 12, overflow: 'hidden' }}>{children}</div>
  </div>
);

const Prototype = () => {
  const [s, setS] = useStateAppF('wallet');
  const screens = {
    wallet: <F1Home />, affiliate: <F1Affiliate />, payout: <F1Payout />,
    oauthEntry: <F2Entry />, oauthProvider: <F2Provider />, oauthPerm: <F2Permission />, oauthDone: <F2Success />,
    wearables: <F3Entry />, auth: <F3Auth />,
    apple: <F4Apple />, whoop: <F4Whoop />, garmin: <F4Garmin />, homeBio: <F4HomeWithBio />,
  };
  const pills = [
    ['wallet', 'Wallet'], ['affiliate', 'Affil.'], ['payout', 'Payout'],
    ['oauthEntry', 'OAuth'], ['oauthProvider', 'Pick'], ['oauthPerm', 'Perms'], ['oauthDone', 'Done'],
    ['wearables', 'Wear.'], ['auth', 'Auth'],
    ['apple', 'Apple'], ['whoop', 'WHOOP'], ['garmin', 'Garmin'], ['homeBio', 'HomeBio'],
  ];
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }} className="ambient-glow">
      <Frame>{screens[s]}</Frame>
      <div style={{
        position: 'absolute', left: '50%', bottom: 14, transform: 'translateX(-50%)',
        display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 5, padding: 6, background: '#0c0c10', border: '1px solid #1e1e26',
        borderRadius: 14, zIndex: 10, maxWidth: '94%',
      }}>
        {pills.map(([id, l]) => (
          <button key={id} onClick={() => setS(id)} style={{
            background: s === id ? '#F7941E' : 'transparent', color: s === id ? '#000' : '#C8C8D0',
            border: 'none', borderRadius: 999, padding: '5px 10px', cursor: 'pointer',
            fontFamily: 'JetBrains Mono', fontSize: 9.5, fontWeight: 600, letterSpacing: '0.06em',
          }}>{l.toUpperCase()}</button>
        ))}
      </div>
    </div>
  );
};

const App = () => (
  <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#060608' }}>
    <DesignCanvas
      title="VAI — Group F · Wallet · OAuth · Wearables · Admin"
      subtitle="F1 Wallet (3) · F2 AVANTI Connect (4) · F3 Wearables Pair (2) · F4 Connected Devices (4) · F5 Admin Portal"
      defaultZoom={0.5}
    >
      <DCSection id="proto" title="Interactive Prototype — switch screens">
        <DCArtboard id="proto" label="Tap a pill to navigate" width={460} height={920}>
          <Prototype />
        </DCArtboard>
      </DCSection>

      <DCSection id="f1" title="F1 — VAI Wallet (Mentor)">
        <DCArtboard id="F1a" label="F1a — Wallet Home · balance · AVANTI insight · transactions" width={460} height={920}><Frame><F1Home /></Frame></DCArtboard>
        <DCArtboard id="F1b" label="F1b — Affiliate Program · referral link + ledger" width={460} height={920}><Frame><F1Affiliate /></Frame></DCArtboard>
        <DCArtboard id="F1c" label="F1c — Payout Sheet · amount / account / speed" width={460} height={920}><Frame><F1Payout /></Frame></DCArtboard>
      </DCSection>

      <DCSection id="f2" title="F2 — AVANTI Connect (OAuth flow)">
        <DCArtboard id="F2a" label="F2a — Entry · what AVANTI reads" width={460} height={920}><Frame><F2Entry /></Frame></DCArtboard>
        <DCArtboard id="F2b" label="F2b — Pick provider (Stripe/PayPal/QB/Venmo)" width={460} height={920}><Frame><F2Provider /></Frame></DCArtboard>
        <DCArtboard id="F2c" label="F2c — Stripe permissions · read-only · refusals" width={460} height={920}><Frame><F2Permission /></Frame></DCArtboard>
        <DCArtboard id="F2d" label="F2d — Connected · first AVANTI insight" width={460} height={920}><Frame><F2Success /></Frame></DCArtboard>
      </DCSection>

      <DCSection id="f3" title="F3 — Wearables Pairing">
        <DCArtboard id="F3a" label="F3a — Device select · supported + blocked" width={460} height={920}><Frame><F3Entry /></Frame></DCArtboard>
        <DCArtboard id="F3b" label="F3b — Auth prompt · WHOOP scopes" width={460} height={920}><Frame><F3Auth /></Frame></DCArtboard>
      </DCSection>

      <DCSection id="f4" title="F4 — Connected Devices · live biometrics">
        <DCArtboard id="F4a" label="F4a — Apple Watch · HR ring + recovery + VO₂" width={460} height={920}><Frame><F4Apple /></Frame></DCArtboard>
        <DCArtboard id="F4b" label="F4b — WHOOP · recovery score + strain bars" width={460} height={920}><Frame><F4Whoop /></Frame></DCArtboard>
        <DCArtboard id="F4c" label="F4c — Garmin · VO₂ + training load + activities" width={460} height={920}><Frame><F4Garmin /></Frame></DCArtboard>
        <DCArtboard id="F4d" label="F4d — Home grid w/ live bio tile" width={460} height={920}><Frame><F4HomeWithBio /></Frame></DCArtboard>
      </DCSection>

      <DCSection id="f5" title="F5 — Admin Portal v2 (web · internal)">
        <DCArtboard id="F5" label="F5 — Users · tier override · affiliate ledger · AVANTI log (use sidebar)" width={1440} height={900}><WebFrame><F5Admin /></WebFrame></DCArtboard>
      </DCSection>
    </DesignCanvas>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
