/* global React, Phone, MobileHeader, BottomNav, IconChevR, IconCheck */

const { useState: useStateF2 } = React;

const BackRow = ({ label }) => (
  <div style={{ padding: '11px 18px 10px', borderBottom: '1px solid #15151c' }}>
    <span style={{ color: '#F7941E', fontFamily: 'JetBrains Mono', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', cursor: 'pointer' }}>← {label.toUpperCase()}</span>
  </div>
);

// ============ F2a — OAuth Entry ============
const F2Entry = () => (
  <Phone>
    <MobileHeader tier="mentor" />
    <BackRow label="AVANTI · Connect" />
    <div style={{ flex: 1, overflowY: 'auto', padding: '18px 18px 90px', display: 'flex', flexDirection: 'column' }} className="no-scrollbar">
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(52,211,153,0.10) 0%, rgba(12,12,16,0) 70%), #0c0c10',
        border: '1px solid #0D4A28', borderRadius: 14, padding: '22px 20px',
        textAlign: 'center', marginBottom: 18,
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 12px', background: '#051A10', border: '1px solid #0D4A28', borderRadius: 999, marginBottom: 14 }}>
          <span className="avanti-dot" style={{ width: 7, height: 7 }}></span>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9.5, fontWeight: 600, color: '#34D399', letterSpacing: '0.1em' }}>AVANTI</span>
        </div>
        <div style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 24, color: '#F5F0EB', lineHeight: 1.15, letterSpacing: '0.005em', marginBottom: 8 }}>
          CONNECT YOUR ACCOUNTS
        </div>
        <div style={{ fontSize: 13.5, color: '#C8C8D0', lineHeight: 1.5, padding: '0 4px' }}>
          AVANTI surfaces insights from your data — read-only. We never move money or post on your behalf.
        </div>
      </div>

      {/* What AVANTI does */}
      <div className="mono-label" style={{ marginBottom: 8 }}>WHAT AVANTI READS</div>
      <div style={{ background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 12, padding: '6px 0' }}>
        {[
          { title: 'Balances & receivables', sub: 'Surface low-balance and overdue invoice alerts' },
          { title: 'Recent transactions', sub: 'Categorize income and reconcile payouts' },
          { title: 'Outstanding dues', sub: 'Match payments to athlete accounts' },
          { title: 'Tax-relevant activity', sub: '1099 prep · category tagging' },
        ].map((r, i, a) => (
          <div key={i} style={{
            display: 'flex', gap: 11, padding: '11px 14px',
            borderBottom: i < a.length - 1 ? '1px solid #15151c' : 'none',
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: 99, background: '#051A10', border: '1px solid #0D4A28',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
            }}>
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M2 6L5 9L10 3" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: 13, color: '#F5F0EB' }}>{r.title}</div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9.5, color: '#8888A0', letterSpacing: '0.04em', marginTop: 2 }}>{r.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Read only badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'rgba(85,119,221,0.06)', border: '1px solid #1A2A50', borderRadius: 10, marginTop: 14 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <rect x="4" y="11" width="16" height="11" rx="2" stroke="#5577DD" strokeWidth="1.8" />
          <path d="M8 11V7C8 4.79 9.79 3 12 3C14.21 3 16 4.79 16 7V11" stroke="#5577DD" strokeWidth="1.8" />
        </svg>
        <div style={{ flex: 1, fontSize: 12, color: '#C8C8D0', lineHeight: 1.4 }}>
          <span style={{ fontWeight: 600, color: '#5577DD' }}>Read-only access.</span> Revoke any time from Wallet · Connections.
        </div>
      </div>

      <button style={{
        width: '100%', marginTop: 22, background: '#34D399', color: '#000', border: 'none',
        padding: '14px', borderRadius: 10, fontFamily: 'Oswald', fontWeight: 700, fontSize: 15, cursor: 'pointer',
        letterSpacing: '0.04em', textTransform: 'uppercase',
      }}>Choose Provider →</button>
    </div>
    <BottomNav active="wallet" />
  </Phone>
);

// ============ F2b — Provider Select ============
const F2Provider = () => (
  <Phone>
    <MobileHeader tier="mentor" />
    <BackRow label="Step 1 of 3" />
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px 90px' }} className="no-scrollbar">
      <div style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 22, color: '#F5F0EB', letterSpacing: '0.005em', marginBottom: 4 }}>Pick a provider</div>
      <div style={{ fontSize: 13, color: '#8888A0', lineHeight: 1.45, marginBottom: 16 }}>You can connect more later. Each opens a secure OAuth flow with the provider.</div>

      {/* Progress bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 18 }}>
        <div style={{ flex: 1, height: 3, background: '#34D399', borderRadius: 99 }}></div>
        <div style={{ flex: 1, height: 3, background: '#15151c', borderRadius: 99 }}></div>
        <div style={{ flex: 1, height: 3, background: '#15151c', borderRadius: 99 }}></div>
      </div>

      {[
        { name: 'Stripe', sub: 'Payments · Payouts · Receivables', letter: 'S', color: '#8B9DEE', popular: true },
        { name: 'PayPal', sub: 'Online payments · Authorized merchants', letter: 'P', color: '#5577DD' },
        { name: 'QuickBooks', sub: 'Invoicing · Receivables · Reconciliation', letter: 'QB', color: '#34D399' },
        { name: 'Venmo Business', sub: 'Dashboard shortcut only', letter: 'V', color: '#5577DD', shortcut: true },
      ].map((p, i) => (
        <div key={i} style={{
          background: '#0c0c10', border: i === 0 ? '1px solid #4A3200' : '1px solid #1e1e26',
          borderRadius: 12, padding: '14px 14px', marginBottom: 10,
          display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, background: '#1a1a20',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Oswald', fontWeight: 700, fontSize: 16, color: p.color, flexShrink: 0,
          }}>{p.letter}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 16, color: '#F5F0EB', letterSpacing: '0.005em' }}>{p.name}</div>
              {p.popular && (
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8.5, fontWeight: 600, color: '#F7941E', background: '#1E1000', border: '1px solid #4A3200', padding: '1px 6px', borderRadius: 999, letterSpacing: '0.06em' }}>POPULAR</span>
              )}
              {p.shortcut && (
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8.5, fontWeight: 600, color: '#5577DD', background: '#0A1020', border: '1px solid #1A2A50', padding: '1px 6px', borderRadius: 999, letterSpacing: '0.06em' }}>SHORTCUT</span>
              )}
            </div>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9.5, color: '#8888A0', letterSpacing: '0.04em', marginTop: 3 }}>{p.sub}</div>
          </div>
          <IconChevR size={16} color="#4d4d60" />
        </div>
      ))}

      <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9.5, color: '#8888A0', letterSpacing: '0.06em', marginTop: 14, textAlign: 'center' }}>
        SOC 2 TYPE II · BANK-LEVEL ENCRYPTION
      </div>
    </div>
    <BottomNav active="wallet" />
  </Phone>
);

// ============ F2c — Permission Grant (Stripe) ============
const F2Permission = () => {
  const [avantiOn, setAvantiOn] = useStateF2(true);
  return (
    <Phone>
      <MobileHeader tier="mentor" />
      <BackRow label="Step 2 of 3" />
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px 24px' }} className="no-scrollbar">
        {/* Progress */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 18 }}>
          <div style={{ flex: 1, height: 3, background: '#34D399', borderRadius: 99 }}></div>
          <div style={{ flex: 1, height: 3, background: '#34D399', borderRadius: 99 }}></div>
          <div style={{ flex: 1, height: 3, background: '#15151c', borderRadius: 99 }}></div>
        </div>

        {/* Provider header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 11, background: 'rgba(85,119,221,0.10)', border: '1px solid #1A2A50',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Oswald', fontWeight: 700, fontSize: 20, color: '#8B9DEE',
          }}>S</div>
          <div>
            <div style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 19, color: '#F5F0EB', letterSpacing: '0.005em' }}>Stripe Permissions</div>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10.5, color: '#8888A0', letterSpacing: '0.05em', marginTop: 2 }}>Review what AVANTI will read</div>
          </div>
        </div>

        {/* Grants */}
        <div className="mono-label" style={{ marginBottom: 8 }}>READ ACCESS</div>
        <div style={{ background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 12, overflow: 'hidden' }}>
          {[
            { name: 'Account balances', sub: 'Available + pending', kind: 'read' },
            { name: 'Charges & payouts', sub: 'Last 24 months', kind: 'read' },
            { name: 'Customer + product metadata', sub: 'For categorization', kind: 'read' },
            { name: 'Refunds & disputes', sub: 'Read-only', kind: 'read' },
          ].map((g, i, a) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 11,
              padding: '12px 14px',
              borderBottom: i < a.length - 1 ? '1px solid #15151c' : 'none',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="#5577DD" strokeWidth="1.8" />
                <circle cx="12" cy="12" r="3" stroke="#5577DD" strokeWidth="1.8" />
              </svg>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: 13, color: '#F5F0EB' }}>{g.name}</div>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9.5, color: '#8888A0', letterSpacing: '0.04em', marginTop: 2 }}>{g.sub}</div>
              </div>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, fontWeight: 600, color: '#5577DD', background: '#0A1020', border: '1px solid #1A2A50', padding: '2px 7px', borderRadius: 999, letterSpacing: '0.06em' }}>READ</span>
            </div>
          ))}
        </div>

        {/* Denied */}
        <div className="mono-label" style={{ marginTop: 18, marginBottom: 8 }}>WE NEVER DO</div>
        <div style={{ background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 12, overflow: 'hidden' }}>
          {[
            'Move money or initiate transfers',
            'Refund or void charges',
            'Create new products or prices',
            'Post on your behalf',
          ].map((d, i, a) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 11,
              padding: '11px 14px',
              borderBottom: i < a.length - 1 ? '1px solid #15151c' : 'none',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="9" stroke="#FF6B6B" strokeWidth="1.8" />
                <path d="M5 5L19 19" stroke="#FF6B6B" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <div style={{ flex: 1, fontFamily: 'DM Sans', fontWeight: 500, fontSize: 12.5, color: '#C8C8D0' }}>{d}</div>
            </div>
          ))}
        </div>

        {/* Avanti toggle */}
        <div style={{
          background: 'rgba(5,26,16,0.4)', border: '1px solid #0D4A28', borderRadius: 12,
          padding: '13px 14px', marginTop: 18,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span className="avanti-dot" style={{ flexShrink: 0 }}></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: 13, color: '#F5F0EB' }}>Allow AVANTI to use this data</div>
            <div style={{ fontSize: 11.5, color: '#8888A0', marginTop: 2 }}>Surface insights and reminders. Off = silent.</div>
          </div>
          <div onClick={() => setAvantiOn(v => !v)} style={{
            width: 36, height: 21, background: avantiOn ? '#34D399' : '#15151c',
            borderRadius: 99, position: 'relative', flexShrink: 0, cursor: 'pointer', transition: 'all .2s',
            border: avantiOn ? 'none' : '1px solid #1e1e26',
          }}>
            <div style={{ position: 'absolute', top: 2, left: avantiOn ? 17 : 2, width: 17, height: 17, background: avantiOn ? '#000' : '#8888A0', borderRadius: 99, transition: 'all .2s' }}></div>
          </div>
        </div>

        <button style={{
          width: '100%', marginTop: 18, background: '#F7941E', color: '#000', border: 'none',
          padding: '14px', borderRadius: 10, fontFamily: 'Oswald', fontWeight: 700, fontSize: 15, cursor: 'pointer',
          letterSpacing: '0.04em', textTransform: 'uppercase',
        }}>Authorize Stripe →</button>
        <button style={{
          width: '100%', marginTop: 8, background: 'transparent', color: '#8888A0', border: 'none',
          padding: '10px', fontFamily: 'DM Sans', fontWeight: 500, fontSize: 13, cursor: 'pointer',
        }}>Cancel</button>
      </div>
    </Phone>
  );
};

