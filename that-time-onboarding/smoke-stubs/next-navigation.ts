// Stub for next/navigation, used ONLY by the smoke test (wired via
// tsconfig.smoke.json paths) so client components that call useRouter /
// usePathname can be rendered with react-dom/server outside a live Next app.
const noop = () => {};

export const useRouter = () => ({
  push: noop,
  replace: noop,
  back: noop,
  forward: noop,
  refresh: noop,
  prefetch: noop,
});

export const usePathname = () => "/app";
export const useSearchParams = () => new URLSearchParams();
export const redirect = noop;
export const notFound = noop;
