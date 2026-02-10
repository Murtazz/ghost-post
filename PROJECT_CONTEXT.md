# Ghost-Post — Project Context (Save State)

> **Last updated:** February 9, 2026
> **Session status:** Paused — all features working, ready for next sprint.

---

## 1. Project Identity

| Field | Value |
|---|---|
| **Name** | Ghost-Post |
| **One-liner** | Paste a link or messy notes, get polished LinkedIn posts or viral tweets in seconds with AI. |
| **Core Philosophy** | Simplicity and speed. One page, one button, instant results. No sign-up required to use (guest mode with localStorage). Accounts unlock cloud sync. |
| **Author** | MK |

---

## 2. Tech Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Framework | Next.js (App Router) | 16.1.6 | Full-stack React framework with Turbopack |
| React | React | 19.2.3 | UI library |
| Styling | Tailwind CSS | 4.1.18 | Utility-first CSS (v4 with `@tailwindcss/postcss`) |
| Dark Mode | next-themes | 0.4.6 | Class-based theme switching (`attribute="class"`, `defaultTheme="system"`) |
| AI | Google Gemini API (`@google/generative-ai`) | 0.24.1 | Content generation via `gemini-2.0-flash` model |
| Auth | Supabase Auth (`@supabase/ssr` + `@supabase/supabase-js`) | ssr 0.8.0 / js 2.95.3 | Magic link (OTP) passwordless authentication |
| Database | Supabase PostgreSQL | (hosted) | Cloud storage of generated posts for logged-in users |
| Icons | Lucide React | 0.563.0 | All icons throughout the app |
| Language | TypeScript | 5.x | Strict mode enabled |

---

## 3. Database Schema (Supabase)

The `posts` table must be created manually in the Supabase SQL Editor:

```sql
create table posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  topic text not null,
  vibe text not null,
  generated_content jsonb not null,
  created_at timestamptz default now() not null
);

-- Enable Row Level Security
alter table posts enable row level security;

-- Users can only see their own posts
create policy "Users can view own posts" on posts
  for select using (auth.uid() = user_id);

-- Users can insert their own posts
create policy "Users can insert own posts" on posts
  for insert with check (auth.uid() = user_id);

-- Users can delete their own posts
create policy "Users can delete own posts" on posts
  for delete using (auth.uid() = user_id);
```

### Column details:
- `topic` — AI-generated short title (4-8 words), prefixed with `(Twitter) ` for Twitter posts. Falls back to truncated raw input if AI doesn't return a title.
- `vibe` — One of: `"Funny"`, `"Professional"`, `"Crazy"`.
- `generated_content` — JSONB array of 3 post/tweet strings.

---

## 4. Current Features (All Working)

### Core Generation
- **Dual-platform support:** LinkedIn posts (long-form, <1500 chars) and X/Twitter tweets (strict <280 chars)
- **Platform toggle:** Visual LinkedIn / Twitter button switcher in the form
- **Vibe selector:** Funny, Professional, or Crazy tone
- **AI-generated titles:** Each generation gets a short 4-8 word summary title for the history
- **Structured prompts:** Each platform has 3 distinct structural approaches (Story/Value List/Contrarian for LinkedIn; How I Did It/Contrarian/Listicle for Twitter)
- **Copy-to-clipboard:** One-click copy on every generated post/tweet

### History
- **Guest mode (localStorage):** Stores last 20 entries, displays last 5. Works without any account.
- **Cloud mode (Supabase):** When logged in, saves to PostgreSQL and fetches last 10. Falls back to localStorage on error.
- **"History Sync Active" toast:** Shown when user is logged in.
- **Clear History button:** Deletes from both Supabase (if logged in) and localStorage.
- **Platform badges:** Each history entry shows a colored LinkedIn (blue) or Twitter (dark) badge.
- **Expandable cards:** Click to reveal individual posts/tweets with copy buttons.
- **Real-time sync:** Uses custom `ghost_history_updated` DOM event to update history list after generation.

### Authentication (Supabase Auth)
- **Magic link login:** Email-based OTP at `/login` — no passwords.
- **Auth callback:** `/auth/callback` handles the redirect and session exchange.
- **Session middleware:** Root `middleware.ts` refreshes the Supabase session on every request.
- **UserButton component:** Shows email + "Sign Out" when logged in, "Login" link when not.

### Dark Mode
- **System-aware:** Defaults to OS preference, with manual toggle.
- **ThemeToggle button:** Sun/Moon icon in top-right corner (next to UserButton).
- **Full coverage:** Every component has `dark:` variant classes (slate-900/950 backgrounds, light text, dark borders).
- **Tailwind v4 config:** `@custom-variant dark (&&:where(.dark, .dark *));` in `globals.css`.

