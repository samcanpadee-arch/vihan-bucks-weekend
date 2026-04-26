# Post-Deploy Fixes -- Vihan's Bucks Weekend Microsite

These are all the fixes needed after deploying Optimisation Guide V2. Organised by priority. Each fix is independently deployable but they should be done roughly in order.

---

## Fix 1: Redis client mismatch (critical -- blocks all API functionality)

### Problem

All three API routes (`/api/vote`, `/api/results`, `/api/expenses`) fail with:

```
Error: @vercel/kv: Missing required environment variables KV_REST_API_URL and KV_REST_API_TOKEN
```

The code uses `import { kv } from '@vercel/kv'` but the Vercel project has a **Vercel Redis** store, not a **Vercel KV** store. These are different products:

- **Vercel KV** uses the `@vercel/kv` package and needs `KV_REST_API_URL` + `KV_REST_API_TOKEN` (REST-based, HTTP).
- **Vercel Redis** uses the `redis` npm package and needs `REDIS_URL` (TCP connection string).

The project has `REDIS_URL` set and the `redis` npm package is not installed. The `@vercel/kv` package is installed but has no matching env vars.

### What to do

1. **Remove** `@vercel/kv` from `package.json`.
2. **Install** the `redis` package: add `"redis": "^4.7.0"` to `package.json` dependencies.
3. **Create** a shared Redis client utility at `app/lib/redis.js` that all API routes import from. This avoids duplicating connection logic across three files.
4. **Update** all three API route files to use the shared client instead of `@vercel/kv`.

### Shared Redis client: `app/lib/redis.js`

```js
import { createClient } from 'redis';

let client = null;

export async function getRedis() {
  if (!client) {
    const url = process.env.REDIS_URL;
    if (!url) {
      throw new Error('REDIS_URL environment variable is not set');
    }
    client = createClient({ url });
    client.on('error', (err) => console.error('Redis client error:', err));
    await client.connect();
  }
  return client;
}
```

### Key differences between `@vercel/kv` and `redis` package APIs

The `redis` package has a different API from `@vercel/kv`. Here is a translation of every operation used in the three route files:

| Operation | `@vercel/kv` syntax | `redis` package syntax |
|-----------|---------------------|------------------------|
| Get a value | `kv.get(key)` returns parsed JSON | `client.get(key)` returns a raw string. You must `JSON.parse()` the result. |
| Set a value | `kv.set(key, value)` accepts objects | `client.set(key, JSON.stringify(value))` requires stringifying. |
| Add to set | `kv.sadd(setKey, member)` | `client.sAdd(setKey, member)` -- note the capital A. |
| Get set members | `kv.smembers(setKey)` | `client.sMembers(setKey)` -- note the capital M. |
| Delete a key | `kv.del(key)` | `client.del(key)` |
| Remove from set | `kv.srem(setKey, member)` | `client.sRem(setKey, member)` -- note the capital R. |

This is the single most important thing. Every `kv.get()` call that currently expects a parsed object needs to become `JSON.parse(await client.get(key))` with a null check. Every `kv.set()` call needs `JSON.stringify()`.

### Updated route: `app/api/vote/route.js`

Replace the entire file. Key changes from current:
- Import `getRedis` from `app/lib/redis.js` instead of `kv` from `@vercel/kv`
- Use `await getRedis()` to get the client
- Wrap `set` values in `JSON.stringify()`
- Use `sAdd` instead of `sadd`

```js
import { NextResponse } from 'next/server';
import { getRedis } from '../../lib/redis';

const requiredFields = [
  'name',
  'fridayNight',
  'saturdayMorning',
  'saturdayLunch',
  'saturdayDrinks',
  'saturdayNight',
  'sundayRecovery'
];

export async function POST(request) {
  try {
    const body = await request.json();

    const hasMissingRequired = requiredFields.some((field) => !body[field]);
    if (hasMissingRequired) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const vote = {
      name: body.name,
      hardConstraints: body.hardConstraints || '',
      fridayNight: body.fridayNight,
      saturdayMorning: body.saturdayMorning,
      saturdayLunch: body.saturdayLunch,
      saturdayDrinks: body.saturdayDrinks,
      saturdayNight: body.saturdayNight,
      sundayRecovery: body.sundayRecovery,
      finalComments: body.finalComments || '',
      submittedAt: new Date().toISOString()
    };

    const normalizedName = body.name.trim().toLowerCase();
    const key = `vote:${normalizedName}`;

    const redis = await getRedis();
    await redis.set(key, JSON.stringify(vote));
    await redis.sAdd('voters', key);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Vote submission error:', error);
    return NextResponse.json({ error: 'Failed to save vote' }, { status: 500 });
  }
}
```

