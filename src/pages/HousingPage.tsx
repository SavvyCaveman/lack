import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/client";
import { Link, useNavigate } from "react-router-dom";
import {
  Home,
  Building2,
  BedDouble,
  Bath,
  Square,
  Car,
  PawPrint,
  Zap,
  ChevronDown,
  ChevronUp,
  X,
  AlertTriangle,
  CheckCircle2,
  Info,
  ExternalLink,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { openChatWithUser } from "@/lib/chat";

// ── Types ──────────────────────────────────────────────────────────────────────

type HousingListing = {
  id: string;
  type: string;
  propertyType: string;
  price: number;
  address: string;
  neighborhood: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  description: string;
  utilitiesIncl: boolean;
  petFriendly: boolean;
  parking: boolean;
  contactName: string;
  contactEmail: string;
  createdAt: Date;
};

// ── Post Listing Modal ─────────────────────────────────────────────────────────

function PostListingModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    type: "rent",
    propertyType: "apartment",
    price: "",
    address: "",
    neighborhood: "",
    bedrooms: "1",
    bathrooms: "1",
    sqft: "",
    description: "",
    utilitiesIncl: false,
    petFriendly: false,
    parking: false,
    contactName: "",
    contactEmail: "",
  });

  const mutation = useMutation({
    mutationFn: () =>
      client.createHousingListing({
        type: form.type,
        propertyType: form.propertyType,
        price: parseFloat(form.price),
        address: form.address,
        neighborhood: form.neighborhood,
        bedrooms: parseInt(form.bedrooms),
        bathrooms: parseFloat(form.bathrooms),
        sqft: parseInt(form.sqft) || 0,
        description: form.description,
        utilitiesIncl: form.utilitiesIncl,
        petFriendly: form.petFriendly,
        parking: form.parking,
        contactName: form.contactName,
        contactEmail: form.contactEmail,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["housing"] });
      onClose();
    },
  });

  const set = (k: string, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-white/10 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-zinc-900 flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-white font-bold text-lg">Post a Listing</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-zinc-400 text-xs mb-1 block">Type</label>
              <select
                value={form.type}
                onChange={(e) => set("type", e.target.value)}
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="rent">For Rent</option>
                <option value="sale">For Sale</option>
              </select>
            </div>
            <div>
              <label className="text-zinc-400 text-xs mb-1 block">
                Property Type
              </label>
              <select
                value={form.propertyType}
                onChange={(e) => set("propertyType", e.target.value)}
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="room">Room</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-zinc-400 text-xs mb-1 block">
                {form.type === "rent" ? "Monthly Rent ($)" : "Sale Price ($)"}
              </label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                placeholder={form.type === "rent" ? "950" : "185000"}
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-500"
              />
            </div>
            <div>
              <label className="text-zinc-400 text-xs mb-1 block">
                Sq Ft (optional)
              </label>
              <input
                type="number"
                value={form.sqft}
                onChange={(e) => set("sqft", e.target.value)}
                placeholder="850"
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-500"
              />
            </div>
          </div>

          <div>
            <label className="text-zinc-400 text-xs mb-1 block">Address</label>
            <input
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="123 Main St, Chicago, IL"
              className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-zinc-400 text-xs mb-1 block">
                Neighborhood
              </label>
              <input
                value={form.neighborhood}
                onChange={(e) => set("neighborhood", e.target.value)}
                placeholder="Logan Square"
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-500"
              />
            </div>
            <div>
              <label className="text-zinc-400 text-xs mb-1 block">
                Bedrooms
              </label>
              <select
                value={form.bedrooms}
                onChange={(e) => set("bedrooms", e.target.value)}
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              >
                {["0", "1", "2", "3", "4", "5+"].map((n) => (
                  <option key={n} value={n}>
                    {n === "0" ? "Studio" : `${n} BR`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-zinc-400 text-xs mb-1 block">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              placeholder="Describe the property, terms, and any other important details..."
              className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-500 resize-none"
            />
          </div>

          <div className="flex gap-4">
            {[
              { key: "utilitiesIncl", label: "Utilities Included" },
              { key: "petFriendly", label: "Pet Friendly" },
              { key: "parking", label: "Parking Included" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form[key as keyof typeof form] as boolean}
                  onChange={(e) => set(key, e.target.checked)}
                  className="accent-amber-400"
                />
                <span className="text-zinc-300 text-sm">{label}</span>
              </label>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-zinc-400 text-xs mb-1 block">
                Your Name
              </label>
              <input
                value={form.contactName}
                onChange={(e) => set("contactName", e.target.value)}
                placeholder="Jane D."
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-500"
              />
            </div>
            <div>
              <label className="text-zinc-400 text-xs mb-1 block">
                Your Email
              </label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) => set("contactEmail", e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-500"
              />
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-amber-300 text-xs">
            <strong>LACK Fee:</strong> 3% transaction fee at time of closing/lease
            signing — lower than traditional realtors. No hidden costs.
          </div>

          {mutation.error && (
            <p className="text-red-400 text-sm">{String(mutation.error)}</p>
          )}

          <button
            onClick={() => mutation.mutate()}
            disabled={
              mutation.isPending ||
              !form.price ||
              !form.address ||
              !form.contactName ||
              !form.contactEmail
            }
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold py-2.5 rounded-lg transition-colors"
          >
            {mutation.isPending ? "Posting…" : "Post Listing"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Property Card ──────────────────────────────────────────────────────────────

function PropertyCard({ listing }: { listing: HousingListing }) {
  const [showContact, setShowContact] = useState(false);
  const formatPrice = (p: number, type: string) =>
    type === "rent"
      ? `$${p.toLocaleString()}/mo`
      : `$${p.toLocaleString()}`;

  const typeColors: Record<string, string> = {
    apartment: "bg-blue-500/20 text-blue-400",
    house: "bg-amber-500/20 text-amber-400",
    room: "bg-purple-500/20 text-purple-400",
    commercial: "bg-zinc-500/20 text-zinc-400",
  };

  return (
    <div className="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden hover:border-amber-500/40 transition-colors">
      {/* Photo placeholder */}
      <div className="h-40 bg-zinc-800 flex items-center justify-center">
        <Home size={40} className="text-zinc-600" />
      </div>

      <div className="p-4 space-y-3">
        {/* Price + badges */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-amber-400 font-black text-xl">
              {formatPrice(listing.price, listing.type)}
            </p>
            <p className="text-zinc-400 text-xs mt-0.5">{listing.address}</p>
            {listing.neighborhood && (
              <p className="text-zinc-500 text-xs">{listing.neighborhood}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[listing.propertyType] ?? "bg-zinc-500/20 text-zinc-400"}`}
            >
              {listing.propertyType}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${listing.type === "rent" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}
            >
              {listing.type === "rent" ? "For Rent" : "For Sale"}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-zinc-400 text-xs">
          {listing.bedrooms > 0 && (
            <span className="flex items-center gap-1">
              <BedDouble size={12} />
              {listing.bedrooms} BR
            </span>
          )}
          <span className="flex items-center gap-1">
            <Bath size={12} />
            {listing.bathrooms} BA
          </span>
          {listing.sqft > 0 && (
            <span className="flex items-center gap-1">
              <Square size={12} />
              {listing.sqft.toLocaleString()} sqft
            </span>
          )}
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-1.5">
          {listing.utilitiesIncl && (
            <span className="flex items-center gap-1 text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">
              <Zap size={10} /> Utilities Incl.
            </span>
          )}
          {listing.petFriendly && (
            <span className="flex items-center gap-1 text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">
              <PawPrint size={10} /> Pets OK
            </span>
          )}
          {listing.parking && (
            <span className="flex items-center gap-1 text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">
              <Car size={10} /> Parking
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-zinc-400 text-xs line-clamp-2">{listing.description}</p>

        {/* LACK fee + Contact */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-zinc-500">
            3% LACK fee · No hidden costs
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={() => openChatWithUser(listing.contactEmail, listing.contactName)}
              className="border border-white/10 text-zinc-400 hover:text-white text-xs px-2 py-1.5 rounded-lg transition-colors flex items-center gap-1"
              title="Message poster"
            >
              <MessageCircle size={12} />
            </button>
            <button
              onClick={() => setShowContact(!showContact)}
              className="bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
            >
              Contact
            </button>
          </div>
        </div>

        {showContact && (
          <div className="bg-zinc-800 rounded-lg p-3 text-sm">
            <p className="text-white font-medium">{listing.contactName}</p>
            <a
              href={`mailto:${listing.contactEmail}`}
              className="text-amber-400 hover:underline text-xs"
            >
              {listing.contactEmail}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Transparency Tools ─────────────────────────────────────────────────────────

const transparencyData = [
  {
    id: "tenant-rights",
    icon: CheckCircle2,
    color: "emerald",
    title: "Tenant Rights — What You're Entitled To",
    content: (
      <div className="space-y-2 text-zinc-300 text-sm">
        <p className="text-zinc-400 text-xs italic mb-3">
          General information only — not legal advice. Laws vary by state and city.
        </p>
        {[
          [
            "Right to a Habitable Home",
            "Your landlord must maintain heat, water, plumbing, and structural safety.",
          ],
          [
            "Right to Privacy",
            "Landlords must give advance notice (usually 24–48 hrs) before entering, except in emergencies.",
          ],
          [
            "Security Deposit Limits",
            "Many states cap deposits at 1–2 months' rent and require itemized deductions within a deadline.",
          ],
          [
            "Protection from Retaliation",
            "A landlord cannot evict you for reporting code violations or organizing with other tenants.",
          ],
          [
            "Right to a Written Lease",
            "You're entitled to a written copy of your lease. Keep it. Take photos of move-in condition.",
          ],
          [
            "Eviction Process",
            "Landlords cannot remove you without a court order. Self-help evictions (changing locks, removing belongings) are illegal.",
          ],
        ].map(([title, desc]) => (
          <div key={title as string} className="flex gap-2">
            <CheckCircle2
              size={14}
              className="text-emerald-400 mt-0.5 shrink-0"
            />
            <div>
              <span className="text-white font-medium">{title}: </span>
              <span>{desc}</span>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "red-flags",
    icon: AlertTriangle,
    color: "red",
    title: "Red Flag Lease Clauses — Watch Out For These",
    content: (
      <div className="space-y-2 text-zinc-300 text-sm">
        <p className="text-zinc-400 text-xs italic mb-3">
          If you see these in a lease, ask questions before signing.
        </p>
        {[
          [
            '"Waiver of right to sue"',
            "You agree not to take legal action against the landlord. This is often unenforceable but still a red flag.",
          ],
          [
            '"Automatic renewal without notice"',
            "Your lease auto-renews unless you give notice months in advance — often buried in fine print.",
          ],
          [
            '"Landlord may enter at any time"',
            "Legal entry requires proper notice except in emergencies. This clause may violate your state's law.",
          ],
          [
            '"Tenant responsible for all repairs"',
            "Landlords are legally required to maintain habitability. This clause doesn't override the law.",
          ],
          [
            '"No subletting under any circumstances"',
            "May be legal, but can trap you if you need to move. Negotiate flexibility.",
          ],
          [
            "Vague late fees or undefined charges",
            "If fees aren't specific (amount, when triggered), they can be used against you arbitrarily.",
          ],
          [
            "Utilities billed at \"landlord discretion\"",
            "Should be a fixed split or metered separately — not subject to landlord's whim.",
          ],
        ].map(([flag, desc]) => (
          <div key={flag as string} className="flex gap-2">
            <AlertTriangle
              size={14}
              className="text-red-400 mt-0.5 shrink-0"
            />
            <div>
              <span className="text-red-300 font-medium">{flag}: </span>
              <span>{desc}</span>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "fair-market-rent",
    icon: Info,
    color: "blue",
    title: "Fair Market Rent Guide",
    content: (
      <div className="space-y-3 text-sm">
        <p className="text-zinc-400 text-xs italic">
          National median estimates — actual prices vary significantly by city
          and neighborhood. Always compare to local listings.
        </p>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-zinc-400 text-xs border-b border-white/10">
              <th className="text-left pb-2">Bedroom Count</th>
              <th className="text-right pb-2">National Median</th>
              <th className="text-right pb-2">Urban Average</th>
            </tr>
          </thead>
          <tbody className="text-zinc-300">
            {[
              ["Studio / 0BR", "$1,050", "$1,400–$2,200"],
              ["1 Bedroom", "$1,250", "$1,600–$2,600"],
              ["2 Bedrooms", "$1,550", "$2,000–$3,400"],
              ["3 Bedrooms", "$1,950", "$2,600–$4,500"],
              ["4+ Bedrooms", "$2,400+", "$3,200+"],
            ].map(([bd, med, urban]) => (
              <tr key={bd as string} className="border-b border-white/5">
                <td className="py-2">{bd}</td>
                <td className="text-right text-amber-400 font-medium">{med}</td>
                <td className="text-right text-zinc-400 text-xs">{urban}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-zinc-500 text-xs">
          Source: HUD Fair Market Rents data (general reference). Check{" "}
          <a
            href="https://www.huduser.gov/portal/datasets/fmr.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline inline-flex items-center gap-1"
          >
            HUD FMR <ExternalLink size={10} />
          </a>{" "}
          for your specific area.
        </p>
      </div>
    ),
  },
  {
    id: "landlord-checklist",
    icon: Building2,
    color: "amber",
    title: "Landlord Transparency Checklist — What Good Landlords Disclose",
    content: (
      <div className="space-y-2 text-zinc-300 text-sm">
        <p className="text-zinc-400 text-xs italic mb-3">
          A trustworthy landlord will disclose all of these upfront. Ask for
          anything not offered.
        </p>
        {[
          [
            "Lead Paint Disclosure",
            "Required by federal law for homes built before 1978.",
          ],
          [
            "Mold History",
            "Any past mold issues, water intrusion, or remediation work done.",
          ],
          [
            "Average Monthly Utilities",
            "Gas, electric, water — you deserve realistic cost estimates before signing.",
          ],
          [
            "Lease Break Terms",
            "What happens if you need to leave early? Penalty amount, subletting rights, buyout options.",
          ],
          [
            "HOA Rules (if applicable)",
            "Any restrictions on noise, guests, parking, or alterations to the unit.",
          ],
          [
            "Pest History",
            "Prior infestations, treatments, and whether the building has an ongoing pest control contract.",
          ],
          [
            "Move-In/Out Inspection",
            "Good landlords do a documented walk-through with photos before and after tenancy.",
          ],
          [
            "Security Deposit Terms",
            "Exact conditions for full return, itemized deduction process, and legal deadline.",
          ],
        ].map(([item, desc]) => (
          <div key={item as string} className="flex gap-2">
            <CheckCircle2
              size={14}
              className="text-amber-400 mt-0.5 shrink-0"
            />
            <div>
              <span className="text-white font-medium">{item}: </span>
              <span>{desc}</span>
            </div>
          </div>
        ))}
      </div>
    ),
  },
];

function TransparencyTools() {
  const [open, setOpen] = useState<string | null>("tenant-rights");

  return (
    <div className="space-y-3">
      {transparencyData.map(({ id, icon: Icon, title, content }) => (
        <div
          key={id}
          className="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden"
        >
          <button
            onClick={() => setOpen(open === id ? null : id)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Icon size={18} className="text-amber-400" />
              <span className="text-white font-medium text-sm">{title}</span>
            </div>
            {open === id ? (
              <ChevronUp size={16} className="text-zinc-400 shrink-0" />
            ) : (
              <ChevronDown size={16} className="text-zinc-400 shrink-0" />
            )}
          </button>
          {open === id && (
            <div className="px-4 pb-4 border-t border-white/10 pt-4">
              {content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main Housing Page ──────────────────────────────────────────────────────────

export function HousingPage() {
  const [tab, setTab] = useState<"listings" | "tools">("listings");
  const [typeFilter, setTypeFilter] = useState<"all" | "rent" | "sale">("all");
  const [bedroomsFilter, setBedroomsFilter] = useState<number | undefined>(
    undefined,
  );
  const [showPostModal, setShowPostModal] = useState(false);
  const navigate = useNavigate();

  const { data: verifications } = useQuery({
    queryKey: ["myVerifications"],
    queryFn: () => client.getMyVerifications(),
    retry: false,
  });

  const verifiedMethods = new Set((verifications ?? []).filter((v) => v.verified).map((v) => v.method));
  let trustScore = 0;
  if (verifiedMethods.has("email")) trustScore += 15;
  if (verifiedMethods.has("phone")) trustScore += 20;
  if (verifiedMethods.has("biometric")) trustScore += 20;
  if (verifiedMethods.has("community")) trustScore += 15;
  const socialCount = ["google", "meta", "twitter", "linkedin", "indeed"].filter((m) => verifiedMethods.has(m)).length;
  trustScore += Math.min(socialCount, 3) * 10;
  const showIncentiveBanner = trustScore < 40;

  const { data: listings, isLoading } = useQuery({
    queryKey: ["housing", typeFilter, bedroomsFilter],
    queryFn: () =>
      client.getHousingListings(
        typeFilter === "all" ? undefined : typeFilter,
        undefined,
        bedroomsFilter,
      ),
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <Home size={20} className="text-amber-400" />
          </div>
          <div>
            <h1 className="text-white font-black text-2xl">
              Housing & Real Estate
            </h1>
            <p className="text-zinc-400 text-sm">
              Rentals, sales, and community restoration — transparent fees,
              no surprises
            </p>
          </div>
        </div>

        {/* LACK fee banner */}
        <div className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-amber-300 font-bold text-sm">
              LACK charges a flat 3% transaction fee — lower than traditional
              realtors.
            </p>
            <p className="text-zinc-400 text-xs mt-0.5">
              All fees disclosed upfront. No broker surprises.
            </p>
          </div>
          <Link
            to="/housing/restore"
            className="bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
          >
            Community Restoration Hub →
          </Link>
        </div>
      </div>

      {/* Incentive banner */}
      {showIncentiveBanner && tab === "listings" && (
        <div className="mb-5 flex items-center justify-between gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-400 flex-shrink-0" />
            <span className="text-zinc-300 text-xs">
              <span className="text-emerald-400 font-bold">Boost your profile</span> — verified users get 3× more responses from landlords.
            </span>
          </div>
          <button
            onClick={() => navigate("/profile")}
            className="text-emerald-400 text-xs font-bold hover:underline whitespace-nowrap flex-shrink-0"
          >
            Complete verification →
          </button>
        </div>
      )}

      {/* Tab bar */}
      <div className="flex gap-2 mb-6 border-b border-white/10 pb-0">
        {(["listings", "tools"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            {t === "listings" ? "Listings" : "Transparency Tools"}
          </button>
        ))}
      </div>

      {tab === "listings" && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex gap-1 bg-zinc-900 border border-white/10 rounded-lg p-1">
              {(["all", "rent", "sale"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setTypeFilter(f)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    typeFilter === f
                      ? "bg-amber-500 text-black"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {f === "all" ? "All" : f === "rent" ? "For Rent" : "For Sale"}
                </button>
              ))}
            </div>

            <select
              value={bedroomsFilter ?? ""}
              onChange={(e) =>
                setBedroomsFilter(
                  e.target.value === "" ? undefined : parseInt(e.target.value),
                )
              }
              className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-zinc-300"
            >
              <option value="">Any Bedrooms</option>
              <option value="1">1+ BR</option>
              <option value="2">2+ BR</option>
              <option value="3">3+ BR</option>
            </select>

            <button
              onClick={() => setShowPostModal(true)}
              className="ml-auto bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold px-4 py-2 rounded-lg transition-colors"
            >
              + Post a Listing
            </button>
          </div>

          {/* Listings grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-zinc-900 border border-white/10 rounded-xl h-64 animate-pulse"
                />
              ))}
            </div>
          ) : listings && listings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map((listing) => (
                <PropertyCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-zinc-500">
              <Home size={40} className="mx-auto mb-3 opacity-30" />
              <p>No listings found. Be the first to post!</p>
            </div>
          )}
        </>
      )}

      {tab === "tools" && <TransparencyTools />}

      {showPostModal && (
        <PostListingModal onClose={() => setShowPostModal(false)} />
      )}
    </div>
  );
}
