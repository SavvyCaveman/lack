import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client as rpc } from "@/lib/client";
import {
  Battery, Cpu, Tv, Smartphone, Zap, ExternalLink,
  DollarSign, Play, ChevronRight, X, Shield,
  ToggleLeft, ToggleRight, Trophy, Newspaper, Clapperboard,
  Wrench, MapPin, CheckCircle, AlertCircle, Star, Gift,
  ChevronDown, ChevronUp, Wifi, BarChart2, SlidersHorizontal
} from "lucide-react";
const Calculator = SlidersHorizontal;
import confetti from "canvas-confetti";

// ---- Profile Onboarding Modal (+20¢ welcome bonus) ----
const AGE_RANGES = ["Under 18", "18–24", "25–34", "35–44", "45–54", "55–64", "65+"];
const EMPLOYMENT_STATUSES = ["Currently unemployed", "Part-time work", "Full-time employed", "Self-employed / gig worker", "Student", "Retired", "Disabled / unable to work"];
const INTEREST_OPTIONS = ["Food & cooking", "Sports", "Gaming", "Music", "Health & fitness", "News & politics", "Technology", "Fashion", "Parenting", "Finance", "Arts & crafts", "Outdoors"];
const INCOME_RANGES = ["Under $15k/yr", "$15k–$30k/yr", "$30k–$50k/yr", "$50k–$75k/yr", "$75k+/yr", "Prefer not to say"];
const LOOKING_FOR = ["Gig work", "Full-time job", "Housing", "Community support", "Just earning ad money", "Business opportunities"];

function ProfileOnboardingModal({ onComplete, onSkip }: { onComplete: () => void; onSkip: () => void }) {
  const [step, setStep] = useState(0);
  const [ageRange, setAgeRange] = useState("");
  const [employmentStatus, setEmploymentStatus] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [incomeRange, setIncomeRange] = useState("");
  const [lookingFor, setLookingFor] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const onboardMutation = useMutation({
    mutationFn: () => rpc.completeProfileOnboarding({ ageRange, employmentStatus, interests, incomeRange, lookingFor }),
    onSuccess: () => {
      setDone(true);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.5 }, colors: ["#10b981", "#34d399", "#fff"] });
      setTimeout(() => onComplete(), 2200);
    },
  });

  const steps = [
    {
      title: "What's your age range?",
      subtitle: "Helps us match you with better-paying ads",
      content: (
        <div className="grid grid-cols-2 gap-2">
          {AGE_RANGES.map((r) => (
            <button key={r} onClick={() => setAgeRange(r)}
              className={`py-2.5 px-3 rounded-xl text-sm font-bold border transition-all ${ageRange === r ? "border-emerald-500 bg-emerald-500/20 text-emerald-300" : "border-white/10 text-zinc-400 hover:border-white/30"}`}>
              {r}
            </button>
          ))}
        </div>
      ),
      canNext: !!ageRange,
    },
    {
      title: "What's your employment situation?",
      subtitle: "No judgment — this helps us find the right opportunities for you",
      content: (
        <div className="flex flex-col gap-2">
          {EMPLOYMENT_STATUSES.map((s) => (
            <button key={s} onClick={() => setEmploymentStatus(s)}
              className={`py-2.5 px-4 rounded-xl text-sm font-bold border text-left transition-all ${employmentStatus === s ? "border-emerald-500 bg-emerald-500/20 text-emerald-300" : "border-white/10 text-zinc-400 hover:border-white/30"}`}>
              {s}
            </button>
          ))}
        </div>
      ),
      canNext: !!employmentStatus,
    },
    {
      title: "Pick your interests",
      subtitle: "Choose up to 5 — advertisers pay more when they reach people who care",
      content: (
        <div className="grid grid-cols-2 gap-2">
          {INTEREST_OPTIONS.map((i) => {
            const selected = interests.includes(i);
            return (
              <button key={i} onClick={() => {
                if (selected) setInterests(interests.filter((x) => x !== i));
                else if (interests.length < 5) setInterests([...interests, i]);
              }}
                className={`py-2.5 px-3 rounded-xl text-sm font-bold border transition-all ${selected ? "border-emerald-500 bg-emerald-500/20 text-emerald-300" : "border-white/10 text-zinc-400 hover:border-white/30"}`}>
                {i}
              </button>
            );
          })}
        </div>
      ),
      canNext: interests.length > 0,
    },
    {
      title: "Household income range?",
      subtitle: "Optional — helps unlock higher-value ads",
      content: (
        <div className="flex flex-col gap-2">
          {INCOME_RANGES.map((r) => (
            <button key={r} onClick={() => setIncomeRange(r)}
              className={`py-2.5 px-4 rounded-xl text-sm font-bold border text-left transition-all ${incomeRange === r ? "border-emerald-500 bg-emerald-500/20 text-emerald-300" : "border-white/10 text-zinc-400 hover:border-white/30"}`}>
              {r}
            </button>
          ))}
        </div>
      ),
      canNext: true, // optional step
    },
    {
      title: "What are you looking for on LACK?",
      subtitle: "Pick all that apply",
      content: (
        <div className="flex flex-col gap-2">
          {LOOKING_FOR.map((l) => {
            const selected = lookingFor.includes(l);
            return (
              <button key={l} onClick={() => {
                if (selected) setLookingFor(lookingFor.filter((x) => x !== l));
                else setLookingFor([...lookingFor, l]);
              }}
                className={`py-2.5 px-4 rounded-xl text-sm font-bold border text-left transition-all ${selected ? "border-emerald-500 bg-emerald-500/20 text-emerald-300" : "border-white/10 text-zinc-400 hover:border-white/30"}`}>
                {l}
              </button>
            );
          })}
        </div>
      ),
      canNext: lookingFor.length > 0,
    },
  ];

  const current = steps[step];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {done ? (
          <div className="flex flex-col items-center justify-center py-14 px-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mb-4">
              <Gift size={28} className="text-emerald-400" />
            </div>
            <h2 className="text-white font-black text-2xl mb-2">+$0.20 added!</h2>
            <p className="text-zinc-400 text-sm">Thanks for helping us serve you better. Your profile bonus has been added to your balance.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Gift size={16} className="text-emerald-400" />
                <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">+$0.20 Welcome Bonus</span>
              </div>
              <button onClick={onSkip} className="text-zinc-600 hover:text-zinc-400 transition-colors"><X size={18} /></button>
            </div>

            {/* Progress dots */}
            <div className="flex items-center gap-1.5 px-5 pt-4">
              {steps.map((_, i) => (
                <div key={i} className={`h-1 rounded-full flex-1 transition-all ${i <= step ? "bg-emerald-500" : "bg-zinc-700"}`} />
              ))}
            </div>

            {/* Content */}
            <div className="px-5 py-5">
              <h2 className="text-white font-black text-xl mb-1">{current.title}</h2>
              <p className="text-zinc-500 text-xs mb-5">{current.subtitle}</p>
              <div className="max-h-72 overflow-y-auto pr-1">{current.content}</div>
            </div>

            {/* Footer */}
            <div className="px-5 pb-5 flex gap-3">
              {step > 0 && (
                <button onClick={() => setStep((s) => s - 1)} className="flex-1 py-3 rounded-xl border border-white/10 text-zinc-400 font-bold text-sm hover:border-white/20 transition-colors">
                  Back
                </button>
              )}
              {step < steps.length - 1 ? (
                <button onClick={() => setStep((s) => s + 1)} disabled={!current.canNext}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black font-black py-3 rounded-xl text-sm transition-colors">
                  Next →
                </button>
              ) : (
                <button onClick={() => onboardMutation.mutate()} disabled={!current.canNext || onboardMutation.isPending}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black font-black py-3 rounded-xl text-sm transition-colors">
                  {onboardMutation.isPending ? "Saving..." : "Claim My $0.20 →"}
                </button>
              )}
            </div>

            <p className="text-center text-zinc-700 text-[10px] pb-4 px-5">
              Your answers are private by default and never shared without your consent. <a href="/privacy" className="underline hover:text-zinc-500">Privacy Policy</a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// ---- Star Rating component ----
function StarRating({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} onClick={() => onChange(n)} className="focus:outline-none">
          <Star size={16} className={n <= (value ?? 0) ? "text-yellow-400 fill-yellow-400" : "text-zinc-600"} />
        </button>
      ))}
    </div>
  );
}