### Updated route: `app/api/results/route.js`

Same pattern. Key addition: every `redis.get()` result needs `JSON.parse()` and a null check.

```js
import { NextResponse } from 'next/server';
import { getRedis } from '../../lib/redis';

const tallyCategories = [
  'fridayNight',
  'saturdayMorning',
  'saturdayLunch',
  'saturdayDrinks',
  'saturdayNight',
  'sundayRecovery'
];

export async function GET() {
  try {
    const redis = await getRedis();
    const voterKeys = await redis.sMembers('voters');

    if (!voterKeys?.length) {
      return NextResponse.json({ voterCount: 0, voterNames: [], tally: {} });
    }

    const rawVotes = await Promise.all(
      voterKeys.map(async (key) => {
        const raw = await redis.get(key);
        return raw ? JSON.parse(raw) : null;
      })
    );
    const votes = rawVotes.filter(Boolean);

    const tally = {};

    for (const category of tallyCategories) {
      tally[category] = {};
      for (const vote of votes) {
        const choice = vote?.[category];
        if (choice) {
          tally[category][choice] = (tally[category][choice] || 0) + 1;
        }
      }
    }

    return NextResponse.json({
      voterCount: votes.length,
      voterNames: votes.map((vote) => vote.name).filter(Boolean),
      tally
    });
  } catch (error) {
    console.error('Results fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 });
  }
}
```

### Updated route: `app/api/expenses/route.js`

Same pattern, plus add the missing `DELETE` handler (see Fix 2).

```js
import { NextResponse } from 'next/server';
import { getRedis } from '../../lib/redis';

const EXPENSE_SET_KEY = 'expense-ids';

function normalizeName(value = '') {
  return value.trim();
}

function parseAmount(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return Number(amount.toFixed(2));
}

export async function GET() {
  try {
    const redis = await getRedis();
    const expenseIds = await redis.sMembers(EXPENSE_SET_KEY);
    if (!expenseIds?.length) {
      return NextResponse.json({ expenses: [] });
    }

    const rawExpenses = await Promise.all(
      expenseIds.map(async (id) => {
        const raw = await redis.get(`expense:${id}`);
        return raw ? JSON.parse(raw) : null;
      })
    );
    const expenses = rawExpenses
      .filter(Boolean)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ expenses });
  } catch (error) {
    console.error('Expenses fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const description = body.description?.trim();
    const amount = parseAmount(body.amount);
    const paidBy = normalizeName(body.paidBy);
    const splitType = body.splitType === 'equal' ? 'equal' : null;
    const splitAmong = Array.isArray(body.splitAmong)
      ? body.splitAmong.map((name) => normalizeName(name)).filter(Boolean)
      : [];

    if (!description || !amount || !paidBy || !splitType || splitAmong.length === 0) {
      return NextResponse.json({ error: 'Invalid expense payload' }, { status: 400 });
    }

    const id = body.id?.trim() || `exp_${Date.now()}`;
    const expense = {
      id,
      description,
      amount,
      paidBy,
      splitType,
      splitAmong: Array.from(new Set(splitAmong)),
      createdAt: body.createdAt || new Date().toISOString()
    };

    const redis = await getRedis();
    await redis.set(`expense:${id}`, JSON.stringify(expense));
    await redis.sAdd(EXPENSE_SET_KEY, id);

    return NextResponse.json({ success: true, expense });
  } catch (error) {
    console.error('Expense save error:', error);
    return NextResponse.json({ error: 'Failed to save expense' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing expense id' }, { status: 400 });
    }

    const redis = await getRedis();
    await redis.del(`expense:${id}`);
    await redis.sRem(EXPENSE_SET_KEY, id);

    return NextResponse.json({ success: true, deleted: id });
  } catch (error) {
    console.error('Expense delete error:', error);
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 });
  }
}
```

### Package.json changes

```json
{
  "dependencies": {
    "next": "14.2.35",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "redis": "^4.7.0"
  }
}
```

