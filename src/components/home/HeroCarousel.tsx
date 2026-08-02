'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const SLIDES = [
  {
    id: 1,
    tag: '🔥 WELCOME BONUS',
    tagBg: '#f9a825',
    tagColor: '#000',
    headline: '200% Welcome Bonus',
    sub: 'Register today and get 200% on your first deposit. Min deposit 10 XLM.',
    cta: 'Register Now',
    ctaHref: '/register',
    cta2: 'View Odds',
    cta2Href: '/sports',
    bgFrom: '#00a651',
    bgTo: '#004d25',
    emoji: '⚽',
    stats: [{ label: 'EPL Matches', value: '10' }, { label: 'Markets', value: '50+' }, { label: 'Min Stake', value: '1 XLM' }],
  },
  {
    id: 2,
    tag: '🏆 CHAMPIONS LEAGUE',
    tagBg: '#f9a825',
    tagColor: '#000',
    headline: 'Real Madrid vs Bayern Munich',
    sub: 'Tonight 20:00 · UCL Group Stage · 50+ markets · Correct Score, HT/FT, BTTS & more.',
    cta: 'Bet Now',
    ctaHref: '/match/ucl_001',
    cta2: 'All UCL Matches',
    cta2Href: '/sports?sport=champions_league',
    bgFrom: '#1565c0',
    bgTo: '#0d47a1',
    emoji: '🏆',
    stats: [{ label: 'Real Madrid', value: '2.05' }, { label: 'Draw', value: '3.50' }, { label: 'Bayern', value: '3.40' }],
  },
  {
    id: 3,
    tag: '🌍 AFCON 2026',
    tagBg: '#f9a825',
    tagColor: '#000',
    headline: 'Nigeria vs Senegal',
    sub: 'The Super Eagles take on the Lions of Teranga. 40+ markets available on today\'s big AFCON clash.',
    cta: 'Bet Now',
    ctaHref: '/match/afcon_001',
    cta2: 'All AFCON Matches',
    cta2Href: '/sports?sport=afcon',
    bgFrom: '#1b5e20',
    bgTo: '#003300',
    emoji: '🌍',
    stats: [{ label: 'Nigeria', value: '2.50' }, { label: 'Draw', value: '2.90' }, { label: 'Senegal', value: '2.80' }],
  },
  {
    id: 4,
    tag: '✈️ AVIATOR — CRASH GAME',
    tagBg: '#e65100',
    tagColor: '#fff',
    headline: 'Cash Out Before It Flies Away!',
    sub: 'Aviator crash game with XLM on Stellar. Multipliers up to 100x — cash out at the right moment to win big.',
    cta: 'Play Aviator',
    ctaHref: '/aviator',
    cta2: 'All Casino Games',
    cta2Href: '/games',
    bgFrom: '#b71c1c',
    bgTo: '#7f0000',
    emoji: '✈️',
    stats: [{ label: 'Max Win', value: '100x' }, { label: 'Min Bet', value: '1 XLM' }, { label: 'Rounds', value: 'Every 30s' }],
  },
];

export default function HeroCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setActive(a => (a + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, [paused]);

  const slide = SLIDES[active];

  return (
    <div
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{
        background: `linear-gradient(135deg, ${slide.bgFrom} 0%, ${slide.bgTo} 100%)`,
        minHeight: 220,
        transition: 'background 0.5s ease',
      }}
    >
      <div className="flex items-center gap-6 px-5 py-5 max-w-[1400px] mx-auto">

        {/* Left: Text content */}
        <div className="flex-1 min-w-0">
          {/* Tag */}
          <span className="inline-block text-xs font-black px-3 py-1 rounded mb-3"
            style={{ background: slide.tagBg, color: slide.tagColor }}>
            {slide.tag}
          </span>

          {/* Headline */}
          <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-2">
            {slide.headline}
          </h1>

          {/* Sub text */}
          <p className="text-white/80 text-sm mb-4 max-w-lg leading-relaxed">
            {slide.sub}
          </p>

          {/* CTA buttons */}
          <div className="flex gap-3 flex-wrap mb-4">
            <Link href={slide.ctaHref}
              className="font-black text-sm px-6 py-2.5 rounded shadow-lg transition-all hover:opacity-90 active:scale-95"
              style={{ background: slide.tagBg, color: slide.tagColor }}>
              {slide.cta}
            </Link>
            <Link href={slide.cta2Href}
              className="font-bold text-sm px-6 py-2.5 rounded border-2 border-white/50
                         text-white hover:bg-white/15 transition-all active:scale-95">
              {slide.cta2}
            </Link>
          </div>

          {/* Quick stats row */}
          <div className="flex gap-4 flex-wrap">
            {slide.stats.map(s => (
              <div key={s.label} className="text-center">
                <div className="text-xl font-black text-white">{s.value}</div>
                <div className="text-2xs text-white/60 uppercase tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Big emoji + decorative odds */}
        <div className="hidden sm:flex flex-col items-center gap-3 flex-none w-44" aria-hidden="true">
          <span className="text-8xl filter drop-shadow-2xl">{slide.emoji}</span>
          {/* Floating odds pills */}
          {slide.stats.map(s => (
            <div key={s.label}
              className="bg-white/10 border border-white/20 rounded-xl px-4 py-1.5 text-center w-full">
              <span className="text-white font-black text-lg">{s.value}</span>
              <span className="text-white/60 text-2xs block">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Slide dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2" role="tablist">
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => setActive(i)}
            role="tab" aria-selected={i === active} aria-label={`Slide ${i + 1}`}
            className="transition-all rounded-full"
            style={{
              width: i === active ? 20 : 8,
              height: 8,
              background: i === active ? '#fff' : 'rgba(255,255,255,0.4)',
            }}
          />
        ))}
      </div>

      {/* Arrow buttons */}
      <button
        onClick={() => setActive(a => (a - 1 + SLIDES.length) % SLIDES.length)}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/25
                   hover:bg-black/45 rounded-full text-white text-xl flex items-center
                   justify-center transition-all z-10"
        aria-label="Previous">‹</button>
      <button
        onClick={() => setActive(a => (a + 1) % SLIDES.length)}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/25
                   hover:bg-black/45 rounded-full text-white text-xl flex items-center
                   justify-center transition-all z-10"
        aria-label="Next">›</button>

      {/* Progress bar */}
      {!paused && (
        <div className="absolute bottom-0 left-0 h-0.5 bg-white/30 w-full">
          <div key={active} className="h-full bg-white"
            style={{ animation: 'progressBar 5s linear forwards' }} />
        </div>
      )}

      <style>{`
        @keyframes progressBar {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  );
}
