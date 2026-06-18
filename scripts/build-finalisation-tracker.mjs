import fs from "node:fs/promises";
import path from "node:path";

const artifactToolPath = process.env.ARTIFACT_TOOL_PATH || "@oai/artifact-tool";
const { Workbook, SpreadsheetFile } = await import(artifactToolPath);

const repoRoot = process.cwd();
const outDir =
  process.argv[2] ||
  path.join(repoRoot, "outputs", "019ed619-8e87-74e3-a23d-f0aa9fa8b575");
const xlsxPath = path.join(outDir, "that-time-app-finalisation-tracker.xlsx");
const previewPath = path.join(outDir, "that-time-app-finalisation-tracker-dashboard.png");
const inspectPath = path.join(outDir, "that-time-app-finalisation-tracker.inspect.ndjson");

async function collectFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(fullPath)));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

function toRoute(filePath) {
  const appDir = path.join(repoRoot, "src", "app");
  const relDir = path.relative(appDir, path.dirname(filePath));
  if (!relDir) return "/";
  return `/${relDir.split(path.sep).join("/")}`;
}

function routeGroup(route) {
  if (route === "/") return "root";
  return `/${route.split("/")[1]}`;
}

const routeGroupMeta = {
  "/app": {
    label: "B2B business app",
    note: "Main vendor app shell plus Services, Team, Clients, Schedule, Checkout, Hub, Marketing and Setup.",
    gaps: "Missing separate domain hubs for settings, analytics, payments, products, resources, locations, integrations, billing, referrals, help and legal.",
  },
  "/onboarding": {
    label: "Business onboarding",
    note: "Owner/business setup, login/password, trial and staff onboarding handoff.",
    gaps: "Needs social phone capture and staff self-edit gaps from onboarding notes.",
  },
  "/c": {
    label: "B2C marketplace",
    note: "Consumer home, explore, salon profiles, booking, inbox, notifications, profile and settings.",
    gaps: "Post-B2B strategy needs less vanity/social emphasis and stronger review/availability/search model.",
  },
  "/new": {
    label: "Offer creation",
    note: "Service, class, bundle and subscription creation wizard.",
    gaps: "First-class Package entry and redemption logic are missing.",
  },
  "/client": {
    label: "Client-facing setup",
    note: "Client onboarding/check-in style flow for signup, audience, categories, location and notifications.",
    gaps: "Needs parity decisions against B2C and live app once evidence is available.",
  },
  "/login": {
    label: "Top-level login",
    note: "Standalone login entry.",
    gaps: "Confirm relationship to onboarding login and live phone-entry flow.",
  },
  "/staff": {
    label: "Staff app",
    note: "Standalone staff home route.",
    gaps: "Staff self-service requests and approvals remain planned in Team.",
  },
  root: {
    label: "Root",
    note: "Entry route.",
    gaps: "Route strategy should stay aligned with onboarding and vendor app shell.",
  },
};

function routeStatus(route) {
  if (["/app/marketing", "/app/setup", "/app/alerts"].includes(route)) return "Partial";
  if (route.startsWith("/app/services/") || route.startsWith("/app/team/") || route.startsWith("/app/clients/")) return "Partial";
  return "Built";
}

function routeNote(route) {
  if (route === "/app/marketing") return "Hub/stub; campaigns, discounts, reviews and waitlist automation still planned.";
  if (route === "/app/setup") return "Guide exists; many destination routes are still absent.";
  if (route === "/app/alerts") return "Potential duplicate of Notifications; decision open.";
  if (route.startsWith("/app/services/")) return "Deep service module route exists; finalisation depth varies by module.";
  if (route.startsWith("/app/team/")) return "Team detail/pay/schedule route exists; request/rota depth still planned.";
  if (route.startsWith("/app/clients/")) return "Client subroute exists; package/session and fee-preference depth still missing.";
  return "Page route exists in current prototype.";
}

const pageRouteFiles = (await collectFiles(path.join(repoRoot, "src", "app")))
  .filter((filePath) => filePath.endsWith(`${path.sep}page.tsx`))
  .sort();

const pageRouteRows = pageRouteFiles
  .map((filePath) => {
    const route = toRoute(filePath);
    const relFile = path.relative(repoRoot, filePath).split(path.sep).join("/");
    const group = routeGroup(route);
    return [
      group,
      route,
      relFile,
      routeStatus(route),
      routeGroupMeta[group]?.label || "Other",
      routeNote(route),
    ];
  })
  .sort((a, b) => a[1].localeCompare(b[1]));

const routeGroupRows = Object.entries(
  pageRouteRows.reduce((acc, row) => {
    acc[row[0]] = (acc[row[0]] || 0) + 1;
    return acc;
  }, {}),
)
  .map(([group, count]) => [
    group,
    count,
    routeGroupMeta[group]?.label || "Other",
    routeGroupMeta[group]?.note || "",
    routeGroupMeta[group]?.gaps || "",
  ])
  .sort((a, b) => b[1] - a[1]);

const COLORS = {
  ink: "#0F172A",
  navy: "#1E3A5F",
  blue: "#2563EB",
  paleBlue: "#DBEAFE",
  green: "#166534",
  paleGreen: "#DCFCE7",
  amber: "#92400E",
  paleAmber: "#FEF3C7",
  red: "#991B1B",
  paleRed: "#FEE2E2",
  purple: "#6D28D9",
  palePurple: "#EDE9FE",
  grey: "#475569",
  paleGrey: "#F1F5F9",
  white: "#FFFFFF",
  border: "#CBD5E1",
};

const statusStyles = {
  Built: { fill: COLORS.paleGreen, font: COLORS.green },
  Partial: { fill: COLORS.paleAmber, font: COLORS.amber },
  Missing: { fill: COLORS.paleRed, font: COLORS.red },
  "Plan only": { fill: COLORS.palePurple, font: COLORS.purple },
  Blocked: { fill: COLORS.paleGrey, font: COLORS.grey },
  Pending: { fill: COLORS.paleGrey, font: COLORS.grey },
};

const priorityStyles = {
  P0: { fill: COLORS.paleRed, font: COLORS.red },
  P1: { fill: COLORS.paleAmber, font: COLORS.amber },
  P2: { fill: COLORS.paleBlue, font: COLORS.blue },
  Future: { fill: COLORS.paleGrey, font: COLORS.grey },
};

