/* global React, IconClose, IconSparkles, IconCalendar, IconUsers, IconWallet, IconShield, IconActivity, IconChat, IconSend, IconArrowUp */

const { useState: useStateO } = React;

// ============ AVANTI OVERLAY (Mode 2) ============
const AvantiOverlay = ({ onClose, scope = 'VAI FC NORTH' }) => (
  <>
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 8 }}></div>
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 9,
      background: '#141418', borderTop: '1px solid #1e1e26',
      borderRadius: '20px 20px 0 0',
      maxHeight: '74%', overflowY: 'auto',
      paddingBottom: 18,
    }} className="no-scrollbar">
      <div style={{ width: 36, height: 4, borderRadius: 99, background: '#2a2a32', margin: '8px auto 12px' }}></div>
      <div style={{ padding: '0 18px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="avanti-dot lg"></span>
          <div>
            <div style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 18, color: '#34D399', letterSpacing: '0.04em' }}>AVANTI</div>
            <div className="mono-label" style={{ marginTop: 2 }}>{scope}</div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#8888A0', cursor: 'pointer' }}><IconClose size={18}/></button>
      </div>

      <div style={{ padding: '0 18px 12px' }}>
        <div className="mono-label" style={{ marginBottom: 8 }}>QUICK ACTIONS</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {['Summarize week', 'Flag risk', 'Prep dues reminder', 'Revenue snapshot'].map(q => (
            <button key={q} style={{
              background: '#1a1a20', border: '1px solid #1e1e26', color: '#F5F0EB',
              borderRadius: 10, padding: '12px 12px', textAlign: 'left',
              fontFamily: 'DM Sans', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}>{q} →</button>
          ))}
        </div>
      </div>

      {/* Action card — yellow */}
      <div style={{ padding: '8px 18px 0' }}>
        <div style={{
          background: '#0c0c10', border: '1px solid #1e1e26',
          borderLeft: '3px solid #FBBF24', borderRadius: 10,
          padding: '14px',
        }}>
          <div className="mono-label" style={{ color: '#FBBF24', marginBottom: 6 }}>CONFIRM NEEDED</div>
          <div style={{ fontSize: 13.5, color: '#F5F0EB', marginBottom: 12, lineHeight: 1.4 }}>
            <strong style={{ fontWeight: 600 }}>3 families overdue</strong> on Spring dues. Total $470. Prepare reminder?
          </div>
          <button style={{
            background: '#F7941E', color: '#000', border: 'none',
            padding: '9px 16px', borderRadius: 8, fontFamily: 'DM Sans', fontWeight: 600, fontSize: 13, cursor: 'pointer',
          }}>Confirm reminder</button>
        </div>
      </div>

      {/* Action card — green read-only */}
      <div style={{ padding: '10px 18px 0' }}>
        <div style={{
          background: '#0c0c10', border: '1px solid #1e1e26',
          borderLeft: '3px solid #34D399', borderRadius: 10, padding: '14px',
        }}>
          <div className="mono-label" style={{ color: '#34D399', marginBottom: 6 }}>READ-ONLY · ALL CLEAR</div>
          <div style={{ fontSize: 13.5, color: '#F5F0EB', lineHeight: 1.4 }}>
            <strong style={{ fontWeight: 600 }}>Compliance:</strong> 14 of 16 athletes signed. 2 pending — not blocking Saturday.
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '14px 18px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center',
          background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 999, padding: '8px 14px',
        }}>
          <input placeholder="Ask AVANTI…" style={{
            background: 'transparent', border: 'none', outline: 'none',
            color: '#F5F0EB', flex: 1, fontFamily: 'DM Sans', fontSize: 13,
          }} />
        </div>
        <button style={{
          width: 36, height: 36, borderRadius: 999, background: '#F7941E', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}><IconArrowUp size={16} stroke="#000" strokeWidth={2}/></button>
      </div>
      <div style={{ padding: '10px 18px 0', textAlign: 'center', fontFamily: 'JetBrains Mono', fontSize: 9, color: '#4d4d60', letterSpacing: '0.05em' }}>
        AVANTI READS DATA · NEVER ACTS WITHOUT YOUR CONFIRMATION
      </div>
    </div>
  </>
);

