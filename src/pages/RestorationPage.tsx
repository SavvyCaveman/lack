import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/client";
import { Link } from "react-router-dom";
import {
  Building,
  ChevronLeft,
  X,
  Users,
  Hammer,
  Heart,
  ArrowRight,
  AlertCircle,
  Clock,
  Gavel,
  Wrench,
  MessageSquare,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────

type RestorationProject = {
  id: string;
  address: string;
  city: string;
  status: string;
  proposedUse: string;
  estimatedCost: number;
  fundingGoal: number;
  amountRaised: number;
  backerCount: number;
  description: string;
  createdAt: Date;
  champion: { id: string; name: string | null; handle: string | null };
  _count?: { laborPledges: number; updates: number };
};

type ProjectDetail = RestorationProject & {
  updates: { id: string; content: string; createdAt: Date }[];
  laborPledges: {
    id: string;
    skill: string;
    hours: number;
    user: { id: string; name: string | null; handle: string | null };
  }[];
};

// ── Helpers ────────────────────────────────────────────────────────────────────

const statusConfig: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  foreclosed: {
    label: "Foreclosed",
    color: "bg-red-500/20 text-red-400 border-red-500/30",
    icon: AlertCircle,
  },
  abandoned: {
    label: "Abandoned",
    color: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
    icon: Clock,
  },
  auction: {
    label: "Auction",
    color: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    icon: Gavel,
  },
  tax_lien: {
    label: "Tax Lien",
    color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    icon: AlertCircle,
  },
};

const useConfig: Record<string, { label: string; color: string }> = {
  housing: { label: "Housing", color: "bg-emerald-500/20 text-emerald-400" },
  community: { label: "Community Space", color: "bg-blue-500/20 text-blue-400" },
  mixed: { label: "Mixed Use", color: "bg-purple-500/20 text-purple-400" },
};

function FundingBar({
  raised,
  goal,
}: {
  raised: number;
  goal: number;
}) {
  const pct = Math.min(100, Math.round((raised / goal) * 100));
  const color =
    pct >= 80
      ? "bg-emerald-400"
      : pct >= 40
        ? "bg-amber-400"
        : "bg-blue-400";
  return (
    <div className="space-y-1">
      <div className="w-full bg-zinc-700 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-zinc-400">
        <span>
          <span className="text-white font-medium">
            ${raised.toLocaleString()}
          </span>{" "}
          raised
        </span>
        <span>{pct}% of ${goal.toLocaleString()} goal</span>
      </div>
    </div>
  );
}

// ── Project Detail Modal ───────────────────────────────────────────────────────