const appAreas = [
  {
    area: "Home",
    surface: "B2B",
    routes: "/app",
    state: "Mostly built and close to sign-off.",
    built:
      "Header, role/location controls, Needs Attention, Up Next, revenue progress, KPIs, activity, shifts, team today.",
    missing:
      "Add time/day markers to revenue progress; decide whether Home Activity chart stays or moves to Analytics.",
    source: "Jun 17 Granola: approved with targeted addition.",
    status: "Partial",
    priority: "P0",
    rollout: "Main-screen deltas",
    dependencies: "Analytics decision",
    decision: "Confirm Activity chart treatment.",
    signoff: "Day 1",
    notes: "Lock this quickly so Austin UI rollout can proceed.",
  },
  {
    area: "Schedule",
    surface: "B2B",
    routes: "/app/schedule",
    state: "Visual layout built; deepest missing operational flows live here.",
    built:
      "My Day, Calendar, Team views, agenda/grid patterns, running-late/ready, out-of-hours visual treatment, dispute/status concepts.",
    missing:
      "Activity tab, cancellation/refund/no-show flow, payment states, staff/location edit, notify-client move prompt, multi-service add, discounts/codes, forms share, totals, online/mobile/in-salon states, custom time, deposits, recurring, pending requests, waitlist, package sessions.",
    source: "Jun 17 Granola: schedule visually approved; many flow additions.",
    status: "Partial",
    priority: "P0",
    rollout: "Schedule backbone",
    dependencies: "Settings, Payments, Clients, Messages, Packages, Marketing",
    decision: "Confirm multi-date booking and deposit defaults.",
    signoff: "Days 1-3",
    notes: "Also replace old block/unblock idea with block-only plus whole-day toggle.",
  },
  {
    area: "Clients",
    surface: "B2B",
    routes: "/app/clients, /app/clients/[id]",
    state: "Strong list/detail prototype.",
    built:
      "Search, sort, filters, tags, balances, contact sheet, profile tabs, notes, allergies, forms, wallet, reviews, settings.",
    missing:
      "Forms native share, upcoming appointment carousel plus View all, packages/pending sessions, client-level platform fee preference.",
    source: "Jun 17 Granola.",
    status: "Partial",
    priority: "P0",
    rollout: "Main-screen deltas",
    dependencies: "Packages, Payments, Settings",
    decision: "Confirm client-level fee override precedence.",
    signoff: "Days 1-2",
    notes: "Client policy display should wait for settings hierarchy.",
  },
  {
    area: "Messages",
    surface: "B2B",
    routes: "/app/messages, /app/messages/[id]",
    state: "Strong static prototype; needs store-backed controls and settings.",
    built:
      "Inbox, threads, pinned appointment, plus sheet, media/file actions, payment link card, class/archived states, class group guardrail.",
    missing:
      "Message permissions, app-download web restriction, messaging-only block, options sheet, payment-link state, class group vs broadcast.",
    source: "Jun 17 Granola plus messaging finalisation plan.",
    status: "Partial",
    priority: "P0",
    rollout: "Messaging/settings backbone",
    dependencies: "Notifications, Settings, Payments",
    decision: "Confirm message permissions wording and channel lock model.",
    signoff: "Days 2-4",
    notes: "Do not expose Sendbird as an owner-facing integration.",
  },
  {
    area: "Checkout and quick actions",
    surface: "B2B",
    routes: "/app/checkout",
    state: "Hub-and-spoke checkout built.",
    built:
      "Client card, items, discounts, tips, platform fee, deposits, saved cards, methods, product/service add patterns.",
    missing:
      "Outstanding-balance cut-off example, subscription-funded appointment display, book-next-session prompt, pre-made discount codes, waitlist tie-in, consistent deposit/payment-link rules.",
    source: "Jun 17 Granola.",
    status: "Partial",
    priority: "P0",
    rollout: "Main-screen deltas / payments",
    dependencies: "Payments, Marketing, Subscriptions, Packages, Schedule",
    decision: "Confirm discount-code source and subscription redemption copy.",
    signoff: "Days 1-4",
    notes: "Use same Show all pattern across dense pages.",
  },
  {
    area: "Services",
    surface: "B2B",
    routes: "/app/services, /app/services/[id], /new/*",
    state: "Broad first pass exists; finalisation plan mostly unbuilt.",
    built:
      "Catalogue tabs, service dashboard, variants, product prefs, upsells, resources, forms, notifications, settings, preview/publish.",
    missing:
      "Editable summary rows, mobile map/radius, full variants, smarter product prefs, upsell builder, resource timings, required forms, preset notifications, settings inheritance.",
    source: "Service finalisation plan; TT planning says Services are next focus.",
    status: "Partial",
    priority: "P0",
    rollout: "Services sign-off",
    dependencies: "Products, Resources, Locations, Settings, Marketing",
    decision: "Confirm service map/privacy and notification preset depth.",
    signoff: "Days 3-5",
    notes: "Do not split domain data back out of canonical offers.",
  },
  {
    area: "Bundles",
    surface: "B2B",
    routes: "/new/* bundle, /app/services/[id] bundle modules",
    state: "Documented as shipped and verified.",
    built:
      "Order/gaps, pricing/deposit, tabbed dashboard, inherited resources/forms.",
    missing:
      "Re-verify after packages/session redemption lands.",
    source: "Bundle finalisation plan.",
    status: "Built",
    priority: "P1",
    rollout: "Regression check",
    dependencies: "Packages, Checkout",
    decision: "Confirm terminology beside Packages.",
    signoff: "Day 5",
    notes: "Treat as stable unless client reopens.",
  },
  {
    area: "Subscriptions",
    surface: "B2B plus later B2C",
    routes: "/new/* subscription, /app/services/[id] subscription modules",
    state: "Substantial prototype exists; needs simplified model and checkout/member clarity.",
    built:
      "Subscription offer type, creation presence, dashboard foundations, copy/readback helpers.",
    missing:
      "Allowance model, simplified wizard, Plan/Members/Advanced dashboard, member lifecycle, checkout redemption visibility.",
    source: "Subscription finalisation plan; Jun 17 checkout feedback.",
    status: "Partial",
    priority: "P1",
    rollout: "Offers/payment clarity",
    dependencies: "Checkout, Clients, B2C",
    decision: "Confirm member redemption scope for deadline.",
    signoff: "Days 5-7",
    notes: "Consumer member offboarding can defer.",
  },
  {
    area: "Packages",
    surface: "B2B",
    routes: "/new/type, package routes missing",
    state: "Missing as a first-class entry.",
    built:
      "Some flexible package mechanics are buried in bundle services.",
    missing:
      "Package card/routing, shape screen, flexible/multiple builders, validity, redemption, dashboard, client pending sessions.",
    source: "Packages finalisation plan; Jun 17 pending session feedback.",
    status: "Missing",
    priority: "P0",
    rollout: "Booking/client dependency",
    dependencies: "Clients, Schedule, Checkout, Bundles",
    decision: "Confirm Package visible as separate entry.",
    signoff: "Days 3-6",
    notes: "This affects add-appointment and client records.",
  },
  {
    area: "Classes",
    surface: "B2B",
    routes: "/new/* class, /app/services/* class modules",
    state: "Class offer type exists; education/course depth remains planned.",
    built:
      "Class entries in offer catalogue and service tabs; class message seeds.",
    missing:
      "Course guardrail, recurrence/occurrence overrides, agenda/resources, duplicate class, calendar detail, class broadcast, certificates, analytics visibility.",
    source: "Classes finalisation plan.",
    status: "Partial",
    priority: "P1",
    rollout: "Services/messages depth",
    dependencies: "Messages, Resources, Analytics, Marketing",
    decision: "Confirm class broadcast needs in launch sign-off.",
    signoff: "Days 6-8",
    notes: "Keep arbitrary group-chat ban.",
  },
  {
    area: "Team",
    surface: "B2B",
    routes: "/app/team",
    state: "Phase 0 blockers documented as built and verified; deeper flows pending.",
    built:
      "Members, Shifts, Pay tabs, invite/member detail/schedule/permissions/pay foundations.",
    missing:
      "Holiday/sick/shift-swap requests, approvals, rotating rotas, coverage, freelancer workspace/services.",
    source: "Team finalisation plan; TT planning says Team is next focus.",
    status: "Partial",
    priority: "P0",
    rollout: "Team sign-off",
    dependencies: "Settings, Schedule, Payments",
    decision: "Confirm staff self-edit and request approval rules.",
    signoff: "Days 4-6",
    notes: "Keep Phase 0 foundation; add request depth only where sign-off probes.",
  },
  {
    area: "Settings and business rules",
    surface: "B2B",
    routes: "/app/settings missing, Hub settings row dead/partial",
    state: "Central surface missing and now critical.",
    built:
      "Per-service settings, BusinessDefaults type, some day-of actions.",
    missing:
      "Settings hub, inheritance model, cancellation/no-show/deposit policy, block-only rules, running-late rules, out-of-hours config, notification channel package.",
    source: "Settings plan plus Jun 17 block/payment/notification feedback.",
    status: "Missing",
    priority: "P0",
    rollout: "Backbone",
    dependencies: "Schedule, Payments, Messages, Notifications, Plans",
    decision: "Approve inheritance model and block-only replacement.",
    signoff: "Days 2-5",
    notes: "Without this, many screens will drift.",
  },
  {
    area: "Payments, fees and payouts",
    surface: "B2B",
    routes: "/app/payments missing; /app/checkout exists",
    state: "Checkout exists; payments administration missing.",
    built:
      "Checkout fee/deposit/payment-method patterns, some dispute and pay concepts.",
    missing:
      "Payments home, fee education, Connect activation, balances, payouts, per-staff payouts, outstanding balances, disputes evidence, BNPL.",
    source: "Payments finalisation plan; Jun 17 refund/dispute/payment visibility.",
    status: "Partial",
    priority: "P1",
    rollout: "Payments sign-off",
    dependencies: "Settings, Checkout, Team, Integrations",
    decision: "Confirm Stripe/BNPL demo depth and fee-preference precedence.",
    signoff: "Days 5-7",
    notes: "Disputes should feed appointment Activity log.",
  },
  {
    area: "Analytics",
    surface: "B2B",
    routes: "/app/analytics missing",
    state: "Dedicated route missing; Home has partial analytics cards.",
    built:
      "Revenue card, activity chart and some metric data on Home.",
    missing:
      "Overview, revenue detail, sales by category, team performance, occupancy/filler-chair.",
    source: "Analytics finalisation plan; TT planning priority.",
    status: "Missing",
    priority: "P1",
    rollout: "Scaffold/sign-off",
    dependencies: "Home, Marketing, Team, Payments",
    decision: "Decide Home vs Analytics split.",
    signoff: "Days 6-8",
    notes: "Keep simple, actionable, no peer benchmark.",
  },
  {
    area: "Marketing",
    surface: "B2B",
    routes: "/app/marketing",
    state: "Hub/stub exists with inert destination buttons.",
    built:
      "Marketing landing cards for Campaigns, Automations, Reviews, Rewards, Discount codes, Sales.",
    missing:
      "Campaigns, segments, automations, presets, discount codes, sales, reviews, waitlist/filler-chair, loyalty.",
    source: "Marketing finalisation plan; Jun 17 discount/waitlist/preset feedback.",
    status: "Partial",
    priority: "P1",
    rollout: "Scaffold/sign-off",
    dependencies: "Analytics, Notifications, Checkout, Schedule",
    decision: "Confirm discount-code and waitlist minimum launch scope.",
    signoff: "Days 6-8",
    notes: "Notification presets should be authored here and consumed by Services.",
  },
  {
    area: "Locations",
    surface: "B2B plus B2C",
    routes: "/app/locations missing; offer location editors exist",
    state: "Static concepts exist; no location domain.",
    built:
      "Offer-side location model/editor, Home location chip, B2C display fragments.",
    missing:
      "Location store/hub, add/edit, area privacy, per-location hours, real Home switcher, per-location pricing, customer Where step.",
    source: "Locations finalisation plan.",
    status: "Partial",
    priority: "P1",
    rollout: "Setup/domain scaffold",
    dependencies: "Services, Schedule, Home, B2C",
    decision: "Confirm location types and address privacy.",
    signoff: "Days 7-8",
    notes: "Appointment online/mobile/in-salon states depend on this.",
  },
  {
    area: "Resources",
    surface: "B2B",
    routes: "/app/resources missing; service resource module exists",
    state: "Per-service module exists; business catalogue missing.",
    built:
      "Room/equipment seed data and per-service resource assignment module.",
    missing:
      "Catalogue/store, add/edit resource, room-equipment links, partial allocation defaults.",
    source: "Resources finalisation plan.",
    status: "Partial",
    priority: "P1",
    rollout: "Services dependency",
    dependencies: "Services, Schedule, Locations",
    decision: "Confirm room/equipment depth for launch.",
    signoff: "Days 6-8",
    notes: "Avoid overbuilding resource allocation unless probed.",
  },
  {
    area: "Products",
    surface: "B2B",
    routes: "/app/products missing; service products and checkout product rows exist",
    state: "Preference and checkout plumbing partial; catalogue missing.",
    built:
      "Service product-preference module, fixed catalogues, checkout product line-items.",
    missing:
      "Unified product model/store, Products hub, add/edit product, validation/canonical names, similar-service suggestions, simple stock later.",
    source: "Products finalisation plan.",
    status: "Partial",
    priority: "P1",
    rollout: "Services dependency",
    dependencies: "Services, Checkout",
    decision: "Confirm retail/stock remains V2.",
    signoff: "Days 6-8",
    notes: "There are currently multiple parallel product lists.",
  },
  {
    area: "Forms",
    surface: "B2B",
    routes: "Service modules, client detail, appointment card needed",
    state: "Present in several contexts, no complete forms product.",
    built:
      "Service-level forms and client record forms display/download patterns.",
    missing:
      "Required toggles, preset wiring, native share, possible catalogue/builder.",
    source: "Jun 17 forms share feedback; service plan.",
    status: "Partial",
    priority: "P0",
    rollout: "Main-screen deltas",
    dependencies: "Clients, Schedule, Services",
    decision: "Confirm whether full forms builder is in scope.",
    signoff: "Days 1-4",
    notes: "Native share is P0 because it was explicitly requested.",
  },
  {
    area: "Notifications",
    surface: "B2B",
    routes: "/app/notifications, /app/alerts, settings route missing",
    state: "Feeds exist; preferences/channel model missing.",
    built:
      "Activity feed screens and service-level notification stage toggles.",
    missing:
      "One canonical feed decision, global event/channel preferences, paid-channel locks, Marketing presets, channel package rules.",
    source: "Jun 17 notification feedback; messaging-notifications plan.",
    status: "Partial",
    priority: "P0",
    rollout: "Settings backbone",
    dependencies: "Messages, Marketing, Plans, Services",
    decision: "Confirm paid channels and retire/keep Alerts.",
    signoff: "Days 2-5",
    notes: "In-app free; SMS/WhatsApp/email paid add-on.",
  },
  {
    area: "Business profile",
    surface: "B2B plus B2C",
    routes: "/app/business-profile missing; B2C salon profile exists",
    state: "Plan only.",
    built:
      "B2C salon profile prototype and some business display data.",
    missing:
      "Profile landing, shop details, booking link/QR, hours/address privacy, gallery, policy/safety, B2C config wiring.",
    source: "Business profile finalisation plan.",
    status: "Plan only",
    priority: "P1",
    rollout: "Setup/domain scaffold",
    dependencies: "Locations, Settings, B2C",
    decision: "Confirm launch minimum for listing management.",
    signoff: "Days 7-9",
    notes: "Useful for marketplace credibility but not deepest P0 blocker.",
  },
  {
    area: "Integrations",
    surface: "B2B",
    routes: "/app/integrations missing; Hub row dead",
    state: "Plan only; entry exists but no route/store.",
    built:
      "Hub setup row labelled Integrations.",
    missing:
      "Categorised hub, simulated connect/manage/disconnect, accounting/calendar/social/comms/channel rows, BNPL deep-link.",
    source: "Integrations finalisation plan.",
    status: "Plan only",
    priority: "P2",
    rollout: "Post-core setup",
    dependencies: "Payments, Marketing, Business profile",
    decision: "Confirm provider list and OAuth simulation level.",
    signoff: "Post P0",
    notes: "Sendbird is invisible infrastructure.",
  },
  {
    area: "Plans and billing",
    surface: "B2B",
    routes: "/app/plans-billing missing",
    state: "Plan only.",
    built:
      "Onboarding mentions payments/BNPL; some upgrade gate concepts exist in Team docs.",
    missing:
      "Trial step rebuild, billing hub, upgrade gate, past-due recovery, plan comparison, paid notification package.",
    source: "Plans and billing finalisation plan.",
    status: "Plan only",
    priority: "P1",
    rollout: "Settings/pricing dependency",
    dependencies: "Notifications, Team, Payments",
    decision: "Confirm IAP vs web billing and paid channel packaging.",
    signoff: "Days 7-9",
    notes: "Paid SMS/WhatsApp/email locks depend on this.",
  },
  {
    area: "Referrals",
    surface: "B2B/B2C undecided",
    routes: "/app/referrals missing",
    state: "Plan only.",
    built:
      "No meaningful implementation beyond roadmap notes.",
    missing:
      "Invite home, track tab, how-it-works, terms/FAQ, reward credit.",
    source: "Referrals finalisation plan.",
    status: "Plan only",
    priority: "P2",
    rollout: "Post-core",
    dependencies: "Plans, Payments",
    decision: "Vendor-only, client-only, or both?",
    signoff: "Post P0",
    notes: "Do not spend deadline time unless promoted.",
  },
  {
    area: "Help, FAQs and legal",
    surface: "B2B/B2C",
    routes: "Help/legal routes missing or shallow",
    state: "Plan only.",
    built:
      "Some settings/legal entry concepts in consumer/profile areas.",
    missing:
      "Help hub, search/articles, support form, legal index, privacy self-serve, changelog.",
    source: "Content/legal finalisation plan.",
    status: "Plan only",
    priority: "P2",
    rollout: "Post-core",
    dependencies: "Account, Settings",
    decision: "Confirm required legal/support minimum for sign-off.",
    signoff: "Post P0",
    notes: "Needed before launch, but can be content scaffold.",
  },
  {
    area: "Account and personal preferences",
    surface: "B2B plus B2C reference",
    routes: "B2B account/preferences routes missing; /c/settings has references",
    state: "Plan only for B2B.",
    built:
      "Consumer preference references; role switcher/profile entry concepts.",
    missing:
      "Account hub, edit profile/staff bio, security, B2B prefs, appearance/language, switch role/client view.",
    source: "Account preferences plan.",
    status: "Plan only",
    priority: "P1",
    rollout: "Settings scaffold",
    dependencies: "Notifications, Team, Onboarding",
    decision: "Confirm Profile tab vs Hub placement.",
    signoff: "Days 7-9",
    notes: "Notification preferences may land here or Settings.",
  },
  {
    area: "B2C marketplace",
    surface: "B2C",
    routes: "/c/home, /c/explore, /c/salon/[id], /c/bookings, /c/inbox, /c/profile",
    state: "Sizeable prototype exists; strategy is post-B2B.",
    built:
      "Home feed, explore, salon profile, booking/inbox/profile/settings surfaces, social signals.",
    missing:
      "Benchmark workshop outcomes, checkout/payment alignment, de-vanity-fication, results/reviews/gallery credibility, local discovery rules.",
    source: "Internal B2C alignment workshop and social marketplace plan.",
    status: "Partial",
    priority: "P2",
    rollout: "Post-B2B",
    dependencies: "Business profile, Locations, Payments",
    decision: "Confirm whether to tone down vanity metrics now.",
    signoff: "Post B2B red line",
    notes: "B2B sign-off remains the red line.",
  },
  {
    area: "Live That Time Pro comparison",
    surface: "Existing app audit",
    routes: "https://vendor.that-time.co.uk/enter-phone",
    state: "Blocked by in-app browser URL policy.",
    built:
      "Exact vendor URL is known; fallback structural review completed against old local app only.",
    missing:
      "Authenticated audit of current live That Time Pro structure, navigation and implemented flows. Need screenshots, screen recording, or policy-approved access.",
    source: "User supplied URL; Browser Use blocked navigation by URL policy.",
    status: "Blocked",
    priority: "P0",
    rollout: "Audit dependency",
    dependencies: "User-provided screenshots/screen recording or approved access path",
    decision: "Provide live-app evidence without storing credentials.",
    signoff: "Before final gap lock",
    notes: "Do not store credentials in repo/docs.",
  },
];

