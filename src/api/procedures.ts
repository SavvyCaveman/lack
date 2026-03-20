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

// ---- Housing Listings ----

export async function getHousingListings(
  type?: string,
  maxPrice?: number,
  minBedrooms?: number,
) {
  return await db.housingListing.findMany({
    where: {
      ...(type ? { type } : {}),
      ...(maxPrice !== undefined ? { price: { lte: maxPrice } } : {}),
      ...(minBedrooms !== undefined ? { bedrooms: { gte: minBedrooms } } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createHousingListing(data: {
  type: string;
  propertyType: string;
  price: number;
  address: string;
  neighborhood?: string;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  description: string;
  utilitiesIncl?: boolean;
  petFriendly?: boolean;
  parking?: boolean;
  contactName: string;
  contactEmail: string;
}) {
  return await db.housingListing.create({
    data: {
      type: data.type,
      propertyType: data.propertyType,
      price: data.price,
      address: data.address,
      neighborhood: data.neighborhood ?? "",
      bedrooms: data.bedrooms ?? 0,
      bathrooms: data.bathrooms ?? 1,
      sqft: data.sqft ?? 0,
      description: data.description,
      utilitiesIncl: data.utilitiesIncl ?? false,
      petFriendly: data.petFriendly ?? false,
      parking: data.parking ?? false,
      contactName: data.contactName,
      contactEmail: data.contactEmail,
    },
  });
}

// ---- Restoration Projects ----

export async function getRestorationProjects() {
  return await db.restorationProject.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      champion: { select: { id: true, name: true, handle: true } },
      _count: { select: { laborPledges: true, updates: true } },
    },
  });
}

export async function getRestorationProject(id: string) {
  return await db.restorationProject.findUnique({
    where: { id },
    include: {
      champion: { select: { id: true, name: true, handle: true } },
      updates: { orderBy: { createdAt: "desc" } },
      laborPledges: {
        include: { user: { select: { id: true, name: true, handle: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function createRestorationProject(data: {
  address: string;
  city: string;
  status: string;
  proposedUse: string;
  estimatedCost: number;
  fundingGoal: number;
  description: string;
}) {
  const auth = await getAuth({ required: true });
  const userId = auth.userId!;

  await db.user.upsert({
    where: { id: userId },
    create: { id: userId },
    update: {},
  });

  return await db.restorationProject.create({
    data: {
      address: data.address,
      city: data.city,
      status: data.status,
      proposedUse: data.proposedUse,
      estimatedCost: data.estimatedCost,
      fundingGoal: data.fundingGoal,
      description: data.description,
      championId: userId,
    },
  });
}

export async function pledgeLabor(
  projectId: string,
  skill: string,
  hours: number,
) {
  const auth = await getAuth({ required: true });
  const userId = auth.userId!;

  await db.user.upsert({
    where: { id: userId },
    create: { id: userId },
    update: {},
  });

  const project = await db.restorationProject.findUnique({
    where: { id: projectId },
  });
  if (!project) throw new Error("Project not found");

  const existing = await db.laborPledge.findFirst({
    where: { projectId, userId },
  });
  if (existing) throw new Error("You have already pledged labor to this project");

  return await db.laborPledge.create({
    data: { projectId, userId, skill, hours },
  });
}

export async function addRestorationUpdate(projectId: string, content: string) {
  const auth = await getAuth({ required: true });
  const userId = auth.userId!;

  const project = await db.restorationProject.findUnique({
    where: { id: projectId },
  });
  if (!project) throw new Error("Project not found");
  if (project.championId !== userId)
    throw new Error("Only the champion can post updates");

  return await db.restorationUpdate.create({
    data: { projectId, content },
  });
}

export async function seedHousing() {
  const housingCount = await db.housingListing.count();
  const restorationCount = await db.restorationProject.count();

  if (housingCount > 0 && restorationCount > 0) {
    return { seeded: false, message: "Already seeded" };
  }

  if (housingCount === 0) {
    const listings = [
      {
        type: "rent",
        propertyType: "apartment",
        price: 950,
        address: "2401 N Milwaukee Ave, Chicago, IL",
        neighborhood: "Logan Square",
        bedrooms: 2,
        bathrooms: 1,
        sqft: 850,
        description:
          "Bright 2BR in the heart of Logan Square. Hardwood floors, updated kitchen, coin laundry in building. No broker fee. 12-month lease.",
        utilitiesIncl: false,
        petFriendly: true,
        parking: false,
        contactName: "Carlos M.",
        contactEmail: "carlos.m@example.com",
      },
      {
        type: "rent",
        propertyType: "room",
        price: 550,
        address: "1834 W Division St, Chicago, IL",
        neighborhood: "Wicker Park",
        bedrooms: 1,
        bathrooms: 1,
        sqft: 200,
        description:
          "Private room in a 4BR shared house. Quiet housemates, fast WiFi included, shared kitchen. Month-to-month OK. Great transit access.",
        utilitiesIncl: true,
        petFriendly: false,
        parking: false,
        contactName: "Priya S.",
        contactEmail: "priya.s@example.com",
      },
      {
        type: "rent",
        propertyType: "house",
        price: 1800,
        address: "3312 S Halsted St, Chicago, IL",
        neighborhood: "Bridgeport",
        bedrooms: 3,
        bathrooms: 2,
        sqft: 1400,
        description:
          "Full 3BR/2BA bungalow. Private yard, garage parking, updated appliances. Utilities not included. Great schools nearby. Available now.",
        utilitiesIncl: false,
        petFriendly: true,
        parking: true,
        contactName: "Tony R.",
        contactEmail: "tony.r@example.com",
      },
      {
        type: "sale",
        propertyType: "house",
        price: 189000,
        address: "4521 W Chicago Ave, Chicago, IL",
        neighborhood: "Humboldt Park",
        bedrooms: 3,
        bathrooms: 1,
        sqft: 1200,
        description:
          "Solid brick 3BR bungalow, needs some TLC but strong bones. New roof 2022. Great investment or first home. LACK fee: 3% at closing.",
        utilitiesIncl: false,
        petFriendly: false,
        parking: true,
        contactName: "Marcus J.",
        contactEmail: "marcus.j@example.com",
      },
      {
        type: "rent",
        propertyType: "apartment",
        price: 750,
        address: "6714 S Cottage Grove Ave, Chicago, IL",
        neighborhood: "Woodlawn",
        bedrooms: 1,
        bathrooms: 1,
        sqft: 650,
        description:
          "Clean 1BR on the South Side. Heat included, close to the Green Line. No security deposit for qualified applicants. Move-in ready.",
        utilitiesIncl: true,
        petFriendly: false,
        parking: false,
        contactName: "Denise W.",
        contactEmail: "denise.w@example.com",
      },
      {
        type: "sale",
        propertyType: "commercial",
        price: 275000,
        address: "1109 W 18th St, Chicago, IL",
        neighborhood: "Pilsen",
        bedrooms: 0,
        bathrooms: 1,
        sqft: 2200,
        description:
          "Former storefront/community space in Pilsen. High foot traffic, open floor plan, full basement. Zoned B1-2. LACK fee: 3% at closing.",
        utilitiesIncl: false,
        petFriendly: false,
        parking: false,
        contactName: "Elena V.",
        contactEmail: "elena.v@example.com",
      },
      {
        type: "rent",
        propertyType: "apartment",
        price: 1100,
        address: "918 E 63rd St, Chicago, IL",
        neighborhood: "Woodlawn",
        bedrooms: 2,
        bathrooms: 1,
        sqft: 900,
        description:
          "Newly renovated 2BR near U of C. Stainless appliances, in-unit laundry, secure entry. Landlord pays water. No surprise fees.",
        utilitiesIncl: false,
        petFriendly: false,
        parking: true,
        contactName: "Gerald P.",
        contactEmail: "gerald.p@example.com",
      },
    ];

    await db.housingListing.createMany({ data: listings });
  }

  if (restorationCount === 0) {
    // Need a system user for champion
    let systemUser = await db.user.findFirst({ where: { id: "system-seed" } });
    if (!systemUser) {
      systemUser = await db.user.create({
        data: { id: "system-seed", name: "LACK Community" },
      });
    }

    const projects = [
      {
        address: "3847 W Ogden Ave",
        city: "Chicago, IL",
        status: "abandoned",
        proposedUse: "housing",
        estimatedCost: 85000,
        fundingGoal: 60000,
        amountRaised: 12500,
        backerCount: 34,
        championId: "system-seed",
        description:
          "Two-flat that has been vacant for 6 years after the previous owner passed. Structurally sound per city inspection. Community wants to restore it into two affordable rental units for local families. Local carpenter and electrician have already volunteered 40 hours each.",
      },
      {
        address: "1122 S Pulaski Rd",
        city: "Chicago, IL",
        status: "foreclosed",
        proposedUse: "community",
        estimatedCost: 120000,
        fundingGoal: 95000,
        amountRaised: 31000,
        backerCount: 87,
        championId: "system-seed",
        description:
          "Former church community hall, bank-foreclosed in 2021. High ceilings, large open floor plan, commercial kitchen still intact. Vision: restore as a food pantry, job training center, and after-school program space. City has expressed interest in partnership.",
      },
      {
        address: "5509 W Madison St",
        city: "Chicago, IL",
        status: "tax_lien",
        proposedUse: "mixed",
        estimatedCost: 65000,
        fundingGoal: 50000,
        amountRaised: 8200,
        backerCount: 22,
        championId: "system-seed",
        description:
          "Single-family home with unpaid tax lien — owner willing to deed to a community land trust if back taxes are covered (~$9,000) and home is restored. Goal: create permanent affordable housing on the ground floor with a small community meeting room. Land trust structure prevents future speculation.",
      },
    ];

    for (const project of projects) {
      const created = await db.restorationProject.create({ data: project });
      // Add a sample update for each
      await db.restorationUpdate.create({
        data: {
          projectId: created.id,
          content:
            "Project championed and listed on LACK. Share this page to help us reach our funding goal!",
        },
      });
    }
  }

  return { seeded: true };
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
