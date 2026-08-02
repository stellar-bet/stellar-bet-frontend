'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUserStore, AVATAR_ICONS, CURRENCY_LABELS, COUNTRIES, Avatar, Currency } from '@/store/userStore';
import { useWalletStore } from '@/store/walletStore';
import toast from 'react-hot-toast';

const AVATARS: Avatar[] = ['star', 'rocket', 'diamond', 'fire', 'crown', 'thunder'];
const CURRENCIES = Object.keys(CURRENCY_LABELS) as Currency[];

export default function RegisterPage() {
  const router = useRouter();
  const { register, profile } = useUserStore();
  const { isConnected, address, connect } = useWalletStore();
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState<Avatar>('star');
  const [currency, setCurrency] = useState<Currency>('XLM');
  const [country, setCountry] = useState('Nigeria');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (profile?.isRegistered) { router.replace('/account'); return null; }

  function validateStep1() {
    const e: Record<string, string> = {};
    if (!username.trim()) e.username = 'Username is required';
    else if (username.length < 3) e.username = 'Min 3 characters';
    else if (!/^[a-zA-Z0-9_]+$/.test(username)) e.username = 'Letters, numbers and _ only';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleRegister() {
    if (!agreed) { setErrors({ agreed: 'You must agree to continue' }); return; }
    if (!isConnected) { setErrors({ wallet: 'Please connect your wallet first' }); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    register({ username: username.trim(), avatar, currency, country });
    toast.success(`Welcome, ${username}! 🎉`);
    router.push('/account');
  }

  const STEP_LABELS = ['Profile', 'Preferences', 'Connect'];

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-1 mb-3">
            <span className="text-2xl font-black text-sp-green">STELLAR</span>
            <span className="text-2xl font-black text-sp-yellow">BET</span>
          </Link>
          <h2 className="text-xl font-bold text-sp-text">Create Your Account</h2>
          <p className="text-sm text-sp-muted mt-1">Join thousands of bettors on Stellar</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-0 mb-6">
          {STEP_LABELS.map((label, i) => {
            const s = i + 1;
            const done = step > s;
            const active = step === s;
            return (
              <div key={s} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all
                    ${done ? 'bg-sp-green border-sp-green text-white' :
                      active ? 'bg-sp-green border-sp-green text-white' :
                      'bg-white border-sp-border text-sp-muted'}`}>
                    {done ? '✓' : s}
                  </div>
                  <span className={`text-2xs mt-1 font-medium ${active ? 'text-sp-green' : 'text-sp-muted'}`}>
                    {label}
                  </span>
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div className={`w-16 h-0.5 mb-4 mx-1 ${step > s ? 'bg-sp-green' : 'bg-sp-border'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-md border border-sp-border overflow-hidden">

          {/* Green top bar */}
          <div className="h-1.5 bg-sp-green" />

          <div className="p-6">

            {/* Step 1: Profile */}
            {step === 1 && (
              <div className="space-y-5">
                <h3 className="font-bold text-sp-text text-lg">Choose your profile</h3>

                {/* Avatar */}
                <div>
                  <p className="text-sm font-semibold text-sp-text mb-2">Pick an avatar</p>
                  <div className="grid grid-cols-6 gap-2">
                    {AVATARS.map(a => (
                      <button key={a} onClick={() => setAvatar(a)} aria-pressed={avatar === a}
                        className={`aspect-square rounded-lg text-2xl flex items-center justify-center border-2 transition-all
                          ${avatar === a ? 'border-sp-green bg-sp-green3 scale-110' : 'border-sp-border bg-gray-50 hover:border-sp-green'}`}>
                        {AVATAR_ICONS[a]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label htmlFor="username" className="text-sm font-semibold text-sp-text block mb-1.5">
                    Username
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sp-muted font-bold">@</span>
                    <input id="username" type="text" maxLength={20} value={username}
                      onChange={e => { setUsername(e.target.value); setErrors({}); }}
                      placeholder="yourname"
                      className={`w-full border rounded px-4 pl-8 py-2.5 text-sp-text text-sm
                        focus:outline-none focus:border-sp-green focus:ring-1 focus:ring-sp-green/30
                        ${errors.username ? 'border-sp-live' : 'border-sp-border'}`} />
                  </div>
                  {errors.username && <p className="text-sp-live text-xs mt-1">{errors.username}</p>}
                </div>

                <button onClick={() => validateStep1() && setStep(2)}
                  className="sp-btn-green">
                  Continue →
                </button>

                <p className="text-center text-sm text-sp-muted">
                  Already have an account?{' '}
                  <Link href="/account" className="text-sp-green font-semibold hover:underline">Login</Link>
                </p>
              </div>
            )}

            {/* Step 2: Preferences */}
            {step === 2 && (
              <div className="space-y-5">
                <h3 className="font-bold text-sp-text text-lg">Your preferences</h3>

                <div>
                  <label htmlFor="country" className="text-sm font-semibold text-sp-text block mb-1.5">Country</label>
                  <select id="country" value={country} onChange={e => setCountry(e.target.value)}
                    className="w-full border border-sp-border rounded px-3 py-2.5 text-sp-text text-sm
                               focus:outline-none focus:border-sp-green">
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <p className="text-sm font-semibold text-sp-text mb-2">Preferred currency</p>
                  <div className="grid grid-cols-3 gap-2">
                    {CURRENCIES.map(c => (
                      <button key={c} onClick={() => setCurrency(c)} aria-pressed={currency === c}
                        className={`py-2 px-3 rounded border text-xs font-semibold transition-all
                          ${currency === c ? 'bg-sp-green border-sp-green text-white' : 'bg-white border-sp-border text-sp-muted hover:border-sp-green'}`}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)}
                    className="flex-1 py-2.5 rounded border border-sp-border text-sp-text font-bold hover:bg-gray-50 transition-colors">
                    ← Back
                  </button>
                  <button onClick={() => setStep(3)}
                    className="flex-1 sp-btn-green">
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Connect */}
            {step === 3 && (
              <div className="space-y-5">
                <h3 className="font-bold text-sp-text text-lg">Connect & confirm</h3>

                {/* Profile preview */}
                <div className="flex items-center gap-4 bg-sp-green3 rounded-lg p-4 border border-sp-border">
                  <div className="w-14 h-14 rounded-xl bg-white border border-sp-border flex items-center justify-center text-3xl">
                    {AVATAR_ICONS[avatar]}
                  </div>
                  <div>
                    <p className="font-bold text-sp-text text-lg">@{username}</p>
                    <p className="text-sp-muted text-sm">{country} · {currency}</p>
                  </div>
                </div>

                {/* Wallet */}
                <div className={`rounded-lg p-4 border ${isConnected ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-sp-border'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sp-text text-sm">Freighter Wallet</p>
                      {isConnected && address
                        ? <p className="text-xs text-sp-muted font-mono mt-0.5">{address.slice(0,6)}...{address.slice(-6)}</p>
                        : <p className="text-xs text-sp-muted mt-0.5">Not connected</p>}
                    </div>
                    {isConnected
                      ? <span className="flex items-center gap-1.5 text-green-700 text-xs font-bold"><span className="w-2 h-2 rounded-full bg-green-500" />Connected</span>
                      : <button onClick={connect} className="bg-sp-green text-white text-xs font-bold px-3 py-1.5 rounded hover:bg-sp-green2">Connect</button>}
                  </div>
                  {errors.wallet && <p className="text-sp-live text-xs mt-2">{errors.wallet}</p>}
                </div>

                {/* Terms */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={agreed} onChange={e => { setAgreed(e.target.checked); setErrors({}); }}
                    className="mt-0.5 w-4 h-4 accent-sp-green" />
                  <span className="text-xs text-sp-muted leading-relaxed">
                    I am 18+ and agree to the <span className="text-sp-green cursor-pointer hover:underline">Terms of Service</span> and <span className="text-sp-green cursor-pointer hover:underline">Privacy Policy</span>. I understand this is a testnet demo with no real funds.
                  </span>
                </label>
                {errors.agreed && <p className="text-sp-live text-xs -mt-3">{errors.agreed}</p>}

                <div className="flex gap-3">
                  <button onClick={() => setStep(2)}
                    className="flex-1 py-2.5 rounded border border-sp-border text-sp-text font-bold hover:bg-gray-50 transition-colors">
                    ← Back
                  </button>
                  <button onClick={handleRegister} disabled={loading}
                    className="flex-1 sp-btn-green disabled:opacity-50">
                    {loading ? 'Creating...' : 'Create Account 🎉'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-sp-muted mt-4">
          StellarBet · Testnet only · No real funds · 18+
        </p>
      </div>
    </div>
  );
}