const granolaRows = [
  [
    "Home",
    "Add time/day markers to the revenue progress bar.",
    "Implement markers for day and week views.",
    "Open",
    "P0",
    "Home",
    "Confirm Home Activity chart placement.",
    "Granola Jun 17",
  ],
  [
    "Schedule - blocks",
    "Remove separate unblock feature; block only, whole-day toggle, edit/delete blocks.",
    "Replace old block/unblock plan with block-only model.",
    "Open",
    "P0",
    "Schedule / Settings",
    "Approve block-only as final.",
    "Granola Jun 17",
  ],
  [
    "Appointment card",
    "Activity log/evidence tracker for reminders, forms, payments, cancellations, disputes.",
    "Add Activity tab and event model.",
    "Open",
    "P0",
    "Schedule",
    "Confirm event types.",
    "Granola Jun 17",
  ],
  [
    "Cancellation/refund",
    "Full refund, deposit only, custom, waive/enforce policy, no-show path.",
    "Build appointment-card cancellation/refund flow.",
    "Open",
    "P0",
    "Schedule / Payments / Settings",
    "Confirm policy hierarchy.",
    "Granola Jun 17",
  ],
  [
    "Appointment payments",
    "Show paid in full, deposit paid plus balance, or unpaid outside checkout.",
    "Add payment summary to appointment card.",
    "Open",
    "P0",
    "Schedule / Checkout",
    "Confirm copy and statuses.",
    "Granola Jun 17",
  ],
  [
    "Add appointment",
    "Custom time, deposit link, pending sessions, recurring, pending requests, waitlist, maybe multi-date.",
    "Expand add-booking flow.",
    "Open",
    "P0",
    "Schedule",
    "Decide multi-date and deposit defaults.",
    "Granola Jun 17",
  ],
  [
    "Clients",
    "Forms share, upcoming appointment carousel, packages/pending sessions, platform fee preference.",
    "Update client detail and settings.",
    "Open",
    "P0",
    "Clients",
    "Confirm fee override precedence.",
    "Granola Jun 17",
  ],
  [
    "Messages",
    "Allow before booking / after booking only / disable; no web messaging; block messaging separately.",
    "Add message permission settings.",
    "Open",
    "P0",
    "Messages / Settings",
    "Confirm exact permission labels.",
    "Granola Jun 17",
  ],
  [
    "Notifications",
    "In-app free; SMS/WhatsApp/email paid add-on; channel selection per type; locked paid channels.",
    "Build B2B notification preferences and plan locks.",
    "Open",
    "P0",
    "Notifications / Plans",
    "Confirm paid channel package.",
    "Granola Jun 17",
  ],
  [
    "Checkout",
    "Outstanding balance cut-off behaviour and reusable Show all pattern.",
    "Add example screen/state and reuse pattern.",
    "Open",
    "P0",
    "Checkout",
    "Confirm dense-list threshold.",
    "Granola Jun 17",
  ],
  [
    "Checkout/subscriptions",
    "Show subscription-funded appointments and amount deducted from wallet/remaining.",
    "Add subscription payment display.",
    "Open",
    "P1",
    "Checkout / Subscriptions",
    "Confirm subscription copy.",
    "Granola Jun 17",
  ],
  [
    "Checkout next session",
    "Add a book-next-session prompt after checkout for remaining package/subscription sessions or obvious recurring follow-up.",
    "Add post-payment prompt linked to Schedule availability and package/subscription balance.",
    "Open",
    "P1",
    "Checkout / Packages / Subscriptions",
    "Confirm when prompt appears and whether staff can dismiss it.",
    "Granola Jun 17",
  ],
  [
    "Daily cadence",
    "Daily 09:00-10:30 sign-off meetings from Jun 18.",
    "Use daily lock notes and update tracker.",
    "Active",
    "P0",
    "Project",
    "Mathew owns final decisions.",
    "Granola Jun 17",
  ],
];

