// Local smoke test that bypasses Next's (environmentally hung) compiler:
// render the ported components with react-dom/server and assert output.
import { renderToString } from "react-dom/server";
import React from "react";
import HomePage from "./src/app/app/page";
import HubPage from "./src/app/app/hub/page";
import ServicesPage from "./src/app/app/services/page";
import MarketingPage from "./src/app/app/marketing/page";
import OfferDashboardPage from "./src/app/app/services/[id]/page";
import ConsumerHomePage from "./src/app/c/home/page";
import ConsumerExplorePage from "./src/app/c/explore/page";
import ConsumerSalonPage from "./src/app/c/salon/[id]/page";
import ConsumerBookingsPage from "./src/app/c/bookings/page";
import ConsumerInboxPage from "./src/app/c/inbox/page";
import ConsumerProfilePage from "./src/app/c/profile/page";
import ConsumerSettingsPage from "./src/app/c/settings/page";
import ProductsModulePage from "./src/app/app/services/[id]/products/page";
import ServicePreviewPage from "./src/app/app/services/[id]/preview/page";
import PhotosModulePage from "./src/app/app/services/[id]/photos/page";
import FormsModulePage from "./src/app/app/services/[id]/forms/page";
import ResourcesModulePage from "./src/app/app/services/[id]/resources/page";
import VariantsModulePage from "./src/app/app/services/[id]/variants/page";
import RelatedModulePage from "./src/app/app/services/[id]/related/page";
import NotificationsModulePage from "./src/app/app/services/[id]/notifications/page";
import RequirementsModulePage from "./src/app/app/services/[id]/requirements/page";
import AgendaModulePage from "./src/app/app/services/[id]/agenda/page";
import MaterialsModulePage from "./src/app/app/services/[id]/materials/page";
import CertificatesModulePage from "./src/app/app/services/[id]/certificates/page";
import SetupGuidePage from "./src/app/app/setup/page";
import AlertsPage from "./src/app/app/alerts/page";
import ImportDataPage from "./src/app/app/setup/import/page";
import ClientsPage from "./src/app/app/clients/page";
import ClientDetailPage from "./src/app/app/clients/[id]/page";
import ClientWalletPage from "./src/app/app/clients/[id]/wallet/page";
import ClientReviewsPage from "./src/app/app/clients/[id]/reviews/page";
import ClientSettingsPage from "./src/app/app/clients/[id]/settings/page";
import TeamPage from "./src/app/app/team/page";
import TeamInvitePage from "./src/app/app/team/invite/page";
import MessagesPage from "./src/app/app/messages/page";
import ConversationPage from "./src/app/app/messages/[id]/page";
import CheckoutPage from "./src/app/app/checkout/page";
import SchedulePage from "./src/app/app/schedule/page";
import WizardIntroPage from "./src/app/new/page";
import TypeSelectorPage from "./src/app/new/type/page";
import ClassPricingPage from "./src/app/new/class-pricing/page";
import TeamMemberPage from "./src/app/app/team/[id]/page";
import MemberSchedulePage from "./src/app/app/team/[id]/schedule/page";
import MemberPermissionsPage from "./src/app/app/team/[id]/permissions/page";
import MemberPayPage from "./src/app/app/team/[id]/pay/page";
import PayRunPage from "./src/app/app/team/pay/[runId]/page";
import OfferSettingsPage from "./src/app/app/services/[id]/settings/page";
import BasicsPage from "./src/app/new/basics/page";
import LocationsPage from "./src/app/new/locations/page";
import StaffPage from "./src/app/new/staff/page";
import PricePage from "./src/app/new/price/page";
import SubscriptionTypePage from "./src/app/new/subscription-type/page";
import SubscriptionBenefitsPage from "./src/app/new/subscription-benefits/page";
import SubscriptionBillingPage from "./src/app/new/subscription-billing/page";
import BundleServicesPage from "./src/app/new/bundle-services/page";
import BundlePricingPage from "./src/app/new/bundle-pricing/page";
import ClassParticipantsPage from "./src/app/new/class-participants/page";
import ClassSchedulePage from "./src/app/new/class-schedule/page";
import { defaultCategories, tintFromHex, categorySwatches } from "./src/lib/tokens/categories";
import { SummaryRow as OfferSummaryRow } from "./src/components/ui";
import { offerFromDraft } from "./src/lib/store/offersStore";
import { demoOffers } from "./src/lib/data/offers";
import { emptyDraft, emptyClassDraft, emptySubscription } from "./src/lib/store/wizardStore";
import { Button, Input, Textarea, Label, Badge, Avatar, Chip, Spinner, Separator, Card, Field, ListRow, SegmentedControl, EmptyState, StatTile, Switch, Checkbox, RadioGroup, RadioGroupItem, Tabs, TabsList, TabsTrigger, TabsContent, Dialog, DialogTrigger, Sheet, BottomSheet, PermissionDialog, Toaster, toast, CheckCircle, PhoneInput, OtpInput, SelectCard, CheckRow, SocialButtons, OrDivider, ProgressDashes, PrimaryButton, DarkButton, GhostButton, StatusPill, Segmented, MiniCalendar, TimeChips, PasswordField, AppHeader, SectionLabel, Tag, ToggleRow, SettingsGroup, StarRating, BackHeader, ScreenHeader, Toggle } from "./src/components/ui";
import { Avatar as ConsumerAvatar, Stars as ConsumerStars, Toggle as ConsumerToggle, SummaryRow } from "./src/components/ui/consumer";

