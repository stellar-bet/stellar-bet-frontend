'use client';

import Link from 'next/link';

const GAMES = [
  {
    href: '/aviator',
    title: 'Aviator',
    desc: 'Cash out before the plane flies away. Multipliers up to 100x.',
    icon: '✈️',
    tag: '🔥 HOT',
    tagColor: '#d32f2f',
    bg: '#fff3e0',
    border: '#e65100',
    stats: [{ l: 'Max Win', v: '100x' }, { l: 'Min Bet', v: '1 XLM' }],
  },
  {
    href: '/games/mines',
    title: 'Mines',
    desc: 'Pick safe tiles, avoid bombs. Cash out anytime to lock in your winnings.',
    icon: '💣',
    tag: 'Strategy',
    tagColor: '#c62828',
    bg: '#ffebee',
    border: '#c62828',
    stats: [{ l: 'Max Mines', v: '24' }, { l: 'Min Stake', v: '1 XLM' }],
  },
  {
    href: '/games/plinko',
    title: 'Plinko',
    desc: 'Drop the ball through pegs and land on a multiplier bucket.',
    icon: '🔵',
    tag: 'Luck',
    tagColor: '#6a1b9a',
    bg: '#f3e5f5',
    border: '#6a1b9a',
    stats: [{ l: 'Max Win', v: '29x' }, { l: 'Rows', v: '8' }],
  },
  {
    href: '/games/dice',
    title: 'Dice',
    desc: 'Roll over or under your chosen number. Set your own win chance.',
    icon: '🎲',
    tag: 'Classic',
    tagColor: '#1565c0',
    bg: '#e3f2fd',
    border: '#1565c0',
    stats: [{ l: 'Min Odds', v: '1.01x' }, { l: 'Max Odds', v: '99x' }],
  },
  {
    href: '/games/hilo',
    title: 'HiLo',
    desc: 'Guess higher or lower than the current card. Build a winning streak.',
    icon: '🃏',
    tag: 'Cards',
    tagColor: '#2e7d32',
    bg: '#e8f5e9',
    border: '#2e7d32',
    stats: [{ l: 'Deck', v: '52 cards' }, { l: 'Cash out', v: 'Anytime' }],
  },
  {
    href: '/games/keno',
    title: 'Keno',
    desc: 'Pick 1–10 lucky numbers. 20 numbers are drawn. Match as many as you can.',
    icon: '🎱',
    tag: 'Numbers',
    tagColor: '#00838f',
    bg: '#e0f7fa',
    border: '#00838f',
    stats: [{ l: 'Numbers', v: '1–40' }, { l: 'Drawn', v: '20' }],
  },
  {
    href: '/games/wheel',
    title: 'Wheel',
    desc: 'Spin the wheel and land on a multiplier. Simple and exciting.',
    icon: '🎡',
    tag: 'Spin',
    tagColor: '#ad1457',
    bg: '#fce4ec',
    border: '#ad1457',
    stats: [{ l: 'Max Win', v: '10x' }, { l: 'Segments', v: '7' }],
  },
  {
    href: '/games/limbo',
    title: 'Limbo',
    desc: 'Set a target multiplier. Will the result reach it? Higher targets = bigger wins.',
    icon: '🚀',
    tag: 'High Risk',
    tagColor: '#e65100',
    bg: '#fff3e0',
    border: '#e65100',
    stats: [{ l: 'Min Target', v: '1.01x' }, { l: 'Max Target', v: '1000x' }],
  },
];