// ============ F2d — Success ============
const F2Success = () => (
  <Phone>
    <MobileHeader tier="mentor" />
    <BackRow label="Step 3 of 3" />
    <div style={{ flex: 1, overflowY: 'auto', padding: '20px 18px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }} className="no-scrollbar">
      {/* Progress complete */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 28, width: '100%' }}>
        {[1, 2, 3].map(i => <div key={i} style={{ flex: 1, height: 3, background: '#34D399', borderRadius: 99 }}></div>)}
      </div>

      {/* Big success ring */}
      <div style={{
        width: 100, height: 100, borderRadius: 999,
        background: 'radial-gradient(circle at center, rgba(52,211,153,0.18) 0%, rgba(52,211,153,0) 70%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
      }}>
        <div style={{
          width: 76, height: 76, borderRadius: 999, background: '#34D399',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 40px rgba(52,211,153,0.3)',
        }}>
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
            <path d="M5 12L10 17L19 7" stroke="#000" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 26, color: '#F5F0EB', letterSpacing: '0.005em', marginBottom: 6 }}>STRIPE CONNECTED</div>
      <div style={{ fontSize: 13.5, color: '#C8C8D0', lineHeight: 1.5, marginBottom: 20, padding: '0 8px' }}>
        AVANTI is now reading your Stripe data. Insights will appear in your Home strip and Wallet.
      </div>

      {/* Action card with avanti dot */}
      <div style={{
        width: '100%', background: '#0c0c10',
        borderLeft: '3px solid #34D399', border: '1px solid #1e1e26', borderLeftWidth: 3, borderLeftColor: '#34D399',
        borderRadius: 10, padding: '14px 14px', marginBottom: 18, textAlign: 'left',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span className="avanti-dot" style={{ width: 6, height: 6 }}></span>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9.5, fontWeight: 600, color: '#34D399', letterSpacing: '0.1em' }}>FIRST AVANTI INSIGHT</div>
        </div>
        <div style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 15, color: '#F5F0EB', marginBottom: 4, letterSpacing: '0.005em' }}>$4,280 available · Last payout 3 days ago</div>
        <div style={{ fontSize: 12.5, color: '#C8C8D0', lineHeight: 1.45 }}>
          You have payout-eligible funds. Want me to schedule a weekly auto-payout to Chase ••4421?
        </div>
      </div>

      <button style={{
        width: '100%', background: '#F7941E', color: '#000', border: 'none',
        padding: '14px', borderRadius: 10, fontFamily: 'Oswald', fontWeight: 700, fontSize: 15, cursor: 'pointer',
        letterSpacing: '0.04em', textTransform: 'uppercase',
      }}>Connect Another Provider</button>
      <button style={{
        width: '100%', marginTop: 8, background: 'transparent', color: '#F5F0EB', border: '1px solid #1e1e26',
        padding: '13px', borderRadius: 10, fontFamily: 'DM Sans', fontWeight: 600, fontSize: 14, cursor: 'pointer',
      }}>Open Wallet</button>
    </div>
  </Phone>
);

Object.assign(window, { F2Entry, F2Provider, F2Permission, F2Success });
