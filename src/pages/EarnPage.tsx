import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client as rpc } from "@/lib/client";
import {
  Battery, Cpu, Tv, Smartphone, Zap, ExternalLink,
  DollarSign, Play, ChevronRight, X, Rocket, Shield,
  ToggleLeft, ToggleRight, Trophy, Newspaper, Clapperboard,
  Wrench, MapPin, CheckCircle, AlertCircle
} from "lucide-react";
import confetti from "canvas-confetti";

// ---- Ad Slot ----
function AdSlot({
  width, height, label = "Advertisement", className = "", onView,
}: {
  width: number; height: number; label?: string; className?: string; onView?: () => void;
}) {
  const [floatAnim, setFloatAnim] = useState(false);

  function handleClick() {
    if (onView) {
      onView();
      setFloatAnim(true);
      setTimeout(() => setFloatAnim(false), 1000);
    }
  }

  return (
    <div
      className={`relative flex flex-col items-center justify-center border border-white/10 bg-zinc-900/50 rounded overflow-hidden cursor-pointer hover:border-emerald-500/30 transition-colors ${className}`}
      style={{ width: "100%", minHeight: `${Math.min(height, 200)}px` }}
      onClick={handleClick}
    >
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%", height: "100%" }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot="XXXXXXXXXX"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest mb-1">{label}</span>
        <span className="text-zinc-700 text-xs">{width}×{height}</span>
        <span className="text-zinc-600 text-[9px] mt-1">Tap to earn</span>
      </div>
      {floatAnim && (
        <div className="absolute top-2 right-2 text-emerald-400 text-xs font-bold animate-bounce pointer-events-none">
          +¢
        </div>
      )}
    </div>
  );
}

