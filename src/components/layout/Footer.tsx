import Link from 'next/link';

const FOOTER_LINKS = [
  {
    heading: 'Sports',
    links: [
      { label: 'Premier League', href: '/sports' },
      { label: 'Champions League', href: '/sports' },
      { label: 'AFCON', href: '/sports' },
      { label: 'NBA', href: '/sports' },
      { label: 'UFC / MMA', href: '/sports' },
      { label: 'Cricket', href: '/sports' },
    ],
  },
  {
    heading: 'Games',
    links: [
      { label: 'Aviator', href: '/aviator' },
      { label: 'Mines', href: '/games/mines' },
      { label: 'Plinko', href: '/games/plinko' },
      { label: 'Dice', href: '/games/dice' },
      { label: 'HiLo', href: '/games/hilo' },
      { label: 'Wheel', href: '/games/wheel' },
    ],
  },
  {
    heading: 'Account',
    links: [
      { label: 'Register', href: '/register' },
      { label: 'My Account', href: '/account' },
      { label: 'My Bets', href: '/my-bets' },
      { label: 'Earn (Liquidity)', href: '/liquidity' },
      { label: 'Live Betting', href: '/live' },
      { label: 'Virtuals', href: '/virtuals' },
    ],
  },
  {
    heading: 'Platform',
    links: [
      { label: 'How it works', href: '/account' },
      { label: 'Stellar Network', href: 'https://stellar.org', external: true },
      { label: 'Freighter Wallet', href: 'https://www.freighter.app', external: true },
      { label: 'Get Testnet XLM', href: 'https://friendbot.stellar.org', external: true },
      { label: 'GitHub', href: 'https://github.com', external: true },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-brand-900 mt-12 pb-20 lg:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Top row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
          {FOOTER_LINKS.map(section => (
            <div key={section.heading}>
              <h3 className="text-white font-semibold text-sm mb-3">{section.heading}</h3>
              <ul className="space-y-2">
                {section.links.map(link => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-gray-300 text-xs transition-colors"
                      >
                        {link.label} ↗
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-gray-500 hover:text-gray-300 text-xs transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-white/5 pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Logo + tagline */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-xl" aria-hidden="true">⭐</span>
                <span className="font-bold text-white">Stellar<span className="text-accent">Bet</span></span>
              </Link>
              <span className="text-gray-600 text-xs">Powered by Soroban</span>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full">
                ⚠️ Testnet Only
              </span>
              <span className="text-xs bg-white/5 text-gray-400 border border-white/10 px-2 py-0.5 rounded-full">
                18+ Responsible Gambling
              </span>
              <span className="text-xs bg-accent/10 text-accent border border-accent/20 px-2 py-0.5 rounded-full">
                Non-Custodial
              </span>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-gray-700 text-xs mt-4 leading-relaxed max-w-3xl">
            StellarBet is a demonstration application running on Stellar Testnet.
            No real funds are involved. All XLM used is test currency with no monetary value.
            This platform is for educational and development purposes only.
            Do not use with real assets until a full audit has been completed and mainnet deployment is live.
            Gambling can be addictive — play responsibly.
          </p>

          <p className="text-gray-700 text-xs mt-2">
            © 2026 StellarBet · MIT License · Built for the Stellar Wave Program
          </p>
        </div>
      </div>
    </footer>
  );
}
