/* global React, Phone, MobileHeader, BottomNav, IconChevR */

const BackRowF = ({ label }) => (
  <div style={{ padding: '11px 18px 10px', borderBottom: '1px solid #15151c' }}>
    <span style={{ color: '#F7941E', fontFamily: 'JetBrains Mono', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', cursor: 'pointer' }}>← {label.toUpperCase()}</span>
  </div>
);

// ============ F3a — Wearables Entry ============
const F3Entry = () => (
  <Phone>
    <MobileHeader tier="mentor" />
    <BackRowF label="Wearables" />
    <div style={{ flex: 1, overflowY: 'auto', padding: '18px 16px 90px' }} className="no-scrollbar">
      <div style={{
        background: 'linear-gradient(180deg, rgba(247,148,30,0.08) 0%, rgba(12,12,16,0) 60%), #0c0c10',
        border: '1px solid #4A3200', borderRadius: 14, padding: '20px 18px', marginBottom: 18,
      }}>
        <div className="mono-label" style={{ marginBottom: 6 }}>BIOMETRICS · LIVE</div>
        <div style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 22, color: '#F5F0EB', letterSpacing: '0.005em', marginBottom: 8 }}>Pair your wearable</div>
        <div style={{ fontSize: 13, color: '#C8C8D0', lineHeight: 1.5 }}>
          Live HR, recovery, strain, and load — surfaced in your home grid and used by AVANTI to flag training risks.
        </div>
      </div>

      <div className="mono-label" style={{ marginBottom: 8 }}>SUPPORTED DEVICES</div>
      {[
        { name: 'Apple Watch', sub: 'HealthKit · Series 4 or later', letter: 'A', color: '#F5F0EB', state: 'available' },
        { name: 'WHOOP', sub: 'Strain · Recovery · Sleep', letter: 'W', color: '#34D399', state: 'available' },
        { name: 'Garmin', sub: 'Forerunner · Fenix · Vivoactive', letter: 'G', color: '#5577DD', state: 'available' },
        { name: 'Fitbit', sub: 'Charge · Versa · Sense', letter: 'F', color: '#8888A0', state: 'blocked' },
        { name: 'Oura', sub: 'Ring Gen 3 · Recovery only', letter: 'O', color: '#8888A0', state: 'blocked' },
      ].map((d, i) => {
        const blocked = d.state === 'blocked';
        return (
          <div key={i} style={{
            background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 12,
            padding: '14px 14px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12,
            opacity: blocked ? 0.6 : 1,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, background: '#1a1a20',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Oswald', fontWeight: 700, fontSize: 17, color: d.color, flexShrink: 0,
            }}>{d.letter}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 16, color: '#F5F0EB', letterSpacing: '0.005em' }}>{d.name}</div>
                {blocked && (
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8.5, fontWeight: 600, color: '#FF6B6B', background: '#1A0808', border: '1px solid #4A1A1A', padding: '1px 6px', borderRadius: 999, letterSpacing: '0.06em' }}>BLOCKED</span>
                )}
              </div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9.5, color: '#8888A0', letterSpacing: '0.04em', marginTop: 3 }}>{d.sub}</div>
            </div>
            {blocked ? (
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9.5, color: '#8888A0', letterSpacing: '0.05em' }}>SOON</span>
            ) : (
              <button style={{ background: '#F7941E', color: '#000', border: 'none', padding: '7px 13px', borderRadius: 7, fontFamily: 'DM Sans', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>Pair</button>
            )}
          </div>
        );
      })}
    </div>
    <BottomNav active="home" />
  </Phone>
);

