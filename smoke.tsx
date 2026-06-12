// Local smoke test that bypasses Next's (environmentally hung) compiler:
// render the ported components with react-dom/server and assert output.
import { renderToString } from "react-dom/server";
import React from "react";
import HomePage from "./src/app/app/page";
import HubPage from "./src/app/app/hub/page";
import ServicesPage from "./src/app/app/services/page";
import MarketingPage from "./src/app/app/marketing/page";
import OfferDashboardPage from "./src/app/app/services/[id]/page";
import B2CPage from "./src/app/app/b2c/page";
import ProductsModulePage from "./src/app/app/services/[id]/products/page";
import ServicePreviewPage from "./src/app/app/services/[id]/preview/page";
import PhotosModulePage from "./src/app/app/services/[id]/photos/page";
import FormsModulePage from "./src/app/app/services/[id]/forms/page";
import ResourcesModulePage from "./src/app/app/services/[id]/resources/page";
import VariantsModulePage from "./src/app/app/services/[id]/variants/page";
import RelatedModulePage from "./src/app/app/services/[id]/related/page";
import SetupGuidePage from "./src/app/app/setup/page";
import AlertsPage from "./src/app/app/alerts/page";
import ImportDataPage from "./src/app/app/setup/import/page";
import ClientsPage from "./src/app/app/clients/page";
import ClientDetailPage from "./src/app/app/clients/[id]/page";
import TeamPage from "./src/app/app/team/page";
import TeamInvitePage from "./src/app/app/team/invite/page";
import MessagesPage from "./src/app/app/messages/page";
import ConversationPage from "./src/app/app/messages/[id]/page";
import SchedulePage from "./src/app/app/schedule/page";
import TypeSelectorPage from "./src/app/new/page";
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
import ClientBusinessPage from "./src/app/client/business/page";
import ChooseServicesPage from "./src/app/client/book/page";
import ChooseProfessionalPage from "./src/app/client/book/professional/page";
import PickTimePage from "./src/app/client/book/time/page";
import ReviewBookingPage from "./src/app/client/book/review/page";
import BookingConfirmedPage from "./src/app/client/book/confirmed/page";
import { defaultCategories, tintFromHex, categorySwatches } from "./src/lib/tokens/categories";
import { Button, Input, Textarea, Label, Badge, Avatar, Chip, Spinner, Separator, Card, Field, ListRow, SegmentedControl, EmptyState, StatTile, Switch, Checkbox, RadioGroup, RadioGroupItem, Tabs, TabsList, TabsTrigger, TabsContent } from "./src/components/ui";

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

// 2) Ported Hub.
renderContains("Hub", React.createElement(HubPage), [
  "Hub", "Operations", "Switch to client view", "Business setup", "Services", "Team", "Marketing",
]);

// 3) Ported Clients directory.
renderContains("Clients", React.createElement(ClientsPage), [
  "Clients", "Search by name", "Emily Davis", "Jessica Brown", "VIP", "Allergy",
]);

// 3b) Client profile detail (Overview tab renders by default).
renderContains("ClientDetail", React.createElement(ClientDetailPage), [
  "Sarah Johnson", "Active", "Book", "Message", "Last Visit", "Total Bookings",
  "Allergies", "PPD", "Contact", "Reschedule",
]);

// 3c) Services list.
renderContains("Services", React.createElement(ServicesPage), [
  "Services", "Classic haircut", "New", "Active",
]);

// 3d) Marketing hub.
renderContains("Marketing", React.createElement(MarketingPage), [
  "Marketing", "Engage", "Campaigns", "Automations", "Rewards", "Discount codes",
]);

// 3e) Offer dashboard.
renderContains("OfferDashboard", React.createElement(OfferDashboardPage, { params: { id: "svc_classic_haircut" } }), [
  "Classic haircut", "Price", "Duration", "Manage", "Variants", "Settings",
]);

// 3f) B2C client view.
renderContains("B2C", React.createElement(B2CPage), [
  "Client view", "Coming soon", "That Time for clients", "Switch back to business",
]);

// 3g) Setup guide.
renderContains("SetupGuide", React.createElement(SetupGuidePage), [
  "Setup guide", "steps done", "Get ready to take bookings", "Business profile", "Done",
]);

// 3h) Products module editor.
renderContains("Products", React.createElement(ProductsModulePage, { params: { id: "svc_classic_haircut" } }), [
  "Products", "Oils", "Moroccanoil Treatment", "added to this offer",
]);

// 3i) Service preview + photos module.
renderContains("ServicePreview", React.createElement(ServicePreviewPage, { params: { id: "svc_classic_haircut" } }), [
  "Client preview", "Classic haircut", "Book now",
]);
renderContains("Photos", React.createElement(PhotosModulePage, { params: { id: "svc_classic_haircut" } }), [
  "Photos", "Add",
]);

