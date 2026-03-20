import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/client";
import { MapPin, DollarSign, Clock, Plus, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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

const categories = ["All", "Landscaping", "Carpentry", "Courier", "Snow Removal", "Electronics", "Maintenance", "Other"];

const categoryColors: Record<string, string> = {
  Landscaping: "bg-green-500/20 text-green-400 border-green-500/30",
  Carpentry: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Courier: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "Snow Removal": "bg-sky-500/20 text-sky-400 border-sky-500/30",
  Electronics: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Maintenance: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

function getCategoryColor(cat: string) {
  return categoryColors[cat] ?? "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
}

function GigCard({ gig, onApply }: { gig: Gig; onApply: (gig: Gig) => void }) {
  return (
    <div className="bg-zinc-900/60 border border-white/10 hover:border-emerald-500/30 rounded-xl p-4 flex flex-col gap-3 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold text-white text-sm leading-tight">{gig.title}</h3>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${getCategoryColor(gig.category)}`}
        >
          {gig.category}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-zinc-400">
        <span className="flex items-center gap-1">
          <DollarSign size={11} className="text-emerald-400" />
          <span className="text-emerald-400 font-mono font-bold">{gig.payRate}</span>
        </span>
        <span className="flex items-center gap-1">
          <MapPin size={11} />
          {gig.location}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={11} />
          {new Date(gig.createdAt).toLocaleDateString()}
        </span>
      </div>

      <p className="text-zinc-400 text-xs leading-relaxed line-clamp-3">{gig.description}</p>

      <div className="flex items-center justify-between mt-auto pt-1">
        <span className="text-xs text-zinc-600">
          {gig._count.applications} applied · Posted by {gig.posterName}
        </span>
        <Button
          size="sm"
          onClick={() => onApply(gig)}
          className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs h-7 px-3"
        >
          Apply
        </Button>
      </div>
    </div>
  );
}

function PostGigModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title: "",
    category: "Landscaping",
    payRate: "",
    location: "",
    description: "",
    posterName: "",
    posterEmail: "",
  });

  const mutation = useMutation({
    mutationFn: () => client.createGig({ ...form, isCareer: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gigs"] });
      toast.success("Gig posted! People can now apply.");
      onClose();
      setForm({ title: "", category: "Landscaping", payRate: "", location: "", description: "", posterName: "", posterEmail: "" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Post a Gig</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div>
            <Label className="text-zinc-300 text-xs">Job Title</Label>
            <Input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Lawn Mowing Needed"
              className="bg-zinc-800 border-white/10 text-white mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-zinc-300 text-xs">Category</Label>
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className="w-full mt-1 bg-zinc-800 border border-white/10 rounded-md px-3 py-2 text-white text-sm"
              >
                {["Landscaping", "Carpentry", "Courier", "Snow Removal", "Electronics", "Maintenance", "Other"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-zinc-300 text-xs">Pay Rate</Label>
              <Input
                value={form.payRate}
                onChange={(e) => set("payRate", e.target.value)}
                placeholder="e.g. $20/hr"
                className="bg-zinc-800 border-white/10 text-white mt-1"
              />
            </div>
          </div>
          <div>
            <Label className="text-zinc-300 text-xs">Location</Label>
            <Input
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="City, State"
              className="bg-zinc-800 border-white/10 text-white mt-1"
            />
          </div>
          <div>
            <Label className="text-zinc-300 text-xs">Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Describe the work, hours, any requirements..."
              className="bg-zinc-800 border-white/10 text-white mt-1 min-h-[80px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-zinc-300 text-xs">Your Name</Label>
              <Input
                value={form.posterName}
                onChange={(e) => set("posterName", e.target.value)}
                placeholder="First name"
                className="bg-zinc-800 border-white/10 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-zinc-300 text-xs">Your Email</Label>
              <Input
                value={form.posterEmail}
                onChange={(e) => set("posterEmail", e.target.value)}
                placeholder="you@email.com"
                className="bg-zinc-800 border-white/10 text-white mt-1"
              />
            </div>
          </div>
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !form.title || !form.payRate || !form.location}
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold"
          >
            {mutation.isPending ? "Posting..." : "Post Gig"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ApplyModal({ gig, onClose }: { gig: Gig | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");

  const mutation = useMutation({
    mutationFn: () => client.applyToGig(gig!.id, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gigs"] });
      toast.success("Application submitted! You'll hear back soon.");
      onClose();
      setMessage("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={!!gig} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-white text-base">Apply: {gig?.title}</DialogTitle>
        </DialogHeader>
        {gig && (
          <div className="flex flex-col gap-3">
            <div className="bg-zinc-800/60 rounded-lg p-3 text-xs text-zinc-400 space-y-1">
              <div className="text-emerald-400 font-bold">{gig.payRate}</div>
              <div>{gig.location}</div>
            </div>
            <div>
              <Label className="text-zinc-300 text-xs">Why are you a good fit?</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell them a bit about yourself and why you'd be great for this..."
                className="bg-zinc-800 border-white/10 text-white mt-1 min-h-[100px]"
              />
            </div>
            <Button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending || !message.trim()}
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold"
            >
              {mutation.isPending ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function GigsPage() {
  const [category, setCategory] = useState("All");
  const [postOpen, setPostOpen] = useState(false);
  const [applyGig, setApplyGig] = useState<Gig | null>(null);

  const { data: gigs = [], isLoading } = useQuery({
    queryKey: ["gigs", false],
    queryFn: () => client.getGigs(false),
  });

  const filtered =
    category === "All" ? gigs : gigs.filter((g) => g.category === category);

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="bg-gradient-to-b from-blue-950/30 to-transparent border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Briefcase size={16} className="text-blue-400" />
                <span className="text-blue-400 text-xs font-bold tracking-widest uppercase">
                  Local Gig Board
                </span>
              </div>
              <h1 className="text-3xl font-black text-white">Find Work Today</h1>
              <p className="text-zinc-400 text-sm mt-1">
                Real local gigs. Apply in seconds. Get paid fast.
              </p>
            </div>
            <Button
              onClick={() => setPostOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold gap-2"
            >
              <Plus size={15} />
              Post a Gig
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Category filters */}
        <div className="flex gap-2 flex-wrap mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                category === cat
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/40"
                  : "bg-zinc-800/60 text-zinc-400 border border-white/5 hover:text-white hover:border-white/20"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-zinc-900/60 border border-white/5 rounded-xl p-4 h-52 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-zinc-500">
            <Briefcase size={32} className="mx-auto mb-3 opacity-30" />
            <p>No gigs in this category yet.</p>
            <button
              onClick={() => setPostOpen(true)}
              className="text-emerald-400 text-sm mt-2 hover:underline"
            >
              Post the first one →
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((gig) => (
              <GigCard key={gig.id} gig={gig} onApply={setApplyGig} />
            ))}
          </div>
        )}
      </div>

      <PostGigModal open={postOpen} onClose={() => setPostOpen(false)} />
      <ApplyModal gig={applyGig} onClose={() => setApplyGig(null)} />
    </div>
  );
}
