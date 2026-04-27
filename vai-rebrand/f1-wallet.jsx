/* global React, Phone, MobileHeader, BottomNav, IconChevR */

const { useState: useStateF1 } = React;

// Quick spark line
const Spark = ({ pts, color }) => (
  <svg viewBox="0 0 100 28" style={{ width: '100%', height: 28 }} preserveAspectRatio="none">
    <polyline points={pts} stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ============ F1a — Wallet Home ============
const F1Home = () => (
  <Phone>
    <MobileHeader tier="mentor" />
    {/* Wallet header */}
    <div style={{ padding: '14px 18px 12px', borderBottom: '1px solid #15151c' }}>
      <div className="mono-label" style={{ marginBottom: 4 }}>VAI WALLET</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 32, color: '#F5F0EB', letterSpacing: '-0.005em', lineHeight: 1 }}>$2,847.50</span>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: '#8888A0' }}>USD</span>
      </div>
      <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9.5, color: '#34D399', letterSpacing: '0.05em', marginTop: 6 }}>● AVAILABLE · NEXT PAYOUT FRI</div>
    </div>

    <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 90px' }} className="no-scrollbar">
      {/* AVANTI strip */}
      <div style={{ background: '#0c0c10', borderLeft: '3px solid #34D399', border: '1px solid #1e1e26', borderLeftWidth: 3, borderLeftColor: '#34D399', borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span className="avanti-dot" style={{ width: 6, height: 6 }}></span>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9, fontWeight: 600, color: '#34D399', letterSpacing: '0.1em' }}>AVANTI</div>
        </div>
        <div style={{ fontSize: 12.5, color: '#C8C8D0', lineHeight: 1.45 }}>
          You earned <strong style={{ color: '#F5F0EB', fontWeight: 600 }}>$1,240</strong> this month — +18% vs March. 4 athletes paid early.
        </div>
      </div>

      {/* Action row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
        {[
          { l: 'Payout', c: '#F7941E' },
          { l: 'Add card', c: '#F5F0EB' },
          { l: 'Stripe', c: '#5577DD' },
        ].map((a, i) => (
          <div key={i} style={{ background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 10, padding: '12px 8px', textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ width: 24, height: 24, borderRadius: 7, background: '#1a1a20', margin: '0 auto 6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: a.c }}></div>
            </div>
            <div style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: 12, color: '#F5F0EB' }}>{a.l}</div>
          </div>
        ))}
      </div>

      {/* This month chart */}
      <div style={{ background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 12, padding: '14px 14px', marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <div className="mono-label">EARNINGS · APR</div>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#34D399', letterSpacing: '0.05em' }}>+18%</span>
        </div>
        <Spark color="#34D399" pts="0,22 8,20 16,16 24,18 32,14 40,12 48,15 56,10 64,11 72,7 80,9 88,5 96,6 100,4" />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'JetBrains Mono', fontSize: 9, color: '#8888A0', letterSpacing: '0.05em', marginTop: 8 }}>
          <span>APR 1</span><span>APR 14</span><span>TODAY</span>
        </div>
      </div>

      {/* Connections */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <div className="mono-label">CONNECTIONS</div>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9.5, color: '#F7941E', letterSpacing: '0.05em', cursor: 'pointer' }}>MANAGE</span>
      </div>
      <div style={{ background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
        {[
          { l: 'Stripe', sub: 'AVANTI ON · last sync 2m', c: '#34D399', letter: 'S', dot: true },
          { l: 'Chase ••4421', sub: 'Default payout · ACH', c: '#5577DD', letter: 'C', dot: false },
          { l: 'PayPal', sub: 'Backup · invoices only', c: '#5577DD', letter: 'P', dot: false },
        ].map((c, i, a) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 13px', borderBottom: i < a.length - 1 ? '1px solid #15151c' : 'none' }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, background: '#1a1a20',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Oswald', fontWeight: 700, fontSize: 13, color: c.c, flexShrink: 0,
            }}>{c.letter}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: 13, color: '#F5F0EB' }}>{c.l}</div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: '#8888A0', letterSpacing: '0.04em', marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
                {c.dot && <span className="avanti-dot" style={{ width: 5, height: 5 }}></span>}
                {c.sub.toUpperCase()}
              </div>
            </div>
            <IconChevR size={14} color="#4d4d60" />
          </div>
        ))}
      </div>

      {/* Recent transactions */}
      <div className="mono-label" style={{ marginBottom: 8 }}>RECENT TRANSACTIONS</div>
      <div style={{ background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 12, overflow: 'hidden' }}>
        {[
          { l: 'Affiliate · 3 referrals', sub: 'APR 24 · payout pending', amt: '+$45.00', c: '#F7941E' },
          { l: 'Lila Park · Hitting Lesson', sub: 'APR 23 · Stripe', amt: '+$120.00', c: '#34D399' },
          { l: 'Marcus T. · Pitching x2', sub: 'APR 22 · Stripe', amt: '+$240.00', c: '#34D399' },
          { l: 'Payout to Chase ••4421', sub: 'APR 21 · ACH', amt: '−$1,840.00', c: '#8888A0' },
          { l: 'Sarah K. · Strength', sub: 'APR 20 · Stripe', amt: '+$80.00', c: '#34D399' },
        ].map((r, i, a) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 14px', borderBottom: i < a.length - 1 ? '1px solid #15151c' : 'none' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'DM Sans', fontWeight: 500, fontSize: 13, color: '#F5F0EB' }}>{r.l}</div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: '#8888A0', letterSpacing: '0.05em', marginTop: 2 }}>{r.sub.toUpperCase()}</div>
            </div>
            <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 600, fontSize: 12.5, color: r.c }}>{r.amt}</div>
          </div>
        ))}
      </div>
    </div>
    <BottomNav active="wallet" />
  </Phone>
);

