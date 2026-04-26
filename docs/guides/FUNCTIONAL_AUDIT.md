# Functional Audit + Implementation Brief

## Purpose

Make the bucks weekend site actually work. Right now it is a good-looking shell with zero functionality. This doc covers what is broken, what needs to be built, and the simplest architecture to make voting, results, and the itinerary page functional.

This is the priority doc. Content and design polish come later.

---

## Functional audit: what is broken

### 1. Votes go nowhere

The form submit handler in `app/page.js` checks for a `NEXT_PUBLIC_FORMSPREE_ENDPOINT` env var. That env var is not set. So every submission falls through to `console.log('Mock submit payload:', payload)` and the data is lost on page refresh.

**Result:** Nobody's vote is saved. There is no backend.

### 2. No results or tallying

There is no way for anyone to see what others have voted for. No aggregated results, no "what's winning" view, no vote counts. The group has zero visibility into preferences.

### 3. No duplicate vote handling

Nothing prevents the same person from voting 10 times. After a successful submit, the form resets to blank and can be filled again immediately.

### 4. Itinerary page is hardcoded

`app/itinerary/page.js` renders from static data in `siteData.js`. The timeline entries, booking statuses, and everything else are hardcoded strings. There is no connection between votes and the itinerary. Sam has to manually edit `siteData.js` and redeploy to update anything.

### 5. No post-vote state

After voting, the user sees a brief success card, then the form resets. If they refresh the page, the form is blank again with no indication they already voted. There is no "you've already voted" state.

### 6. External links inside option cards

Option cards are `<button>` elements. If you add external links (to venue websites) inside them, clicking the link will also trigger the card selection. These need `e.stopPropagation()` or need to be structured differently.

### 7. Mobile form length

With all options from the spec added, the form will be very long. There is no section-by-section flow, no anchored navigation, and no way to jump between sections. On mobile this will be a painful scroll.

### 8. No footer on any page

Both pages end abruptly with no footer.

### 9. Places page still exists and nav has 3 tabs

The previous optimisation guide covers this. Repeating here because it is a functional issue: dead page, broken nav structure.

---

## Architecture recommendation: Vercel KV

The simplest way to store votes and show results without adding real backend complexity.

### Why Vercel KV

- It is Redis, hosted by Vercel, on the same platform you are already deploying to
- Free tier: 30,000 requests/month, 256MB storage (you will use about 0.1% of this)
- Works with Next.js API routes out of the box
- Two npm packages: `@vercel/kv`
- No external services, no database migrations, no schemas
- Setup: click "Create Store" in Vercel dashboard, link to project, done

### Alternatives considered and rejected

| Option | Why not |
|---|---|
| Formspree | Collects submissions but has no public read API. Sam would have to manually tally votes from a dashboard. No live results on site. |
| Google Sheets + Apps Script | Works but requires Google account setup, Apps Script deployment, CORS config, and is fragile. More moving parts. |
| Supabase / Firebase | Overkill. Adds auth libraries, SDK config, and a separate service to manage. |
| JSON file on disk | Does not persist between serverless function invocations on Vercel. Would lose data. |

### Setup steps (for Sam or whoever deploys)

1. In Vercel dashboard, go to the project
2. Go to Storage tab
3. Click "Create" and select "KV (Redis)"
4. Name it anything (e.g. `bucks-votes`)
5. Click "Connect to Project"
6. Vercel auto-adds the `KV_REST_API_URL` and `KV_REST_API_TOKEN` env vars
7. Install the package: `npm install @vercel/kv`
8. Deploy. Done.

For local dev, copy the env vars from Vercel to a `.env.local` file. Or just skip local KV and keep the console.log fallback for local testing.

---

## What to build

### API Route 1: POST /api/vote

File: `app/api/vote/route.js`

```js
import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();

    // Basic validation
    if (!body.name || !body.fridayNight || !body.saturdayMorning ||
        !body.saturdayLunch || !body.saturdayDrinks ||
        !body.saturdayNight || !body.sundayRecovery || !body.budgetComfort) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const vote = {
      name: body.name,
      travelNotes: body.travelNotes || '',
      hardConstraints: body.hardConstraints || '',
      fridayNight: body.fridayNight,
      saturdayMorning: body.saturdayMorning,
      saturdayLunch: body.saturdayLunch,
      saturdayDrinks: body.saturdayDrinks,
      saturdayNight: body.saturdayNight,
      sundayRecovery: body.sundayRecovery,
      budgetComfort: body.budgetComfort,
      hardNos: body.hardNos || [],
      finalComments: body.finalComments || '',
      submittedAt: new Date().toISOString()
    };

    // Store vote keyed by name (lowercase, trimmed)
    // If someone votes again with the same name, it overwrites their previous vote
    const key = `vote:${body.name.trim().toLowerCase()}`;
    await kv.set(key, JSON.stringify(vote));

    // Also maintain a set of all voter keys for easy retrieval
    await kv.sadd('voters', key);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Vote submission error:', error);
    return NextResponse.json(
      { error: 'Failed to save vote' },
      { status: 500 }
    );
  }
}
```