Remove `"@vercel/kv": "^2.0.0"` entirely.

### Files to create

- `app/lib/redis.js`

### Files to modify

- `app/api/vote/route.js` -- full rewrite
- `app/api/results/route.js` -- full rewrite
- `app/api/expenses/route.js` -- full rewrite + add DELETE handler
- `package.json` -- swap `@vercel/kv` for `redis`

### Acceptance criteria

- `POST /api/vote` succeeds and stores data in Redis
- `GET /api/results` returns real vote data
- `POST /api/expenses` succeeds and stores expense
- `GET /api/expenses` returns stored expenses
- `DELETE /api/expenses?id=exp_123` removes an expense
- No `@vercel/kv` references remain anywhere in the codebase
- Build succeeds on Vercel

---

## Fix 2: Expense delete button in UI

### Problem

The expense list only has an "Edit" button per row. There is no way to delete an expense from the UI. The DELETE API handler was also missing (added in Fix 1 above).

### What to do

Add a delete button next to each expense in the list on the itinerary page. Use a trash icon. Confirm with `window.confirm()` before deleting. After successful delete, remove the expense from local state.

### Changes to `app/itinerary/page.js`

Add a `deleteExpense` function:

```js
const deleteExpense = async (id) => {
  if (!window.confirm('Delete this expense?')) return;
  try {
    const response = await fetch(`/api/expenses?id=${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Delete failed');
    setExpenses((prev) => prev.filter((item) => item.id !== id));
  } catch (error) {
    console.error(error);
    setExpenseError('Could not delete expense.');
  }
};
```

In the expense list `<li>`, add a delete button next to the existing edit button. Wrap both buttons in a small flex container:

```jsx
<li key={expense.id}>
  <div>
    <p>{expense.description}</p>
    <small>
      {expense.paidBy} paid ${expense.amount.toFixed(2)} · split {expense.splitAmong.length} ways
    </small>
  </div>
  <div className="expense-actions">
    <button
      type="button"
      className="expense-action-btn"
      title="Edit"
      onClick={() =>
        setExpenseForm({
          id: expense.id,
          description: expense.description,
          amount: String(expense.amount),
          paidBy: expense.paidBy,
          splitAmong: expense.splitAmong,
          splitType: 'equal'
        })
      }
    >
      <span className="material-symbols-outlined">edit</span>
    </button>
    <button
      type="button"
      className="expense-action-btn danger"
      title="Delete"
      onClick={() => deleteExpense(expense.id)}
    >
      <span className="material-symbols-outlined">delete</span>
    </button>
  </div>
</li>
```

### CSS additions in `app/globals.css`

```css
.expense-actions {
  display: flex;
  gap: 0.4rem;
  align-items: center;
  flex-shrink: 0;
}

.expense-action-btn {
  border: 1px solid var(--border);
  background: #fff;
  border-radius: 0.5rem;
  padding: 0.35rem;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: background 0.15s ease;
}

.expense-action-btn .material-symbols-outlined {
  font-size: 1rem;
}

.expense-action-btn:hover {
  background: #f3eae5;
}

.expense-action-btn.danger:hover {
  background: #fce8e8;
  border-color: #e8a0a0;
  color: #93000a;
}
```

### Also update the split summary text

Currently the expense list shows `split {expense.splitAmong.join(', ')}` which gets very long with many names. Change to:

- If `splitAmong` length equals `participantNames` length: show `"Everyone"`
- Otherwise: show `"Split {n} ways"` (e.g. "Split 4 ways")

### Files to modify

- `app/itinerary/page.js` -- add delete function, update expense list markup, update split text
- `app/globals.css` -- add expense action button styles

### Acceptance criteria

- Each expense row shows edit (pencil) and delete (trash) buttons
- Clicking delete shows a browser confirm dialog
- Confirming deletes the expense from Redis and removes it from the list
- Settlement summary updates after deletion

---

## Fix 3: Expense split UX -- "Everyone" vs "Select people" toggle

### Problem

The current split UI always shows all participant name chips. Users can toggle individual names on/off, but there is no obvious way to quickly say "split among everyone" vs "split among specific people". The user wants a clear toggle between group split and individual selection.

### What to do

Add a simple two-option toggle above the name chips:

1. **"Everyone"** (default) -- all participants are included, name chips are hidden or shown greyed out as "all selected"
2. **"Select people"** -- name chips become interactive, user can toggle individuals on/off

### Implementation

Add a `splitMode` state to the expense form: `'everyone'` (default) or `'select'`.

When `splitMode` is `'everyone'`:
- The `splitAmong` array is set to all `participantNames` on submit
- The individual name chips are hidden (cleaner UI)

When `splitMode` is `'select'`:
- Show the name chips, user can toggle
- `splitAmong` is whatever they pick

The toggle itself is two small pill buttons side by side: `Everyone` and `Select people`.

### Changes to `app/itinerary/page.js`

Add to the expense form initial state and the form component:

```jsx
// In the expense form state, add:
const [splitMode, setSplitMode] = useState('everyone');

