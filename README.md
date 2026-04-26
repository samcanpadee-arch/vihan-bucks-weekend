# Vihan’s Yarra Valley Bucks Weekend

A Next.js App Router web app for planning and running the weekend in one link.

It now includes:
- Public voting flow for all major itinerary decisions
- Live-ish results + suggestions aggregation
- Itinerary page with packing list and running plan
- Shared expense tracker + settlement helper
- Admin controls to lock voting, delete votes, and save final selections
- Redis-backed persistence via API routes

---

## Project structure (cleaned)

- `app/` – Next.js App Router pages, API routes, components, and site data
- `assets/images/` – image assets used by the site
- `docs/guides/` – longer planning/design/ops guide documents
- `README.md` – quick start + system overview

---

## What the app does

### Public pages
- `/` – Voting page
  - Name + group notes field
  - Vote across Friday/Saturday/Sunday sections
  - Supports “other” free-text suggestions per section
  - Shows progress + validation before submit
- `/itinerary` – Weekend hub
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
