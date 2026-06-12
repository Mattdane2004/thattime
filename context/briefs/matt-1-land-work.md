# Brief for Matt's session — LAND today's work first

You're on the `thattime` repo (Next.js + TS), your UX/screens branch. **Goal of
this session: get your current work committed and merged into `main` cleanly —
nothing new, just land what you have.** The design-system side is about to migrate
screens onto a shared component library and needs a clean base to build on.

Do this:

1. **See what's outstanding** — `git status` and `git diff` (and `git log origin/main..HEAD` for unpushed commits).
2. **Make the gate green** (run before committing — these are what Vercel runs):
   ```
   npx tsc --noEmit
   npx next lint        # NOTE: unused vars are FATAL — they fail the Vercel build
   npm run smoke
   ```
   Fix anything red.
3. **Commit** in logical chunks. Do **not** squash — we keep full history.
4. **Push** your branch and **open/update a PR into `main`**. Keep `main` green.
5. **Update `context/matt-status.md`** — short handoff: what landed, what's still pending.

Don't start new features or refactors this session. Once your PR is merged, you'll
get a second brief to resume building — at which point everything uses the new
shared component library (`@/components/ui`). See `context/WAYS_OF_WORKING.md` if
you need the workflow refresher.