const roadmapRows = [
  [
    "Main-screen deltas",
    "Day 1",
    "Lock visible changes on approved screens.",
    "Home revenue markers, client forms share, appointment carousel, checkout cut-off example, block-only Add Block.",
    "Granola Jun 17",
    "Main screens ready for UI rollout.",
  ],
  [
    "Schedule backbone",
    "Days 1-3",
    "Build missing operational appointment flows.",
    "Activity tab, cancellation/refund/no-show, payment summary, staff/location edit, notify-client prompt, forms share, totals.",
    "Settings, Payments, Forms",
    "Schedule sign-off pack.",
  ],
  [
    "Add booking",
    "Days 2-4",
    "Complete booking creation decisions.",
    "Multi-service, custom time, deposits/link, pending sessions, recurring, pending requests, waitlist.",
    "Packages, Checkout, Marketing",
    "Add Appointment sign-off.",
  ],
  [
    "Settings / notifications",
    "Days 2-5",
    "Create shared rules backbone.",
    "Settings hub, inheritance, cancellation/deposit defaults, message permissions, paid channel locks.",
    "Plans, Messages, Schedule",
    "Policy/rules sign-off.",
  ],
  [
    "Services and Team",
    "Days 3-6",
    "Finish next priority sections.",
    "Service summary edits/modules; team request/rota/coverage depth.",
    "Settings, Locations, Products, Resources",
    "Services and Team sign-off.",
  ],
  [
    "Payments",
    "Days 5-7",
    "Make payments admin reviewable.",
    "Payments home, fee education, balances, payouts, disputes, BNPL scoping.",
    "Checkout, Team, Settings",
    "Payments sign-off/scaffold.",
  ],
  [
    "Marketing / Analytics",
    "Days 6-8",
    "Scaffold paired growth/reporting surfaces.",
    "Analytics overview, occupancy; Marketing hub, discount codes, waitlist, presets.",
    "Checkout, Notifications",
    "Growth/reporting sign-off.",
  ],
  [
    "Setup domains",
    "Days 7-9",
    "Link remaining Hub rows with credible scaffolds.",
    "Locations, Resources, Products, Business profile, Account, Plans/Billing minimums.",
    "Services, B2C, Settings",
    "Remaining sections mapped and signed off.",
  ],
  [
    "Live app audit",
    "ASAP when evidence is provided",
    "Compare live That Time Pro to prototype.",
    "Navigation map, existing-app feature parity, missing/live-only workflows.",
    "Screenshots/screen recording or approved access",
    "Parity delta added to this tracker.",
  ],
];

