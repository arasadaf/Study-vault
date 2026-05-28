// Use Vite dev/proxy + relative URLs when no explicit backend URL is set.
// This avoids mismatches when Vite runs on a different port (5173/5174/5175...).
const envUrl = import.meta.env.VITE_BACKEND_URL || 'https://study-vault-og.onrender.com';

export const BACKEND_URL = envUrl;