// ============ F3b — Auth Prompt (HealthKit / WHOOP) ============
const F3Auth = () => (
  <Phone>
    <MobileHeader tier="mentor" />
    <BackRowF label="Pair · WHOOP" />
    <div style={{ flex: 1, overflowY: 'auto', padding: '20px 18px 24px', textAlign: 'center' }} className="no-scrollbar">
      <div style={{
        width: 84, height: 84, borderRadius: 999, background: '#051A10', border: '1px solid #0D4A28',
        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '8px auto 14px',
        boxShadow: '0 0 60px rgba(52,211,153,0.15)',
      }}>
        <span style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 36, color: '#34D399', letterSpacing: '0.02em' }}>W</span>
      </div>
      <div style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 22, color: '#F5F0EB', letterSpacing: '0.005em', marginBottom: 6 }}>Allow VAI to read WHOOP data?</div>
      <div style={{ fontSize: 13, color: '#C8C8D0', lineHeight: 1.5, marginBottom: 18, padding: '0 8px' }}>
        VAI will read recovery, strain, HRV, sleep, and workout data — read-only.
      </div>

      <div style={{ background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 12, padding: '4px 0', textAlign: 'left' }}>
        {[
          { l: 'Recovery score', v: 'Daily' },
          { l: 'Strain & exertion', v: 'Continuous' },
          { l: 'HRV · Resting HR', v: 'Daily' },
          { l: 'Sleep stages', v: 'Per session' },
          { l: 'Workout activity', v: 'Per session' },
        ].map((r, i, a) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 14px',
            borderBottom: i < a.length - 1 ? '1px solid #15151c' : 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                <path d="M2 6L5 9L10 3" stroke="#34D399" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ fontFamily: 'DM Sans', fontWeight: 500, fontSize: 13, color: '#F5F0EB' }}>{r.l}</span>
            </div>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9.5, color: '#8888A0', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{r.v}</span>
          </div>
        ))}
      </div>

      <button style={{
        width: '100%', marginTop: 22, background: '#34D399', color: '#000', border: 'none',
        padding: '14px', borderRadius: 10, fontFamily: 'Oswald', fontWeight: 700, fontSize: 15, cursor: 'pointer',
        letterSpacing: '0.04em', textTransform: 'uppercase',
      }}>Allow All</button>
      <button style={{
        width: '100%', marginTop: 8, background: 'transparent', color: '#8888A0', border: 'none',
        padding: '10px', fontFamily: 'DM Sans', fontWeight: 500, fontSize: 13, cursor: 'pointer',
      }}>Don't Allow</button>
    </div>
  </Phone>
);

// ============ F4a — Apple Watch Connected ============
const F4Apple = () => (
  <Phone>
    <MobileHeader tier="mentor" />
    <BackRowF label="Apple Watch" />
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 90px' }} className="no-scrollbar">
      {/* Status header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span className="avanti-dot" style={{ width: 7, height: 7 }}></span>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10.5, fontWeight: 600, color: '#34D399', letterSpacing: '0.08em' }}>SYNCED · 2 MIN AGO</span>
      </div>

      {/* HR ring */}
      <div style={{ background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 14, padding: '20px 18px', display: 'flex', gap: 18, alignItems: 'center', marginBottom: 12 }}>
        <div style={{ position: 'relative', width: 110, height: 110, flexShrink: 0 }}>
          <svg width="110" height="110" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="60" cy="60" r="48" stroke="#15151c" strokeWidth="10" fill="none" />
            <circle cx="60" cy="60" r="48" stroke="#FF6B6B" strokeWidth="10" fill="none"
              strokeDasharray="301.6" strokeDashoffset="80" strokeLinecap="round" />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 28, color: '#F5F0EB', lineHeight: 1 }}>72</div>
            <div className="mono-label" style={{ marginTop: 2, fontSize: 8 }}>BPM</div>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div className="mono-label" style={{ marginBottom: 4 }}>HEART RATE · LIVE</div>
          <div style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 16, color: '#F5F0EB', letterSpacing: '0.005em', marginBottom: 8 }}>Resting · Zone 1</div>
          {/* HR sparkline */}
          <svg viewBox="0 0 160 32" style={{ width: '100%', height: 32 }}>
            <polyline points="0,18 12,16 24,20 36,14 48,22 60,12 72,18 84,10 96,17 108,15 120,21 132,13 144,18 156,16"
              stroke="#FF6B6B" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: '#8888A0', letterSpacing: '0.05em', marginTop: 4 }}>LAST 60 MIN · AVG 76</div>
        </div>
      </div>

      {/* Stat row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        <div style={{ background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 10, padding: '12px 13px' }}>
          <div className="mono-label" style={{ marginBottom: 4, fontSize: 8.5 }}>RECOVERY</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 26, color: '#34D399' }}>87</span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: '#8888A0' }}>/100</span>
          </div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: '#34D399', letterSpacing: '0.05em', marginTop: 4 }}>● PRIMED</div>
        </div>
        <div style={{ background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 10, padding: '12px 13px' }}>
          <div className="mono-label" style={{ marginBottom: 4, fontSize: 8.5 }}>VO₂ MAX</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 26, color: '#F5F0EB' }}>52</span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#8888A0' }}>ml/kg/min</span>
          </div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: '#34D399', letterSpacing: '0.05em', marginTop: 4 }}>↑ 1.2 vs 30D</div>
        </div>
      </div>

      {/* AVANTI insight */}
      <div style={{
        background: '#0c0c10', borderLeft: '3px solid #34D399', border: '1px solid #1e1e26', borderLeftWidth: 3, borderLeftColor: '#34D399',
        borderRadius: 10, padding: '12px 14px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span className="avanti-dot" style={{ width: 6, height: 6 }}></span>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9, fontWeight: 600, color: '#34D399', letterSpacing: '0.1em' }}>AVANTI · BIOMETRICS</div>
        </div>
        <div style={{ fontSize: 12.5, color: '#C8C8D0', lineHeight: 1.4 }}>
          High recovery + steady HR variability — you're cleared for hard intervals today.
        </div>
      </div>

      {/* Sub stats */}
      <div className="mono-label" style={{ marginTop: 18, marginBottom: 8 }}>TODAY</div>
      <div style={{ background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 12, overflow: 'hidden' }}>
        {[
          { l: 'Steps', v: '8,420', c: '#F5F0EB' },
          { l: 'Active calories', v: '472 kcal', c: '#F5F0EB' },
          { l: 'Stand hours', v: '11 / 12', c: '#34D399' },
          { l: 'Sleep last night', v: '7h 12m · 86%', c: '#34D399' },
        ].map((r, i, a) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '11px 14px', borderBottom: i < a.length - 1 ? '1px solid #15151c' : 'none',
          }}>
            <span style={{ fontFamily: 'DM Sans', fontWeight: 500, fontSize: 13, color: '#C8C8D0' }}>{r.l}</span>
            <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 600, fontSize: 12.5, color: r.c }}>{r.v}</span>
          </div>
        ))}
      </div>
    </div>
    <BottomNav active="home" />
  </Phone>
);