// ============ F1b — Affiliate ============
const F1Affiliate = () => (
  <Phone>
    <MobileHeader tier="mentor" />
    <div style={{ padding: '12px 18px 10px', borderBottom: '1px solid #15151c' }}>
      <span style={{ color: '#F7941E', fontFamily: 'JetBrains Mono', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', cursor: 'pointer' }}>← WALLET</span>
    </div>
    <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 90px' }} className="no-scrollbar">
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(247,148,30,0.10) 0%, rgba(12,12,16,0) 60%), #0c0c10',
        border: '1px solid #4A3200', borderRadius: 14, padding: '18px 16px', marginBottom: 16,
      }}>
        <div className="mono-label" style={{ marginBottom: 6 }}>AFFILIATE PROGRAM</div>
        <div style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 22, color: '#F5F0EB', letterSpacing: '0.005em', marginBottom: 8 }}>Earn $15 per signup</div>
        <div style={{ fontSize: 12.5, color: '#C8C8D0', lineHeight: 1.45 }}>Refer mentors, families, or organizations. Paid out monthly with your regular Wallet payout.</div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
        {[
          { l: 'TOTAL EARNED', v: '$485', c: '#F7941E' },
          { l: 'PENDING', v: '$45', c: '#FBBF24' },
          { l: 'REFERRALS', v: '37', c: '#F5F0EB' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 10, padding: '11px 11px' }}>
            <div className="mono-label" style={{ fontSize: 8.5, marginBottom: 6 }}>{s.l}</div>
            <div style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 20, color: s.c, lineHeight: 1 }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Your link */}
      <div className="mono-label" style={{ marginBottom: 8 }}>YOUR LINK</div>
      <div style={{ background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 10, padding: '12px 14px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0, fontFamily: 'JetBrains Mono', fontSize: 12, color: '#F5F0EB', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          vai.app/r/marcus-r
        </div>
        <button style={{ background: '#F7941E', color: '#000', border: 'none', padding: '6px 11px', borderRadius: 7, fontFamily: 'DM Sans', fontWeight: 600, fontSize: 11.5, cursor: 'pointer' }}>Copy</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
        {['Share QR', 'iMessage', 'Email'].map(b => (
          <button key={b} style={{ background: 'transparent', border: '1px solid #1e1e26', color: '#F5F0EB', padding: '9px', borderRadius: 8, fontFamily: 'DM Sans', fontWeight: 500, fontSize: 12, cursor: 'pointer' }}>{b}</button>
        ))}
      </div>

      {/* AVANTI nudge */}
      <div style={{ background: '#0c0c10', borderLeft: '3px solid #34D399', border: '1px solid #1e1e26', borderLeftWidth: 3, borderLeftColor: '#34D399', borderRadius: 10, padding: '12px 14px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span className="avanti-dot" style={{ width: 6, height: 6 }}></span>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9, fontWeight: 600, color: '#34D399', letterSpacing: '0.1em' }}>AVANTI</div>
        </div>
        <div style={{ fontSize: 12.5, color: '#C8C8D0', lineHeight: 1.45 }}>
          3 mentors at <strong style={{ color: '#F5F0EB', fontWeight: 600 }}>Vandy Baseball</strong> follow you. Want me to draft a referral DM?
        </div>
      </div>

      {/* Referral list */}
      <div className="mono-label" style={{ marginBottom: 8 }}>REFERRALS</div>
      <div style={{ background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 12, overflow: 'hidden' }}>
        {[
          { name: 'Coach J. Ortiz', sub: 'Mentor · Apr 22', amt: '+$15', s: 'PAID' },
          { name: 'D. Reynolds', sub: 'Mentor · Apr 19', amt: '+$15', s: 'PAID' },
          { name: 'Maple Heights HS', sub: 'Org · Apr 16', amt: '+$15', s: 'PENDING' },
          { name: 'A. Williams', sub: 'Mentor · Apr 14', amt: '+$15', s: 'PAID' },
          { name: 'C. Kim', sub: 'Family · Apr 11', amt: '+$15', s: 'PAID' },
        ].map((r, i, arr) => {
          const pending = r.s === 'PENDING';
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 14px', borderBottom: i < arr.length - 1 ? '1px solid #15151c' : 'none' }}>
              <div style={{ width: 30, height: 30, borderRadius: 99, background: '#1a1a20', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Oswald', fontWeight: 600, fontSize: 11, color: '#F5F0EB' }}>
                {r.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: 13, color: '#F5F0EB' }}>{r.name}</div>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: '#8888A0', letterSpacing: '0.05em', marginTop: 2 }}>{r.sub.toUpperCase()}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 600, fontSize: 12.5, color: pending ? '#FBBF24' : '#34D399' }}>{r.amt}</div>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: 8.5, color: pending ? '#FBBF24' : '#8888A0', letterSpacing: '0.06em', marginTop: 2 }}>{r.s}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
    <BottomNav active="wallet" />
  </Phone>
);

// ============ F1c — Payout sheet ============
const F1Payout = () => {
  const [amount, setAmount] = useStateF1('1840');
  const [account, setAccount] = useStateF1(0);
  const [speed, setSpeed] = useStateF1(0);
  const accounts = [
    { l: 'Chase ••4421', sub: 'ACH · default' },
    { l: 'PayPal', sub: 'm.rivera@…' },
  ];
  return (
    <Phone>
      <MobileHeader tier="mentor" />
      <div style={{ padding: '12px 18px 10px', borderBottom: '1px solid #15151c', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#F7941E', fontFamily: 'JetBrains Mono', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', cursor: 'pointer' }}>CANCEL</span>
        <span style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 14, color: '#F5F0EB', letterSpacing: '0.005em' }}>PAYOUT</span>
        <span style={{ width: 60 }}></span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 18px 24px' }} className="no-scrollbar">
        {/* Amount — hero */}
        <div style={{
          position: 'relative',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(52,211,153,0.18) 0%, rgba(52,211,153,0) 60%), linear-gradient(180deg, #0c0c10 0%, #07120D 100%)',
          border: '1px solid #0D4A28',
          borderRadius: 16,
          padding: '26px 18px 22px',
          marginBottom: 10,
          overflow: 'hidden',
          boxShadow: '0 0 0 1px rgba(52,211,153,0.06), 0 12px 40px -16px rgba(52,211,153,0.25)',
        }}>
          {/* faint stadium baseline */}
          <div aria-hidden="true" style={{
            position: 'absolute', left: 0, right: 0, bottom: 0, height: 1,
            background: 'linear-gradient(90deg, transparent 0%, rgba(52,211,153,0.5) 50%, transparent 100%)',
          }}></div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span className="avanti-dot" style={{ width: 6, height: 6 }}></span>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9.5, fontWeight: 600, color: '#34D399', letterSpacing: '0.1em' }}>YOU SEND</span>
            </div>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9.5, fontWeight: 600, color: '#8888A0', letterSpacing: '0.08em' }}>USD</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4 }}>
            <span style={{
              fontFamily: 'Oswald', fontWeight: 700, fontSize: 34, color: '#34D399',
              opacity: 0.85, letterSpacing: '-0.01em', textShadow: '0 0 24px rgba(52,211,153,0.45)',
            }}>$</span>
            <input
              value={amount}
              onChange={e => setAmount(e.target.value.replace(/[^\d.]/g, ''))}
              style={{
                background: 'transparent', border: 'none', color: '#34D399',
                fontFamily: 'Oswald', fontWeight: 700, fontSize: 64, letterSpacing: '-0.025em',
                outline: 'none', padding: 0, lineHeight: 1,
                minWidth: 0, width: `${Math.max(2, (amount || '').length) * 0.62}em`,
                textAlign: 'center', textShadow: '0 0 32px rgba(52,211,153,0.45)',
                caretColor: '#34D399',
              }}
            />
          </div>

          {/* Underline + meta */}
          <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(52,211,153,0.35), transparent)', margin: '14px auto 12px', width: '60%' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#8888A0', letterSpacing: '0.06em' }}>AVAILABLE</span>
            <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 600, fontSize: 11, color: '#F5F0EB', letterSpacing: '0.02em' }}>$2,847.50</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 4px 0' }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#8888A0', letterSpacing: '0.06em' }}>REMAINING AFTER</span>
            <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 600, fontSize: 11, color: '#34D399', letterSpacing: '0.02em' }}>
              ${Math.max(0, 2847.5 - parseFloat(amount || 0)).toFixed(2)}
            </span>
          </div>
        </div>
        {/* Quick amounts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6, marginBottom: 18 }}>
          {[500, 1000, 1840, 'ALL'].map((a, i) => {
            const sel = String(a) === amount || (a === 'ALL' && amount === '2847.50');
            return (
              <button key={a} onClick={() => setAmount(a === 'ALL' ? '2847.50' : String(a))} style={{
                background: sel ? '#051A10' : 'transparent',
                border: sel ? '1px solid #0D4A28' : '1px solid #1e1e26',
                color: sel ? '#34D399' : '#C8C8D0',
                padding: '8px', borderRadius: 8, fontFamily: 'JetBrains Mono', fontWeight: 600, fontSize: 11, cursor: 'pointer', letterSpacing: '0.05em',
                boxShadow: sel ? '0 0 16px -8px rgba(52,211,153,0.5)' : 'none',
              }}>{a === 'ALL' ? 'ALL' : `$${a}`}</button>
            );
          })}
        </div>

        {/* Account */}
        <div className="mono-label" style={{ marginBottom: 8 }}>TO</div>
        <div style={{ background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
          {accounts.map((a, i) => (
            <div key={i} onClick={() => setAccount(i)} style={{
              display: 'flex', alignItems: 'center', gap: 11, padding: '12px 14px',
              borderBottom: i < accounts.length - 1 ? '1px solid #15151c' : 'none', cursor: 'pointer',
            }}>
              <div style={{ width: 18, height: 18, borderRadius: 99, border: '1.5px solid ' + (account === i ? '#F7941E' : '#3a3a44'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {account === i && <div style={{ width: 9, height: 9, borderRadius: 99, background: '#F7941E' }}></div>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: 13, color: '#F5F0EB' }}>{a.l}</div>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9.5, color: '#8888A0', letterSpacing: '0.04em', marginTop: 2 }}>{a.sub.toUpperCase()}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Speed */}
        <div className="mono-label" style={{ marginBottom: 8 }}>SPEED</div>
        <div style={{ background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
          {[
            { l: 'Standard', sub: '1–3 business days', fee: 'FREE' },
            { l: 'Instant', sub: 'In ~30 min', fee: '1.5%' },
          ].map((s, i, a) => (
            <div key={i} onClick={() => setSpeed(i)} style={{
              display: 'flex', alignItems: 'center', gap: 11, padding: '12px 14px',
              borderBottom: i < a.length - 1 ? '1px solid #15151c' : 'none', cursor: 'pointer',
            }}>
              <div style={{ width: 18, height: 18, borderRadius: 99, border: '1.5px solid ' + (speed === i ? '#F7941E' : '#3a3a44'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {speed === i && <div style={{ width: 9, height: 9, borderRadius: 99, background: '#F7941E' }}></div>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: 13, color: '#F5F0EB' }}>{s.l}</div>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9.5, color: '#8888A0', letterSpacing: '0.04em', marginTop: 2 }}>{s.sub.toUpperCase()}</div>
              </div>
              <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 600, fontSize: 11, color: s.fee === 'FREE' ? '#34D399' : '#F5F0EB', letterSpacing: '0.05em' }}>{s.fee}</span>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div style={{ background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 12, padding: '13px 14px', marginBottom: 18 }}>
          {[
            { l: 'Amount', v: `$${parseFloat(amount || 0).toFixed(2)}` },
            { l: 'Fee', v: speed === 1 ? `$${(parseFloat(amount || 0) * 0.015).toFixed(2)}` : 'Free' },
            { l: 'Arrives', v: speed === 1 ? '~30 min' : 'Apr 28', s: true },
          ].map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
              <span style={{ fontFamily: 'DM Sans', fontWeight: 500, fontSize: 13, color: r.s ? '#F5F0EB' : '#8888A0' }}>{r.l}</span>
              <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 600, fontSize: 12.5, color: r.s ? '#34D399' : '#F5F0EB' }}>{r.v}</span>
            </div>
          ))}
        </div>

        <button style={{
          width: '100%', background: '#F7941E', color: '#000', border: 'none',
          padding: '15px', borderRadius: 11, fontFamily: 'Oswald', fontWeight: 700, fontSize: 16, cursor: 'pointer',
          letterSpacing: '0.04em', textTransform: 'uppercase',
        }}>Send ${parseFloat(amount || 0).toFixed(2)}</button>
      </div>
    </Phone>
  );
};

Object.assign(window, { F1Home, F1Affiliate, F1Payout });
