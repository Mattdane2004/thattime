// Local smoke test that bypasses Next's (environmentally hung) compiler:
// render the ported components with react-dom/server and assert output.
import { renderToString } from "react-dom/server";
import React from "react";
import HubPage from "./src/app/app/page";
import { defaultCategories, tintFromHex, categorySwatches } from "./src/lib/tokens/categories";

let failures = 0;
const check = (name: string, cond: boolean) => {
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}`);
  if (!cond) failures++;
};

// 1) The ported Hub landing renders and contains its key content.
const html = renderToString(React.createElement(HubPage));
check("Hub renders non-empty", html.length > 500);
for (const txt of ["Hub", "Operations", "Switch to client view", "Business setup", "Services", "Team", "Marketing"]) {
  check(`Hub shows "${txt}"`, html.includes(txt));
}

// 2) Shared category tokens behave.
check("9 default categories", defaultCategories.length === 9);
check("Hair swatch is #7C3AED", defaultCategories[0].color === "#7C3AED");
check("tintFromHex", tintFromHex("#7C3AED", 0.1) === "rgba(124,58,237,0.1)");
check("tintFromHex bad input", tintFromHex("nope") === "rgba(0,0,0,0.12)");
check("swatch set non-empty", categorySwatches.length > 0);

console.log(failures === 0 ? "\n✅ SMOKE PASS" : `\n❌ ${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
