# Shared Trip Planner (Next.js + Redis)

A Next.js App Router web app for planning and running a shared trip in one link.

Originally built for a bucks weekend, this project can also be reused for:
- Family holidays
- Friends’ group trips
- Team offsites
- Birthday weekends
- Any event where people need to vote, coordinate a plan, and split costs

It currently includes:
- Public voting flow for major itinerary decisions
- Live-ish results + suggestions aggregation
- Itinerary page with packing list and running plan
- Shared expense tracker + settlement helper
- Admin controls to lock voting, delete votes, and save final selections
- Redis-backed persistence via API routes

---

## Project structure

- `app/` – Next.js App Router pages, API routes, components, and site data
- `README.md` – quick start + customization guide

---

## Core functionality

### Public pages
- `/` – Voting page
  - Name + group notes field
  - Vote across Friday/Saturday/Sunday sections
  - Supports “other” free-text suggestions per section
  - Shows progress + validation before submit
- `/itinerary` – Trip hub
  - Accommodation + checklist
  - Timeline view
  - Vote leaderboard and suggestions
  - Expense splitting + simplified settlement outputs

### Admin page
- `/admin?secret=YOUR_SECRET`
  - View vote table
  - Delete one vote or clear all votes
  - Lock/unlock voting
  - Save/clear final results selections

> Admin access is guarded by `NEXT_PUBLIC_ADMIN_SECRET` and request headers on admin API calls.

---

## Reusing this app for holidays (or other trips)

You can repurpose this without changing the overall architecture.

### 1) Update content and branding
Edit `app/siteData.js` to replace bucks-specific text with your own event details:
- Event name and description
- Destination/location details
- Day sections and activity options
- Packing checklist
- Notes and labels

This is the main file for converting the app from a bucks weekend to a general holiday/trip planner.

### 2) Adjust voting categories/options
If your trip doesn’t follow Friday/Saturday/Sunday structure, change the day/section labels and options in `app/siteData.js`.

Examples:
- Replace days with `Day 1`, `Day 2`, `Day 3`
- Use categories like `Transport`, `Accommodation`, `Activities`, `Meals`

### 3) Update itinerary flow
Use `app/siteData.js` and itinerary rendering in `app/page.js` (and itinerary page files under `app/`) to:
- Change timeline blocks
- Add/remove checklist sections
- Tailor guidance text for your group (family trip vs friend trip)

### 4) Keep or change expense logic
The expense tracker is generic and already works for most group trips. You can customize labels/UI text, but settlement logic can remain unchanged.

### 5) Set your own admin secret + Redis
For your own deployment, set:
- `REDIS_URL`
- `NEXT_PUBLIC_ADMIN_SECRET`

Anyone with the admin secret can manage votes and final selections, so use a strong random value.

---

## What someone would need to change (quick checklist)

Minimum required changes to launch for another use case:
- [ ] Replace trip/event content in `app/siteData.js`
- [ ] Update page titles/metadata in `app/layout.js`
- [ ] (Optional) Tweak UI copy in `app/page.js`
- [ ] Set `.env.local` with your own `REDIS_URL` and `NEXT_PUBLIC_ADMIN_SECRET`
- [ ] Deploy (Vercel or other Node host)

---

## Tech stack

- **Framework:** Next.js `14.2.35` (App Router)
- **UI:** React `18.3.1`
- **Data store:** Redis (`redis` npm package)
- **Runtime:** Node.js (for Next.js server + API routes)

---

## Environment variables

Create a `.env.local` file in the project root:

```bash
REDIS_URL=redis://localhost:6379
NEXT_PUBLIC_ADMIN_SECRET=replace-with-a-long-random-string
```

### Notes
- `REDIS_URL` is required for voting/results/admin/expenses APIs.
- `NEXT_PUBLIC_ADMIN_SECRET` is used both:
  - in the client to unlock `/admin?secret=...`
  - in server routes via `x-admin-secret` header checks.

---

## Local development

```bash
npm install
npm run dev
```

Open:
- http://localhost:3000/
- http://localhost:3000/itinerary
- http://localhost:3000/admin?secret=YOUR_SECRET

---

## Production build

```bash
npm run build
npm run start
```

---

## API surface

### Public endpoints
- `POST /api/vote`
  - Validates required vote fields
  - Stores/updates vote by normalized voter name
  - Respects `config:votingLocked`
- `GET /api/results`
  - Returns voter count/names, tallies, “other” suggestions, notes, and saved final selections
- `GET /api/expenses`
  - Lists expenses sorted by newest first
- `POST /api/expenses`
  - Creates/updates expense entry
- `DELETE /api/expenses?id=...`
  - Deletes expense by id

### Admin endpoints (require `x-admin-secret`)
- `GET /api/admin/config`
  - Returns `votingLocked` + `finalResults`
- `POST /api/admin/config`
  - Updates voting lock state
- `DELETE /api/admin/vote?name=...`
  - Deletes one vote
- `DELETE /api/admin/vote?all=true`
  - Clears all votes
- `POST /api/admin/finalise`
  - Saves snapshot + optional final selections
- `DELETE /api/admin/finalise`
  - Clears saved snapshots/final results

---

## Redis keys (current)

- `vote:<normalized-name>` – each vote payload
- `voter-names` (set)
- `voters` (set)
- `config:votingLocked`
- `config:finalResults`
- `final-results`
- `expense-ids` (set)
- `expense:<id>`

---

## Deployment

Deploy on Vercel or any Node-capable host.

### Vercel quick path
1. Import repo in Vercel.
2. Set environment variables:
   - `REDIS_URL`
   - `NEXT_PUBLIC_ADMIN_SECRET`
3. Deploy.

If you use Upstash/managed Redis, use the provider’s connection URL as `REDIS_URL`.

---

## Current caveats

- Admin secret is a shared-token pattern (lightweight, not full auth).
- `/api/item` is a placeholder mock route.
- Results are refresh-based (no realtime subscriptions/websockets).
