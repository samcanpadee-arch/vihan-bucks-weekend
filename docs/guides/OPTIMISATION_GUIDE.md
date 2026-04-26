# Vihan's Bucks Weekend Microsite: Optimisation Guide for Codex

## Context

This is a lightweight static Next.js microsite deployed on Vercel for planning a bucks weekend in the Yarra Valley (26-28 June 2026). The live site is at https://vihan-bucks-weekend.vercel.app/

The site has two jobs:
1. Collect group votes on the rough weekend plan (voting page)
2. Display the final itinerary once locked in (itinerary page)

This guide covers all changes needed to bring the codebase in line with the approved spec, fix bugs, complete the data, and match the Stitch mockup visual direction.

**Visual source of truth:** The three Stitch HTML mockups (`page 1.txt`, `page 2.txt`, `page 3.txt`) define the target look and feel. Match them closely.

**Design system reference:** `YARRA_VALLEY_BUCKS_DESIGN.md` defines colours, typography, spacing, and component patterns.

---

## Phase 1: Structural changes

### 1.1 Kill the Places page

Delete `app/places/page.js` entirely. This page duplicates content already present on the vote page and itinerary page.

Merge the useful parts:
- The shortlist place cards from `shortlistPlaces` in `siteData.js` are not needed on either remaining page. Remove the `shortlistPlaces` export from `siteData.js`.
- The cost guide table already appears on the vote page. No merge needed there.
- Remove the `shortlistPlaces` data from `siteData.js`.

### 1.2 Fix navigation to 2 pages only

Update `app/components/TopNav.js`:

```js
const tabs = [
  { href: '/', label: 'Vote' },
  { href: '/itinerary', label: 'Itinerary' }
];
```

Remove any reference to `/places` or "Places + Cost" from navigation, including the mobile bottom nav.

### 1.3 Fix font loading

The site currently has no font imports. Fonts fall back to system defaults.

In `app/layout.js`, add Google Fonts. Use `next/font/google` for performance:

```js
import { Noto_Serif, Plus_Jakarta_Sans } from 'next/font/google';

const notoSerif = Noto_Serif({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-serif',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});
```

Apply both variables to the `<html>` or `<body>` tag:

```jsx
<html lang="en" className={`${notoSerif.variable} ${plusJakarta.variable}`}>
```

Update `globals.css` font-family references to use the CSS variables:

```css
body {
  font-family: var(--font-sans), 'Plus Jakarta Sans', sans-serif;
}

h1, h2, h3, h4 {
  font-family: var(--font-serif), 'Noto Serif', Georgia, serif;
}
```

### 1.4 Fix next.config.mjs

Remove `output: 'standalone'`. This is meant for Docker/self-hosted deployments and is unnecessary (and potentially problematic) on Vercel.

```js
/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
```

### 1.5 Add Material Symbols Outlined

The Stitch mockups use Material Symbols for icons throughout. Add the icon font.

**Option A (simpler):** Add a `<link>` tag in `layout.js`:

```jsx
<head>
  <link
    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
    rel="stylesheet"
  />
</head>
```