const decisionRows = [
  [
    "Live That Time Pro evidence",
    "Provide screenshots, a short screen recording, or another policy-approved access path for https://vendor.that-time.co.uk/enter-phone.",
    "The URL is known, but browser-controlled navigation is blocked by URL policy.",
    "Blocked",
    "Mathew",
  ],
  [
    "Home Activity chart",
    "Keep a small trend on Home; move deeper analytics to /app/analytics.",
    "Home should stay operational; Analytics owns detail.",
    "Open",
    "Mathew",
  ],
  [
    "Deposit defaults",
    "Use business/service default with per-appointment override.",
    "Supports speed and exception handling.",
    "Open",
    "Mathew/client",
  ],
  [
    "Multi-date booking",
    "Keep only if client confirms it is critical for launch; otherwise scaffold/defer.",
    "Shabbir liked it but it risks overcrowding Add Appointment.",
    "Open",
    "Mathew/client",
  ],
  [
    "Settings hierarchy",
    "Business default -> service override -> appointment/client exception.",
    "Prevents cancellation/deposit/fee drift.",
    "Open",
    "Mathew",
  ],
  [
    "Package entry",
    "Show Package as a separate creation entry while reusing bundle mechanics underneath.",
    "Matches user mental model and Jun 17 pending-session needs.",
    "Open",
    "Mathew/client",
  ],
  [
    "Platform fee preference",
    "Business default, client override, checkout one-off override.",
    "Supports client-level request while preserving defaults.",
    "Open",
    "Mathew/client",
  ],
  [
    "Paid notification channels",
    "In-app free; SMS and WhatsApp paid; confirm email.",
    "Granola says paid channel package; exact scope affects Plans/Billing.",
    "Open",
    "Mathew/client",
  ],
  [
    "Alerts vs Notifications",
    "Fold /app/alerts into /app/notifications.",
    "Two feeds create confusion.",
    "Open",
    "Mathew",
  ],
  [
    "B2C vanity metrics",
    "Do not expand vanity mechanics; move toward reviews/results/availability.",
    "B2C workshop flagged marketplace strategy as post-B2B.",
    "Open",
    "Mathew",
  ],
];

const routeRows = [
  ["B2B Home", "/app", "Built", "Home dashboard and operational overview."],
  ["Schedule", "/app/schedule", "Partial", "Main views built; flow/state depth missing."],
  ["Clients", "/app/clients, /app/clients/[id]", "Partial", "List/detail built; package/session/settings depth missing."],
  ["Messages", "/app/messages, /app/messages/[id]", "Partial", "Static thread prototype; settings/store controls missing."],
  ["Checkout", "/app/checkout", "Partial", "Strong till; subscription, next-session, codes and outstanding patterns missing."],
  ["Services", "/app/services, /app/services/[id]", "Partial", "Broad offer management built; module finalisation pending."],
  ["Team", "/app/team", "Partial", "Phase 0 foundation; requests/rotas/coverage missing."],
  ["Hub", "/app/hub", "Partial", "Several rows/cards are dead or scaffold-only."],
  ["Marketing", "/app/marketing", "Partial", "Landing stub; flows missing."],
  ["Notifications", "/app/notifications, /app/alerts", "Partial", "Feeds exist; preferences/channel rules missing."],
  ["Setup", "/app/setup", "Partial", "Guide exists; many destinations missing."],
  ["Analytics", "/app/analytics", "Missing", "No dedicated route."],
  ["Settings", "/app/settings", "Missing", "Critical business rules hub missing."],
  ["Payments", "/app/payments", "Missing", "Checkout exists; admin hub missing."],
  ["Locations", "/app/locations", "Missing", "Domain hub/store missing."],
  ["Resources", "/app/resources", "Missing", "Service module exists; catalogue missing."],
  ["Products", "/app/products", "Missing", "Service/checkout product fragments exist; catalogue missing."],
  ["Integrations", "/app/integrations", "Missing", "Hub row exists; route missing."],
  ["Business profile", "/app/business-profile", "Missing", "B2C profile exists; B2B config missing."],
  ["Offer creation", "/new/*", "Partial", "Service/class/bundle/subscription present; Package missing."],
  ["Onboarding", "/onboarding/*", "Partial", "Main flow built; social phone capture/staff self-edit gaps noted."],
  ["Client flows", "/client/*", "Partial", "Client-facing flows exist, need parity decisions."],
  ["B2C", "/c/*", "Partial", "Large consumer prototype; strategy post-B2B."],
  [
    "Live That Time Pro",
    "https://vendor.that-time.co.uk/enter-phone",
    "Blocked",
    "Authenticated parity audit blocked by in-app browser URL policy; screenshots or recording needed.",
  ],
];

const liveAuditRows = [
  [
    "Login",
    "Phone entry, password, any OTP/error/loading states",
    "Actual authentication flow and copy",
    "/onboarding/login, /onboarding/login/password",
    "Needed",
    "P0",
    "",
    "",
  ],
  [
    "Landing",
    "First screen after login",
    "Default live-app home/dashboard and primary CTA",
    "/app",
    "Needed",
    "P0",
    "",
    "",
  ],
  [
    "Global navigation",
    "Bottom tabs, side menu, hub/menu/account areas",
    "Actual IA and section names",
    "/app layout, /app/hub",
    "Needed",
    "P0",
    "",
    "",
  ],
  [
    "Schedule",
    "Main calendar/list views, filters, team/staff view",
    "Calendar model, statuses, staff/location concepts",
    "/app/schedule",
    "Needed",
    "P0",
    "",
    "",
  ],
  [
    "Appointment detail",
    "Existing booking card/detail, actions, payment/refund/cancel states",
    "What the live app already supports on appointments",
    "Schedule appointment-card plan",
    "Needed",
    "P0",
    "",
    "",
  ],
  [
    "Add appointment",
    "Client select, service select, time select, deposit/payment options",
    "Booking creation flow and missing prototype behaviours",
    "Add-booking P0 plan",
    "Needed",
    "P0",
    "",
    "",
  ],
  [
    "Clients",
    "Client list, search/filter, detail page, appointments/forms/settings",
    "CRM structure, client record depth",
    "/app/clients, /app/clients/[id]",
    "Needed",
    "P0",
    "",
    "",
  ],
  [
    "Messages",
    "Inbox, thread, attachments/actions/settings if present",
    "Messaging permissions, chat depth, class/business threads",
    "/app/messages",
    "Needed",
    "P0",
    "",
    "",
  ],
  [
    "Checkout / payment",
    "Take payment, outstanding balance, methods, discounts, fees",
    "Live till behaviour and fee/payment copy",
    "/app/checkout",
    "Needed",
    "P0",
    "",
    "",
  ],
  [
    "Services / offers",
    "Services list, service detail/edit, packages/subscriptions/classes if present",
    "Existing offer model and terminology",
    "/app/services, /new/*",
    "Needed",
    "P0",
    "",
    "",
  ],
  [
    "Team",
    "Members, shifts/rota, pay, staff permissions/detail",
    "Live workforce structure",
    "/app/team",
    "Needed",
    "P0",
    "",
    "",
  ],
  [
    "Settings / rules",
    "Business profile, hours, cancellation, deposits, notifications, payments",
    "Where global rules live today",
    "Settings finalisation plan",
    "Needed",
    "P0",
    "",
    "",
  ],
  [
    "Marketing / analytics",
    "Any live reporting, campaigns, codes, reviews or fill-empty-slot tools",
    "Whether planned P1 areas already exist live",
    "Marketing and Analytics plans",
    "Needed",
    "P1",
    "",
    "",
  ],
  [
    "Products / resources / locations",
    "Any inventory, rooms/equipment, locations, mobile/online setup",
    "Existing operational setup depth",
    "Products, Resources, Locations plans",
    "Needed",
    "P1",
    "",
    "",
  ],
  [
    "Account / billing / support",
    "Profile, plans/billing, help/legal, integrations, referrals",
    "Remaining setup/account structure",
    "Account, Plans, Help, Integrations plans",
    "Needed",
    "P1",
    "",
    "",
  ],
];

