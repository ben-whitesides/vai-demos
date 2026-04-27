/* global React, Phone, StatusBar, MobileHeader, BottomNav, AvantiStrip, ActionChip,
   IconClose, IconChevR, IconCheck, IconShield */

const { useState: useStateE } = React;

// ============ Page chrome (header + back row + content) ============
const SettingsScreen = ({ title, onBack, children, hideBottomNav, footer }) => (
  <Phone>
    <MobileHeader tier="mentor" />
    {/* Back row */}
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '11px 18px 10px',
      borderBottom: '1px solid #15151c',
    }}>
      <span onClick={onBack} style={{ color: '#F7941E', fontFamily: 'JetBrains Mono', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', cursor: 'pointer' }}>← {title.toUpperCase()}</span>
    </div>
    {children}
    {footer}
    {!hideBottomNav && <BottomNav active="wallet" />}
  </Phone>
);

// === Reusable provider row ===
const ProviderRow = ({ letter, color, name, sub, status, statusKind, action, isLast }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '14px 16px',
    borderBottom: isLast ? 'none' : '1px solid #15151c',
  }}>
    <div style={{
      width: 36, height: 36, borderRadius: 8, flexShrink: 0,
      background: '#1a1a20', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Oswald', fontWeight: 700, fontSize: 14, color,
    }}>{letter}</div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: 14, color: '#F5F0EB' }}>{name}</div>
      <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9.5, color: '#8888A0', letterSpacing: '0.05em', marginTop: 2 }}>{sub}</div>
    </div>
    {status && (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '3px 9px', borderRadius: 999,
        background: statusKind === 'green' ? '#051A10' : statusKind === 'yellow' ? '#1A1000' : '#15151c',
        border: `1px solid ${statusKind === 'green' ? '#0D4A28' : statusKind === 'yellow' ? '#4A3000' : '#1e1e26'}`,
        color: statusKind === 'green' ? '#34D399' : statusKind === 'yellow' ? '#FBBF24' : '#8888A0',
        fontFamily: 'JetBrains Mono', fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
      }}>
        {statusKind === 'green' && (
          <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
            <path d="M2 6L5 9L10 3" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {status}
      </span>
    )}
    {action}
  </div>
);

// ============ E1 — Wallet Settings: Club Finances CTA ============
const E1WalletSettings = () => (
  <SettingsScreen title="Wallet · Settings" onBack={() => {}}>
    <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 90px' }} className="no-scrollbar">
      {/* Standard wallet sections (compressed) */}
      <div className="mono-label" style={{ marginBottom: 8, marginTop: 4 }}>PERSONAL WALLET</div>
      <div style={{ background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 10, marginBottom: 18 }}>
        {[
          { label: 'Bank Accounts', sub: 'Verified · Chase ••4421' },
          { label: 'Cards', sub: '2 cards on file' },
          { label: 'Payout Method', sub: 'Bank · ACH' },
          { label: 'Tax Documents', sub: '1099-K · 2025' },
        ].map((r, i, a) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '13px 16px', borderBottom: i < a.length - 1 ? '1px solid #15151c' : 'none',
          }}>
            <div>
              <div style={{ fontFamily: 'DM Sans', fontWeight: 500, fontSize: 14, color: '#F5F0EB' }}>{r.label}</div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9.5, color: '#8888A0', letterSpacing: '0.05em', marginTop: 2 }}>{r.sub}</div>
            </div>
            <IconChevR size={16} color="#4d4d60" />
          </div>
        ))}
      </div>

      {/* CLUB & ORG FINANCES — featured CTA */}
      <div className="mono-label" style={{ marginBottom: 8 }}>CLUB & ORG FINANCES</div>
      <div style={{
        background: 'linear-gradient(180deg, rgba(247,148,30,0.08) 0%, rgba(12,12,16,0) 60%), #0c0c10',
        border: '1px solid #1e1e26', borderRadius: 12,
        padding: '18px 18px 18px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: '#1E1000', border: '1px solid #4A3200',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M3 7L12 3L21 7M5 9V18M19 9V18M3 21H21M9 13V17M15 13V17M12 13V17" stroke="#F7941E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 17, color: '#F5F0EB', letterSpacing: '0.005em' }}>Connect Club Finances</div>
        </div>
        <div style={{ fontSize: 13, color: '#C8C8D0', lineHeight: 1.5, marginBottom: 14 }}>
          Link QuickBooks, Stripe, PayPal, and Venmo so AVANTI can see receivables, balances, and dues — all read-only. Open the full dashboard in <span style={{ color: '#F7941E', fontWeight: 600 }}>GAMEDAY</span> when you're ready.
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          {['QuickBooks', 'Stripe', 'PayPal', 'Venmo'].map((p) => (
            <span key={p} style={{
              padding: '4px 10px', background: '#15151c', border: '1px solid #1e1e26', borderRadius: 999,
              fontFamily: 'JetBrains Mono', fontSize: 9.5, fontWeight: 600, color: '#8888A0', letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>{p}</span>
          ))}
        </div>
        <button style={{
          width: '100%', background: '#34D399', color: '#000', border: 'none',
          padding: '13px', borderRadius: 8, fontFamily: 'DM Sans', fontWeight: 700, fontSize: 14, cursor: 'pointer',
          letterSpacing: '0.005em',
        }}>Connect Club Finances →</button>
      </div>

      <div className="mono-label" style={{ marginTop: 22, marginBottom: 8 }}>PREFERENCES</div>
      <div style={{ background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 10 }}>
        {[
          { label: 'Currency', sub: 'USD · $' },
          { label: 'Notifications', sub: 'Push · Email' },
          { label: 'Security', sub: 'Face ID · 2FA on' },
        ].map((r, i, a) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '13px 16px', borderBottom: i < a.length - 1 ? '1px solid #15151c' : 'none',
          }}>
            <div>
              <div style={{ fontFamily: 'DM Sans', fontWeight: 500, fontSize: 14, color: '#F5F0EB' }}>{r.label}</div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9.5, color: '#8888A0', letterSpacing: '0.05em', marginTop: 2 }}>{r.sub}</div>
            </div>
            <IconChevR size={16} color="#4d4d60" />
          </div>
        ))}
      </div>
    </div>
  </SettingsScreen>
);

