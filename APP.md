# LACK — Local Area Community Kiosk

**Purpose**: Community platform helping financially struggling people earn money through gig work, career placement, ad-revenue browsing, and housing

**Type**: app

**Status**: active

## What It Does

- **Earn Now** (`/earn`): Dense grid of 28+ Google AdSense-ready ad slots (leaderboards, medium rectangles, mobile banners, skyscrapers) — plug in real AdSense credentials to activate revenue. Also includes a recycling opportunities section with estimated cash values and links to local recyclers.
- **Gig Board** (`/gigs`): Local odd job listings (landscaping, carpentry, courier, snow removal, electronics, maintenance) with category filters, apply modal, and "Post a Gig" form. 10 seeded sample gigs.
- **Career Placement** (`/careers`): Full-time job listings with LACK salary negotiation pitch. 4 seeded career listings.
- **Housing & Real Estate** (`/housing`): Property listings for rent and sale with 3% LACK commission. Transparency Tools tab with tenant rights, red flag lease checker, fair market rent guide, and landlord checklist. Links to Community Restoration Hub.
- **Community Restoration Hub** (`/housing/restore`): Browse foreclosed/abandoned/auctioned properties. Champion a property to restore as housing or community space. Crowdfunding (Stripe Connect placeholder, ready for integration). Labor pledges. Champion updates feed.
- **Profile** (`/profile`): User bio, skills (tag-style), work history entries, and applications history.

## Data Stored

- **GigListing**: Title, category, payRate, location, description, poster info, isCareer flag
- **GigApplication**: User applications to gigs with message
- **UserProfile**: Bio, skills (comma-separated), workHistory (JSON), phone, location
- **HousingListing**: Type (rent/sale), property type, price, address, neighborhood, bed/bath/sqft, amenities, contact info
- **RestorationProject**: Address, city, status, proposed use, funding goal/raised, backer count, champion, description
- **RestorationUpdate**: Progress updates posted by project champions
- **LaborPledge**: User skill/hours pledges to restoration projects

## Functions (RPC Endpoints)

- `health()`: Server + DB health check
- `getGigs(isCareer?)`: List gig listings, optionally filter by career flag
- `getGig(id)`: Get single gig
- `createGig(data)`: Post a new gig listing
- `applyToGig(gigId, message)`: Apply to a gig (requires auth)
- `getMyProfile()`: Get current user's profile + applications
- `upsertProfile(data)`: Create or update user profile
- `seedGigs()`: Seed 14 sample gig listings (no-op if already seeded)
- `getHousingListings(type?, maxPrice?, minBedrooms?)`: List/filter housing listings
- `createHousingListing(data)`: Post a housing listing
- `getRestorationProjects()`: List all restoration projects with counts
- `getRestorationProject(id)`: Get single project with updates and labor pledges
- `createRestorationProject(data)`: Champion a new restoration property (requires auth)
- `pledgeLabor(projectId, skill, hours)`: Pledge labor to a project (requires auth)
- `addRestorationUpdate(projectId, content)`: Post a project update (champion only, requires auth)
- `seedHousing()`: Seed 7 housing listings + 3 restoration projects (no-op if already seeded)

## Ad Integration Notes

To activate real Google AdSense ads on the Earn Now page:
1. Apply for AdSense at https://www.google.com/adsense/
2. Replace `ca-pub-XXXXXXXXXXXXXXXX` in `src/pages/EarnPage.tsx` with your publisher ID
3. Replace `data-ad-slot="XXXXXXXXXX"` values with your actual ad unit IDs
4. Add the AdSense script tag to `index.html`

## Stripe Connect Integration (Housing Restoration)

The Community Restoration Hub has Stripe payment UI ready but uses a placeholder. To activate:
1. Create a Stripe Connect platform account at https://stripe.com/connect
2. Add `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY` to `.env.development`
3. Replace the Stripe placeholder in `RestorationPage.tsx` with a real Stripe payment intent flow
4. LACK takes 5% platform fee; Stripe takes ~3% — both shown clearly in UI

## Revenue Streams

1. **Ad revenue**: AdSense slots on /earn page — ready for activation
2. **Gig board**: Platform for local gig postings (future: paid featured listings)
3. **Career placement**: Salary negotiation skimming (future: payment integration)
4. **Housing transactions**: 3% commission on all rent/sale transactions (future: payment integration)
5. **Restoration crowdfunding**: 5% platform fee on donations (future: Stripe Connect)

## Use Cases

- Someone desperate at a coffee shop needs cash today → /earn
- Someone looking for local manual work → /gigs
- Someone wanting a full-time job with salary help → /careers
- Someone looking for affordable rent with no hidden fees → /housing
- Community organizer wanting to restore an abandoned building → /housing/restore