function GameCanvas({ href }: { href: string }) {
  if (href === '/aviator') return (
    <div className="flex flex-col items-center justify-center h-28 gap-1"
      style={{ background: 'linear-gradient(180deg,#1a3a15 0%,#0d1f0a 100%)' }}>
      <span className="text-5xl" style={{ transform: 'rotate(-20deg)' }} aria-hidden="true">✈️</span>
      <span className="text-2xl font-black text-white tabular-nums">2.87x</span>
      <span className="text-xs text-red-300 animate-pulse">flying away...</span>
    </div>
  );
  if (href === '/games/mines') return (
    <div className="grid grid-cols-5 gap-1 p-3 h-28 content-center bg-gray-900">
      {Array.from({length:15}).map((_,i)=>(
        <div key={i} className={`aspect-square rounded flex items-center justify-center text-sm
          ${[2,7,13].includes(i)?'bg-red-800 text-red-300':[0,4,9].includes(i)?'bg-green-800 text-green-300':'bg-gray-700'}`}>
          {[2,7,13].includes(i)?'💣':[0,4,9].includes(i)?'💎':''}
        </div>
      ))}
    </div>
  );
  if (href === '/games/plinko') return (
    <div className="h-28 bg-gray-900 flex items-center justify-center">
      <svg width="140" height="90" viewBox="0 0 160 90" aria-hidden="true">
        {[0,1,2,3].map(row=>Array.from({length:row+2}).map((_,col)=>{
          const x = 80-((row+1)*16)+col*32, y = 10+row*18;
          return <circle key={`${row}-${col}`} cx={x} cy={y} r={4} fill="rgba(255,255,255,0.3)" />;
        }))}
        <circle cx={80} cy={6} r={6} fill="#00a651" />
        {['29x','2x','1x','2x','29x'].map((l,i)=>(
          <text key={i} x={16+i*32} y={82} textAnchor="middle" fill={i===0||i===4?'#f9a825':'#6b7280'} fontSize={9} fontWeight="bold">{l}</text>
        ))}
      </svg>
    </div>
  );
  if (href === '/games/dice') return (
    <div className="h-28 bg-gray-900 flex flex-col items-center justify-center gap-2">
      <div className="w-16 h-16 rounded-xl border-2 border-white/20 bg-white/10 flex items-center justify-center text-4xl font-black text-white">
        42
      </div>
      <span className="text-xs text-green-400 font-bold">Roll Over 40</span>
    </div>
  );
  if (href === '/games/hilo') return (
    <div className="h-28 bg-gray-900 flex items-center justify-center gap-3">
      {[{r:'K',s:'♠',c:'#fff'},{r:'→',s:'',c:'#6b7280'},{r:'?',s:'',c:'#374151'}].map((c,i)=>(
        <div key={i} className="w-12 h-16 rounded-lg border border-white/20 bg-white/10 flex flex-col items-center justify-center">
          <span className="font-black text-sm" style={{color:c.c}}>{c.r}</span>
          <span style={{color:c.c}}>{c.s}</span>
        </div>
      ))}
    </div>
  );
  if (href === '/games/keno') return (
    <div className="h-28 bg-gray-900 p-2 flex flex-col justify-center">
      <div className="grid grid-cols-8 gap-0.5">
        {Array.from({length:24}).map((_,i)=>(
          <div key={i} className={`aspect-square rounded text-center flex items-center justify-center text-3xs font-bold
            ${[3,7,11,15,20].includes(i)?'bg-yellow-500 text-black':[2,9,14].includes(i)?'bg-sp-green text-white':'bg-gray-700 text-gray-400'}`}>
            {i+1}
          </div>
        ))}
      </div>
    </div>
  );
  if (href === '/games/wheel') return (
    <div className="h-28 bg-gray-900 flex items-center justify-center">
      <svg width="90" height="90" viewBox="0 0 90 90" aria-hidden="true">
        {['#00a651','#f9a825','#6a1b9a','#d32f2f','#374151','#00838f','#6b7280'].map((color,i)=>{
          const sa=(i/7)*360-90, ea=((i+1)/7)*360-90;
          const s={x:45+36*Math.cos(sa*Math.PI/180),y:45+36*Math.sin(sa*Math.PI/180)};
          const e={x:45+36*Math.cos(ea*Math.PI/180),y:45+36*Math.sin(ea*Math.PI/180)};
          return <path key={i} d={`M45,45 L${s.x},${s.y} A36,36,0,0,1,${e.x},${e.y} Z`} fill={color} stroke="#111" strokeWidth={1}/>;
        })}
        <circle cx={45} cy={45} r={8} fill="#111" />
        <polygon points="45,5 48,14 42,14" fill="#fff" />
      </svg>
    </div>
  );
  if (href === '/games/limbo') return (
    <div className="h-28 bg-gray-900 flex flex-col items-center justify-center gap-1">
      <span className="text-4xl animate-bounce" aria-hidden="true">🚀</span>
      <span className="text-2xl font-black text-yellow-400 tabular-nums">3.50x</span>
      <span className="text-xs text-green-400">target 2.00x ✓</span>
    </div>
  );
  return <div className="h-28 bg-gray-900 flex items-center justify-center text-5xl">{GAMES.find(g=>g.href===href)?.icon}</div>;
}

