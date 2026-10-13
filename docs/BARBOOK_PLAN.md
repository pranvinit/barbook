# Barbook — Refactor Plan

> Rebrand and re-architect **flirty** into **Barbook**: an AI notebook for rap bars and lyrics.
> Same stack: Next.js, Redux Toolkit / RTK Query, Supabase, Gemini.

---

## 1. Why change (issues in the current code)

| Issue | Where | Fix |
|---|---|---|
| API trusts `uuid` from the request body — anyone with a UUID can edit/delete another user's data | `api/flirts/*`, `api/profile/*` | Supabase Auth + row-level security |
| Rate limiter is in-memory with `MAX_REQUESTS = 1000000`; resets on serverless; `express-rate-limit` unused | `src/middleware.js` | Postgres-backed per-user quota for LLM calls |
| User text interpolated straight into prompts (prompt injection) | `src/lib/gemini.js` | Delimited input + "treat as data" instructions + Zod validation |
| Artificial 1s delay | `api/flirts/route.js` | Delete |
| Single `"use client"` page — nothing public, shareable or indexable | `src/app/page.js` | Server components for public pages |

---

## 2. Product

**Private notebook** — write bars, grouped into songs. Each bar gets:

- **Rhyme map** — AI returns rhyming syllable groups; UI colours each group with a highlighter colour (the hero screenshot).
- **Rubric scores** — rhyme density, flow, wordplay, punch, originality + one line of coaching.
- **Originality check** — embedding similarity against your past bars and the community's ("you've used this flip before").

Plus:

- **Writer's block / Ghostwriter** — select your last few bars, AI streams 3 continuations in *your* style (your top bars as few-shot examples).
- **Artist profile** — handle, influences, styles, artist statement; AI writes an "artist identity" read.
- **Public pages** — `/u/[handle]`, `/bar/[id]` with auto-generated OG share cards, `/explore` feed, likes.
- **v2** — voice memos: record your flow, Gemini scores delivery.

### Mapping from the current app

| flirty | Barbook |
|---|---|
| Profile name + avatar | Artist handle + avatar |
| Hobbies chips | Influences |
| Traits chips | Styles |
| Bio | Artist statement |
| `ProfileJudgement` / `judgeProfile` | Artist read |
| `AddFlirt` | Bar editor |
| `judgeFlirt` (score + feedback) | `judgeBar` (rubric + rhyme map + feedback) |
| `FlirtHistoryList` | Bar history / notebook |
| `TopFlirtList` | Hall of fame (top bars) |
| `SuggestedFlirtList` / `getFlirtSuggestions` | Ghostwriter (streaming) |
| `AIScore` (average) | Average bar score |

---

## 3. Target architecture

```
Browser (RTK Query + Redux)  ──►  Next.js Route Handlers  ──►  Supabase (Postgres + RLS, Storage, pgvector)
        ▲                               │
        │  Supabase Realtime            └──►  lib/llm  ──►  Gemini (judge, generate, embed)
        └──── likes / new bars                     └──► llm_calls log + per-user quotas
Server Components render public pages (/u, /bar, /explore) + OG images
```

### Folder layout

```
src/
  app/
    (marketing)/page.js              landing (server component)
    (app)/notebook/page.js           workspace (current Home, rebuilt)
    (app)/notebook/[songId]/page.js
    u/[handle]/page.js               public profile
    bar/[id]/page.js + opengraph-image.js
    explore/page.js
    auth/callback/route.js
    api/
      bars/route.js                  GET (cursor), POST
      bars/[id]/route.js             PATCH, DELETE
      bars/[id]/judge/route.js       re-score
      songs/...                      CRUD
      ghostwrite/route.js            streaming
      profile/route.js, profile/avatar/route.js, profile/read/route.js
  features/
    auth/         authSlice, useSession, SignInButton
    bars/         api/barsApi.js, ui/BarCard, BarEditor, RhymeHighlighter,
                  BarHistory, TopBars, ScoreBreakdown
    songs/        api, ui/SongList, SongSidebar
    ghostwriter/  ui/GhostwriterPanel
    profile/      ProfileEssentials, Influences/Styles (from ProfileInterests), ArtistRead
    ui/           uiSlice, theme
  lib/
    supabase/{client,server,middleware}.js   (@supabase/ssr)
    llm/{client,prompts/,schemas/,judgeBar,ghostwrite,readArtist,embed}.js
    rateLimit.js
  middleware.js                      session refresh + protected routes
supabase/migrations/*.sql
evals/bars.json + evals/run.mjs
```

---

## 4. Data model

