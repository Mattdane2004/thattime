// SSR-safe id helper. A module-level counter avoids `Math.random()` / `Date.now()`
// at module or render top level (the quality-gate rule) while still producing
// unique ids within a session. Only ever called from client event handlers
// (e.g. wizard "Create"), so the counter increments deterministically per run.

let seq = 0;

/** Next session-unique id, e.g. `nextId("svc")` → "svc_0001". */
export const nextId = (prefix: string): string => `${prefix}_${String(++seq).padStart(4, "0")}`;