const implementationAnchorRows = [
  [
    "B2B shell and navigation",
    "src/app/app/layout.tsx; src/components/app/AppFrame.tsx; src/components/app/AppTabBar.tsx; src/components/ui/organisms/AppHeader.tsx",
    "src/lib/store/appStore.ts; src/lib/store/roleStore.ts",
    "Master plan; Route Detail sheet",
    "Tab bar owns quick-action entry and appointment sheet host; new P0 flows should fit the shell first.",
  ],
  [
    "Home",
    "src/app/app/page.tsx; src/components/app/UpNextCard.tsx; src/components/app/charts.tsx",
    "src/lib/data/home.ts; src/lib/data/dashboard.ts; src/lib/store/roleStore.ts",
    "docs/sign-off-changes.md",
    "Role-aware and mostly signed off; add revenue markers without turning Home into full Analytics.",
  ],
  [
    "Schedule and calendar",
    "src/app/app/schedule/page.tsx; src/components/app/QuickActions.tsx; src/components/app/AppointmentSheet.tsx",
    "src/lib/data/product.ts; src/lib/store/appStore.ts",
    "docs/schedule-feedback-coverage.md; Granola Jun 17",
    "Rich but fixture-driven. Activity, refunds, waitlist, packages, requests and notification prompts need shared state.",
  ],
  [
    "Appointment detail",
    "src/components/app/AppointmentSheet.tsx; src/components/app/UpNextCard.tsx",
    "src/lib/store/appStore.ts; src/lib/data/product.ts",
    "Schedule section in master plan",
    "Natural home for Activity, payment summary, forms share, cancellation/refund, staff/location edits and event history.",
  ],
  [
    "Checkout / quick payment",
    "src/app/app/checkout/page.tsx; src/components/app/QuickActions.tsx",
    "src/lib/store/appStore.ts; checkoutTotals(); src/lib/data/product.ts",
    "Granola Jun 17; payments finalisation plan",
    "Strong hub-and-spoke till. Add subscription display, discount codes, outstanding cut-off and book-next-session prompts.",
  ],
  [
    "Clients",
    "src/app/app/clients/page.tsx; src/app/app/clients/[id]/page.tsx; src/app/app/clients/[id]/wallet/page.tsx; src/app/app/clients/[id]/settings/page.tsx",
    "src/lib/data/product.ts; src/lib/types/client.ts; src/lib/store/appStore.ts",
    "Client P0 section; settings hierarchy",
    "Mostly local state seeded from fixtures. Package sessions, fee preference and policy inheritance need shared models.",
  ],
  [
    "Messages",
    "src/app/app/messages/page.tsx; src/app/app/messages/[id]/page.tsx",
    "src/lib/data/product.ts conversations; src/lib/store/appStore.ts",
    "Messaging/notifications finalisation plan",
    "Thread UI is strong; permissions, app-download restriction, paid channels and messaging-only block are not state-backed.",
  ],
  [
    "Services and offers",
    "src/app/app/services/page.tsx; src/app/app/services/[id]/page.tsx; src/app/app/services/[id]/*; src/app/new/*",
    "src/lib/store/offersStore.ts; src/lib/store/wizardStore.ts; src/lib/data/offers.ts; src/lib/data/bundles.ts; src/lib/data/subscriptions.ts; src/lib/data/products.ts",
    "Service, bundle, class, subscription and package finalisation plans",
    "Broadest route depth. Package needs first-class entry and session/redemption behaviour without duplicating bundle mechanics.",
  ],
  [
    "Team",
    "src/app/app/team/page.tsx; src/app/app/team/[id]/*; src/app/app/team/invite/page.tsx; src/app/app/team/pay/[runId]/page.tsx",
    "src/lib/store/teamStore.ts; src/lib/data/team.ts; src/lib/types/staff.ts",
    "Team finalisation plan",
    "Session-persistent roster/pay/schedule foundation; requests, approvals, rota depth and coverage still need modelling.",
  ],
  [
    "Hub and setup",
    "src/app/app/hub/page.tsx; src/app/app/setup/page.tsx; src/app/app/setup/import/page.tsx",
    "src/lib/data/setupGuide.ts; src/lib/data/dashboard.ts; src/lib/store/roleStore.ts",
    "All migration plans",
    "Hub exposes many destination labels as dead buttons. Promote P0/P1 domains into routes or mark scaffold/deferred.",
  ],
  [
    "Notifications and alerts",
    "src/app/app/notifications/page.tsx; src/app/app/alerts/page.tsx; src/app/app/services/[id]/notifications/page.tsx",
    "src/lib/data/alerts.ts; src/lib/data/offers.ts notification stages",
    "Messaging/notifications plan; Plans/Billing plan",
    "Decide whether Alerts folds into Notifications. Paid channel locks need Plans/Billing and global preferences.",
  ],
  [
    "Onboarding",
    "src/app/onboarding/*; src/components/onboarding2/*",
    "src/lib/store/onboarding2.ts; src/lib/types/business.ts",
    "docs/onboarding-flow.md",
    "Broad business onboarding exists; social phone capture, staff self-edit and live phone-entry parity remain open.",
  ],
  [
    "B2C and client-facing flows",
    "src/app/c/*; src/app/client/*; src/components/ui/consumer.tsx",
    "src/lib/data/b2c.ts; src/lib/data/clientApp.ts",
    "B2C alignment notes; social marketplace vision plan",
    "Sizeable prototype exists but should stay behind B2B sign-off. Prioritise reviews/search/availability over vanity mechanics.",
  ],
  [
    "Missing domain hubs",
    "No dedicated routes yet for settings, payments, analytics, locations, resources, products, integrations, billing/plans, referrals, help/legal, account/preferences",
    "src/lib/data/locations.ts; src/lib/data/products.ts; service modules; src/lib/types/business.ts",
    "Matching docs/migrations/*-finalisation-plan.md",
    "Build scaffold routes only where daily sign-off needs IA clarity; do not treat service-level modules as business-wide catalogues.",
  ],
  [
    "Validation and handoff",
    "smoke.tsx; package.json; scripts/build-finalisation-tracker.mjs",
    "npm run smoke; tracker workbook",
    "Agent handoff checklist",
    "Every new route/state should get smoke needles and keep this plan plus the tracker aligned.",
  ],
];

