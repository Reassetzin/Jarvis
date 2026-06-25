# Life OS — Personal Life Operating System

A mobile-first PWA built with Next.js 14 + Tailwind CSS. Your entire life tracked in one black-screen dashboard.

## Stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** — pure black + amber design system
- **localStorage** — offline-first daily data, 6 AM auto-reset
- **Supabase** — optional cloud sync (schema in `supabase-schema.sql`)
- **Anthropic API (claude-sonnet-4-6)** — Overseer chat + WHOOP AI Call
- **Recharts** — Peak Window cognitive energy chart
- **Vercel** — deployment target

---

## Quick Start

### 1. Install
```bash
npm install
```

### 2. Environment Variables
```bash
cp .env.example .env.local
```
Fill in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_USER_ID=user-1
```

### 3. Supabase (optional — for cloud history)
Run `supabase-schema.sql` in your Supabase SQL editor.

### 4. Dev
```bash
npm run dev
```

---

## Deploy to Vercel

1. Push to GitHub
2. Import at vercel.com → New Project
3. Add all 4 env vars in Vercel dashboard
4. Deploy

---

## Install as PWA

**iOS**: Safari → Share → Add to Home Screen  
**Android**: Chrome → ⋮ → Add to Home Screen

---

## Tabs

| Tab | What's inside |
|-----|--------------|
| **Main** | Day ring, goals, streak, Overseer AI chat |
| **Health** | WHOOP, Peak Window chart, Concerta timeline, supplements, caffeine, water, velo, energy, anxiety, wins, calories |
| **Brand** | Social counts + sparklines, daily reflection, post tracker, idea bank |
| **Finances** | Net worth, subscriptions, incoming orders, haul budget, wishlist |
| **Gym** | Today's workout (exercises + sets), volume calc, history |
| **Search** | Global search across all data |

---

## Data Reset

Daily trackers reset at **6 AM** automatically via localStorage timestamp comparison.  
Persistent data (supplements config, social history, finances, gym history) never auto-resets.

---

## Customize

- **Workout split labels**: `components/ui/TopBar.tsx` → `DAY_WORKOUTS`
- **Reset hour**: `lib/supabase.ts` → `resetHour = 6`
- **Water goal**: `components/health/SimpleTrackers.tsx` → `goal = 9`
