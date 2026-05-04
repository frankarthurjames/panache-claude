# Panache — Claude Code context

## Stack
- React 18 + Vite + TypeScript
- Supabase (PostgreSQL + RLS) — client at `@/integrations/supabase/client`
- React Query v5 (`@tanstack/react-query`)
- React Router v6
- shadcn/ui — kept only in `EventDetail.tsx` (Carousel, Dialog)
- No Tailwind utility classes in new code — inline styles only

## Git workflow
Branch: `sprint-corrections`
After each file: `git add → commit → checkout main → merge --ff-only → push → checkout sprint-corrections`
Never push to a branch other than main (via ff-merge from sprint-corrections).

## Design tokens
```
Orange:      #FF6B1A
Noir:        #141414
Crème:       #FAF8F5
Stone:       #F2EFE9
Gris-light:  #E8E5DF
Vert-free:   #166534
```

## CSS utility classes (defined in src/index.css)
- `.panache-wrap` — max-width 1200px, margin auto, padding 0 40px (20px on mobile)
- `.reveal` / `.reveal.in` — IntersectionObserver fade-in (use `useReveal(delay)` hook)
- `.reveal-d1` to `.reveal-d4` — transition delays
- `.eyebrow` — small uppercase label above section titles
- `.sec-title` — section h2 style
- `.badge-free` / `.badge-price` — price pill variants
- `.scrollbar-hide` — hide scrollbar cross-browser
- `.line-clamp-2` / `.line-clamp-3`

## Key constants
```ts
PANACHE_ORG_ID = '6f8c37be-e1f5-4a19-98c3-98946ea7d034'
Navbar height: 64px (spacer also 64px)
Sticky filters bar: top: 64px
```

## Supabase schema (events table — key columns)
`id, title, starts_at, ends_at, status, city, region, venue, capacity, images (Json[]),
organization_id, sport_id, audience, featured_order, is_featured, level,
pmr_access, transport, venue_type, description, created_at, updated_at`

Relations: `sports(name, slug)`, `organizations(id, name, logo_url, slug)`,
`ticket_types(id, name, price_cents, currency, quantity, max_per_order)`,
`registrations(id, ticket_type_id)`

## Supabase gotcha
`.eq("sports.slug", value)` on a joined relation does NOT work server-side.
Always filter client-side after fetch:
```ts
result = result.filter(e => e.sports?.slug === activeSport || e.sports?.name?.toLowerCase() === activeSport.toLowerCase())
```

## Image optimization
Use `optimizeImage(url, width?)` from `@/lib/utils`:
- Targets Supabase storage URLs (adds `width=` + `quality=` params)
- Returns built-in FALLBACK if url is null/undefined
- Unsplash URLs are passed through as-is

## Hooks
- `useReveal(delay)` — `src/hooks/useReveal.ts` — call at top of each section component
- `useHomeData(filters?)` — `src/hooks/useHomeData.ts` — React Query, centralizes home fetches
- `useAuth()` — `src/hooks/useAuth.tsx`

## Markdown artifact rule
User pastes often contain `[x](http://x)` artifacts. Always clean before writing:
`ticket_[types.map](http://types.map)` → `ticket_types.map`, etc.

## Supabase types regeneration
CLI blocked in sandbox. Run locally or via cloud IDE terminal:
```bash
SUPABASE_ACCESS_TOKEN=<token> npx supabase gen types typescript \
  --project-id wlxbydzshqijlfejqafp --schema public \
  > src/integrations/supabase/types.ts
```
