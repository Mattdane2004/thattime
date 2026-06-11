# Onboarding flow spec — from Figma "🔴 Onbaording" (node 10960-10046)

Source: https://www.figma.com/design/6HHqcoM9m33N8Kz4R5E4tO/ThatTime---Internal?node-id=10960-10046
Captured screenshots: /tmp/figma/*.png (B2b + B2C sections, June 2026).

## Visual language (new, replaces old onboarding styling)

- Logo: chunky lowercase wordmark `that:time`, coral colon. Header pattern: back chevron · centered logo · "Help" right.
- Canvas: near-white `#F4F4F6`; value-reveal/marketing screens use warm cream `#F4F1EC`.
- Ink: very dark navy (`#101828`-ish). Secondary gray `#667085`.
- Accent: coral `#FF5A36` (logo colon, highlight words, big stat numbers, selected plan outline, staff day-chips).
- CTAs: full-width black pill (radius ~28px); disabled = gray pill. Secondary CTA = text link.
- Cards/inputs: white surface, 1px `#E4E7EC` border, radius 12–16. Selection cards with check circle on right (black filled when on).
- Illustrations: retro line-art with coral/purple/cream fills (barber chair, coins, coffee, calendar, card terminal).
- Feels like: Fresha / Airbnb — calm, generous spacing, progressive disclosure, bottom sheets, micro animations.

## Flow A — B2B owner

1. `welcome` (screen 1): "Welcome to that:time" + tagline. CTAs: Get started → intent; Log in → login.
2. `login` (screen 53): "Log in" — phone (+44 prefix), Continue (disabled until valid), Or, Apple/Google/Facebook. → password (screen 54: "Enter your password") → /app.
3. `intent` (screen 22): "What brings you to That Time?" — cards: "I'm here to book a service" (→ Flow C), "I run a business" (→ 4). Link "Joining a team? Enter your code" opens invite bottom sheet (→ Flow B). Continue + "I Already have an account".
4. `business intro` (screen 3): "Let's get your business set up" + image carousel placeholder. Get started.
5. `signup` (screen 4): "First, create your account" — phone + social. Phone → 6; social → 7.
6. `verify` (screen 25): "Enter your code" — 6-box SMS OTP, "Didn't get it? Resend", "Try Another way" opens bottom sheet (sec27474: "Send code another way" — SMS / Whatsapp). Verify → 8.
7. `review` (screen 21, social path): "Review and confirm" — imported first/last name, phone entry, marketing checkbox. Continue → SMS OTP (screen 65, same as 6) → 10 (loading) [social path skips password+email screens].
8. `password` (screen 59): "Create your professional account" — password + 3-segment strength meter, marketing checkbox. Continue → 9.
9. `profile` (screen 24): "Create your professional account" — First/Last name, Email with domain suggestion chips (@gmail.com…). Continue → 10.
10. `preparing` (screen 13): interstitial — "We accept clearpay" + card-terminal illustration + progress bar "Setting up your business profile …". Auto-advance → 11.
11. `business name` (screen 10): "What's your business called?" — input (e.g. Salon Soho). Save and continue.
12. `business type` (sec26191/26053): "What kind of business do you run?" — search + filter, card grid (Hair Salon ✂, Nails, Beauty, Spa, Wellness, Brows and lashes, Fitness, Aesthetics, Home DIY) multi-select; first pick gets amber "Primary" badge, others numbered badge; "Other" free text (Dog walking). Continue.
13. `team size` (sec28042): "How big is your team?" — radio rows: Just me / 2–5 / 6–9 / 10 or more.
14. `work from` (sec26325): "Where does {Business} work from?" — multi-select: Clients come to me / I travel to clients / I provide virtual service. Branching:
    - fixed → 15a; travel → 15b; virtual only → 16.
15. a) `address` (fixed26409): "Where's {Business} based?" — Use my location btn, or postcode input, "Hide my address until booking is confirmed" checkbox → confirm (fixed26534): BASE ADDRESS card + Edit, ADDRESS PRIVACY card, draggable map pin "Move this pin to your exact location", Confirm.
    b) `travel from` (fixed26475): "Where do you travel from?" (kept private) → `travel area` (fixed26613): base address card, map with coral radius circle, 1–50 mile slider ("10 miles / TRAVEL RADIUS"), TRAVEL FEE toggle + Flat rate/Per mile segmented + £ amount. Confirm.
    (If both fixed+travel selected: do 15a then 15b.)
16. `current tools` (sec26695): "How are you taking bookings right now?" — chip grid: Fresha, Booksy, Square, GlossGenius, Treatwell, Pen & paper, Instagram DMs, Just starting out, Something else.
17. `volume` (sec26759): "How many bookings do you take in a typical week?" — big number + slider with −/+.
18. `price` (sec26819): "what does a booking usually cost?" — big £ numeric entry.
19. `value loading` (sec26868, cream bg): "Right, let's talk bookings." / "Here's what 0% commission could mean for {Business}." progress bar "Checking your booking volume …". Auto-advance.
20. `value slides` (cream bg, "n of 5" + dash progress, Continue):
    1. "Your Chairs are filling up" — barber chair illo — coral `258` bookings a month (volume×4.3 approx).
    2. "Those bookings add up" — coins illo — coral `£3,456` "a month, before platform fees." (258×£13ish)
    3. "Their cut goes up. Ours doesn't." — commission bar card (Fresha £340/mo, Treatwell £330/mo, Booksie £300/mo purple bars) — coral `£0` Commission on That Time.
    4. "That's money with better places to be" — coffee cup illo — "Like those essential coffees that keep you going."
    5. "Your bookings stay yours" — calendar illo — coral `£250` "saved a month with 0% commission on That Time."
21. `trial` (sec27196): "Your free trial is ready" — "save £250" coral inline; benefits list; Team Size dropdown; plan cards Yearly £510/yr (−16% badge, coral outline selected) / Monthly £49.99/mo; "No card needed today."; CTA "Start 30 days free trial". (Note: payments may be removed/redirected to Stripe later.)
22. `first step` (Background, peach gradient): "What would you like to do first?" — cards: Set up your services / Move Your data from Fresha / Invite your team; link "Take a look around first" → /app.
23. `/app` Home (new design): cream bg, "Salon Soho ⌄" pill, bell+avatar, date, "Good afternoon, Emma", hours, stats card (Appointments 9 / Next gap 12:30 / Booked 70%), "Move Your data from Fresha" card, "Account set up" 4-step checklist + orange "Continue set up", "Needs attention 3", tab bar.
    Setup guide (Html→Body): persona cards (Founder 1/4 dark / Operator) + step cards (Done/Next/Open + minutes).

## Flow B — staff join

1. From intent screen link → `invite sheet` (sec27381): bottom sheet "Got an invite?" — ENTER INVITE CODE input, Join team (disabled until 6 digits), "No code? Ask your manager to send one over." (Invite also arrives via email link.)
2. `invited` (screen 62): "You're invited to join {Salon Soho}(coral)" — chips BUSINESS/ROLE/START DATE, benefits list, coral outline "Invited by Emma — if this doesn't look right…" card. Accept invite.
3. `password` (screen 58): "Set a password" — "you'll use this with sam@email.com", strength meter, terms checkbox.
4. `profile` (sec29049): "Create your profile" — avatar upload + "Skip for now", name/email/mobile. Save profile.
5. `week` (sec29185): "Here's your week, Sam(coral)" — day rows w/ coral initial circles, Off days gray. "Looks good".
6. `done` (sec29126): coral check circle — "You're on the team." + "Today — 3 bookings waiting" card. "Go to my schedule".
7. Staff Home: same dashboard as owner ("Good afternoon, Sam") with Up Next dark cards (Check in), Needs attention, Team today.

## Flow C — B2C client

1. `setup` (screen 40): photo carousel (barber photo) — "Let's get you set up". Get started.
2. `location` (screen 41): barber-chair illo — "Find your local business" → Continue raises permission dialog (screen 56: "Let that time use your locations" + Yes).
3. `notifications` (screen 43): bell+calendar illo — "Manage your bookings with ease" → dialog (screen 64: "Let that time send you notifications" + Yes).
4. `audience` (screen 44): photo carousel — "Discover services just Right you" — buttons Female / Male / Both.
5. `categories` (sec29685): "Select your usual or try something new" — photo grid multi-select (up to 5; Nail Salons, Fitness, Pet Grooming, Barbers, Massage, Tutoring, Tattoos…), coral selected state. Continue / skip.
6. `finding` (screen 45): "Finding services for you" — coral icon-tile carousel loading. Auto → home.
7. `client home` (Home): "Sunningdale, Ascot", "Good afternoon, Emma", Near you / Recommendations cards (Village barbers 5.0★ (765)), tabs Home/Find/Message/Schedule.
8. Booking flow (from a business card): `create account` (screen 48: email + domain chips + social) → `details` (screen 47: name, password, birthday, phone, terms) → `verify` (screen 49: SMS OTP) → confirm booking.

## Assets to export from Figma

- that:time wordmark (light + dark/cream variants)
- Illustrations: card terminal (s13), barber chair (26909 / b2c 41), coin stacks (26962), coffee cup (27086), desk calendar (27143), bell+calendar (b2c 43)
- Photos: barber carousel photo set (s40/s44), category grid photos (29685), Village barbers card photo (client home)
- Map tiles: address pin map (26534), radius map (26613)

## Stakeholder notes on canvas

- Payments: propose full in-app onboarding, trial starts with no payment; after trial direct to browser to pick a plan. "Remove monthly/yearly if not taking payment or redirect to Stripe."
- Staff invite arrives via email link too (deep link into accept screen).
- B2C long-term: social marketplace (upload images, follow people, see treatments).
