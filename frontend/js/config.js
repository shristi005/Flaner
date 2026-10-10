// Used only if you host the frontend separately from the backend.
// When you run the backend (npm start), it serves /js/config.js from backend/.env instead,
// so you only need to fill in one place.
// The Supabase anon key is meant to be public. Never put the LLM key here.
window.TG_CONFIG = {
  SUPABASE_URL: 'YOUR_SUPABASE_URL',
  SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY',
  LOCAL_MODE: false, // dev only: set true to skip login (needs ALLOW_LOCAL_MODE=true on the server)
  API_URL: '' // e.g. 'https://your-backend.example.com'. Empty = same origin.
};
