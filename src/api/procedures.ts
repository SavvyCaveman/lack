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

// ---- Ratings ----

export async function rateUser(
  toUserId: string,
  score: number,
  comment: string,
  gigId?: string,
) {
  const auth = await getAuth({ required: true });
  const userId = auth.userId!;

  if (userId === toUserId) throw new Error("You cannot rate yourself");
  if (score < 1 || score > 5) throw new Error("Score must be between 1 and 5");

  await db.user.upsert({
    where: { id: userId },
    create: { id: userId },
    update: {},
  });

  // Ensure target user exists
  const target = await db.user.findUnique({ where: { id: toUserId } });
  if (!target) throw new Error("User not found");

  return await db.rating.create({
    data: { fromUserId: userId, toUserId, score, comment, gigId },
  });
}

export async function getUserRatings(userId: string) {
  const ratings = await db.rating.findMany({
    where: { toUserId: userId },
    include: {
      fromUser: { select: { id: true, name: true, handle: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const avg =
    ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
      : null;

  return { ratings, average: avg, count: ratings.length };
}

// ---- Report & Block ----

export async function reportUser(targetUserId: string, reason: string) {
  const auth = await getAuth({ required: true });
  const userId = auth.userId!;

  await db.user.upsert({
    where: { id: userId },
    create: { id: userId },
    update: {},
  });

  return await db.report.create({
    data: { reporterId: userId, targetUserId, reason },
  });
}

export async function reportListing(targetListingId: string, reason: string) {
  const auth = await getAuth({ required: true });
  const userId = auth.userId!;

  await db.user.upsert({
    where: { id: userId },
    create: { id: userId },
    update: {},
  });

  return await db.report.create({
    data: { reporterId: userId, targetListingId, reason },
  });
}

export async function blockUser(blockedId: string) {
  const auth = await getAuth({ required: true });
  const userId = auth.userId!;

  if (userId === blockedId) throw new Error("You cannot block yourself");

  await db.user.upsert({
    where: { id: userId },
    create: { id: userId },
    update: {},
  });

  const existing = await db.block.findFirst({
    where: { blockerId: userId, blockedId },
  });
  if (existing) return existing;

  return await db.block.create({
    data: { blockerId: userId, blockedId },
  });
}

export async function getBlockedUsers() {
  const auth = await getAuth({ required: true });
  const userId = auth.userId!;

  const blocks = await db.block.findMany({
    where: { blockerId: userId },
    select: { blockedId: true },
  });

  return blocks.map((b) => b.blockedId);
}

// ---- Messaging ----

export async function getOrCreateConversation(otherUserId: string) {
  const auth = await getAuth({ required: true });
  const userId = auth.userId!;

  if (userId === otherUserId) throw new Error("Cannot message yourself");

  await db.user.upsert({
    where: { id: userId },
    create: { id: userId },
    update: {},
  });

  // Ensure other user exists (create stub if needed)
  await db.user.upsert({
    where: { id: otherUserId },
    create: { id: otherUserId },
    update: {},
  });

  // Check both orderings
  const existing = await db.conversation.findFirst({
    where: {
      OR: [
        { participant1: userId, participant2: otherUserId },
        { participant1: otherUserId, participant2: userId },
      ],
    },
    include: {
      user1: { select: { id: true, name: true, handle: true, image: true } },
      user2: { select: { id: true, name: true, handle: true, image: true } },
    },
  });

  if (existing) return existing;

  return await db.conversation.create({
    data: { participant1: userId, participant2: otherUserId },
    include: {
      user1: { select: { id: true, name: true, handle: true, image: true } },
      user2: { select: { id: true, name: true, handle: true, image: true } },
    },
  });
}

export async function getConversations() {
  const auth = await getAuth({ required: true });
  const userId = auth.userId!;

  await db.user.upsert({
    where: { id: userId },
    create: { id: userId },
    update: {},
  });

  const convos = await db.conversation.findMany({
    where: {
      OR: [{ participant1: userId }, { participant2: userId }],
    },
    include: {
      user1: { select: { id: true, name: true, handle: true, image: true } },
      user2: { select: { id: true, name: true, handle: true, image: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return convos.map((c) => {
    const otherUser = c.participant1 === userId ? c.user2 : c.user1;
    const lastMessage = c.messages[0] ?? null;
    const unreadCount = 0; // Simplified - real count done in getUnreadCount
    return {
      id: c.id,
      otherUser,
      lastMessage,
      unreadCount,
      updatedAt: c.updatedAt,
    };
  });
}

export async function getMessages(conversationId: string) {
  const auth = await getAuth({ required: true });
  const userId = auth.userId!;

  const convo = await db.conversation.findUnique({
    where: { id: conversationId },
  });
  if (!convo) throw new Error("Conversation not found");
  if (convo.participant1 !== userId && convo.participant2 !== userId) {
    throw new Error("Not authorized");
  }

  return await db.message.findMany({
    where: { conversationId },
    include: {
      sender: { select: { id: true, name: true, handle: true, image: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function sendMessage(conversationId: string, content: string) {
  const auth = await getAuth({ required: true });
  const userId = auth.userId!;

  const convo = await db.conversation.findUnique({
    where: { id: conversationId },
  });
  if (!convo) throw new Error("Conversation not found");
  if (convo.participant1 !== userId && convo.participant2 !== userId) {
    throw new Error("Not authorized");
  }

  const msg = await db.message.create({
    data: { conversationId, senderId: userId, content },
    include: {
      sender: { select: { id: true, name: true, handle: true, image: true } },
    },
  });

  // Update conversation updatedAt
  await db.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  return msg;
}

export async function markMessagesRead(conversationId: string) {
  const auth = await getAuth({ required: true });
  const userId = auth.userId!;

  await db.message.updateMany({
    where: {
      conversationId,
      senderId: { not: userId },
      read: false,
    },
    data: { read: true },
  });

  return { success: true };
}

export async function getUnreadCount() {
  const auth = await getAuth({ required: true });
  const userId = auth.userId!;

  await db.user.upsert({
    where: { id: userId },
    create: { id: userId },
    update: {},
  });

  // Get all conversations the user is part of
  const convos = await db.conversation.findMany({
    where: {
      OR: [{ participant1: userId }, { participant2: userId }],
    },
    select: { id: true },
  });

  const convoIds = convos.map((c) => c.id);
  if (convoIds.length === 0) return { count: 0 };

  const count = await db.message.count({
    where: {
      conversationId: { in: convoIds },
      senderId: { not: userId },
      read: false,
    },
  });

  return { count };
}

// ---- Verification ----

export async function getMyVerifications() {
  const auth = await getAuth({ required: true });
  const userId = auth.userId!;

  await db.user.upsert({
    where: { id: userId },
    create: { id: userId },
    update: {},
  });

  return await db.userVerification.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
}

export async function startEmailVerification() {
  const auth = await getAuth({ required: true });
  const userId = auth.userId!;

  await db.user.upsert({
    where: { id: userId },
    create: { id: userId },
    update: {},
  });

  return await db.userVerification.upsert({
    where: { userId_method: { userId, method: "email" } },
    create: { userId, method: "email", verified: true, verifiedAt: new Date() },
    update: { verified: true, verifiedAt: new Date() },
  });
}

export async function startPhoneVerification(phone: string) {
  const auth = await getAuth({ required: true });
  const userId = auth.userId!;

  await db.user.upsert({
    where: { id: userId },
    create: { id: userId },
    update: {},
  });

  // Store phone, mark pending (Twilio integration placeholder)
  return await db.userVerification.upsert({
    where: { userId_method: { userId, method: "phone" } },
    create: {
      userId,
      method: "phone",
      verified: false,
      metadata: JSON.stringify({ phone }),
    },
    update: {
      metadata: JSON.stringify({ phone }),
    },
  });
}

export async function addSocialVerification(method: string, handle: string) {
  const validMethods = ["google", "meta", "twitter", "linkedin", "indeed"];
  if (!validMethods.includes(method))
    throw new Error("Invalid social method");

  const auth = await getAuth({ required: true });
  const userId = auth.userId!;

  await db.user.upsert({
    where: { id: userId },
    create: { id: userId },
    update: {},
  });

  return await db.userVerification.upsert({
    where: { userId_method: { userId, method } },
    create: {
      userId,
      method,
      verified: true,
      verifiedAt: new Date(),
      metadata: JSON.stringify({ handle }),
    },
    update: {
      verified: true,
      verifiedAt: new Date(),
      metadata: JSON.stringify({ handle }),
    },
  });
}

export async function addCommunityId(data: {
  neighborhood: string;
  skills: string;
  reference: string;
}) {
  const auth = await getAuth({ required: true });
  const userId = auth.userId!;

  await db.user.upsert({
    where: { id: userId },
    create: { id: userId },
    update: {},
  });

  return await db.userVerification.upsert({
    where: { userId_method: { userId, method: "community" } },
    create: {
      userId,
      method: "community",
      verified: true,
      verifiedAt: new Date(),
      metadata: JSON.stringify(data),
    },
    update: {
      verified: true,
      verifiedAt: new Date(),
      metadata: JSON.stringify(data),
    },
  });
}

export async function recordBiometricVerification() {
  const auth = await getAuth({ required: true });
  const userId = auth.userId!;

  await db.user.upsert({
    where: { id: userId },
    create: { id: userId },
    update: {},
  });

  return await db.userVerification.upsert({
    where: { userId_method: { userId, method: "biometric" } },
    create: {
      userId,
      method: "biometric",
      verified: true,
      verifiedAt: new Date(),
    },
    update: { verified: true, verifiedAt: new Date() },
  });
}

export async function getUserTrustScore(userId: string) {
  const verifications = await db.userVerification.findMany({
    where: { userId, verified: true },
  });

  const methods = new Set(verifications.map((v) => v.method));

  let score = 0;
  if (methods.has("email")) score += 15;
  if (methods.has("phone")) score += 20;
  if (methods.has("biometric")) score += 20;
  if (methods.has("community")) score += 15;

  // Social: up to 3 × 10 = 30
  const socialMethods = ["google", "meta", "twitter", "linkedin", "indeed"];
  const socialCount = socialMethods.filter((m) => methods.has(m)).length;
  score += Math.min(socialCount, 3) * 10;

  // Badge
  let badge = "";
  if (score >= 81) badge = "LACK Verified ✓";
  else if (score >= 61) badge = "Verified Member";
  else if (score >= 41) badge = "Trusted Member";
  else if (score >= 21) badge = "Community Member";

  return {
    score,
    badge,
    badges: badge ? [badge] : [],
    verificationCount: verifications.length,
    methods: Array.from(methods),
  };
}

// ---- Admin ----

export async function getAdminStats() {
  const [
    userCount,
    gigCount,
    housingCount,
    applicationCount,
    messageCount,
    pendingReportCount,
    restorationCount,
  ] = await Promise.all([
    db.user.count(),
    db.gigListing.count(),
    db.housingListing.count(),
    db.gigApplication.count(),
    db.message.count(),
    db.report.count({ where: { dismissed: false } }),
    db.restorationProject.count(),
  ]);

  return {
    userCount,
    gigCount,
    housingCount,
    applicationCount,
    messageCount,
    pendingReportCount,
    restorationCount,
  };
}

export async function getReports() {
  return await db.report.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      reporter: { select: { id: true, name: true, handle: true } },
    },
  });
}

export async function dismissReport(reportId: string) {
  return await db.report.update({
    where: { id: reportId },
    data: { dismissed: true },
  });
}

export async function adminDeleteGigListing(id: string) {
  // Delete applications first
  await db.gigApplication.deleteMany({ where: { gigId: id } });
  return await db.gigListing.delete({ where: { id } });
}

export async function adminDeleteHousingListing(id: string) {
  return await db.housingListing.delete({ where: { id } });
}

export async function getAllUsers() {
  const users = await db.user.findMany({
    include: {
      profile: true,
      verifications: { where: { verified: true } },
      applications: { select: { id: true } },
      _count: {
        select: { applications: true },
      },
    },
    orderBy: { id: "asc" },
  });

  return users.map((u) => {
    const methods = new Set(u.verifications.map((v) => v.method));
    let score = 0;
    if (methods.has("email")) score += 15;
    if (methods.has("phone")) score += 20;
    if (methods.has("biometric")) score += 20;
    if (methods.has("community")) score += 15;
    const socialMethods = ["google", "meta", "twitter", "linkedin", "indeed"];
    const socialCount = socialMethods.filter((m) => methods.has(m)).length;
    score += Math.min(socialCount, 3) * 10;

    return {
      id: u.id,
      name: u.name,
      handle: u.handle,
      image: u.image,
      location: u.profile?.location ?? "",
      verificationCount: u.verifications.length,
      trustScore: score,
      applicationCount: u._count.applications,
    };
  });
}

export async function getAllGigsAdmin() {
  return await db.gigListing.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { applications: true } },
    },
  });
}

export async function getAllHousingAdmin() {
  return await db.housingListing.findMany({
    orderBy: { createdAt: "desc" },
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

// ---- Earnings & Revenue Share ----

async function ensureEarningsAccount(userId: string) {
  return await db.earningsAccount.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
}

export async function getMyEarnings() {
  const auth = await getAuth({ required: true });
  const userId = auth.userId!;
  await db.user.upsert({ where: { id: userId }, create: { id: userId }, update: {} });
  const account = await ensureEarningsAccount(userId);
  const transactions = await db.earningsTransaction.findMany({
    where: { accountId: account.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return { account, transactions };
}

export async function recordAdView(type: "banner" | "interstitial" | "video") {
  const auth = await getAuth({ required: true });
  const userId = auth.userId!;
  await db.user.upsert({ where: { id: userId }, create: { id: userId }, update: {} });
  const account = await ensureEarningsAccount(userId);

  // User earns 75%, LACK keeps 25%
  const earningsCents = type === "banner" ? 0.075 : type === "interstitial" ? 0.375 : 1.5;
  const centsInt = Math.max(1, Math.round(earningsCents));

  const labels: Record<string, string> = {
    banner: "Banner ad view",
    interstitial: "Interstitial ad view",
    video: "Video ad completed",
  };

  await db.earningsTransaction.create({
    data: {
      accountId: account.id,
      type: "ad_view",
      amountCents: centsInt,
      description: labels[type],
    },
  });

  await db.earningsAccount.update({
    where: { id: account.id },
    data: { balanceCents: { increment: centsInt } },
  });

  return { earned: centsInt };
}

// ---- The Journey (8-step earn sequence) ----

export async function startJourney() {
  const auth = await getAuth({ required: true });
  const userId = auth.userId!;
  await db.user.upsert({ where: { id: userId }, create: { id: userId }, update: {} });

  const session = await db.journeySession.create({
    data: { userId },
  });
  return { sessionId: session.id };
}

export async function recordJourneyStep(sessionId: string, type: "ad" | "video") {
  const auth = await getAuth({ required: true });
  const userId = auth.userId!;

  const session = await db.journeySession.findUnique({ where: { id: sessionId } });
  if (!session || session.userId !== userId) throw new Error("Session not found");
  if (session.completedAt) throw new Error("Journey already completed");

  const earningsCents = type === "ad" ? 1 : 2;

  await db.journeySession.update({
    where: { id: sessionId },
    data: {
      adsViewed: type === "ad" ? { increment: 1 } : undefined,
      videosWatched: type === "video" ? { increment: 1 } : undefined,
      earnedCents: { increment: earningsCents },
    },
  });

  const account = await ensureEarningsAccount(userId);
  await db.earningsTransaction.create({
    data: {
      accountId: account.id,
      type: "ad_view",
      amountCents: earningsCents,
      description: type === "ad" ? "Journey: ad step" : "Journey: video watched",
    },
  });
  await db.earningsAccount.update({
    where: { id: account.id },
    data: { balanceCents: { increment: earningsCents } },
  });

  return { earned: earningsCents };
}

export async function completeJourney(sessionId: string) {
  const auth = await getAuth({ required: true });
  const userId = auth.userId!;

  const session = await db.journeySession.findUnique({ where: { id: sessionId } });
  if (!session || session.userId !== userId) throw new Error("Session not found");

  const bonusCents = 5;
  await db.journeySession.update({
    where: { id: sessionId },
    data: {
      completedAt: new Date(),
      earnedCents: { increment: bonusCents },
    },
  });

  const account = await ensureEarningsAccount(userId);
  await db.earningsTransaction.create({
    data: {
      accountId: account.id,
      type: "journey_bonus",
      amountCents: bonusCents,
      description: "Journey completion bonus",
    },
  });
  await db.earningsAccount.update({
    where: { id: account.id },
    data: { balanceCents: { increment: bonusCents } },
  });

  const updatedSession = await db.journeySession.findUnique({ where: { id: sessionId } });
  return { totalEarned: updatedSession!.earnedCents };
}

// ---- The Grind (infinite loop earn system) ----

export async function startGrind() {
  const auth = await getAuth({ required: true });
  const userId = auth.userId!;
  await db.user.upsert({ where: { id: userId }, create: { id: userId }, update: {} });

  const session = await db.grindSession.create({
    data: { userId },
  });
  return { sessionId: session.id };
}

export async function recordGrindStep(sessionId: string, type: "ad" | "video") {
  const auth = await getAuth({ required: true });
  const userId = auth.userId!;

  const session = await db.grindSession.findUnique({ where: { id: sessionId } });
  if (!session || session.userId !== userId) throw new Error("Session not found");
  if (session.exitedAt) throw new Error("Grind session already exited");

  // ad = 0.5¢ (stored as 1 cent min), video = 2¢
  const earningsCents = type === "ad" ? 1 : 2;

  // Update loop count when an ad completes (start of new loop)
  const newLoopCount = type === "ad" ? session.loopCount + 1 : session.loopCount;

  await db.grindSession.update({
    where: { id: sessionId },
    data: {
      adsViewed: type === "ad" ? { increment: 1 } : undefined,
      videosWatched: type === "video" ? { increment: 1 } : undefined,
      earnedCents: { increment: earningsCents },
      loopCount: newLoopCount,
    },
  });

  const account = await ensureEarningsAccount(userId);
  await db.earningsTransaction.create({
    data: {
      accountId: account.id,
      type: type === "ad" ? "grind_ad" : "grind_video",
      amountCents: earningsCents,
      description: type === "ad" ? "The Grind: interstitial ad" : "The Grind: video watched",
    },
  });
  await db.earningsAccount.update({
    where: { id: account.id },
    data: { balanceCents: { increment: earningsCents } },
  });

  const updatedSession = await db.grindSession.findUnique({ where: { id: sessionId } });
  return { earned: earningsCents, loopCount: updatedSession!.loopCount, totalEarned: updatedSession!.earnedCents };
}

export async function exitGrind(sessionId: string) {
  const auth = await getAuth({ required: true });
  const userId = auth.userId!;

  const session = await db.grindSession.findUnique({ where: { id: sessionId } });
  if (!session || session.userId !== userId) throw new Error("Session not found");

  await db.grindSession.update({
    where: { id: sessionId },
    data: { exitedAt: new Date() },
  });

  return { totalEarned: session.earnedCents, loopCount: session.loopCount };
}

export async function getMyPrivacySettings() {
  const auth = await getAuth({ required: true });
  const userId = auth.userId!;
  await db.user.upsert({ where: { id: userId }, create: { id: userId }, update: {} });

  return await db.privacySettings.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
}

export async function updatePrivacySettings(settings: {
  shareUsageData?: boolean;
  shareInterests?: boolean;
  personalizedAds?: boolean;
}) {
  const auth = await getAuth({ required: true });
  const userId = auth.userId!;
  await db.user.upsert({ where: { id: userId }, create: { id: userId }, update: {} });

  const existing = await db.privacySettings.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });

  const account = await ensureEarningsAccount(userId);
  let bonusCents = 0;
  const bonusDesc: string[] = [];

  if (settings.shareUsageData === true && !existing.shareUsageData) {
    bonusCents += 10;
    bonusDesc.push("Tier 1 data opt-in bonus");
  }
  if (settings.shareInterests === true && !existing.shareInterests) {
    bonusCents += 25;
    bonusDesc.push("Tier 2 data opt-in bonus");
  }
  if (settings.personalizedAds === true && !existing.personalizedAds) {
    bonusCents += 50;
    bonusDesc.push("Tier 3 personalized ads bonus");
  }

  if (bonusCents > 0) {
    await db.earningsTransaction.create({
      data: {
        accountId: account.id,
        type: "data_opt_in_bonus",
        amountCents: bonusCents,
        description: bonusDesc.join(", "),
      },
    });
    await db.earningsAccount.update({
      where: { id: account.id },
      data: { balanceCents: { increment: bonusCents } },
    });
  }

  const updated = await db.privacySettings.update({
    where: { userId },
    data: {
      shareUsageData: settings.shareUsageData ?? existing.shareUsageData,
      shareInterests: settings.shareInterests ?? existing.shareInterests,
      personalizedAds: settings.personalizedAds ?? existing.personalizedAds,
    },
  });

  return { settings: updated, bonusEarned: bonusCents };
}

export async function requestPayout(method: string, details: Record<string, string>) {
  const auth = await getAuth({ required: true });
  const userId = auth.userId!;
  await db.user.upsert({ where: { id: userId }, create: { id: userId }, update: {} });

  const account = await ensureEarningsAccount(userId);
  if (account.balanceCents < 100) throw new Error("Minimum payout is $1.00");

  const amount = account.balanceCents;
  await db.earningsTransaction.create({
    data: {
      accountId: account.id,
      type: "payout",
      amountCents: -amount,
      description: `Payout requested via ${method}`,
    },
  });
  await db.earningsAccount.update({
    where: { id: account.id },
    data: {
      balanceCents: 0,
      paidOutCents: { increment: amount },
      payoutMethod: method,
      cashAppHandle: details.cashAppHandle ?? account.cashAppHandle,
      bankAccountName: details.bankAccountName ?? account.bankAccountName,
      bankRouting: details.bankRouting ?? account.bankRouting,
      bankAccount: details.bankAccount ?? account.bankAccount,
    },
  });

  return { requested: true, amountCents: amount };
}

export async function setPayoutMethod(method: string, details: Record<string, string>) {
  const auth = await getAuth({ required: true });
  const userId = auth.userId!;
  await db.user.upsert({ where: { id: userId }, create: { id: userId }, update: {} });

  const account = await ensureEarningsAccount(userId);
  await db.earningsAccount.update({
    where: { id: account.id },
    data: {
      payoutMethod: method,
      cashAppHandle: details.cashAppHandle ?? "",
      bankAccountName: details.bankAccountName ?? "",
      bankRouting: details.bankRouting ?? "",
      bankAccount: details.bankAccount ?? "",
    },
  });
  return { updated: true };
}

export async function getEarningsLeaderboard() {
  const topAccounts = await db.earningsAccount.findMany({
    orderBy: { balanceCents: "desc" },
    take: 10,
    include: { user: true },
  });

  return topAccounts.map((a) => ({
    displayName: a.user.name
      ? `${a.user.name.split(" ")[0]} ${a.user.name.split(" ")[1]?.[0] ?? ""}.`
      : "Anonymous",
    balanceCents: a.balanceCents + a.paidOutCents,
  }));
}

// ---- Marketing Profile & Brand Lift Surveys ----

function calcProfileScore(p: {
  ageRange: string; gender: string; location: string;
  interests: string; brandAffinities: string; purchaseIntent: string;
  incomeRange: string; employmentStatus: string;
}, surveyCount: number): number {
  let score = 0;
  if (p.ageRange) score += 10;
  if (p.gender) score += 5;
  if (p.location) score += 10;
  try { if (JSON.parse(p.interests).length >= 3) score += 15; } catch { score += 0; }
  try { if (JSON.parse(p.brandAffinities).length >= 3) score += 15; } catch { score += 0; }
  try { if (JSON.parse(p.purchaseIntent).length > 0) score += 15; } catch { score += 0; }
  if (p.incomeRange) score += 10;
  if (p.employmentStatus) score += 10;
  if (surveyCount >= 5) score += 10;
  return Math.min(score, 100);
}

export async function getMyMarketingProfile() {
  const auth = await getAuth({ required: true });
  const userId = auth.userId!;
  await db.user.upsert({ where: { id: userId }, create: { id: userId }, update: {} });

  const profile = await db.marketingProfile.upsert({
    where: { userId },
    create: { userId },
    update: {},
    include: { _count: { select: { surveyResponses: true } } },
  });
  return profile;
}

export async function updateMarketingProfile(data: {
  ageRange?: string;
  gender?: string;
  location?: string;
  interests?: string[];
  brandAffinities?: string[];
  purchaseIntent?: string[];
  incomeRange?: string;
  employmentStatus?: string;
}) {
  const auth = await getAuth({ required: true });
  const userId = auth.userId!;
  await db.user.upsert({ where: { id: userId }, create: { id: userId }, update: {} });

  const existing = await db.marketingProfile.upsert({
    where: { userId },
    create: { userId },
    update: {},
    include: { _count: { select: { surveyResponses: true } } },
  });

  const updated = await db.marketingProfile.update({
    where: { userId },
    data: {
      ageRange: data.ageRange ?? existing.ageRange,
      gender: data.gender ?? existing.gender,
      location: data.location ?? existing.location,
      interests: data.interests ? JSON.stringify(data.interests) : existing.interests,
      brandAffinities: data.brandAffinities ? JSON.stringify(data.brandAffinities) : existing.brandAffinities,
      purchaseIntent: data.purchaseIntent ? JSON.stringify(data.purchaseIntent) : existing.purchaseIntent,
      incomeRange: data.incomeRange ?? existing.incomeRange,
      employmentStatus: data.employmentStatus ?? existing.employmentStatus,
    },
    include: { _count: { select: { surveyResponses: true } } },
  });

  const score = calcProfileScore(updated, updated._count.surveyResponses);
  await db.marketingProfile.update({ where: { userId }, data: { profileScore: score } });

  // Award +20¢ welcome bonus for first profile completion (if substantial)
  if (score >= 40 && existing.profileScore < 40) {
    const account = await ensureEarningsAccount(userId);
    await db.earningsTransaction.create({
      data: { accountId: account.id, type: "data_opt_in_bonus", amountCents: 20, description: "Profile setup bonus" },
    });
    await db.earningsAccount.update({ where: { id: account.id }, data: { balanceCents: { increment: 20 } } });
  }

  return { ...updated, profileScore: score };
}

const BRAND_NAMES = [
  "A local business", "A national retailer", "A food delivery service",
  "A streaming service", "A financial app", "A home services company",
  "An auto brand", "A health & wellness brand",
];

export async function submitSurveyResponse(data: {
  videoTheme: string;
  q1_recall?: number;
  q2_interest?: number;
  q3_purchase?: number;
  q4_remember?: boolean;
  q5_freeform?: string;
}) {
  const auth = await getAuth({ required: true });
  const userId = auth.userId!;
  await db.user.upsert({ where: { id: userId }, create: { id: userId }, update: {} });

  const profile = await db.marketingProfile.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });

  const brandName = BRAND_NAMES[Math.floor(Math.random() * BRAND_NAMES.length)];

  // Calculate earnings
  const hasBasic = data.q1_recall !== undefined && data.q2_interest !== undefined;
  const hasFull = hasBasic && data.q3_purchase !== undefined && data.q4_remember !== undefined;
  const hasFreeform = (data.q5_freeform?.length ?? 0) >= 50;

  let earnedCents = 0;
  if (hasFull) earnedCents += 15;
  else if (hasBasic) earnedCents += 5;
  if (hasFreeform) earnedCents += 5;

  const response = await db.surveyResponse.create({
    data: {
      userId,
      profileId: profile.id,
      videoTheme: data.videoTheme,
      brandName,
      q1_recall: data.q1_recall,
      q2_interest: data.q2_interest,
      q3_purchase: data.q3_purchase,
      q4_remember: data.q4_remember,
      q5_freeform: data.q5_freeform ?? "",
      earnedCents,
    },
  });

  if (earnedCents > 0) {
    const account = await ensureEarningsAccount(userId);
    await db.earningsTransaction.create({
      data: { accountId: account.id, type: "ad_view", amountCents: earnedCents, description: `Brand lift survey: ${brandName}` },
    });
    await db.earningsAccount.update({ where: { id: account.id }, data: { balanceCents: { increment: earnedCents } } });
  }

  // Update brand affinities if positive interest
  if (data.q2_interest && data.q2_interest >= 4) {
    const affinities = JSON.parse(profile.brandAffinities || "[]") as string[];
    if (!affinities.includes(brandName)) {
      affinities.push(brandName);
      await db.marketingProfile.update({ where: { userId }, data: { brandAffinities: JSON.stringify(affinities.slice(-20)) } });
    }
  }

  // Recalc profile score
  const surveyCount = await db.surveyResponse.count({ where: { userId } });
  const updatedProfile = await db.marketingProfile.findUnique({ where: { userId } });
  if (updatedProfile) {
    const score = calcProfileScore(updatedProfile, surveyCount);
    await db.marketingProfile.update({ where: { userId }, data: { profileScore: score } });
  }

  return { response, earnedCents };
}

export async function getMyDataSnapshot() {
  const auth = await getAuth({ required: true });
  const userId = auth.userId!;
  await db.user.upsert({ where: { id: userId }, create: { id: userId }, update: {} });

  const [profile, privacy, surveyCount, earnings] = await Promise.all([
    db.marketingProfile.findUnique({ where: { userId } }),
    db.privacySettings.findUnique({ where: { userId } }),
    db.surveyResponse.count({ where: { userId } }),
    db.earningsAccount.findUnique({ where: { userId } }),
  ]);

  return {
    profile: profile ? {
      ageRange: profile.ageRange,
      gender: profile.gender,
      location: profile.location,
      interests: JSON.parse(profile.interests || "[]") as string[],
      brandAffinities: JSON.parse(profile.brandAffinities || "[]") as string[],
      purchaseIntent: JSON.parse(profile.purchaseIntent || "[]") as string[],
      incomeRange: profile.incomeRange,
      employmentStatus: profile.employmentStatus,
      profileScore: profile.profileScore,
      dataConsentLevel: profile.dataConsentLevel,
    } : null,
    privacy: privacy ? {
      shareUsageData: privacy.shareUsageData,
      shareInterests: privacy.shareInterests,
      personalizedAds: privacy.personalizedAds,
    } : null,
    surveyCount,
    totalEarned: earnings ? (earnings.balanceCents + earnings.paidOutCents) : 0,
    thirdPartySharing: "No third parties have received your data",
  };
}

export async function deleteMyData() {
  const auth = await getAuth({ required: true });
  const userId = auth.userId!;

  await db.surveyResponse.deleteMany({ where: { userId } });
  await db.marketingProfile.deleteMany({ where: { userId } });

  return { deleted: true };
}

export async function completeProfileOnboarding(data: {
  ageRange: string;
  employmentStatus: string;
  interests: string[];
  incomeRange?: string;
  lookingFor: string[];
}) {
  const auth = await getAuth({ required: true });
  const userId = auth.userId!;
  await db.user.upsert({ where: { id: userId }, create: { id: userId }, update: {} });

  const profile = await db.marketingProfile.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });

  // Only award bonus once
  const isFirstTime = !profile.ageRange && !profile.employmentStatus;

  await db.marketingProfile.update({
    where: { userId },
    data: {
      ageRange: data.ageRange,
      employmentStatus: data.employmentStatus,
      interests: JSON.stringify(data.interests),
      incomeRange: data.incomeRange ?? "",
      purchaseIntent: JSON.stringify(data.lookingFor),
    },
  });

  if (isFirstTime) {
    const account = await ensureEarningsAccount(userId);
    await db.earningsTransaction.create({
      data: { accountId: account.id, type: "data_opt_in_bonus", amountCents: 20, description: "Profile onboarding welcome bonus" },
    });
    await db.earningsAccount.update({ where: { id: account.id }, data: { balanceCents: { increment: 20 } } });
  }

  return { completed: true, bonusEarned: isFirstTime ? 20 : 0 };
}

// ─── Job Aggregator ────────────────────────────────────────────────────────

type RawJob = {
  externalId: string; title: string; company: string;
  location: string; description: string; salary: string; url: string; postedAt: Date;
};

/** Fetch remote jobs from Remotive API (free, no auth) — filter to relevant categories */
async function fetchRemotiveJobs(): Promise<RawJob[]> {
  try {
    const categories = ["software-dev", "customer-support", "data", "marketing", "business"];
    const results: RawJob[] = [];
    for (const cat of categories) {
      const res = await fetch(`https://remotive.com/api/remote-jobs?category=${cat}&limit=10`, {
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) continue;
      const data = await res.json() as { jobs?: Array<{ id: number; title: string; company_name: string; candidate_required_location: string; description: string; salary: string; url: string; publication_date: string; }> };
      for (const j of data.jobs ?? []) {
        results.push({
          externalId: `remotive-${j.id}`,
          title: j.title,
          company: j.company_name,
          location: j.candidate_required_location || "Remote",
          description: j.description.replace(/<[^>]+>/g, "").slice(0, 500),
          salary: j.salary ?? "",
          url: j.url,
          postedAt: new Date(j.publication_date),
        });
      }
    }
    return results;
  } catch {
    return [];
  }
}

/** Fetch jobs from The Muse API (free, no auth) — filter to St. Louis or remote */
async function fetchTheMuseJobs(): Promise<RawJob[]> {
  try {
    const res = await fetch(
      "https://www.themuse.com/api/public/jobs?location=St.+Louis%2C+Missouri&page=0&descending=true",
      { signal: AbortSignal.timeout(10000) }
    );
    if (!res.ok) return [];
    const data = await res.json() as { results?: Array<{ id: number; name: string; company: { name: string }; locations?: Array<{ name: string }>; contents: string; refs: { landing_page: string }; publication_date: string; levels?: Array<{ name: string }>; }> };
    return (data.results ?? []).slice(0, 20).map((j) => ({
      externalId: `muse-${j.id}`,
      title: j.name,
      company: j.company.name,
      location: j.locations?.[0]?.name ?? "St. Louis, MO",
      description: j.contents.replace(/<[^>]+>/g, "").slice(0, 500),
      salary: "",
      url: j.refs.landing_page,
      postedAt: new Date(j.publication_date),
    }));
  } catch {
    return [];
  }
}

/** Fetch jobs from Adzuna API (requires ADZUNA_APP_ID + ADZUNA_APP_KEY env vars) */
async function fetchAdzunaJobs(): Promise<RawJob[]> {
  try {
    const appId = process.env.ADZUNA_APP_ID ?? "";
    const appKey = process.env.ADZUNA_APP_KEY ?? "";
    if (!appId || !appKey) return [];
    const res = await fetch(
      `https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=20&where=St.+Louis%2C+MO&content-type=application/json`,
      { signal: AbortSignal.timeout(10000) }
    );
    if (!res.ok) return [];
    const data = await res.json() as { results?: Array<{ id: string; title: string; company?: { display_name: string }; location?: { display_name: string }; description: string; salary_min?: number; salary_max?: number; redirect_url: string; created: string; }> };
    return (data.results ?? []).map((j) => ({
      externalId: `adzuna-${j.id}`,
      title: j.title,
      company: j.company?.display_name ?? "Employer",
      location: j.location?.display_name ?? "St. Louis, MO",
      description: j.description.replace(/<[^>]+>/g, "").slice(0, 500),
      salary: j.salary_min ? `$${Math.round(j.salary_min).toLocaleString()} – $${Math.round(j.salary_max ?? j.salary_min).toLocaleString()} / yr` : "",
      url: j.redirect_url,
      postedAt: new Date(j.created),
    }));
  } catch {
    return [];
  }
}

/** Seed realistic St. Louis jobs so the page is never empty at launch */
async function seedStLouisJobs() {
  const seeds: Array<RawJob & { source: string }> = [
    { source: "seed", externalId: "seed-stl-001", title: "Warehouse Associate", company: "Amazon STL", location: "St. Louis, MO", description: "Join our fulfillment center team. Lift up to 50 lbs, pick and pack orders. Paid weekly. Benefits after 90 days.", salary: "$18–$21 / hr", url: "https://www.amazon.jobs/", postedAt: new Date() },
    { source: "seed", externalId: "seed-stl-002", title: "Customer Service Representative", company: "Enterprise Holdings", location: "St. Louis, MO", description: "Answer inbound calls, resolve customer issues, and process rental contracts. No experience needed — we train.", salary: "$15–$17 / hr", url: "https://careers.enterprise.com/", postedAt: new Date() },
    { source: "seed", externalId: "seed-stl-003", title: "Delivery Driver (CDL not required)", company: "FedEx Ground", location: "Earth City, MO", description: "Deliver packages to residential and commercial addresses in St. Louis metro. Must have valid driver's license and clean record.", salary: "$20–$24 / hr", url: "https://jobs.fedex.com/", postedAt: new Date() },
    { source: "seed", externalId: "seed-stl-004", title: "Forklift Operator", company: "Anheuser-Busch", location: "St. Louis, MO", description: "Operate sit-down and stand-up forklifts in a fast-paced production environment. Forklift certification preferred.", salary: "$22–$26 / hr", url: "https://www.ab-inbev.com/careers/", postedAt: new Date() },
    { source: "seed", externalId: "seed-stl-005", title: "Security Guard", company: "Allied Universal", location: "St. Louis, MO", description: "Monitor premises, check IDs, write incident reports. Day/evening shifts available. Uniforms provided.", salary: "$15–$18 / hr", url: "https://www.aus.com/careers/", postedAt: new Date() },
    { source: "seed", externalId: "seed-stl-006", title: "Medical Assistant", company: "SSM Health", location: "St. Louis, MO", description: "Assist physicians with patient care, vitals, phlebotomy. Certified medical assistants preferred. Full benefits.", salary: "$17–$22 / hr", url: "https://www.ssmhealth.com/careers/", postedAt: new Date() },
    { source: "seed", externalId: "seed-stl-007", title: "Maintenance Technician", company: "BJC HealthCare", location: "St. Louis, MO", description: "Maintain hospital equipment, HVAC, plumbing, and electrical systems. HVAC or electrical certification a plus.", salary: "$24–$30 / hr", url: "https://www.bjcjobs.com/", postedAt: new Date() },
    { source: "seed", externalId: "seed-stl-008", title: "Food Service Worker", company: "Sodexo at Washington University", location: "St. Louis, MO", description: "Prepare and serve meals in a university cafeteria. Flexible hours. Great entry-level opportunity.", salary: "$14–$16 / hr", url: "https://careers.sodexo.com/", postedAt: new Date() },
    { source: "seed", externalId: "seed-stl-009", title: "Retail Associate", company: "Target", location: "Brentwood, MO", description: "Stock shelves, assist guests, work registers. Flexible scheduling. Team-oriented environment.", salary: "$15–$17 / hr", url: "https://jobs.target.com/", postedAt: new Date() },
    { source: "seed", externalId: "seed-stl-010", title: "Bank Teller", company: "Busey Bank", location: "St. Louis, MO", description: "Process transactions, cash checks, assist customers with account questions. Professional environment. Good for career starters.", salary: "$16–$19 / hr", url: "https://www.busey.com/about/careers/", postedAt: new Date() },
    { source: "seed", externalId: "seed-stl-011", title: "Electrician Apprentice", company: "Sachs Electric", location: "St. Louis, MO", description: "Learn commercial and industrial wiring under journeyman supervision. IBEW apprenticeship available. Excellent long-term earnings potential.", salary: "$18–$23 / hr", url: "https://www.sachselectric.com/", postedAt: new Date() },
    { source: "seed", externalId: "seed-stl-012", title: "Caregiver / Home Health Aide", company: "Comfort Keepers St. Louis", location: "St. Louis, MO", description: "Assist seniors with daily living activities, light housekeeping, companionship. Compassionate individuals wanted.", salary: "$14–$17 / hr", url: "https://www.comfortkeepers.com/careers/", postedAt: new Date() },
  ];

  for (const job of seeds) {
    await db.externalJob.upsert({
      where: { source_externalId: { source: job.source, externalId: job.externalId } },
      update: { fetchedAt: new Date() },
      create: { source: job.source, externalId: job.externalId, title: job.title, company: job.company, location: job.location, description: job.description, salary: job.salary, url: job.url, postedAt: job.postedAt, fetchedAt: new Date(), isActive: true },
    });
  }
}

/** Main aggregation job — called by cron every 3 hours */
export async function aggregateJobs() {
  // Ensure seed jobs exist
  await seedStLouisJobs();

  const [remotiveJobs, museJobs, adzunaJobs] = await Promise.all([
    fetchRemotiveJobs(),
    fetchTheMuseJobs(),
    fetchAdzunaJobs(),
  ]);

  const allJobs = [
    ...remotiveJobs.map((j) => ({ ...j, source: "remotive" as const })),
    ...museJobs.map((j) => ({ ...j, source: "themuse" as const })),
    ...adzunaJobs.map((j) => ({ ...j, source: "adzuna" as const })),
  ];

  let upserted = 0;
  for (const job of allJobs) {
    await db.externalJob.upsert({
      where: { source_externalId: { source: job.source, externalId: job.externalId } },
      update: { title: job.title, company: job.company, location: job.location, description: job.description, salary: job.salary, fetchedAt: new Date(), isActive: true },
      create: {
        source: job.source,
        externalId: job.externalId,
        title: job.title,
        company: job.company,
        location: job.location,
        description: job.description,
        salary: job.salary,
        url: job.url,
        postedAt: job.postedAt,
        fetchedAt: new Date(),
        isActive: true,
      },
    });
    upserted++;
  }

  // Mark jobs older than 30 days as inactive
  await db.externalJob.updateMany({
    where: { postedAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
    data: { isActive: false },
  });

  console.log(`[aggregateJobs] Upserted ${upserted} jobs from ${allJobs.length} fetched (remotive: ${remotiveJobs.length}, themuse: ${museJobs.length}, adzuna: ${adzunaJobs.length})`);
  return { upserted, sources: { remotive: remotiveJobs.length, themuse: museJobs.length, adzuna: adzunaJobs.length } };
}

/** Get aggregated jobs for the careers page */
export async function getExternalJobs(limit = 40) {
  const jobs = await db.externalJob.findMany({
    where: { isActive: true },
    orderBy: { postedAt: "desc" },
    take: limit,
  });
  return jobs;
}

// ---- Offerwall (TapJoy placeholder — replace with SDK when live) ----

const DEMO_OFFERS = [
  { id: "1", title: "Download & open Walmart App", reward: 150, category: "app", timeEstimate: "2 min", icon: "📱" },
  { id: "2", title: "Sign up for a free Capital One account", reward: 500, category: "signup", timeEstimate: "5 min", icon: "💳" },
  { id: "3", title: "Complete DoorDash driver application", reward: 750, category: "signup", timeEstimate: "10 min", icon: "🛵" },
  { id: "4", title: "Watch 5 videos on Pluto TV", reward: 200, category: "video", timeEstimate: "15 min", icon: "📺" },
  { id: "5", title: "Download Cash App & send $1", reward: 300, category: "app", timeEstimate: "3 min", icon: "💸" },
  { id: "6", title: "Sign up for Instacart Shopper", reward: 800, category: "signup", timeEstimate: "10 min", icon: "🛒" },
  { id: "7", title: "Download & play a mobile game for 5 min", reward: 100, category: "game", timeEstimate: "5 min", icon: "🎮" },
  { id: "8", title: "Complete a free credit score check", reward: 250, category: "financial", timeEstimate: "3 min", icon: "📊" },
];

export async function getAvailableOffers() {
  return DEMO_OFFERS;
}

export async function completeOffer(offerId: string, offerTitle: string, earnedCents: number) {
  const auth = await getAuth({ required: true });
  const userId = auth.userId!;
  await db.offerCompletion.create({ data: { userId, offerId, offerTitle, earnedCents, source: "tapjoy" } });
  let account = await db.earningsAccount.findUnique({ where: { userId } });
  if (!account) account = await db.earningsAccount.create({ data: { userId } });
  await db.earningsAccount.update({ where: { userId }, data: { balanceCents: { increment: earnedCents } } });
  await db.earningsTransaction.create({
    data: { accountId: account.id, type: "offer_complete", amountCents: earnedCents, description: `Offer: ${offerTitle}` },
  });
  return { success: true, earnedCents };
}

// ---- Pollfish Surveys (placeholder — replace with Pollfish API when live) ----

const DEMO_SURVEYS = [
  { id: "s1", title: "Consumer Preferences Survey", reward: 75, length: "5 min", topic: "Shopping habits", icon: "🛍️" },
  { id: "s2", title: "Technology Usage Study", reward: 150, length: "10 min", topic: "Apps & devices", icon: "💻" },
  { id: "s3", title: "Healthcare Experience Survey", reward: 200, length: "12 min", topic: "Medical & wellness", icon: "🏥" },
  { id: "s4", title: "Financial Products Survey", reward: 300, length: "15 min", topic: "Banking & finance", icon: "💰" },
  { id: "s5", title: "Local Community Needs Study", reward: 100, length: "7 min", topic: "Your neighborhood", icon: "🏘️" },
];

export async function getAvailableSurveys() {
  return DEMO_SURVEYS;
}

export async function completePollSurvey(surveyId: string, earnedCents: number) {
  const auth = await getAuth({ required: true });
  const userId = auth.userId!;
  await db.pollSurveyCompletion.create({ data: { userId, surveyId, earnedCents } });
  let account = await db.earningsAccount.findUnique({ where: { userId } });
  if (!account) account = await db.earningsAccount.create({ data: { userId } });
  await db.earningsAccount.update({ where: { userId }, data: { balanceCents: { increment: earnedCents } } });
  await db.earningsTransaction.create({
    data: { accountId: account.id, type: "survey_complete", amountCents: earnedCents, description: `Pollfish survey: ${surveyId}` },
  });
  return { success: true, earnedCents };
}
