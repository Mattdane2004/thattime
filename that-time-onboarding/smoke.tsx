// Local smoke test that bypasses Next's (environmentally hung) compiler:
// render the ported components with react-dom/server and assert output.
import { renderToString } from "react-dom/server";
import React from "react";
import HomePage from "./src/app/app/page";
import HubPage from "./src/app/app/hub/page";
import ClientsPage from "./src/app/app/clients/page";
import TeamPage from "./src/app/app/team/page";
import MessagesPage from "./src/app/app/messages/page";
import SchedulePage from "./src/app/app/schedule/page";
import TypeSelectorPage from "./src/app/new/page";
import BasicsPage from "./src/app/new/basics/page";
import PricePage from "./src/app/new/price/page";
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

// 4) Ported Team roster.
renderContains("Team", React.createElement(TeamPage), [
  "Team", "members", "Alex Morgan", "Manager", "Instructor", "Needs setup",
]);

// 5) Ported Messages.
renderContains("Messages", React.createElement(MessagesPage), [
  "Messages", "Search conversations", "Emily Davis", "Sarah Johnson", "Robert Lee",
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
