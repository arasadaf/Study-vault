// Use Vite dev/proxy + relative URLs when no explicit backend URL is set.
// This avoids mismatches when Vite runs on a different port (5173/5174/5175...).
const envUrl = import.meta.env.VITE_BACKEND_URL || '';

// If provided, use it (e.g. deployed backend). Otherwise, use same-origin via Vite proxy.
const resolvedUrl = envUrl && envUrl.length > 0 ? envUrl : '';

export const BACKEND_URL = resolvedUrl;


