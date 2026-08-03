'use client';

import { useEffect, useState } from 'react';

const STATS = [
  { value: '50+',  label: 'Markets'   },
  { value: '100x', label: 'Max Win'   },
  { value: '0%',   label: 'Custody'   },
  { value: '< 5s', label: 'Settles'   },
];

export default function IntroSplash({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 300);
    const t2 = setTimeout(() => setPhase('out'),  2600);
    const t3 = setTimeout(onDone,                 3300);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  const visible = phase === 'hold';

  return (
    <div
      aria-label="StellarBet"
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(160deg, #003d1f 0%, #00a651 50%, #007a3d 100%)',
        opacity: phase === 'out' ? 0 : 1,
        transition: phase === 'out' ? 'opacity 0.7s ease' : 'none',
        pointerEvents: phase === 'out' ? 'none' : 'auto',
        overflow: 'hidden',
      }}
    >
      {/* Subtle grid */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.06,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
        backgroundSize: '44px 44px',
      }} />

      {/* Gold glow */}
      <div style={{
        position: 'absolute', top: '-15%', right: '-5%',
        width: 480, height: 480,
        background: 'radial-gradient(circle, rgba(249,168,37,0.2) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative', textAlign: 'center', padding: '0 24px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}>

        {/* Logo */}
        <div style={{ marginBottom: 8 }}>
          <span style={{ fontSize: 56, fontWeight: 900, color: '#fff', letterSpacing: '-2px', lineHeight: 1 }}>
            STELLAR
          </span>
          <span style={{ fontSize: 56, fontWeight: 900, color: '#f9a825', letterSpacing: '-2px', lineHeight: 1, marginLeft: 8 }}>
            BET
          </span>
        </div>

        {/* One line */}
        <p style={{
          fontSize: 17, fontWeight: 700, color: 'rgba(255,255,255,0.8)',
          letterSpacing: '0.05em', marginBottom: 36,
        }}>
          Bet on-chain. Win instantly.
        </p>

        {/* Stats */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap', marginBottom: 40 }}>
          {STATS.map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#f9a825', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{
          width: 240, margin: '0 auto',
          height: 3, background: 'rgba(255,255,255,0.15)', borderRadius: 999, overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', background: '#f9a825', borderRadius: 999,
            animation: 'splashBar 2.3s linear forwards',
          }} />
        </div>
      </div>

      {/* Bottom badge */}
      <div style={{
        position: 'absolute', bottom: 20,
        fontSize: 11, color: 'rgba(255,255,255,0.35)',
        letterSpacing: '0.12em', textTransform: 'uppercase',
        opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease',
      }}>
        ✦ Built on Stellar Soroban
      </div>

      <style>{`
        @keyframes splashBar {
          from { width: 0% }
          to   { width: 100% }
        }
      `}</style>
    </div>
  );
}