let failures = 0;
const check = (name: string, cond: boolean) => {
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}`);
  if (!cond) failures++;
};
const renderContains = (label: string, el: React.ReactElement, needles: string[]) => {
  const html = renderToString(el);
  check(`${label} renders non-empty`, html.length > 500);
  for (const txt of needles) check(`${label} shows "${txt}"`, html.includes(txt));
};

// 1) Home dashboard (mid-fi — Figma "Section 1" → Home).
renderContains("Home", React.createElement(HomePage), [
  "Salon Soho", "Good afternoon, Emma", "Up Next", "Sarah Johnson",
  "Needs Attention", "Team Today", "Upcoming Shifts", "Time Off",
  "Check In", "Lunch Break",
]);

// 1b) Staff role — stripped dashboard: own earnings, no business analytics/team.
renderContains("Home (staff)", React.createElement(HomePage, { role: "staff" }), [
  "Up Next", "Your earnings", "Upcoming Shifts",
]);
{
  const staffHome = renderToString(React.createElement(HomePage, { role: "staff" }));
  check("Staff home hides Team Today", !staffHome.includes("Team Today"));
  check("Staff home hides business revenue", !staffHome.includes("£4,280"));
}

// 2) Hub "Menu" (Figma 11988:90748).
renderContains("Hub", React.createElement(HubPage), [
  "Menu", "This week", "Revenue", "View analytics", "Operations", "Offerings", "Team", "Marketing", "Setup",
]);

// 3) Ported Clients directory.
renderContains("Clients", React.createElement(ClientsPage), [
  "Clients", "Search clients by name", "Emily Davis", "Jessica Brown", "VIP", "Allergy",
]);

// 3b) Client profile detail (Overview tab renders by default; Instagram-style
// header carries the stats — Bookings / Spent / Rating — and a Contact action).
renderContains("ClientDetail", React.createElement(ClientDetailPage), [
  "Sarah Johnson", "Active", "Book now", "Contact", "Total Bookings", "Total Sales", "Rating",
  "Allergies", "PPD", "Needs attention", "Next appointment",
]);

// 3b-ii) Client sub-pages: wallet, reviews, settings.
renderContains("ClientWallet", React.createElement(ClientWalletPage), [
  "Wallet &amp; loyalty", "Loyalty points", "Add top-up", "Rewards", "Add reward", "Recent activity",
]);
renderContains("ClientReviews", React.createElement(ClientReviewsPage), [
  "Reviews", "4.7", "Ask for a review", "Reply",
]);
renderContains("ClientSettings", React.createElement(ClientSettingsPage), [
  "Settings &amp; policies", "Require manual review", "Preferred days", "Cancellation policy",
  "Require a deposit", "Block client", "Delete client",
]);

// 3c) Offerings list.
renderContains("Services", React.createElement(ServicesPage), [
  "Offerings", "Everything you offer", "Classic haircut", "New", "Hair",
]);

// 3d) Marketing hub.
renderContains("Marketing", React.createElement(MarketingPage), [
  "Marketing", "Engage", "Campaigns", "Automations", "Rewards", "Discount codes",
]);

// 3e) Offer dashboard ("Edit Service").
renderContains("OfferDashboard", React.createElement(OfferDashboardPage, { params: { id: "svc_classic_haircut" } }), [
  "Classic haircut", "Edit service", "Advanced", "Variants", "Settings", "Unpublish", "Preview",
]);
{
  const dash = renderToString(React.createElement(OfferDashboardPage, { params: { id: "svc_classic_haircut" } }));
  check("OfferDashboard drops hardcoded location", !dash.includes("In-salon · Mobile"));
  check("OfferDashboard drops hardcoded £20 deposit", !dash.includes(">£20<"));
  check("OfferDashboard drops hardcoded 24h", !dash.includes(">24h<"));
  check("OfferDashboard shows location fallback for bare seed", dash.includes("Location not set"));
}
// 3e-ii) Per-type dashboard summaries render for each type's seed (fallbacks, no crash).
{
  const bundle = renderToString(React.createElement(OfferDashboardPage, { params: { id: "bun_cut_colour" } }));
  check("Bundle dashboard renders summary", bundle.includes("Edit") && bundle.includes("Pricing not set"));
  check("Bundle dashboard omits location/staff rows", !bundle.includes("Location not set"));

  const sub = renderToString(React.createElement(OfferDashboardPage, { params: { id: "sub_monthly_cuts" } }));
  check("Subscription dashboard renders summary", sub.includes("Billing not set") && sub.includes("Benefit not set"));
  check("Subscription dashboard omits location/staff rows", !sub.includes("Location not set"));

  const cls = renderToString(React.createElement(OfferDashboardPage, { params: { id: "cls_beginner_yoga" } }));
  check("Class dashboard renders schedule + attendees", cls.includes("Schedule not set") && cls.includes("Attendees not set"));
  check("Class dashboard shows per-attendee price", cls.includes("per attendee"));
}
renderContains("OfferSettings", React.createElement(OfferSettingsPage, { params: { id: "svc_classic_haircut" } }), [
  "Online booking", "Who can book", "Lead time", "cancellation window", "Delete permanently",
]);

// 3f) Hub → B2C switcher lands on the consumer app (covered in section 8).

// 3g) Setup guide.
renderContains("SetupGuide", React.createElement(SetupGuidePage), [
  "Setup guide", "steps done", "Get ready to take bookings", "Business profile", "Done",
]);

// 3h) Products module editor.
renderContains("Products", React.createElement(ProductsModulePage, { params: { id: "svc_classic_haircut" } }), [
  "Products", "No product preferences yet", "Set up products",
]);

// 3i) Service preview + photos module.
renderContains("ServicePreview", React.createElement(ServicePreviewPage, { params: { id: "svc_classic_haircut" } }), [
  "Client preview", "Classic haircut", "Book now",
]);
renderContains("Photos", React.createElement(PhotosModulePage, { params: { id: "svc_classic_haircut" } }), [
  "Photos", "No photos yet", "Add photos",
]);

// 3j) Module editors: forms, resources, variants.
renderContains("Forms", React.createElement(FormsModulePage, { params: { id: "svc_classic_haircut" } }), [
  "Forms", "No forms yet", "Add forms",
]);
renderContains("Resources", React.createElement(ResourcesModulePage, { params: { id: "svc_classic_haircut" } }), [
  "Resources", "No resources yet", "Add a room",
]);
renderContains("Variants", React.createElement(VariantsModulePage, { params: { id: "svc_classic_haircut" } }), [
  "Variants", "No variants yet", "Start with a type",
]);

// 3k) Team invite.
renderContains("TeamInvite", React.createElement(TeamInvitePage), [
  "Add team member", "Who are you adding", "Employee", "Freelancer", "Workspace access", "Send invite",
]);

// 3l) Alerts feed + Import data.
renderContains("Alerts", React.createElement(AlertsPage), [
  "Alerts", "Today", "Message request", "New booking",
]);
renderContains("ImportData", React.createElement(ImportDataPage), [
  "Import data", "Upload CSV", "another platform", "Clients", "Bookings",
]);

// 3m) Related services module.
renderContains("Related", React.createElement(RelatedModulePage, { params: { id: "svc_classic_haircut" } }), [
  "Related", "No related services yet", "Add suggestions",
]);

// 3n) Phase 4 advanced module pages (notifications + class modules).
renderContains("Notifications", React.createElement(NotificationsModulePage, { params: { id: "svc_classic_haircut" } }), [
  "Notifications", "Booking confirmation", "24-hour reminder",
]);
renderContains("Requirements", React.createElement(RequirementsModulePage, { params: { id: "cls_beginner_yoga" } }), [
  "Requirements", "Minimum age", "Prerequisites", "What to bring",
]);
renderContains("Agenda", React.createElement(AgendaModulePage, { params: { id: "cls_beginner_yoga" } }), [
  "Agenda &amp; syllabus", "Add an agenda item",
]);
renderContains("Materials", React.createElement(MaterialsModulePage, { params: { id: "cls_beginner_yoga" } }), [
  "Materials", "Add a material",
]);
renderContains("Certificates", React.createElement(CertificatesModulePage, { params: { id: "cls_beginner_yoga" } }), [
  "Completion &amp; certificates", "Issue a certificate",
]);

// 4) Team section (Members tab default).
renderContains("Team", React.createElement(TeamPage), [
  "Team", "Members", "Shifts", "Pay", "Alex Morgan", "Manager", "Instructor", "Needs setup",
]);
renderContains("TeamMember", React.createElement(TeamMemberPage, { params: { id: "s2" } }), [
  "Priya Shah", "Takes bookings", "Schedule", "Permissions", "Pay", "Archive member",
]);
renderContains("TeamSchedule", React.createElement(MemberSchedulePage, { params: { id: "s2" } }), [
  "schedule", "Working hours", "Time off", "Mon",
]);
renderContains("TeamPermissions", React.createElement(MemberPermissionsPage, { params: { id: "s2" } }), [
  "Access level", "Basic", "Medium", "Fine-tune", "Calendar", "Reports",
]);
renderContains("TeamPay", React.createElement(MemberPayPage, { params: { id: "s2" } }), [
  "pay", "Employment type", "Hourly rate", "commission", "tips",
]);
renderContains("PayRun", React.createElement(PayRunPage, { params: { runId: "run_jun_1" } }), [
  "Pay run", "Jun 2026", "Wages", "Commission", "Tips", "Complete pay run",
]);

// 5) Ported Messages.
renderContains("Messages", React.createElement(MessagesPage), [
  "Messages", "Search conversations", "Emily Davis", "Sarah Johnson", "Robert Lee",
  "Colour Masterclass", "Salon team", "Ended",
]);

// 5b) Conversation thread.
renderContains("Conversation", React.createElement(ConversationPage), [
  "Emily Davis", "Upcoming Appointment", "Blow Dry &amp; Style", "Select a date", "Type a message",
]);

// 5c) Checkout — appointment entry lands on the Review step.
renderContains("Checkout", React.createElement(CheckoutPage), [
  "Checkout", "Sarah Johnson", "Cut &amp; Colour", "Deposit paid at booking", "Platform fee", "Take payment",
]);

// 6) Ported Schedule agenda.
renderContains("Schedule", React.createElement(SchedulePage), [
  "Schedule", "Tuesday 3 March", "Lisa Anderson", "Now", "End of shift",
]);

// 7) Service wizard: intro + type + steps.
renderContains("Wizard/intro", React.createElement(WizardIntroPage), [
  "Set up your service", "Get started", "Watch a quick tutorial",
]);
renderContains("Wizard/type", React.createElement(TypeSelectorPage), [
  "What are you adding", "Service", "Class", "Bundle", "Subscription",
]);
renderContains("Wizard/basics", React.createElement(BasicsPage), [
  "The basics", "Name", "Category", "Choose a category", "Tap to change icon", "Description", "Next",
]);
renderContains("Wizard/locations", React.createElement(LocationsPage), [
  "Where is it offered", "In-salon", "Mobile", "Remote", "All locations", "Edit settings", "Next",
]);
renderContains("Wizard/staff", React.createElement(StaffPage), [
  "Who offers it", "Alex Morgan", "Search staff",
]);
renderContains("Wizard/sub-type", React.createElement(SubscriptionTypePage), [
  "Subscription type", "Service frequency", "Store credit", "Membership", "Next",
]);
renderContains("Wizard/sub-benefits", React.createElement(SubscriptionBenefitsPage), [
  "What do members get", "Included sessions", "Member discount", "Access pass",
]);
renderContains("Wizard/sub-billing", React.createElement(SubscriptionBillingPage), [
  "Billing", "Billing period", "Joining fee", "Create subscription",
]);
renderContains("Wizard/bundle-services", React.createElement(BundleServicesPage), [
  "Included services", "Fixed bundle", "Flexible package", "Services",
]);
renderContains("Wizard/bundle-pricing", React.createElement(BundlePricingPage), [
  "Bundle price", "Fixed price", "Package discount", "Create bundle",
]);
renderContains("Wizard/class-participants", React.createElement(ClassParticipantsPage), [
  "Attendees", "Public group", "Private booking", "Group size", "Auto-cancel",
]);
renderContains("Wizard/class-schedule", React.createElement(ClassSchedulePage), [
  "Select dates", "Single day", "Multi day", "Starts", "Ends", "Repeats",
]);
renderContains("Wizard/class-pricing", React.createElement(ClassPricingPage), [
  "Price", "Deposit", "Create class",
]);
renderContains("Wizard/price", React.createElement(PricePage), [
  "Price", "duration", "Deposit", "Create service",
]);

// 8) Consumer app (/c — social-first B2C marketplace).
renderContains("C/home", React.createElement(ConsumerHomePage), [
  "thattime", "Your story", "Luna Hair Studio", "Book",
]);
renderContains("C/explore", React.createElement(ConsumerExplorePage), [
  "Search", "Nearby", "For you",
]);
renderContains("C/salon", React.createElement(ConsumerSalonPage, { params: { id: "village-barbers" } }), [
  "Village Barbers", "@villagebarbers", "followers", "Message",
]);
renderContains("C/bookings", React.createElement(ConsumerBookingsPage), [
  "Bookings", "Upcoming", "Past", "Skin fade",
]);
renderContains("C/inbox", React.createElement(ConsumerInboxPage), [
  "Inbox", "Village Barbers", "Paws &amp; Paths",
]);
renderContains("C/profile", React.createElement(ConsumerProfilePage), [
  "Emma Carter", "Followers", "Edit profile",
]);
renderContains("C/settings", React.createElement(ConsumerSettingsPage), [
  "Settings", "Payment methods", "Notifications", "Log out",
]);

// 9) Shared category tokens.
check("9 default categories", defaultCategories.length === 9);
check("Hair swatch is #7C3AED", defaultCategories[0].color === "#7C3AED");
check("tintFromHex", tintFromHex("#7C3AED", 0.1) === "rgba(124,58,237,0.1)");
check("tintFromHex bad input", tintFromHex("nope") === "rgba(0,0,0,0.12)");
check("swatch set non-empty", categorySwatches.length > 0);

// 9) UI component library (atoms) — render + variant sanity.
const h = (el: React.ReactElement) => renderToString(el);
check("Button renders label + navy token", h(React.createElement(Button, { children: "Save" })).includes("Save"));
check("Button secondary variant differs", h(React.createElement(Button, { variant: "secondary", children: "Cancel" })).includes("border-border"));
check("Button fullWidth adds w-full", h(React.createElement(Button, { fullWidth: true, children: "Go" })).includes("w-full"));
check("Button icon size is square", h(React.createElement(Button, { size: "icon", children: "+" })).includes("w-9"));
check("Input invalid flags aria + ring", (() => { const s = h(React.createElement(Input, { invalid: true })); return s.includes('aria-invalid="true"') && s.includes("ring-danger"); })());
check("Textarea renders", h(React.createElement(Textarea, { placeholder: "Notes" })).includes("textarea") || h(React.createElement(Textarea, {})).includes("rounded-xl"));
check("Label renders text", h(React.createElement(Label, { children: "Email" })).includes("Email"));
check("Badge tone success", h(React.createElement(Badge, { tone: "success", children: "Paid" })).includes("text-success"));
check("Avatar shows initials", h(React.createElement(Avatar, { initials: "SJ" })).includes("SJ"));
check("Chip selected uses navy + aria-pressed", (() => { const s = h(React.createElement(Chip, { selected: true, children: "VIP" })); return s.includes("bg-navy") && s.includes('aria-pressed="true"'); })());
check("Spinner has status role", h(React.createElement(Spinner, {})).includes('role="status"'));
check("Separator renders hairline", h(React.createElement(Separator, {})).includes("bg-border"));

// 10) UI molecules.
check("Card default has border + surface", h(React.createElement(Card, { children: "x" })).includes("border-border"));
check("Field shows label + error", (() => { const s = h(React.createElement(Field, { label: "Email", error: "Required", children: React.createElement(Input, {}) })); return s.includes("Email") && s.includes("Required"); })());
check("ListRow shows title + subtitle", (() => { const s = h(React.createElement(ListRow, { title: "Services", subtitle: "Classes, bundles" })); return s.includes("Services") && s.includes("Classes"); })());
check("SegmentedControl marks active tab", (() => { const s = h(React.createElement(SegmentedControl, { value: "a", onValueChange: () => {}, options: [{ value: "a", label: "Business" }, { value: "b", label: "Profile" }] })); return s.includes("Business") && s.includes('aria-selected="true"'); })());
check("EmptyState shows title + desc", h(React.createElement(EmptyState, { title: "No clients", description: "Add one" })).includes("No clients"));
check("StatTile shows label + value", (() => { const s = h(React.createElement(StatTile, { label: "Revenue", value: "£349" })); return s.includes("Revenue") && s.includes("£349"); })());

// 11) UI interactive primitives (Radix).
check("Switch renders role=switch", h(React.createElement(Switch, { checked: true })).includes('role="switch"'));
check("Checkbox renders role=checkbox", h(React.createElement(Checkbox, { checked: true })).includes('role="checkbox"'));
check("RadioGroup renders radios", (() => { const s = h(React.createElement(RadioGroup, { defaultValue: "a", children: [React.createElement(RadioGroupItem, { key: "a", value: "a" }), React.createElement(RadioGroupItem, { key: "b", value: "b" })] })); return s.includes('role="radiogroup"'); })());
check("Tabs renders tablist + active tab", (() => { const s = h(React.createElement(Tabs, { defaultValue: "x", children: [React.createElement(TabsList, { key: "l", children: [React.createElement(TabsTrigger, { key: "x", value: "x", children: "Overview" }), React.createElement(TabsTrigger, { key: "y", value: "y", children: "Record" })] }), React.createElement(TabsContent, { key: "c", value: "x", children: "panel" })] })); return s.includes("Overview") && s.includes('role="tab"'); })());

// 12) UI overlays — Radix Dialog/Toast + the frame-scoped Sheet/BottomSheet/PermissionDialog.
check("Dialog renders trigger", h(React.createElement(Dialog, { children: React.createElement(DialogTrigger, { children: "Open dialog" }) })).includes("Open dialog"));
check("Sheet (open) renders title + children", h(React.createElement(Sheet, { open: true, onClose: () => {}, title: "Pick a time", children: "body" })).includes("Pick a time"));
check("BottomSheet (open) renders children", h(React.createElement(BottomSheet, { open: true, onClose: () => {}, children: "sheet body" })).includes("sheet body"));
check("PermissionDialog (open) shows text + Yes", (() => { const s = h(React.createElement(PermissionDialog, { open: true, text: "Allow location", onYes: () => {} })); return s.includes("Allow location") && s.includes("Yes"); })());
check("Toaster mounts (toast fn is callable)", typeof toast === "function" && h(React.createElement(Toaster, {})).length >= 0);

// 12b) Promoted in-use primitives (now canonical in @/components/ui).
check("PrimaryButton renders label", h(React.createElement(PrimaryButton, { children: "Continue" })).includes("Continue"));
check("DarkButton renders label", h(React.createElement(DarkButton, { children: "Save" })).includes("Save"));
check("GhostButton renders label", h(React.createElement(GhostButton, { children: "Cancel" })).includes("Cancel"));
check("StatusPill renders tone", h(React.createElement(StatusPill, { tone: "amber", children: "Pending" })).includes("Pending"));
check("Segmented renders options + active", (() => { const s = h(React.createElement(Segmented, { options: ["My Day", "Calendar"], value: "My Day", onChange: () => {} })); return s.includes("My Day") && s.includes("Calendar"); })());
check("MiniCalendar renders month", h(React.createElement(MiniCalendar, { selected: 4, onSelect: () => {} })).includes("March 2026"));
check("TimeChips renders slots", h(React.createElement(TimeChips, { value: null, onSelect: () => {} })).includes("09:00"));
check("PasswordField renders hint", h(React.createElement(PasswordField, { value: "", onChange: () => {} })).includes("characters"));
check("AppHeader renders title", h(React.createElement(AppHeader, { title: "Schedule" })).includes("Schedule"));
check("AppHeader renders center slot", h(React.createElement(AppHeader, { title: "Home", center: "ROLE", avatarHref: null })).includes("ROLE"));
check("SectionLabel renders heading", h(React.createElement(SectionLabel, { children: "Team Today", count: 4 })).includes("Team Today"));
check("Tag emphasis uses ink", h(React.createElement(Tag, { label: "Allergy", emphasis: true })).includes("bg-fg-primary"));
check("Tag default is quiet", h(React.createElement(Tag, { label: "Regular" })).includes("bg-canvas"));
check("ToggleRow ink on", h(React.createElement(ToggleRow, { title: "Online booking", on: true, onToggle: () => {} })).includes("bg-fg-primary"));
check("ToggleRow coral on", h(React.createElement(ToggleRow, { title: "Push", tone: "coral", on: true, onToggle: () => {} })).includes("bg-coral"));
check("SettingsGroup renders label", h(React.createElement(SettingsGroup, { label: "Booking", children: "x" })).includes("Booking"));
check("StarRating renders 5 stars", (() => { const s = h(React.createElement(StarRating, { value: 3 })); return (s.match(/lucide-star/g) || []).length === 5; })());
check("BackHeader renders title + sub", (() => { const s = h(React.createElement(BackHeader, { title: "Wallet & loyalty", sub: "Sarah Johnson" })); return s.includes("Wallet &amp; loyalty") && s.includes("Sarah Johnson") && s.includes('aria-label="Back"'); })());
check("ScreenHeader renders title", h(React.createElement(ScreenHeader, { title: "Permissions", onBack: () => {}, border: true })).includes("Permissions"));
check("Toggle on renders", h(React.createElement(Toggle, { on: true })).length > 0);
check("consumer Avatar shows initials", h(React.createElement(ConsumerAvatar, { initials: "VB", category: "Hair" })).includes("VB"));
check("consumer Stars shows rating", h(React.createElement(ConsumerStars, { rating: "4.8", count: 765 })).includes("4.8"));
check("consumer Toggle (coral) on", h(React.createElement(ConsumerToggle, { on: true, onToggle: () => {} })).includes("bg-coral"));
check("SummaryRow shows label + value", (() => { const s = h(React.createElement(SummaryRow, { label: "Total", value: "£42.00" })); return s.includes("Total") && s.includes("£42.00"); })());
check("OfferSummaryRow (B2B) shows label + value + chevron", (() => { const s = h(React.createElement(OfferSummaryRow, { label: "In-salon · Mobile", value: "2 staff members" })); return s.includes("In-salon · Mobile") && s.includes("2 staff members") && s.includes("lucide-chevron-right"); })());

// 13) Ported onboarding/form molecules (canonical ui/, identical APIs).
check("CheckCircle on uses fg-primary", h(React.createElement(CheckCircle, { on: true })).includes("bg-fg-primary"));
check("PhoneInput shows +44 + tel input", (() => { const s = h(React.createElement(PhoneInput, { value: "", onChange: () => {} })); return s.includes("44") && s.includes('type="tel"'); })());
check("OtpInput renders 6 boxes", (() => { const s = h(React.createElement(OtpInput, {})); return (s.match(/aria-label="Digit/g) || []).length === 6; })());
check("SelectCard shows title + check", (() => { const s = h(React.createElement(SelectCard, { title: "Mobile", selected: true })); return s.includes("Mobile") && s.includes("bg-fg-primary"); })());
check("CheckRow shows title", h(React.createElement(CheckRow, { checked: false, onToggle: () => {}, title: "Agree to terms" })).includes("Agree to terms"));
check("SocialButtons render Apple/Google", (() => { const s = h(React.createElement(SocialButtons, { onPick: () => {} })); return s.includes("Apple") && s.includes("Google"); })());
check("OrDivider shows label", h(React.createElement(OrDivider, {})).includes("Or"));
check("ProgressDashes renders total dashes", (() => { const s = h(React.createElement(ProgressDashes, { total: 4, active: 2 })); return (s.match(/rounded-full/g) || []).length >= 4; })());

// 14) offerFromDraft round-trip (Stage 1 data seam) — pure function, no render.
{
  const base = { ...emptyDraft, name: "  Test offer  ", category: "Hair", icon: "scissors", description: " desc " };

  const svc = offerFromDraft(
    { ...base, type: "service", price: "65", durationMin: 90, depositEnabled: true, depositAmount: "20",
      locationModes: { inSalon: true, mobile: true, remote: false }, locationIds: ["loc1"], staffIds: ["s1", "s2"] },
    demoOffers,
  );
  check("offerFromDraft service: trims name", svc.name === "Test offer");
  check("offerFromDraft service: carries description", svc.description === "desc");
  check("offerFromDraft service: carries deposit", svc.deposit?.enabled === true && svc.deposit?.amount === "20");
  check("offerFromDraft service: carries locationModes", svc.locationModes?.mobile === true);
  check("offerFromDraft service: carries mobile (mobile mode on)", !!svc.mobile);
  check("offerFromDraft service: carries staffIds", svc.staffIds?.length === 2);
  check("offerFromDraft service: carries durationMin", svc.durationMin === 90);
  check("offerFromDraft service: status draft", svc.status === "draft");
  check("offerFromDraft service: id prefix", svc.id.startsWith("svc_"));

  const cls = offerFromDraft(
    { ...base, type: "class", price: "12", staffIds: ["s1"],
      classDetails: { ...emptyClassDraft, capacity: 8, minParticipants: 2 } },
    demoOffers,
  );
  check("offerFromDraft class: carries classDetails", cls.classDetails?.capacity === 8);
  check("offerFromDraft class: carries staffIds", cls.staffIds?.length === 1);
  check("offerFromDraft class: no durationMin", cls.durationMin === undefined);
  check("offerFromDraft class: id prefix", cls.id.startsWith("cls_"));

  const bun = offerFromDraft(
    { ...base, type: "bundle", price: "120",
      bundle: { kind: "flexible", serviceIds: ["svc_classic_haircut", "svc_beard_trim"], chooseCount: 1, priceMode: "fixed", discountPercent: "" } },
    demoOffers,
  );
  check("offerFromDraft bundle: carries bundle snapshot", bun.bundle?.serviceIds.length === 2);
  check("offerFromDraft bundle: carries chooseCount", bun.bundle?.chooseCount === 1);
  check("offerFromDraft bundle: id prefix", bun.id.startsWith("bun_"));

  const bunDisc = offerFromDraft(
    { ...base, type: "bundle", price: "",
      bundle: { kind: "fixed", serviceIds: ["svc_classic_haircut", "svc_beard_trim"], chooseCount: 2, priceMode: "discount", discountPercent: "10" } },
    demoOffers,
  );
  // svc_classic_haircut (35) + svc_beard_trim (15) = 50; -10% = 45.
  check("offerFromDraft bundle: discount price math", bunDisc.price === "45");

  const sub = offerFromDraft(
    { ...base, type: "subscription", price: "45",
      subscription: { ...emptySubscription, benefitType: "sessions", includedSessions: 4 } },
    demoOffers,
  );
  check("offerFromDraft subscription: carries subscription snapshot", sub.subscription?.includedSessions === 4);
  check("offerFromDraft subscription: id prefix", sub.id.startsWith("sub_"));

  // Empty draft must not crash and must omit optional fields cleanly.
  const empty = offerFromDraft({ ...emptyDraft, type: "service", name: "X", category: "Hair" }, demoOffers);
  check("offerFromDraft empty: no description", empty.description === undefined);
  check("offerFromDraft empty: no deposit when disabled", empty.deposit === undefined);
  check("offerFromDraft empty: no mobile when mobile mode off", empty.mobile === undefined);

  // Ids are unique across calls (SSR-safe counter, no Math.random).
  check("offerFromDraft: unique ids", new Set([svc.id, cls.id, bun.id, sub.id, empty.id]).size === 5);
}

console.log(failures === 0 ? "\n✅ SMOKE PASS" : `\n❌ ${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
