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
import SetupGuidePage from "./src/app/app/setup/page";
import ClientsPage from "./src/app/app/clients/page";
import ClientDetailPage from "./src/app/app/clients/[id]/page";
import TeamPage from "./src/app/app/team/page";
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
import { defaultCategories, tintFromHex, categorySwatches } from "./src/lib/tokens/categories";

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

// 1) Ported Home dashboard.
renderContains("Home", React.createElement(HomePage), [
  "Home", "Good afternoon, Emma", "Up Next", "Sarah Johnson",
  "Needs Attention", "Team Today", "Upcoming Shifts", "Time Off",
]);

// 2) Ported Hub.
renderContains("Hub", React.createElement(HubPage), [
  "Hub", "Operations", "Switch to client view", "Business setup", "Services", "Team", "Marketing",
]);

// 3) Ported Clients directory.
renderContains("Clients", React.createElement(ClientsPage), [
  "Clients", "Search by name", "Emily Davis", "Jessica Brown", "VIP", "Allergy",
]);

// 3b) Client profile detail.
renderContains("ClientDetail", React.createElement(ClientDetailPage, { params: { id: "sarah-johnson" } }), [
  "Sarah Johnson", "Allergies", "PPD", "Contact", "Reviews", "past appointments", "Cancelled",
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

// 4) Ported Team roster.
renderContains("Team", React.createElement(TeamPage), [
  "Team", "members", "Alex Morgan", "Manager", "Instructor", "Needs setup",
]);

// 5) Ported Messages.
renderContains("Messages", React.createElement(MessagesPage), [
  "Messages", "Search conversations", "Emily Davis", "Sarah Johnson", "Robert Lee",
]);

// 5b) Conversation thread.
renderContains("Conversation", React.createElement(ConversationPage, { params: { id: "emily-davis" } }), [
  "Emily Davis", "Upcoming Appointment", "Rescheduled", "Message",
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
renderContains("Wizard/price", React.createElement(PricePage), [
  "Price", "duration", "Require a deposit", "Create service",
]);

// 8) Shared category tokens.
check("9 default categories", defaultCategories.length === 9);
check("Hair swatch is #7C3AED", defaultCategories[0].color === "#7C3AED");
check("tintFromHex", tintFromHex("#7C3AED", 0.1) === "rgba(124,58,237,0.1)");
check("tintFromHex bad input", tintFromHex("nope") === "rgba(0,0,0,0.12)");
check("swatch set non-empty", categorySwatches.length > 0);

console.log(failures === 0 ? "\n✅ SMOKE PASS" : `\n❌ ${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