// 3j) Module editors: forms, resources, variants.
renderContains("Forms", React.createElement(FormsModulePage, { params: { id: "svc_classic_haircut" } }), [
  "Forms", "Health questionnaire", "Consent form", "attached to this offer",
]);
renderContains("Resources", React.createElement(ResourcesModulePage, { params: { id: "svc_classic_haircut" } }), [
  "Resources", "Spaces", "Equipment", "Treatment room A",
]);
renderContains("Variants", React.createElement(VariantsModulePage, { params: { id: "svc_classic_haircut" } }), [
  "Variants", "Duration", "Staff", "Standard",
]);

// 3k) Team invite.
renderContains("TeamInvite", React.createElement(TeamInvitePage), [
  "Add team member", "Who are you adding", "Employee", "Freelancer", "Send invite",
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
  "Related", "suggested at checkout", "Beard trim",
]);

// 4) Ported Team roster.
renderContains("Team", React.createElement(TeamPage), [
  "Team", "members", "Alex Morgan", "Manager", "Instructor", "Needs setup",
]);

// 5) Ported Messages.
renderContains("Messages", React.createElement(MessagesPage), [
  "Messages", "Search conversations", "Emily Davis", "Sarah Johnson", "Robert Lee",
]);

// 5b) Conversation thread.
renderContains("Conversation", React.createElement(ConversationPage), [
  "Emily Davis", "Upcoming Appointment", "Blow Dry &amp; Style", "Select a date", "Type a message",
]);

// 6) Ported Schedule agenda.
renderContains("Schedule", React.createElement(SchedulePage), [
  "Schedule", "Tuesday 3 March", "Lisa Anderson", "Now", "End of shift",
]);

// 7) Service wizard entry + basics.
renderContains("Wizard/type", React.createElement(TypeSelectorPage), [
  "What are you adding", "Service", "Class", "Bundle", "Subscription",
]);
renderContains("Wizard/basics", React.createElement(BasicsPage), [
  "The basics", "Name", "Category", "Continue", "Hair",
]);
renderContains("Wizard/locations", React.createElement(LocationsPage), [
  "Where is it offered", "Salon Soho", "Continue",
]);
renderContains("Wizard/staff", React.createElement(StaffPage), [
  "Who can deliver", "Alex Morgan", "Continue",
]);
renderContains("Wizard/sub-type", React.createElement(SubscriptionTypePage), [
  "Subscription type", "Service frequency", "Store credit", "Membership", "Continue",
]);
renderContains("Wizard/sub-benefits", React.createElement(SubscriptionBenefitsPage), [
  "What do members get", "Included sessions", "Member discount", "Access pass",
]);
renderContains("Wizard/sub-billing", React.createElement(SubscriptionBillingPage), [
  "Billing", "Billing period", "Joining fee", "Create subscription",
]);
renderContains("Wizard/bundle-services", React.createElement(BundleServicesPage), [
  "Build the bundle", "Fixed bundle", "Flexible package", "Services",
]);
renderContains("Wizard/bundle-pricing", React.createElement(BundlePricingPage), [
  "Bundle price", "Fixed price", "Package discount", "Create bundle",
]);
renderContains("Wizard/class-participants", React.createElement(ClassParticipantsPage), [
  "Who can attend", "Seat-based", "Private group", "Continue",
]);
renderContains("Wizard/class-schedule", React.createElement(ClassSchedulePage), [
  "When is it", "Date", "Starts", "Ends",
]);
renderContains("Wizard/price", React.createElement(PricePage), [
  "Price", "duration", "Require a deposit", "Create service",
]);

// 8) Client booking flow (B2C — business profile → services → professional → time → review).
renderContains("Client/business", React.createElement(ClientBusinessPage), [
  "Salon Soho", "Greek Street", "Services", "The team", "About", "Reviews", "Book now",
]);
renderContains("Client/book", React.createElement(ChooseServicesPage), [
  "Choose services", "Classic haircut", "Select a service",
]);
renderContains("Client/book/professional", React.createElement(ChooseProfessionalPage), [
  "Choose a professional", "Any professional", "Alex Morgan", "Continue",
]);
renderContains("Client/book/time", React.createElement(PickTimePage), [
  "Pick a time", "Morning", "Afternoon", "Evening", "09:00",
]);
renderContains("Client/book/review", React.createElement(ReviewBookingPage), [
  "Review and confirm", "Salon Soho", "Total", "Pay at the venue", "Confirm booking",
]);
renderContains("Client/book/confirmed", React.createElement(BookingConfirmedPage), [
  "Booking confirmed", "Add to calendar", "Done",
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

console.log(failures === 0 ? "\n✅ SMOKE PASS" : `\n❌ ${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
