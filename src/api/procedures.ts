import { db } from "@/api/db";
import { getAuth } from "@adaptive-ai/sdk/server";

export async function health() {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
    db: await db.$queryRaw`SELECT 1 as result`
      .then(() => "connected")
      .catch(() => "disconnected"),
  };
}

// ---- Gig Listings ----

export async function getGigs(isCareer?: boolean) {
  return await db.gigListing.findMany({
    where: isCareer !== undefined ? { isCareer } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { applications: true } },
    },
  });
}

export async function getGig(id: string) {
  return await db.gigListing.findUnique({
    where: { id },
    include: {
      _count: { select: { applications: true } },
    },
  });
}

export async function createGig(data: {
  title: string;
  category: string;
  payRate: string;
  location: string;
  description: string;
  posterName: string;
  posterEmail: string;
  isCareer?: boolean;
}) {
  return await db.gigListing.create({
    data: {
      title: data.title,
      category: data.category,
      payRate: data.payRate,
      location: data.location,
      description: data.description,
      posterName: data.posterName,
      posterEmail: data.posterEmail,
      isCareer: data.isCareer ?? false,
    },
  });
}

export async function applyToGig(gigId: string, message: string) {
  const auth = await getAuth({ required: true });
  const userId = auth.userId!;

  // Ensure user record exists
  await db.user.upsert({
    where: { id: userId },
    create: { id: userId },
    update: {},
  });

  // Check gig exists
  const gig = await db.gigListing.findUnique({ where: { id: gigId } });
  if (!gig) throw new Error("Gig not found");

  // Check if already applied
  const existing = await db.gigApplication.findFirst({
    where: { gigId, userId },
  });
  if (existing) throw new Error("You have already applied to this gig");

  return await db.gigApplication.create({
    data: {
      gigId,
      userId,
      message,
    },
  });
}

// ---- User Profile ----

export async function getMyProfile() {
  const auth = await getAuth({ required: true });
  const userId = auth.userId!;

  // Ensure user record exists
  await db.user.upsert({
    where: { id: userId },
    create: { id: userId },
    update: {},
  });

  const profile = await db.userProfile.findUnique({
    where: { userId },
  });

  const applications = await db.gigApplication.findMany({
    where: { userId },
    include: { gig: true },
    orderBy: { createdAt: "desc" },
  });

  return { profile, applications };
}

export async function upsertProfile(data: {
  bio?: string;
  skills?: string;
  workHistory?: string;
  phone?: string;
  location?: string;
}) {
  const auth = await getAuth({ required: true });
  const userId = auth.userId!;

  // Ensure user record exists
  await db.user.upsert({
    where: { id: userId },
    create: { id: userId },
    update: {},
  });

  return await db.userProfile.upsert({
    where: { userId },
    create: {
      userId,
      bio: data.bio ?? "",
      skills: data.skills ?? "",
      workHistory: data.workHistory ?? "",
      phone: data.phone ?? "",
      location: data.location ?? "",
    },
    update: {
      bio: data.bio ?? "",
      skills: data.skills ?? "",
      workHistory: data.workHistory ?? "",
      phone: data.phone ?? "",
      location: data.location ?? "",
    },
  });
}

// ---- Seed Data ----

