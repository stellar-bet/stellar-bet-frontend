'use client';

import { useState, useRef } from 'react';
import GameLayout, { StakeControl, ResultBanner } from '@/components/games/GameLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { WHEEL_SEGMENTS, spinWheel } from '@/lib/gameUtils';
import { formatXlm } from '@/lib/utils';
import { useWalletStore } from '@/store/walletStore';
import toast from 'react-hot-toast';

const TOTAL_WEIGHT = WHEEL_SEGMENTS.reduce((s, seg) => s + seg.weight, 0);

// Build degree ranges for each segment
function buildSegmentAngles() {
  let angle = 0;
  return WHEEL_SEGMENTS.map(seg => {
    const degrees = (seg.weight / TOTAL_WEIGHT) * 360;
    const start = angle;
    angle += degrees;
    return { ...seg, startDeg: start, endDeg: angle, midDeg: start + degrees / 2 };
  });
}
const SEGMENTS_WITH_ANGLES = buildSegmentAngles();

export default function WheelPage() {
  const { isConnected, connect } = useWalletStore();
  const [stakeXlm, setStakeXlm] = useState(10);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [won, setWon] = useState<boolean | null>(null);
  const [result, setResult] = useState<typeof WHEEL_SEGMENTS[0] | null>(null);
  const [history, setHistory] = useState<typeof WHEEL_SEGMENTS[0][]>([]);
  const rotRef = useRef(0);

  async function spin() {
    if (!isConnected) { connect(); return; }
    setSpinning(true);
    setWon(null);
    setResult(null);

    const segment = spinWheel();
    // Land on the segment's midpoint (pointer is at top = 0deg, wheel spins clockwise)
    // We want the segment's mid angle to land at 0 degrees
    const targetAngle = 360 - segment.midDeg;
    const extraSpins = 5 * 360 + Math.random() * 360;
    const finalRotation = rotRef.current + extraSpins + targetAngle - (rotRef.current % 360);
    rotRef.current = finalRotation;

    setRotation(finalRotation);

    await new Promise(r => setTimeout(r, 3500));

    const didWin = segment.multiplier > 1;
    setResult(segment);
    setWon(didWin);
    setHistory(h => [segment, ...h].slice(0, 8));
    setSpinning(false);

    if (didWin) toast.success(`${segment.label} — Won ${formatXlm(stakeXlm * segment.multiplier)}!`, { icon: '🎡' });
    else if (segment.multiplier === 1) toast(`Got ${segment.label} — broke even`, { icon: '😐' });
    else toast.error(`${segment.label} — Lost`);
  }

  // Build SVG conic gradient path for each segment
  const cx = 130, cy = 130, r = 120;

  function polarToCartesian(angleDeg: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function segmentPath(startDeg: number, endDeg: number) {
    const s = polarToCartesian(startDeg);
    const e = polarToCartesian(endDeg);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M${cx},${cy} L${s.x},${s.y} A${r},${r},0,${large},1,${e.x},${e.y} Z`;
  }

  const canvas = (
    <Card className="p-4">
      <div className="flex flex-col items-center">
        {/* Pointer */}
        <div className="text-3xl mb-1" aria-hidden="true">▼</div>

        {/* Wheel SVG */}
        <div className="relative" style={{ width: 260, height: 260 }}>
          <svg
            width={260} height={260}
            viewBox="0 0 260 260"
            aria-label="Wheel of Fortune"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? 'transform 3.5s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
            }}
          >
            {SEGMENTS_WITH_ANGLES.map((seg, i) => (
              <g key={i}>
                <path
                  d={segmentPath(seg.startDeg, seg.endDeg)}
                  fill={seg.color}
                  stroke="#0a0e1a"
                  strokeWidth={2}
                />
                {/* Label */}
                <text
                  x={cx + (r * 0.65) * Math.cos(((seg.midDeg - 90) * Math.PI) / 180)}
                  y={cy + (r * 0.65) * Math.sin(((seg.midDeg - 90) * Math.PI) / 180)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontWeight="bold"
                  fontSize={11}
                  style={{ pointerEvents: 'none' }}
                >
                  {seg.label}
                </text>
              </g>
            ))}
            {/* Center circle */}
            <circle cx={cx} cy={cy} r={18} fill="#0a0e1a" stroke="rgba(255,255,255,0.1)" strokeWidth={2} />
          </svg>
        </div>

        {/* Result */}
        {result && (
          <div className={`mt-4 text-center px-6 py-3 rounded-2xl border font-bold text-xl
            ${won ? 'bg-win/10 border-win/30 text-win' :
              result.multiplier === 1 ? 'bg-gray-500/10 border-gray-500/30 text-gray-300' :
              'bg-red-500/10 border-red-500/30 text-red-400'}`}
            aria-live="polite"
          >
            {result.label} {won ? `+${formatXlm(stakeXlm * result.multiplier)}` : result.multiplier === 1 ? '(Break even)' : '(Lost)'}
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="flex gap-1.5 flex-wrap justify-center mt-3">
            {history.map((h, i) => (
              <span key={i}
                className="text-xs px-2 py-0.5 rounded-full font-bold"
                style={{ backgroundColor: h.color + '30', color: h.color }}
              >
                {h.label}
              </span>
            ))}
          </div>
        )}

        <ResultBanner won={won} stakeXlm={stakeXlm} multiplier={result?.multiplier ?? 0} />
      </div>
    </Card>
  );

  const controls = (
    <Card className="p-4 space-y-4">
      <h2 className="text-white font-semibold">Wheel</h2>
      <StakeControl stakeXlm={stakeXlm} setStake={setStakeXlm} disabled={spinning} />

      {/* Segment odds */}
      <div className="space-y-1.5">
        <p className="text-xs text-gray-400 font-medium">Segments</p>
        {WHEEL_SEGMENTS.map((seg, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full flex-none" style={{ backgroundColor: seg.color }} />
              <span className="text-gray-300">{seg.label}</span>
            </div>
            <span className="text-gray-500">{((seg.weight / TOTAL_WEIGHT) * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>

      <Button variant="primary" size="lg" className="w-full" loading={spinning} onClick={spin}>
        {isConnected ? '🎡 Spin' : 'Connect Wallet'}
      </Button>
      <p className="text-center text-xs text-gray-600">5% house edge · Testnet only</p>
    </Card>
  );

  return <GameLayout title="Wheel" icon="🎡" canvas={canvas} controls={controls}>{null}</GameLayout>;
}
