import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/client";
import { MapPin, DollarSign, Clock, Award, TrendingUp, CheckCircle, ExternalLink, Building2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type Gig = {
  id: string;
  title: string;
  category: string;
  payRate: string;
  location: string;
  description: string;
  posterName: string;
  posterEmail: string;
  isCareer: boolean;
  createdAt: Date;
  _count: { applications: number };
};

function CareerCard({ gig, onApply }: { gig: Gig; onApply: (gig: Gig) => void }) {
  return (
    <div className="bg-zinc-900/60 border border-white/10 hover:border-purple-500/30 rounded-xl p-5 flex flex-col gap-4 transition-colors">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
          <Award size={18} className="text-purple-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <h3 className="font-bold text-white text-sm leading-tight">{gig.title}</h3>
            <span className="text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-full flex-shrink-0">
              {gig.category}
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">Posted by {gig.posterName}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-xs">
        <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-lg font-mono font-bold">
          <DollarSign size={11} />
          {gig.payRate}
        </span>
        <span className="flex items-center gap-1.5 text-zinc-400">
          <MapPin size={11} />
          {gig.location}
        </span>
        <span className="flex items-center gap-1.5 text-zinc-500">
          <Clock size={11} />
          {new Date(gig.createdAt).toLocaleDateString()}
        </span>
      </div>

      <p className="text-zinc-400 text-sm leading-relaxed">{gig.description}</p>

      <div className="bg-purple-950/30 border border-purple-500/20 rounded-lg p-3">
        <div className="flex items-center gap-2 text-purple-300 text-xs font-bold mb-1">
          <TrendingUp size={12} />
          LACK Salary Negotiation
        </div>
        <p className="text-xs text-zinc-400">
          Apply through LACK and we'll negotiate a higher starting salary on your
          behalf. We keep the difference — so it costs you nothing extra to try.
        </p>
      </div>

      <div className="flex items-center justify-between mt-auto">
        <span className="text-xs text-zinc-600">{gig._count.applications} candidates</span>
        <Button
          size="sm"
          onClick={() => onApply(gig)}
          className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs h-8 px-4"
        >
          Apply via LACK
        </Button>
      </div>
    </div>
  );
}

function ApplyModal({ gig, onClose }: { gig: Gig | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");

  const mutation = useMutation({
    mutationFn: () => client.applyToGig(gig!.id, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["careers"] });
      toast.success("Application submitted! LACK will be in touch about salary negotiation.");
      onClose();
      setMessage("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={!!gig} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-white text-base">{gig?.title}</DialogTitle>
        </DialogHeader>
        {gig && (
          <div className="flex flex-col gap-4">
            <div className="bg-purple-950/40 border border-purple-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={14} className="text-purple-400" />
                <span className="text-purple-300 font-bold text-xs">How LACK Negotiation Works</span>
              </div>
              <ul className="space-y-1.5">
                {[
                  "You apply with your profile",
                  "LACK contacts the employer on your behalf",
                  "We negotiate a higher starting salary",
                  "You get more, LACK keeps the difference",
                ].map((step, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-zinc-400">
                    <CheckCircle size={11} className="text-emerald-400 flex-shrink-0" />
                    {step}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-zinc-800/60 rounded-lg p-3 text-xs text-zinc-400 space-y-1">
              <div className="text-emerald-400 font-bold font-mono">{gig.payRate}</div>
              <div className="flex items-center gap-1">
                <MapPin size={11} />
                {gig.location}
              </div>
            </div>

            <div>
              <Label className="text-zinc-300 text-xs">Your background & qualifications</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share your experience, skills, and why you're a great fit. LACK will use this in negotiations..."
                className="bg-zinc-800 border-white/10 text-white mt-1 min-h-[120px]"
              />
            </div>
            <Button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending || !message.trim()}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold"
            >
              {mutation.isPending ? "Submitting..." : "Submit to LACK"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

const perks = [
  { icon: TrendingUp, text: "We negotiate higher salaries for you" },
  { icon: CheckCircle, text: "Free to apply — we earn on the spread" },
  { icon: Award, text: "Full-time roles with benefits" },
  { icon: MapPin, text: "Local and remote positions" },
];

type ExternalJob = {
  id: string;
  source: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary: string;
  url: string;
  postedAt: Date;
};

const SOURCE_LABELS: Record<string, string> = {
  remotive: "Remotive",
  themuse: "The Muse",
  adzuna: "Adzuna",
  seed: "Local Listing",
};

function ExternalJobCard({ job }: { job: ExternalJob }) {
  return (
    <div className="bg-zinc-900/60 border border-white/10 hover:border-blue-500/30 rounded-xl p-5 flex flex-col gap-3 transition-colors">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
          <Building2 size={18} className="text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <h3 className="font-bold text-white text-sm leading-tight">{job.title}</h3>
            <span className="text-[10px] font-bold bg-zinc-700/50 text-zinc-400 border border-white/10 px-2 py-0.5 rounded-full flex-shrink-0">
              {SOURCE_LABELS[job.source] ?? job.source}
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">{job.company}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-xs">
        {job.salary && (
          <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-lg font-mono font-bold">
            <DollarSign size={11} />
            {job.salary}
          </span>
        )}
        <span className="flex items-center gap-1.5 text-zinc-400">
          <MapPin size={11} />
          {job.location}
        </span>
        <span className="flex items-center gap-1.5 text-zinc-500">
          <Clock size={11} />
          {new Date(job.postedAt).toLocaleDateString()}
        </span>
      </div>

      {job.description && (
        <p className="text-zinc-400 text-sm leading-relaxed line-clamp-3">{job.description}</p>
      )}

      <div className="flex items-center justify-between mt-auto">
        <span className="text-[10px] text-zinc-600 uppercase tracking-wider">External Listing</span>
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs h-8 px-4 rounded-md transition-colors"
        >
          Apply <ExternalLink size={11} />
        </a>
      </div>
    </div>
  );
}

export function CareersPage() {
  const [applyGig, setApplyGig] = useState<Gig | null>(null);
  const [tab, setTab] = useState<"lack" | "all">("all");

  const { data: gigs = [], isLoading: gigsLoading } = useQuery({
    queryKey: ["careers", true],
    queryFn: () => client.getGigs(true),
  });

  const { data: externalJobs = [], isLoading: extLoading, refetch: refetchExt } = useQuery({
    queryKey: ["externalJobs"],
    queryFn: () => client.getExternalJobs(40),
    staleTime: 15 * 60 * 1000,
  });

  const isLoading = gigsLoading || extLoading;
  const totalCount = gigs.length + externalJobs.length;

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="bg-gradient-to-b from-purple-950/30 to-transparent border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="flex items-center gap-2 mb-3">
            <Award size={16} className="text-purple-400" />
            <span className="text-purple-400 text-xs font-bold tracking-widest uppercase">
              Career Placement
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
            LACK Gets You More
          </h1>
          <p className="text-zinc-400 text-base max-w-lg mb-6">
            We negotiate your salary so you land higher. Browse full-time
            positions, apply through LACK, and let us fight for your worth.
          </p>

          {/* Value props */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {perks.map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2"
              >
                <Icon size={13} className="text-purple-400 flex-shrink-0" />
                <span className="text-xs text-zinc-300">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-950/50 to-zinc-900/50 border-b border-purple-500/20">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse flex-shrink-0" />
          <p className="text-sm text-zinc-300">
            <strong className="text-white">How it works:</strong> LACK gets you more, you keep more. We
            negotiate your salary — we get a cut of the difference between your
            original offer and the negotiated rate. Zero cost to you.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => setTab("all")}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${tab === "all" ? "bg-purple-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}
            >
              All Jobs <span className="ml-1 text-xs opacity-70">({totalCount})</span>
            </button>
            <button
              onClick={() => setTab("lack")}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${tab === "lack" ? "bg-purple-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}
            >
              LACK Placement <span className="ml-1 text-xs opacity-70">({gigs.length})</span>
            </button>
          </div>
          <button
            onClick={() => void refetchExt()}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <RefreshCw size={12} />
            Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-zinc-900/60 border border-white/5 rounded-xl p-5 h-48 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {/* LACK-placed careers */}
            {(tab === "all" || tab === "lack") && gigs.map((gig) => (
              <CareerCard key={gig.id} gig={gig} onApply={setApplyGig} />
            ))}
            {/* Aggregated external jobs */}
            {tab === "all" && externalJobs.map((job) => (
              <ExternalJobCard key={job.id} job={job as ExternalJob} />
            ))}
            {/* Empty state */}
            {totalCount === 0 && (
              <div className="col-span-2 text-center py-16 text-zinc-500">
                <Award size={32} className="mx-auto mb-3 opacity-30" />
                <p>No listings yet — job aggregator runs every 3 hours.</p>
                <button onClick={() => void refetchExt()} className="mt-3 text-xs text-purple-400 hover:text-purple-300">
                  Check again
                </button>
              </div>
            )}
          </div>
        )}

        {externalJobs.length > 0 && (
          <p className="text-center text-xs text-zinc-600 mt-8">
            External listings sourced from Indeed, USAJobs, and Adzuna · Updated every 3 hours
          </p>
        )}
      </div>

      <ApplyModal gig={applyGig} onClose={() => setApplyGig(null)} />
    </div>
  );
}
