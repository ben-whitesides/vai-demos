/* global React, ReactDOM, DesignCanvas, DCSection, DCArtboard,
   B4Gameday, D2Roster, D3Schedule, D4Mentor, D5Connected, D6Setup */

const App = () => (
  <DesignCanvas title="VAI · GROUP D — GAMEDAY Web" subtitle="D1–D6 · Browser-frame mockups · 1280×820">
    <DCSection id="d1" title="D1 — GAMEDAY Overview">
      <DCArtboard id="d1-overview" label="Overview Dashboard" width={1280} height={820} background="#060608">
        <B4Gameday />
      </DCArtboard>
    </DCSection>
    <DCSection id="d2" title="D2 — GAMEDAY Roster">
      <DCArtboard id="d2-roster" label="Roster · Data table" width={1280} height={820} background="#060608">
        <D2Roster />
      </DCArtboard>
    </DCSection>
    <DCSection id="d3" title="D3 — GAMEDAY Schedule">
      <DCArtboard id="d3-schedule" label="Calendar + Sessions" width={1280} height={820} background="#060608">
        <D3Schedule />
      </DCArtboard>
    </DCSection>
    <DCSection id="d4" title="D4 — Mentor Dashboard">
      <DCArtboard id="d4-mentor" label="My Sessions · Mentor" width={1280} height={820} background="#060608">
        <D4Mentor />
      </DCArtboard>
    </DCSection>
    <DCSection id="d5d6" title="D5 / D6 — Finances">
      <DCArtboard id="d5-connected" label="Finances · Connected" width={1280} height={920} background="#060608">
        <D5Connected />
      </DCArtboard>
      <DCArtboard id="d6-setup" label="Finances · Setup" width={1280} height={920} background="#060608">
        <D6Setup />
      </DCArtboard>
    </DCSection>
  </DesignCanvas>
);

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