function countsBy(rows, key) {
  return rows.reduce((acc, row) => {
    acc[row[key]] = (acc[row[key]] || 0) + 1;
    return acc;
  }, {});
}

function setTitle(ws, title, subtitle, columns) {
  const titleRange = ws.getRangeByIndexes(0, 0, 1, columns);
  titleRange.merge();
  titleRange.values = [[title]];
  titleRange.format.fill.color = COLORS.ink;
  titleRange.format.font.color = COLORS.white;
  titleRange.format.font.bold = true;
  titleRange.format.font.size = 18;
  titleRange.format.rowHeight = 32;

  const subtitleRange = ws.getRangeByIndexes(1, 0, 1, columns);
  subtitleRange.merge();
  subtitleRange.values = [[subtitle]];
  subtitleRange.format.fill.color = COLORS.paleGrey;
  subtitleRange.format.font.color = COLORS.grey;
  subtitleRange.format.wrapText = true;
  subtitleRange.format.rowHeight = 42;
}

function styleHeader(range) {
  range.format.fill.color = COLORS.navy;
  range.format.font.color = COLORS.white;
  range.format.font.bold = true;
  range.format.wrapText = true;
  range.format.verticalAlignment = "middle";
  range.format.rowHeight = 28;
}

function writeTable(ws, startRow, startCol, headers, rows) {
  const all = [headers, ...rows];
  const range = ws.getRangeByIndexes(startRow, startCol, all.length, headers.length);
  range.values = all;
  range.format.wrapText = true;
  range.format.verticalAlignment = "top";
  styleHeader(ws.getRangeByIndexes(startRow, startCol, 1, headers.length));
  for (let row = startRow + 1; row < startRow + all.length; row += 1) {
    const rowRange = ws.getRangeByIndexes(row, startCol, 1, headers.length);
    rowRange.format.fill.color = row % 2 === 0 ? COLORS.white : COLORS.paleGrey;
  }
  return { rowCount: all.length, colCount: headers.length };
}

function applyStatusPills(ws, startRow, statusCol, priorityCol, rowsLength) {
  for (let i = 0; i < rowsLength; i += 1) {
    const rowIndex = startRow + 1 + i;
    const statusCell = ws.getRangeByIndexes(rowIndex, statusCol, 1, 1);
    const priorityCell = ws.getRangeByIndexes(rowIndex, priorityCol, 1, 1);
    const status = statusCell.values?.[0]?.[0];
    const priority = priorityCell.values?.[0]?.[0];
    const statusStyle = statusStyles[status] || statusStyles.Pending;
    const priorityStyle = priorityStyles[priority] || priorityStyles.Future;
    statusCell.format.fill.color = statusStyle.fill;
    statusCell.format.font.color = statusStyle.font;
    statusCell.format.font.bold = true;
    priorityCell.format.fill.color = priorityStyle.fill;
    priorityCell.format.font.color = priorityStyle.font;
    priorityCell.format.font.bold = true;
  }
}

function setWidths(ws, widths) {
  widths.forEach((width, index) => {
    ws.getRangeByIndexes(0, index, 1, 1).format.columnWidth = width;
  });
}

function addDashboard(wb) {
  const ws = wb.worksheets.add("Dashboard");
  setTitle(
    ws,
    "That Time app finalisation tracker",
    "Current prototype + Granola feedback + rollout view. Live That Time Pro URL is known, but browser-controlled audit is blocked by URL policy.",
    8,
  );

  const statusCounts = countsBy(appAreas, "status");
  const priorityCounts = countsBy(appAreas, "priority");

  const statusRows = Object.entries(statusCounts).map(([status, count]) => [
    status,
    count,
    `${Math.round((count / appAreas.length) * 100)}%`,
  ]);
  writeTable(ws, 3, 0, ["Status", "Count", "Share"], statusRows);
  for (let i = 0; i < statusRows.length; i += 1) {
    const style = statusStyles[statusRows[i][0]] || statusStyles.Pending;
    const row = ws.getRangeByIndexes(4 + i, 0, 1, 3);
    row.format.fill.color = style.fill;
    row.format.font.color = style.font;
  }

  const priorityRows = Object.entries(priorityCounts).map(([priority, count]) => [
    priority,
    count,
    `${Math.round((count / appAreas.length) * 100)}%`,
  ]);
  writeTable(ws, 3, 4, ["Priority", "Count", "Share"], priorityRows);
  for (let i = 0; i < priorityRows.length; i += 1) {
    const style = priorityStyles[priorityRows[i][0]] || priorityStyles.Future;
    const row = ws.getRangeByIndexes(4 + i, 4, 1, 3);
    row.format.fill.color = style.fill;
    row.format.font.color = style.font;
  }

  const nextActions = [
    [
      "1",
      "Collect screenshots or a short recording of the live That Time Pro vendor app.",
      "Browser-controlled audit is blocked by URL policy.",
    ],
    [
      "2",
      "Ship main-screen deltas: Home markers, Clients share/carousel, Checkout cut-off, Schedule whole-day block.",
      "Supports immediate daily sign-off.",
    ],
    [
      "3",
      "Build Schedule appointment-card backbone: Activity, payments, cancellation/refunds, staff/location, forms, totals.",
      "Largest Jun 17 feedback cluster.",
    ],
    [
      "4",
      "Lock Settings hierarchy and notification paid-channel model.",
      "Prevents rules drifting across Schedule, Clients, Messages and Checkout.",
    ],
    [
      "5",
      "Use Services and Team as the next full sign-off sections.",
      "Matches TT planning priority.",
    ],
  ];
  writeTable(ws, 11, 0, ["Order", "Next action", "Why it matters"], nextActions);

  const riskRows = [
    [
      "Cross-flow state",
      "Activity, refunds, deposits, sessions, waitlist and notifications touch multiple domains.",
      "Use shared demo models/stores rather than one-off local state.",
    ],
    [
      "Static fixtures",
      "Calendar and several modules render fixed demo data.",
      "Document static surfaces and add enough state for sign-off variants.",
    ],
    [
      "Dead Hub rows",
      "Many setup/domain rows exist without routes.",
      "P1 scaffold routes with honest empty/setup states.",
    ],
    [
      "Live parity",
      "Existing live app has not been audited yet.",
      "Complete once screenshots, a walkthrough recording, or another policy-approved access path is available.",
    ],
  ];
  writeTable(ws, 19, 0, ["Risk", "Impact", "Control"], riskRows);

  setWidths(ws, [16, 14, 14, 4, 16, 14, 14, 20]);
  ws.getRangeByIndexes(0, 0, 30, 8).format.wrapText = true;
  return ws;
}

function addAppAreas(wb) {
  const ws = wb.worksheets.add("App Areas");
  setTitle(
    ws,
    "App areas and build status",
    "Every major surface mapped to current state, missing work, source feedback, priority and sign-off window.",
    14,
  );
  const headers = [
    "Area",
    "Surface",
    "Routes / files",
    "Current state",
    "Built",
    "Missing / needed",
    "Source / feedback",
    "Status",
    "Priority",
    "Rollout",
    "Dependencies",
    "Decision needed",
    "Sign-off target",
    "Notes",
  ];
  const rows = appAreas.map((row) => [
    row.area,
    row.surface,
    row.routes,
    row.state,
    row.built,
    row.missing,
    row.source,
    row.status,
    row.priority,
    row.rollout,
    row.dependencies,
    row.decision,
    row.signoff,
    row.notes,
  ]);
  writeTable(ws, 3, 0, headers, rows);
  applyStatusPills(ws, 3, 7, 8, rows.length);
  setWidths(ws, [22, 16, 28, 34, 42, 54, 34, 14, 12, 22, 34, 34, 16, 38]);
  return ws;
}

