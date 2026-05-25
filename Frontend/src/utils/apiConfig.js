// Prefer the build-time env var if provided.
// Otherwise default to the backend dev server (Backend/index.js default PORT = 5000).
const envUrl = import.meta.env.VITE_BACKEND_URL || '';
const resolvedUrl = envUrl && envUrl.length > 0 ? envUrl : 'http://localhost:5000';

export const BACKEND_URL = resolvedUrl;