export async function seedGigs() {
  const count = await db.gigListing.count();
  if (count > 0) return { seeded: false, message: "Already seeded" };

  const gigs = [
    // Landscaping
    {
      title: "Lawn Mowing & Yard Cleanup",
      category: "Landscaping",
      payRate: "$20–$35/hr",
      location: "Chicago, IL",
      description:
        "Weekly mowing, edging, and general yard cleanup for a residential property. Equipment provided. Looking for reliable help every Saturday morning.",
      posterName: "Maria G.",
      posterEmail: "maria@example.com",
      isCareer: false,
    },
    {
      title: "Spring Garden Planting",
      category: "Landscaping",
      payRate: "$18/hr",
      location: "Evanston, IL",
      description:
        "Help plant annuals and perennials in a large backyard garden. Roughly 6 hours of work. No experience required — just willing to dig!",
      posterName: "Tom B.",
      posterEmail: "tombrady@example.com",
      isCareer: false,
    },
    // Carpentry
    {
      title: "Fence Repair — 3 Panels",
      category: "Carpentry",
      payRate: "$150 flat",
      location: "Oak Park, IL",
      description:
        "Three wooden fence panels need to be replaced. Materials already purchased. Bring your own tools if possible. Half-day job.",
      posterName: "Dave K.",
      posterEmail: "davek@example.com",
      isCareer: false,
    },
    {
      title: "Deck Staining & Minor Repairs",
      category: "Carpentry",
      payRate: "$25/hr",
      location: "Naperville, IL",
      description:
        "Sand, stain, and seal a 400 sq ft deck. A few boards need replacing. Materials provided. Estimate 8–10 hours total.",
      posterName: "Susan L.",
      posterEmail: "susan.l@example.com",
      isCareer: false,
    },
    // Snow Removal
    {
      title: "Snow Removal — Recurring Winter Work",
      category: "Snow Removal",
      payRate: "$30–$50/visit",
      location: "Schaumburg, IL",
      description:
        "Shovel driveway and walkways after each snowfall. Text-based notification system. Reliable pay within 24 hours. Tools provided.",
      posterName: "Ray M.",
      posterEmail: "raym@example.com",
      isCareer: false,
    },
    // Courier
    {
      title: "Local Package Courier — Same Day",
      category: "Courier",
      payRate: "$18/hr + mileage",
      location: "Downtown Chicago, IL",
      description:
        "Pick up and deliver packages locally for a small business. Must have reliable transportation. Flexible hours, start ASAP.",
      posterName: "Logistics LLC",
      posterEmail: "dispatch@logisticsllc.example.com",
      isCareer: false,
    },
    {
      title: "Grocery & Errand Runner",
      category: "Courier",
      payRate: "$15/hr + tips",
      location: "Wicker Park, Chicago IL",
      description:
        "Run grocery and errand requests for elderly residents in the neighborhood. Flexible hours. Good tips from regulars.",
      posterName: "CareConnect",
      posterEmail: "care@careconnect.example.com",
      isCareer: false,
    },
    // Electronics Recycling
    {
      title: "Electronics Collection & Recycling Haul",
      category: "Electronics",
      payRate: "$22/hr + bonus per lb",
      location: "Chicago South Side",
      description:
        "Help collect old electronics (TVs, laptops, phones) from households and haul to certified e-waste recycler. Truck provided. Earn bonus per pound collected.",
      posterName: "GreenLoop Recycling",
      posterEmail: "hire@greenloop.example.com",
      isCareer: false,
    },
    {
      title: "Battery Sorting & Prep for Recycling",
      category: "Electronics",
      payRate: "$17/hr",
      location: "Cicero, IL",
      description:
        "Sort and prepare lithium-ion batteries for certified recycling facility. Short training provided. Looking for 3 part-time workers immediately.",
      posterName: "EcoBatt Inc.",
      posterEmail: "jobs@ecobatt.example.com",
      isCareer: false,
    },
    // Maintenance
    {
      title: "General Handyman — Apartment Complex",
      category: "Maintenance",
      payRate: "$20–$28/hr",
      location: "Logan Square, Chicago IL",
      description:
        "Light maintenance tasks: replacing light fixtures, fixing leaky faucets, patching drywall. On-call availability preferred.",
      posterName: "Riverdale Properties",
      posterEmail: "mgmt@riverdale.example.com",
      isCareer: false,
    },
    // Career listings
    {
      title: "Warehouse Operations Lead",
      category: "Warehouse",
      payRate: "$18–$22/hr",
      location: "Bedford Park, IL",
      description:
        "Oversee daily warehouse operations including receiving, stocking, and shipping. 2 years experience preferred. Full benefits. LACK will negotiate your offer.",
      posterName: "Midwest Logistics Co.",
      posterEmail: "hr@midwestlogistics.example.com",
      isCareer: true,
    },
    {
      title: "Customer Service Representative",
      category: "Customer Service",
      payRate: "$16–$20/hr",
      location: "Remote / Chicago, IL",
      description:
        "Handle inbound customer inquiries via phone and chat. Strong communication skills required. Full-time with benefits. LACK will negotiate your salary.",
      posterName: "TrustBridge Insurance",
      posterEmail: "hiring@trustbridge.example.com",
      isCareer: true,
    },
    {
      title: "Delivery Driver — Full Time",
      category: "Driving",
      payRate: "$19–$24/hr",
      location: "Chicago, IL",
      description:
        "Drive delivery routes for a regional distribution company. CDL not required. Paid training, health benefits, steady hours. LACK negotiates your starting rate.",
      posterName: "FastRoute Distribution",
      posterEmail: "jobs@fastroute.example.com",
      isCareer: true,
    },
    {
      title: "Building Maintenance Technician",
      category: "Maintenance",
      payRate: "$22–$30/hr",
      location: "Naperville, IL",
      description:
        "Full-time maintenance tech for commercial property management company. HVAC, plumbing, and electrical basics preferred. Benefits + overtime available.",
      posterName: "PinnacleProp Management",
      posterEmail: "hr@pinnacleprop.example.com",
      isCareer: true,
    },
  ];

  await db.gigListing.createMany({ data: gigs });

  return { seeded: true, count: gigs.length };
}
