/** @type {import('next').NextConfig} */
const nextConfig = {
  // Lets a second dev server (e.g. the Claude Code preview) run alongside the
  // primary one without the two fighting over .next. Unset = normal .next.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
