'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUserStore, AVATAR_ICONS, CURRENCY_LABELS } from '@/store/userStore';
import { useWalletStore } from '@/store/walletStore';
import { useOddsStore } from '@/store/oddsStore';
import { OddsFormat, ODDS_FORMAT_LABELS, formatOdds } from '@/lib/odds';
import { shortenAddress, formatXlm } from '@/lib/utils';
import { STELLAR_NETWORK } from '@/lib/constants';
import toast from 'react-hot-toast';

const STATS = { totalBets:47, wonBets:28, lostBets:17, cancelledBets:2, totalWagered:1240, totalWon:1580, biggestWin:320, streak:3 };
const TXS = [
  { id:'tx1', type:'win',      desc:'Arsenal vs Man Utd — Arsenal win', amount:+105, date:'Today' },
  { id:'tx2', type:'bet',      desc:'Chelsea vs Liverpool — stake',      amount:-50,  date:'Today' },
  { id:'tx3', type:'deposit',  desc:'XLM deposit via Freighter',         amount:+500, date:'Yesterday' },
  { id:'tx4', type:'win',      desc:'Mines cashout 3.20x',               amount:+64,  date:'2 days ago' },
  { id:'tx5', type:'loss',     desc:'Lakers vs Celtics — lost',          amount:0,    date:'2 days ago' },
  { id:'tx6', type:'withdraw', desc:'XLM withdrawal',                    amount:-200, date:'3 days ago' },
];
const TX_ICONS: Record<string,string> = { bet:'🎯', win:'🏆', loss:'❌', deposit:'📥', withdraw:'📤' };
const TX_COLORS: Record<string,string> = { bet:'text-sp-muted', win:'text-green-600', loss:'text-sp-live', deposit:'text-blue-600', withdraw:'text-orange-600' };

type Tab = 'overview'|'bets'|'transactions'|'settings';

