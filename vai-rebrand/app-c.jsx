/* global React, ReactDOM, Phone, C1ClubHome, C2Roster, C3Compliance, C4Schedule, C5Ref, C6Bracket,
   DesignCanvas, DCSection, DCArtboard, useTweaks, TweaksPanel, TweakSection, TweakRadio */

const { useState: useStateAppC } = React;

const Frame = ({ children }) => (
  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060608' }} className="ambient-glow">
    <Phone width={390} height={812}>{children}</Phone>
  </div>
);

const Prototype = () => {
  const [screen, setScreen] = useStateAppC('home');
  const screens = {
    home: <C1ClubHome onBack={() => setScreen('home')} />,
    roster: <C2Roster />,
    compliance: <C3Compliance />,
    schedule: <C4Schedule />,
    ref: <C5Ref />,
    bracket: <C6Bracket />,
  };
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }} className="ambient-glow">
      <Frame>{screens[screen]}</Frame>
      <div style={{
        position: 'absolute', left: '50%', bottom: 14, transform: 'translateX(-50%)',
        display: 'flex', gap: 6, padding: 6, background: '#0c0c10', border: '1px solid #1e1e26',
        borderRadius: 999, zIndex: 10,
      }}>
        {[
          { id: 'home', l: 'Home' },
          { id: 'roster', l: 'Roster' },
          { id: 'compliance', l: 'Comply' },
          { id: 'schedule', l: 'Sched' },
          { id: 'ref', l: 'Ref' },
          { id: 'bracket', l: 'Bracket' },
        ].map(b => (
          <button key={b.id} onClick={() => setScreen(b.id)} style={{
            background: screen === b.id ? '#F7941E' : 'transparent', color: screen === b.id ? '#000' : '#C8C8D0',
            border: 'none', borderRadius: 999, padding: '6px 12px', cursor: 'pointer',
            fontFamily: 'JetBrains Mono', fontSize: 10.5, fontWeight: 600, letterSpacing: '0.06em',
          }}>{b.l.toUpperCase()}</button>
        ))}
      </div>
    </div>
  );
};

const App = () => (
  <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#060608' }}>
    <DesignCanvas
      title="VAI — Group C · Club OS Mobile"
      subtitle="C1 Sub-Grid · C2 Roster · C3 Compliance · C4 Schedule + Live · C5 Ref Scoring · C6 Bracket"
      defaultZoom={0.55}
    >
      <DCSection id="proto" title="Interactive Prototype — switch screens">
        <DCArtboard id="proto" label="Tap a screen pill to navigate" width={460} height={920}>
          <Prototype />
        </DCArtboard>
      </DCSection>

      <DCSection id="screens" title="Group C — Club OS Mobile">
        <DCArtboard id="C1" label="C1 — Club OS Sub-Grid Home" width={460} height={920}><Frame><C1ClubHome /></Frame></DCArtboard>
        <DCArtboard id="C2" label="C2 — Roster (filters · PLAY dots · FAB)" width={460} height={920}><Frame><C2Roster /></Frame></DCArtboard>
        <DCArtboard id="C3" label="C3 — Compliance (sections + progress)" width={460} height={920}><Frame><C3Compliance /></Frame></DCArtboard>
        <DCArtboard id="C4" label="C4 — Schedule + Live View" width={460} height={920}><Frame><C4Schedule /></Frame></DCArtboard>
        <DCArtboard id="C5" label="C5 — Ref Scoring (live scoreboard + event log)" width={460} height={920}><Frame><C5Ref /></Frame></DCArtboard>
        <DCArtboard id="C6" label="C6 — Bracket Viewer" width={460} height={920}><Frame><C6Bracket /></Frame></DCArtboard>
      </DCSection>
    </DesignCanvas>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
