import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/client";
import {
  Users,
  Home,
  Briefcase,
  MessageSquare,
  AlertTriangle,
  BarChart3,
  Trash2,
  CheckCircle,
  Building,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type AdminTab =
  | "overview"
  | "reports"
  | "gigs"
  | "housing"
  | "users"
  | "restoration";

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [gigCategoryFilter, setGigCategoryFilter] = useState("All");
  const queryClient = useQueryClient();

  const { data: stats } = useQuery({
    queryKey: ["adminStats"],
    queryFn: () => client.getAdminStats(),
  });

  const { data: reports = [] } = useQuery({
    queryKey: ["adminReports"],
    queryFn: () => client.getReports(),
    enabled: activeTab === "reports",
  });

  const { data: gigs = [] } = useQuery({
    queryKey: ["adminGigs"],
    queryFn: () => client.getAllGigsAdmin(),
    enabled: activeTab === "gigs",
  });

  const { data: housing = [] } = useQuery({
    queryKey: ["adminHousing"],
    queryFn: () => client.getAllHousingAdmin(),
    enabled: activeTab === "housing",
  });

  const { data: users = [] } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: () => client.getAllUsers(),
    enabled: activeTab === "users",
  });

  const { data: restorationProjects = [] } = useQuery({
    queryKey: ["restorationProjects"],
    queryFn: () => client.getRestorationProjects(),
    enabled: activeTab === "restoration",
  });

  const dismissMutation = useMutation({
    mutationFn: (id: string) => client.dismissReport(id),
    onSuccess: () => {
      toast.success("Report dismissed");
      queryClient.invalidateQueries({ queryKey: ["adminReports"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteGigMutation = useMutation({
    mutationFn: (id: string) => client.adminDeleteGigListing(id),
    onSuccess: () => {
      toast.success("Listing removed");
      queryClient.invalidateQueries({ queryKey: ["adminGigs"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteHousingMutation = useMutation({
    mutationFn: (id: string) => client.adminDeleteHousingListing(id),
    onSuccess: () => {
      toast.success("Listing removed");
      queryClient.invalidateQueries({ queryKey: ["adminHousing"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const activeReports = (
    reports as Array<{
      id: string;
      reason: string;
      dismissed: boolean;
      createdAt: Date;
      targetUserId: string | null;
      targetListingId: string | null;
      reporter: { id: string; name: string | null; handle: string | null };
    }>
  ).filter((r) => !r.dismissed);

  const gigCategories = [
    "All",
    ...Array.from(
      new Set(
        (
          gigs as Array<{
            id: string;
            category: string;
            title: string;
            posterName: string;
            createdAt: Date;
            _count: { applications: number };
          }>
        ).map((g) => g.category),
      ),
    ),
  ];

  const filteredGigs = (
    gigs as Array<{
      id: string;
      category: string;
      title: string;
      posterName: string;
      createdAt: Date;
      _count: { applications: number };
    }>
  ).filter((g) =>
    gigCategoryFilter === "All" ? true : g.category === gigCategoryFilter,
  );

  const navItems: { key: AdminTab; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: "Overview", icon: <BarChart3 size={16} /> },
    {
      key: "reports",
      label: "Reports",
      icon: <AlertTriangle size={16} />,
    },
    { key: "gigs", label: "Gig Listings", icon: <Briefcase size={16} /> },
    { key: "housing", label: "Housing", icon: <Home size={16} /> },
    {
      key: "restoration",
      label: "Restoration",
      icon: <Building size={16} />,
    },
    { key: "users", label: "Users", icon: <Users size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-zinc-900 border-r border-white/10 flex flex-col pt-6 flex-shrink-0">
        <div className="px-4 mb-6">
          <h2 className="text-white font-bold text-sm">LACK Admin</h2>
          <p className="text-zinc-500 text-xs mt-0.5">Management Dashboard</p>
        </div>
        <div className="px-2 mb-4">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">
            <p className="text-amber-400 text-[10px] leading-snug">
              ⚠️ Admin preview — restricted to authorized users in production
            </p>
          </div>
        </div>
        <nav className="flex-1 px-2 space-y-0.5">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${
                activeTab === item.key
                  ? "bg-emerald-500/20 text-emerald-400 font-medium"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {item.icon}
              {item.label}
              {item.key === "reports" && stats && stats.pendingReportCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {stats.pendingReportCount}
                </span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6">
        {/* Overview */}
        {activeTab === "overview" && (
          <div>
            <h1 className="text-white text-2xl font-bold mb-6">Overview</h1>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {[
                {
                  label: "Total Users",
                  value: stats?.userCount ?? "—",
                  icon: <Users size={20} />,
                  color: "text-blue-400",
                  bg: "bg-blue-500/10",
                },
                {
                  label: "Gig Listings",
                  value: stats?.gigCount ?? "—",
                  icon: <Briefcase size={20} />,
                  color: "text-emerald-400",
                  bg: "bg-emerald-500/10",
                },
                {
                  label: "Housing Listings",
                  value: stats?.housingCount ?? "—",
                  icon: <Home size={20} />,
                  color: "text-amber-400",
                  bg: "bg-amber-500/10",
                },
                {
                  label: "Applications",
                  value: stats?.applicationCount ?? "—",
                  icon: <ChevronRight size={20} />,
                  color: "text-purple-400",
                  bg: "bg-purple-500/10",
                },
                {
                  label: "Messages Sent",
                  value: stats?.messageCount ?? "—",
                  icon: <MessageSquare size={20} />,
                  color: "text-cyan-400",
                  bg: "bg-cyan-500/10",
                },
                {
                  label: "Pending Reports",
                  value: stats?.pendingReportCount ?? "—",
                  icon: <AlertTriangle size={20} />,
                  color: "text-red-400",
                  bg: "bg-red-500/10",
                },
                {
                  label: "Restoration Projects",
                  value: stats?.restorationCount ?? "—",
                  icon: <Building size={20} />,
                  color: "text-orange-400",
                  bg: "bg-orange-500/10",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-zinc-900 border border-white/10 rounded-xl p-4"
                >
                  <div
                    className={`${stat.bg} ${stat.color} w-9 h-9 rounded-lg flex items-center justify-center mb-3`}
                  >
                    {stat.icon}
                  </div>
                  <div className="text-white text-2xl font-bold">
                    {stat.value}
                  </div>
                  <div className="text-zinc-400 text-xs mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reports */}
        {activeTab === "reports" && (
          <div>
            <h1 className="text-white text-2xl font-bold mb-6">Reports Queue</h1>
            {activeReports.length === 0 ? (
              <div className="text-center py-16 text-zinc-500">
                <CheckCircle size={40} className="mx-auto mb-3 text-emerald-500/40" />
                <p>No pending reports — all clear!</p>
              </div>
            ) : (
              <div className="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-zinc-800/50">
                      <th className="text-left px-4 py-3 text-zinc-400 font-medium">Type</th>
                      <th className="text-left px-4 py-3 text-zinc-400 font-medium">Reason</th>
                      <th className="text-left px-4 py-3 text-zinc-400 font-medium">Reporter</th>
                      <th className="text-left px-4 py-3 text-zinc-400 font-medium">Target ID</th>
                      <th className="text-left px-4 py-3 text-zinc-400 font-medium">Date</th>
                      <th className="text-right px-4 py-3 text-zinc-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeReports.map((report, i) => (
                      <tr
                        key={report.id}
                        className={`border-b border-white/5 ${i % 2 === 0 ? "" : "bg-zinc-800/20"}`}
                      >
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              report.targetUserId
                                ? "bg-purple-500/20 text-purple-400"
                                : "bg-orange-500/20 text-orange-400"
                            }`}
                          >
                            {report.targetUserId ? "User" : "Listing"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-zinc-300 max-w-[200px] truncate">
                          {report.reason}
                        </td>
                        <td className="px-4 py-3 text-zinc-400 text-xs">
                          {report.reporter.name ?? report.reporter.handle ?? report.reporter.id}
                        </td>
                        <td className="px-4 py-3 text-zinc-500 text-xs font-mono truncate max-w-[120px]">
                          {report.targetUserId ?? report.targetListingId ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-zinc-500 text-xs">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => dismissMutation.mutate(report.id)}
                            disabled={dismissMutation.isPending}
                            className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 text-xs h-7"
                          >
                            Dismiss
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Gig Listings */}
        {activeTab === "gigs" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-white text-2xl font-bold">Gig Listings</h1>
              <div className="flex gap-2 flex-wrap">
                {gigCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setGigCategoryFilter(cat)}
                    className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                      gigCategoryFilter === cat
                        ? "bg-emerald-500 text-black border-emerald-500 font-bold"
                        : "border-white/10 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-zinc-800/50">
                    <th className="text-left px-4 py-3 text-zinc-400 font-medium">Title</th>
                    <th className="text-left px-4 py-3 text-zinc-400 font-medium">Category</th>
                    <th className="text-left px-4 py-3 text-zinc-400 font-medium">Poster</th>
                    <th className="text-left px-4 py-3 text-zinc-400 font-medium">Applications</th>
                    <th className="text-left px-4 py-3 text-zinc-400 font-medium">Date</th>
                    <th className="text-right px-4 py-3 text-zinc-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGigs.map((gig, i) => (
                    <tr
                      key={gig.id}
                      className={`border-b border-white/5 ${i % 2 === 0 ? "" : "bg-zinc-800/20"}`}
                    >
                      <td className="px-4 py-3 text-white font-medium max-w-[200px] truncate">
                        {gig.title}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded-full">
                          {gig.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-400 text-xs">{gig.posterName}</td>
                      <td className="px-4 py-3 text-zinc-400 text-xs">
                        {gig._count.applications}
                      </td>
                      <td className="px-4 py-3 text-zinc-500 text-xs">
                        {new Date(gig.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (confirm("Remove this listing?")) {
                              deleteGigMutation.mutate(gig.id);
                            }
                          }}
                          disabled={deleteGigMutation.isPending}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-7 w-7 p-0"
                        >
                          <Trash2 size={13} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Housing */}
        {activeTab === "housing" && (
          <div>
            <h1 className="text-white text-2xl font-bold mb-6">Housing Listings</h1>
            <div className="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-zinc-800/50">
                    <th className="text-left px-4 py-3 text-zinc-400 font-medium">Address</th>
                    <th className="text-left px-4 py-3 text-zinc-400 font-medium">Type</th>
                    <th className="text-left px-4 py-3 text-zinc-400 font-medium">Price</th>
                    <th className="text-left px-4 py-3 text-zinc-400 font-medium">Contact</th>
                    <th className="text-left px-4 py-3 text-zinc-400 font-medium">Date</th>
                    <th className="text-right px-4 py-3 text-zinc-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(
                    housing as Array<{
                      id: string;
                      address: string;
                      type: string;
                      price: number;
                      contactName: string;
                      createdAt: Date;
                    }>
                  ).map((listing, i) => (
                    <tr
                      key={listing.id}
                      className={`border-b border-white/5 ${i % 2 === 0 ? "" : "bg-zinc-800/20"}`}
                    >
                      <td className="px-4 py-3 text-white text-xs max-w-[180px] truncate">
                        {listing.address}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            listing.type === "rent"
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-amber-500/20 text-amber-400"
                          }`}
                        >
                          {listing.type === "rent" ? "For Rent" : "For Sale"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-300 text-xs">
                        ${listing.price.toLocaleString()}
                        {listing.type === "rent" ? "/mo" : ""}
                      </td>
                      <td className="px-4 py-3 text-zinc-400 text-xs">
                        {listing.contactName}
                      </td>
                      <td className="px-4 py-3 text-zinc-500 text-xs">
                        {new Date(listing.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (confirm("Remove this listing?")) {
                              deleteHousingMutation.mutate(listing.id);
                            }
                          }}
                          disabled={deleteHousingMutation.isPending}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-7 w-7 p-0"
                        >
                          <Trash2 size={13} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users */}
        {activeTab === "users" && (
          <div>
            <h1 className="text-white text-2xl font-bold mb-6">Users</h1>
            <div className="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-zinc-800/50">
                    <th className="text-left px-4 py-3 text-zinc-400 font-medium">User</th>
                    <th className="text-left px-4 py-3 text-zinc-400 font-medium">Location</th>
                    <th className="text-left px-4 py-3 text-zinc-400 font-medium">Trust Score</th>
                    <th className="text-left px-4 py-3 text-zinc-400 font-medium">Verifications</th>
                    <th className="text-left px-4 py-3 text-zinc-400 font-medium">Applications</th>
                  </tr>
                </thead>
                <tbody>
                  {(
                    users as Array<{
                      id: string;
                      name: string | null;
                      handle: string | null;
                      image: string | null;
                      location: string;
                      verificationCount: number;
                      trustScore: number;
                      applicationCount: number;
                    }>
                  ).map((user, i) => (
                    <tr
                      key={user.id}
                      className={`border-b border-white/5 ${i % 2 === 0 ? "" : "bg-zinc-800/20"}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-emerald-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {(user.name ?? user.handle ?? "U").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-white text-xs font-medium">
                              {user.name ?? user.handle ?? "Anonymous"}
                            </div>
                            {user.handle && (
                              <div className="text-zinc-500 text-[10px]">@{user.handle}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-zinc-400 text-xs">
                        {user.location || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-zinc-700 rounded-full h-1.5 max-w-[60px]">
                            <div
                              className="bg-emerald-500 h-1.5 rounded-full"
                              style={{ width: `${user.trustScore}%` }}
                            />
                          </div>
                          <span className="text-zinc-300 text-xs">{user.trustScore}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-zinc-400 text-xs">
                        {user.verificationCount}
                      </td>
                      <td className="px-4 py-3 text-zinc-400 text-xs">
                        {user.applicationCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Restoration */}
        {activeTab === "restoration" && (
          <div>
            <h1 className="text-white text-2xl font-bold mb-6">Restoration Projects</h1>
            <div className="grid gap-4">
              {(
                restorationProjects as Array<{
                  id: string;
                  address: string;
                  city: string;
                  status: string;
                  proposedUse: string;
                  fundingGoal: number;
                  amountRaised: number;
                  backerCount: number;
                  champion: { id: string; name: string | null; handle: string | null };
                  _count: { laborPledges: number; updates: number };
                }>
              ).map((project) => {
                const progress = Math.min(
                  (project.amountRaised / project.fundingGoal) * 100,
                  100,
                );
                return (
                  <div
                    key={project.id}
                    className="bg-zinc-900 border border-white/10 rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium text-sm">
                            {project.address}, {project.city}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              project.status === "abandoned"
                                ? "bg-red-500/20 text-red-400"
                                : project.status === "foreclosed"
                                  ? "bg-orange-500/20 text-orange-400"
                                  : project.status === "auction"
                                    ? "bg-yellow-500/20 text-yellow-400"
                                    : "bg-blue-500/20 text-blue-400"
                            }`}
                          >
                            {project.status.replace("_", " ")}
                          </span>
                        </div>
                        <p className="text-zinc-500 text-xs">
                          Champion:{" "}
                          {project.champion.name ?? project.champion.handle ?? "Unknown"} ·{" "}
                          {project._count.laborPledges} labor pledges · {project._count.updates}{" "}
                          updates
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-white text-sm font-bold">
                          ${project.amountRaised.toLocaleString()}
                        </div>
                        <div className="text-zinc-500 text-xs">
                          of ${project.fundingGoal.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                        <span>{project.backerCount} backers</span>
                        <span>{Math.round(progress)}% funded</span>
                      </div>
                      <div className="bg-zinc-700 rounded-full h-1.5">
                        <div
                          className="bg-emerald-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