function addGranola(wb) {
  const ws = wb.worksheets.add("Granola Feedback");
  setTitle(
    ws,
    "Granola feedback mapping",
    "Latest meeting: that time product sign off, 2026-06-17 13:30 BST. This sheet maps feedback to app areas and rollout priority.",
    8,
  );
  writeTable(
    ws,
    3,
    0,
    [
      "Screen / flow",
      "Feedback",
      "Action",
      "Status",
      "Priority",
      "Area",
      "Owner decision",
      "Source",
    ],
    granolaRows,
  );
  applyStatusPills(ws, 3, 3, 4, granolaRows.length);
  setWidths(ws, [24, 48, 42, 14, 12, 26, 34, 18]);
  return ws;
}

function addRoadmap(wb) {
  const ws = wb.worksheets.add("Roadmap");
  setTitle(
    ws,
    "1.5 week rollout plan",
    "Workstream sequence for finalising flows and collecting daily sign-off.",
    6,
  );
  writeTable(
    ws,
    3,
    0,
    ["Workstream", "Window", "Goal", "Deliverables", "Dependencies", "Sign-off output"],
    roadmapRows,
  );
  setWidths(ws, [26, 18, 34, 56, 34, 32]);
  return ws;
}

function addDecisions(wb) {
  const ws = wb.worksheets.add("Decision Log");
  setTitle(
    ws,
    "Decision log",
    "Open calls for Mathew/client to keep the sprint unblocked.",
    5,
  );
  writeTable(
    ws,
    3,
    0,
    ["Decision", "Recommendation", "Why", "Status", "Owner"],
    decisionRows,
  );
  for (let i = 0; i < decisionRows.length; i += 1) {
    const status = decisionRows[i][3];
    const style = status === "Blocked" ? statusStyles.Blocked : statusStyles.Pending;
    const cell = ws.getRangeByIndexes(4 + i, 3, 1, 1);
    cell.format.fill.color = style.fill;
    cell.format.font.color = style.font;
    cell.format.font.bold = true;
  }
  setWidths(ws, [30, 46, 48, 14, 18]);
  return ws;
}

function addRoutes(wb) {
  const ws = wb.worksheets.add("Route Inventory");
  setTitle(
    ws,
    "Route inventory",
    "High-level route map from the current Next.js prototype, grouped by product area.",
    4,
  );
  writeTable(ws, 3, 0, ["Area", "Routes", "Status", "Notes"], routeRows);
  for (let i = 0; i < routeRows.length; i += 1) {
    const status = routeRows[i][2];
    const style = statusStyles[status] || statusStyles.Pending;
    const cell = ws.getRangeByIndexes(4 + i, 2, 1, 1);
    cell.format.fill.color = style.fill;
    cell.format.font.color = style.font;
    cell.format.font.bold = true;
  }
  setWidths(ws, [26, 48, 14, 56]);
  return ws;
}

function addRouteDetail(wb) {
  const ws = wb.worksheets.add("Route Detail");
  setTitle(
    ws,
    "Generated page-route detail",
    "Generated from src/app/**/page.tsx at workbook build time, so agents can see the actual prototype surface area rather than a hand-written count.",
    6,
  );
  writeTable(
    ws,
    3,
    0,
    ["Group", "Page routes", "What it covers", "Readiness note", "Primary gaps"],
    routeGroupRows,
  );
  const detailStart = 15;
  writeTable(
    ws,
    detailStart,
    0,
    ["Group", "Route", "Source file", "Status", "Area", "Coverage note"],
    pageRouteRows,
  );
  for (let i = 0; i < pageRouteRows.length; i += 1) {
    const status = pageRouteRows[i][3];
    const style = statusStyles[status] || statusStyles.Pending;
    const cell = ws.getRangeByIndexes(detailStart + 1 + i, 3, 1, 1);
    cell.format.fill.color = style.fill;
    cell.format.font.color = style.font;
    cell.format.font.bold = true;
  }
  setWidths(ws, [14, 36, 58, 14, 24, 64]);
  return ws;
}

function addImplementationAnchors(wb) {
  const ws = wb.worksheets.add("Implementation Anchors");
  setTitle(
    ws,
    "Implementation anchor map",
    "Where agents should start for each product area before changing screens, flows or state. This complements the generated route detail sheet.",
    5,
  );
  writeTable(
    ws,
    3,
    0,
    ["Area", "Start with these files", "State / data anchors", "Read alongside", "Implementation note"],
    implementationAnchorRows,
  );
  setWidths(ws, [28, 62, 58, 42, 64]);
  return ws;
}

function addLiveAudit(wb) {
  const ws = wb.worksheets.add("Live Audit Intake");
  setTitle(
    ws,
    "Live That Time Pro evidence intake",
    "Browser-controlled access to the vendor URL is blocked by policy. Use this sheet to map screenshots or a walkthrough recording back to the prototype without storing credentials.",
    8,
  );
  writeTable(
    ws,
    3,
    0,
    [
      "Capture",
      "Screens / action",
      "What it proves",
      "Compare against prototype",
      "Evidence status",
      "Priority",
      "Findings / live-only feature",
      "Prototype update needed",
    ],
    liveAuditRows,
  );
  applyStatusPills(ws, 3, 4, 5, liveAuditRows.length);
  setWidths(ws, [24, 48, 44, 36, 16, 12, 52, 52]);
  return ws;
}

function addSources(wb) {
  const ws = wb.worksheets.add("Sources");
  setTitle(
    ws,
    "Sources and audit notes",
    "References used to build this tracker. Credentials are intentionally not stored here.",
    3,
  );
  const sourceRows = [
    ["Master plan", "docs/product-finalisation-master-plan.md", "Primary written overview."],
    [
      "Granola",
      "that time product sign off, 2026-06-17 13:30 BST, id 2d0356e7-7fe7-48c5-ae92-e148cf06baca",
      "Latest detailed feedback.",
    ],
    ["Granola", "that time sign off, 2026-06-15", "Earlier sign-off basis."],
    ["Granola", "TT planning, 2026-06-16", "Remaining-section priorities."],
    ["Repo", "src/app/**", "Current Next.js routes."],
    ["Repo", "src/lib/data/product.ts", "Screen demo fixtures."],
    ["Repo", "src/lib/data/offers.ts", "Canonical offer catalogue."],
    ["Repo", "src/lib/store/appStore.ts", "Prototype runtime state."],
    ["Docs", "docs/migrations/*-finalisation-plan.md", "Domain plans and current-state notes."],
    [
      "Live app",
      "https://vendor.that-time.co.uk/enter-phone",
      "Authenticated audit blocked by in-app browser URL policy; credentials intentionally not stored.",
    ],
    ["Legacy fallback", "/Users/mathewdane/Desktop/That-time/Apps/that-time-app", "Reviewed as structural reference only."],
  ];
  writeTable(ws, 3, 0, ["Type", "Source", "Use"], sourceRows);
  setWidths(ws, [18, 56, 60]);
  return ws;
}

async function writeArtifact(filePath, artifact) {
  if (artifact?.data instanceof Uint8Array) {
    await fs.writeFile(filePath, Buffer.from(artifact.data));
    return;
  }
  if (typeof artifact?.arrayBuffer === "function") {
    await fs.writeFile(filePath, Buffer.from(await artifact.arrayBuffer()));
    return;
  }
  throw new Error(`Unsupported artifact output for ${filePath}`);
}

await fs.mkdir(outDir, { recursive: true });

const wb = Workbook.create();
addDashboard(wb);
addAppAreas(wb);
addGranola(wb);
addRoadmap(wb);
addDecisions(wb);
addRoutes(wb);
addRouteDetail(wb);
addImplementationAnchors(wb);
addLiveAudit(wb);
addSources(wb);

wb.worksheets.setActiveWorksheet("Dashboard");
wb.recalculate();

const inspect = await wb.inspect({
  kind: "workbook,sheet,region,formula,computedStyle",
  maxChars: 12000,
});
await fs.writeFile(inspectPath, inspect.ndjson, "utf8");

const xlsxBlob = await SpreadsheetFile.exportXlsx(wb);
await writeArtifact(xlsxPath, xlsxBlob);

const pngBlob = await wb.render();
await writeArtifact(previewPath, pngBlob);

console.log(JSON.stringify({ xlsxPath, previewPath, inspectPath }, null, 2));