function ProjectDetail({
  projectId,
  onClose,
}: {
  projectId: string;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [laborForm, setLaborForm] = useState({ skill: "", hours: "" });
  const [laborError, setLaborError] = useState("");

  const { data: project, isLoading } = useQuery({
    queryKey: ["restoration-project", projectId],
    queryFn: () => client.getRestorationProject(projectId),
  });

  const pledgeMutation = useMutation({
    mutationFn: () =>
      client.pledgeLabor(projectId, laborForm.skill, parseInt(laborForm.hours)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["restoration-project", projectId] });
      qc.invalidateQueries({ queryKey: ["restoration-projects"] });
      setLaborForm({ skill: "", hours: "" });
      setLaborError("");
    },
    onError: (e) => setLaborError(String(e)),
  });

  if (isLoading || !project) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="bg-zinc-900 rounded-xl p-8 text-zinc-400">
          Loading project…
        </div>
      </div>
    );
  }

  const status = statusConfig[project.status] ?? statusConfig.abandoned;
  const use = useConfig[project.proposedUse] ?? useConfig.housing;
  const StatusIcon = status.icon;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-white/10 rounded-xl w-full max-w-2xl my-8">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-white/10">
          <div>
            <div className="flex flex-wrap gap-2 mb-2">
              <span
                className={`text-xs px-2 py-0.5 rounded-full border font-medium ${status.color}`}
              >
                <StatusIcon className="inline mr-1" size={10} />
                {status.label}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${use.color}`}>
                {use.label}
              </span>
            </div>
            <h2 className="text-white font-black text-xl">{project.address}</h2>
            <p className="text-zinc-400 text-sm">{project.city}</p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white ml-4"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Description */}
          <p className="text-zinc-300 text-sm leading-relaxed">
            {project.description}
          </p>

          {/* Cost & Funding */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-800 rounded-xl p-4">
              <p className="text-zinc-400 text-xs mb-1">Estimated Cost</p>
              <p className="text-white font-bold text-lg">
                ${project.estimatedCost.toLocaleString()}
              </p>
            </div>
            <div className="bg-zinc-800 rounded-xl p-4">
              <p className="text-zinc-400 text-xs mb-1">Champion</p>
              <p className="text-white font-medium text-sm">
                {project.champion.name ?? project.champion.handle ?? "Anonymous"}
              </p>
            </div>
          </div>

          {/* Funding bar */}
          <div className="bg-zinc-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white font-medium text-sm">Funding Progress</p>
              <span className="text-zinc-400 text-xs">
                {project.backerCount} backers
              </span>
            </div>
            <FundingBar
              raised={project.amountRaised}
              goal={project.fundingGoal}
            />
          </div>

          {/* Stripe placeholder */}
          <div className="bg-zinc-800 border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <Heart size={18} className="text-pink-400" />
              <h3 className="text-white font-bold">Back This Project</h3>
            </div>
            <div className="bg-zinc-700/50 border border-dashed border-zinc-600 rounded-lg p-4 text-center">
              <p className="text-zinc-300 text-sm font-medium mb-1">
                Stripe payments coming soon
              </p>
              <p className="text-zinc-500 text-xs">
                Connect your Stripe account to enable donations. LACK takes 5%
                platform fee; Stripe takes ~3%. The rest goes directly to the
                restoration fund.
              </p>
            </div>
            <p className="text-zinc-500 text-xs mt-2 text-center">
              Total fees: ~8% · LACK 5% + Stripe ~3% · Shown clearly before
              any transaction
            </p>
          </div>

          {/* Labor pledge */}
          <div className="bg-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <Wrench size={18} className="text-amber-400" />
              <h3 className="text-white font-bold">Pledge Your Skills</h3>
              <span className="text-xs text-zinc-400">
                ({(project as ProjectDetail).laborPledges?.length ?? 0} pledges)
              </span>
            </div>

            {(project as ProjectDetail).laborPledges?.length > 0 && (
              <div className="mb-4 space-y-2">
                {(project as ProjectDetail).laborPledges.map((pledge) => (
                  <div
                    key={pledge.id}
                    className="flex items-center justify-between bg-zinc-700/50 rounded-lg px-3 py-2"
                  >
                    <span className="text-zinc-300 text-sm">
                      {pledge.user.name ?? pledge.user.handle ?? "Volunteer"} —{" "}
                      {pledge.skill}
                    </span>
                    <span className="text-amber-400 text-sm font-medium">
                      {pledge.hours} hrs
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-zinc-400 text-xs mb-1 block">
                  Your Skill
                </label>
                <input
                  value={laborForm.skill}
                  onChange={(e) =>
                    setLaborForm((f) => ({ ...f, skill: e.target.value }))
                  }
                  placeholder="Carpentry, electrical, painting…"
                  className="w-full bg-zinc-700 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-500"
                />
              </div>
              <div>
                <label className="text-zinc-400 text-xs mb-1 block">
                  Hours You Can Offer
                </label>
                <input
                  type="number"
                  value={laborForm.hours}
                  onChange={(e) =>
                    setLaborForm((f) => ({ ...f, hours: e.target.value }))
                  }
                  placeholder="8"
                  min="1"
                  className="w-full bg-zinc-700 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-500"
                />
              </div>
            </div>

            {laborError && (
              <p className="text-red-400 text-xs mb-2">{laborError}</p>
            )}

            <button
              onClick={() => pledgeMutation.mutate()}
              disabled={
                pledgeMutation.isPending ||
                !laborForm.skill ||
                !laborForm.hours
              }
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold py-2.5 rounded-lg transition-colors text-sm"
            >
              {pledgeMutation.isPending ? "Pledging…" : "Pledge My Labor"}
            </button>
          </div>

          {/* Updates feed */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare size={16} className="text-zinc-400" />
              <h3 className="text-white font-bold text-sm">Updates</h3>
            </div>
            {(project as ProjectDetail).updates?.length > 0 ? (
              <div className="space-y-3">
                {(project as ProjectDetail).updates.map((update) => (
                  <div
                    key={update.id}
                    className="bg-zinc-800 rounded-lg p-4 border-l-2 border-emerald-500"
                  >
                    <p className="text-zinc-300 text-sm">{update.content}</p>
                    <p className="text-zinc-500 text-xs mt-2">
                      {new Date(update.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-zinc-500 text-sm">No updates yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Champion a Property Modal ──────────────────────────────────────────────────

function ChampionModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    address: "",
    city: "",
    status: "abandoned",
    proposedUse: "housing",
    estimatedCost: "",
    fundingGoal: "",
    description: "",
  });
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      client.createRestorationProject({
        address: form.address,
        city: form.city,
        status: form.status,
        proposedUse: form.proposedUse,
        estimatedCost: parseFloat(form.estimatedCost),
        fundingGoal: parseFloat(form.fundingGoal),
        description: form.description,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["restoration-projects"] });
      onClose();
    },
    onError: (e) => setError(String(e)),
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-white/10 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-zinc-900 flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-white font-bold text-lg">
            Champion a Property
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-zinc-400 text-xs mb-1 block">Address</label>
            <input
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="123 Main St"
              className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-500"
            />
          </div>

          <div>
            <label className="text-zinc-400 text-xs mb-1 block">
              City, State
            </label>
            <input
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
              placeholder="Chicago, IL"
              className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-zinc-400 text-xs mb-1 block">Status</label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="abandoned">Abandoned</option>
                <option value="foreclosed">Foreclosed</option>
                <option value="auction">Auction</option>
                <option value="tax_lien">Tax Lien</option>
              </select>
            </div>
            <div>
              <label className="text-zinc-400 text-xs mb-1 block">
                Proposed Use
              </label>
              <select
                value={form.proposedUse}
                onChange={(e) => set("proposedUse", e.target.value)}
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="housing">Housing</option>
                <option value="community">Community Space</option>
                <option value="mixed">Mixed Use</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-zinc-400 text-xs mb-1 block">
                Estimated Restoration Cost ($)
              </label>
              <input
                type="number"
                value={form.estimatedCost}
                onChange={(e) => set("estimatedCost", e.target.value)}
                placeholder="85000"
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-500"
              />
            </div>
            <div>
              <label className="text-zinc-400 text-xs mb-1 block">
                Funding Goal ($)
              </label>
              <input
                type="number"
                value={form.fundingGoal}
                onChange={(e) => set("fundingGoal", e.target.value)}
                placeholder="60000"
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-500"
              />
            </div>
          </div>

          <div>
            <label className="text-zinc-400 text-xs mb-1 block">
              Tell the community about this property
            </label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={4}
              placeholder="Why does this property matter? What's the vision? Who has already committed to help?"
              className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-500 resize-none"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            onClick={() => mutation.mutate()}
            disabled={
              mutation.isPending ||
              !form.address ||
              !form.city ||
              !form.estimatedCost ||
              !form.fundingGoal ||
              !form.description
            }
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-bold py-2.5 rounded-lg transition-colors"
          >
            {mutation.isPending ? "Submitting…" : "Champion This Property"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Project Card ───────────────────────────────────────────────────────────────

function ProjectCard({
  project,
  onClick,
}: {
  project: RestorationProject;
  onClick: () => void;
}) {
  const status = statusConfig[project.status] ?? statusConfig.abandoned;
  const use = useConfig[project.proposedUse] ?? useConfig.housing;
  const StatusIcon = status.icon;

  return (
    <div
      onClick={onClick}
      className="bg-zinc-900 border border-white/10 rounded-xl p-5 hover:border-emerald-500/40 cursor-pointer transition-colors group"
    >
      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span
          className={`text-xs px-2 py-0.5 rounded-full border font-medium ${status.color}`}
        >
          <StatusIcon className="inline mr-1" size={10} />
          {status.label}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${use.color}`}>
          {use.label}
        </span>
      </div>

      {/* Address */}
      <h3 className="text-white font-bold text-base group-hover:text-emerald-300 transition-colors">
        {project.address}
      </h3>
      <p className="text-zinc-400 text-sm mb-3">{project.city}</p>

      {/* Description preview */}
      <p className="text-zinc-500 text-xs line-clamp-2 mb-4">
        {project.description}
      </p>

      {/* Funding bar */}
      <FundingBar raised={project.amountRaised} goal={project.fundingGoal} />

      {/* Footer stats */}
      <div className="flex items-center gap-4 mt-3 text-zinc-500 text-xs">
        <span className="flex items-center gap-1">
          <Users size={12} />
          {project.backerCount} backers
        </span>
        <span className="flex items-center gap-1">
          <Hammer size={12} />
          {project._count?.laborPledges ?? 0} labor pledges
        </span>
        <span className="ml-auto text-emerald-400 flex items-center gap-1 group-hover:gap-2 transition-all">
          View <ArrowRight size={12} />
        </span>
      </div>
    </div>
  );
}