export default function GamesPage() {
  return (
    <div className="max-w-5xl mx-auto px-3 py-5">

      {/* Header */}
      <div className="section-header rounded-t mb-0">
        🎮 Casino Games
      </div>
      <div className="bg-white border border-sp-border border-t-0 rounded-b px-4 py-3 mb-4 shadow-sm">
        <p className="text-sm text-sp-muted">
          Instant casino games powered by XLM on Stellar Testnet. All provably fair. No real funds.
        </p>
      </div>

      {/* Featured: Aviator */}
      <Link href="/aviator" className="block mb-5 group">
        <div className="rounded-lg overflow-hidden border-2 border-orange-500 shadow-lg">
          <div className="flex items-center justify-between px-5 py-4"
            style={{ background: 'linear-gradient(135deg, #e65100 0%, #bf360c 100%)' }}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-sp-yellow text-black text-xs font-black px-2 py-0.5 rounded">🔥 MOST POPULAR</span>
              </div>
              <h2 className="text-2xl font-black text-white">✈️ Aviator</h2>
              <p className="text-white/80 text-sm mt-1">
                Crash game — cash out before the plane flies away. Multipliers up to 100x+
              </p>
              <div className="mt-3 inline-flex items-center gap-2 bg-sp-yellow text-black px-4 py-2 rounded font-black text-sm hover:opacity-90 transition-opacity">
                Play Now →
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-3" aria-hidden="true">
              {[14.32,1.05,3.88,9.77].map((v,i)=>(
                <div key={i} className={`text-center px-3 py-2 rounded-lg bg-white/10 border border-white/20`}>
                  <div className={`font-black text-lg ${v>5?'text-yellow-300':v<2?'text-red-300':'text-green-300'}`}>{v}x</div>
                  <div className="text-xs text-white/50">round {i+1}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Link>

      {/* Games grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {GAMES.filter(g=>g.href!=='/aviator').map(game => (
          <Link key={game.href} href={game.href} className="group block">
            <div className="bg-white rounded-lg border-2 overflow-hidden shadow-sm transition-all group-hover:shadow-md"
              style={{ borderColor: game.border }}>

              {/* Visual canvas */}
              <GameCanvas href={game.href} />

              {/* Info */}
              <div className="p-3" style={{ background: game.bg }}>
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-black text-sp-text">
                    {game.icon} {game.title}
                  </h3>
                  <span className="text-2xs font-black text-white px-1.5 py-0.5 rounded ml-1 flex-none"
                    style={{ background: game.tagColor }}>
                    {game.tag}
                  </span>
                </div>
                <p className="text-xs text-sp-muted leading-relaxed mb-2">{game.desc}</p>
                <div className="flex gap-3">
                  {game.stats.map(s=>(
                    <div key={s.l} className="text-center">
                      <p className="text-sm font-black" style={{color:game.tagColor}}>{s.v}</p>
                      <p className="text-2xs text-sp-muted">{s.l}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-xs font-bold group-hover:underline" style={{color:game.tagColor}}>
                  Play →
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <p className="text-center text-xs text-sp-muted mt-5">
        All games run on Stellar Testnet · No real funds · 5% house edge · Provably fair RNG
      </p>
    </div>
  );
}