```sql
create extension if not exists vector;

profiles      (id uuid pk references auth.users, handle citext unique, display_name,
               avatar_url, statement text, influences text[], styles text[],
               artist_read jsonb, created_at)
songs         (id, owner_id → profiles, title, mood, bpm int, created_at)
bars          (id, owner_id, song_id null, position int, text,
               scores jsonb,        -- {rhyme, flow, wordplay, punch, originality}
               overall numeric, feedback text,
               rhyme_map jsonb,     -- [{group:"A", spans:[[start,end],…]}]
               embedding vector(768),
               is_public bool default false, created_at, updated_at)
bar_revisions (bar_id, text, overall, created_at)
likes         (user_id, bar_id, pk(user_id, bar_id))
llm_calls     (user_id, kind, model, input_tokens, output_tokens, latency_ms, created_at)

-- RLS: owner has full access; anyone can read public bars and profiles
-- RPCs: avg_score(user), match_bars(embedding, threshold, k), consume_quota(user, kind)
```

API routes use a Supabase client bound to the session cookie, so RLS enforces ownership. The `uuid` parameter is removed everywhere.

---

## 5. LLM layer (`lib/llm/`)

| Function | Replaces | Output |
|---|---|---|
| `judgeBar(text, artist, context)` | `judgeFlirt` | rubric scores, overall, feedback, `rhyme_map` (structured output) |
| `ghostwrite(lines, artist, examples)` | `getFlirtSuggestions` | streamed continuations tagged punchline / multisyllabic / storytelling / hook |
| `readArtist(profile, topBars)` | `judgeProfile` | identity read, strengths, one thing to work on |
| `embed(text)` | new | 768-dim vector |

Rules:
- Prompts in their own files; user text inside delimited tags, treated as data only.
- Every response validated with Zod, one retry on failure.
- Every call logged to `llm_calls` and checked against the user's quota first.
- Eval set (~30 bars with expected score bands) runnable via `npm run eval`.

---

## 6. Redux / frontend

**Keep:** `apiSlice` + injected endpoints, optimistic `updateQueryData`, listener-based toasts, `uiSlice`, ThemeManager, spinners, chip inputs, debounced autosave.

**Upgrade:**
- Manual merge/`serializeQueryArgs` infinite scroll → RTK 2.x `infiniteQuery` with cursor pagination.
- `profileSlice.initializeApp` → `authSlice` driven by Supabase `onAuthStateChange`.
- Tags: `Bar`, `Song`, `Profile`, `ArtistRead`.
- Ghostwriter: read the stream with `fetch`, update local state as text arrives.

**Visual identity:**
- Drop neumorphism.
- Lined-notebook background, ink-black text, highlighter colours for rhyme groups, sticker-style score badges.
- Monospace for bars (IBM Plex Mono / JetBrains Mono) + gritty display face for headings.
- Dark mode = "studio at 3am".
- Replace the Lottie loader with a pen-scribble loader; new favicon.

---

## 7. Phases

1. **Foundation** — `@supabase/ssr` auth, migration + RLS, `lib/llm`, rename flirts → bars across API and Redux, remove fake delay and in-memory limiter, new theme and fonts, `package.json` name → `barbook`, layout metadata, README. *App works as a private notebook.*
2. **Notebook depth** — songs, per-criterion scores, rhyme highlighter, revision history, cursor pagination.
3. **AI depth** — streaming ghostwriter, artist read, embeddings + originality check, quotas, `llm_calls` log.
4. **Going public** — public bars, `/u/[handle]`, `/bar/[id]` + OG images, explore feed, Realtime likes.
5. **Polish** — evals, Vitest + one Playwright e2e, GitHub Actions CI, README with architecture diagram, GIF and setup steps.
6. **v2** — voice memos with delivery scoring.

---

## 8. Repo rename

Must be done in the GitHub UI:

1. github.com/pranvinit/flirty → **Settings → General → Repository name** → `barbook` → Rename.
2. Old URLs, clones and pushes redirect automatically.
3. Update local clone: `git remote set-url origin https://github.com/pranvinit/barbook.git`
4. Vercel follows the rename; project name and `*.vercel.app` domain must be changed separately.
5. Set description ("AI notebook for rap bars: rhyme maps, scoring, ghostwriter"), website (live demo) and topics (`nextjs`, `redux-toolkit`, `supabase`, `gemini`, `pgvector`).

---

## 9. Open questions before Phase 1

- [ ] Apply the Supabase migration via connector, or commit as files only?
- [ ] OK to wipe existing flirts data?
- [ ] Sign-in method — Google + magic link?

---

## Resume line (draft)

> Built **Barbook**, an AI notebook for rap lyricists (Next.js 15, Redux Toolkit/RTK Query, Supabase + pgvector, Gemini structured outputs & streaming) featuring rhyme-scheme visualisation, rubric-based bar scoring, embedding-based originality checks, and a style-aware streaming ghostwriter, secured with Supabase Auth and row-level security.
