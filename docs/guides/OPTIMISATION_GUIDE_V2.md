# Optimisation Guide v2 -- Vihan's Bucks Weekend Microsite

This guide covers all changes needed, organised into four phases. Each phase is independently deployable. Do them in order.

---

## Phase 1: Fix vote persistence (critical bug)

### Problem

Votes submit but never appear in the results card. The API routes use `@vercel/kv` via a fragile dynamic import (`new Function('return import("@vercel/kv")')`). The project also has the `redis` npm package installed but unused. The user has a Redis database connected on Vercel with a `REDIS_URL` (or similar) environment variable.

### What to do

1. Check which env vars are actually set on Vercel. `@vercel/kv` expects `KV_REST_API_URL` and `KV_REST_API_TOKEN` (these are auto-set when you add a KV store via the Vercel dashboard). If the user instead has a raw `REDIS_URL`, `@vercel/kv` will silently fail and the catch block returns mock/empty data.

2. Pick ONE Redis strategy and remove the other:
   - **Option A (recommended):** Use `@vercel/kv` properly. Remove the `redis` package. Remove the dynamic import hack. Just do `import { kv } from '@vercel/kv';` at the top of each route file. If the Vercel KV store is connected via the dashboard, the env vars are auto-injected and this just works.
   - **Option B:** Use the `redis` package directly with `REDIS_URL`. Remove `@vercel/kv`. Create a shared Redis client utility.

3. Whichever option you pick, remove the `getKvClient()` wrapper function and its try/catch that silently swallows connection failures. If Redis fails, the API should return a 500, not fake empty data.

4. Add a simple test: after deploying, POST a vote via curl or the UI, then GET `/api/results` and confirm the vote appears.

### Files to change

- `app/api/vote/route.js` -- replace `getKvClient()` with direct import
- `app/api/results/route.js` -- same
- `package.json` -- remove whichever Redis package you don't use

### Acceptance criteria

- Submitting a vote via the UI persists it to Redis
- `/api/results` returns real vote data (voter names, tallies)
- No silent fallback to mock data
- Build succeeds on Vercel

---

## Phase 2: UX cleanup and card simplification

This phase is all frontend. No new API work.

### 2a. Fix the repetitive header

**Problem:** The TopNav has `h1: "Vihan's Yarra Valley Bucks"` and then the hero section immediately below has `h2: "Vihan's Yarra Valley Bucks Weekend"`. Redundant.

**Fix:** Shorten the TopNav h1 to just `"Bucks '26"`. Keep the hero h2 as the full title. The hero is the landing moment; the nav is just wayfinding.

**File:** `app/components/TopNav.js` -- change the h1 text.

### 2b. Promote the name + constraints section

**Problem:** Name and hard constraints are buried in a small `field-grid` that looks like an afterthought. Travel notes field is not useful.

**Fix:**

1. Remove the `travelNotes` field entirely (from the form, the initial state, the API payload, and the API validation).
2. Turn the name + hard constraints into a proper standalone section with a `SectionHeader` and visual weight. It should feel like "Step 1" of the voting flow, not a side input.
3. Section heading: `"Who are you?"`
4. Subtitle: `"So we know whose questionable opinions these are."`
5. The `name` input label: `"Name"` with placeholder `"e.g. Dave"`
6. The `hardConstraints` input label: `"Anything we should actually know?"` with placeholder `"No mushrooms, terrified of heights, etc."`
7. Give the section the same card-style treatment as the voting sections (background, padding, rounded corners).

**Files:** `app/page.js`, `app/siteData.js` (remove travelNotes from any data), `app/api/vote/route.js` (remove travelNotes from payload).

### 2c. Add day separators between voting sections

**Problem:** All voting sections run together with no visual break between Friday / Saturday / Sunday.

**Fix:** Add day header dividers above the relevant sections. These are not new sections, just visual separators.

- Before `fridayNight`: **"Friday"** with subtitle `"The arrival. People will trickle in after work."`
- Before `saturdayMorning`: **"Saturday"** with subtitle `"The main event. This is why we're here."`
- Before `sundayRecovery`: **"Sunday"** with subtitle `"The soft landing. Optional but recommended."`

Implementation: Add a `day` property to each voting section in `siteData.js`. When rendering, check if the current section's `day` differs from the previous one, and if so, render a day divider. Style it as a full-width bar with the day name in serif font, left-aligned, with a subtle bottom border.

**Files:** `app/siteData.js` (add `day` field), `app/page.js` (render day dividers), `app/globals.css` (day divider styles).

### 2d. Simplify option cards