**Option B (if next/font doesn't support it):** Add via `globals.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
```

Use `<span className="material-symbols-outlined">icon_name</span>` throughout the components to match the mockups.

---

## Phase 2: Complete all voting data

### 2.1 Friday night options (4 total)

Replace the current 2 options with all 4 from the spec:

```js
{
  key: 'fridayNight',
  title: 'Friday night',
  subtitle: 'The Arrival',
  icon: 'nightlife', // Material Symbol name
  options: [
    {
      id: 'friday-pizza-oven',
      title: 'Pizza oven night',
      description: "Sam brings the pizza oven, we make pizzas, everyone helps, and nobody gets to stand around doing fake supervision with a beer.",
      meta: ['Friday evening', 'Flexible', 'Shared grocery cost'],
      vibe: 'High stakes',
      image: '...' // keep existing image
    },
    {
      id: 'friday-bbq',
      title: 'BBQ / burgers',
      description: "Sausages, steaks, reliable. Nobody has to learn anything new.",
      meta: ['Friday evening', 'Shared grocery cost'],
      vibe: 'Safe bet'
    },
    {
      id: 'friday-grazing',
      title: 'Grazing table and snacks',
      description: "Low effort, high reward. Cheese, dips, cured meats, and zero cooking required.",
      meta: ['Friday evening', 'Shared grocery cost'],
      vibe: 'Minimal effort'
    },
    {
      id: 'friday-takeaway',
      title: 'Takeaway / frozen backup',
      description: "For when ambition dies on the drive up. No shame, just convenience.",
      meta: ['Friday evening', 'Pay individually'],
      vibe: 'Recovery mode'
    }
  ]
}
```

### 2.2 Saturday morning options (8 total)

Replace the current 3 options with all 8:

```js
{
  key: 'saturdayMorning',
  title: 'Saturday morning',
  subtitle: 'Controlled Chaos',
  icon: 'wb_sunny',
  options: [
    {
      id: 'sat-morning-clay-public',
      title: 'Clay shooting (public session)',
      description: "Melbourne Gun Club, Yering. Zero alcohol beforehand. Photo ID required. Closed shoes. No camo or singlets. Fun option, cursed start time.",
      meta: ['Arrive 8:45am', '1-1.5 hrs', 'Approx. $80.50 pp'],
      vibe: 'Early but worth it',
      link: 'https://www.melbournegunclub.com/come-and-try/',
      image: '...' // keep existing clay shooting image
    },
    {
      id: 'sat-morning-clay-private',
      title: 'Clay shooting (private session)',
      description: "Same venue, but booked just for us. Time is flexible, price is higher, ego damage is the same.",
      meta: ['Time by enquiry', 'Approx. $165 pp'],
      vibe: 'Premium chaos',
      link: 'https://www.melbournegunclub.com/corporate-and-social-events-copy/'
    },
    {
      id: 'sat-morning-paintball',
      title: 'Paintball',
      description: "Bruises and brotherhood. Mostly just bruises though.",
      meta: ['9:00am or 1:00pm', 'Approx. $55-$155 pp'],
      vibe: 'Likely to result in a fine',
      link: 'https://paintballgames.com.au/play-now/'
    },
    {
      id: 'sat-morning-minigolf',
      title: 'Mini golf / driving range',
      description: "Low intensity, high trash talk potential. Good for easing into the day.",
      meta: ['Open 9am-10pm', 'Approx. $19-$29 mini golf', '$14-$19 range'],
      vibe: 'Casual kings',
      link: 'https://www.maroondahgolfpark.com.au/'
    },
    {
      id: 'sat-morning-chill',
      title: 'Chill morning at Airbnb',
      description: "Sleep in, coffee, do nothing productive. Protect the energy for later.",
      meta: ['Flexible', 'Free-ish'],
      vibe: 'Recovery mode'
    },
    {
      id: 'sat-morning-walk',
      title: 'Short walk / nature reset',
      description: "20 to 60 minutes of pretending to be outdoorsy before the drinking starts.",
      meta: ['20-60 mins', 'Free'],
      vibe: 'Wholesome detour',
      link: 'https://www.visityarravalley.com.au/blog/walks-you-can-do-in-an-hour-in-the-yarra-valley'
    },
    {
      id: 'sat-morning-donna-buang',
      title: 'Mt Donna Buang / Rainforest Gallery',
      description: "Elevated walkway through ancient rainforest. Looks incredible in winter. Free and genuinely cool.",
      meta: ['Flexible', 'Free'],
      vibe: 'Nature break',
      link: 'https://www.parks.vic.gov.au/places-to-see/parks/yarra-ranges-national-park'
    },
    {
      id: 'sat-morning-archery',
      title: 'Archery',
      description: "Channel your inner medieval energy. Group sessions available by enquiry.",
      meta: ['Time by enquiry', 'From approx. $45 pp'],
      vibe: 'Wildcard',
      link: 'https://yvap.com.au/corporate/'
    }
  ]
}
```

### 2.3 Saturday lunch / winery options (7 total)

Replace the current 3 with all 7:

```js
{
  key: 'saturdayLunch',
  title: 'Saturday lunch / winery',
  subtitle: 'Long Lunch',
  icon: 'restaurant',
  options: [
    {
      id: 'sat-lunch-yering',
      title: 'Yering Station',
      description: "Big vineyard energy, polished long lunch, great Pinot options.",
      meta: ['Approx. $15-$35 pp tastings'],
      vibe: 'Sophisticated sipping',
      link: 'https://www.yering.com/visit-us/cellar-door/',
      image: '...' // keep existing
    },
    {
      id: 'sat-lunch-rochford',
      title: 'Rochford Wines',
      description: "Set menu approach and fewer choices for chaos management.",
      meta: ['Approx. $15-$25 pp tastings'],
      vibe: 'Premium lock-in',
      link: 'https://rochfordwines.com.au/yarra-valley-cellar-door'
    },
    {
      id: 'sat-lunch-chandon',
      title: 'Chandon',
      description: "Bubbles and views. Pure sophistication before the night descends into chaos.",
      meta: ['Approx. $22 pp tasting'],
      vibe: 'Bubbly energy',
      link: 'https://www.chandon.com.au/Experiences'
    },
    {
      id: 'sat-lunch-oakridge',
      title: 'Oakridge Wines',
      description: "Award-winning food, serious cellar door. Good for a group that can behave for 90 minutes.",
      meta: ['Enquire for group pricing'],
      vibe: 'Refined choice',
      link: 'https://oakridgewines.com.au/cellar-door/'
    },
    {
      id: 'sat-lunch-debortoli',
      title: 'De Bortoli Locale',
      description: "Restaurant with cheese room. The cheese room alone justifies the trip.",
      meta: ['Restaurant pricing / group enquiry'],
      vibe: 'Cheese believers',
      link: 'https://www.debortoli.com.au/visit-us/restaurants/locale-restaurant-yarra-valley'
    },
    {
      id: 'sat-lunch-hubert',
      title: 'Hubert Estate / Quarters',
      description: "Modern and sleek. Good food, good wine, slightly more grown-up energy.",
      meta: ['Restaurant pricing / group enquiry'],
      vibe: 'Grown-up energy',
      link: 'https://hubertestate.com.au/quarters-dining/'
    },
    {
      id: 'sat-lunch-grand-hotel',
      title: 'Yarra Valley Grand Hotel',
      description: "Pub classics, less ceremony, easier for all tastes. Pay individually.",
      meta: ['Pay individually'],
      vibe: 'Casual kings',
      link: 'https://yarravalleygrand.com.au/'
    }
  ]
}
```

### 2.4 Saturday afternoon drinks (5 total)

Replace the current 2 with all 5:

```js
{
  key: 'saturdayDrinks',
  title: 'Saturday afternoon drinks',
  subtitle: 'Gin & Juice',
  icon: 'liquor',
  options: [
    {
      id: 'sat-drinks-four-pillars',
      title: 'Four Pillars Gin',
      description: "The legendary Bloody Shiraz gin awaits. Approx 55 min session, hourly from 12pm weekends.",
      meta: ['Approx. 55 mins', 'Approx. $50 pp'],
      vibe: 'Deep vibes only',
      link: 'https://fourpillarsgin.com/pages/visit-our-distillery',
      image: '...' // keep existing
    },
    {
      id: 'sat-drinks-watts',
      title: 'Watts River Brewing',
      description: "Craft beers, outdoor tables, very acceptable afternoon pivot.",
      meta: ['Flexible', 'Pay as you go'],
      vibe: 'Casual kings',
      link: 'https://wattsriverbrewing.com.au/'
    },
    {
      id: 'sat-drinks-st-ronans',
      title: "St Ronan's Cider",
      description: "Cider and perries for the beer-averse. Relaxed vibe, easy afternoon stop.",
      meta: ['Flexible', 'Pay as you go'],
      vibe: 'Chill option',
      link: 'https://www.visitvictoria.com/regions/yarra-valley-and-dandenong-ranges/eat-and-drink/breweries-and-distilleries/cideries/st-ronans-cider'
    },
    {
      id: 'sat-drinks-more-wineries',
      title: 'More winery tastings',
      description: "Keep the wine train rolling. Hit another cellar door or two before dinner.",
      meta: ['Flexible', 'Varies'],
      vibe: 'Committed to the cause'
    },
    {
      id: 'sat-drinks-airbnb',
      title: 'Back to Airbnb earlier',
      description: "Regroup at base camp. Saves money, saves energy, saves face.",
      meta: ['Flexible', 'Free'],
      vibe: 'Recovery mode'
    }
  ]
}
```

### 2.5 Saturday night options (5 total)

Replace the current 2 with all 5:

```js
{
  key: 'saturdayNight',
  title: 'Saturday night',
  subtitle: 'Main Character Dinner',
  icon: 'local_bar',
  options: [
    {
      id: 'sat-night-bbq',
      title: 'BBQ dinner',
      description: "Back at base camp. Fire up the barbie, keep it simple, keep it loud.",
      meta: ['Evening', 'Shared grocery cost'],
      vibe: 'Classic'
    },
    {
      id: 'sat-night-pizza',
      title: 'Pizza oven round two',
      description: "Pizza oven round two only works if people help. This is a group weekend, not a one-man restaurant.",
      meta: ['Evening', 'Shared grocery cost'],
      vibe: 'High stakes (again)',
      image: '...' // optional
    },
    {
      id: 'sat-night-catered',
      title: 'Catered / private chef',
      description: "Someone else cooks, we just eat. Premium option but zero effort required.",
      meta: ['Evening', 'Enquire for pricing'],
      vibe: 'Premium plan'
    },
    {
      id: 'sat-night-takeaway',
      title: 'Big takeaway order',
      description: "Order everything. Eat on the couch. No judgement zone.",
      meta: ['Evening', 'Pay individually'],
      vibe: 'Zero effort'
    },
    {
      id: 'sat-night-pub',
      title: 'Pub / restaurant dinner',
      description: "Head out to a venue. More structured, easier for fussy eaters.",
      meta: ['Evening', 'Pay individually'],
      vibe: 'Night out',
      image: '...' // keep existing Rochford image if desired
    }
  ]
}
```

### 2.6 Sunday recovery options (6 total)

Replace the current 3 with all 6:

```js
{
  key: 'sundayRecovery',
  title: 'Sunday recovery',
  subtitle: 'Soft Landing',
  icon: 'coffee',
  options: [
    {
      id: 'sun-chocolaterie',
      title: 'Yarra Valley Chocolaterie',
      description: "Free entry, optional tasting for $4. Sugar fixes everything.",
      meta: ['Usually 9am-5pm', 'Free entry', 'Optional $4 tasting'],
      vibe: 'Sugar hit',
      link: 'https://www.yvci.com.au/'
    },
    {
      id: 'sun-sanctuary',
      title: 'Healesville Sanctuary',
      description: "Wholesome animal reset before heading home. Platypus viewing is genuinely great.",
      meta: ['Usually 9am-5pm', 'From approx. $54.50 pp'],
      vibe: 'Nature break',
      link: 'https://www.zoo.org.au/healesville/',
      image: '...' // optional
    },
    {
      id: 'sun-walk',
      title: 'Short nature walk',
      description: "Fresh air, mild exertion, questionable motivation.",
      meta: ['Flexible', 'Free'],
      vibe: 'Wholesome detour'
    },
    {
      id: 'sun-pub-lunch',
      title: 'Pub / winery lunch',
      description: "One more meal out before reality returns.",
      meta: ['Flexible', 'Pay individually'],
      vibe: 'Last hurrah'
    },
    {
      id: 'sun-minigolf',
      title: 'Mini golf / driving range',
      description: "Low stakes, high trash talk. Good Sunday energy.",
      meta: ['Open 9am-10pm', 'Approx. $19-$29'],
      vibe: 'Casual kings',
      link: 'https://www.maroondahgolfpark.com.au/'
    },
    {
      id: 'sun-leave-early',
      title: 'Leave early',
      description: "Skip the fanfare and reclaim Sunday afternoon. No judgement.",
      meta: ['Anytime'],
      vibe: 'Quiet exit'
    }
  ]
}
```

### 2.7 Budget comfort options (5 total)

Replace the current 3 with all 5 from the spec:

```js
export const budgetOptions = [
  { id: 'budget-under-75', label: 'Under $75 for paid activities' },
  { id: 'budget-75-150', label: '$75-$150 for paid activities' },
  { id: 'budget-150-250', label: '$150-$250 for paid activities' },
  { id: 'budget-dont-care', label: "Don't care if it's good" },
  { id: 'budget-complain', label: 'I will complain regardless of price' }
];
```

### 2.8 Hard no list (11 options + Other)

Replace the current 5 with all options from the spec:

```js
export const hardNoOptions = [
  '8:45am start',
  'Clay shooting',
  'Paintball',
  'Nature walk',
  'Fancy winery lunch',
  'Gin tasting',
  'Mini golf',
  'Being responsible for cooking',
  'Spending over $150 on activities',
  'Leaving the Airbnb after dinner',
  'Other'
];
```

### 2.9 Update cost guide to match spec pricing

The current cost guide has incorrect prices. Replace with accurate data:

```js
export const costGuide = [
  { item: 'Accommodation', when: 'Fri-Sun', cost: 'Included', notes: 'Already booked.' },
  { item: 'Friday night food', when: 'Friday', cost: 'Shared grocery cost', notes: 'Depends on option chosen.' },
  { item: 'Clay shooting (public)', when: 'Saturday morning', cost: 'Approx. $80.50 pp', notes: 'Come and try session.' },
  { item: 'Clay shooting (private)', when: 'Saturday morning', cost: 'Approx. $165 pp', notes: 'Private group session.' },
  { item: 'Paintball', when: 'Saturday morning', cost: 'Approx. $55-$155 pp', notes: 'Depends on package.' },
  { item: 'Mini golf', when: 'Saturday or Sunday', cost: 'Approx. $19-$29 pp', notes: 'Driving range $14-$19.' },
  { item: 'Archery', when: 'Saturday morning', cost: 'From approx. $45 pp', notes: 'Group sessions by enquiry.' },
  { item: 'Winery tastings', when: 'Saturday lunch', cost: '$15-$35 per venue', notes: 'Usually redeemable on bottle purchase.' },
  { item: 'Four Pillars Gin', when: 'Saturday afternoon', cost: 'Approx. $50 pp', notes: 'Approx. 55 min session.' },
  { item: 'Healesville Sanctuary', when: 'Sunday', cost: 'From approx. $54.50 pp', notes: 'Full day if you want it.' },
  { item: 'Yarra Valley Chocolaterie', when: 'Sunday', cost: 'Free entry / $4 tasting', notes: 'Free chocolate samples on arrival.' }
];
```

---

## Phase 3: Copy fixes

### 3.1 Hero section

The hero copy on the vote page must match the approved spec exactly.

**Hero title:** "Vihan's Yarra Valley Bucks Weekend"

**Hero subtitle:** "26-28 June 2026 · Yarra Glen · A very serious planning website for a deeply unserious weekend."

**Support copy:** "Vote on the rough plan now. Once things are locked in, this becomes the trip hub with the final itinerary, accommodation details, booking links, times and notes."

**Small line (below blockquote or as footer-like microcopy):** "Built because planning manually is painful and procrastination is a powerful drug."

Do NOT wrap the support copy in a `<blockquote>`. Use a standard paragraph. The blockquote treatment in the current build makes it look like a pullquote from someone specific, which is wrong.

### 3.2 Accommodation card copy

**Label:** "Base camp"

**Accommodation name:** Keep "Yarra Glen Airbnb Estate" or simplify to "Airbnb in Yarra Glen" (the spec does not give the property a fancy name).

**Status:** Booked

**Copy:** "Accommodation is already booked. This is where everyone eventually needs to end up."

**Note:** "Address and check-in details will be added once confirmed, so nobody has to scroll through old messages like an archaeologist."

The current note text ("Check-in at 3:00 PM. Don't be the guy who shows up early and expects a tour.") is wrong. Check-in time is TBC per the spec. Replace it.

**Address:** "TBC once shared" (not "TBC - Sent via Signal")

### 3.3 Footer

Add a footer component. It does not currently exist.

```jsx
<footer>
  <p><strong>Built for Vihan's bucks weekend.</strong></p>
  <p>Vote irresponsibly, plan responsibly.</p>
</footer>
```

Style it to match the Stitch mockup in `page 2.txt`: uses `surface-container-highest` background, border-top, centred layout with small icons.

### 3.4 Progress card copy

Change "Finalize the scheme" to "Finalize the scheme" (keep this, it works).

Change the fine print to: "Costs are indicative only. This is not a checkout."

This already matches. Good.

### 3.5 Itinerary page hero

Must match spec:

**Label:** "Draft - not final yet"

**Title:** "Final itinerary"

**Copy:** "Once the votes are in, this becomes the one link for the weekend. Keep it bookmarked, don't say I didn't tell you."

This currently matches. Good.

### 3.6 Field labels

These currently match the spec. Keep:
- "Name (identity for public shaming)"
- "Travel notes (who are you carpooling with?)"
- "Hard constraints (allergies/anxieties)"

### 3.7 Cost guide section heading

Currently shows: "Indicative only. Not a checkout... Please do not invoice Sam."

This is fine. Keep it.

---

## Phase 4: Visual polish to match Stitch mockups

This is the largest visual phase. The mockups use a significantly more polished treatment than the current build.

### 4.1 TopNav / top app bar

Match `page 1.txt` mockup:

- Background: `#FDFCF0` (slightly different from the page cream)
- Sticky, `z-50`
- Bottom border: `1px solid #E5E0D5`
- Soft shadow: `shadow-sm shadow-[#1B3022]/5`
- Site title: Serif, uppercase, tight tracking, bold
- Nav links: uppercase label-caps style, with active state using bottom border
- Remove the account_circle icon (no auth, no user accounts)
- Only 2 nav items: Vote, Itinerary

### 4.2 Mobile bottom nav

Add a fixed bottom nav bar for mobile (visible below `lg` breakpoint, hidden on desktop). Match the mockup in `page 1.txt`:

```jsx
<nav className="mobile-bottom-nav">
  <Link href="/" className={activeHref === '/' ? 'active' : ''}>
    <span className="material-symbols-outlined">how_to_vote</span>
    <span>Vote</span>
  </Link>
  <Link href="/itinerary" className={activeHref === '/itinerary' ? 'active' : ''}>
    <span className="material-symbols-outlined">event_note</span>
    <span>Itinerary</span>
  </Link>
</nav>
```

Styles (match mockup):
- Fixed bottom, full width, `z-50`
- Background: `#FDFCF0`
- Top border: `1px solid #E5E0D5`
- Rounded top corners: `rounded-t-2xl`
- Shadow: `0 -4px 12px rgba(27,48,34,0.08)`
- Safe area padding bottom for notch phones: `pb-6`
- Active state: green-tinted background, primary text colour
- Icon above label, label is `10px` bold uppercase
- Add `pb-24` to the page shell on mobile so content isn't hidden behind the bottom nav

### 4.3 Option cards with images

Match the card treatment in `page 1.txt`:

- Cards: white background, `1px solid #E5E0D5` border, `rounded-xl` (0.75rem)
- Selected state: `border-primary`, `ring-2 ring-primary/20`, white background, stronger shadow
- Hover state: slightly elevated shadow
- Images: full-bleed at top of card, rounded top corners only, `h-[140px]` or `h-[170px]` on desktop
- Meta chips: pill-shaped, small (10-12px), uppercase, with optional Material Symbol icon inline
- Vibe chips: pill-shaped, using the accent colours (burgundy for warnings, gold for premium, stone for neutral)
- Description text: italic, `text-on-surface-variant`
- Cards should have `height: 100%` within the grid so they align

If an option has a `link` property, show a small "View details" link at the bottom of the card with an `open_in_new` icon. This link should open in a new tab and should NOT interfere with the card's selection click. Use `e.stopPropagation()` on the link's click handler.

### 4.4 Progress card / sidebar

Match the mockup sidebar:

- Dark green gradient background: `linear-gradient(180deg, #0f3520, #092b18)` (current) or solid `#1B3022`
- Profile row: keep the Vihan avatar image, with circular crop and white border
- Section checklist: each row has a Material Symbol icon on the left, label, and a green checkmark or dash on the right
- Active/completed rows: `bg-[#1B3022]` with light text and green `check_circle` (filled) icon
- Incomplete rows: lighter text, no background
- Bottom: "Submit Final Votes" button, full width, primary bg
- Below the card: add the "Cheeky Tooltip" from the mockup -- a gold-toned card with a banter quote. Example: "Choosing nothing? That's how we end up eating lukewarm Maccas in the car park."
- Sticky: `position: sticky; top: 1.5rem;`
- On mobile: not sticky, appears above the form (current behaviour is fine)

### 4.5 Section headers with icons

Each voting block header in the mockup has a Material Symbol icon to the left of the title. Update `SectionHeader.js` to accept an `icon` prop:

```jsx
<div className="section-header">
  <div className="section-header-row">
    {icon && <span className="material-symbols-outlined">{icon}</span>}
    <div>
      {label && <p className="section-label">{label}</p>}
      <h2>{title}</h2>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </div>
  </div>
</div>
```

### 4.6 Input fields

Match the mockup style: bottom-border-only inputs, not boxed inputs.

```css
input, textarea {
  border: none;
  border-bottom: 2px solid var(--primary);
  background: transparent;
  border-radius: 0;
  padding: 0.7rem 0;
  font: inherit;
  transition: border-color 0.2s;
}

input:focus, textarea:focus {
  outline: none;
  border-bottom-color: var(--secondary);
}
```

Textarea should keep its border (all sides) since bottom-only looks odd on multi-line inputs.

### 4.7 Submit button

Match the mockup's submit button:

- Large, centred, `bg-primary` with white text
- `rounded-xl`, generous padding (`px-12 py-5`)
- Strong shadow: `shadow-2xl`
- Hover: `bg-secondary`, slight scale-up (`hover:scale-105`)
- Active: scale-down (`active:scale-95`)
- Includes a right arrow icon: `<span className="material-symbols-outlined">arrow_forward</span>`
- Transition: smooth colour + transform

### 4.8 Itinerary page timeline

Match the timeline treatment in `page 3.txt`:

- Vertical line on the left (2px, `#E5E0D5`) connecting timeline entries
- Green dot at each day marker (4px radius, `bg-[#1B3022]`, with a subtle ring: `ring-4 ring-[#1B3022]/10`)
- Day labels: uppercase label-caps in gold (`#8B6E32`)
- Each entry: white card with border, showing time (tiny caps), title (bold), and optional note
- Confirmed entries: solid border, "CONFIRMED" chip on the right
- TBC entries: dashed border, `opacity-70`, hourglass icon on the right
- Vibe chips on entries where relevant

### 4.9 Bookings and status cards

Match `page 3.txt`:

- Each booking: white card with border, icon on left in a rounded square container, title + subtitle, status badge on right
- Booked: green badge (`bg-green-100 text-green-800`)
- Not booked: stone badge (`bg-stone-100 text-stone-600`)

### 4.10 Colour variable cleanup

The mockups use some specific hex values that should be added to globals.css:

```css
:root {
  /* ... existing ... */
  --nav-bg: #FDFCF0;
  --border: #E5E0D5;
  --gold-label: #8B6E32;
  --green-confirmed: #d0e9d4;
}
```

### 4.11 Accommodation card with image

The mockup shows the Airbnb image at the top of the accommodation card, full-bleed with rounded top corners. The current component already supports this via `accommodation.image`. Make sure:

- Image is full width, `h-[220px]`, `object-cover`
- Rounded top corners match the card radius
- Negative margins pull it flush: `margin: -1.25rem -1.25rem 1rem`

### 4.12 Itinerary page essentials checklist

The mockup (`page 3.txt`) shows a dark green card next to the base camp card with a "Things to bring" checklist:

- Warm clothes (Valley gets cold)
- Phone chargers
- Electrolytes
- Good vibes only

Add this as a data array and render it on the itinerary page. Use checkmark icons (`check_circle` in `secondary-container` colour). Include the cheeky fine print at the bottom.

---

## Phase 5: Form and UX fixes

### 5.1 Progress card should track all sections

The current `ProgressCard` only tracks 8 sections. Update `sectionOrder` to include all form fields that indicate meaningful progress:

```js
const sectionOrder = [
  ['name', 'Name', 'person'],
  ['fridayNight', 'Friday night', 'nightlife'],
  ['saturdayMorning', 'Saturday morning', 'wb_sunny'],
  ['saturdayLunch', 'Saturday lunch', 'restaurant'],
  ['saturdayDrinks', 'Saturday drinks', 'liquor'],
  ['saturdayNight', 'Saturday night', 'local_bar'],
  ['sundayRecovery', 'Sunday', 'coffee'],
  ['budgetComfort', 'Budget', 'payments']
];
```

Keep hardNos and finalComments out of the progress tracker since they are optional.

### 5.2 Validate required fields clearly

The current form requires: name, fridayNight, saturdayMorning, saturdayLunch, saturdayDrinks, saturdayNight, sundayRecovery, budgetComfort.

The error message is fine: "Add your name and vote across each core section before submitting."

Add a visual indicator to the progress card showing which sections are missing when submit is attempted (brief red highlight or shake animation on missing items).

### 5.3 Success state

The current success card is fine. Keep the copy:

> "Legend. Once everyone has voted, the plan will get locked in and this site becomes the final itinerary hub."

### 5.4 Formspree / mock submission

Keep the current logic:
- If `NEXT_PUBLIC_FORMSPREE_ENDPOINT` env var exists, POST to it
- If not, `console.log` the payload

No changes needed here.

### 5.5 Smooth scroll to first error

When validation fails, scroll to the first incomplete section so the user knows where to look:

```js
const firstMissing = requiredKeys.find((key) => !form[key]);
if (firstMissing) {
  const el = document.getElementById(`section-${firstMissing}`);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
```

Add `id={`section-${section.key}`}` to each voting section wrapper.

---

## Phase 6: Cleanup

### 6.1 Delete unused files and data

- Delete `app/places/page.js`
- Remove `shortlistPlaces` from `siteData.js`
- Remove the `/places` tab from `TopNav.js`

### 6.2 Remove unused avatar image

The progress card currently uses a hardcoded Google avatar URL. Keep it for now (it is Vihan's avatar from the Stitch mockup). If it breaks, replace with a simple initial circle (`V` in a green circle).

### 6.3 Metadata

Update `app/layout.js` metadata:

```js
export const metadata = {
  title: "Vihan's Yarra Valley Bucks Weekend",
  description: 'Vote on the plan. 26-28 June 2026, Yarra Glen.',
};
```

### 6.4 Add rel="icon" favicon

Optional but nice: add a simple emoji favicon using an SVG data URI in `layout.js`:

```jsx
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🍷</text></svg>" />
```

---

## What NOT to build

- No login, auth, or user accounts
- No admin panel
- No database or backend
- No payment flow, checkout, or cart
- No estimated total calculator
- No Google Form embed
- No dark mode toggle (the mockups reference dark classes but do not implement a toggle -- ignore dark mode entirely)
- No settings page
- No dietary requirements section (unless explicitly asked later)
- No "Overview" page (the mockups reference it in the nav but it does not exist in the spec)
- No account icon in the nav
- No individual personalised itinerary builder
- No complex animations beyond hover/transition polish

---

## Acceptance criteria

1. Site has exactly 2 pages: `/` (vote) and `/itinerary`
2. Navigation shows 2 tabs only, with mobile bottom nav
3. Fonts load correctly (Noto Serif for headings, Plus Jakarta Sans for body)
4. Material Symbols Outlined icons render throughout
5. All voting sections contain the complete set of options per the spec
6. All copy matches the approved spec text
7. Cost guide prices match the spec
8. Hard no list has all 11 options + Other
9. Budget options have all 5 choices
10. Cards match the Stitch mockup card treatment (images, chips, selected states, shadows)
11. Progress card uses icons and matches the sidebar mockup
12. Footer renders on both pages
13. Mobile bottom nav appears on small screens, hides on desktop
14. Form submission works (mock or Formspree)
15. Itinerary page has timeline, bookings grid, essentials checklist
16. No Places page exists
17. No dark mode toggle
18. Deploys cleanly on Vercel with no build errors

---

## Priority order

If time is limited, implement in this order:

1. Font loading + Material Symbols (everything looks wrong without fonts)
2. Kill Places page + fix nav to 2 tabs
3. Complete all voting option data in siteData.js
4. Fix all copy to match spec
5. Card visual polish (images, chips, selected states)
6. Mobile bottom nav
7. Progress card sidebar polish
8. Itinerary page timeline and bookings polish
9. Footer
10. Smooth scroll to error, favicon, cleanup