// ============ F4b — WHOOP Connected ============
const F4Whoop = () => {
  const Bar = ({ label, value, max, color, sub }) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9.5, fontWeight: 600, color: '#8888A0', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</span>
        <div>
          <span style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 20, color }}>{value}</span>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#8888A0', marginLeft: 4 }}>/{max}</span>
        </div>
      </div>
      <div style={{ height: 6, background: '#15151c', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ width: `${(value / max) * 100}%`, height: '100%', background: color, borderRadius: 99, boxShadow: `0 0 10px ${color}80` }}></div>
      </div>
      {sub && <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: '#8888A0', letterSpacing: '0.04em', marginTop: 4 }}>{sub}</div>}
    </div>
  );
  return (
    <Phone>
      <MobileHeader tier="mentor" />
      <BackRowF label="WHOOP" />
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 90px' }} className="no-scrollbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <span className="avanti-dot" style={{ width: 7, height: 7 }}></span>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10.5, fontWeight: 600, color: '#34D399', letterSpacing: '0.08em' }}>WHOOP 4.0 · 14 MIN AGO</span>
        </div>

        {/* Big recovery */}
        <div style={{ background: '#0c0c10', border: '1px solid #4A3000', borderRadius: 14, padding: '20px 18px', marginBottom: 12 }}>
          <div className="mono-label" style={{ marginBottom: 8 }}>RECOVERY · TODAY</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 56, color: '#FBBF24', letterSpacing: '-0.01em', lineHeight: 1 }}>62</span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 14, color: '#8888A0' }}>%</span>
            <span style={{ marginLeft: 'auto', fontFamily: 'JetBrains Mono', fontSize: 10, color: '#FBBF24', background: '#1A1000', border: '1px solid #4A3000', padding: '3px 8px', borderRadius: 999, letterSpacing: '0.06em' }}>● MODERATE</span>
          </div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#8888A0', letterSpacing: '0.05em', marginTop: 6 }}>HRV 48ms · RHR 56 · BASELINE −5%</div>
        </div>

        {/* Strain + Sleep bars */}
        <div style={{ background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 12, padding: '16px 16px', marginBottom: 14 }}>
          <Bar label="Day Strain" value={12.4} max={21} color="#5577DD" sub="OPTIMAL ZONE 10–14" />
          <Bar label="Sleep Performance" value={82} max={100} color="#34D399" sub="7H 04M · 95% NEEDED" />
          <Bar label="Sleep Consistency" value={71} max={100} color="#FBBF24" sub="VARIABLE BEDTIME" />
        </div>

        {/* AVANTI advisory */}
        <div style={{
          background: '#0c0c10', borderLeft: '3px solid #FBBF24', border: '1px solid #1e1e26', borderLeftWidth: 3, borderLeftColor: '#FBBF24',
          borderRadius: 10, padding: '12px 14px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span className="avanti-dot" style={{ width: 6, height: 6 }}></span>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9, fontWeight: 600, color: '#FBBF24', letterSpacing: '0.1em' }}>AVANTI · TRAINING</div>
          </div>
          <div style={{ fontSize: 12.5, color: '#C8C8D0', lineHeight: 1.45 }}>
            Moderate recovery. Tonight's club practice is high-intensity — consider scaling to 75% effort or skipping max-effort drills.
          </div>
        </div>
      </div>
      <BottomNav active="home" />
    </Phone>
  );
};

