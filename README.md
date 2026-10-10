# Flâner

**Flâner** (verb): to walk unhurriedly, observing the streets, people and details with a curious, open mind.

A gentle AI companion that helps you take one small step outside, then gets out of the way.
Tagline: "Small steps. Bigger days." (edit `BRAND` in `frontend/js/data.js`).

```
flaner/
├── frontend/   static app (HTML/CSS/JS): login, profile, missions, reflection, progress
└── backend/    Node + Express: checks the login, calls your AI model, serves the frontend
    └── supabase/schema.sql   tables + row-level security rules
```

## How it works: Discover, Prepare, Go, Remember
1. **Discover:** the home screen offers three doors: *I have somewhere to go*, *I want to explore*, *I need a little nudge*, plus today's little idea, "Continue my plan" (only if one is unfinished) and a few recent moments.
2. **Prepare:** pick an outing (or describe one in your own words), add optional details (shopping items, time, energy), then choose *Just help me plan* or *I'm finding it hard to go*. Only the second opens the support questions (what's making it hard, what you expect). The AI builds an editable checklist: add or remove anything, print or save it.
3. **Go:** a calm phone-away screen. The plan is already loaded, so there is no chat, GPS, timer or notification to attend to. The app shell and your current plan keep working offline once loaded (service worker). You don't have to tick anything.
4. **Remember:** "How was your outing?" with five gentle choices and one optional question (the support route asks three targeted ones). Then an AI-written acknowledgement and three actions: *Save this moment*, *Plan another outing*, *Done for today*. No XP, streaks or scores.

**My moments** is a private, chronological record: outings, minutes outside, places you named, everyday tasks done. Reflection text is stored only if you choose *Save this moment*; otherwise just the outing, how it felt and the minutes are kept. Outings finished offline are queued on the device and sync when you're back online.

The AI never invents places: it only uses what you tell it, and says things like "your chosen shop". Predictable logic (checklists, navigation, completion, records) is ordinary code; the open model handles the personalised plan and the acknowledgement.

## Setup (5 steps)
1. **Supabase:** create a project at supabase.com. In *SQL Editor*, run `backend/supabase/schema.sql` (safe to re-run).
2. **Auth settings:** Authentication > Sign In / Providers > Email. Keep "Confirm email" ON for real use (turn it off only while testing). Set the minimum password length to 8. Under Authentication > URL Configuration, add your site address (e.g. `http://localhost:3000`) to the allowed redirect URLs so confirmation and reset links work.
3. **Keys:** `cd backend`, copy `.env.example` to `.env` and fill in `SUPABASE_URL`, `SUPABASE_ANON_KEY` and your model settings.
4. **Run:** `npm install && npm start`
5. **Open:** http://localhost:3000 and create an account.

Login is required. The app does not work offline, because accounts and saved progress live in Supabase.

## How authorization works
| Layer | What it enforces |
|---|---|
| Frontend guard | App screens never render for a logged-out visitor; an expired session sends you back to login. |
| Backend `/api/*` | Every request needs a valid Supabase login token, checked with Supabase on each call. Missing or bad token = 401. Not configured = 503, never open. |
| Database (RLS) | Row-level security: a user can only read and write rows where `user_id` (or `id`) is their own. Logged-out visitors have no access to the tables at all. |
| Rate limit | 30 AI generations per user per hour. |
| CORS and headers | Same-origin only unless you list `ALLOWED_ORIGINS`; `nosniff`, no-referrer, no framing. |
| Privacy controls | Password reset by email, and "Delete my account and data" on the profile page (full account removal needs `SUPABASE_SERVICE_ROLE_KEY` on the server; without it, saved data is deleted but the login remains). |

Keys: the anon key is public by design. The model key and the service-role key are secrets that stay in `backend/.env` (never commit it). Note that what people write (fears, reflections) is stored in your Supabase project, so you are responsible for it.

## The AI (open-weight models)
Two prompts live in `backend/server.js`:
- `SYSTEM` builds the mission (4 groups of tiny steps, tips, a kind note) from the task, barriers, fear and profile.
- `REFLECT_SYSTEM` writes the final evaluation: praise, insight, an original encouragement line, and a next step.

Flow: browser -> `/api/mission` or `/api/reflection` (with the login token) -> your model -> JSON -> validated and clipped on the server -> rendered by the frontend. If the model fails or times out, built-in content is used.

Default is a local open-weight model through Ollama: install it, run `ollama pull qwen2.5:7b`, done. Change `LLM_BASE_URL`, `LLM_MODEL`, `LLM_API_KEY` for LM Studio, llama.cpp, vLLM, Hugging Face or DeepSeek (examples in `.env.example`). Restart the server after editing.

The model text never has to leave your machine if you run it locally, but account data still goes to Supabase.

## Development shortcut (never for a hosted server)
Set `ALLOW_LOCAL_MODE=true` in `.env` and `LOCAL_MODE: true` in `frontend/js/config.js` to skip login and keep per-person data in the browser.

## Offline
A service worker (`frontend/sw.js`) caches the app so a loaded plan still opens with no signal, and it never caches `/api/*`. Signing in, generating a plan and syncing need a connection. If your login token expires while you're offline, you'll need to sign in again once you're back online. Fonts and the Supabase library are bundled in `frontend/fonts` and `frontend/vendor`, so the page makes no calls to third-party CDNs.

## Look back: what you saw, enjoyed and noticed
After every outing the reflection screen asks, before anything else, for one thing you saw, one you enjoyed and one you noticed for the first time. Recalling small details builds observation skills (this is active recall). All three are optional, the AI mentions one of them by name in its acknowledgement, and the text is stored only if you choose *Save this moment*. Saved noticings appear in My moments and count toward "Things noticed".

## Using a different model for the reflection
Each outing makes two AI calls: one to build the plan and one for the acknowledgement. To keep the second one from using up your main model's call limit, point it at another model in `backend/.env`:
```
REFLECT_PROVIDER=huggingface
HF_TOKEN=hf_...
REFLECT_MODEL=meta-llama/Llama-3.1-8B-Instruct
```
The code in `backend/server.js` (`REFLECT` config and `callLLM`) calls Hugging Face's OpenAI-compatible endpoint (`https://router.huggingface.co/v1`). Use `REFLECT_PROVIDER=openai` with `REFLECT_BASE_URL`, `REFLECT_API_KEY` and `REFLECT_MODEL` for any other provider, or `REFLECT_PROVIDER=off` to skip the AI there and show built-in text (no extra calls). Leave it unset to reuse the plan model.