// ---- Video Theme Cards ----
const VIDEO_THEMES = [
  { id: "news", label: "News & Info", icon: Newspaper, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30", desc: "Local headlines, world events" },
  { id: "entertainment", label: "Entertainment", icon: Clapperboard, color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/30", desc: "Trailers, clips, viral content" },
  { id: "howto", label: "How-To & Skills", icon: Wrench, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30", desc: "Tutorials, DIY, life hacks" },
  { id: "local", label: "Local Interest", icon: MapPin, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30", desc: "Community, events, local biz" },
];

// ---- Journey Overlay ----
type JourneyStep =
  | { type: "ad" }
  | { type: "video_pick"; chosen?: string }
  | { type: "video_watch"; theme: string; countdown: number }
  | { type: "complete"; totalCents: number };

const JOURNEY_STEPS: JourneyStep[] = [
  { type: "ad" },
  { type: "ad" },
  { type: "video_pick" },
  { type: "ad" },
  { type: "ad" },
  { type: "video_pick" },
  { type: "ad" },
  { type: "complete", totalCents: 0 },
];

function JourneyOverlay({
  onClose, onComplete,
}: {
  onClose: () => void;
  onComplete: (earned: number) => void;
}) {
  const [stepIdx, setStepIdx] = useState(0);
  const [earnedCents, setEarnedCents] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [adCountdown, setAdCountdown] = useState(3);
  const [videoTheme, setVideoTheme] = useState<string | null>(null);
  const [videoCountdown, setVideoCountdown] = useState(10);
  const [isWatchingVideo, setIsWatchingVideo] = useState(false);
  const queryClient = useQueryClient();

  const startMutation = useMutation<Awaited<ReturnType<typeof rpc.startJourney>>, Error, void>({
    mutationFn: () => rpc.startJourney(),
    onSuccess: (data) => setSessionId(data.sessionId),
  });

  const stepMutation = useMutation<Awaited<ReturnType<typeof rpc.recordJourneyStep>>, Error, "ad" | "video">({
    mutationFn: (type) => rpc.recordJourneyStep(sessionId!, type),
    onSuccess: (data) => {
      setEarnedCents((p) => p + data.earned);
      queryClient.invalidateQueries({ queryKey: ["myEarnings"] });
    },
  });

  const completeMutation = useMutation<Awaited<ReturnType<typeof rpc.completeJourney>>, Error, void>({
    mutationFn: () => rpc.completeJourney(sessionId!),
    onSuccess: (data) => {
      setEarnedCents(data.totalEarned);
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      queryClient.invalidateQueries({ queryKey: ["myEarnings"] });
    },
  });

  useEffect(() => {
    startMutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ad countdown
  useEffect(() => {
    const step = JOURNEY_STEPS[stepIdx];
    if (!step || step.type !== "ad") return;
    setAdCountdown(3);
    const interval = setInterval(() => {
      setAdCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          if (sessionId) stepMutation.mutate("ad");
          setTimeout(() => {
            const next = stepIdx + 1;
            if (next >= JOURNEY_STEPS.length - 1) {
              if (sessionId) completeMutation.mutate();
            }
            setStepIdx(next);
          }, 400);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIdx, sessionId]);

  // Video countdown
  useEffect(() => {
    if (!isWatchingVideo) return;
    setVideoCountdown(10);
    const interval = setInterval(() => {
      setVideoCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          if (sessionId) stepMutation.mutate("video");
          setIsWatchingVideo(false);
          setVideoTheme(null);
          setTimeout(() => {
            const next = stepIdx + 1;
            if (next >= JOURNEY_STEPS.length - 1) {
              if (sessionId) completeMutation.mutate();
            }
            setStepIdx(next);
          }, 400);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWatchingVideo]);

  const step = JOURNEY_STEPS[stepIdx];
  const totalSteps = JOURNEY_STEPS.length;
  const isLast = stepIdx === totalSteps - 1;

  function skipVideo() {
    setIsWatchingVideo(false);
    setVideoTheme(null);
    const next = stepIdx + 1;
    if (next >= JOURNEY_STEPS.length - 1) {
      if (sessionId) completeMutation.mutate();
    }
    setStepIdx(next);
  }

  function handleClose() {
    onClose();
  }

  function handleClaim() {
    onComplete(earnedCents);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/95 backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Rocket size={20} className="text-emerald-400" />
          <span className="font-bold text-white">The Journey</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-emerald-400 font-mono font-bold text-lg">
            ${(earnedCents / 100).toFixed(4)}
          </span>
          <button onClick={handleClose} className="text-zinc-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-6 py-3">
        <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
          <span>Step {Math.min(stepIdx + 1, totalSteps)} of {totalSteps}</span>
          <span className="text-emerald-400">Earned this journey: ${(earnedCents / 100).toFixed(4)}</span>
        </div>
        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${((stepIdx) / (totalSteps - 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {step?.type === "ad" && (
          <div className="w-full max-w-md text-center">
            <div className="border border-white/10 bg-zinc-900 rounded-xl p-8 mb-6 min-h-48 flex flex-col items-center justify-center">
              <span className="text-[10px] text-zinc-600 uppercase tracking-widest mb-4">Advertisement</span>
              <div className="w-full h-32 bg-zinc-800 rounded-lg flex items-center justify-center">
                <span className="text-zinc-600 text-sm">Ad Placeholder</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-8 h-8 rounded-full border-2 border-emerald-500 flex items-center justify-center text-emerald-400 font-bold text-sm animate-pulse">
                {adCountdown}
              </div>
              <span className="text-zinc-400 text-sm">Viewing ad...</span>
            </div>
          </div>
        )}

        {step?.type === "video_pick" && !isWatchingVideo && (
          <div className="w-full max-w-lg text-center">
            <h2 className="text-white font-bold text-xl mb-2">Pick a Video to Watch</h2>
            <p className="text-zinc-400 text-sm mb-6">Watch any video below to earn +$0.02. Choose what interests you.</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {VIDEO_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => {
                    setVideoTheme(theme.id);
                    setIsWatchingVideo(true);
                  }}
                  className={`border rounded-xl p-4 text-left hover:scale-[1.02] transition-all ${theme.bg}`}
                >
                  <theme.icon size={24} className={`${theme.color} mb-2`} />
                  <div className="font-bold text-white text-sm">{theme.label}</div>
                  <div className="text-zinc-400 text-xs mt-0.5">{theme.desc}</div>
                  <div className="text-emerald-400 text-xs font-bold mt-2">+$0.02</div>
                </button>
              ))}
            </div>
            <button onClick={skipVideo} className="text-zinc-500 text-sm hover:text-zinc-300 transition-colors">
              Skip this video (earn $0.00 for this step)
            </button>
          </div>
        )}

        {step?.type === "video_pick" && isWatchingVideo && (
          <div className="w-full max-w-md text-center">
            <div className="border border-white/10 bg-zinc-900 rounded-xl p-8 mb-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                {VIDEO_THEMES.find((t) => t.id === videoTheme) && (() => {
                  const t = VIDEO_THEMES.find((t) => t.id === videoTheme)!;
                  return <t.icon size={20} className={t.color} />;
                })()}
                <span className="text-white font-bold">
                  {VIDEO_THEMES.find((t) => t.id === videoTheme)?.label}
                </span>
              </div>
              <div className="w-full h-36 bg-zinc-800 rounded-lg flex items-center justify-center relative mb-4">
                <Play size={32} className="text-emerald-400" />
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded font-mono">
                  0:{videoCountdown < 10 ? `0${videoCountdown}` : videoCountdown}
                </div>
              </div>
              <div className="w-full h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${((10 - videoCountdown) / 10) * 100}%` }}
                />
              </div>
            </div>
            <div className="flex items-center justify-center gap-3">
              <span className="text-zinc-400 text-sm">Watching video — earning +$0.02</span>
              <button onClick={skipVideo} className="text-zinc-600 text-xs hover:text-zinc-400 transition-colors">Skip</button>
            </div>
          </div>
        )}

        {isLast && (
          <div className="w-full max-w-md text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-black text-white mb-2">Journey Complete!</h2>
            <p className="text-zinc-400 mb-6">You crushed it. Here's what you earned:</p>
            <div className="bg-emerald-900/30 border border-emerald-500/30 rounded-xl p-6 mb-6">
              <div className="text-emerald-400 text-4xl font-black font-mono">
                ${(earnedCents / 100).toFixed(4)}
              </div>
              <div className="text-zinc-400 text-sm mt-1">added to your balance</div>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleClaim}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-xl transition-colors"
              >
                Claim Earnings
              </button>
              <button
                onClick={() => {
                  setStepIdx(0);
                  setEarnedCents(0);
                  setSessionId(null);
                  startMutation.mutate();
                }}
                className="w-full border border-emerald-500/30 text-emerald-400 font-bold py-3 rounded-xl hover:bg-emerald-500/10 transition-colors"
              >
                Start Another Journey
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer exit */}
      {!isLast && (
        <div className="px-6 py-4 border-t border-white/5 text-center">
          <button onClick={handleClose} className="text-zinc-600 text-sm hover:text-zinc-400 transition-colors">
            Exit — keep what you've earned (${(earnedCents / 100).toFixed(4)})
          </button>
        </div>
      )}
    </div>
  );
}

// ---- Privacy Toggle Card ----
function PrivacyTierCard({
  tier, title, desc, whatShared, bonus, multiplier, enabled, onToggle, disabled,
}: {
  tier: number; title: string; desc: string; whatShared: string; bonus: string;
  multiplier: string; enabled: boolean; onToggle: () => void; disabled?: boolean;
}) {
  return (
    <div className={`border rounded-xl p-4 transition-all ${enabled ? "border-emerald-500/40 bg-emerald-900/10" : "border-white/10 bg-zinc-900/50"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-zinc-500 uppercase">Tier {tier}</span>
            {enabled && <CheckCircle size={12} className="text-emerald-400" />}
          </div>
          <div className="font-bold text-white text-sm mb-1">{title}</div>
          <div className="text-zinc-400 text-xs mb-2">{desc}</div>
          <div className="text-zinc-500 text-xs mb-2">
            <span className="text-zinc-400">What's shared:</span> {whatShared}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-emerald-400 text-xs font-bold">{bonus} welcome bonus</span>
            <span className="text-zinc-500 text-xs">~{multiplier} more ad earnings</span>
          </div>
        </div>
        <button
          onClick={onToggle}
          disabled={disabled}
          className="flex-shrink-0 mt-1"
        >
          {enabled
            ? <ToggleRight size={28} className="text-emerald-400" />
            : <ToggleLeft size={28} className="text-zinc-600" />}
        </button>
      </div>
    </div>
  );
}

// ---- Recyclables data ----
const recyclables = [
  { icon: Battery, name: "Lithium-Ion Batteries", value: "$0.50–$2.00/lb", tip: "EV batteries can fetch $5–$20 each", color: "text-yellow-400", bg: "bg-yellow-500/10", links: [{ label: "Call2Recycle Locator", url: "https://www.call2recycle.org/locator/" }, { label: "Battery Solutions", url: "https://www.batteryrecyclers.com/" }] },
  { icon: Cpu, name: "Circuit Boards / CPUs", value: "$1.00–$8.00/lb", tip: "Gold-rich boards command higher prices", color: "text-emerald-400", bg: "bg-emerald-500/10", links: [{ label: "iScrap App", url: "https://www.iscrapapp.com/" }, { label: "Scrap Monster Prices", url: "https://www.scrapmonster.com/scrap-prices/electronics/" }] },
  { icon: Tv, name: "Flat Panel TVs / Monitors", value: "$5–$20/unit", tip: "Some recyclers pay; others charge a small fee", color: "text-blue-400", bg: "bg-blue-500/10", links: [{ label: "Earth911 Locator", url: "https://earth911.com/" }, { label: "Best Buy Trade-In", url: "https://www.bestbuy.com/site/recycling" }] },
  { icon: Smartphone, name: "Old Phones / Tablets", value: "$5–$50+/unit", tip: "Working phones pay dramatically more", color: "text-pink-400", bg: "bg-pink-500/10", links: [{ label: "Decluttr", url: "https://www.decluttr.com/" }, { label: "SellCell", url: "https://www.sellcell.com/" }] },
  { icon: Zap, name: "Solar Panels", value: "$10–$50+/panel", tip: "Functional panels sell for much more on marketplaces", color: "text-orange-400", bg: "bg-orange-500/10", links: [{ label: "Solar Recycling Info", url: "https://www.seia.org/initiatives/recycling" }, { label: "eBay Used Solar", url: "https://www.ebay.com/b/Solar-Panels/41979/bn_1836875" }] },
];

const adSlots = [
  { id: 1, width: 728, height: 90, label: "Leaderboard Ad" },
  { id: 2, width: 728, height: 90, label: "Leaderboard Ad" },
  { id: 3, width: 300, height: 250, label: "Ad" }, { id: 4, width: 300, height: 250, label: "Ad" },
  { id: 5, width: 300, height: 250, label: "Ad" }, { id: 6, width: 300, height: 250, label: "Ad" },
  { id: 7, width: 320, height: 50, label: "Mobile Banner" }, { id: 8, width: 320, height: 50, label: "Mobile Banner" },
  { id: 9, width: 320, height: 50, label: "Mobile Banner" },
  { id: 10, width: 300, height: 250, label: "Ad" }, { id: 11, width: 300, height: 250, label: "Ad" },
  { id: 12, width: 300, height: 250, label: "Ad" }, { id: 13, width: 300, height: 250, label: "Ad" },
  { id: 14, width: 728, height: 90, label: "Leaderboard Ad" },
  { id: 15, width: 160, height: 600, label: "Skyscraper Ad" }, { id: 16, width: 300, height: 250, label: "Ad" },
  { id: 17, width: 300, height: 250, label: "Ad" }, { id: 18, width: 160, height: 600, label: "Skyscraper Ad" },
  { id: 19, width: 320, height: 50, label: "Mobile Banner" }, { id: 20, width: 320, height: 50, label: "Mobile Banner" },
  { id: 21, width: 320, height: 50, label: "Mobile Banner" }, { id: 22, width: 320, height: 50, label: "Mobile Banner" },
  { id: 23, width: 300, height: 250, label: "Ad" }, { id: 24, width: 300, height: 250, label: "Ad" },
  { id: 25, width: 300, height: 250, label: "Ad" }, { id: 26, width: 300, height: 250, label: "Ad" },
  { id: 27, width: 728, height: 90, label: "Leaderboard Ad" }, { id: 28, width: 728, height: 90, label: "Leaderboard Ad" },
];

// ---- Payout Modal ----
function PayoutModal({ account, onClose }: { account: { balanceCents: number; payoutMethod: string; cashAppHandle: string } | null; onClose: () => void }) {
  const [method, setMethod] = useState<"cashapp" | "direct_deposit">("cashapp");
  const [cashHandle, setCashHandle] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankRouting, setBankRouting] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const queryClient = useQueryClient();

  const payoutMutation = useMutation({
    mutationFn: () => rpc.requestPayout(method, {
      cashAppHandle: cashHandle,
      bankAccountName: bankName,
      bankRouting,
      bankAccount,
    }),
    onSuccess: () => {
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ["myEarnings"] });
    },
  });

  if (!account) return null;
  const dollars = (account.balanceCents / 100).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-lg">Cash Out</h2>
          <button onClick={onClose}><X size={20} className="text-zinc-500" /></button>
        </div>

        {submitted ? (
          <div className="text-center py-6">
            <CheckCircle size={40} className="text-emerald-400 mx-auto mb-3" />
            <h3 className="text-white font-bold text-lg mb-2">Payout Requested!</h3>
            <p className="text-zinc-400 text-sm">We'll send ${dollars} to your account within 24–48 hours.</p>
            <button onClick={onClose} className="mt-4 text-emerald-400 text-sm">Close</button>
          </div>
        ) : account.balanceCents < 100 ? (
          <div className="text-center py-6">
            <AlertCircle size={40} className="text-zinc-500 mx-auto mb-3" />
            <h3 className="text-white font-bold mb-2">Almost there!</h3>
            <p className="text-zinc-400 text-sm">Minimum payout is $1.00. You have ${dollars}. Keep earning!</p>
            <button onClick={onClose} className="mt-4 text-emerald-400 text-sm">Keep Earning</button>
          </div>
        ) : (
          <div>
            <div className="bg-emerald-900/30 border border-emerald-500/30 rounded-xl p-4 mb-4 text-center">
              <div className="text-emerald-400 text-2xl font-black">${dollars}</div>
              <div className="text-zinc-400 text-xs">available to withdraw</div>
            </div>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setMethod("cashapp")}
                className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-colors ${method === "cashapp" ? "border-emerald-500 text-emerald-400 bg-emerald-500/10" : "border-white/10 text-zinc-400"}`}
              >
                Cash App
              </button>
              <button
                onClick={() => setMethod("direct_deposit")}
                className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-colors ${method === "direct_deposit" ? "border-emerald-500 text-emerald-400 bg-emerald-500/10" : "border-white/10 text-zinc-400"}`}
              >
                Direct Deposit
              </button>
            </div>
            {method === "cashapp" ? (
              <input
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm mb-4 focus:outline-none focus:border-emerald-500"
                placeholder="$yourcashtag"
                value={cashHandle}
                onChange={(e) => setCashHandle(e.target.value)}
              />
            ) : (
              <div className="flex flex-col gap-2 mb-4">
                <input className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500" placeholder="Account holder name" value={bankName} onChange={(e) => setBankName(e.target.value)} />
                <input className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500" placeholder="Routing number" value={bankRouting} onChange={(e) => setBankRouting(e.target.value)} />
                <input className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500" placeholder="Account number" value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} />
              </div>
            )}
            <button
              onClick={() => payoutMutation.mutate()}
              disabled={payoutMutation.isPending}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-bold py-3 rounded-xl transition-colors"
            >
              {payoutMutation.isPending ? "Requesting..." : `Send $${dollars}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Main Earn Page ----
export function EarnPage() {
  const [showJourney, setShowJourney] = useState(false);
  const [showPayout, setShowPayout] = useState(false);
  const [privacyDismissed, setPrivacyDismissed] = useState(false);
  const [todayEarned, setTodayEarned] = useState(0);
  const queryClient = useQueryClient();

  const earningsQuery = useQuery({
    queryKey: ["myEarnings"],
    queryFn: () => rpc.getMyEarnings(),
    refetchInterval: 30000,
  });

  const privacyQuery = useQuery({
    queryKey: ["privacySettings"],
    queryFn: () => rpc.getMyPrivacySettings(),
  });

  const leaderboardQuery = useQuery({
    queryKey: ["earningsLeaderboard"],
    queryFn: () => rpc.getEarningsLeaderboard(),
  });

  const adViewMutation = useMutation<Awaited<ReturnType<typeof rpc.recordAdView>>, Error, void>({
    mutationFn: () => rpc.recordAdView("banner"),
    onSuccess: (data) => {
      setTodayEarned((p) => p + data.earned);
      queryClient.invalidateQueries({ queryKey: ["myEarnings"] });
    },
  });

  const privacyMutation = useMutation({
    mutationFn: (settings: { shareUsageData?: boolean; shareInterests?: boolean; personalizedAds?: boolean }) =>
      rpc.updatePrivacySettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["privacySettings"] });
      queryClient.invalidateQueries({ queryKey: ["myEarnings"] });
    },
  });

  const balance = earningsQuery.data?.account?.balanceCents ?? 0;
  const privacy = privacyQuery.data;

  return (
    <div className="min-h-screen bg-zinc-950">
      {showJourney && (
        <JourneyOverlay
          onClose={() => setShowJourney(false)}
          onComplete={(earned) => {
            setTodayEarned((p) => p + earned);
            setShowJourney(false);
          }}
        />
      )}
      {showPayout && (
        <PayoutModal
          account={earningsQuery.data?.account ?? null}
          onClose={() => setShowPayout(false)}
        />
      )}

      {/* Hero */}
      <div className="bg-gradient-to-b from-emerald-950/40 to-transparent border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-xs font-bold tracking-widest uppercase">Live Ad Revenue</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white mb-2">Earn Real Money Right Now</h1>
              <p className="text-zinc-400 text-sm max-w-xl">
                Watch ads, complete journeys, earn cash. <span className="text-emerald-400 font-bold">75% of all ad revenue goes directly to you.</span>
              </p>
            </div>
            <div className="flex flex-col items-start md:items-end gap-2">
              <div className="text-emerald-400 font-black text-4xl font-mono">
                ${(balance / 100).toFixed(4)}
              </div>
              <div className="text-zinc-500 text-xs">your balance</div>
              <button
                onClick={() => setShowPayout(true)}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
              >
                <DollarSign size={14} />
                Cash Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">

        {/* Privacy Opt-In Banner */}
        {!privacyDismissed && (
          <div className="border border-white/10 bg-zinc-900/60 rounded-2xl p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-emerald-400" />
                <span className="text-white font-bold text-sm">Your privacy is guaranteed by default</span>
              </div>
              <button onClick={() => setPrivacyDismissed(true)} className="text-zinc-600 hover:text-zinc-400">
                <X size={16} />
              </button>
            </div>
            <p className="text-zinc-400 text-xs mb-4">
              Want to earn more? You can optionally share data — you control exactly what, and you can change it anytime. We never sell your data without your explicit consent.
            </p>
            <div className="grid md:grid-cols-3 gap-3">
              <PrivacyTierCard
                tier={1} title="Anonymous Usage" desc="Share how you browse LACK"
                whatShared="Page views, session duration (no personal info)"
                bonus="+$0.10" multiplier="15%"
                enabled={privacy?.shareUsageData ?? false}
                onToggle={() => privacyMutation.mutate({ shareUsageData: !privacy?.shareUsageData })}
                disabled={privacyMutation.isPending}
              />
              <PrivacyTierCard
                tier={2} title="Interests & Demographics" desc="Share general interest categories"
                whatShared="Age range, general interests, location (city level)"
                bonus="+$0.25" multiplier="35%"
                enabled={privacy?.shareInterests ?? false}
                onToggle={() => privacyMutation.mutate({ shareInterests: !privacy?.shareInterests })}
                disabled={privacyMutation.isPending}
              />
              <PrivacyTierCard
                tier={3} title="Personalized Ads" desc="Enable ads tailored to you"
                whatShared="Browsing patterns for ad targeting"
                bonus="+$0.50" multiplier="60%"
                enabled={privacy?.personalizedAds ?? false}
                onToggle={() => privacyMutation.mutate({ personalizedAds: !privacy?.personalizedAds })}
                disabled={privacyMutation.isPending}
              />
            </div>
          </div>
        )}

        {/* Journey Button + Leaderboard */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <button
              onClick={() => setShowJourney(true)}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black text-lg py-5 rounded-2xl transition-all animate-pulse hover:animate-none flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20"
            >
              <Rocket size={24} />
              START THE JOURNEY — Earn up to $0.50 in 5 minutes
              <ChevronRight size={20} />
            </button>
            <div className="mt-2 text-center text-zinc-500 text-xs">
              8 steps: ads + elective videos (choose your theme) + bonus
            </div>
          </div>
          <div className="border border-white/10 bg-zinc-900/60 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Trophy size={14} className="text-yellow-400" />
              <span className="text-white font-bold text-sm">Top Earners This Week</span>
            </div>
            {leaderboardQuery.data?.slice(0, 5).map((entry: { displayName: string; balanceCents: number }, i: number) => (
              <div key={i} className="flex items-center justify-between py-1">
                <span className="text-zinc-400 text-xs">{i + 1}. {entry.displayName}</span>
                <span className="text-emerald-400 text-xs font-mono">${((entry.balanceCents) / 100).toFixed(2)}</span>
              </div>
            ))}
            {!leaderboardQuery.data?.length && (
              <div className="text-zinc-600 text-xs">Be the first to earn!</div>
            )}
          </div>
        </div>

        {/* Ad Grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Sponsored Content — Tap Ads to Earn</h2>
            {todayEarned > 0 && (
              <span className="text-emerald-400 text-xs font-mono">You've earned ${(todayEarned / 100).toFixed(4)} from ads today</span>
            )}
          </div>

          <div className="flex flex-col gap-2 mb-4">
            {adSlots.slice(0, 2).map((slot) => (
              <AdSlot key={slot.id} {...slot} className="h-16 md:h-20" onView={() => adViewMutation.mutate()} />
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            {adSlots.slice(2, 6).map((slot) => (
              <AdSlot key={slot.id} {...slot} className="h-40 md:h-48" onView={() => adViewMutation.mutate()} />
            ))}
          </div>
          <div className="flex flex-col gap-1 mb-4">
            {adSlots.slice(6, 9).map((slot) => (
              <AdSlot key={slot.id} {...slot} className="h-10" onView={() => adViewMutation.mutate()} />
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            {adSlots.slice(9, 13).map((slot) => (
              <AdSlot key={slot.id} {...slot} className="h-40 md:h-48" onView={() => adViewMutation.mutate()} />
            ))}
          </div>
          <div className="mb-4">
            <AdSlot {...adSlots[13]} className="h-16 md:h-20" onView={() => adViewMutation.mutate()} />
          </div>
          <div className="grid grid-cols-4 gap-2 mb-4">
            <AdSlot {...adSlots[14]} className="h-48 col-span-1" onView={() => adViewMutation.mutate()} />
            <div className="col-span-2 grid grid-rows-2 gap-2">
              <AdSlot {...adSlots[15]} className="h-24" onView={() => adViewMutation.mutate()} />
              <AdSlot {...adSlots[16]} className="h-24" onView={() => adViewMutation.mutate()} />
            </div>
            <AdSlot {...adSlots[17]} className="h-48 col-span-1" onView={() => adViewMutation.mutate()} />
          </div>
          <div className="grid grid-cols-2 gap-1 mb-4">
            {adSlots.slice(18, 22).map((slot) => (
              <AdSlot key={slot.id} {...slot} className="h-10" onView={() => adViewMutation.mutate()} />
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            {adSlots.slice(22, 26).map((slot) => (
              <AdSlot key={slot.id} {...slot} className="h-40 md:h-48" onView={() => adViewMutation.mutate()} />
            ))}
          </div>
          <div className="flex flex-col gap-2 mb-4">
            {adSlots.slice(26).map((slot) => (
              <AdSlot key={slot.id} {...slot} className="h-16 md:h-20" onView={() => adViewMutation.mutate()} />
            ))}
          </div>
        </div>

        {/* Recycling Section */}
        <div className="border-t border-white/10 pt-8">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-white mb-1">Turn Trash Into Cash</h2>
            <p className="text-zinc-400 text-sm">Recyclable materials that pay real money. Find a local recycler near you.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recyclables.map(({ icon: Icon, name, value, tip, color, bg, links }) => (
              <div key={name} className="bg-zinc-900/60 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={18} className={color} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{name}</h3>
                    <span className={`text-sm font-mono font-bold ${color}`}>{value}</span>
                  </div>
                </div>
                <p className="text-zinc-500 text-xs mb-3">{tip}</p>
                <div className="flex flex-col gap-1">
                  {links.map(({ label, url }) => (
                    <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors">
                      <ExternalLink size={11} />{label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/5 mt-12 py-4 text-center">
        <a href="/privacy" className="text-zinc-600 text-xs hover:text-zinc-400 transition-colors">Privacy Policy</a>
      </div>
    </div>
  );
}