// ============ E2 — Setup Modal ============
const E2Setup = () => (
  <SettingsScreen title="Connect Finances" onBack={() => {}} hideBottomNav>
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 24px' }} className="no-scrollbar">
      <div style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 22, color: '#F5F0EB', letterSpacing: '0.005em', marginBottom: 4 }}>Connect Finances</div>
      <div style={{ fontSize: 13, color: '#8888A0', lineHeight: 1.45, marginBottom: 16 }}>
        Choose your entity, then link tools so AVANTI can read balances and receivables.
      </div>

      {/* ENTITY */}
      <div className="mono-label" style={{ marginBottom: 8 }}>ENTITY</div>
      <div style={{
        background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 10,
        padding: '13px 14px', marginBottom: 18,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: 14, color: '#F5F0EB' }}>VAI FC North LLC</div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9.5, color: '#8888A0', letterSpacing: '0.05em', marginTop: 2 }}>EIN •• 4729 · UT, USA</div>
        </div>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: '#8888A0' }}>change ▾</span>
      </div>

      {/* AVANTI TOGGLE */}
      <div style={{
        background: 'rgba(5,26,16,0.4)', border: '1px solid #0D4A28', borderRadius: 12,
        padding: '13px 14px', marginBottom: 18,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <span className="avanti-dot" style={{ flexShrink: 0 }}></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: 13, color: '#F5F0EB' }}>Allow AVANTI to read this data</div>
          <div style={{ fontSize: 11.5, color: '#8888A0', marginTop: 2, lineHeight: 1.4 }}>Read-only insights. Never moves money.</div>
        </div>
        <div style={{ width: 36, height: 21, background: '#34D399', borderRadius: 99, position: 'relative', flexShrink: 0 }}>
          <div style={{ position: 'absolute', top: 2, left: 17, width: 17, height: 17, background: '#000', borderRadius: 99 }}></div>
        </div>
      </div>

      <div className="mono-label" style={{ marginBottom: 8 }}>PROVIDERS</div>
      <div style={{ background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 12, overflow: 'hidden' }}>
        <ProviderRow letter="QB" color="#34D399" name="QuickBooks" sub="Accounting · Invoicing"
          action={<button style={{ background: '#F7941E', color: '#000', border: 'none', borderRadius: 7, padding: '7px 12px', fontFamily: 'DM Sans', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>Connect</button>} />
        <ProviderRow letter="S" color="#8B9DEE" name="Stripe" sub="Payments · Payouts"
          action={<button style={{ background: '#F7941E', color: '#000', border: 'none', borderRadius: 7, padding: '7px 12px', fontFamily: 'DM Sans', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>Connect</button>} />
        <ProviderRow letter="P" color="#5577DD" name="PayPal" sub="Online Payments"
          action={<button style={{ background: '#F7941E', color: '#000', border: 'none', borderRadius: 7, padding: '7px 12px', fontFamily: 'DM Sans', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>Connect</button>} />
        <ProviderRow letter="V" color="#5577DD" name="Venmo Business" sub="Dashboard Shortcut" isLast
          action={<button style={{ background: 'transparent', color: '#5577DD', border: '1px solid #1A2A50', borderRadius: 7, padding: '7px 12px', fontFamily: 'DM Sans', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>Add Link</button>} />
      </div>

      <div style={{ fontSize: 11, color: '#8888A0', lineHeight: 1.5, marginTop: 14, padding: '0 4px' }}>
        Each connection opens a secure OAuth flow with the provider. VAI never stores your login credentials.
      </div>
    </div>
  </SettingsScreen>
);

// ============ E3 — PayPal Onboarding Pending ============
const E3PayPalPending = () => {
  const steps = [
    { label: 'Link generated', sub: 'Activation link sent · Apr 24', state: 'done' },
    { label: 'Verification pending', sub: 'Awaiting business verification', state: 'pending' },
    { label: 'Authorization', sub: 'Grant read-only access', state: 'locked' },
  ];
  return (
    <SettingsScreen title="PayPal · Onboarding" onBack={() => {}} hideBottomNav>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 24px' }} className="no-scrollbar">
        {/* Provider header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10, background: '#0A1020', border: '1px solid #1A2A50',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Oswald', fontWeight: 700, fontSize: 18, color: '#5577DD',
          }}>P</div>
          <div>
            <div style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 19, color: '#F5F0EB', letterSpacing: '0.005em' }}>PayPal Business</div>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10.5, color: '#FBBF24', letterSpacing: '0.06em', marginTop: 3 }}>● ONBOARDING · STEP 2 OF 3</div>
          </div>
        </div>

        {/* Yellow warning banner */}
        <div style={{
          background: '#1A1000', border: '1px solid #4A3000', borderRadius: 10,
          padding: '12px 14px', marginBottom: 22, display: 'flex', gap: 10,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
            <path d="M12 2L1 21H23L12 2Z" stroke="#FBBF24" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M12 9V14M12 17.5V18" stroke="#FBBF24" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: 13, color: '#FBBF24', marginBottom: 3 }}>Verification can take 24–48 hours</div>
            <div style={{ fontSize: 12, color: '#C8C8D0', lineHeight: 1.45 }}>PayPal will email when verification is complete. You can leave this page — we'll notify you.</div>
          </div>
        </div>

        {/* 3-step tracker */}
        <div className="mono-label" style={{ marginBottom: 10 }}>SETUP STATUS</div>
        <div style={{ position: 'relative' }}>
          {steps.map((s, i) => {
            const isDone = s.state === 'done';
            const isPending = s.state === 'pending';
            const isLocked = s.state === 'locked';
            const accent = isDone ? '#34D399' : isPending ? '#FBBF24' : '#4d4d60';
            const accentBg = isDone ? '#051A10' : isPending ? '#1A1000' : '#15151c';
            const accentBd = isDone ? '#0D4A28' : isPending ? '#4A3000' : '#1e1e26';
            return (
              <div key={i} style={{ display: 'flex', gap: 14, marginBottom: i < steps.length - 1 ? 14 : 0, position: 'relative' }}>
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div style={{
                    position: 'absolute', left: 17, top: 36, bottom: -14, width: 2,
                    background: isDone ? '#0D4A28' : '#1e1e26',
                  }}></div>
                )}
                {/* Icon */}
                <div style={{
                  width: 36, height: 36, borderRadius: 99, flexShrink: 0,
                  background: accentBg, border: `1px solid ${accentBd}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative', zIndex: 1,
                }}>
                  {isDone && (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7L5.5 10.5L12 3.5" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {isPending && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="9" stroke="#FBBF24" strokeWidth="2" />
                      <path d="M12 7V12L15 14" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  )}
                  {isLocked && (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <rect x="4" y="11" width="16" height="11" rx="2" stroke="#4d4d60" strokeWidth="2" />
                      <path d="M8 11V7C8 4.79 9.79 3 12 3C14.21 3 16 4.79 16 7V11" stroke="#4d4d60" strokeWidth="2" />
                    </svg>
                  )}
                </div>
                {/* Body */}
                <div style={{
                  flex: 1, padding: '10px 14px',
                  background: '#0c0c10', border: `1px solid ${isPending ? accentBd : '#1e1e26'}`,
                  borderRadius: 10,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                    <div style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: 13.5, color: isLocked ? '#8888A0' : '#F5F0EB' }}>{s.label}</div>
                    <span style={{
                      fontFamily: 'JetBrains Mono', fontSize: 9, fontWeight: 600, color: accent,
                      letterSpacing: '0.08em', textTransform: 'uppercase',
                    }}>{isDone ? 'DONE' : isPending ? 'IN PROGRESS' : 'LOCKED'}</span>
                  </div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#8888A0', letterSpacing: '0.04em' }}>{s.sub}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Helper text + actions */}
        <div style={{ marginTop: 22, padding: '14px', background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 10 }}>
          <div className="mono-label" style={{ marginBottom: 6 }}>NEXT STEP</div>
          <div style={{ fontSize: 13, color: '#C8C8D0', lineHeight: 1.45, marginBottom: 12 }}>
            Once PayPal completes verification, you'll grant AVANTI read-only access to balance and authorized payments.
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{
              flex: 1, background: 'transparent', color: '#F5F0EB', border: '1px solid #1e1e26',
              padding: '10px', borderRadius: 8, fontFamily: 'DM Sans', fontWeight: 500, fontSize: 13, cursor: 'pointer',
            }}>Resend Email</button>
            <button style={{
              flex: 1, background: 'transparent', color: '#FF6B6B', border: '1px solid #4A1A1A',
              padding: '10px', borderRadius: 8, fontFamily: 'DM Sans', fontWeight: 500, fontSize: 13, cursor: 'pointer',
            }}>Cancel Setup</button>
          </div>
        </div>
      </div>
    </SettingsScreen>
  );
};

// ============ E4 — Club Finances Connected ============
const E4Connected = () => (
  <SettingsScreen title="Club Finances" onBack={() => {}} hideBottomNav>
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 24px' }} className="no-scrollbar">
      {/* Hero summary */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(52,211,153,0.08) 0%, rgba(12,12,16,0) 60%), #0c0c10',
        border: '1px solid #0D4A28', borderRadius: 12,
        padding: '16px 16px',
        marginBottom: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span className="avanti-dot"></span>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9.5, fontWeight: 600, color: '#34D399', letterSpacing: '0.1em' }}>AVANTI ON · READING 4 SOURCES</div>
        </div>
        <div style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 20, color: '#F5F0EB', letterSpacing: '0.005em', marginBottom: 4 }}>VAI FC North · Connected</div>
        <div style={{ fontSize: 12.5, color: '#C8C8D0', lineHeight: 1.45 }}>
          AVANTI is now reading your QuickBooks, Stripe, PayPal, and Venmo data. Insights will surface in your Home AVANTI Strip and the GAMEDAY dashboard.
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 18 }}>
        {[
          { label: 'STRIPE BALANCE', value: '$4,280', accent: '#34D399' },
          { label: 'OUTSTANDING', value: '$1,240', accent: '#FBBF24' },
          { label: 'LAST PAYOUT', value: 'Apr 22', accent: '#F5F0EB' },
          { label: 'RECENT TXNS', value: '14', accent: '#F5F0EB' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 10, padding: '12px 13px' }}>
            <div className="mono-label" style={{ marginBottom: 6, fontSize: 8.5 }}>{s.label}</div>
            <div style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 22, color: s.accent, letterSpacing: '0.005em' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="mono-label" style={{ marginBottom: 8 }}>CONNECTED PROVIDERS</div>
      <div style={{ background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
        <ProviderRow letter="QB" color="#34D399" name="QuickBooks" sub="Connected Apr 25 · 3 invoices" status="Connected" statusKind="green" />
        <ProviderRow letter="S" color="#8B9DEE" name="Stripe" sub="Connected Apr 25 · $4,280 avail" status="Connected" statusKind="green" />
        <ProviderRow letter="P" color="#5577DD" name="PayPal" sub="Connected Apr 25 · Authorized" status="Connected" statusKind="green" />
        <ProviderRow letter="V" color="#5577DD" name="Venmo" sub="Linked · @vaifcnorth" status="Linked" statusKind="green" isLast />
      </div>

      {/* Open in GAMEDAY CTA */}
      <button style={{
        width: '100%', background: '#F7941E', color: '#000', border: 'none',
        padding: '14px', borderRadius: 10, fontFamily: 'Oswald', fontWeight: 700, fontSize: 15, cursor: 'pointer',
        letterSpacing: '0.04em', textTransform: 'uppercase',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        Open in GAMEDAY
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div style={{ textAlign: 'center', fontFamily: 'JetBrains Mono', fontSize: 9.5, color: '#8888A0', letterSpacing: '0.06em', marginTop: 8 }}>
        FULL DASHBOARD · IMPORT · RECONCILIATION
      </div>

      {/* Manage row */}
      <div style={{ marginTop: 18, padding: '14px 16px', background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: 13.5, color: '#F5F0EB' }}>Manage providers</div>
            <div style={{ fontSize: 11.5, color: '#8888A0', marginTop: 2 }}>Disconnect, re-auth, or change permissions.</div>
          </div>
          <IconChevR size={16} color="#4d4d60" />
        </div>
      </div>
    </div>
  </SettingsScreen>
);

Object.assign(window, { E1WalletSettings, E2Setup, E3PayPalPending, E4Connected });
