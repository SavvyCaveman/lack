import { Shield, Eye, DollarSign, UserCheck, Mail } from "lucide-react";

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Shield size={28} className="text-emerald-400" />
          <div>
            <h1 className="text-3xl font-black text-white">Privacy Policy</h1>
            <p className="text-zinc-500 text-sm">Plain English. No legalese. Last updated March 2026.</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Our Promise */}
          <section className="bg-zinc-900/60 border border-emerald-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Shield size={18} className="text-emerald-400" />
              <h2 className="text-white font-bold text-lg">Our Promise</h2>
            </div>
            <p className="text-zinc-300 leading-relaxed">
              LACK collects only what's needed to run the platform. We never sell your data without your <strong className="text-emerald-400">explicit, opt-in consent</strong>. Your privacy is the default — not something you have to fight for.
            </p>
            <p className="text-zinc-400 text-sm mt-3">
              If you don't opt in to anything, we don't share anything beyond what's required to keep the lights on.
            </p>
          </section>

          {/* What We Always Collect */}
          <section className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Eye size={18} className="text-zinc-400" />
              <h2 className="text-white font-bold text-lg">What We Always Collect</h2>
            </div>
            <p className="text-zinc-400 text-sm mb-4">This is the bare minimum needed to run any platform safely:</p>
            <ul className="space-y-2 text-zinc-300 text-sm">
              <li className="flex items-start gap-2"><span className="text-zinc-600 mt-0.5">•</span> Your account information (name, email) — to log you in and send you messages</li>
              <li className="flex items-start gap-2"><span className="text-zinc-600 mt-0.5">•</span> Activity logs — to detect fraud, abuse, and keep the platform safe</li>
              <li className="flex items-start gap-2"><span className="text-zinc-600 mt-0.5">•</span> Your listings and applications — because that's what you put on the platform</li>
              <li className="flex items-start gap-2"><span className="text-zinc-600 mt-0.5">•</span> Earnings records — to track what you're owed and process payouts</li>
            </ul>
            <p className="text-zinc-500 text-xs mt-4">We don't sell any of this. Ever.</p>
          </section>

          {/* Opt-In Tiers */}
          <section className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <UserCheck size={18} className="text-zinc-400" />
              <h2 className="text-white font-bold text-lg">What You Can Choose to Share</h2>
            </div>
            <p className="text-zinc-400 text-sm mb-4">These are completely optional. Opting in earns you more money. Opting out costs you nothing.</p>
            <div className="space-y-4">
              <div className="border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-bold text-sm">Tier 1 — Anonymous Usage Data</span>
                  <span className="text-emerald-400 text-xs font-bold">+$0.10 bonus</span>
                </div>
                <p className="text-zinc-400 text-xs">How you browse LACK — pages visited, time spent, general click patterns. <strong className="text-zinc-300">No personal info.</strong> We use this to improve the platform.</p>
              </div>
              <div className="border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-bold text-sm">Tier 2 — Interests & Demographics</span>
                  <span className="text-emerald-400 text-xs font-bold">+$0.25 bonus</span>
                </div>
                <p className="text-zinc-400 text-xs">General interest categories, age range, city-level location. Used to show more relevant content and ads. <strong className="text-zinc-300">Never tied to your identity.</strong></p>
              </div>
              <div className="border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-bold text-sm">Tier 3 — Personalized Ads</span>
                  <span className="text-emerald-400 text-xs font-bold">+$0.50 bonus</span>
                </div>
                <p className="text-zinc-400 text-xs">Browsing patterns used to show ads that match your interests. This is how you earn the most — higher-value ads pay you more. <strong className="text-zinc-300">You can turn this off anytime.</strong></p>
              </div>
            </div>
          </section>

          {/* Ad Revenue Split */}
          <section className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign size={18} className="text-zinc-400" />
              <h2 className="text-white font-bold text-lg">How We Use Ad Revenue</h2>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 bg-emerald-900/30 border border-emerald-500/30 rounded-xl p-4 text-center">
                <div className="text-emerald-400 text-3xl font-black">75%</div>
                <div className="text-zinc-400 text-xs mt-1">Goes directly to you</div>
              </div>
              <div className="flex-1 bg-zinc-800/50 border border-white/10 rounded-xl p-4 text-center">
                <div className="text-zinc-300 text-3xl font-black">25%</div>
                <div className="text-zinc-400 text-xs mt-1">Keeps LACK running</div>
              </div>
            </div>
            <p className="text-zinc-400 text-sm">Our 25% covers servers, support, and building new features. We're not extracting value — we're sharing it.</p>
          </section>

          {/* Your Rights */}
          <section className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <UserCheck size={18} className="text-zinc-400" />
              <h2 className="text-white font-bold text-lg">Your Rights</h2>
            </div>
            <ul className="space-y-3 text-zinc-300 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">✓</span>
                <div><strong>Access your data</strong> — ask us what we have on you, anytime</div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">✓</span>
                <div><strong>Delete your account</strong> — we'll remove everything, no questions</div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">✓</span>
                <div><strong>Export your data</strong> — get a copy of everything we store about you</div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">✓</span>
                <div><strong>Opt out anytime</strong> — change your privacy settings at any time with no penalty</div>
              </li>
            </ul>
          </section>

          {/* Contact */}
          <section className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Mail size={18} className="text-zinc-400" />
              <h2 className="text-white font-bold text-lg">Contact Us</h2>
            </div>
            <p className="text-zinc-400 text-sm">
              Questions about your data or this policy? Email us at{" "}
              <a href="mailto:lack@lack.com" className="text-emerald-400 hover:underline">lack@lack.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
