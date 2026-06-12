# Product screens spec — Figma "Section 1" (node 11990-94642)

Mid-fi wireframe system: ink navy (`#0F1A2E`, dark cards `#14181F`), fog `#F4F4F6`
surfaces, white cards, gray chips; red only for alerts (`#EF4444`) and calendar
load dots (green/amber/red). Lucide icons. No coral/cream on product surfaces.

## Shared chrome
- Header per tab: bold title + date · bell (red dot → /app/notifications) · avatar "SJ".
- Tab bar: Home · Schedule · Clients · Message · Add(+). Add opens the **Quick
  Actions** sheet (icon morphs to ✕ "Actions" while open): Add New Appointment /
  Add New Client / Block Time / Log Payment.

## Appointment card state machine (dark card, used on Home + My Day)
states: upcoming(soon) → arrived → in-progress → done.
- upcoming: "In 5min" pill (red "In 5 min" when late) + icon row (message ↺ ✕) +
  **Check In / Mark arrived**.
- arrived: "Arrived" pill + **Start service**.
- in-progress: "In progress" / "1h 30m left" pill + **Checkout / Take Payment**.
- Reschedule (↺) → full bottom sheet: PICK A DAY calendar (March 2026) + PICK A
  TIME chips (some struck out) → CTA "Confirm · Sat 21 Mar, 15:00"; card then
  shows "Moved · …" pill.
- Cancel (✕) → confirm sheet: "Cancel this appointment?" + context, buttons
  Cancel appointment / Keep it.
- Variants: Gap card (dashed "14:00–14:30 / 30min available" +), wrap-up ("That's
  a wrap for today" + New booking + share-link), empty day ("Your day is wide
  open"), Break card (Start → countdown + pause + End).

## Home (mid-fi)
Greeting block (ES avatar, hours) · stats (Appointments/Next gap/Booked) ·
Up Next card machine · "See your Schedule 3 >" · Needs Attention 3 (View / Send
Reminder / Approve, resolve in place) · Team Today 4/6 (status per member, sick
warning footer) · Your Shifts (Upcoming Shifts + Now badge; Time Off + Request
button, Approved/Pending).

## Schedule
Segmented My Day | Calendar | Team + calendar-settings button + ‹ date ›.
- My Day: agenda — appointment rows (chevron), gap rows "+ 30min open", Lunch
  Break row, "Now" divider, dark card for imminent appt, "End of shift · 17:00".
- Calendar: 3-day time grid, blocks (name+service), shades by state, lunch icon.
- Team: columns per staff (avatar, name, role) w/ status pills Done/Confirmed/
  No-show/Unconfirmed/Break + outlined **Class** block "Colour Masterclass 6/8".
- Calendar Settings sheet: Filter, 12h/24h toggle, JUMP TO DATE month with
  green/amber/red dots.
- Class sheet (Scheduled): seat-based · £65/seat · time/staff/location · capacity
  bar 6/8 · attendees summary (expand → list w/ payment/waiver status + Mark
  arrived each) · Message all / Add attendee / Cancel class · numbered AGENDA ·
  note · **Start class**.

## Clients
- List: search, **Add** (New Client sheet), sort "Recent booking", Filter,
  rows: avatar, name, ★rating, Next/Last visit, tags Regular/VIP/Allergy(dark)/
  Blocked(dark, dimmed row)/Inactive.
- Detail tabs Overview | Bookings | Forms | Reviews; header: avatar, name,
  Active badge, ★4.8, actions Book(dark)/Message/call.
  - Overview: Last Visit/Total Bookings/Client Since · Next appointment dark
    card (Reschedule/Cancel) · Allergies & preferences chips (+) · Contact card.
  - Bookings: next-appt card · search · All filter · past list w/ Completed/
    Cancelled badges and doc icons.
  - Forms: count + "1 pending/1 not sent" chips; rows Consultation/Allergy
    (View), Aftercare (amber Remind), Pre-Appointment (Not Sent) · Send New Form.
  - Reviews: ★4.7 (3 reviews) + cards (stars, date, text, service).

## Messages
- List: search, chips All/Unread 3/Group 2/Business 0, rows w/ unread dot +
  count, Team chat (stacked avatars), business row (building icon).
- Thread: header (name, phone, call/profile) · pinned Upcoming Appointment card
  (warning banner when rescheduled, service+date+time, Cancel/Reschedule) ·
  bubbles client-left/light + meta "Today, 09:14 · SMS", business-right/dark ·
  action bubble w/ **Select a date** (opens reschedule sheet) · system event
  "Appointment Rescheduled!" Previous struck → New · suggestion chips above
  composer · composer: + (in-thread quick actions: Add New Appointment /
  Reschedule / Log Payment), input, send.

## Notifications
Back header + ⋮ · chips All/Appointments/Messages/Reviews/Favourites · grouped
Today/Yesterday/date · types: message request (Accept/Decline) · ThatTime promo
(dark, Try it/What's new) · favourite (swipe → red delete) · cancellation ·
new booking · blog (read time) · review · rescheduled. Icon-badged avatars.

## Quick actions flows
- **New Appointment** (sheet, steps): 1 client (search, New client, Walk-in,
  list w/ next/last) → 2 service (category chips + rows w/ duration·cat·price) →
  3 staff chips + DAY calendar + TIME chips (disabled struck) → CTA Review
  appointment → 4 summary rows (Client/Service/Staff/Day/Time/Duration/Price) →
  Add Appointment → success sheet ✓ "Appointment added" (View in schedule/Done).
- **Block time** (sheet): type cards Custom/Lunch(30m·Unpaid)/Break(15m·Paid)/
  Training(60m·Paid)/Admin(30m·Paid)/+ New type (nested sheet: emoji+name,
  duration select, Paid/Unpaid) · Title optional · DATE calendar · Start/End
  time + duration hint · TEAM MEMBERS chips · FREQUENCY select · description ·
  "Online booking allowed during blocked time" checkbox · Save.
- **New Client** (sheet): name/mobile/email + More details (address, birthday,
  pronouns, occupation, HOW THEY FOUND YOU chips Phone/Walk-in/Referral/Other) ·
  Add Client disabled until name+mobile.
- **Log Payment / Checkout** (full screen): client header (n items · £) · ITEMS
  (remove ✕) · + Service / + Product sheets (rows w/ +) · Add discount sheet
  (10%/20%/£5/£10) · TIP No tip/10/15/20/Custom · totals Subtotal/Paid so far/
  Remaining · PAYMENTS list (added, removable) · TAKE REMAINING WITH tiles
  Card/Cash/Bank transfer/Gift card → method sheets:
  - Card: amount to charge (prefilled remaining) · "The card reader will prompt
    the client…" · Charge £X.
  - Cash: received + chips Exact·£140/£10/£20/£50 · "£130 will still be due —
    take the rest with another method." · CTA "Add £10 · split payment".
  - Bank transfer/Gift card: same pattern.
  - Footer: "£30 to pay — choose a payment method" until 0 → success screen
    (✓ £140, client, method rows, Email receipt, **Rate the visit**) →
    Rate your Client sheet (5 stars, trait chips Punctual/Quite/Late arrival/
    No-show/Easy to work with/Needs extra time/Talkative, private note, Submit,
    Skip) → Home.

## Stakeholder note (Messages section)
Internal team comments on client threads are a future feature (sticky note);
suggestion chips + booking-update cards are in scope now.