### SEO & Social Sharing
- **Open Graph metadata:** Title, description, image (`/og-image.jpg` at 1200x630).
- **Twitter card:** `summary_large_image` with same title/description/image.

---

## 5. Environment Variables

Required in `.env.local`:

```env
# Google Gemini API key (from https://aistudio.google.com/apikey)
GEMINI_API_KEY=your_gemini_api_key

# Supabase project credentials (from Supabase Dashboard > Settings > API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your_anon_key_jwt
```

> **Note:** The Supabase keys must be the **legacy JWT format** (starting with `eyJ`), not the newer `sb_publishable_` format, for compatibility with `@supabase/ssr`.

---

## 6. Key File Structure

```
ghost-post/
├── app/
│   ├── api/
│   │   └── generate/
│   │       └── route.ts          # POST endpoint — dual-platform AI generation + Supabase save
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts          # GET — handles magic link redirect, exchanges code for session
│   ├── components/
│   │   ├── GeneratorForm.tsx      # Main form — platform toggle, vibe picker, textarea, results
│   │   ├── HistoryList.tsx        # History section — Supabase/localStorage, expandable cards, badges
│   │   ├── UserButton.tsx         # Auth status — email + sign out / login link
│   │   ├── ThemeToggle.tsx        # Dark mode toggle — Sun/Moon button
│   │   └── theme-provider.tsx     # next-themes ThemeProvider wrapper (Client Component)
│   ├── login/
│   │   └── page.tsx               # Login page — email input, magic link OTP
│   ├── globals.css                # Tailwind import + dark mode @custom-variant
│   ├── layout.tsx                 # Root layout — metadata, ThemeProvider, body classes
│   └── page.tsx                   # Home page — header, GeneratorForm, HistoryList, footer
├── utils/
│   └── supabase/
│       ├── client.ts              # Browser Supabase client (createBrowserClient)
│       ├── server.ts              # Server Supabase client (createServerClient + cookies)
│       └── middleware.ts          # Session refresh helper (updateSession)
├── middleware.ts                   # Next.js middleware — refreshes Supabase auth session
├── public/
│   └── og-image.jpg               # Social sharing preview image (1200x630)
├── .env.local                     # Environment variables (not committed)
├── next.config.ts                 # Next.js config (currently empty/default)
├── postcss.config.mjs             # PostCSS with @tailwindcss/postcss plugin
├── tsconfig.json                  # TypeScript config — strict, paths: @/* → ./*
└── package.json                   # Dependencies and scripts
```

---

## 7. Outstanding Tasks / Next Steps

### Ready to Build
- **Rate limiting:** No rate limiting on the `/api/generate` endpoint yet. Could add per-user limits (e.g., 10 generations/day for free tier).
- **Usage tracking:** Could add a `generations_count` column to a `profiles` table for tracking.
- **Migrate middleware to proxy:** Next.js 16 warns that `middleware.ts` is deprecated in favor of `proxy.ts`. The rename is trivial but hasn't been done yet.
- **Add a `platform` column to the `posts` table:** Currently the platform is encoded in the `topic` string as a `(Twitter) ` prefix. A proper column would be cleaner for querying/filtering.

### Polish Ideas
- **Refine Twitter prompt:** Sometimes tweets exceed 280 chars. Could add server-side validation to trim or re-generate.
- **Loading states for history:** No skeleton while Supabase history loads.
- **Toast notifications:** The "History Sync Active" banner is static. A dismissable toast system would be cleaner.
- **Mobile responsiveness:** Works on mobile but the top-right controls (ThemeToggle + UserButton) could overflow on very small screens.
- **Deployment:** Not yet deployed. Ready for Vercel — just need to set env vars in the Vercel dashboard.

### Feature Ideas (Not Started)
- **Edit & regenerate:** Let users tweak a generated post and re-generate variations.
- **Scheduling integration:** Connect to LinkedIn/Twitter APIs to schedule posts directly.
- **Team/workspace support:** Multiple users under one org.
- **Export to PDF/image:** Generate shareable post previews.

---

## 8. Known Quirks

1. **Tailwind v4 dark mode** requires `&&` (double ampersand) in the `@custom-variant` selector: `@custom-variant dark (&&:where(.dark, .dark *));`. Single `&` will silently fail.
2. **Next.js 16 middleware deprecation:** The app uses `middleware.ts` which triggers a warning. It still works but Next.js wants it renamed to `proxy.ts` in the future.
3. **Supabase key format:** Must use the legacy JWT anon key (`eyJ...`), not the newer `sb_publishable_` format.
4. **`metadataBase` warning:** Next.js logs a warning about `metadataBase` not being set for OG images. Non-critical — only matters when deployed to a real domain (then set `metadataBase: new URL("https://yourdomain.com")`).