// When submitting, determine splitAmong based on mode:
splitAmong: splitMode === 'everyone' ? participantNames : expenseForm.splitAmong

// When editing an existing expense, set splitMode:
// If the expense's splitAmong matches all participants, set 'everyone', else 'select'
```

In the split-members section, replace the current layout with:

```jsx
<div className="split-members">
  <p className="section-label">Split among</p>
  <div className="split-toggle">
    <button
      type="button"
      className={`pill ${splitMode === 'everyone' ? 'selected' : ''}`}
      onClick={() => setSplitMode('everyone')}
    >
      Everyone
    </button>
    <button
      type="button"
      className={`pill ${splitMode === 'select' ? 'selected' : ''}`}
      onClick={() => setSplitMode('select')}
    >
      Select people
    </button>
  </div>
  {splitMode === 'select' && participantNames.length > 0 ? (
    <div className="split-chip-grid">
      {participantNames.map((name) => (
        <button
          type="button"
          key={name}
          className={`pill ${expenseForm.splitAmong.includes(name) ? 'selected' : ''}`}
          onClick={() => toggleSplitMember(name)}
        >
          {name}
        </button>
      ))}
    </div>
  ) : null}
</div>
```

### CSS additions

```css
.split-toggle {
  display: flex;
  gap: 0.4rem;
  margin-bottom: 0.5rem;
}
```

### Files to modify

- `app/itinerary/page.js` -- add `splitMode` state, toggle UI, update submit logic, update edit pre-fill logic

### Acceptance criteria

- Default split mode is "Everyone"
- User can switch to "Select people" to pick specific individuals
- Name chips only show when "Select people" is active
- Submitting in "Everyone" mode sends all participant names
- Editing an expense correctly sets the mode (everyone if all names match, select otherwise)

---

## Fix 4: Remove "Bookings & status" section from itinerary

### Problem

The "Bookings & status" section on the itinerary page is redundant. It duplicates what the timeline already shows. It also has misleading status labels ("Booked", "Not booked") that add no value since nothing except the Airbnb is actually booked.

### What to do

Remove the entire "Bookings & status" `<section>` from `app/itinerary/page.js`.

Remove the `bookingStatus` export from `app/siteData.js`.

Remove the `bookingStatus` import from `app/itinerary/page.js`.

### CSS cleanup

The following CSS classes can be removed (they are only used by booking cards): `.booking-grid`, `.booking-card`, `.booking-copy`, `.booking-copy small`, `.booking-icon`. Only remove if no other component uses them. The `.ok` and `.pending` classes are also only used here, so they can go too.

### Files to modify

- `app/itinerary/page.js` -- remove the bookings section and `bookingStatus` import
- `app/siteData.js` -- remove `bookingStatus` export

### Acceptance criteria

- No "Bookings & status" section on itinerary page
- No broken imports
- Build succeeds

---

## Fix 5: Fix misleading "Confirmed" labels in timeline

### Problem

The weekend timeline on the itinerary page shows entries with status labels "CONFIRMED" and "TBC". Nothing is actually confirmed yet (except the Airbnb). This misleads users into thinking bookings have been made.

### What to do

Replace the status system entirely. Since votes are still being collected and nothing is booked, all timeline entries should just show what they are without a booking status.

Option: Remove the status field from timeline entries entirely. Instead, use a simple visual distinction:

- Entries that depend on votes: dashed border, with a small note like "Depends on votes"
- The Airbnb check-in: solid border, since accommodation is actually booked

### Changes to `app/siteData.js`

Update `itineraryTimeline` entries. Replace `status: 'confirmed'` with `status: 'set'` only for the Friday arrival (Airbnb is booked). Everything else becomes `status: 'pending'`.

```js
export const itineraryTimeline = [
  {
    day: 'Friday',
    entries: [
      { time: 'From 3pm', title: 'Arrive + settle in', note: 'Airbnb check-in. Room picks, unpack, regroup.', status: 'set' },
      { time: 'Evening', title: 'Friday dinner', note: 'Depends on the vote winner.', status: 'pending' }
    ]
  },
  {
    day: 'Saturday',
    entries: [
      { time: 'Morning', title: 'Morning activity', note: 'Depends on the vote winner.', status: 'pending' },
      { time: 'Lunch', title: 'Winery / lunch', note: 'Depends on the vote winner. Group booking TBC.', status: 'pending' },
      { time: 'Afternoon', title: 'Afternoon drinks', note: 'Depends on the vote winner.', status: 'pending' },
      { time: 'Evening', title: 'Saturday dinner', note: 'Depends on the vote winner.', status: 'pending' }
    ]
  },
  {
    day: 'Sunday',
    entries: [
      { time: 'Morning', title: 'Recovery activity', note: 'Depends on the vote winner. Then head home.', status: 'pending' }
    ]
  }
];
```

### Changes to `app/components/ItineraryTimeline.js`

Update the status display:

- `status: 'set'` shows a green check with "Booked"
- `status: 'pending'` shows a clock icon with "Pending votes"

```jsx
<span className="timeline-status">
  {entry.status === 'set' ? (
    <>
      <span className="material-symbols-outlined">check_circle</span>
      Booked
    </>
  ) : (
    <>
      <span className="material-symbols-outlined">schedule</span>
      Pending votes
    </>
  )}
