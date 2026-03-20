/**
 * TrustBadge — shows a user's LACK trust level as a small pill.
 * Pass a score (0-100) to render the appropriate badge.
 */

function getTrustBadgeInfo(score: number): { label: string; color: string } | null {
  if (score >= 81) return { label: "LACK Verified ✓", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" };
  if (score >= 61) return { label: "Verified Member", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" };
  if (score >= 41) return { label: "Trusted Member", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" };
  if (score >= 21) return { label: "Community Member", color: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30" };
  return null;
}

export function TrustBadge({ score }: { score: number }) {
  const badge = getTrustBadgeInfo(score);
  if (!badge) return null;
  return (
    <span
      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}
    >
      {badge.label}
    </span>
  );
}
