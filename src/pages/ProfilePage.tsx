import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client, type inferRPCOutputType } from "@/lib/client";

type ProfileData = inferRPCOutputType<"getMyProfile">;
type AppWithGig = ProfileData["applications"][number];
import { User, Briefcase, MapPin, Phone, Plus, X, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type WorkEntry = {
  company: string;
  role: string;
  years: string;
};

export function ProfilePage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["myProfile"],
    queryFn: () => client.getMyProfile(),
  });

  const [bio, setBio] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [workHistory, setWorkHistory] = useState<WorkEntry[]>([]);
  const [newJob, setNewJob] = useState<WorkEntry>({ company: "", role: "", years: "" });
  const [addingJob, setAddingJob] = useState(false);

  useEffect(() => {
    if (data?.profile) {
      setBio(data.profile.bio);
      setPhone(data.profile.phone);
      setLocation(data.profile.location);
      setSkills(data.profile.skills ? data.profile.skills.split(",").filter(Boolean) : []);
      try {
        const wh = JSON.parse(data.profile.workHistory || "[]");
        setWorkHistory(Array.isArray(wh) ? wh : []);
      } catch {
        setWorkHistory([]);
      }
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: () =>
      client.upsertProfile({
        bio,
        skills: skills.join(","),
        workHistory: JSON.stringify(workHistory),
        phone,
        location,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
      toast.success("Profile saved!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) {
      setSkills((prev) => [...prev, s]);
      setSkillInput("");
    }
  };

  const removeSkill = (s: string) => setSkills((prev) => prev.filter((x) => x !== s));

  const addJob = () => {
    if (newJob.company && newJob.role) {
      setWorkHistory((prev) => [...prev, newJob]);
      setNewJob({ company: "", role: "", years: "" });
      setAddingJob(false);
    }
  };

  const removeJob = (i: number) =>
    setWorkHistory((prev) => prev.filter((_, idx) => idx !== i));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-500 text-sm">Loading your profile...</div>
      </div>
    );
  }

  const applications: AppWithGig[] = data?.applications ?? [];

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="bg-gradient-to-b from-zinc-900/80 to-transparent border-b border-white/5">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex items-center gap-2 mb-2">
            <User size={16} className="text-zinc-400" />
            <span className="text-zinc-400 text-xs font-bold tracking-widest uppercase">
              My Profile
            </span>
          </div>
          <h1 className="text-3xl font-black text-white">Your LACK Profile</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Employers see this when you apply. A complete profile gets you hired faster.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Bio */}
        <div className="bg-zinc-900/60 border border-white/10 rounded-xl p-5">
          <h2 className="text-white font-bold mb-4 flex items-center gap-2">
            <User size={15} className="text-emerald-400" />
            About You
          </h2>
          <div className="space-y-3">
            <div>
              <Label className="text-zinc-300 text-xs">Bio</Label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell employers about yourself — your experience, work ethic, what you're good at..."
                className="bg-zinc-800 border-white/10 text-white mt-1 min-h-[100px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-zinc-300 text-xs flex items-center gap-1.5">
                  <Phone size={11} />
                  Phone
                </Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 555-5555"
                  className="bg-zinc-800 border-white/10 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-zinc-300 text-xs flex items-center gap-1.5">
                  <MapPin size={11} />
                  Location
                </Label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, State"
                  className="bg-zinc-800 border-white/10 text-white mt-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="bg-zinc-900/60 border border-white/10 rounded-xl p-5">
          <h2 className="text-white font-bold mb-4 flex items-center gap-2">
            <CheckCircle size={15} className="text-blue-400" />
            Skills
          </h2>
          <div className="flex flex-wrap gap-2 mb-3">
            {skills.map((s) => (
              <span
                key={s}
                className="flex items-center gap-1.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-medium"
              >
                {s}
                <button onClick={() => removeSkill(s)} className="hover:text-white transition-colors">
                  <X size={11} />
                </button>
              </span>
            ))}
            {skills.length === 0 && (
              <span className="text-zinc-600 text-xs">No skills added yet</span>
            )}
          </div>
          <div className="flex gap-2">
            <Input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSkill()}
              placeholder="Add a skill (e.g. Carpentry, Driving)"
              className="bg-zinc-800 border-white/10 text-white"
            />
            <Button
              onClick={addSkill}
              variant="secondary"
              size="sm"
              className="bg-zinc-700 hover:bg-zinc-600 text-white"
            >
              <Plus size={14} />
            </Button>
          </div>
        </div>

        {/* Work History */}
        <div className="bg-zinc-900/60 border border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold flex items-center gap-2">
              <Briefcase size={15} className="text-purple-400" />
              Work History
            </h2>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setAddingJob(true)}
              className="text-zinc-400 hover:text-white text-xs gap-1 h-7"
            >
              <Plus size={12} />
              Add Job
            </Button>
          </div>

          {workHistory.length === 0 && !addingJob && (
            <div className="text-zinc-600 text-xs text-center py-4">
              No work history yet.{" "}
              <button onClick={() => setAddingJob(true)} className="text-purple-400 hover:underline">
                Add your first job →
              </button>
            </div>
          )}

          <div className="space-y-2 mb-3">
            {workHistory.map((job, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-zinc-800/60 rounded-lg px-4 py-3"
              >
                <div>
                  <div className="text-white text-sm font-medium">{job.role}</div>
                  <div className="text-zinc-400 text-xs">
                    {job.company}
                    {job.years && ` · ${job.years}`}
                  </div>
                </div>
                <button onClick={() => removeJob(i)} className="text-zinc-600 hover:text-zinc-300">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          {addingJob && (
            <div className="bg-zinc-800/60 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-zinc-300 text-xs">Company / Employer</Label>
                  <Input
                    value={newJob.company}
                    onChange={(e) => setNewJob((j) => ({ ...j, company: e.target.value }))}
                    placeholder="Company name"
                    className="bg-zinc-900 border-white/10 text-white mt-1"
                  />
                </div>
                <div>
                  <Label className="text-zinc-300 text-xs">Role / Title</Label>
                  <Input
                    value={newJob.role}
                    onChange={(e) => setNewJob((j) => ({ ...j, role: e.target.value }))}
                    placeholder="Your job title"
                    className="bg-zinc-900 border-white/10 text-white mt-1"
                  />
                </div>
              </div>
              <div>
                <Label className="text-zinc-300 text-xs">Years (optional)</Label>
                <Input
                  value={newJob.years}
                  onChange={(e) => setNewJob((j) => ({ ...j, years: e.target.value }))}
                  placeholder="e.g. 2019–2022"
                  className="bg-zinc-900 border-white/10 text-white mt-1"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={addJob} size="sm" className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold">
                  Add
                </Button>
                <Button
                  onClick={() => setAddingJob(false)}
                  size="sm"
                  variant="ghost"
                  className="text-zinc-400 hover:text-white"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Save button */}
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold h-11"
        >
          {saveMutation.isPending ? "Saving..." : "Save Profile"}
        </Button>

        {/* Applications */}
        {applications.length > 0 && (
          <div className="bg-zinc-900/60 border border-white/10 rounded-xl p-5">
            <h2 className="text-white font-bold mb-4 flex items-center gap-2">
              <Clock size={15} className="text-zinc-400" />
              My Applications ({applications.length})
            </h2>
            <div className="space-y-2">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between bg-zinc-800/60 rounded-lg px-4 py-3"
                >
                  <div>
                    <div className="text-white text-sm font-medium">{app.gig.title}</div>
                    <div className="text-zinc-400 text-xs">
                      {app.gig.payRate} · {app.gig.location}
                    </div>
                  </div>
                  <span className="text-xs text-zinc-500">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
