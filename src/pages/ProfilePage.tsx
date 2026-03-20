import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client, type inferRPCOutputType } from "@/lib/client";

type ProfileData = inferRPCOutputType<"getMyProfile">;
type AppWithGig = ProfileData["applications"][number];
type VerificationRecord = inferRPCOutputType<"getMyVerifications">[number];

import {
  User,
  Briefcase,
  MapPin,
  Phone,
  Plus,
  X,
  CheckCircle,
  Clock,
  Shield,
  ShieldCheck,
  Fingerprint,
  Mail,
  AtSign,
  Link,
} from "lucide-react";
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

// Trust score ring component
function TrustRing({ score, badge }: { score: number; badge: string }) {
  const radius = 36;
  const circ = 2 * Math.PI * radius;
  const filled = (score / 100) * circ;

  const ringColor =
    score >= 81
      ? "#10b981"
      : score >= 61
        ? "#3b82f6"
        : score >= 41
          ? "#8b5cf6"
          : "#71717a";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg width="96" height="96" className="-rotate-90">
          <circle cx="48" cy="48" r={radius} fill="none" stroke="#27272a" strokeWidth="8" />
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth="8"
            strokeDasharray={`${filled} ${circ}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-black text-xl">{score}</span>
        </div>
      </div>
      {badge ? (
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          {badge}
        </span>
      ) : (
        <span className="text-xs text-zinc-500">No badge yet</span>
      )}
    </div>
  );
}

// Verification card
function VerifCard({
  icon,
  label,
  description,
  points,
  verified,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  points: string;
  verified: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`border rounded-xl p-4 transition-colors ${
        verified
          ? "border-emerald-500/40 bg-emerald-500/5"
          : "border-white/10 bg-zinc-900/40"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`text-${verified ? "emerald" : "zinc"}-400`}>{icon}</div>
          <div>
            <div className="text-white text-sm font-semibold">{label}</div>
            <div className="text-zinc-500 text-xs">{description}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-bold ${verified ? "text-emerald-400" : "text-zinc-500"}`}
          >
            {verified ? "✓ Done" : points}
          </span>
          {!verified && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setOpen((v) => !v)}
              className="text-xs text-zinc-400 hover:text-white h-7 px-2"
            >
              {open ? "Cancel" : "Verify"}
            </Button>
          )}
        </div>
      </div>
      {open && !verified && (
        <div className="mt-3 pt-3 border-t border-white/10">{children}</div>
      )}
    </div>
  );
}

export function ProfilePage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["myProfile"],
    queryFn: () => client.getMyProfile(),
  });

  const { data: verificationsData, refetch: refetchVerifications } = useQuery({
    queryKey: ["myVerifications"],
    queryFn: () => client.getMyVerifications(),
  });

  const [bio, setBio] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [workHistory, setWorkHistory] = useState<WorkEntry[]>([]);
  const [newJob, setNewJob] = useState<WorkEntry>({ company: "", role: "", years: "" });
  const [addingJob, setAddingJob] = useState(false);

  // Social inputs
  const [twitterHandle, setTwitterHandle] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [indeedUrl, setIndeedUrl] = useState("");
  const [googleEmail, setGoogleEmail] = useState("");
  const [metaHandle, setMetaHandle] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [communityNeighborhood, setCommunityNeighborhood] = useState("");
  const [communitySkills, setCommunitySkills] = useState("");
  const [communityReference, setCommunityReference] = useState("");

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

  const emailVerifyMutation = useMutation({
    mutationFn: () => client.startEmailVerification(),
    onSuccess: () => {
      refetchVerifications();
      toast.success("Email verified! +15 trust points");
    },
  });

  const phoneMutation = useMutation({
    mutationFn: () => client.startPhoneVerification(phoneInput),
    onSuccess: () => {
      refetchVerifications();
      toast.success("Phone saved! SMS verification coming soon.");
    },
  });

  const socialMutation = useMutation({
    mutationFn: ({ method, handle }: { method: string; handle: string }) =>
      client.addSocialVerification(method, handle),
    onSuccess: (_, vars) => {
      refetchVerifications();
      toast.success(`${vars.method} linked! +10 trust points`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const communityMutation = useMutation({
    mutationFn: () =>
      client.addCommunityId({
        neighborhood: communityNeighborhood,
        skills: communitySkills,
        reference: communityReference,
      }),
    onSuccess: () => {
      refetchVerifications();
      toast.success("Community ID saved! +15 trust points");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const biometricMutation = useMutation({
    mutationFn: async () => {
      if (!window.PublicKeyCredential) {
        throw new Error("Biometrics not supported on this device/browser");
      }
      // WebAuthn challenge
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);
      await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: "LACK Community Kiosk" },
          user: {
            id: new Uint8Array(16),
            name: "lack-user",
            displayName: "LACK User",
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          timeout: 60000,
          attestation: "none",
        },
      });
      return client.recordBiometricVerification();
    },
    onSuccess: () => {
      refetchVerifications();
      toast.success("Biometric verified! +20 trust points");
    },
    onError: (e: Error) => toast.error(e.message || "Biometric verification failed"),
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
  const verifications: VerificationRecord[] = verificationsData ?? [];
  const verifiedMethods = new Set(verifications.filter((v) => v.verified).map((v) => v.method));

  // Compute trust score locally for display
  let trustScore = 0;
  if (verifiedMethods.has("email")) trustScore += 15;
  if (verifiedMethods.has("phone")) trustScore += 20;
  if (verifiedMethods.has("biometric")) trustScore += 20;
  if (verifiedMethods.has("community")) trustScore += 15;
  const socialMethods = ["google", "meta", "twitter", "linkedin", "indeed"];
  const socialCount = socialMethods.filter((m) => verifiedMethods.has(m)).length;
  trustScore += Math.min(socialCount, 3) * 10;

  let trustBadge = "";
  if (trustScore >= 81) trustBadge = "LACK Verified ✓";
  else if (trustScore >= 61) trustBadge = "Verified Member";
  else if (trustScore >= 41) trustBadge = "Trusted Member";
  else if (trustScore >= 21) trustBadge = "Community Member";

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

        {/* Trust Score Section */}
        <div className="bg-zinc-900/60 border border-white/10 rounded-xl p-5">
          <h2 className="text-white font-bold mb-4 flex items-center gap-2">
            <ShieldCheck size={15} className="text-emerald-400" />
            Trust Score
          </h2>
          <div className="flex items-center gap-6">
            <TrustRing score={trustScore} badge={trustBadge} />
            <div className="flex-1">
              <p className="text-zinc-300 text-sm mb-2">
                Verified users get <span className="text-emerald-400 font-bold">3× more responses</span> from employers and landlords.
              </p>
              <p className="text-zinc-500 text-xs">
                Verification is always optional — it just shows people you're real. Every method you complete adds to your score.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {trustScore < 100 && (
                  <span className="text-xs text-zinc-500">
                    {100 - trustScore} points to max score
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Verify Your Identity */}
        <div className="bg-zinc-900/60 border border-white/10 rounded-xl p-5">
          <h2 className="text-white font-bold mb-1 flex items-center gap-2">
            <Shield size={15} className="text-blue-400" />
            Verify Your Identity
          </h2>
          <p className="text-zinc-500 text-xs mb-4">
            All optional. Each verification adds trust points and a badge to your profile.
          </p>

          <div className="space-y-3">
            {/* Email */}
            <VerifCard
              icon={<Mail size={16} />}
              label="Email"
              description="Instant verification"
              points="+15 pts"
              verified={verifiedMethods.has("email")}
            >
              <Button
                size="sm"
                onClick={() => emailVerifyMutation.mutate()}
                disabled={emailVerifyMutation.isPending}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs h-8"
              >
                {emailVerifyMutation.isPending ? "Verifying..." : "Verify Email"}
              </Button>
            </VerifCard>

            {/* Phone */}
            <VerifCard
              icon={<Phone size={16} />}
              label="Phone"
              description="SMS verification — adds strong trust signal"
              points="+20 pts"
              verified={verifiedMethods.has("phone")}
            >
              <div className="flex gap-2">
                <Input
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="(555) 555-5555"
                  className="bg-zinc-800 border-white/10 text-white text-sm h-8"
                />
                <Button
                  size="sm"
                  onClick={() => phoneMutation.mutate()}
                  disabled={phoneMutation.isPending || !phoneInput}
                  className="bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs h-8 whitespace-nowrap"
                >
                  Save Number
                </Button>
              </div>
              <p className="text-zinc-600 text-xs mt-1">SMS code coming soon — saved for when it launches.</p>
            </VerifCard>

            {/* Google */}
            <VerifCard
              icon={<Mail size={16} />}
              label="Google"
              description="Link your Google account"
              points="+10 pts"
              verified={verifiedMethods.has("google")}
            >
              <div className="flex gap-2">
                <Input
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  placeholder="your@gmail.com"
                  className="bg-zinc-800 border-white/10 text-white text-sm h-8"
                />
                <Button
                  size="sm"
                  onClick={() => socialMutation.mutate({ method: "google", handle: googleEmail })}
                  disabled={socialMutation.isPending || !googleEmail}
                  className="bg-red-500 hover:bg-red-400 text-white font-bold text-xs h-8"
                >
                  Link
                </Button>
              </div>
              <p className="text-zinc-600 text-xs mt-1">OAuth login coming soon — self-reported for now.</p>
            </VerifCard>

            {/* Meta */}
            <VerifCard
              icon={<AtSign size={16} />}
              label="Meta (Facebook / Instagram)"
              description="Link your Facebook or Instagram"
              points="+10 pts"
              verified={verifiedMethods.has("meta")}
            >
              <div className="flex gap-2">
                <Input
                  value={metaHandle}
                  onChange={(e) => setMetaHandle(e.target.value)}
                  placeholder="@yourhandle"
                  className="bg-zinc-800 border-white/10 text-white text-sm h-8"
                />
                <Button
                  size="sm"
                  onClick={() => socialMutation.mutate({ method: "meta", handle: metaHandle })}
                  disabled={socialMutation.isPending || !metaHandle}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs h-8"
                >
                  Link
                </Button>
              </div>
            </VerifCard>

            {/* X / Twitter */}
            <VerifCard
              icon={<AtSign size={16} />}
              label="X (Twitter)"
              description="Link your X profile"
              points="+10 pts"
              verified={verifiedMethods.has("twitter")}
            >
              <div className="flex gap-2">
                <Input
                  value={twitterHandle}
                  onChange={(e) => setTwitterHandle(e.target.value)}
                  placeholder="@yourhandle"
                  className="bg-zinc-800 border-white/10 text-white text-sm h-8"
                />
                <Button
                  size="sm"
                  onClick={() => socialMutation.mutate({ method: "twitter", handle: twitterHandle })}
                  disabled={socialMutation.isPending || !twitterHandle}
                  className="bg-zinc-700 hover:bg-zinc-600 text-white font-bold text-xs h-8"
                >
                  Link
                </Button>
              </div>
            </VerifCard>

            {/* LinkedIn */}
            <VerifCard
              icon={<Link size={16} />}
              label="LinkedIn"
              description="Link your LinkedIn profile"
              points="+10 pts"
              verified={verifiedMethods.has("linkedin")}
            >
              <div className="flex gap-2">
                <Input
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="linkedin.com/in/yourname"
                  className="bg-zinc-800 border-white/10 text-white text-sm h-8"
                />
                <Button
                  size="sm"
                  onClick={() => socialMutation.mutate({ method: "linkedin", handle: linkedinUrl })}
                  disabled={socialMutation.isPending || !linkedinUrl}
                  className="bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs h-8"
                >
                  Link
                </Button>
              </div>
            </VerifCard>

            {/* Indeed */}
            <VerifCard
              icon={<Briefcase size={16} />}
              label="Indeed"
              description="Link your Indeed profile"
              points="+10 pts"
              verified={verifiedMethods.has("indeed")}
            >
              <div className="flex gap-2">
                <Input
                  value={indeedUrl}
                  onChange={(e) => setIndeedUrl(e.target.value)}
                  placeholder="indeed.com/r/yourprofile"
                  className="bg-zinc-800 border-white/10 text-white text-sm h-8"
                />
                <Button
                  size="sm"
                  onClick={() => socialMutation.mutate({ method: "indeed", handle: indeedUrl })}
                  disabled={socialMutation.isPending || !indeedUrl}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs h-8"
                >
                  Link
                </Button>
              </div>
            </VerifCard>

            {/* LACK Community ID */}
            <VerifCard
              icon={<User size={16} />}
              label="LACK Community ID"
              description="Tell the community who you are"
              points="+15 pts"
              verified={verifiedMethods.has("community")}
            >
              <div className="space-y-2">
                <Input
                  value={communityNeighborhood}
                  onChange={(e) => setCommunityNeighborhood(e.target.value)}
                  placeholder="Your neighborhood (e.g. Logan Square, Chicago)"
                  className="bg-zinc-800 border-white/10 text-white text-sm h-8"
                />
                <Input
                  value={communitySkills}
                  onChange={(e) => setCommunitySkills(e.target.value)}
                  placeholder="Primary skills (e.g. carpentry, driving)"
                  className="bg-zinc-800 border-white/10 text-white text-sm h-8"
                />
                <Input
                  value={communityReference}
                  onChange={(e) => setCommunityReference(e.target.value)}
                  placeholder="One reference name (optional)"
                  className="bg-zinc-800 border-white/10 text-white text-sm h-8"
                />
                <Button
                  size="sm"
                  onClick={() => communityMutation.mutate()}
                  disabled={communityMutation.isPending || !communityNeighborhood}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs h-8"
                >
                  {communityMutation.isPending ? "Saving..." : "Save Community ID"}
                </Button>
              </div>
            </VerifCard>

            {/* Biometric */}
            <VerifCard
              icon={<Fingerprint size={16} />}
              label="Face ID / Fingerprint"
              description="Use your device's biometric authentication"
              points="+20 pts"
              verified={verifiedMethods.has("biometric")}
            >
              <div>
                <Button
                  size="sm"
                  onClick={() => biometricMutation.mutate()}
                  disabled={biometricMutation.isPending}
                  className="bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs h-8"
                >
                  <Fingerprint size={13} className="mr-1" />
                  {biometricMutation.isPending ? "Authenticating..." : "Use Face ID / Fingerprint"}
                </Button>
                <p className="text-zinc-600 text-xs mt-1">
                  Works on most modern phones. Uses your device's built-in biometrics — nothing is sent to our servers.
                </p>
              </div>
            </VerifCard>
          </div>
        </div>

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
