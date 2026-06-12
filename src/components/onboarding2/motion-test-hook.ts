"use client";

import { MotionGlobalConfig } from "framer-motion";

// Test/demo escape hatch: load any page with ?noanim to skip all framer-motion
// animations (jump straight to final state). Headless browsers (smoke
// verification, screenshot tooling) throttle requestAnimationFrame, which
// otherwise leaves every entrance animation frozen mid-flight.
if (typeof window !== "undefined" && new URLSearchParams(window.location.search).has("noanim")) {
  MotionGlobalConfig.skipAnimations = true;
}