// ── Main Restoration Page ──────────────────────────────────────────────────────

export function RestorationPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showChampion, setShowChampion] = useState(false);

  const { data: projects, isLoading } = useQuery({
    queryKey: ["restoration-projects"],
    queryFn: () => client.getRestorationProjects(),
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Back nav */}
      <Link
        to="/housing"
        className="inline-flex items-center gap-2 text-zinc-400 hover:text-white text-sm mb-6 transition-colors"
      >
        <ChevronLeft size={16} />
        Back to Housing
      </Link>

      {/* Hero */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Building size={24} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-white font-black text-2xl md:text-3xl">
              Community Restoration Hub
            </h1>
            <p className="text-zinc-400 text-sm">
              Turn abandoned buildings into homes and community spaces
            </p>
          </div>
        </div>

        <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl mb-6">
          Find foreclosed, legally abandoned, and auctioned properties in your
          area. Champion a restoration project, pledge your skills, and help
          your community reclaim vacant buildings — one block at a time.
        </p>

        {/* How it works */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            {
              icon: Building,
              title: "Find a Property",
              desc: "Browse vacant, foreclosed, or auctioned buildings with restoration potential.",
            },
            {
              icon: Heart,
              title: "Back the Vision",
              desc: "Donate or pledge your skills. LACK takes 5%, Stripe ~3% — clearly shown upfront.",
            },
            {
              icon: Hammer,
              title: "Build Together",
              desc: "Coordinate volunteers, track progress, and restore housing for people who need it.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-zinc-900 border border-white/10 rounded-xl p-4"
            >
              <Icon size={20} className="text-emerald-400 mb-2" />
              <h3 className="text-white font-bold text-sm mb-1">{title}</h3>
              <p className="text-zinc-400 text-xs">{desc}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowChampion(true)}
          className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-6 py-3 rounded-xl transition-colors"
        >
          + Champion a Property
        </button>
      </div>

      {/* Projects grid */}
      <h2 className="text-white font-bold text-lg mb-4">
        Active Restoration Projects
      </h2>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-zinc-900 border border-white/10 rounded-xl h-56 animate-pulse"
            />
          ))}
        </div>
      ) : projects && projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => setSelectedId(project.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-zinc-500">
          <Building size={40} className="mx-auto mb-3 opacity-30" />
          <p>No restoration projects yet.</p>
          <button
            onClick={() => setShowChampion(true)}
            className="mt-4 text-emerald-400 hover:underline text-sm"
          >
            Be the first to champion a property →
          </button>
        </div>
      )}

      {/* Detail modal */}
      {selectedId && (
        <ProjectDetail
          projectId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}

      {/* Champion modal */}
      {showChampion && (
        <ChampionModal onClose={() => setShowChampion(false)} />
      )}
    </div>
  );
}
