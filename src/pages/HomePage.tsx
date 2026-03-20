import { Link } from "react-router-dom";
import { useState, useRef } from "react";
import { DollarSign, Briefcase, Award, ArrowRight, Zap, Users, TrendingUp, Home, X, Play } from "lucide-react";

function CornerVideoWidget() {
  const [dismissed, setDismissed] = useState(() => !!localStorage.getItem("lack_welcome_seen"));
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (dismissed) return null;

  const handlePlay = () => {
    setPlaying(true);
    videoRef.current?.play();
  };

  const handleDismiss = () => {
    localStorage.setItem("lack_welcome_seen", "1");
    setDismissed(true);
  };

  const handleEnded = () => {
    localStorage.setItem("lack_welcome_seen", "1");
    setTimeout(() => setDismissed(true), 2000);
  };

  return (
    <div className="fixed bottom-24 right-6 z-[9990] w-48 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-zinc-900">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-zinc-800/80">
        <span className="text-emerald-400 text-xs font-bold">Welcome to LACK</span>
        <button onClick={handleDismiss} className="text-zinc-500 hover:text-white transition-colors">
          <X size={12} />
        </button>
      </div>
      {/* Video */}
      <div className="relative bg-zinc-950">
        <video
          ref={videoRef}
          src="/lack-intro.mp4"
          muted
          playsInline
          loop={false}
          onEnded={handleEnded}
          className="w-full"
        />
        {!playing && (
          <button
            onClick={handlePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/20 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-500/90 flex items-center justify-center">
              <Play size={16} className="text-black ml-0.5" />
            </div>
          </button>
        )}
      </div>
      <div className="px-3 py-2 bg-zinc-900">
        <p className="text-zinc-400 text-xs leading-snug">Find work. Earn now. Get ahead.</p>
      </div>
    </div>
  );
}

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
  {
    to: "/housing",
    icon: Home,
    iconBg: "bg-amber-500/20",
    iconColor: "text-amber-400",
    borderColor: "border-amber-500/30 hover:border-amber-400/60",
    badge: "3% FEE",
    badgeColor: "bg-amber-500/20 text-amber-400",
    title: "Housing & Real Estate",
    desc: "Rentals, home sales, tenant rights tools, and a community restoration hub to reclaim abandoned buildings as housing.",
    cta: "Find Housing",
    ctaColor: "bg-amber-500 hover:bg-amber-400 text-black",
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
      <CornerVideoWidget />
      {/* Hero */}
      <div className="relative overflow-hidden min-h-[520px]">
        {/* Background hero image */}
        <div className="absolute inset-0 pointer-events-none">
          <img src="/hero-community.jpg" alt="" className="w-full h-full object-cover object-center opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/50 via-zinc-950/75 to-zinc-950" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 pt-10 pb-12 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 text-emerald-400 text-xs font-semibold tracking-wider mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            COMMUNITY KIOSK — OPEN TO ALL
          </div>

          {/* Logo */}
          <div className="flex justify-center mb-4">
            <img
              src="/lack-logo.jpg"
              alt="LACK Logo"
              className="w-40 h-40 md:w-52 md:h-52 object-cover rounded-2xl shadow-2xl shadow-emerald-950/50 border border-white/10"
            />
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-none mb-2">
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
          Four ways to get ahead
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
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