// ============ F4c — Garmin Connected ============
const F4Garmin = () => (
  <Phone>
    <MobileHeader tier="mentor" />
    <BackRowF label="Garmin Forerunner" />
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 90px' }} className="no-scrollbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span className="avanti-dot" style={{ width: 7, height: 7 }}></span>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10.5, fontWeight: 600, color: '#34D399', letterSpacing: '0.08em' }}>GARMIN · LAST SYNC 8M</span>
      </div>

      {/* VO2 + Training Load */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        <div style={{ background: '#0c0c10', border: '1px solid #1A2A50', borderRadius: 12, padding: '14px 14px' }}>
          <div className="mono-label" style={{ marginBottom: 6, fontSize: 8.5 }}>VO₂ MAX</div>
          <div style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 32, color: '#5577DD', lineHeight: 1 }}>54</div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: '#34D399', letterSpacing: '0.05em', marginTop: 6 }}>SUPERIOR · 90TH %ILE</div>
        </div>
        <div style={{ background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 12, padding: '14px 14px' }}>
          <div className="mono-label" style={{ marginBottom: 6, fontSize: 8.5 }}>TRAINING LOAD · 7D</div>
          <div style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 32, color: '#F5F0EB', lineHeight: 1 }}>432</div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: '#FBBF24', letterSpacing: '0.05em', marginTop: 6 }}>● HIGH · 380–500</div>
        </div>
      </div>

      {/* Status row */}
      <div style={{ background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 12, padding: '14px 16px', marginBottom: 14 }}>
        <div className="mono-label" style={{ marginBottom: 10 }}>TRAINING STATUS</div>
        <div style={{ fontFamily: 'Oswald', fontWeight: 700, fontSize: 18, color: '#34D399', letterSpacing: '0.005em', marginBottom: 4 }}>PRODUCTIVE</div>
        <div style={{ fontSize: 12.5, color: '#C8C8D0', lineHeight: 1.45 }}>
          Your fitness is improving. Maintain current load and recovery routine.
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
          {['ANAEROBIC ↑', 'AEROBIC HIGH ↑', 'AEROBIC LOW ↑'].map(t => (
            <span key={t} style={{
              fontFamily: 'JetBrains Mono', fontSize: 9, fontWeight: 600, color: '#34D399',
              background: '#051A10', border: '1px solid #0D4A28', padding: '3px 8px', borderRadius: 999, letterSpacing: '0.06em',
            }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Recent activities */}
      <div className="mono-label" style={{ marginBottom: 8 }}>RECENT ACTIVITIES</div>
      <div style={{ background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 12, overflow: 'hidden' }}>
        {[
          { name: 'Threshold Run', sub: '5.2 mi · 36:18 · 6:58/mi', date: 'Today', kcal: '512' },
          { name: 'Recovery Bike', sub: '12.4 mi · 42:20 · Z2', date: 'Apr 24', kcal: '380' },
          { name: 'Speed Intervals', sub: '8 × 400m · 1:18 avg', date: 'Apr 23', kcal: '420' },
        ].map((a, i, arr) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 11,
            padding: '12px 14px', borderBottom: i < arr.length - 1 ? '1px solid #15151c' : 'none',
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: 13, color: '#F5F0EB' }}>{a.name}</div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9.5, color: '#8888A0', letterSpacing: '0.04em', marginTop: 2 }}>{a.sub}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 600, fontSize: 11.5, color: '#F5F0EB' }}>{a.kcal} kcal</div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: '#8888A0', letterSpacing: '0.04em', marginTop: 2 }}>{a.date}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
    <BottomNav active="home" />
  </Phone>
);