**Key design decisions:**
- Votes are keyed by name. If "Dave" votes twice, his second vote overwrites the first. This is intentional: it prevents ballot stuffing while letting people change their mind.
- No auth needed. This is a group of mates, not an election.
- The `voters` set tracks all keys so we can retrieve them all at once.

### API Route 2: GET /api/results

File: `app/api/results/route.js`

```js
import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get all voter keys
    const voterKeys = await kv.smembers('voters');

    if (!voterKeys || voterKeys.length === 0) {
      return NextResponse.json({ votes: [], tally: {}, voterCount: 0 });
    }

    // Fetch all votes
    const votePromises = voterKeys.map((key) => kv.get(key));
    const rawVotes = await Promise.all(votePromises);
    const votes = rawVotes
      .filter(Boolean)
      .map((v) => (typeof v === 'string' ? JSON.parse(v) : v));

    // Tally votes per category
    const categories = [
      'fridayNight',
      'saturdayMorning',
      'saturdayLunch',
      'saturdayDrinks',
      'saturdayNight',
      'sundayRecovery',
      'budgetComfort'
    ];

    const tally = {};
    for (const cat of categories) {
      tally[cat] = {};
      for (const vote of votes) {
        const choice = vote[cat];
        if (choice) {
          tally[cat][choice] = (tally[cat][choice] || 0) + 1;
        }
      }
    }

    // Tally hard nos
    tally.hardNos = {};
    for (const vote of votes) {
      if (vote.hardNos && Array.isArray(vote.hardNos)) {
        for (const no of vote.hardNos) {
          tally.hardNos[no] = (tally.hardNos[no] || 0) + 1;
        }
      }
    }

    // Build voter names list (for "who has voted" display)
    const voterNames = votes.map((v) => v.name);

    return NextResponse.json({
      voterCount: votes.length,
      voterNames,
      tally
    });
  } catch (error) {
    console.error('Results fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch results' },
      { status: 500 }
    );
  }
}
```

**What this returns:**

```json
{
  "voterCount": 6,
  "voterNames": ["Dave", "Tom", "Raj", "Chris", "Ben", "Sam"],
  "tally": {
    "fridayNight": {
      "friday-pizza-oven": 4,
      "friday-bbq": 2
    },
    "saturdayMorning": {
      "sat-morning-clay-public": 3,
      "sat-morning-paintball": 2,
      "sat-morning-chill": 1
    },
    "hardNos": {
      "8:45am start": 3,
      "Paintball": 1
    }
  }
}
```

### Important: do NOT return individual vote details

The API returns tally counts and voter names, but not who voted for what. This keeps it anonymous-ish and avoids people getting weird about it. Sam can check individual votes in the Vercel KV dashboard if needed.

---

## Frontend changes: vote page

### Update form submission to use the API

In `app/page.js`, replace the submit handler's fetch logic:

```js
const handleSubmit = async (event) => {
  event.preventDefault();
  setError('');

  const missing = requiredKeys.filter((key) => !form[key]);
  if (missing.length > 0) {
    setError('Add your name and vote across each core section before submitting.');
    // Scroll to first missing section
    const firstMissing = missing[0];
    const el = document.getElementById(`section-${firstMissing}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  const payload = {
    ...form,
    submittedAt: new Date().toISOString()
  };

  setStatus('loading');
  try {
    const response = await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('Submission failed');

    setStatus('success');

    // Store in localStorage to remember they voted
    localStorage.setItem('bucks-voted', form.name.trim().toLowerCase());
    localStorage.setItem('bucks-vote-data', JSON.stringify(form));
  } catch (submitError) {
    console.error(submitError);
    setStatus('idle');
    setError('Could not submit right now. Try again in a minute.');
  }
};
```

**Do NOT reset the form after successful submission.** Keep the user's selections visible so they can see what they voted for. Just disable the form and show the success state.

### Add "already voted" detection on page load

```js
useEffect(() => {
  const votedName = localStorage.getItem('bucks-voted');
  if (votedName) {
    setStatus('success');
    // Optionally restore their selections for display
    const savedVote = localStorage.getItem('bucks-vote-data');
    if (savedVote) {
      try {
        setForm(JSON.parse(savedVote));
      } catch (e) {
        // ignore parse errors
      }
    }
  }
}, []);
```

This is not bulletproof (different browser = can vote again, clearing storage = can vote again) but that is fine. These are mates, not adversaries. If someone really wants to game the vote, the name-based key in KV means duplicate names just overwrite anyway.

### Add a "Vote again" option

Below the success card, add a small link:

```jsx
{status === 'success' && (
  <button
    type="button"
    className="revote-link"
    onClick={() => {
      setStatus('idle');
      localStorage.removeItem('bucks-voted');
      localStorage.removeItem('bucks-vote-data');
      setForm(initialForm);
    }}
  >
    Changed your mind? Vote again
  </button>
)}
```

Style it as a subtle text link, not a big button. It should not encourage re-voting but should allow it.

---

## Frontend changes: results display

### New component: ResultsCard

This replaces or augments the ProgressCard in the sidebar after voting is open. It shows what is winning per category.

File: `app/components/ResultsCard.js`

The component should:

1. Fetch from `/api/results` on mount (and optionally poll every 30 seconds)
2. Show voter count: "6 votes in"
3. Show voter names as small chips: "Dave, Tom, Raj, Chris, Ben, Sam"
4. For each category, show the leading option with its vote count
5. If there is a tie, show both options

**Layout per category:**

```
FRIDAY NIGHT
🍕 Pizza oven night ████████ 4
🥩 BBQ / burgers    ████     2
```

Use simple horizontal bars (CSS width based on percentage) or just show counts. Keep it minimal.

**Skeleton/loading state:** Show a pulsing placeholder while results load.

**Empty state:** "No votes yet. Be the first to ruin the plan."

### Where to show results

Two options (recommend Option A):

**Option A: Replace the sidebar progress card with results after votes exist**
- If `voterCount === 0`, show the progress card (current behaviour)
- If `voterCount > 0`, show the results card instead
- The progress card is only useful while YOU are filling in the form
- After submitting, switch the sidebar to results

**Option B: Show results below the form**
- Add a "Current standings" section below the vote form
- Always visible regardless of whether you have voted

Option A is cleaner. The sidebar becomes dual-purpose: your progress while voting, group results after.

### On mobile, show results above or below the form

Since the sidebar stacks above the form on mobile, the results card should appear either:
- Above the form (if the user has already voted, show results first since the form is disabled)
- Below the form (if the user has not voted yet, let them vote first)

### Results on the itinerary page

On the itinerary page, also fetch `/api/results` and show a small "Voting standings" summary card. This gives people a reason to check the itinerary page even before it is finalised.

---

## Frontend changes: post-vote state

When `status === 'success'`:

1. **Do not reset the form.** Keep all selections visible but disable all inputs, option cards, pills, and the submit button.
2. **Show the success card** at the top of the form area:
   > "Votes submitted. Legend. Once everyone has voted, the plan will get locked in and this site becomes the final itinerary hub."
3. **Disable option cards visually.** Add `pointer-events: none` and `opacity: 0.7` to all option cards. Keep the selected ones highlighted so the user can see what they chose.
4. **Switch sidebar to results view** (see above).
5. **Show the "Changed your mind?" link** as subtle text below the success card.

---

## Option cards: external links fix

Several options have a `link` property (venue websites). These need to be clickable without triggering the card selection.

Update `OptionCard.js`:

```jsx
export default function OptionCard({ option, isSelected, onSelect, disabled }) {
  return (
    <div
      className={`option-card ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={disabled ? undefined : onSelect}
      role="button"
      tabIndex={disabled ? -1 : 0}
    >
      {/* ... existing content ... */}

      {option.link && (
        <a
          href={option.link}
          target="_blank"
          rel="noreferrer"
          className="option-link"
          onClick={(e) => e.stopPropagation()}
        >
          View details ↗
        </a>
      )}
    </div>
  );
}
```

Change the outer element from `<button>` to `<div>` with `role="button"`. This is because `<button>` elements cannot contain `<a>` tags (invalid HTML). The `e.stopPropagation()` on the link prevents the card selection from firing when clicking the link.

Style the link as small, uppercase, primary colour, positioned at the bottom of the card.

---

## Graceful fallback when KV is not configured

For local development or if someone forks the repo without setting up KV, the API routes should fail gracefully.

```js
// At the top of each API route
let kvAvailable = true;
let kv;

try {
  const vercelKv = await import('@vercel/kv');
  kv = vercelKv.kv;
} catch {
  kvAvailable = false;
}
```

If KV is not available:
- `POST /api/vote`: log the payload to console and return `{ success: true, mock: true }`
- `GET /api/results`: return `{ voterCount: 0, voterNames: [], tally: {}, mock: true }`

The frontend should work identically in both cases. The results card will just show "No votes yet" when running locally without KV.

---

## Section anchors for scroll navigation

Each voting section should have an `id` for scroll targeting:

```jsx
<section id="section-fridayNight" className="vote-section">
```

This enables:
- Scroll-to-error on failed validation (jump to first incomplete section)
- Future: clickable progress card items that scroll to the relevant section
- Future: mobile section nav

Make the progress card items clickable. Clicking "Friday night" in the sidebar scrolls smoothly to that section:

```jsx
<li onClick={() => {
  const el = document.getElementById('section-fridayNight');
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}}>
```

---

## Package changes

Add to `package.json`:

```json
"dependencies": {
  "@vercel/kv": "^2.0.0"
}
```

No other packages needed.

---

## Environment variables

### Production (set in Vercel dashboard automatically when KV store is connected)

```
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
KV_REST_API_READ_ONLY_TOKEN=...
KV_URL=...
```

### Local development (.env.local)

Copy the above values from Vercel dashboard > Storage > KV store > Settings.

Or just develop without KV and let the fallback handle it.

---

## File changes summary

| File | Action |
|---|---|
| `app/api/vote/route.js` | Create. POST endpoint to save votes. |
| `app/api/results/route.js` | Create. GET endpoint to return tallied results. |
| `app/components/ResultsCard.js` | Create. Displays vote tallies and voter names. |
| `app/components/OptionCard.js` | Edit. Change from `<button>` to `<div>`, add link support, add disabled state. |
| `app/components/ProgressCard.js` | Edit. Add clickable scroll-to-section, switch to results mode when votes exist. |
| `app/page.js` | Edit. Wire up real API submission, add localStorage voted state, add post-vote disabled state, add results fetching. |
| `app/itinerary/page.js` | Edit. Add small results summary card. |
| `app/places/page.js` | Delete. |
| `app/components/TopNav.js` | Edit. Remove Places tab. |
| `app/siteData.js` | Edit. Remove `shortlistPlaces`. |
| `package.json` | Edit. Add `@vercel/kv`. |
| `.env.local` | Create (gitignored). KV credentials for local dev. |
| `.gitignore` | Edit. Ensure `.env.local` is listed. |

---

## What NOT to build

- No admin panel for viewing individual votes (use Vercel KV dashboard for that)
- No real-time websockets or live-updating results (polling every 30s is fine)
- No vote editing UI (just vote again with the same name, it overwrites)
- No vote closing/locking mechanism (Sam just removes the vote form when ready)
- No automated itinerary generation from votes (Sam updates manually)
- No user accounts or authentication
- No complex animations or transitions beyond basic hover/active states

---

## Acceptance criteria

1. A user can fill out the vote form and submit successfully
2. The vote is persisted in Vercel KV and survives page refresh
3. After submitting, the form shows the user's selections in a disabled state
4. After submitting, the sidebar shows aggregated results with vote counts
5. Revisiting the page after voting shows the "already voted" state (via localStorage)
6. The user can click "Changed your mind? Vote again" to revote (overwrites previous)
7. Any visitor can see current vote tallies (not just people who have voted)
8. External links on option cards open in new tabs without triggering card selection
9. Clicking a section in the progress card scrolls to that section
10. Failed validation scrolls to the first incomplete section
11. The site works without KV configured (graceful fallback, console.log mock)
12. Places page is deleted, nav has 2 tabs only
13. The itinerary page shows a small voting standings summary

---

## Priority order

1. **API routes** (vote + results) -- nothing works without these
2. **Wire up form submission** to POST /api/vote
3. **Post-vote state** (disabled form, success card, localStorage memory)
4. **ResultsCard component** + sidebar integration
5. **Option card link fix** (stopPropagation, button to div)
6. **Section anchors + scroll-to-error**
7. **Results on itinerary page**
8. **Kill Places page + fix nav**
9. **Graceful KV fallback**
10. **Polish** (loading states, empty states, mobile results)
