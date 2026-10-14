# Barbook

An AI notebook for rap bars. Write a bar and Barbook scores it on a rubric, maps its rhyme scheme and coaches you on the next draft. When you're stuck, the ghostwriter suggests three next lines in your own style.

**Stack:** Next.js 15 (App Router) · Redux Toolkit + RTK Query · Supabase (Auth, Postgres with row-level security, Storage, pgvector) · Google Gemini (structured outputs) · Zod

## Features

- **Bar scoring.** Each bar is rated on rhyme, flow, wordplay, punch and originality, with an overall score and one line of coaching.
- **Rhyme maps.** The model groups rhyming words, and the server turns them into character spans for highlighting.
- **Ghostwriter.** Three continuations of your latest bars (punchline, multisyllabic, storytelling or hook), written using your best bars as examples.
- **Artist profile and read.** Handle, influences, styles and an artist statement, plus an A&R-style read on your lane, strengths and one thing to work on.
- **Revision history.** Rewriting a bar keeps the previous version and its score.

## Architecture

```
Browser (Redux Toolkit + RTK Query)
   │  fetch /api/*  (session cookie)
   ▼
Next.js route handlers ── Zod validation ── quota check (llm_calls)
   │                                   │
   ▼                                   ▼
Supabase (RLS as the signed-in user)  lib/llm → Gemini (structured JSON, validated, 1 retry)
```

- **Auth.** Supabase Auth (magic link or Google) through `@supabase/ssr`. Middleware refreshes the session cookie and protects `/notebook`.
- **Ownership.** Route handlers query Supabase as the signed-in user, so row-level security decides what each user can read or write. The client never sends a user id.
- **LLM layer** (`src/lib/llm`). Prompts live in their own files and user text is passed as delimited data. One Zod schema per call drives both Gemini's JSON schema and response validation. Every call is logged to `llm_calls`, which also backs per-user daily quotas.
- **State.** RTK Query handles server state, with optimistic updates for edits and deletes. A listener middleware shows API errors as toasts, and `authSlice` mirrors `onAuthStateChange`.

```
src/
  app/               routes: landing, /login, /notebook, /auth/callback, /api/*
  features/          auth, bars, ghostwriter, profile, ui (slices, RTK Query endpoints, components)
  lib/llm/           Gemini client, prompts, schemas, judgeBar, ghostwrite, readArtist
  lib/supabase/      browser, server and middleware clients
  lib/api/           request validation and shared query helpers
supabase/migrations/ schema, RLS policies, RPCs, storage policies
```

## Getting started

### 1. Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project
- A [Gemini API key](https://aistudio.google.com/apikey)

### 2. Environment

```bash
cp .env.example .env.local
```

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API (anon / publishable key) |
| `GOOGLE_GENAI_API_KEY` | Google AI Studio |
| `GOOGLE_GENAI_MODEL_ID` | Optional, defaults to `gemini-2.5-flash` |

### 3. Database

Run `supabase/migrations/20261014000000_barbook_schema.sql` in the Supabase SQL editor, or with the CLI:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

If the project still has the old flirty tables, they are renamed to `legacy_profiles` and `legacy_flirts` and locked down, not dropped.

### 4. Auth settings

In Supabase → Authentication → URL Configuration:

- **Site URL:** `http://localhost:3000` (your production URL when you deploy)
- **Redirect URLs:** `http://localhost:3000/auth/callback` and your production equivalent

Magic links work with Supabase's built-in email provider, which is rate-limited; use custom SMTP for production. Google sign-in also needs Authentication → Providers → Google, configured with an OAuth client from Google Cloud.

### 5. Run

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Roadmap

1. ~~Foundation: auth, RLS, LLM layer, bars rename, new identity~~
2. Notebook depth: songs, rhyme highlighter, revision history UI, cursor pagination
3. AI depth: streaming ghostwriter, embeddings and originality check
4. Going public: `/u/[handle]`, `/bar/[id]` with OG share cards, explore feed, likes
5. Polish: evals, Vitest and Playwright, CI
6. Voice memos with delivery scoring