</span>
```

Update the class logic: replace `is-confirmed` with `is-set`:

```jsx
className={`timeline-entry ${entry.status === 'pending' ? 'is-tbc' : 'is-set'}`}
```

### CSS updates

Rename `.timeline-entry.is-confirmed` to `.timeline-entry.is-set` in `globals.css`. Keep the same styles (green text for the status label).

### Files to modify

- `app/siteData.js` -- update `itineraryTimeline` entries (new status values, better copy, remove fake times)
- `app/components/ItineraryTimeline.js` -- update status labels and class names
- `app/globals.css` -- rename `.is-confirmed` to `.is-set`

### Acceptance criteria

- Only the Friday arrival shows "Booked" status
- All vote-dependent entries show "Pending votes"
- No entry says "CONFIRMED" anywhere
- Timeline entries use descriptive time labels ("Morning", "Evening") not fake exact times

---

## Fix 6: Mobile layout fixes

### Problem

Multiple layout issues on mobile screens (sub-700px):

1. **Hero gallery images stack but are too tall** -- each image is 150px tall in a single column, pushing content way down
2. **Expense form grid doesn't stack** -- the 3-column grid breaks at 900px but the form inputs can still be cramped between 700-900px
3. **Itinerary top grid (accommodation + essentials)** -- stacks at 980px but spacing is tight
4. **Option card descriptions can be long** -- no max-height or truncation
5. **General spacing** -- some sections feel too tight on small screens

### What to do

#### 6a. Hero gallery on mobile

At `max-width: 700px`, show the gallery as a horizontal scroll strip instead of a single column stack. This keeps the hero compact.

```css
@media (max-width: 700px) {
  .hero-gallery {
    grid-template-columns: none;
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    gap: 0.5rem;
    padding-bottom: 0.3rem;
  }

  .hero-gallery img {
    flex: 0 0 75vw;
    height: 140px;
    scroll-snap-align: start;
  }
}
```

#### 6b. Expense form stacking

Change the expense grid breakpoint from 900px to match a more sensible point. At 700px and below, the grid should be single column:

```css
@media (max-width: 700px) {
  .expense-grid {
    grid-template-columns: 1fr;
  }

  .expenses-layout {
    grid-template-columns: 1fr;
  }
}
```

Also update the existing `@media (max-width: 900px)` rule for `.expense-grid` and `.expenses-layout` -- either consolidate into the 700px breakpoint or keep 900px if you want earlier stacking. Recommendation: keep both for progressive stacking:

- At 900px: expenses layout (list + settlements) goes single column
- At 700px: expense form inputs also go single column

#### 6c. Itinerary top grid mobile spacing

Already handled at 980px. Add some vertical gap at smaller sizes:

```css
@media (max-width: 700px) {
  .itinerary-top-grid {
    gap: 0.8rem;
  }
}
```

#### 6d. Bottom nav safe area

The mobile bottom nav already has `env(safe-area-inset-bottom)`. Make sure the page shell bottom padding accounts for the nav height plus safe area:

```css
@media (max-width: 1024px) {
  .page-shell {
    padding-bottom: 7rem;
  }
}
```

### Files to modify

- `app/globals.css` -- mobile breakpoint updates

### Acceptance criteria

- Hero images scroll horizontally on mobile instead of stacking vertically
- Expense form fields stack on mobile
- No horizontal overflow on any page at 375px viewport width
- Bottom nav does not overlap content
- All sections have reasonable spacing on mobile

---

## Fix 7: Pills/chips overflowing containers

### Problem

Some chips (cost chips, voter chips, split chips) overflow their parent containers on narrow screens.

### What to do

Add defensive overflow handling to all chip/pill containers:

```css
.option-cost-chip {
  /* existing styles... */
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.voter-chip-wrap {
  /* existing styles... */
  overflow: hidden;
}

.split-chip-grid {
  /* existing styles... */
  overflow: hidden;
}

.option-card {
  /* add to existing */
  overflow: hidden;
}
```

Also ensure the option cards grid doesn't create cards narrower than their content. The current `minmax(240px, 1fr)` should be fine, but at `max-width: 700px` it already goes to `1fr`. Double check that no fixed-width elements inside cards (like links or chips) are wider than the card.

For the option link text, add:

```css
.option-link {
  /* existing styles... */
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

### Files to modify

- `app/globals.css`

### Acceptance criteria

- No chips overflow their container on a 375px viewport
- Long link text truncates with ellipsis
- No horizontal scrollbar on any page

---

## Fix 8: Vote editing flow clarity

### Current behaviour (already implemented)

The vote editing flow already works:

1. User submits vote on the home page
2. Success card appears with "Edit your votes" button
3. Clicking it unlocks the form with previous selections still filled
4. User changes selections and re-submits
5. Vote is updated in Redis (same key based on normalised name)

### What might be confusing

The user asked "how does a user edit their own?" -- the flow is already there but may not be obvious enough. The success card message could be clearer.

### Improvements

Update the success card copy in `app/page.js`:

```jsx
<section className="success-card">
  <h3>You're in, {form.name}.</h3>
  <p>
    Your votes have been recorded. Changed your mind on something? You can update anytime before the plan gets locked in.
  </p>
  <button
    type="button"
    className="revote-link"
    onClick={() => {
      setIsEditing(true);
      setStatus('idle');
      setSubmitAttempted(false);
    }}
  >
    Edit your votes
  </button>
</section>
```

This makes it clear that:
- Their votes are saved
- They can come back and edit
- The button is right there

No structural changes needed. The editing flow is functional.

### Files to modify

- `app/page.js` -- update success card copy only

### Acceptance criteria

- Success card shows the user's name
- Copy clearly states they can edit anytime
- "Edit your votes" button works as before

---

## Summary of all changes

### New files
- `app/lib/redis.js` -- shared Redis client utility

### Files to modify
- `app/api/vote/route.js` -- switch from `@vercel/kv` to `redis` package
- `app/api/results/route.js` -- switch from `@vercel/kv` to `redis` package
- `app/api/expenses/route.js` -- switch from `@vercel/kv` to `redis` package, add DELETE handler
- `app/itinerary/page.js` -- add expense delete, split mode toggle, remove bookings section
- `app/siteData.js` -- update timeline data, remove `bookingStatus` export
- `app/components/ItineraryTimeline.js` -- fix status labels
- `app/page.js` -- update success card copy
- `app/globals.css` -- mobile fixes, chip overflow, expense action buttons, split toggle
- `package.json` -- remove `@vercel/kv`, add `redis`

### Files to delete
- None (the `app/api/item/route.js` is a placeholder and can be removed if desired, but it's harmless)

### What NOT to touch
- `app/components/OptionCard.js` -- no changes needed
- `app/components/TopNav.js` -- no changes needed
- `app/components/SectionHeader.js` -- no changes needed
- `app/components/ProgressCard.js` -- no changes needed
- `app/components/ResultsCard.js` -- no changes needed
- `app/layout.js` -- no changes needed
