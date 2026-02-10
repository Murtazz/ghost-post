# Ghost-Post

**Stop staring at a blank page.** Paste your messy notes, a link, or a brain-dump — and Ghost-Post turns it into polished LinkedIn posts or punchy tweets in seconds.

No copywriting degree required. Just vibes.

---

## What it does

You give it raw material (an article, some bullet points, a half-baked idea). It gives you back 3 ready-to-post pieces of content — structured, formatted, and actually good.

- **LinkedIn mode** — Long-form posts with hooks, stories, and value lists
- **Twitter / X mode** — Tight, viral tweets under 280 characters
- **3 vibes** — Professional, Funny, or Crazy. Pick your energy.

Each generation also gets an AI-generated title so you can glance at your history and immediately remember what it was about.

## Features

- Dark mode (because obviously)
- Magic link login — no passwords, just email
- Cloud history sync for logged-in users (Supabase)
- Guest mode with localStorage for everyone else
- Copy-to-clipboard on every post
- Platform badges and character counts on tweets
- Open Graph + Twitter cards for social sharing

## Getting started

### 1. Clone it

```bash
git clone https://github.com/your-username/ghost-post.git
cd ghost-post
npm install
```

### 2. Set up your environment

Create a `.env.local` file in the root:

```env
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

- **Gemini key** — grab one free at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
- **Supabase credentials** — from your project's Settings > API page

### 3. Set up the database

Run this in the Supabase SQL Editor to create the `posts` table:

```sql
create table posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  topic text not null,
  vibe text not null,
  generated_content jsonb not null,
  created_at timestamptz default now() not null
);

alter table posts enable row level security;

create policy "Users can view own posts" on posts
  for select using (auth.uid() = user_id);

create policy "Users can insert own posts" on posts
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own posts" on posts
  for delete using (auth.uid() = user_id);
```

### 4. Run it

```bash
npm run dev
```

Open [localhost:3000](http://localhost:3000) and start ghostwriting.

## Tech stack

- **Next.js 16** (App Router + Turbopack)
- **Tailwind CSS v4** with full dark mode
- **Google Gemini** (gemini-2.0-flash) for content generation
- **Supabase** for auth + database
- **next-themes** for dark/light/system toggle
- **Lucide React** for icons

## Deploy

Works great on Vercel. Just push to GitHub, connect the repo, add your env vars in the Vercel dashboard, and you're live.

---

Built by MK.