// ============ TILE CONTEXT PANEL (Mode 3) ============
const TileContext = ({ tile, onClose }) => {
  const cfg = {
    schedule: {
      icon: IconCalendar, label: 'SCHEDULE', title: 'This Week',
      status: 'green', statusLabel: 'ALL CLEAR',
      body: '2 events this week. Saturday home game vs Salt Lake Storm at 10:00 AM. No PLAY blockers for any scheduled athlete. All waivers current.',
      chips: ['What\'s the lineup Saturday?', 'Any PLAY issues?', 'Show next 2 weeks'],
      cta: { label: 'Open Schedule', kind: 'list' },
    },
    roster: {
      icon: IconUsers, label: 'ROSTER', title: '16 Athletes',
      status: 'red', statusLabel: 'ACTION REQUIRED',
      body: <><strong style={{ color: '#F5F0EB', fontWeight: 600 }}>Mia Rodriguez</strong> is PLAY blocked — payment 4 days overdue. She cannot play Saturday. <strong style={{ color: '#F5F0EB', fontWeight: 600 }}>13 athletes</strong> are GREEN. 2 pending.</>,
      chips: ['Who else is pending?', 'Draft reminder for Mia'],
      cta: { label: 'Notify Parent — Mia Rodriguez', kind: 'orange' },
    },
    wallet: {
      icon: IconWallet, label: 'WALLET', title: 'Dues Pending',
      status: 'yellow', statusLabel: 'CONFIRM NEEDED',
      body: <><strong style={{ color: '#F5F0EB', fontWeight: 600 }}>3 families have outstanding dues</strong> for VAI FC North — total $470. Prepare a reminder?</>,
      chips: ['Show breakdown', 'Skip this week'],
      cta: { label: 'Confirm reminder', kind: 'orange' },
    },
  }[tile];

  if (!cfg) return null;
  const statusColor = cfg.status === 'green' ? '#34D399' : cfg.status === 'yellow' ? '#FBBF24' : '#FF6B6B';
  const statusBg = cfg.status === 'green' ? '#051A10' : cfg.status === 'yellow' ? '#1A1000' : '#1A0808';
  const statusBd = cfg.status === 'green' ? '#0D4A28' : cfg.status === 'yellow' ? '#4A3000' : '#4A1A1A';

  return (
    <>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 8 }}></div>
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 9,
        background: '#141418', borderTop: '1px solid #1e1e26', borderRadius: '20px 20px 0 0',
        maxHeight: '70%', overflowY: 'auto', paddingBottom: 18,
      }} className="no-scrollbar">
        <div style={{ width: 36, height: 4, borderRadius: 99, background: '#2a2a32', margin: '8px auto 8px' }}></div>
        <div style={{ padding: '4px 18px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="mono-label">{cfg.label}</div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#8888A0', cursor: 'pointer' }}><IconClose size={16}/></button>
        </div>
        <div style={{ padding: '6px 18px 14px' }}>
          <div style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 22, color: '#F5F0EB', letterSpacing: '0.01em' }}>{cfg.title}</div>
        </div>
        {/* Status pill */}
        <div style={{ padding: '0 18px 12px' }}>
          <div style={{
            background: statusBg, border: `1px solid ${statusBd}`,
            borderRadius: 8, padding: '8px 12px',
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: 99, background: statusColor, boxShadow: `0 0 6px ${statusColor}` }}></span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, fontWeight: 600, color: statusColor, letterSpacing: '0.1em' }}>{cfg.statusLabel}</span>
          </div>
        </div>
        {/* Body */}
        <div style={{ padding: '0 18px 14px', fontSize: 13.5, color: '#C8C8D0', lineHeight: 1.5 }}>{cfg.body}</div>
        {/* Chips */}
        <div style={{ padding: '0 18px 14px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {cfg.chips.map((c, i) => (
            <button key={i} style={{
              background: '#1a1a20', border: '1px solid #1e1e26', color: '#C8C8D0',
              padding: '7px 13px', borderRadius: 999,
              fontFamily: 'DM Sans', fontSize: 12, fontWeight: 500, cursor: 'pointer',
            }}>{c}</button>
          ))}
        </div>
        {/* CTA */}
        <div style={{ padding: '0 18px 14px' }}>
          {cfg.cta.kind === 'orange' ? (
            <button style={{
              width: '100%', background: '#F7941E', color: '#000', border: 'none',
              padding: '12px', borderRadius: 10, fontFamily: 'DM Sans', fontWeight: 600, fontSize: 14, cursor: 'pointer',
            }}>{cfg.cta.label}</button>
          ) : (
            <button style={{
              width: '100%', background: 'transparent', color: '#F5F0EB', border: '1px solid #1e1e26',
              padding: '12px', borderRadius: 10, fontFamily: 'DM Sans', fontWeight: 500, fontSize: 14, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}><span>{cfg.cta.label}</span><span>›</span></button>
          )}
        </div>
        {/* Input */}
        <div style={{ padding: '8px 18px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center',
            background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 999, padding: '8px 14px',
          }}>
            <input placeholder={`Ask AVANTI about ${tile}…`} style={{
              background: 'transparent', border: 'none', outline: 'none',
              color: '#F5F0EB', flex: 1, fontFamily: 'DM Sans', fontSize: 13,
            }} />
          </div>
          <button style={{
            width: 36, height: 36, borderRadius: 999, background: '#F7941E', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}><IconArrowUp size={16} stroke="#000" strokeWidth={2}/></button>
        </div>
      </div>
    </>
  );
};

Object.assign(window, { AvantiOverlay, TileContext });
