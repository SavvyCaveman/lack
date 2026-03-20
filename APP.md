# LACK — Local Area Community Kiosk

**Purpose**: Community platform helping financially struggling people earn money through gig work, career placement, and ad-revenue browsing

**Type**: app

**Status**: active

## What It Does

- **Earn Now** (`/earn`): Dense grid of 28+ Google AdSense-ready ad slots (leaderboards, medium rectangles, mobile banners, skyscrapers) — plug in real AdSense credentials to activate revenue. Also includes a recycling opportunities section with estimated cash values and links to local recyclers.
- **Gig Board** (`/gigs`): Local odd job listings (landscaping, carpentry, courier, snow removal, electronics, maintenance) with category filters, apply modal, and "Post a Gig" form. 10 seeded sample gigs.
- **Career Placement** (`/careers`): Full-time job listings with LACK salary negotiation pitch. 4 seeded career listings.
- **Profile** (`/profile`): User bio, skills (tag-style), work history entries, and applications history.

## Data Stored

- **GigListing**: Title, category, payRate, location, description, poster info, isCareer flag
- **GigApplication**: User applications to gigs with message
- **UserProfile**: Bio, skills (comma-separated), workHistory (JSON), phone, location

## Functions (RPC Endpoints)

- `health()`: Server + DB health check
- `getGigs(isCareer?)`: List gig listings, optionally filter by career flag
- `getGig(id)`: Get single gig
- `createGig(data)`: Post a new gig listing
- `applyToGig(gigId, message)`: Apply to a gig (requires auth)
- `getMyProfile()`: Get current user's profile + applications
- `upsertProfile(data)`: Create or update user profile
- `seedGigs()`: Seed 14 sample gig listings (no-op if already seeded)

## Ad Integration Notes

To activate real Google AdSense ads on the Earn Now page:
1. Apply for AdSense at https://www.google.com/adsense/
2. Replace `ca-pub-XXXXXXXXXXXXXXXX` in `src/pages/EarnPage.tsx` with your publisher ID
3. Replace `data-ad-slot="XXXXXXXXXX"` values with your actual ad unit IDs
4. Add the AdSense script tag to `index.html`

## Revenue Streams

1. **Ad revenue**: AdSense slots on /earn page — ready for activation
2. **Gig board**: Platform for local gig postings (future: paid featured listings)
3. **Career placement**: Salary negotiation skimming (future: payment integration)

## Use Cases

- Someone desperate at a coffee shop needs cash today → /earn
- Someone looking for local manual work → /gigs
- Someone wanting a full-time job with salary help → /careers
