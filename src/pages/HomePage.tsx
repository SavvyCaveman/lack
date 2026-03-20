import { Link } from "react-router-dom";
import { DollarSign, Briefcase, Award, ArrowRight, Zap, Users, TrendingUp } from "lucide-react";

const sections = [
  {
    to: "/earn",
    icon: DollarSign,
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-400",
    borderColor: "border-emerald-500/30 hover:border-emerald-400/60",
    badge: "INSTANT",
    badgeColor: "bg-emerald-500/20 text-emerald-400",
    title: "Earn Right Now",
    desc: "No job required. Browse ads and earn while you sit. Every click counts. Perfect if you're at a library, coffee shop, or just need cash today.",
    cta: "Start Earning",
    ctaColor: "bg-emerald-500 hover:bg-emerald-400 text-black",
  },
  {
    to: "/gigs",
    icon: Briefcase,
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-400",
    borderColor: "border-blue-500/30 hover:border-blue-400/60",
    badge: "LOCAL",
    badgeColor: "bg-blue-500/20 text-blue-400",
    title: "Gig Board",
    desc: "Landscaping, carpentry, snow removal, courier runs, electronics recycling — real local gigs posted by real people. Apply in seconds.",
    cta: "Find Work",
    ctaColor: "bg-blue-500 hover:bg-blue-400 text-white",
  },
  {
    to: "/careers",
    icon: Award,
    iconBg: "bg-purple-500/20",
    iconColor: "text-purple-400",
    borderColor: "border-purple-500/30 hover:border-purple-400/60",
    badge: "NEGOTIATE",
    badgeColor: "bg-purple-500/20 text-purple-400",
    title: "Career Placement",
    desc: "LACK negotiates your salary so you get more. We place you in full-time positions and skim the difference — so it costs you nothing.",
    cta: "Get Placed",
    ctaColor: "bg-purple-500 hover:bg-purple-400 text-white",
  },
];

const stats = [
  { icon: Zap, label: "Avg time to first gig", value: "< 24 hrs" },
  { icon: Users, label: "Community members", value: "Growing daily" },
  { icon: TrendingUp, label: "Salary negotiation success", value: "94%" },
];

export function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Hero */}
      <div className="relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/40 via-zinc-950 to-zinc-950 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 pt-16 pb-12 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 text-emerald-400 text-xs font-semibold tracking-wider mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            COMMUNITY KIOSK — OPEN TO ALL
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-none mb-4">
            <span className="text-emerald-400">LACK</span>
          </h1>
          <p className="text-xl md:text-2xl font-light text-zinc-300 mb-2">
            Local Area Community Kiosk
          </p>
          <p className="text-base text-zinc-500 max-w-lg mx-auto mb-10">
            Find work. Earn now. Get ahead. Built for people who need it most —
            no experience required.
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/earn"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-6 py-3 rounded-xl transition-colors text-sm"
            >
              <DollarSign size={16} />
              Earn Right Now
              <ArrowRight size={14} />
            </Link>
            <Link
              to="/gigs"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white font-medium px-6 py-3 rounded-xl transition-colors text-sm border border-white/10"
            >
              Browse Gigs
            </Link>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="border-y border-white/5 bg-white/2">
        <div className="max-w-4xl mx-auto px-4 py-4 grid grid-cols-3 gap-4">
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex flex-col items-center text-center gap-1">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <Icon size={14} />
                <span className="font-bold text-sm md:text-base text-white">{value}</span>
              </div>
              <span className="text-xs text-zinc-500 hidden md:block">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Section cards */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-xl font-bold text-white mb-6 text-center">
          Three ways to earn
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {sections.map(
            ({
              to,
              icon: Icon,
              iconBg,
              iconColor,
              borderColor,
              badge,
              badgeColor,
              title,
              desc,
              cta,
              ctaColor,
            }) => (
              <div
                key={to}
                className={`bg-zinc-900/60 border rounded-2xl p-5 flex flex-col gap-4 transition-colors ${borderColor}`}
              >
                <div className="flex items-start justify-between">
                  <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
                    <Icon size={20} className={iconColor} />
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
                    {badge}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-base mb-1">{title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{desc}</p>
                </div>
                <Link
                  to={to}
                  className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors mt-auto ${ctaColor}`}
                >
                  {cta}
                  <ArrowRight size={14} />
                </Link>
              </div>
            ),
          )}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <div className="bg-gradient-to-r from-emerald-950/60 to-zinc-900/60 border border-emerald-500/20 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-black text-white mb-2">
            Built for people who need it most
          </h3>
          <p className="text-zinc-400 text-sm mb-6 max-w-md mx-auto">
            Whether you're between jobs, facing hard times, or just looking for
            extra income — LACK is here to help you earn today.
          </p>
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 bg-white text-black font-bold px-6 py-3 rounded-xl hover:bg-zinc-100 transition-colors text-sm"
          >
            <Users size={16} />
            Create Your Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
