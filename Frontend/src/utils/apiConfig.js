const runtimeOrigin = (typeof window !== 'undefined' && window.location && window.location.origin)
  ? window.location.origin
  : 'http://localhost:5000';

// Prefer the build-time env var if provided, otherwise fall back to the current origin.
// Add a runtime safeguard: if the resolved URL points to localhost but the app is
// running on a non-localhost origin, prefer the app origin to avoid calling
// localhost from deployed clients.
const envUrl = import.meta.env.VITE_BACKEND_URL || '';
let resolvedUrl = envUrl && envUrl.length > 0 ? envUrl : runtimeOrigin;

const localhostPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i;
if (localhostPattern.test(resolvedUrl) && typeof window !== 'undefined') {
  const appOrigin = window.location.origin;
  if (!localhostPattern.test(appOrigin)) {
    resolvedUrl = appOrigin;
  }
}

export const BACKEND_URL = resolvedUrl;
