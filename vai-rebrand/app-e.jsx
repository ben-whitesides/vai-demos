/* global React, ReactDOM, DesignCanvas, DCSection, DCArtboard,
   E1WalletSettings, E2Setup, E3PayPalPending, E4Connected */

const App = () => (
  <DesignCanvas title="VAI · GROUP E — Club Financials Mobile" subtitle="E1–E4 · Connect → Onboard → Connected">
    <DCSection id="e1" title="E1 — Wallet Settings">
      <DCArtboard id="e1-wallet" label="Wallet Settings · Club Finances CTA" width={375} height={760} background="#060608">
        <E1WalletSettings />
      </DCArtboard>
    </DCSection>
    <DCSection id="e2" title="E2 — Setup">
      <DCArtboard id="e2-setup" label="Connect Finances · Entity + Providers" width={375} height={760} background="#060608">
        <E2Setup />
      </DCArtboard>
    </DCSection>
    <DCSection id="e3" title="E3 — PayPal Onboarding">
      <DCArtboard id="e3-paypal" label="3-Step Tracker · Verification Pending" width={375} height={760} background="#060608">
        <E3PayPalPending />
      </DCArtboard>
    </DCSection>
    <DCSection id="e4" title="E4 — Connected">
      <DCArtboard id="e4-connected" label="All Providers ✓ + Open in GAMEDAY" width={375} height={760} background="#060608">
        <E4Connected />
      </DCArtboard>
    </DCSection>
  </DesignCanvas>
);

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