export default function AccountPage() {
  const router = useRouter();
  const { profile, logout } = useUserStore();
  const { isConnected, address, connect, disconnect } = useWalletStore();
  const { format, setFormat } = useOddsStore();
  const [tab, setTab] = useState<Tab>('overview');
  const [xlmBalance, setXlmBalance] = useState<string|null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!profile?.isRegistered) router.replace('/register');
  }, [profile, router]);

  useEffect(() => {
    if (!address) return;
    const url = `https://horizon-testnet.stellar.org/accounts/${address}`;
    fetch(url).then(r=>r.json()).then(d => {
      const n = d.balances?.find((b:{asset_type:string}) => b.asset_type==='native');
      if (n) setXlmBalance(parseFloat(n.balance).toFixed(2));
    }).catch(()=>setXlmBalance('—'));
  }, [address]);

  function copyAddress() {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    toast.success('Address copied!');
    setTimeout(()=>setCopied(false),2000);
  }

  function handleLogout() {
    logout(); disconnect();
    toast('Logged out 👋');
    router.push('/');
  }

  if (!profile) return null;

  const winRate = ((STATS.wonBets/(STATS.wonBets+STATS.lostBets))*100).toFixed(0);
  const pnl = STATS.totalWon - STATS.totalWagered;
  const TABS: {id:Tab;label:string;icon:string}[] = [
    {id:'overview',label:'Overview',icon:'📊'},
    {id:'bets',label:'My Bets',icon:'🎯'},
    {id:'transactions',label:'Transactions',icon:'📋'},
    {id:'settings',label:'Settings',icon:'⚙️'},
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">

      {/* Profile card */}
      <div className="bg-white border border-sp-border rounded-lg shadow-sm overflow-hidden">
        <div className="h-1.5 bg-sp-green" />
        <div className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-sp-green3 border-2 border-sp-green flex items-center justify-center text-4xl flex-none">
              {AVATAR_ICONS[profile.avatar]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black text-sp-text">@{profile.username}</h1>
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">Active</span>
                {STELLAR_NETWORK==='testnet' && <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded-full">Testnet</span>}
              </div>
              <p className="text-sp-muted text-sm mt-0.5">{profile.country} · Member since {new Date(profile.createdAt).toLocaleDateString('en-US',{month:'long',year:'numeric'})}</p>
              {isConnected && address ? (
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 flex-none" />
                  <span className="font-mono text-xs text-sp-muted">{shortenAddress(address)}</span>
                  <button onClick={copyAddress} className="text-xs text-sp-green hover:underline font-semibold">{copied?'✓ Copied':'Copy'}</button>
                </div>
              ) : (
                <button onClick={connect} className="mt-2 text-xs bg-sp-green text-white px-3 py-1 rounded font-bold hover:bg-sp-green2">Connect Wallet</button>
              )}
            </div>
            <div className="hidden sm:block text-right">
              <p className="text-xs text-sp-muted">XLM Balance</p>
              <p className="text-2xl font-black text-sp-text">{xlmBalance??'...'}</p>
              <p className="text-xs text-sp-muted">XLM</p>
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            {[{icon:'📥',label:'Deposit'},{icon:'📤',label:'Withdraw'},{icon:'🎯',label:'My Bets',href:'/my-bets'}].map((a,i)=>(
              <button key={i} onClick={()=>a.href?router.push(a.href):toast('Use Freighter wallet to '+a.label.toLowerCase())}
                className="flex flex-col items-center gap-1 py-3 rounded border border-sp-border bg-gray-50 hover:bg-sp-green3 hover:border-sp-green transition-colors">
                <span className="text-xl">{a.icon}</span>
                <span className="text-xs font-semibold text-sp-text">{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border border-sp-border rounded-lg overflow-hidden bg-white shadow-sm" role="tablist">
        {TABS.map(t=>(
          <button key={t.id} role="tab" aria-selected={tab===t.id}
            onClick={()=>setTab(t.id)}
            className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 text-xs font-bold transition-colors
              ${tab===t.id?'bg-sp-green text-white':'text-sp-muted hover:bg-gray-50'}`}>
            <span>{t.icon}</span><span className="hidden sm:block">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab==='overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {label:'Total Bets',value:STATS.totalBets,icon:'🎯',color:'text-sp-text'},
              {label:'Win Rate',value:`${winRate}%`,icon:'✅',color:'text-green-600'},
              {label:'Total Wagered',value:`${STATS.totalWagered} XLM`,icon:'💰',color:'text-sp-odds'},
              {label:'P&L',value:`${pnl>0?'+':''}${pnl} XLM`,icon:pnl>=0?'📈':'📉',color:pnl>=0?'text-green-600':'text-sp-live'},
            ].map(s=>(
              <div key={s.label} className="bg-white border border-sp-border rounded-lg p-4 text-center shadow-sm">
                <p className="text-2xl mb-1">{s.icon}</p>
                <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs text-sp-muted mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-white border border-sp-border rounded-lg p-5 shadow-sm">
            <h2 className="font-bold text-sp-text mb-4">Betting breakdown</h2>
            {[
              {label:'Won',value:STATS.wonBets,color:'bg-green-500',width:`${(STATS.wonBets/STATS.totalBets)*100}%`},
              {label:'Lost',value:STATS.lostBets,color:'bg-sp-live',width:`${(STATS.lostBets/STATS.totalBets)*100}%`},
              {label:'Cancelled',value:STATS.cancelledBets,color:'bg-gray-400',width:`${(STATS.cancelledBets/STATS.totalBets)*100}%`},
            ].map(r=>(
              <div key={r.label} className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-sp-muted">{r.label}</span>
                  <span className="font-bold text-sp-text">{r.value}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${r.color} rounded-full`} style={{width:r.width}} />
                </div>
              </div>
            ))}
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-sp-border text-center">
              <div><p className="text-xs text-sp-muted">Biggest Win</p><p className="font-black text-green-600">{STATS.biggestWin} XLM</p></div>
              <div><p className="text-xs text-sp-muted">Win Streak</p><p className="font-black text-sp-yellow">🔥 {STATS.streak}</p></div>
            </div>
          </div>

          {/* Getting started */}
          <div className="bg-sp-green3 border border-sp-border rounded-lg p-5">
            <h2 className="font-bold text-sp-text mb-3">💡 Getting Started</h2>
            <ol className="space-y-2.5 text-sm text-sp-muted">
              {[
                <>Install <a href="https://www.freighter.app" target="_blank" rel="noopener noreferrer" className="text-sp-green font-semibold hover:underline">Freighter wallet</a> and switch to <strong className="text-sp-text">Testnet</strong>.</>,
                <>Get free testnet XLM from <a href="https://friendbot.stellar.org" target="_blank" rel="noopener noreferrer" className="text-sp-green font-semibold hover:underline">Friendbot</a>.</>,
                <>Click <strong className="text-sp-text">Login</strong> in the top bar, then browse <Link href="/sports" className="text-sp-green font-semibold hover:underline">Sports</Link> to start betting.</>,
                <>Click any odds → set your stake → <strong className="text-sp-text">Place Bet</strong>.</>,
              ].map((item,i)=>(
                <li key={i} className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-sp-green text-white flex items-center justify-center text-xs font-bold flex-none">{i+1}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* Bets tab */}
      {tab==='bets' && (
        <div className="bg-white border border-sp-border rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-sp-border flex items-center justify-between">
            <h2 className="font-bold text-sp-text">Recent Bets</h2>
            <Link href="/my-bets" className="text-sp-green text-sm font-semibold hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-sp-border">
            {[
              {match:'Arsenal vs Man Utd',pick:'Arsenal',odds:21000,stake:50,status:'Won',result:'+55 XLM'},
              {match:'Lagos vs Senegal',pick:'Draw',odds:29000,stake:20,status:'Open',result:'Pending'},
              {match:'Lakers vs Celtics',pick:'Lakers',odds:21000,stake:25,status:'Lost',result:'-25 XLM'},
              {match:'Mines 3 bombs',pick:'Cashout',odds:32000,stake:20,status:'Won',result:'+44 XLM'},
            ].map((b,i)=>(
              <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-sp-text truncate">{b.match}</p>
                  <p className="text-xs text-sp-muted mt-0.5">{b.pick} · {formatOdds(b.odds,format)}</p>
                </div>
                <div className="text-right ml-4 flex-none">
                  <p className={`text-sm font-bold ${b.status==='Won'?'text-green-600':b.status==='Lost'?'text-sp-live':'text-sp-yellow'}`}>{b.result}</p>
                  <p className="text-xs text-sp-muted">{b.stake} XLM</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transactions tab */}
      {tab==='transactions' && (
        <div className="bg-white border border-sp-border rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-sp-border">
            <h2 className="font-bold text-sp-text">Transaction History</h2>
          </div>
          <div className="divide-y divide-sp-border">
            {TXS.map(tx=>(
              <div key={tx.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                <span className="text-xl flex-none">{TX_ICONS[tx.type]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-sp-text truncate">{tx.desc}</p>
                  <p className="text-xs text-sp-muted">{tx.date}</p>
                </div>
                <div className="text-right flex-none">
                  <p className={`text-sm font-bold ${TX_COLORS[tx.type]}`}>
                    {tx.amount>0?`+${tx.amount}`:tx.amount===0?'—':tx.amount} XLM
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings tab */}
      {tab==='settings' && (
        <div className="space-y-4">
          {/* Odds format */}
          <div className="bg-white border border-sp-border rounded-lg shadow-sm p-5">
            <h2 className="font-bold text-sp-text mb-1">Odds Format</h2>
            <p className="text-xs text-sp-muted mb-4">Choose how odds display across the platform</p>
            <div className="grid grid-cols-3 gap-3">
              {(['decimal','fractional','american'] as OddsFormat[]).map(f=>(
                <button key={f} onClick={()=>{setFormat(f);toast.success(`Odds: ${ODDS_FORMAT_LABELS[f]}`,{duration:1200});}}
                  aria-pressed={format===f}
                  className={`flex flex-col items-center py-4 rounded border-2 transition-all
                    ${format===f?'border-sp-green bg-sp-green3':'border-sp-border bg-white hover:border-sp-green'}`}>
                  <span className={`text-lg font-black ${format===f?'text-sp-green':'text-sp-text'}`}>
                    {f==='decimal'?'2.50':f==='fractional'?'3/2':'+150'}
                  </span>
                  <span className={`text-xs capitalize mt-1 font-medium ${format===f?'text-sp-green':'text-sp-muted'}`}>
                    {ODDS_FORMAT_LABELS[f]}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-xs text-sp-muted text-center mt-3">
              Preview: Arsenal {formatOdds(21000,format)} · Draw {formatOdds(34000,format)} · Man Utd {formatOdds(36000,format)}
            </p>
          </div>

          {/* Wallet */}
          <div className="bg-white border border-sp-border rounded-lg shadow-sm p-5">
            <h2 className="font-bold text-sp-text mb-4">Wallet</h2>
            {isConnected && address ? (
              <div className="space-y-3">
                <div className="bg-gray-50 rounded border border-sp-border p-3 font-mono text-xs text-sp-text break-all">{address}</div>
                <div className="flex gap-3">
                  <button onClick={copyAddress}
                    className="flex-1 py-2 rounded border border-sp-border text-sm font-semibold text-sp-text hover:bg-gray-50 transition-colors">
                    {copied?'✓ Copied':'📋 Copy Address'}
                  </button>
                  <a href={`https://stellar.expert/explorer/testnet/account/${address}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex-1 py-2 rounded border border-sp-border text-sm font-semibold text-sp-text hover:bg-gray-50 transition-colors text-center">
                    🔍 Explorer
                  </a>
                </div>
              </div>
            ) : (
              <button onClick={connect} className="sp-btn-green">Connect Freighter</button>
            )}
          </div>

          {/* Logout */}
          <div className="bg-white border border-red-200 rounded-lg shadow-sm p-5">
            <h2 className="font-bold text-sp-text mb-1">Account</h2>
            <p className="text-xs text-sp-muted mb-4">Log out of your account</p>
            <button onClick={handleLogout}
              className="w-full py-2.5 rounded border-2 border-sp-live text-sp-live font-bold hover:bg-red-50 transition-colors">
              Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
