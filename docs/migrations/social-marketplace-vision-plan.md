# Social Marketplace (B2C Vision) — Finalisation Plan

> **Status:** Plan only — V2 / **post-B2B**. No implementation until the open questions are resolved and the B2B "big three" (Services, Team, Analytics + Marketing) are signed off. This is the forward-looking brief, not a current build.
> **Scope:** The **consumer marketplace** turning into a *social* marketplace — the `/c` coral surface (explore, salon profile, reviews, results gallery, staff profiles) **plus** the B2B hooks that feed it (offer photo gallery → marketplace, staff public profiles). It covers a **reviews & comments** social layer first, a **results gallery** tied to bookings second, and a **local discovery feed** last.
> **Explicitly out of scope this pass:** follower-count / like-count *ranking* (the 16 Jun red line — see below), open stranger-to-stranger commenting / client DMs, an algorithmic infinite vanity feed as a V1 centrepiece, real geocoding/maps, real photo moderation infrastructure, and real backend persistence. This is a mid-fidelity prototype; everything stays session-local Zustand.
> **Surface:** B2C is **coral**; B2B is **ink**. Keep them distinct (CLAUDE.md rule 2). The B2B hooks below live on the ink surface; everything under `/c` stays coral.
> **Source of truth for feedback:** the Granola stakeholder sessions with Shabbir & Vishal cited inline by date. The marketplace "bombshell" is the **2 Jun** alignment; the guard-rail is the **16 Jun** internal planning session.

---

## The red line (read this first)

On **16 Jun** the team set an explicit guard-rail: **do not rank or gate businesses by follower or like counts.** Follower-led ranking structurally punishes smaller salons and turns That Time into a popularity contest rather than a booking tool. The preferred direction is a social layer built on **reviews, comments and a results gallery** — craft and credentials, not clout. Every phase below is designed around that line, and a chunk of Phase 0 is specifically about *removing* the vanity metrics the prototype already leans on.

This is also why the section is staged **after** B2B: on **16 Jun** B2B (Services / Team / Analytics, with Marketing paired to Analytics) was named the current focus. The social marketplace is the vision that makes businesses feel they *must* be on That Time (Vishal, 2 Jun: Instagram-level necessity, "a hybrid of LinkedIn + Instagram for the beauty industry") — but it is built last, on top of the B2B inputs.

---

## What this section is

The consumer marketplace (`/c`) is where a client discovers a business, browses its work and its people, reads reviews, and books. The **social marketplace** vision turns that from a static directory into a living surface: customer- and staff-uploaded **treatment results** in a browsable grid, **team-member stories and public profiles**, and a **reviews + comments** conversation layer — all tied back to a bookable service so discovery is always one tap from a booking. It is the consumer-facing counterpart to the B2B hub: the business assembles its gallery and staff profiles on the ink side, and they surface, bottom-up, into the coral marketplace. The differentiator versus Fresha / Treatwell is *social engagement through reviews and craft*, deliberately **not** through a follower status game.

---

## Feedback → source map