const BRAND_NAMES_POOL = [
  "A local business", "A national retailer", "A food delivery service",
  "A streaming service", "A financial app", "A home services company",
  "An auto brand", "A health & wellness brand",
];

// ---- Ad Slot ----
function AdSlot({
  width, height, label = "Advertisement", className = "", onView,
}: {
  width: number; height: number; label?: string; className?: string; onView?: () => void;
}) {
  const [floatAnim, setFloatAnim] = useState(false);
  function handleClick() {
    if (onView) { onView(); setFloatAnim(true); setTimeout(() => setFloatAnim(false), 1000); }
  }
  return (
    <div
      className={`relative flex flex-col items-center justify-center border border-white/10 bg-zinc-900/50 rounded overflow-hidden cursor-pointer hover:border-emerald-500/30 transition-colors ${className}`}
      style={{ width: "100%", minHeight: `${Math.min(height, 200)}px` }}
      onClick={handleClick}
    >
      <ins className="adsbygoogle" style={{ display: "block", width: "100%", height: "100%" }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" data-ad-slot="XXXXXXXXXX"
        data-ad-format="auto" data-full-width-responsive="true" />
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest mb-1">{label}</span>
        <span className="text-zinc-700 text-xs">{width}×{height}</span>
        <span className="text-zinc-600 text-[9px] mt-1">Tap to earn</span>
      </div>
      {floatAnim && (
        <div className="absolute top-2 right-2 text-emerald-400 text-xs font-bold animate-bounce pointer-events-none">+¢</div>
      )}
    </div>
  );
}

// ---- Video Theme Cards ----
const VIDEO_THEMES = [
  { id: "music", label: "Music & Entertainment", icon: Clapperboard, color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/30", desc: "Music videos, clips, viral content" },
  { id: "news", label: "News & World", icon: Newspaper, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30", desc: "Catch up on a quick news story" },
  { id: "health", label: "Health & Wellness", icon: Wrench, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30", desc: "A quick fitness or wellness tip" },
  { id: "fun", label: "Comedy & Fun", icon: MapPin, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30", desc: "Something to make you smile" },
];

// ---- The Grind Overlay (infinite loop: ad -> 4-choice video+survey -> repeat) ----
type GrindPhase = "ad" | "video_pick" | "video_watch" | "survey";

function GrindOverlay({ onClose }: { onClose: (earned: number, loops: number) => void }) {
  const [phase, setPhase] = useState<GrindPhase>("ad");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [earnedCents, setEarnedCents] = useState(0);
  const [loopCount, setLoopCount] = useState(0);
  const [adCountdown, setAdCountdown] = useState(3);
  const [selectedTheme, setSelectedTheme] = useState<number | null>(null);
  const [videoCountdown, setVideoCountdown] = useState(10);
  const [milestone, setMilestone] = useState<string | null>(null);
  // Survey state
  const [surveyBrand] = useState(() => BRAND_NAMES_POOL[Math.floor(Math.random() * BRAND_NAMES_POOL.length)]);
  const [q1, setQ1] = useState<number | null>(null);
  const [q2, setQ2] = useState<number | null>(null);
  const [q3, setQ3] = useState<number | null>(null);
  const [q4, setQ4] = useState<boolean | null>(null);
  const [q5, setQ5] = useState("");
  const [surveyDone, setSurveyDone] = useState(false);
  const [surveyEarned, setSurveyEarned] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const adKeyRef = useRef(0);
  const videoKeyRef = useRef(0);
  const queryClient = useQueryClient();

  const startMutation = useMutation({
    mutationFn: () => rpc.startGrind(),
    onSuccess: (data) => setSessionId(data.sessionId),
  });

  const stepMutation = useMutation({
    mutationFn: (type: "ad" | "video") => rpc.recordGrindStep(sessionId!, type),
    onSuccess: (data) => {
      setEarnedCents((p) => p + data.earned);
      setLoopCount(data.loopCount);
      void queryClient.invalidateQueries({ queryKey: ["myEarnings"] });
      if (data.loopCount > 0 && data.loopCount % 4 === 0) {
        setMilestone(`🔥 ${data.loopCount} loops! Earned $${(data.totalEarned / 100).toFixed(3)} this session!`);
        setTimeout(() => setMilestone(null), 3500);
      }
    },
  });

  const surveyMutation = useMutation({
    mutationFn: (data: Parameters<typeof rpc.submitSurveyResponse>[0]) => rpc.submitSurveyResponse(data),
    onSuccess: (data) => {
      setSurveyEarned(data.earnedCents);
      setSurveyDone(true);
      setEarnedCents((p) => p + data.earnedCents);
      void queryClient.invalidateQueries({ queryKey: ["myEarnings"] });
    },
  });

  useEffect(() => { startMutation.mutate(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (phase !== "ad" || !sessionId) return;
    adKeyRef.current += 1;
    const key = adKeyRef.current;
    setAdCountdown(3);
    timerRef.current = setInterval(() => {
      if (adKeyRef.current !== key) return;
      setAdCountdown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current!);
          stepMutation.mutate("ad");
          setTimeout(() => { setPhase("video_pick"); setSelectedTheme(null); }, 500);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (phase !== "video_watch" || selectedTheme === null || !sessionId) return;
    videoKeyRef.current += 1;
    const key = videoKeyRef.current;
    setVideoCountdown(10);
    timerRef.current = setInterval(() => {
      if (videoKeyRef.current !== key) return;
      setVideoCountdown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current!);
          stepMutation.mutate("video");
          setTimeout(() => {
            setQ1(null); setQ2(null); setQ3(null); setQ4(null); setQ5(""); setSurveyDone(false); setSurveyEarned(0);
            setPhase("survey");
          }, 600);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, selectedTheme, sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleExit() {
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      const result = await rpc.exitGrind(sessionId!);
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 }, colors: ["#10b981", "#34d399", "#fff"] });
      onClose(result.totalEarned, result.loopCount);
    } catch {
      onClose(earnedCents, loopCount);
    }
  }

  function skipVideo() {
    if (timerRef.current) clearInterval(timerRef.current);
    // Skip directly to next loop
    setPhase("ad"); setSelectedTheme(null);
  }

  function advanceFromSurvey() {
    setPhase("ad"); setSelectedTheme(null);
  }

  function submitSurvey() {
    if (!selectedTheme && selectedTheme !== 0) return;
    const theme = VIDEO_THEMES[selectedTheme];
    surveyMutation.mutate({
      videoTheme: theme.id,
      q1_recall: q1 ?? undefined,
      q2_interest: q2 ?? undefined,
      q3_purchase: q3 ?? undefined,
      q4_remember: q4 ?? undefined,
      q5_freeform: q5,
    });
  }

  return (
    <div className="fixed inset-0 bg-zinc-950/98 flex flex-col" style={{ zIndex: 10000 }}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="text-white font-black text-xl">💰 The Grind</span>
          <span className="text-zinc-500 text-sm">Loop {loopCount + 1}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-emerald-400 font-black text-xl font-mono">${(earnedCents / 100).toFixed(3)}</div>
            <div className="text-zinc-600 text-xs">session earnings</div>
          </div>
          <button
            onClick={() => { void handleExit(); }}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-white border border-white/20 hover:border-white/40 rounded-lg px-3 py-1.5 text-sm transition-all"
          >
            <X size={14} />
            Exit & Keep ${(earnedCents / 100).toFixed(3)}
          </button>
        </div>
      </div>

      {milestone && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-emerald-900 border border-emerald-500 text-emerald-200 px-6 py-3 rounded-xl text-sm font-bold shadow-lg text-center max-w-xs" style={{ zIndex: 10001 }}>
          {milestone}
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {phase === "ad" && (
          <div className="w-full max-w-md text-center">
            <div className="text-zinc-500 text-[10px] uppercase tracking-widest mb-4">Advertisement</div>
            <div className="border border-white/10 bg-zinc-900 rounded-2xl min-h-52 flex flex-col items-center justify-center mb-6 p-8">
              <div className="text-zinc-600 text-sm mb-2">Ad Placeholder</div>
              <div className="text-zinc-700 text-xs">Real ads load after AdSense approval</div>
            </div>
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full border-2 border-emerald-400 flex items-center justify-center">
                <span className="text-emerald-400 font-black text-lg">{adCountdown}</span>
              </div>
              <span className="text-zinc-400 text-sm">Viewing ad...</span>
            </div>
            <div className="text-emerald-600 text-sm">+$0.005 incoming</div>
            <div className="text-zinc-700 text-xs mt-1">Each loop ~$0.025 · Stop whenever you want</div>
          </div>
        )}

        {phase === "video_pick" && (
          <div className="w-full max-w-2xl">
            <div className="text-center mb-6">
              <h2 className="text-white font-black text-2xl mb-1">Choose what you want to watch</h2>
              <p className="text-zinc-500 text-sm">Pick a theme — all earn the same $0.02</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {VIDEO_THEMES.map((theme, i) => (
                <button
                  key={theme.id}
                  onClick={() => { setSelectedTheme(i); setPhase("video_watch"); }}
                  className={`border rounded-2xl p-5 text-left hover:scale-[1.02] transition-all ${theme.bg}`}
                >
                  <theme.icon size={28} className={`${theme.color} mb-3`} />
                  <div className="font-bold text-white text-sm mb-1">{theme.label}</div>
                  <div className="text-zinc-400 text-xs mb-3">{theme.desc}</div>
                  <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                    <Play size={10} /> Watch & Earn $0.02
                  </div>
                </button>
              ))}
            </div>
            <div className="text-center">
              <button onClick={skipVideo} className="text-zinc-600 hover:text-zinc-400 text-sm transition-colors">
                Skip — no earnings for this step
              </button>
            </div>
          </div>
        )}

        {phase === "video_watch" && selectedTheme !== null && (
          <div className="w-full max-w-md text-center">
            <div className="mb-2">
              {(() => { const Icon = VIDEO_THEMES[selectedTheme].icon; return <Icon size={40} className={VIDEO_THEMES[selectedTheme].color} />; })()}
            </div>
            <h2 className="text-white font-black text-xl mb-4">Watching {VIDEO_THEMES[selectedTheme].label}...</h2>
            <div className="border border-white/10 bg-zinc-900 rounded-2xl flex items-center justify-center mb-5 relative" style={{ height: "180px" }}>
              <Play size={36} className="text-emerald-400" />
              <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-0.5 rounded font-mono">
                0:{videoCountdown < 10 ? `0${videoCountdown}` : videoCountdown}
              </div>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2 mb-3">
              <div className="bg-emerald-400 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${((10 - videoCountdown) / 10) * 100}%` }} />
            </div>
            <div className="text-emerald-400 text-sm font-bold mb-2">
              {videoCountdown > 0 ? `$0.02 incoming in ${videoCountdown}s...` : "✓ Earned $0.02!"}
            </div>
            <button onClick={skipVideo} className="text-zinc-600 hover:text-zinc-400 text-xs transition-colors">Skip video</button>
          </div>
        )}

        {phase === "survey" && (
          <div className="w-full max-w-md overflow-y-auto">
            {!surveyDone ? (
              <div className="border border-emerald-500/20 bg-zinc-900 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white font-bold text-sm">Quick Brand Survey</span>
                  <span className="text-emerald-400 text-xs font-bold">+up to $0.20 bonus</span>
                </div>
                <p className="text-zinc-500 text-xs mb-4">About: <span className="text-zinc-300">{surveyBrand}</span></p>
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="text-zinc-400 text-xs block mb-1">Did this make an impression?</label>
                    <StarRating value={q1} onChange={setQ1} />
                  </div>
                  <div>
                    <label className="text-zinc-400 text-xs block mb-1">Interested in this brand?</label>
                    <StarRating value={q2} onChange={setQ2} />
                  </div>
                  <div>
                    <label className="text-zinc-400 text-xs block mb-1">Likely to purchase?</label>
                    <StarRating value={q3} onChange={setQ3} />
                  </div>
                  <div>
                    <label className="text-zinc-400 text-xs block mb-1">Will you remember it?</label>
                    <div className="flex gap-2">
                      <button onClick={() => setQ4(true)} className={`px-3 py-1 rounded-lg text-xs border transition-colors ${q4 === true ? "border-emerald-500 text-emerald-400 bg-emerald-500/10" : "border-white/10 text-zinc-400"}`}>Yes</button>
                      <button onClick={() => setQ4(false)} className={`px-3 py-1 rounded-lg text-xs border transition-colors ${q4 === false ? "border-emerald-500 text-emerald-400 bg-emerald-500/10" : "border-white/10 text-zinc-400"}`}>No</button>
                    </div>
                  </div>
                  <div>
                    <label className="text-zinc-400 text-xs block mb-1">Thoughts? (optional — +$0.05 for 50+ chars)</label>
                    <textarea value={q5} onChange={(e) => setQ5(e.target.value)} className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500 resize-none h-14" placeholder="What did you think?" />
                    {q5.length > 0 && <span className="text-zinc-600 text-[10px]">{q5.length}/50</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={submitSurvey} disabled={surveyMutation.isPending || (!q1 && !q2)} className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black font-bold py-2 rounded-lg text-sm transition-colors">
                    {surveyMutation.isPending ? "Submitting..." : "Submit +Earn"}
                  </button>
                  <button onClick={advanceFromSurvey} className="px-4 py-2 border border-white/10 text-zinc-500 rounded-lg text-xs hover:text-zinc-300 transition-colors">Skip</button>
                </div>
              </div>
            ) : (
              <div className="border border-emerald-500/30 bg-emerald-900/20 rounded-2xl p-6 text-center">
                <CheckCircle size={32} className="text-emerald-400 mx-auto mb-3" />
                <div className="text-white font-bold text-lg mb-1">Survey complete!</div>
                <div className="text-emerald-400 font-mono text-sm mb-1">Video: +$0.02 · Survey: +${(surveyEarned / 100).toFixed(2)}</div>
                <div className="text-zinc-400 text-xs mb-4">= +${((2 + surveyEarned) / 100).toFixed(2)} this step</div>
                <button onClick={advanceFromSurvey} className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-xl text-sm transition-colors">
                  Next Loop →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
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
          <div className="text-zinc-500 text-xs mb-2"><span className="text-zinc-400">What's shared:</span> {whatShared}</div>
          <div className="flex items-center gap-3">
            <span className="text-emerald-400 text-xs font-bold">{bonus} welcome bonus</span>
            <span className="text-zinc-500 text-xs">~{multiplier} more ad earnings</span>
          </div>
        </div>
        <button onClick={onToggle} disabled={disabled} className="flex-shrink-0 mt-1">
          {enabled ? <ToggleRight size={28} className="text-emerald-400" /> : <ToggleLeft size={28} className="text-zinc-600" />}
        </button>
      </div>
    </div>
  );
}

const recyclables = [
  { icon: Battery, name: "Lithium-Ion Batteries", value: "$0.50–$2.00/lb", tip: "EV batteries can fetch $5–$20 each", color: "text-yellow-400", bg: "bg-yellow-500/10", links: [{ label: "Call2Recycle Locator", url: "https://www.call2recycle.org/locator/" }, { label: "Battery Solutions", url: "https://www.batteryrecyclers.com/" }] },
  { icon: Cpu, name: "Circuit Boards / CPUs", value: "$1.00–$8.00/lb", tip: "Gold-rich boards command higher prices", color: "text-emerald-400", bg: "bg-emerald-500/10", links: [{ label: "iScrap App", url: "https://www.iscrapapp.com/" }, { label: "Scrap Monster Prices", url: "https://www.scrapmonster.com/scrap-prices/electronics/" }] },
  { icon: Tv, name: "Flat Panel TVs / Monitors", value: "$5–$20/unit", tip: "Some recyclers pay; others charge a small fee", color: "text-blue-400", bg: "bg-blue-500/10", links: [{ label: "Earth911 Locator", url: "https://earth911.com/" }, { label: "Best Buy Trade-In", url: "https://www.bestbuy.com/site/recycling" }] },
  { icon: Smartphone, name: "Old Phones / Tablets", value: "$5–$50+/unit", tip: "Working phones pay dramatically more", color: "text-pink-400", bg: "bg-pink-500/10", links: [{ label: "Decluttr", url: "https://www.decluttr.com/" }, { label: "SellCell", url: "https://www.sellcell.com/" }] },
  { icon: Zap, name: "Solar Panels", value: "$10–$50+/panel", tip: "Functional panels sell for much more on marketplaces", color: "text-orange-400", bg: "bg-orange-500/10", links: [{ label: "Solar Recycling Info", url: "https://www.seia.org/initiatives/recycling" }, { label: "eBay Used Solar", url: "https://www.ebay.com/b/Solar-Panels/41979/bn_1836875" }] },
];

const adSlots = [
  { id: 1, width: 728, height: 90, label: "Leaderboard Ad" }, { id: 2, width: 728, height: 90, label: "Leaderboard Ad" },
  { id: 3, width: 300, height: 250, label: "Ad" }, { id: 4, width: 300, height: 250, label: "Ad" }, { id: 5, width: 300, height: 250, label: "Ad" }, { id: 6, width: 300, height: 250, label: "Ad" },
  { id: 7, width: 320, height: 50, label: "Mobile Banner" }, { id: 8, width: 320, height: 50, label: "Mobile Banner" }, { id: 9, width: 320, height: 50, label: "Mobile Banner" },
  { id: 10, width: 300, height: 250, label: "Ad" }, { id: 11, width: 300, height: 250, label: "Ad" }, { id: 12, width: 300, height: 250, label: "Ad" }, { id: 13, width: 300, height: 250, label: "Ad" },
  { id: 14, width: 728, height: 90, label: "Leaderboard Ad" },
  { id: 15, width: 160, height: 600, label: "Skyscraper Ad" }, { id: 16, width: 300, height: 250, label: "Ad" }, { id: 17, width: 300, height: 250, label: "Ad" }, { id: 18, width: 160, height: 600, label: "Skyscraper Ad" },
  { id: 19, width: 320, height: 50, label: "Mobile Banner" }, { id: 20, width: 320, height: 50, label: "Mobile Banner" }, { id: 21, width: 320, height: 50, label: "Mobile Banner" }, { id: 22, width: 320, height: 50, label: "Mobile Banner" },
  { id: 23, width: 300, height: 250, label: "Ad" }, { id: 24, width: 300, height: 250, label: "Ad" }, { id: 25, width: 300, height: 250, label: "Ad" }, { id: 26, width: 300, height: 250, label: "Ad" },
  { id: 27, width: 728, height: 90, label: "Leaderboard Ad" }, { id: 28, width: 728, height: 90, label: "Leaderboard Ad" },
];

function PayoutModal({ account, onClose }: { account: { balanceCents: number; payoutMethod: string; cashAppHandle: string } | null; onClose: () => void }) {
  const [method, setMethod] = useState<"cashapp" | "direct_deposit">("cashapp");
  const [cashHandle, setCashHandle] = useState(""); const [bankName, setBankName] = useState("");
  const [bankRouting, setBankRouting] = useState(""); const [bankAccount, setBankAccount] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const queryClient = useQueryClient();
  const payoutMutation = useMutation({
    mutationFn: () => rpc.requestPayout(method, { cashAppHandle: cashHandle, bankAccountName: bankName, bankRouting, bankAccount }),
    onSuccess: () => { setSubmitted(true); void queryClient.invalidateQueries({ queryKey: ["myEarnings"] }); },
  });
  if (!account) return null;
  const dollars = (account.balanceCents / 100).toFixed(2);
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
      <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-lg">Cash Out</h2>
          <button onClick={onClose}><X size={20} className="text-zinc-500" /></button>
        </div>
        {submitted ? (
          <div className="text-center py-6">
            <CheckCircle size={40} className="text-emerald-400 mx-auto mb-3" />
            <h3 className="text-white font-bold text-lg mb-2">Payout Requested!</h3>
            <p className="text-zinc-400 text-sm">We'll send ${dollars} within 24–48 hours.</p>
            <button onClick={onClose} className="mt-4 text-emerald-400 text-sm">Close</button>
          </div>
        ) : account.balanceCents < 100 ? (
          <div className="text-center py-6">
            <AlertCircle size={40} className="text-zinc-500 mx-auto mb-3" />
            <h3 className="text-white font-bold mb-2">Almost there!</h3>
            <p className="text-zinc-400 text-sm">Minimum $1.00. You have ${dollars}. Keep earning!</p>
            <button onClick={onClose} className="mt-4 text-emerald-400 text-sm">Keep Earning</button>
          </div>
        ) : (
          <div>
            <div className="bg-emerald-900/30 border border-emerald-500/30 rounded-xl p-4 mb-4 text-center">
              <div className="text-emerald-400 text-2xl font-black">${dollars}</div>
              <div className="text-zinc-400 text-xs">available to withdraw</div>
            </div>
            <div className="flex gap-2 mb-4">
              <button onClick={() => setMethod("cashapp")} className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-colors ${method === "cashapp" ? "border-emerald-500 text-emerald-400 bg-emerald-500/10" : "border-white/10 text-zinc-400"}`}>Cash App</button>
              <button onClick={() => setMethod("direct_deposit")} className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-colors ${method === "direct_deposit" ? "border-emerald-500 text-emerald-400 bg-emerald-500/10" : "border-white/10 text-zinc-400"}`}>Direct Deposit</button>
            </div>
            {method === "cashapp" ? (
              <input className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm mb-4 focus:outline-none focus:border-emerald-500" placeholder="$yourcashtag" value={cashHandle} onChange={(e) => setCashHandle(e.target.value)} />
            ) : (
              <div className="flex flex-col gap-2 mb-4">
                <input className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500" placeholder="Account holder name" value={bankName} onChange={(e) => setBankName(e.target.value)} />
                <input className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500" placeholder="Routing number" value={bankRouting} onChange={(e) => setBankRouting(e.target.value)} />
                <input className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500" placeholder="Account number" value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} />
              </div>
            )}
            <button onClick={() => payoutMutation.mutate()} disabled={payoutMutation.isPending} className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-bold py-3 rounded-xl transition-colors">
              {payoutMutation.isPending ? "Requesting..." : `Send $${dollars}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Offerwall Section (TapJoy/Unity placeholder) ----
function OfferwallSection() {
  const offersQuery = useQuery({ queryKey: ["availableOffers"], queryFn: () => rpc.getAvailableOffers() });
  const queryClient = useQueryClient();
  const [activeOffer, setActiveOffer] = useState<{ id: string; title: string; reward: number } | null>(null);
  const [claimedIds, setClaimedIds] = useState<string[]>([]);

  const completeMutation = useMutation({
    mutationFn: (o: { id: string; title: string; reward: number }) => rpc.completeOffer(o.id, o.title, o.reward),
    onSuccess: (_, vars) => {
      setClaimedIds((p) => [...p, vars.id]);
      setActiveOffer(null);
      void queryClient.invalidateQueries({ queryKey: ["myEarnings"] });
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.5 }, colors: ["#f59e0b", "#fcd34d", "#fff"] });
    },
  });

  return (
    <div className="border border-amber-500/20 bg-amber-950/10 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-amber-400 text-xl">💎</span>
        <h2 className="text-white font-black text-lg">Complete Offers — Earn $1–$8 per task</h2>
      </div>
      <p className="text-zinc-400 text-xs mb-4">Real tasks from real brands. Complete once, earn instantly. <span className="text-amber-400">Powered by TapJoy · Unity.</span></p>
      {activeOffer && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[9998]">
          <div className="bg-zinc-900 border border-amber-500/30 rounded-2xl w-full max-w-sm p-6 text-center">
            <div className="text-4xl mb-3">💎</div>
            <h3 className="text-white font-bold text-lg mb-2">{activeOffer.title}</h3>
            <div className="text-amber-400 font-black text-3xl mb-4">${(activeOffer.reward / 100).toFixed(2)}</div>
            <p className="text-zinc-400 text-sm mb-5">This will open the offer in a new tab. Complete it and come back to claim your reward.</p>
            <div className="flex gap-3">
              <button onClick={() => setActiveOffer(null)} className="flex-1 py-2.5 border border-white/10 text-zinc-400 rounded-xl text-sm hover:border-white/20 transition-colors">Cancel</button>
              <button
                onClick={() => {
                  window.open("https://tapjoy.com", "_blank");
                  setTimeout(() => completeMutation.mutate(activeOffer), 1500);
                }}
                disabled={completeMutation.isPending}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-sm transition-colors"
              >
                {completeMutation.isPending ? "Claiming..." : "Open & Claim →"}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {(offersQuery.data ?? []).map((offer) => {
          const claimed = claimedIds.includes(offer.id);
          return (
            <div key={offer.id} className={`border rounded-xl p-4 flex flex-col gap-2 transition-all ${claimed ? "border-amber-500/30 bg-amber-900/5 opacity-60" : "border-white/10 bg-zinc-900/60 hover:border-amber-500/30"}`}>
              <div className="text-2xl">{offer.icon}</div>
              <div className="text-white text-sm font-bold leading-snug">{offer.title}</div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-amber-400 font-black text-xl">${(offer.reward / 100).toFixed(2)}</span>
                <span className="text-zinc-600 text-xs bg-zinc-800 px-2 py-0.5 rounded-full">{offer.timeEstimate}</span>
              </div>
              <button
                onClick={() => !claimed && setActiveOffer({ id: offer.id, title: offer.title, reward: offer.reward })}
                disabled={claimed}
                className={`mt-auto py-2 rounded-lg text-xs font-bold transition-colors ${claimed ? "bg-zinc-700 text-zinc-500 cursor-not-allowed" : "bg-amber-500 hover:bg-amber-400 text-black"}`}
              >
                {claimed ? "✓ Claimed" : "Complete Offer"}
              </button>
            </div>
          );
        })}
      </div>
      <p className="text-zinc-700 text-[10px] mt-3">Live offer feed coming soon — current offers are demo placeholders from TapJoy categories.</p>
    </div>
  );
}

// ---- Pollfish Surveys Section ----
function SurveysSection() {
  const surveysQuery = useQuery({ queryKey: ["availableSurveys"], queryFn: () => rpc.getAvailableSurveys() });
  const queryClient = useQueryClient();
  const [claimedIds, setClaimedIds] = useState<string[]>([]);
  const completeMutation = useMutation({
    mutationFn: (s: { id: string; reward: number }) => rpc.completePollSurvey(s.id, s.reward),
    onSuccess: (_, vars) => {
      setClaimedIds((p) => [...p, vars.id]);
      void queryClient.invalidateQueries({ queryKey: ["myEarnings"] });
    },
  });
  return (
    <div className="border border-blue-500/20 bg-blue-950/10 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-blue-400 text-xl">📋</span>
        <h2 className="text-white font-black text-lg">Paid Surveys — Earn $0.75–$3.00 per survey</h2>
      </div>
      <p className="text-zinc-400 text-xs mb-4">Real market research surveys. Your opinion earns money. <span className="text-blue-400">Powered by Pollfish.</span></p>
      <div className="flex flex-col gap-3">
        {(surveysQuery.data ?? []).map((survey) => {
          const claimed = claimedIds.includes(survey.id);
          return (
            <div key={survey.id} className={`border rounded-xl p-4 flex items-center gap-4 transition-all ${claimed ? "border-blue-500/20 opacity-60" : "border-white/10 bg-zinc-900/60 hover:border-blue-500/20"}`}>
              <div className="text-2xl flex-shrink-0">{survey.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-bold text-sm">{survey.title}</div>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-zinc-500 text-xs bg-zinc-800 px-2 py-0.5 rounded-full">{survey.topic}</span>
                  <span className="text-zinc-600 text-xs">{survey.length}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <span className="text-blue-400 font-black text-xl">${(survey.reward / 100).toFixed(2)}</span>
                <button
                  onClick={() => {
                    if (claimed || completeMutation.isPending) return;
                    window.open("https://www.pollfish.com", "_blank");
                    setTimeout(() => completeMutation.mutate({ id: survey.id, reward: survey.reward }), 1500);
                  }}
                  disabled={claimed || completeMutation.isPending}
                  className={`py-1.5 px-4 rounded-lg text-xs font-bold transition-colors ${claimed ? "bg-zinc-700 text-zinc-500 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-400 text-white"}`}
                >
                  {claimed ? "✓ Done" : "Take Survey"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-zinc-700 text-[10px] mt-3">Live surveys powered by Pollfish coming soon. Current surveys are demo placeholders.</p>
    </div>
  );
}

// ---- Passive Income Section ----
function PassiveIncomeSection() {
  const [open, setOpen] = useState(false);
  const [bgEarning, setBgEarning] = useState(() => localStorage.getItem("lack_bg_earning") === "1");
  const [honeygainNotify, setHoneygainNotify] = useState(() => localStorage.getItem("lack_honeygain_notify") === "1");
  const queryClient = useQueryClient();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const adMutation = useMutation({
    mutationFn: () => rpc.recordAdView("banner"),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["myEarnings"] }),
  });
  useEffect(() => {
    if (bgEarning) {
      intervalRef.current = setInterval(() => {
        if (document.visibilityState === "visible") adMutation.mutate();
      }, 60000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [bgEarning]);
  function toggleBgEarning() {
    const next = !bgEarning;
    setBgEarning(next);
    localStorage.setItem("lack_bg_earning", next ? "1" : "0");
  }
  return (
    <div className="border border-purple-500/20 bg-purple-950/10 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors">
        <div className="flex items-center gap-2">
          <span className="text-purple-400 text-xl">😴</span>
          <span className="text-white font-black text-lg">Earn While You Sleep — Passive Income</span>
        </div>
        {open ? <ChevronUp size={18} className="text-zinc-400" /> : <ChevronDown size={18} className="text-zinc-400" />}
      </button>
      {open && (
        <div className="px-5 pb-5 grid md:grid-cols-3 gap-4">
          <div className="border border-purple-500/20 bg-zinc-900/60 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2"><Wifi size={16} className="text-purple-400" /><span className="text-white font-bold text-sm">Bandwidth Sharing</span></div>
            <p className="text-zinc-400 text-xs mb-3">Share unused internet bandwidth. Earn $0.10–$1.00/day passively just by keeping LACK open.</p>
            <p className="text-zinc-600 text-xs mb-3">Powered by Honeygain — coming soon</p>
            <button onClick={() => { setHoneygainNotify(true); localStorage.setItem("lack_honeygain_notify", "1"); }} disabled={honeygainNotify}
              className={`w-full py-2 rounded-lg text-xs font-bold transition-colors ${honeygainNotify ? "bg-zinc-700 text-zinc-400 cursor-not-allowed" : "bg-purple-500 hover:bg-purple-400 text-white"}`}>
              {honeygainNotify ? "✓ You'll be notified" : "Notify Me When Live"}
            </button>
          </div>
          <div className="border border-purple-500/20 bg-zinc-900/60 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2"><BarChart2 size={16} className="text-purple-400" /><span className="text-white font-bold text-sm">Background Ad Impressions</span></div>
            <p className="text-zinc-400 text-xs mb-3">Keep LACK open in a tab. Earn passive ad impressions every 60 seconds automatically.</p>
            <div className={`text-xs font-bold mb-3 ${bgEarning ? "text-emerald-400" : "text-zinc-500"}`}>{bgEarning ? "🟢 Background earning ON" : "⚫ Background earning OFF"}</div>
            <button onClick={toggleBgEarning} className={`w-full py-2 rounded-lg text-xs font-bold transition-colors ${bgEarning ? "bg-zinc-700 hover:bg-zinc-600 text-white" : "bg-purple-500 hover:bg-purple-400 text-white"}`}>
              {bgEarning ? "Turn Off" : "Enable Background Earning"}
            </button>
          </div>
          <div className="border border-purple-500/20 bg-zinc-900/60 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2"><Shield size={16} className="text-purple-400" /><span className="text-white font-bold text-sm">Data Licensing</span></div>
            <p className="text-zinc-400 text-xs mb-3">License your anonymized profile data to researchers. Earn $0.05–$0.50/month based on profile completeness.</p>
            <p className="text-zinc-600 text-xs mb-3">Requires Level 2+ data consent</p>
            <a href="/privacy" className="block w-full py-2 rounded-lg text-xs font-bold text-center bg-purple-500 hover:bg-purple-400 text-white transition-colors">Manage Data Consent →</a>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Finance Corner ----
const FINANCE_TIPS = [
  "Opening a high-yield savings account can earn 5x more interest than a standard account.",
  "The 50/30/20 rule: 50% needs, 30% wants, 20% savings — even on a tight budget.",
  "Checking your credit score is free and never hurts your credit rating.",
  "SNAP benefits can be used at many farmers markets — often doubling your buying power.",
  "Many utility companies offer low-income assistance programs — call and ask.",
  "Gig work income qualifies for the Earned Income Tax Credit — worth up to $7,000.",
  "Library cards give free access to job boards, e-learning, and business software.",
  "Many banks offer second-chance checking accounts with no minimum balance.",
  "Section 8 waitlists are open in many cities — apply even if the wait is long.",
  "Most hospitals have charity care programs — medical debt can often be forgiven.",
];
function FinanceCorner() {
  const tipIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % FINANCE_TIPS.length;
  const [reaction, setReaction] = useState<"up" | "down" | null>(null);
  return (
    <div className="border border-emerald-500/20 bg-emerald-950/10 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-emerald-400 text-xl">💡</span>
        <h2 className="text-white font-black text-lg">Finance Corner</h2>
        <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full ml-auto">Financial content = premium ad rates</span>
      </div>
      <div className="flex gap-4 items-start">
        <div className="flex-1 border border-emerald-500/20 bg-zinc-900/60 rounded-xl p-4">
          <div className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">Tip of the Day</div>
          <p className="text-white text-sm leading-relaxed mb-3">{FINANCE_TIPS[tipIndex]}</p>
          <div className="flex items-center gap-3">
            <span className="text-zinc-500 text-xs">Was this helpful?</span>
            <button onClick={() => setReaction("up")} className={`text-sm transition-transform ${reaction === "up" ? "scale-125" : "hover:scale-110"}`}>👍</button>
            <button onClick={() => setReaction("down")} className={`text-sm transition-transform ${reaction === "down" ? "scale-125" : "hover:scale-110"}`}>👎</button>
            {reaction && <span className="text-zinc-500 text-xs">Thanks!</span>}
          </div>
        </div>
        <div className="w-28 flex-shrink-0 hidden md:flex flex-col gap-1">
          <AdSlot width={160} height={600} label="Finance Ad" className="h-28" />
        </div>
      </div>
    </div>
  );
}

// ---- Earnings Calculator ----
function EarningsCalculator() {
  const [hours, setHours] = useState(2);
  const [effort, setEffort] = useState<"casual" | "active" | "hustling">("active");
  const [dataSharing, setDataSharing] = useState(false);
  const loopsPerHour = 4;
  const baseCents = loopsPerHour * 2.5 * hours;
  const surveyBonus = effort !== "casual" ? 150 * 3 * hours : 0;
  const offerBonus = effort === "hustling" ? 250 * 1 * hours : 0;
  const dataMultiplier = dataSharing ? 1.4 : 1.0;
  const totalCents = (baseCents + surveyBonus + offerBonus) * dataMultiplier;
  const totalDollars = totalCents / 100;
  const monthlyDollars = totalDollars * 30;
  return (
    <div className="border border-white/10 bg-zinc-900/60 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Calculator size={18} className="text-zinc-400" />
        <h2 className="text-white font-black text-lg">How Much Can I Earn?</h2>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2"><label className="text-zinc-400 text-sm">Hours per day</label><span className="text-white font-bold text-sm">{hours}h</span></div>
            <input type="range" min={0.5} max={8} step={0.5} value={hours} onChange={(e) => setHours(Number(e.target.value))} className="w-full accent-emerald-500" />
            <div className="flex justify-between text-zinc-600 text-xs mt-1"><span>30 min</span><span>8 hrs</span></div>
          </div>
          <div>
            <label className="text-zinc-400 text-sm block mb-2">Effort level</label>
            <div className="flex flex-col gap-2">
              {([["casual", "Casual", "Ads only (The Grind)"], ["active", "Active", "Ads + surveys"], ["hustling", "Hustling", "All methods"]] as const).map(([val, label, sub]) => (
                <button key={val} onClick={() => setEffort(val)} className={`py-2 px-3 rounded-xl text-sm text-left border transition-colors ${effort === val ? "border-emerald-500 bg-emerald-500/10 text-emerald-300" : "border-white/10 text-zinc-400 hover:border-white/20"}`}>
                  <span className="font-bold">{label}</span> <span className="text-xs opacity-70">— {sub}</span>
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={dataSharing} onChange={(e) => setDataSharing(e.target.checked)} className="accent-emerald-500" />
            <span className="text-zinc-400 text-xs">Data sharing enabled (+40% earnings boost)</span>
          </label>
        </div>
        <div className="bg-zinc-800/50 rounded-2xl p-5 flex flex-col justify-center">
          <div className="text-zinc-400 text-xs uppercase tracking-widest mb-2">Estimated earnings</div>
          <div className="text-emerald-400 font-black text-4xl font-mono">${totalDollars.toFixed(2)}<span className="text-zinc-500 text-base font-normal">/day</span></div>
          <div className="text-zinc-300 font-bold text-xl mb-4">${monthlyDollars.toFixed(0)}<span className="text-zinc-500 text-sm font-normal">/month</span></div>
          <div className="space-y-1.5 text-xs border-t border-white/10 pt-3">
            <div className="flex justify-between"><span className="text-zinc-500">The Grind (ads)</span><span className="text-zinc-300">${(baseCents / 100).toFixed(2)}</span></div>
            {surveyBonus > 0 && <div className="flex justify-between"><span className="text-zinc-500">Surveys</span><span className="text-zinc-300">${(surveyBonus / 100).toFixed(2)}</span></div>}
            {offerBonus > 0 && <div className="flex justify-between"><span className="text-zinc-500">Offers</span><span className="text-zinc-300">${(offerBonus / 100).toFixed(2)}</span></div>}
            {dataSharing && <div className="flex justify-between"><span className="text-zinc-500">Data bonus</span><span className="text-zinc-300">×1.4</span></div>}
            <div className="border-t border-white/10 pt-1 flex justify-between font-bold"><span className="text-zinc-400">Total</span><span className="text-emerald-400">${totalDollars.toFixed(2)}/day</span></div>
          </div>
          <p className="text-zinc-600 text-[10px] mt-3">Estimates based on typical engagement. Actual earnings vary.</p>
        </div>
      </div>
    </div>
  );
}

export function EarnPage() {
  const [showGrind, setShowGrind] = useState(false);
  const [showPayout, setShowPayout] = useState(false);
  const [privacyDismissed, setPrivacyDismissed] = useState(false);
  const [todayEarned, setTodayEarned] = useState(0);
  const [grindResult, setGrindResult] = useState<{ totalCents: number; loops: number } | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const queryClient = useQueryClient();

  const earningsQuery = useQuery({ queryKey: ["myEarnings"], queryFn: () => rpc.getMyEarnings(), refetchInterval: 30000 });
  const privacyQuery = useQuery({ queryKey: ["privacySettings"], queryFn: () => rpc.getMyPrivacySettings() });
  const leaderboardQuery = useQuery({ queryKey: ["earningsLeaderboard"], queryFn: () => rpc.getEarningsLeaderboard() });
  const marketingProfileQuery = useQuery({
    queryKey: ["myMarketingProfile"],
    queryFn: () => rpc.getMyMarketingProfile(),
    staleTime: Infinity,
  });

  // Show onboarding modal on first visit (when profile is blank)
  useEffect(() => {
    if (marketingProfileQuery.data && !marketingProfileQuery.data.ageRange) {
      // Small delay so page loads first
      const t = setTimeout(() => setShowOnboarding(true), 1200);
      return () => clearTimeout(t);
    }
  }, [marketingProfileQuery.data]);

  const adViewMutation = useMutation({
    mutationFn: () => rpc.recordAdView("banner"),
    onSuccess: (data) => { setTodayEarned((p) => p + data.earned); void queryClient.invalidateQueries({ queryKey: ["myEarnings"] }); },
  });

  const privacyMutation = useMutation({
    mutationFn: (settings: { shareUsageData?: boolean; shareInterests?: boolean; personalizedAds?: boolean }) => rpc.updatePrivacySettings(settings),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ["privacySettings"] }); void queryClient.invalidateQueries({ queryKey: ["myEarnings"] }); },
  });

  const balance = earningsQuery.data?.account?.balanceCents ?? 0;
  const privacy = privacyQuery.data;

  return (
    <div className="min-h-screen bg-zinc-950">
      {showOnboarding && (
        <ProfileOnboardingModal
          onComplete={() => {
            setShowOnboarding(false);
            void queryClient.invalidateQueries({ queryKey: ["myMarketingProfile"] });
            void queryClient.invalidateQueries({ queryKey: ["myEarnings"] });
          }}
          onSkip={() => setShowOnboarding(false)}
        />
      )}
      {showGrind && (
        <GrindOverlay onClose={(earned, loops) => {
          setShowGrind(false);
          setGrindResult({ totalCents: earned, loops });
          setTodayEarned((p) => p + earned);
          void queryClient.invalidateQueries({ queryKey: ["myEarnings"] });
        }} />
      )}
      {showPayout && <PayoutModal account={earningsQuery.data?.account ?? null} onClose={() => setShowPayout(false)} />}

      <div className="relative border-b border-white/5 overflow-hidden">
        {/* Hero image */}
        <div className="absolute inset-0 pointer-events-none">
          <img src="/hero-earn.jpg" alt="" className="w-full h-full object-cover object-top opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/40 via-zinc-950/70 to-zinc-950" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-xs font-bold tracking-widest uppercase">75% Revenue Share — You Earn</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white mb-2">Earn Real Money Right Now</h1>
              <p className="text-zinc-400 text-sm max-w-xl">Watch ads, run The Grind, earn cash. <span className="text-emerald-400 font-bold">75% of all ad revenue goes directly to you.</span></p>
            </div>
            <div className="flex flex-col items-start md:items-end gap-2">
              <div className="text-emerald-400 font-black text-4xl font-mono">${(balance / 100).toFixed(4)}</div>
              <div className="text-zinc-500 text-xs">your balance</div>
              <button onClick={() => setShowPayout(true)} className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2">
                <DollarSign size={14} /> Cash Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">

        {grindResult && (
          <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <div className="text-white font-bold">🎉 Grind complete!</div>
              <div className="text-zinc-400 text-sm">Earned <span className="text-emerald-400 font-bold">${(grindResult.totalCents / 100).toFixed(3)}</span> across {grindResult.loops} loops.</div>
            </div>
            <button onClick={() => setGrindResult(null)} className="text-zinc-600 hover:text-zinc-400"><X size={16} /></button>
          </div>
        )}

        {!privacyDismissed && (
          <div className="border border-white/10 bg-zinc-900/60 rounded-2xl p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-emerald-400" />
                <span className="text-white font-bold text-sm">Your privacy is guaranteed by default</span>
              </div>
              <button onClick={() => setPrivacyDismissed(true)} className="text-zinc-600 hover:text-zinc-400"><X size={16} /></button>
            </div>
            <p className="text-zinc-400 text-xs mb-4">Want to earn more? Optionally share data — you control exactly what, and can change it anytime.</p>
            <div className="grid md:grid-cols-3 gap-3">
              <PrivacyTierCard tier={1} title="Anonymous Usage" desc="Share how you browse LACK" whatShared="Page views, session duration (no personal info)" bonus="+$0.10" multiplier="15%" enabled={privacy?.shareUsageData ?? false} onToggle={() => privacyMutation.mutate({ shareUsageData: !privacy?.shareUsageData })} disabled={privacyMutation.isPending} />
              <PrivacyTierCard tier={2} title="Interests & Demographics" desc="Share general interest categories" whatShared="Age range, general interests, location (city level)" bonus="+$0.25" multiplier="35%" enabled={privacy?.shareInterests ?? false} onToggle={() => privacyMutation.mutate({ shareInterests: !privacy?.shareInterests })} disabled={privacyMutation.isPending} />
              <PrivacyTierCard tier={3} title="Personalized Ads" desc="Enable ads tailored to you" whatShared="Browsing patterns for ad targeting" bonus="+$0.50" multiplier="60%" enabled={privacy?.personalizedAds ?? false} onToggle={() => privacyMutation.mutate({ personalizedAds: !privacy?.personalizedAds })} disabled={privacyMutation.isPending} />
            </div>
          </div>
        )}

        {/* ---- OFFERWALL ---- */}
        <OfferwallSection />

        {/* ---- POLLFISH SURVEYS ---- */}
        <SurveysSection />

        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <button onClick={() => setShowGrind(true)} className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black text-lg py-5 rounded-2xl transition-all animate-pulse hover:animate-none flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20">
              💰 START THE GRIND <ChevronRight size={20} />
            </button>
            <div className="mt-2 text-center text-zinc-500 text-xs">
              Interstitial ad → choose 1 of 4 videos → repeat forever · Earn while you sit. Stop whenever you want.
            </div>
          </div>
          <div className="border border-white/10 bg-zinc-900/60 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Trophy size={14} className="text-yellow-400" />
              <span className="text-white font-bold text-sm">Top Earners This Week</span>
            </div>
            {leaderboardQuery.data?.slice(0, 5).map((entry, i) => (
              <div key={i} className="flex items-center justify-between py-1">
                <span className="text-zinc-400 text-xs">{i + 1}. {entry.displayName}</span>
                <span className="text-emerald-400 text-xs font-mono">${(entry.balanceCents / 100).toFixed(2)}</span>
              </div>
            ))}
            {!leaderboardQuery.data?.length && <div className="text-zinc-600 text-xs">Be the first to earn!</div>}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Sponsored Content — Tap Ads to Earn</h2>
            {todayEarned > 0 && <span className="text-emerald-400 text-xs font-mono">Earned ${(todayEarned / 100).toFixed(4)} from ads today</span>}
          </div>
          <div className="flex flex-col gap-2 mb-4">{adSlots.slice(0, 2).map((s) => <AdSlot key={s.id} {...s} className="h-16 md:h-20" onView={() => adViewMutation.mutate()} />)}</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">{adSlots.slice(2, 6).map((s) => <AdSlot key={s.id} {...s} className="h-40 md:h-48" onView={() => adViewMutation.mutate()} />)}</div>
          <div className="flex flex-col gap-1 mb-4">{adSlots.slice(6, 9).map((s) => <AdSlot key={s.id} {...s} className="h-10" onView={() => adViewMutation.mutate()} />)}</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">{adSlots.slice(9, 13).map((s) => <AdSlot key={s.id} {...s} className="h-40 md:h-48" onView={() => adViewMutation.mutate()} />)}</div>
          <div className="mb-4"><AdSlot {...adSlots[13]} className="h-16 md:h-20" onView={() => adViewMutation.mutate()} /></div>
          <div className="grid grid-cols-4 gap-2 mb-4">
            <AdSlot {...adSlots[14]} className="h-48 col-span-1" onView={() => adViewMutation.mutate()} />
            <div className="col-span-2 grid grid-rows-2 gap-2">
              <AdSlot {...adSlots[15]} className="h-24" onView={() => adViewMutation.mutate()} />
              <AdSlot {...adSlots[16]} className="h-24" onView={() => adViewMutation.mutate()} />
            </div>
            <AdSlot {...adSlots[17]} className="h-48 col-span-1" onView={() => adViewMutation.mutate()} />
          </div>
          <div className="grid grid-cols-2 gap-1 mb-4">{adSlots.slice(18, 22).map((s) => <AdSlot key={s.id} {...s} className="h-10" onView={() => adViewMutation.mutate()} />)}</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">{adSlots.slice(22, 26).map((s) => <AdSlot key={s.id} {...s} className="h-40 md:h-48" onView={() => adViewMutation.mutate()} />)}</div>
          <div className="flex flex-col gap-2 mb-4">{adSlots.slice(26).map((s) => <AdSlot key={s.id} {...s} className="h-16 md:h-20" onView={() => adViewMutation.mutate()} />)}</div>
        </div>

        {/* ---- PASSIVE INCOME ---- */}
        <PassiveIncomeSection />

        {/* ---- FINANCE CORNER ---- */}
        <FinanceCorner />

        {/* ---- EARNINGS CALCULATOR ---- */}
        <EarningsCalculator />

        <div className="border-t border-white/10 pt-8">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-white mb-1">Turn Trash Into Cash</h2>
            <p className="text-zinc-400 text-sm">Recyclable materials that pay real money. Find a local recycler near you.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recyclables.map(({ icon: Icon, name, value, tip, color, bg, links }) => (
              <div key={name} className="bg-zinc-900/60 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}><Icon size={18} className={color} /></div>
                  <div><h3 className="font-bold text-white text-sm">{name}</h3><span className={`text-sm font-mono font-bold ${color}`}>{value}</span></div>
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

      <div className="border-t border-white/5 mt-12 py-4 text-center">
        <a href="/privacy" className="text-zinc-600 text-xs hover:text-zinc-400 transition-colors">Privacy Policy</a>
        <span className="text-zinc-700 text-xs mx-3">·</span>
        <span className="text-zinc-700 text-xs">LACK pays 75% of ad revenue directly to users</span>
      </div>
    </div>
  );
}
