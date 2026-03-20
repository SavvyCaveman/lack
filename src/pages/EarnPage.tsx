import { Battery, Cpu, Tv, Smartphone, Zap, ExternalLink } from "lucide-react";

// Ad slot component — Google AdSense ready
function AdSlot({
  width,
  height,
  label = "Advertisement",
  className = "",
}: {
  width: number;
  height: number;
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative flex flex-col items-center justify-center border border-white/10 bg-zinc-900/50 rounded overflow-hidden ${className}`}
      style={{ width: "100%", minHeight: `${Math.min(height, 200)}px` }}
    >
      {/* Real AdSense slot — replace data-ad-client and data-ad-slot with your values */}
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%", height: "100%" }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot="XXXXXXXXXX"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      {/* Placeholder shown until real ads load */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest mb-1">
          {label}
        </span>
        <span className="text-zinc-700 text-xs">
          {width}×{height}
        </span>
        <div className="mt-2 w-8 h-0.5 bg-zinc-700 rounded" />
      </div>
    </div>
  );
}

const recyclables = [
  {
    icon: Battery,
    name: "Lithium-Ion Batteries",
    value: "$0.50–$2.00/lb",
    tip: "EV batteries can fetch $5–$20 each",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    links: [
      { label: "Call2Recycle Locator", url: "https://www.call2recycle.org/locator/" },
      { label: "Battery Solutions", url: "https://www.batteryrecyclers.com/" },
    ],
  },
  {
    icon: Cpu,
    name: "Circuit Boards / CPUs",
    value: "$1.00–$8.00/lb",
    tip: "Gold-rich boards command higher prices",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    links: [
      { label: "iScrap App", url: "https://www.iscrapapp.com/" },
      { label: "Scrap Monster Prices", url: "https://www.scrapmonster.com/scrap-prices/electronics/" },
    ],
  },
  {
    icon: Tv,
    name: "Flat Panel TVs / Monitors",
    value: "$5–$20/unit",
    tip: "Some recyclers pay; others charge a small fee",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    links: [
      { label: "Earth911 Locator", url: "https://earth911.com/" },
      { label: "Best Buy Trade-In", url: "https://www.bestbuy.com/site/recycling" },
    ],
  },
  {
    icon: Smartphone,
    name: "Old Phones / Tablets",
    value: "$5–$50+/unit",
    tip: "Working phones pay dramatically more",
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    links: [
      { label: "Decluttr", url: "https://www.decluttr.com/" },
      { label: "SellCell", url: "https://www.sellcell.com/" },
    ],
  },
  {
    icon: Zap,
    name: "Solar Panels",
    value: "$10–$50+/panel",
    tip: "Functional panels sell for much more on marketplaces",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    links: [
      { label: "Solar Recycling Info", url: "https://www.seia.org/initiatives/recycling" },
      { label: "eBay Used Solar", url: "https://www.ebay.com/b/Solar-Panels/41979/bn_1836875" },
    ],
  },
];

// Generate ad slots of various sizes
const adSlots = [
  // Row 1 — leaderboards
  { id: 1, width: 728, height: 90, label: "Leaderboard Ad" },
  { id: 2, width: 728, height: 90, label: "Leaderboard Ad" },
  // Row 2 — medium rectangles
  { id: 3, width: 300, height: 250, label: "Ad" },
  { id: 4, width: 300, height: 250, label: "Ad" },
  { id: 5, width: 300, height: 250, label: "Ad" },
  { id: 6, width: 300, height: 250, label: "Ad" },
  // Row 3 — mobile banners
  { id: 7, width: 320, height: 50, label: "Mobile Banner" },
  { id: 8, width: 320, height: 50, label: "Mobile Banner" },
  { id: 9, width: 320, height: 50, label: "Mobile Banner" },
  // Row 4 — more rectangles
  { id: 10, width: 300, height: 250, label: "Ad" },
  { id: 11, width: 300, height: 250, label: "Ad" },
  { id: 12, width: 300, height: 250, label: "Ad" },
  { id: 13, width: 300, height: 250, label: "Ad" },
  // Row 5 — leaderboard
  { id: 14, width: 728, height: 90, label: "Leaderboard Ad" },
  // Row 6 — wide skyscrapers as rectangles
  { id: 15, width: 160, height: 600, label: "Skyscraper Ad" },
  { id: 16, width: 300, height: 250, label: "Ad" },
  { id: 17, width: 300, height: 250, label: "Ad" },
  { id: 18, width: 160, height: 600, label: "Skyscraper Ad" },
  // Row 7 — more mobile banners
  { id: 19, width: 320, height: 50, label: "Mobile Banner" },
  { id: 20, width: 320, height: 50, label: "Mobile Banner" },
  { id: 21, width: 320, height: 50, label: "Mobile Banner" },
  { id: 22, width: 320, height: 50, label: "Mobile Banner" },
  // Row 8 — mixed
  { id: 23, width: 300, height: 250, label: "Ad" },
  { id: 24, width: 300, height: 250, label: "Ad" },
  { id: 25, width: 300, height: 250, label: "Ad" },
  { id: 26, width: 300, height: 250, label: "Ad" },
  // Row 9 — final leaderboard
  { id: 27, width: 728, height: 90, label: "Leaderboard Ad" },
  { id: 28, width: 728, height: 90, label: "Leaderboard Ad" },
];

export function EarnPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="bg-gradient-to-b from-emerald-950/40 to-transparent border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-xs font-bold tracking-widest uppercase">
              Live Ad Revenue
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
            Earn Right Now
          </h1>
          <p className="text-zinc-400 text-sm max-w-xl">
            Ad revenue supports this platform and pays you for your time. Sit
            at a coffee shop, browse ads, earn. Every interaction adds up. No
            experience or account required to start.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Top leaderboard ads */}
        <div className="flex flex-col gap-2 mb-6">
          {adSlots.slice(0, 2).map((slot) => (
            <AdSlot key={slot.id} {...slot} className="h-16 md:h-20" />
          ))}
        </div>

        {/* Main ad grid — medium rectangles */}
        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">
          Sponsored Content
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          {adSlots.slice(2, 6).map((slot) => (
            <AdSlot key={slot.id} {...slot} className="h-40 md:h-48" />
          ))}
        </div>

        {/* Mobile banner strip */}
        <div className="flex flex-col gap-1 mb-4">
          {adSlots.slice(6, 9).map((slot) => (
            <AdSlot key={slot.id} {...slot} className="h-10" />
          ))}
        </div>

        {/* More medium rectangles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          {adSlots.slice(9, 13).map((slot) => (
            <AdSlot key={slot.id} {...slot} className="h-40 md:h-48" />
          ))}
        </div>

        {/* Leaderboard */}
        <div className="mb-4">
          <AdSlot {...adSlots[13]} className="h-16 md:h-20" />
        </div>

        {/* Wide skyscraper layout */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <AdSlot {...adSlots[14]} className="h-48 col-span-1" />
          <div className="col-span-2 grid grid-rows-2 gap-2">
            <AdSlot {...adSlots[15]} className="h-24" />
            <AdSlot {...adSlots[16]} className="h-24" />
          </div>
          <AdSlot {...adSlots[17]} className="h-48 col-span-1" />
        </div>

        {/* Mobile banners */}
        <div className="grid grid-cols-2 gap-1 mb-4">
          {adSlots.slice(18, 22).map((slot) => (
            <AdSlot key={slot.id} {...slot} className="h-10" />
          ))}
        </div>

        {/* More rectangles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          {adSlots.slice(22, 26).map((slot) => (
            <AdSlot key={slot.id} {...slot} className="h-40 md:h-48" />
          ))}
        </div>

        {/* Final leaderboards */}
        <div className="flex flex-col gap-2 mb-10">
          {adSlots.slice(26).map((slot) => (
            <AdSlot key={slot.id} {...slot} className="h-16 md:h-20" />
          ))}
        </div>

        {/* Recycling Section */}
        <div className="border-t border-white/10 pt-10">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-white mb-1">
              Turn Trash Into Cash
            </h2>
            <p className="text-zinc-400 text-sm">
              Recyclable materials that pay real money. Find a local recycler
              near you and turn unwanted items into income.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recyclables.map(({ icon: Icon, name, value, tip, color, bg, links }) => (
              <div
                key={name}
                className="bg-zinc-900/60 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={18} className={color} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{name}</h3>
                    <span className={`text-sm font-mono font-bold ${color}`}>
                      {value}
                    </span>
                  </div>
                </div>
                <p className="text-zinc-500 text-xs mb-3">{tip}</p>
                <div className="flex flex-col gap-1">
                  {links.map(({ label, url }) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
                    >
                      <ExternalLink size={11} />
                      {label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
