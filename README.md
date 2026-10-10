# Flâner

**Small steps. Bigger days.**

Flâner is a gentle AI companion that helps people get off the screen and into the real world. Pick an outing (or just say what you need), get a small, editable checklist, put the phone away, go, and come back to a short, kind reflection.

> **flâner**: to wander without hurry, and notice the little things along the way.

Built for the **Touch Grass** theme: build something with open-weight models that gets people off the screen and into the world. The screen should be the shortest part of the experience.

**Live app:** https://flaner-twp3.onrender.com/

> The app runs on a free Render instance, so the first visit after a quiet period can take up to a minute to wake up. If it looks stuck, wait and refresh once.


---

## Table of contents
- [Flâner](#flâner)
  - [Table of contents](#table-of-contents)
  - [Purpose and the idea behind it](#purpose-and-the-idea-behind-it)
  - [What it helps with](#what-it-helps-with)
  - [How the app works (user flow)](#how-the-app-works-user-flow)
  - [Tech stack](#tech-stack)
  - [Project structure](#project-structure)
  - [What makes it run: Groq, Gemini and Supabase](#what-makes-it-run-groq-gemini-and-supabase)
  - [Behind the scenes](#behind-the-scenes)
  - [Setup](#setup)
  - [Environment variables](#environment-variables)
  - [Deploying on Render](#deploying-on-render)
  - [Problems faced and how they were solved](#problems-faced-and-how-they-were-solved)
  - [Improvements made along the way](#improvements-made-along-the-way)
  - [Limitations](#limitations)
  - [Future scope](#future-scope)
  - [Credits and licence](#credits-and-licence)

---

## Purpose and the idea behind it

Most apps want more of your attention. Flâner does the opposite: it talks to you for about a minute, helps you leave, and then gets out of the way.

Many people stay inside not because they don't want to go out, but because the first step feels big: a grocery run they keep postponing, a walk they never start, a place they're curious about but never visit. Flâner turns "I should go out" into a short checklist ("freshen up if you want to, put on your shoes, open the door") and treats staying home as okay, never as failure.

The design principles are:
- **Make it small.** Every plan is broken into tiny, concrete steps.
- **No shame, no scores.** No XP, streaks or leaderboards. Partial progress counts.
- **Phone away.** The plan is prepared before you leave. No live chat, GPS or timers to babysit.
- **Notice the world.** After every outing, you recall what you saw, enjoyed and noticed. This is active recall, and it builds observation skills over time.
- **Privacy by default.** Reflection notes are stored only if you choose to save them.

## What it helps with

- Getting out for **everyday tasks** you keep postponing: groceries, errands, appointments, college.
- **Exploring**: walks, your neighbourhood, time in nature, somewhere new.
- **A gentle nudge** when you feel stuck, overwhelmed or reluctant to leave. Support questions (what's making it hard, what you expect might happen) appear only if you ask for them.
- **Building attention and observation** through the "Look back" prompts: one thing you saw, one you enjoyed, one you noticed for the first time.
- **Keeping a private record** of getting out: outings, minutes outside, places visited, everyday tasks done, and saved moments.

## How the app works (user flow)

```
Login / Sign up
      │
      ▼
 Dashboard  ──────────────►  My moments  ·  Profile      (bottom tab bar)
      │
      ▼  "Plan an outing"
 Choose a door
   • I have somewhere to go
   • I want to explore
   • I need a little nudge
      │
      ▼
 Choose an outing  (or describe one in your own words)
      │
      ▼
 Optional details: shopping items, time, energy
      │
      ├── "Just help me plan" ───────────────┐
      └── "I'm finding it hard to go"        │
            └─ what's making it hard? ───────┤
                                              ▼
                              AI builds an editable checklist
                              (add / remove steps, print or save)
                                              │
                                              ▼  "I'm ready"
                              Phone-away screen: "The world is waiting."
                                              │
                                              ▼  "I'm back"
                    Reflection: how was it? + Look back (saw / enjoyed / noticed)
                                              │
                                              ▼
                  AI acknowledgement  →  Save this moment · Plan another · Done
                                              │
                                              ▼
                                  Back to the dashboard
```

**Screens**
| Screen           | What it does                                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Dashboard        | Landing page after login: this week's stats, recent activity, "Continue my plan" if one is unfinished.                    |
| Plan (home)      | Three entry points plus "Today's little idea".                                                                            |
| Outing + details | Pick or describe an outing, add optional details.                                                                         |
| Support          | Optional barrier questions, only on the "I'm finding it hard" route. Safety concerns lead to safer options, not pressure. |
| Plan / checklist | AI-generated groups of steps, items to bring or buy, and optional "notice along the way" prompts. Fully editable.         |
| Phone-away       | Calm screen. No timer, chat or tracking.                                                                                  |
| Reflection       | Five gentle feeling options, one optional question (or three on the support route), Look back, optional place.            |
| Celebration      | AI-written acknowledgement and an original encouragement line. No scores.                                                 |
| My moments       | Private chronological record with stats and saved moments.                                                                |
| Profile          | Name, preferred step size, a note about yourself, log out, delete account.                                                |

## Tech stack

| Layer                  | Technology                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------------- |
| Frontend               | HTML, CSS and vanilla JavaScript (no framework, no build step)                                    |
| Backend                | Node.js 18+ and Express                                                                           |
| Auth and database      | Supabase (Auth, Postgres, Row Level Security)                                                     |
| Plan model             | Groq, running the open-weight `openai/gpt-oss-20b` through Groq's OpenAI-compatible API           |
| Reflection model       | Google Gemini (`gemini-3.5-flash-lite`) through Google's OpenAI-compatible endpoint               |
| Other supported models | Any OpenAI-compatible provider (Ollama, LM Studio, vLLM, Hugging Face, DeepSeek...) and Anthropic |
| Offline support        | Service worker plus a local outbox for saved outings                                              |
| Hosting                | Render (single web service that also serves the frontend)                                         |
| Fonts                  | Fraunces and Figtree, bundled locally (SIL Open Font License)                                     |
| Libraries              | `@supabase/supabase-js` (bundled in `frontend/vendor`), `express`, `cors`, `dotenv`               |

## Project structure

```
flaner/
├── README.md
├── .gitignore
├── backend/
│   ├── server.js              Express server: auth check, AI calls, static hosting
│   ├── package.json
│   ├── .env.example           All settings, with comments
│   ├── .env                   YOUR secrets (never committed)
│   └── supabase/
│       └── schema.sql         Tables, constraints, row-level security, signup trigger
└── frontend/
    ├── index.html             Page shell, icons, service-worker registration
    ├── sw.js                  Service worker (offline app shell)
    ├── assets/
    │   └── logo.svg           The cat-on-a-ledge logo and favicon
    ├── css/
    │   └── style.css          All styles
    ├── fonts/                 Fraunces and Figtree (woff2) plus licences
    ├── vendor/                supabase.js (bundled, no CDN) plus licence
    └── js/
        ├── config.js          Supabase URL and anon key (served from .env by the backend)
        ├── data.js            Brand text, outings, built-in plans, tips, icons
        ├── app.js             State, screens, navigation, checklist editing
        ├── api.js             Calls to the backend, saving, offline outbox
        └── auth.js            Login, sign-up, password reset, profile, app start
```

**API endpoints (all under the same server)**
| Method and path        | Purpose                                                            |
| ---------------------- | ------------------------------------------------------------------ |
| `GET /js/config.js`    | Public Supabase settings, generated from `.env`                    |
| `POST /api/mission`    | Builds the plan with the plan model                                |
| `POST /api/reflection` | Writes the end-of-outing acknowledgement with the reflection model |
| `DELETE /api/account`  | Deletes the signed-in user's account (needs the service-role key)  |

All `/api/*` routes require a valid Supabase login token.

## What makes it run: Groq, Gemini and Supabase

Each outing makes **two AI calls**. They are deliberately split across two providers so one provider's limits can never block the whole app.

| Job                                   | Provider and model                           | Why                                                                                   |
| ------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------- |
| **Plan** (structured JSON checklist)  | **Groq**, `openai/gpt-oss-20b` (open-weight) | Fast and open-weight, which fits the Touch Grass theme. The heavier, structured task. |
| **Reflection** (a few kind sentences) | **Google Gemini**, `gemini-3.5-flash-lite`   | Light task, generous free tier, and a separate quota from the plan model.             |
| **Accounts and data**                 | **Supabase**                                 | Login, profiles, saved outings, per-user security.                                    |

Configure them in `backend/.env`:

```dotenv
LLM_PROVIDER=openai
LLM_BASE_URL=https://api.groq.com/openai/v1
LLM_API_KEY=your_groq_key
LLM_MODEL=openai/gpt-oss-20b
```

```dotenv
REFLECT_PROVIDER=openai
REFLECT_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/
REFLECT_API_KEY=your_gemini_key
REFLECT_MODEL=gemini-3.5-flash-lite
```

Notes:
- The two model lines that matter most are `LLM_MODEL=openai/gpt-oss-20b` (plan) and `REFLECT_MODEL=gemini-3.5-flash-lite` (reflection).
- Gemini 3 models are best left at temperature 1.0 (Google's guidance). The server's `callLLM` uses 1.0 for model names that start with `gemini-3`.
- Gemini is **not** open-weight. The open-weight model (gpt-oss) does the main work. Gemini only writes the closing acknowledgement, and `REFLECT_PROVIDER=off` removes it entirely.
- Free-tier Gemini requests may be used to improve Google's products. Use a paid tier for real users' private text.
- If either model fails or times out, the app falls back to built-in content, so the user never sees a broken screen.

## Behind the scenes

1. **Login.** Supabase Auth issues a token. The frontend never shows app screens without a session.
2. **Plan request.** The browser sends the task, free-text details, shopping items, time, energy, route (plan only or support), barriers and profile hints to `POST /api/mission` with the login token.
3. **Verification.** The server checks the token with Supabase on every call and applies a rate limit (30 AI generations per user per hour).
4. **Prompting.** A system prompt (`SYSTEM` in `server.js`) tells the model to return only JSON and sets the rules:
   - The plan must be specific to the real task.
   - Shopping items appear word for word.
   - Errands get "check opening hours" and "What to bring".
   - Walks get an optional "notice along the way" group.
   - It never invents a park, shop, route or opening time.
   - Safety concerns lead to safer options.
5. **Parsing.** The server extracts the JSON (even if the model wraps it in text or markdown), validates the shape, limits lengths and drops unknown fields.
6. **Rendering.** The frontend turns the JSON into an editable checklist. If anything fails, a built-in plan is used instead.
7. **Going out.** The plan is already on the device and the app works offline once loaded (service worker). Ticking items is optional.
8. **Reflection.** The reflection prompt (`REFLECT_SYSTEM`) receives the outing, the feeling, and what the person saw, enjoyed and noticed. It returns praise that mentions a detail they gave, an optional insight, and an original encouragement line. The line is never attributed to a real person, so it can't misquote anyone.
9. **Saving.** An outing is recorded when the person finishes. Reflection text (saw, enjoyed, noticed, expected, happened, remember) is stored only if they tap **Save this moment**. Outings finished offline wait in a local outbox and sync when the connection returns.

**Security and privacy**
- Row Level Security: a user can only read and write their own rows. Logged-out visitors have no access to the tables.
- The Supabase anon key is public by design. The model keys and the service-role key stay in `backend/.env` on the server.
- CORS is same-origin by default (`ALLOWED_ORIGINS` to widen it). Basic security headers are set.
- Password reset by email and "Delete my account and data" on the profile page.
- Text length limits are enforced in the database.

**Data stored (Supabase)**
- `profiles`: `id`, `display_name`, `comfort`, `about`, `updated_at`
- `missions`: `id`, `user_id`, `task`, `feeling`, `place`, `minutes`, `moment`, `fear`, `happened`, `learned`, `saw`, `enjoyed`, `noticed`, `created_at`

## Setup

You need Node.js 18+, a Supabase project, and API keys for your models.

1. **Supabase.** Create a project. In the SQL Editor, run `backend/supabase/schema.sql` (safe to re-run).
2. **Auth settings.** Authentication, Email provider: keep "Confirm email" on for real use (off only while testing). Under URL Configuration, add your site address (for example `http://localhost:3000`) to the redirect URLs.
3. **Keys.**
```bash
   cd backend
   cp .env.example .env      # on Windows: copy .env.example .env
```
   Fill in the Supabase and model values (see below).
4. **Run.**
```bash
   npm install
   npm start
```
5. **Open** http://localhost:3000 and create an account.

Login is required. The app needs a connection for sign-in, plan generation and syncing, because accounts and saved outings live in Supabase.

## Environment variables

| Variable                    | Required | Purpose                                                                |
| --------------------------- | -------- | ---------------------------------------------------------------------- |
| `SUPABASE_URL`              | yes      | Your Supabase project URL                                              |
| `SUPABASE_ANON_KEY`         | yes      | Public anon key                                                        |
| `SUPABASE_SERVICE_ROLE_KEY` | optional | Lets users delete their account. **Secret, server only.**              |
| `LLM_PROVIDER`              | yes      | `openai` (any OpenAI-compatible API) or `anthropic`                    |
| `LLM_BASE_URL`              | yes      | e.g. `https://api.groq.com/openai/v1`                                  |
| `LLM_API_KEY`               | yes      | Key for the plan model                                                 |
| `LLM_MODEL`                 | yes      | e.g. `openai/gpt-oss-20b`                                              |
| `LLM_JSON_MODE`             | no       | `true` if your provider supports forced JSON (leave `false` otherwise) |
| `REFLECT_PROVIDER`          | no       | `same` (default), `huggingface`, `openai`, `anthropic` or `off`        |
| `REFLECT_BASE_URL`          | no       | e.g. the Gemini OpenAI-compatible URL                                  |
| `REFLECT_API_KEY`           | no       | Key for the reflection model                                           |
| `REFLECT_MODEL`             | no       | e.g. `gemini-3.5-flash-lite`                                           |
| `HF_TOKEN`                  | no       | Only for `REFLECT_PROVIDER=huggingface`                                |
| `ALLOWED_ORIGINS`           | no       | Only if the frontend is hosted on a different address                  |
| `ALLOW_LOCAL_MODE`          | no       | Development only. Skips login. Never enable on a hosted server.        |
| `PORT`, `HOST`              | no       | Render sets the port itself                                            |

Never commit `backend/.env`. The `.gitignore` already excludes it.

## Deploying on Render

1. Push the repo to GitHub.
2. Render, then **New**, then **Web Service**, then connect the repo.
3. Settings:
   - Language: **Node**
   - **Root Directory: leave empty** (the backend serves `../frontend`, which would be unavailable if you set the root to `backend`)
   - Build command: `cd backend && npm install`
   - Start command: `cd backend && npm start`
   - Instance type: Free is fine for a demo
4. Add the environment variables from `backend/.env` in Render's **Environment** tab. Use hosted models (Groq, Gemini). A model on `localhost` is not reachable from Render.
5. In Supabase, Authentication, URL Configuration: set the Site URL to your Render URL and add it to the redirect URLs.
6. Pushing to `main` redeploys automatically.

Free instances spin down after 15 minutes of no traffic, so the first request afterwards is slow. Open the app a minute before a demo.

## Problems faced and how they were solved

| Problem                                                     | Cause                                                                                                                                                                                           | Fix                                                                                                                                                |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Hugging Face returned HTTP 402** ("no remaining credits") | Hugging Face's Inference Providers use pre-paid credits. Free accounts get a small monthly allowance, and once it's used up the API refuses requests until you buy credits or subscribe to PRO. | Moved the reflection model to **Gemini** (free tier). Hugging Face stays available as an option via `REFLECT_PROVIDER=huggingface` and `HF_TOKEN`. |
| **Hitting one provider's call limit**                       | Each outing makes two AI calls.                                                                                                                                                                 | Split the calls: Groq for the plan, Gemini for the reflection, each with its own quota. The reflection can be switched off.                        |
| **Not knowing which provider failed**                       | Errors only said "LLM 402".                                                                                                                                                                     | Error logs now include the model and URL, e.g. `LLM [model @ url] 402 ...`.                                                                        |
| **Pages seemed not to scroll**                              | The bottom tab bar and main buttons were meant to stay pinned, but `overflow:hidden` on the main container stopped them pinning, so they sat off-screen until the end of the page.              | Changed the container to `overflow:clip`. Verified in a real headless Chromium.                                                                    |
| **Dead-end "That's enough for today" page**                 | No home or dashboard to return to.                                                                                                                                                              | Added a dashboard as the landing page, a bottom tab bar, and a "Back to my dashboard" button.                                                      |
| **`npm start` failed ("Missing script: start")**            | Commands were run in the wrong folder.                                                                                                                                                          | Run them inside `backend/`.                                                                                                                        |
| **Local model unreachable once deployed**                   | `localhost` on Render is Render's own container, not your laptop.                                                                                                                               | Use hosted models in production.                                                                                                                   |
| **Unreliable model JSON**                                   | Models sometimes add text or markdown around JSON, or invent fields.                                                                                                                            | Regex extraction, strict validation and clipping on the server, plus built-in fallback plans.                                                      |
| **Models inventing quotes and places**                      | LLMs often misattribute quotes and invent locations.                                                                                                                                            | The encouragement line is original and unattributed. The prompt forbids inventing places, routes or opening hours.                                 |
| **Fear-focused design felt heavy**                          | Early versions put anxiety front and centre.                                                                                                                                                    | Redesigned around "make room for more life": exploration first, support only on request.                                                           |
| **Email links pointing to localhost after deployment**      | Supabase redirect URLs still listed only local addresses.                                                                                                                                       | Add the Render URL to the Site URL and redirect URLs.                                                                                              |

## Improvements made along the way

- Open-weight, local-first AI option (Ollama) with a hosted setup for production.
- Login with Supabase, per-user data isolation (Row Level Security), password reset, account deletion.
- AI plans that adapt to the task, time, energy, shopping items and optional barriers, with editable checklists.
- A phone-away screen with no timer, chat or tracking; the plan works offline once loaded.
- "Look back" reflection (saw, enjoyed, noticed) for active recall and observation skills.
- Reflection notes stored only if the user saves the moment.
- Offline outbox: outings finished offline sync later.
- Separate reflection model with Hugging Face, Gemini and other providers supported.
- Dashboard, bottom navigation, resume-where-you-left-off, print or save the checklist.
- UX polish: touch targets of at least 44px, accessible labels and focus handling, screen transitions, toasts with undo, reduced-motion support.
- Bundled fonts and libraries (no third-party CDNs).

## Limitations

- Needs internet for sign-in, plan generation and syncing. Only a loaded plan and the app shell work offline.
- Free tiers have limits: Groq and Gemini rate limits, Hugging Face credits, and Render cold starts after 15 minutes idle.
- The model doesn't know the user's location, so it never names real places. The user supplies them.
- Gemini is not open-weight, and free-tier Gemini data may be used by Google to improve its products.
- Flâner is a gentle everyday companion, not a medical or mental-health service.

## Future scope

**Product**
- Optional, opt-in location for verified nearby suggestions (parks, markets, libraries) with real opening hours.
- Seasonal and weather-aware ideas (fall foliage walks, birding, run clubs, community events).
- A "buddy" mode: invite a friend to join an outing, privately.
- Gentle, optional reminders and a weekly summary of what you noticed (no streaks).
- Photo or sketch notes in My moments, and an export of your own data.
- Voice input for reflections, and more languages.
- An installable app (PWA) with a richer offline mode.

**AI**
- Automatic fallback between models (primary and backup) instead of falling back straight to built-in text.
- Fine-tuning or prompt-tuning a small open-weight model on anonymised, consented "expected vs what happened" pairs.
- Evaluation: measure JSON validity, latency and user-rated kindness across models.
- Personalised "notice" prompts that grow in difficulty as observation improves.

**Engineering**
- Automated tests and CI for the server and the frontend.
- Move the rate-limit store to Redis for multi-instance hosting, and add per-IP limits.
- Stricter Content-Security-Policy, error monitoring and privacy-friendly analytics.
- A framework migration if the UI grows.

## Credits and licence

- Fonts: Fraunces and Figtree (SIL Open Font License), included in `frontend/fonts`.
- `@supabase/supabase-js` (MIT), included in `frontend/vendor`.
- Open-weight model: `openai/gpt-oss-20b`, served by Groq.
- Built for the Touch Grass hackathon.