| Area | Feedback | Source | Pattern ref (Mobbin) |
|---|---|---|---|
| Vision framing | Turn the B2C **marketplace into a social marketplace** — "LinkedIn + Instagram for beauty"; make being on TT feel as necessary as Instagram; differentiate from Fresha/Treatwell via social engagement | Vishal, **2 Jun** | [Fresha venue detail (Photos/Services/Team/Reviews/Buy/About)](https://mobbin.com/screens/9eaedf92-a72f-4a04-8bc8-49e9ecf7ff58) |
| Results discovery | Customer-uploaded **treatment results in a grid** for discovery | Vishal, **2 Jun** | [Thumbtack portfolio grid, category-filterable, before/after](https://mobbin.com/screens/2e55164d-3981-4635-b149-1d3739ff6322) · [Pinterest masonry + filter chips](https://mobbin.com/screens/14800a84-8bc1-476f-960a-b7353780defb) |
| People | **Team-member stories & social profiles** — humanise the practitioner | Vishal, **2 Jun** | [Airbnb host portfolio + reviews](https://mobbin.com/screens/ad6c4dff-2563-473f-86c3-f00161b32c71) · [Alan practitioner profile](https://mobbin.com/screens/ed903d4c-3065-4f73-a2f4-f7c6852d3736) |
| **Red line** | Follower-count ranking would **disadvantage smaller businesses** — prefer a social layer via **reviews & comments**, not status/follower metrics; define a clear red line so the B2C pivot doesn't drift | Internal, **16 Jun** | — (guard-rail; see anti-patterns) |
| Sequencing | B2B is the current focus (Services/Team/Analytics; Marketing pairs with Analytics); marketplace is the vision, built later | Internal, **16 Jun**; sign-off **15 Jun** | — |
| Bookable photos (B2B hook) | Every photo tied to the exact bookable service; staff-uploaded images auto-surface into the business showcase | Research (Fresha "Service Portfolios", May 2026) | [Fresha venue detail tabs](https://mobbin.com/screens/9eaedf92-a72f-4a04-8bc8-49e9ecf7ff58) |
| Verified reviews | Only people who actually booked can review; verified-booking badge; star-distribution bar; searchable / "most relevant" sort | Research (Thumbtack) | [Thumbtack reviews + star-distribution + "Hired on Thumbtack" badge](https://mobbin.com/screens/7ab04373-4d7c-4227-b6ff-968e01d6fa58) · [TaskRabbit distribution bars](https://mobbin.com/screens/a3f2dfb7-56aa-48fc-9491-f88308b0b8f6) |
| Low-friction composer | Stars + tappable compliment chips + optional text + optional photo; completable without typing | Research (Keeta / Uber Eats) | [Keeta post-order chips](https://mobbin.com/screens/a763c08d-eb44-42fd-8d81-61c13824db8e) · [Uber Eats rate + disclosure](https://mobbin.com/screens/b0eda03b-e2f6-46b3-a359-297901b5b108) |
| Privacy / sub-ratings | Sub-dimension ratings (Result/Atmosphere/Value/Cleanliness); "post anonymously" toggle; public-visibility disclosure | Research (Shopee / Google Maps / DoorDash) | [Shopee structured review + anonymous](https://mobbin.com/screens/313373e5-3e98-4b79-9b49-58e4ecd50f0d) · [Google Maps minimal composer + audience](https://mobbin.com/screens/d858e351-7d72-43c6-b47c-9f522244c77f) · [DoorDash public/private selector](https://mobbin.com/screens/323df988-c01f-4f98-94f0-71fade884b05) |
| Topic-tagged snippets | Pull-quote review snippets with a topic tag woven into the profile overview | Research (Google Maps) | [Google Maps spa profile snippets ("facial · 74")](https://mobbin.com/screens/b5355d3c-58da-404e-b045-655dc2fa7b0f) |
| Before/after + import | Beauty's native format is before/after pairs; import from phone/Instagram to lower SMB effort | Research (Booksy / StyleSeat) | [Thumbtack before/after labelled grid](https://mobbin.com/screens/b190772c-53f9-4bf0-8d8b-c2fd4599b6c5) |
| Local discovery (P3) | Category pills + "recommended near you" feed + map/list toggle; **no follower ranking** | Research (Square Go / Fresha) | [Square Go explore](https://mobbin.com/screens/887c163f-6bad-4c48-98a9-7ca907c47b85) · [Square Go category grid](https://mobbin.com/screens/25d81326-c1b0-41c3-95bf-8bd193529790) · [Square Go map](https://mobbin.com/screens/59f76480-9080-48c2-8f00-8942909a0dfa) · [Fresha map](https://mobbin.com/screens/f9e8c4b1-49b5-4cd8-b39f-86be31aaf034) |
| Houzz/Instagram portfolio | Portfolio-grid layout reference for the gallery | Research (Houzz / Instagram) | [Houzz pro projects gallery](https://mobbin.com/screens/60e376ca-fbe1-4054-85c3-773438b698ce) · [Instagram profile grid](https://mobbin.com/screens/dab28cdf-fef7-4abf-a323-45733ca15fcc) |

---

## Current state

The `/c` coral surface is **further built than a greenfield vision** — which is both an asset and a liability, because what exists today leans on exactly the follower/like vanity metrics the 16 Jun red line bans. Status legend: ✅ done · 🟡 partial · ❌ missing.

**Built (coral `/c`):**
- ✅ **Explore** — `src/app/c/explore/page.tsx`: "For you" Instagram masonry grid of `explorePosts`, "Nearby" map-preview + salon cards with ratings, category pills (`defaultCategories`), search with recents/trending, full filters sheet (rating / distance / price / availability / offer type). This is close to the Phase 3 discovery model **already**, except it surfaces a like-driven post grid rather than a recency/proximity feed.
- ✅ **Salon profile** — `src/app/c/salon/[id]/page.tsx`: tabbed **Grid / Services / Reviews / About**, hero stats, highlights, a per-post "Book this look" CTA (`post.offerId` → `/c/salon/[id]/book?offer=…`), a Reviews tab with a **rating-distribution bar** (`RATING_BARS`) and an in-page **review composer sheet** (stars + free text), and an About tab with map / hours / **Team list** / amenities. This is most of the Fresha tab structure already.
- ✅ **Reviews list** — `src/app/c/salon/[id]/reviews/page.tsx`: standalone list with Newest/Highest/Lowest sort + the distribution summary.
- ✅ **Post detail** — `src/app/c/post/[id]/page.tsx`: full post + **inline comments** + like + a booking strip ("more from the salon").
- ✅ **Stories** — `src/app/c/story/[id]/page.tsx` + `stories` data, with offer-tagged segments.
- ✅ **Home feed** — `src/app/c/home/page.tsx` + `feedPosts`: like / save / comment, offer chips.
- ✅ **Bookings → review** — `src/app/c/bookings/[id]/page.tsx`: a **"Leave review"** action appears only when `completed`, and flips to "You reviewed this visit". The verified-booking *gate* is therefore already implied; it just isn't badged or enforced as the only entry point.
- ✅ **Consumer primitives** — `src/components/ui/consumer.tsx`: `Avatar` (category-tinted), `Stars`, `OfferTypeBadge`, coral `Toggle`, `SummaryRow`, `GridTile`.
- ✅ **B2C data model** — `src/lib/data/b2c.ts`: `Salon`, `ClientOffer`, `SalonPost`, `SalonStaff`, `SalonReview`, `Story`, `FeedPost`/`FeedComment`, `ClientBookingItem` (with `reviewed?`), `clientUser`. 5 seed salons across categories.

**B2B hooks (ink) — partially present:**
- 🟡 **Offer photo gallery** — `src/app/app/services/[id]/photos/page.tsx`: each offer has `offer.photos?: number[]` (placeholder ids) added via `updateOffer`. Empty-state copy is literally *"Add photos so clients can see your work."* This is the seed of the marketplace gallery — but photos are **not tagged before/after, not consented, and not surfaced to `/c`** (the consumer salon `posts`/`highlights` are separate hand-authored data in `b2c.ts`).
- 🟡 **Offer visibility** — `offer.classDetails.visibilityMode: "marketplace" | "private_link"` exists for classes; there is **no** business-wide gallery toggle and no per-image marketplace flag.
- 🟡 **Staff profile** — `StaffProfile { publicName; bio; visibleOnProfile; featured }` in `src/lib/types/staff.ts`. So a public-profile *intent* exists, but there is no specialties / languages / per-staff results / per-staff reviews, and nothing renders it on `/c`.
- 🟡 **Marketing → Reviews** — `src/app/app/marketing/page.tsx` lists a **Reviews** card ("Aggregate feed & responses") — the owner-reply / aggregation home, currently a stub.

**Missing / the gap to close:**
- ❌ **The data join** between B2B inputs and the B2C surface. Today `b2c.ts` is hand-authored demo data with no link to the real `offersStore` / `teamStore`. There is no `Review` or `ResultPhoto` domain model.
- ❌ **Verified-booking enforcement + badge** ("Booked on That Time"), **compliment chips**, **sub-dimension ratings**, **anonymity toggle**, **public-visibility disclosure**, **owner reply**, **find-helpful**, **searchable reviews**, **topic-tagged snippets**.
- ❌ **Shoppable, service-tagged, before/after results gallery** as a first-class tab (the `Grid` tab today shows social posts, not tagged results).
- ❌ **Per-staff public profile page** under `/c` (only a flat Team list on the About tab).
- ❌ **The de-vanity-fication:** follower counts (`salon.followers`, `clientUser.followersCount`), like counts and "isFollowing" are wired throughout — they must stop driving anything rank-like.

> **Anti-pattern already in the codebase:** the explore "For you" grid and the salon header lean on likes/followers. The plan's Phase 0 explicitly *neutralises* these as ranking signals (keep them as decoration at most) so the social layer grows on reviews + results, per 16 Jun.

---

## Recommended UX calls

Opinionated decisions where the feedback left gaps. Tagged `[ASSUMPTION]` (proceed unless told otherwise) or `[OPEN — needs user decision]` (mirrored in Open Questions).

1. **Reviews-first, gallery-second, feed-last.** `[ASSUMPTION]` Ship the conversation layer (reviews + one owner reply) before the results gallery, and the local discovery feed last. Reviews are the cheapest to make trustworthy and the 16 Jun "preferred direction"; the feed is the most over-buildable piece and explicitly optional.

2. **Verified-booking is the *only* way to review.** `[ASSUMPTION]` A review can only originate from a `completed` booking (the gate already exists on the bookings detail page). Every review carries a **"Booked on That Time"** badge. This is the trust mechanic that beats fake-review platforms (Thumbtack's "Hired on Thumbtack"). No free-floating reviews from non-bookers.

3. **Neutralise vanity metrics — keep them decorative, never rank-bearing.** `[ASSUMPTION]` Follower and like counts stay as soft profile decoration at most; nothing — search results, explore order, "recommended" — is ever sorted by them. Rank only on **proximity → review quality (rating × volume) → recency**. `[OPEN]` whether to *remove* follower counts from the profile header entirely or merely stop ranking by them.

4. **The Grid tab becomes the Results gallery; keep a Posts surface separate (or fold it in).** `[ASSUMPTION]` Rename/repurpose the salon profile's first tab from a generic post grid to a **shoppable, service-tagged results gallery** (Fresha "Service Portfolios" + Thumbtack portfolio). Plain social posts/stories can remain as a lighter "updates" surface, but the *discovery-grade* grid is results tied to bookable services. `[OPEN]` keep stories/posts at all, or collapse everything into the results gallery?

5. **Compliment chips are beauty-specific and tappable; typing is always optional.** `[ASSUMPTION]` Lead the composer with stars → a row of beauty chips ("On time", "Gentle", "Great with colour", "Relaxing", "Clean space") → optional text + photo. A meaningful review in ~5 seconds drives the *volume* that makes a reviews-first layer work.

6. **Sub-dimension ratings: Result, Atmosphere, Value, Cleanliness.** `[ASSUMPTION]` Offer up to four optional sub-ratings (Shopee). They aggregate into the profile and give richer filterable signal than a single blob star.

7. **Anonymity + consent are defaults, not afterthoughts.** `[ASSUMPTION]` A "Post anonymously" toggle on every review and every client result photo, plus a plain-language "this may be shown publicly" line (Uber Eats / Shopee). Any **client-identifiable result photo requires explicit opt-in**, defaults to face-croppable / client-anonymous, and is revocable. Beauty/wellness is sensitive — this is a legal *and* trust requirement.

8. **One owner reply per review; no stranger-to-stranger comments.** `[ASSUMPTION]` The "comment" layer Vishal asked for = verified-client review + a single public owner reply + a "find helpful" reaction. No open commenting between clients, no client DMs — that invites moderation burden and harassment. (Salon↔client messaging already exists via the inbox; that stays 1:1.)

9. **Gallery is fed bottom-up from the B2B side.** `[ASSUMPTION]` Staff and the business upload to the offer gallery on the ink side (extending the existing `photos` module); those images, once tagged to a service and consented, *auto-surface* into the salon's collective coral gallery. The B2B hook is what makes the marketplace non-empty — build it first within each phase.

10. **Staff public profile = craft + credentials, zero clout.** `[ASSUMPTION]` Avatar + bio + specialties + languages + *their* results subset + *their* reviews subset + "Book with {name}" (Alan / Airbnb). No follower or view counts on staff cards — that would recreate the status game through the back door.

11. **Discovery feed reuses the existing Explore, recency/proximity-ordered.** `[ASSUMPTION]` Don't build a new TikTok-style feed; evolve `/c/explore` so the "Recommended near you" order is proximity/relevance/recency and the grid mixes business cards + tagged results. Map/List toggle already half-exists.

12. **Import-from-library lowers SMB activation.** `[ASSUMPTION]` Model an "Import from phone library / Instagram" entry on the B2B gallery upload (mocked — picks placeholder images). Real Instagram import is a later integration.

---

## Phase 0 — De-vanity-fication + the data backbone (do this before any social build)

**Goal:** Establish the review/result domain models and **stop vanity metrics from ranking anything**, so the social layer grows on the right foundation (16 Jun). No new user-facing screens — this is the substrate.

**Flow (developer-facing, no new UI):**
1. Introduce a `Review` model and a `ResultPhoto` model in a new single source of truth (`src/lib/data/social.ts` + a `socialStore`), seeded from the existing `SalonReview` / `SalonPost` demo data so nothing stops rendering.
2. Add a derived **rating distribution** + **average** helper (replacing the hard-coded `RATING_BARS = [82,12,4,1,1]` duplicated across the salon page and reviews page) computed from reviews.
3. Audit every consumer sort/rank path: explore order, search results, "recommended". Re-point them to **proximity → rating × volume → recency**. Demote `followers`/`likes` to pure decoration (or hide — Q3).
4. Add a `verifiedBooking: boolean` flag on reviews and route the existing bookings-detail "Leave review" action through the new model so the verified path is the canonical one.

**Changes:**
- Add `src/lib/data/social.ts` (`Review`, `ReviewChip`, `ResultPhoto`, helpers) and `src/lib/store/socialStore.ts` (session-local Zustand; `addReview`, `addOwnerReply`, `markHelpful`, `addResultPhoto`, `setResultConsent`).
- Refactor `src/app/c/salon/[id]/page.tsx` and `…/reviews/page.tsx` to read aggregates from `social.ts` instead of the inline `RATING_BARS` constant.
- Update `src/app/c/explore/page.tsx` ordering to never sort by likes/followers.
- Keep `b2c.ts` `Salon`/`ClientOffer` as-is; reviews/results move out into `social.ts` and are keyed by `salonId` / `offerId` / `staffId`.

**Data:** new `Review`, `ResultPhoto`, `ReviewChip` (see cross-cutting section). `SalonReview` is migrated into `Review`; `salon.followers`/`isFollowing` retained but **un-ranked**.

**Risk:** medium — it touches several existing coral screens, but it is mechanical and de-risks every later phase. No backend, so it stays a data-shape change.

---

## Phase 1 — Reviews & comments social layer (ship-first)

**Goal:** A trustworthy, high-volume, low-friction reviews layer tied to verified bookings, with one owner reply — the 16 Jun "preferred direction". (Coral.)

**Flow (the client journey, in order):**
1. **Trigger.** A booking is marked `completed` → the client sees a prompt on the booking detail and a notification ("How was your visit with {salon / stylist}?"). Only completed bookings can review (the gate already lives in `bookings/[id]/page.tsx`).
2. **Composer step 1 — Rating.** Large 1–5 star tap, then up to **three optional sub-dimension ratings** (Result, Atmosphere, Value) — Shopee pattern.
3. **Composer step 2 — Chips.** "What did you like?" row of tappable beauty compliment chips (On time / Gentle / Great with colour / Relaxing / Clean space). Submittable here with **no typing** — Keeta/Uber Eats pattern.
4. **Composer step 3 — Optional detail.** Free-text with a light guided prompt, **optional photo** of the result, a **"Post anonymously"** toggle, and a plain-language "this may be shown publicly" disclosure — Uber Eats / Shopee / Google Maps.
5. **Submit.** Review appears on the salon **Reviews** tab with a **"Booked on That Time"** verified badge. The owner is notified and can **reply once** publicly (the comment layer). Other clients can tap **"Helpful"**.
6. **Aggregation.** Reviews roll up into a star average + a **5→1 distribution bar** (now derived, from Phase 0) + **topic-tagged snippets** ("facial · 74") woven into the profile Overview — Google Maps. Reviews are **searchable** with a "Most relevant" sort (Thumbtack).
7. **Owner side (ink).** The Marketing → **Reviews** card (`src/app/app/marketing/page.tsx`, already stubbed) becomes the owner's aggregate feed: read reviews, reply once each, see the distribution.

**Changes:**
- Rebuild the review composer in `src/app/c/salon/[id]/page.tsx` (and reuse on `bookings/[id]/page.tsx`) as a shared `ReviewComposer` component — replace the plain stars+textarea sheet. Factor into `src/components/ui/consumer.tsx` or a new `src/components/social/ReviewComposer.tsx`.
- Add chip + sub-rating + anonymity + verified-badge rendering to the Reviews tab and `…/reviews/page.tsx`; add search box + "Most relevant" sort + "Helpful" count.
- Weave topic-tagged snippets into the salon profile Overview/About.
- Build the owner aggregate + single-reply view at `src/app/app/marketing/reviews/page.tsx` (new), writing replies via `socialStore.addOwnerReply`.
- Smoke needles: empty-reviews state, composer chip-only submit, owner-reply view.

**Data:** `Review` gains `chips: ReviewChip[]`, `subRatings?: { result?; atmosphere?; value?; cleanliness? }`, `anonymous: boolean`, `verifiedBooking: boolean`, `ownerReply?: { text; date }`, `helpfulCount: number`, `photoId?`. (Defined in Phase 0; populated here.)

**Risk:** medium — the composer is the most interaction-dense piece, but no new navigation. Owner-reply view is a new ink screen.

---

## Phase 2 — Results gallery tied to bookings + public profiles (the B2B hooks)

**Goal:** Make the marketplace non-empty and *shoppable*. Business and staff upload **service-tagged, optionally before/after, consented** result photos on the ink side; they surface bottom-up into the coral salon gallery and **per-staff public profiles**, every image one tap from booking — Fresha "Service Portfolios" + "Professional Profiles".

**Flow — B2B side first (ink), then B2C (coral):**

*B2B (ink) — fill the gallery:*
1. **Upload to the offer gallery.** Extend `src/app/app/services/[id]/photos/page.tsx`: pick photos (mock library + an "Import from phone / Instagram" entry), optionally **pair as Before / After**, and **tag each image to a bookable service** — this is what makes a result shoppable. The existing `offer.photos` placeholder model is upgraded to typed result records.
2. **Consent gate.** If a result includes a recognisable client, require an explicit **client opt-in** toggle before publish; default to face-croppable / client-anonymous; revocable.
3. **Staff fills their public profile.** On the team side (`src/app/app/team/[id]/page.tsx`, building on the existing `StaffProfile`), each member adds avatar + bio + **specialties + languages** + chooses which of *their* results show. The business's collective gallery thus fills itself from the bottom up.

*B2C (coral) — browse & book:*
4. **Salon profile gallery.** The first profile tab (today "Grid") becomes the **Results gallery** — a grid **filterable by service / category** (Thumbtack portfolio pills, Pinterest chips). Tabs settle to **Photos(=Results) / Services / Team / Reviews / About** with a **persistent bottom "Book now" bar** (Fresha) — non-negotiable so discovery is always one tap from a booking.
5. **Tap a result.** Opens full-screen showing the **tagged service**, the **staff member** who did it, before/after if paired, and a **"Book this" CTA** → drops into the existing `/c/salon/[id]/book` flow.
6. **Staff public profile (new).** Reachable from the **Team** tab: avatar + bio + specialties + languages + *their* results subset + *their* reviews subset + **"Book with {name}"** (Alan / Airbnb). No follower/view counts.

**Changes:**
- Upgrade `src/app/app/services/[id]/photos/page.tsx`: typed results, before/after pairing, service tag, consent toggle, import entry.
- Extend `StaffProfile` (`src/lib/types/staff.ts`) with `specialties`, `languages`, `resultPhotoIds`, and surface an editor on `src/app/app/team/[id]/page.tsx`.
- Coral: refactor `src/app/c/salon/[id]/page.tsx` Grid tab → filterable Results gallery; add a persistent bottom Book bar across tabs (today it only shows on Services); add a full-screen result viewer (reuse the Post sheet).
- New `src/app/c/salon/[id]/staff/[staffId]/page.tsx` — the staff public profile.
- A `getResultsForSalon / forStaff / forOffer` join in `social.ts` keyed off `offersStore` + `teamStore` so coral reads real B2B data, not hand-authored `b2c.ts` posts.
- Smoke needles: empty gallery state, before/after pair, consent-required state, staff profile empty state.

**Data:** `ResultPhoto { id; salonId; offerId; staffId?; beforeImage?; afterImage?; image; serviceTag; consent: "anonymous"|"opt_in"|"face_cropped"; clientConsented: boolean; createdAt }`. `StaffProfile` += `specialties: string[]`, `languages: string[]`, `resultPhotoIds: string[]`.

**Risk:** medium–high — the largest phase; crosses the B2B/B2C boundary and depends on the offer gallery + staff profile inputs existing first. Sequence the ink uploads ahead of the coral surfacing within the phase.

---

## Phase 3 — Local discovery / explore feed (LATER / optional, NO follower ranking)

**Goal:** A locality-led discovery surface so smaller businesses surface on proximity + review quality + recency, never followers (16 Jun). This is the **most over-buildable** piece — do not start here. (Coral.)

**Flow:**
1. **Explore.** Evolve `src/app/c/explore/page.tsx`: search + horizontal beauty category pills (Hair, Nails, Eyes & lashes, Facials, Massage, Barbering, Makeup) over a **"Recommended near you"** feed — Square Go.
2. **Feed ordering.** Recency / relevance / **proximity**-ranked grid of business cards + tagged result cards — **explicitly not** ranked by follower or like counts. Smaller businesses surface on locality + review quality + recency.
3. **Map ↔ List toggle.** See nearby venues geographically (the "Nearby" map preview already exists) — Square Go / Fresha map.
4. **Tap-through.** A result or business card → salon profile (Phase 2) → book.
5. **Optional inspiration grid.** Pinterest-style masonry of treatment results filtered by service — browsable and inspirational, ordering recency/relevance-based, never follower-based.

**Changes:**
- Re-order `/c/explore` "For you" / "Recommended" by proximity/rating/recency (building on Phase 0's de-ranking).
- Promote result cards (Phase 2) into the explore grid alongside business cards.
- Polish the existing Map/List toggle; tidy the filters sheet to match.
- Smoke needle: empty "nothing nearby" state.

**Data:** none new — reads `ResultPhoto` + `Review` aggregates + `salon.distance`. (Real geocoding stays out of scope — mock distances persist.)

**Risk:** medium — mostly re-ordering and surfacing existing data; the temptation to over-build a ranked social feed is the real risk, hence "optional / last".

---

## V2 / deferred

Parked or ambitious items, each with a recommended direction. All sit *after* the three phases above (which are themselves post-B2B).

- **Outbound "shareable social card."** Turn a top review or result into a shareable Instagram/Facebook flyer (Booksy "Social Post Creator") + an Instagram "Book Now" button. **Direction:** a high-leverage B2B *retention* hook — gives the owner a reason to keep posting. Mock a "Create share card" action on the Marketing → Reviews screen; real social-share export later.
- **Real Instagram / phone-library import.** **Direction:** Phase 2 ships a *mocked* import entry; wire the real Instagram Graph / device picker once there's a backend.
- **Client-side social profile depth.** `clientUser` already has posts/followers; **Direction:** keep the client profile lightweight and review/result-centric, do **not** grow it into a vanity influencer profile (back-door status game).
- **Real moderation + reporting.** **Direction:** report-a-review/photo flow + a moderation queue — deferred until there's a backend and a real legal review; the consent-default in Phase 2 is the interim guard.
- **Sub-dimension filtering on discovery.** **Direction:** let clients filter the feed by "Cleanliness 4.5+" etc. once sub-ratings have volume.
- **Real geocoding / live maps.** **Direction:** swap the mock map + mock distances for a real provider; mirror the Services-plan decision (mock first, real map only if explicitly chosen).
- **Stories / lightweight posts.** **Direction:** decide whether the existing stories/feed survive alongside the results gallery or fold into it (Q4); if kept, they stay decorative and offer-tagged, never ranked.

---

## Suggested order & rationale

`Phase 0 (de-vanity + data backbone) → Phase 1 (reviews & comments) → Phase 2 (results gallery + public profiles) → Phase 3 (discovery feed) → V2 deferred`

- **Phase 0 first, always.** The prototype already leans on follower/like counts; building social features on top without neutralising them first would entrench the exact thing 16 Jun banned. It is also the cheapest moment to introduce the `Review`/`ResultPhoto` domain.
- **Reviews before gallery** because reviews are the 16 Jun "preferred direction", the cheapest to make trustworthy (the verified-booking gate already half-exists), and they make every profile feel alive without any new content-creation burden on the business.
- **Gallery + profiles next** because they need the B2B hooks (offer gallery, staff profiles) and the verified-review foundation; they're what makes being on TT feel necessary (the 2 Jun vision) by showcasing craft.
- **Discovery feed last and optional** — the most over-buildable, least SMB-relevant piece; it only pays off once there are results + reviews to rank by proximity/quality.

The whole sequence is **gated behind B2B sign-off** (Services / Team / Analytics + Marketing per 16 Jun). Every phase ends green on `npx tsc --noEmit && npx next lint && npm run smoke`, with a smoke needle for each new empty/setup state. Persistence stays session-local Zustand; all fields are additive so the 5 seed salons keep rendering.

---

## Cross-cutting data-model changes

New single source of truth: **`src/lib/data/social.ts`** + **`src/lib/store/socialStore.ts`** (grep first — no existing social/review module). All additive / back-compatible.

```
// src/lib/data/social.ts
type ReviewChip = "on_time" | "gentle" | "great_with_colour" | "relaxing" | "clean_space" | string;

interface Review {
  id: string;
  salonId: string;
  offerId?: string;            // ties the review to a bookable service
  staffId?: string;            // ties to a practitioner (feeds staff profile)
  bookingId: string;           // verified-booking link
  verifiedBooking: boolean;    // → "Booked on That Time" badge
  author: string; initials: string;
  anonymous: boolean;          // "Post anonymously"
  stars: number;
  subRatings?: { result?: number; atmosphere?: number; value?: number; cleanliness?: number };
  chips: ReviewChip[];         // tappable compliments (no-typing path)
  text?: string;               // optional
  photoId?: string;            // optional result photo
  date: string;
  service: string;             // topic tag, e.g. "facial"
  helpfulCount: number;
  ownerReply?: { text: string; date: string };  // single owner reply (comment layer)
}

interface ResultPhoto {
  id: string;
  salonId: string;
  offerId: string;             // shoppable: tagged to a bookable service
  staffId?: string;            // who did it → feeds staff profile
  image: string;
  beforeImage?: string;        // before/after pairing (beauty-native)
  serviceTag: string;
  consent: "anonymous" | "opt_in" | "face_cropped";
  clientConsented: boolean;    // gate before publish; revocable
  createdAt: string;
}
```

Existing types extended:
- `StaffProfile` (`src/lib/types/staff.ts`) → `+ specialties: string[]`, `+ languages: string[]`, `+ resultPhotoIds: string[]` (Phase 2). Back-compatible defaults `[]`.
- `DemoOffer` photos (`src/lib/data/offers.ts`) → the placeholder `photos?: number[]` is superseded by `ResultPhoto[]` keyed on `offerId` (Phase 2); keep `photos` until the gallery migrates.
- Business-level (or per-offer) `inMarketplace: boolean` gallery flag, reusing the spirit of `classDetails.visibilityMode` so an owner can keep a result private.
- `SalonReview` in `b2c.ts` → migrated into `Review` (Phase 0); `salon.followers` / `isFollowing` retained but **never rank-bearing**.

No `Date.now()` / argless `new Date()` / `Math.random()` / `window` / `document` at module or render top level — `createdAt`/`date` are seeded strings, ids are stable (SSR-safe per CLAUDE.md).

---

## Open questions for the user

1. **Sequencing confirmation.** Confirm this whole section stays **behind** B2B sign-off (Services / Team / Analytics + Marketing) and is genuinely V2 — i.e. we do not start Phase 0 until the big three are signed off? (16 Jun implied; needs explicit go/no-go.)
2. **The red line as a written rule.** Is "rank only on proximity → review quality → recency; never followers/likes" the exact red line to enshrine, or do you want followers removed from the consumer surface entirely?
3. **Vanity metrics on profiles.** Keep follower counts as decoration on the salon/client profile (un-ranked), or **remove** them outright to avoid any back-door status game?
4. **Posts/stories vs results gallery.** Keep the existing Instagram-style posts + stories as a separate "updates" surface, or **fold everything into the shoppable results gallery** so there is one content type (every image bookable)?
5. **Owner reply scope.** One public reply per review (recommended), or a fuller back-and-forth thread? (We recommend single reply to cap moderation risk.)
6. **Consent default for client photos.** Confirm the default is **client-anonymous / face-croppable**, opt-in required before any recognisable client photo is published — and that this is acceptable for the UK legal posture (beauty/wellness sensitivity).
7. **Compliment-chip set.** Sign off the beauty-specific chip vocabulary ("On time / Gentle / Great with colour / Relaxing / Clean space") — and whether chips should vary by category (a dog-walker's chips differ from a colourist's).
8. **Discovery feed appetite.** Is Phase 3 (local explore feed) wanted at all, or do we stop at reviews + gallery + profiles and treat the feed as indefinitely deferred?
