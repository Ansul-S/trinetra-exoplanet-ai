# TRINETRA Dashboard

Next.js 14 dashboard for the TRINETRA Exoplanet Discovery System.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home — live stats + top 3 candidates |
| `/planets` | All candidates with filters + search |
| `/planets/[star_id]` | Full scientific profile + MC histogram |
| `/map` | Interactive HZ orbit map (D3) |
| `/score` | Score any new planet in real time |
| `/pipeline` | Pipeline walkthrough + references |

## Setup

```bash
npm install
cp .env.local.example .env.local   # already configured
npm run dev
# Opens at http://localhost:3000
```

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set env variable in Vercel dashboard:
# TRINETRA_API_URL = https://ansul-s-trinetra-api.hf.space
```

## Tech Stack

- Next.js 14 App Router + TypeScript
- Tailwind CSS — space theme
- Framer Motion — page transitions + card hover
- D3.js — HZ orbit map with animation
- Recharts — score bars + MC histogram
- React Query — data fetching + caching
- Space Grotesk / Space Mono fonts

## API

All data comes from the TRINETRA FastAPI backend:
`https://ansul-s-trinetra-api.hf.space`

Dashboard proxies through `/app/api/` routes to keep the HF URL server-side.