**Problem:** Cards are too crowded. Multiple meta chips overflow on smaller screens. Images make some cards huge and others tiny. The `vibe` chip adds visual noise.

**Fix:** Strip each option card down to:

1. **Title** (h3, keep it)
2. **Short description** (1-2 lines max, keep it)
3. **Cost chip** -- single chip showing approx cost where relevant (e.g. `~$80 pp`). If no cost, show nothing. Do NOT show timing/location/multiple meta chips.
4. **"View details" link** -- only if the option has an external `link`. Same as current but keep the styling.

Remove from OptionCard:
- The `option.image` block entirely (remove the image-wrap div). No images on option cards.
- The `option.meta` chips array rendering. Replace with a single cost chip if cost data exists.
- The `option.vibe` chip at the bottom.

To support the single cost chip, add a `cost` string field to each option in `siteData.js` (e.g. `cost: '~$80 pp'`). This is simpler than parsing from the meta array. The existing `meta` array can stay in the data for now but won't be rendered.

**Files:** `app/components/OptionCard.js`, `app/siteData.js` (add `cost` field to options), `app/globals.css` (simplify `.option-card` layout, remove `.option-image-wrap`, `.option-meta`, `.option-vibe`).

### 2e. Improve selected state visibility

**Problem:** Selected state is just a slightly different border colour. Not obvious enough.

**Fix:** When a card is selected:

1. Border: 2px solid `var(--primary)` (currently 1px, bump it)
2. Background: light green tint, e.g. `#eef4ef` (currently just #fff)
3. Add a small green checkmark circle in the top-right corner of the card (use the Material icon `check_circle` in a small 20px circle with `var(--primary)` colour)
4. Subtle left border accent: 3px solid `var(--primary)` on the left edge

The combination of colour shift + checkmark + left accent makes it unmistakable.

**Files:** `app/components/OptionCard.js` (add checkmark element when selected), `app/globals.css` (update `.option-card.selected` styles).

### 2f. Add "pick one" indicator to voting sections

**Problem:** Users don't know it's single-select per section.

**Fix:** Add a small line below each section's `SectionHeader` subtitle: `"Pick one"` styled as an uppercase micro-label in `var(--text-soft)`, similar to the existing `.section-label` style. Use the existing `SectionHeader` component -- add an optional `hint` prop.

For the name section, no hint needed.

**Files:** `app/components/SectionHeader.js` (add `hint` prop), `app/page.js` (pass `hint="Pick one"` to voting section headers), `app/globals.css` (hint style if needed).

### 2g. Remove budget comfort, hard no list, and streamline final comments

**Problem:** Budget comfort and hard no list add friction without adding value. Final comments box needs to be cleaner.

**Fix:**

1. Remove the budget comfort section entirely (UI, data, form state, API payload, API validation, results tally).
2. Remove the hard no list section entirely (same cleanup).
3. Keep the final comments section but make it compact:
   - Rename heading to `"Anything else?"`
   - Subtitle: `"Last words before we lock this in."`
   - Placeholder: `"Strong opinions, bad ideas, dietary stuff, whatever."`
   - Keep the textarea but reduce to `rows={3}`.
4. Remove `budgetComfort` from `requiredKeys` array.
5. Remove `budgetOptions` and `hardNoOptions` exports from `siteData.js`.
6. Remove from `initialForm`: `budgetComfort`, `hardNos`.
7. Update API routes to no longer expect/tally these fields.
8. Update `ResultsCard` to remove `budgetComfort` from `categoryRows`.
9. Update `ProgressCard` to remove the Budget row from `sectionOrder`.

**Files:** `app/page.js`, `app/siteData.js`, `app/api/vote/route.js`, `app/api/results/route.js`, `app/components/ResultsCard.js`, `app/components/ProgressCard.js`.

### 2h. Remove cost guide table

With budget comfort gone and cards simplified to show costs inline, the separate cost guide table at the bottom is redundant. Remove it.

**Files:** `app/page.js` (remove the CostGuideTable section), `app/components/CostGuideTable.js` (delete file), `app/siteData.js` (remove `costGuide` export).

### Phase 2 acceptance criteria

- TopNav says "Bucks '26", hero keeps full title
- Name + constraints is a prominent first section with no travel notes field
- Clear Friday / Saturday / Sunday dividers between voting groups
- Option cards show only: title, short description, cost chip (if applicable), view details link (if applicable). No images, no meta chips array, no vibe chip.
- Selected cards have obvious green tint + checkmark + border accent
- Each voting section says "Pick one"
- No budget comfort section
- No hard no list section
- Final comments is compact with updated copy
- No cost guide table
- Progress card sidebar no longer lists Budget
- Results card no longer shows budget comfort

---

## Phase 3: Vote editing flow

### Current behaviour

When someone submits, `localStorage` flags them as voted, the form locks, and a success message shows with a "Changed your mind? Vote again" link. Clicking that link wipes localStorage AND the form state, making them start from scratch. The API already supports overwrites (the KV key is `vote:${normalizedName}`, so re-submitting under the same name replaces the old vote).

### New behaviour

1. **After submitting:** Show the success card as now, but change the CTA to `"Edit your votes"` (not "vote again").
2. **Clicking "Edit your votes":** Unlock the form but KEEP the form pre-filled with their previous selections (currently stored in `bucks-vote-data` localStorage). Don't wipe anything.
3. **Re-submitting:** Same API call, same overwrite logic. Show success again.
4. The submit button text when editing should say `"Update votes"` instead of `"Submit votes"`.

### Implementation

- Add a boolean state `isEditing` (default false).
- When the user clicks "Edit your votes", set `isEditing = true` and `status = 'idle'`. Do NOT clear `localStorage` or reset the form.
- When `isEditing` is true, the submit button says "Update votes".
- On successful re-submit, set `isEditing = false`, update localStorage with new data.

**Files:** `app/page.js`.

### Acceptance criteria

- User submits vote, sees success state
- Clicks "Edit your votes", form unlocks with previous selections still filled
- User changes a selection and re-submits
- Vote is updated in Redis (same key, new data)
- Results tally reflects the updated vote, not a duplicate

---

## Phase 4: Expense tracker (Splitwise-style)

This is a new feature on the itinerary page. It needs new API routes and a new UI section.

### Concept

A lightweight shared expense tracker. Any user can add an expense (e.g. "Grocery run - $120 - paid by Sam - split equally"). The system calculates who owes who. No login, no auth. All public. This is 12 friends.

### Data model

Each expense is stored in Redis with key `expense:{id}`.

```json
{
  "id": "exp_1719400000000",
  "description": "Grocery run",
  "amount": 120.00,
  "paidBy": "Sam",
  "splitType": "equal",
  "splitAmong": ["Sam", "Dave", "Vihan", "..."],
  "createdAt": "2026-06-26T10:00:00Z"
}
```

- `id`: timestamp-based unique ID (e.g. `exp_` + `Date.now()`)
- `splitType`: either `"equal"` (split among all selected people) or could later support custom amounts, but for now just do equal splits
- `splitAmong`: array of names. If "split equally among everyone", this is all participants.

All expense IDs are tracked in a Redis set: `expense-ids`.

### Participants list

Pull participant names from the existing voters set in Redis (the `/api/results` endpoint already returns `voterNames`). On the itinerary page, fetch `/api/results` to get the list of names. If someone hasn't voted yet but paid for something, let them type a custom name in the "paid by" field (combo of dropdown + free text).

### New API routes

#### `POST /api/expenses`

Create or update an expense.

Request body:
```json
{
  "description": "Grocery run",
  "amount": 120.00,
  "paidBy": "Sam",
  "splitType": "equal",
  "splitAmong": ["Sam", "Dave", "Vihan"]
}
```

If `id` is included in the body, it's an update (overwrite the existing expense). If no `id`, generate one.

Response: `{ "success": true, "expense": { ... } }`

#### `GET /api/expenses`

Return all expenses and calculated balances.

Response:
```json
{
  "expenses": [ ... ],
  "balances": {
    "Sam": -45.00,
    "Dave": 22.50,
    "Vihan": 22.50
  },
  "settlements": [
    { "from": "Dave", "to": "Sam", "amount": 22.50 },
    { "from": "Vihan", "to": "Sam", "amount": 22.50 }
  ]
}
```

Balance calculation logic:
1. For each expense, calculate each person's share (`amount / splitAmong.length`).
2. Track net balance per person: positive = they owe money, negative = they are owed money.
3. The `paidBy` person gets credited the full amount, then debited their share.
4. `settlements` is a simplified list of who pays who to settle up. Use a greedy algorithm: sort creditors and debtors, match largest debtor to largest creditor, repeat.

#### `DELETE /api/expenses?id=exp_123`

Delete an expense by ID. Remove from Redis key and from the `expense-ids` set.

### Itinerary page UI

Add a new section to the itinerary page below the existing content (or replace the "Bookings & status" section, since that's mostly placeholder anyway).

#### Section: "Group expenses"

Section label: `"Splitwise but worse"`
Heading: `"Group expenses"`
Subtitle: `"Add shared costs as they happen. The maths is handled. The arguments are not."`

#### Components needed

**1. Add expense form**

A simple inline form (not a modal). Fields:

- **What** -- text input, placeholder "e.g. Grocery run, Cellar door tasting"
- **Amount ($)** -- number input
- **Paid by** -- dropdown of participant names (fetched from `/api/results` voterNames) + an "Other" option that reveals a text input for a custom name
- **Split between** -- two modes:
  - "Everyone" (default, radio/toggle) -- splits among all known participants
  - "Select people" -- shows checkboxes for each participant name
- **Submit button:** `"Add expense"`

Keep the form compact. Single row on desktop if possible (what + amount + paid by on one line, split options on a second line, submit button right-aligned).

**2. Expense list**

A simple list/table of all expenses. Each row shows:
- Description
- Amount (formatted as `$120.00`)
- Paid by (name)
- Split info (e.g. "Split 4 ways" or "Everyone")
- Edit button (pencil icon) -- populates the add form with this expense's data for editing
- Delete button (trash icon) -- deletes after a simple `window.confirm()`

Sort by most recent first.

**3. Balance summary card**

A card showing the settlement summary. Heading: `"Who owes who"`

Display each settlement as a row:
```
Dave → Sam: $22.50
Vihan → Sam: $22.50
```

If no expenses yet: `"No expenses added yet. Enjoy it while it lasts."`

If everyone is settled: `"All square. Suspicious."`

### Files to create

- `app/api/expenses/route.js` -- GET, POST, DELETE handlers
- `app/components/ExpenseForm.js` -- the add/edit form
- `app/components/ExpenseList.js` -- the expense table/list
- `app/components/BalanceSummary.js` -- the who-owes-who card

### Files to modify

- `app/itinerary/page.js` -- add the expenses section
- `app/globals.css` -- styles for expense components

### What NOT to build

- No per-item receipt uploads
- No currency conversion
- No payment integration
- No expense categories or tags
- No date picker for expenses (just use server timestamp)
- No export to CSV
- No notification system
- No "remind" button
- No percentage-based splits (just equal splits for now)

### Acceptance criteria

- User can add an expense with description, amount, paid by, and split selection
- Expense appears in the list immediately after adding
- Balance summary updates in real time after adding/removing expenses
- User can edit an existing expense (pre-fills the form, re-submits as update)
- User can delete an expense (with confirmation)
- Settlement calculations are correct (verified with a simple test: if Sam pays $120 split 4 ways, the other 3 each owe Sam $30)
- Works on mobile (form fields stack vertically)

---

## Summary of all removals

For easy reference, here's everything being removed:

| Item | Where |
|---|---|
| `travelNotes` field | Form state, UI, API payload, API validation |
| Budget comfort section | Form state, UI, siteData, API payload, API validation, results tally, progress card, results card |
| Hard no list section | Form state, UI, siteData, API payload, API validation, results tally |
| Cost guide table | UI, component file, siteData |
| Option card images | OptionCard component, CSS |
| Option card meta chips array | OptionCard component, CSS |
| Option card vibe chip | OptionCard component, CSS |
| Redundant hero h2 duplication | TopNav (shorten to "Bucks '26") |

## Summary of all additions

| Item | Where |
|---|---|
| Day separators (Fri/Sat/Sun) | Vote page, between voting sections |
| "Pick one" hint on sections | SectionHeader component |
| Selected state checkmark | OptionCard component |
| Single cost chip on cards | OptionCard component, siteData |
| Vote editing flow | Vote page |
| Expense tracker (full feature) | Itinerary page, new API routes, new components |

## Files overview

### Files to delete
- `app/components/CostGuideTable.js`

### New files to create
- `app/api/expenses/route.js`
- `app/components/ExpenseForm.js`
- `app/components/ExpenseList.js`
- `app/components/BalanceSummary.js`

### Files to modify
- `app/page.js` (major: restructure form, add day dividers, remove sections, edit flow)
- `app/siteData.js` (remove exports, add `day` and `cost` fields to options)
- `app/api/vote/route.js` (fix Redis, remove unused fields)
- `app/api/results/route.js` (fix Redis, remove budget/hardNos tally)
- `app/components/OptionCard.js` (simplify, add selected checkmark)
- `app/components/SectionHeader.js` (add hint prop)
- `app/components/TopNav.js` (shorten h1)
- `app/components/ProgressCard.js` (remove Budget row)
- `app/components/ResultsCard.js` (remove budgetComfort row)
- `app/itinerary/page.js` (add expense tracker section)
- `app/globals.css` (updated card styles, day dividers, expense tracker styles, selected state)
- `package.json` (remove unused Redis package)