// ============ F4d — Live biometric tile in Home Grid ============
const F4HomeWithBio = () => (
  <Phone>
    <MobileHeader tier="mentor" />
    {/* AVANTI strip */}
    <div style={{ padding: '11px 18px 13px', borderBottom: '1px solid #15151c', background: 'rgba(5,26,16,0.18)', display: 'flex', alignItems: 'center', gap: 10 }}>
      <span className="avanti-dot" style={{ flexShrink: 0 }}></span>
      <div style={{ flex: 1, fontSize: 12, color: '#C8C8D0', lineHeight: 1.35 }}>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, fontWeight: 600, color: '#34D399', letterSpacing: '0.1em', marginRight: 6 }}>BIO</span>
        Recovery 87 · cleared for hard training today.
      </div>
    </div>
    <div style={{ flex: 1, padding: '14px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gridAutoRows: '92px', gap: 8, alignContent: 'start' }}>
      {/* Live bio tile (full width) */}
      <div style={{
        gridColumn: '1 / -1', height: 'auto',
        background: 'linear-gradient(135deg, rgba(247,148,30,0.10) 0%, rgba(52,211,153,0.06) 100%), #0c0c10',
        border: '1px solid #4A3200', borderRadius: 12, padding: '14px 14px',
        display: 'flex', alignItems: 'center', gap: 14, position: 'relative', overflow: 'hidden',
      }}>
        {/* Mini ring */}
        <div style={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}>
          <svg width="64" height="64" viewBox="0 0 64 64" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="32" cy="32" r="26" stroke="#15151c" strokeWidth="6" fill="none" />
            <circle cx="32" cy="32" r="26" stroke="#FF6B6B" strokeWidth="6" fill="none"
              strokeDasharray="163.4" strokeDashoffset="40" strokeLinecap="round" />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 18, color: '#F5F0EB' }}>72</div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span className="avanti-dot" style={{ width: 6, height: 6 }}></span>
            <div className="mono-label" style={{ fontSize: 8.5 }}>LIVE · APPLE WATCH</div>
          </div>
          <div style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 14, color: '#F5F0EB', letterSpacing: '0.005em', marginBottom: 2 }}>72 BPM · Recovery 87</div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: '#34D399', letterSpacing: '0.05em' }}>● PRIMED FOR INTERVALS</div>
        </div>
      </div>
      {[
        { label: 'Schedule', sub: 'Practice tonight 5:30 PM' },
        { label: 'Roster', sub: '16 athletes' },
        { label: 'Wallet', sub: '$2,847.50' },
        { label: 'My Sessions', sub: '3 upcoming', badge: '2' },
      ].map((t, i) => (
        <div key={i} style={{ background: '#0c0c10', border: '1px solid #1e1e26', borderRadius: 12, padding: '12px 12px', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: '#1a1a20', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C8C8D0', fontFamily: 'Oswald', fontWeight: 700, fontSize: 12 }}>{t.label.charAt(0)}</div>
          <div>
            <div style={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 13.5, color: '#F5F0EB', letterSpacing: '0.005em' }}>{t.label}</div>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: 8.5, color: '#8888A0', letterSpacing: '0.04em', marginTop: 2 }}>{t.sub}</div>
          </div>
          {t.badge && <span style={{ position: 'absolute', top: 8, right: 8, fontFamily: 'JetBrains Mono', fontSize: 8.5, fontWeight: 700, color: '#000', background: '#F7941E', padding: '1px 6px', borderRadius: 999 }}>{t.badge}</span>}
        </div>
      ))}
    </div>
    <BottomNav active="home" />
  </Phone>
);

Object.assign(window, { F3Entry, F3Auth, F4Apple, F4Whoop, F4Garmin, F4HomeWithBio });
