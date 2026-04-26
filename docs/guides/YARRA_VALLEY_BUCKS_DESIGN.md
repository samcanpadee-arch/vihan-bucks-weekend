---
name: Yarra Valley Bucks
colors:
  surface: '#fff8f5'
  surface-dim: '#e1d8d4'
  surface-bright: '#fff8f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fbf2ed'
  surface-container: '#f5ece7'
  surface-container-high: '#efe6e2'
  surface-container-highest: '#e9e1dc'
  on-surface: '#1e1b18'
  on-surface-variant: '#434843'
  inverse-surface: '#34302c'
  inverse-on-surface: '#f8efea'
  outline: '#737973'
  outline-variant: '#c3c8c1'
  surface-tint: '#4d6453'
  primary: '#061b0e'
  on-primary: '#ffffff'
  primary-container: '#1b3022'
  on-primary-container: '#819986'
  inverse-primary: '#b4cdb8'
  secondary: '#a13c3f'
  on-secondary: '#ffffff'
  secondary-container: '#ff8484'
  on-secondary-container: '#751c22'
  tertiary: '#221500'
  on-tertiary: '#ffffff'
  tertiary-container: '#3c2800'
  on-tertiary-container: '#ae8e57'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d0e9d4'
  primary-fixed-dim: '#b4cdb8'
  on-primary-fixed: '#0b2013'
  on-primary-fixed-variant: '#364c3c'
  secondary-fixed: '#ffdad8'
  secondary-fixed-dim: '#ffb3b1'
  on-secondary-fixed: '#410007'
  on-secondary-fixed-variant: '#82252a'
  tertiary-fixed: '#ffdeaa'
  tertiary-fixed-dim: '#e6c185'
  on-tertiary-fixed: '#271900'
  on-tertiary-fixed-variant: '#5b4313'
  background: '#fff8f5'
  on-background: '#1e1b18'
  surface-variant: '#e9e1dc'
typography:
  headline-xl:
    fontFamily: Noto Serif
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Noto Serif
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Noto Serif
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.1em
  micro-cheeky:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '500'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1200px
  gutter: 24px
  margin-mobile: 20px
  card-padding: 24px
---

## Brand & Style

The brand personality is "The Sophisticated Schemer"—an expert blend of high-end hospitality and the irreverent wit of a long-running group chat. It evokes the feeling of a perfectly poured Pinot Noir enjoyed while making fun of your best friend’s questionable life choices. The visual direction avoids the neon-and-stripper cliches of traditional bachelor parties, opting instead for a "Luxury Country Estate" aesthetic.

The design style is **Minimalism with Tactile Depth**. It uses heavy whitespace and a restricted, nature-inspired palette to establish a premium feel, while card-based layouts and subtle shadows provide the physical presence of a high-quality invitation or wine list. The personality is injected through the microcopy and playful "vibes" badges, ensuring the interface remains functional yet spirited.

## Colors

The color palette is grounded in the natural landscape of the Yarra Valley.

- **Deep Forest Green (Primary):** Used for main navigational elements and primary actions, representing the lush valley surroundings.
- **Rich Burgundy (Secondary):** Used for highlighting "The Vibes" and wine-centric activities. It serves as an elegant accent color for key moments.
- **Warm Charcoal:** Used for text and icons to provide high legibility without the harshness of pure black.
- **Cream & Soft Neutrals:** The foundation of the UI. This design system uses a cream base rather than stark white to create a warmer, more sophisticated "paper-stock" feel.
- **Muted Gold (Tertiary):** Reserved for "Premium" statuses, budget totals, or winner badges in group activities.

## Typography

Typography plays a dual role: the serif establishes the "Premium Country" authority, while the sans-serif handles the logistics with modern clarity.

- **Headlines (Noto Serif):** Set with tight tracking and generous line heights to mimic high-end editorial layouts. Use for screen titles, event names, and important "State of the Union" announcements.
- **UI & Body (Plus Jakarta Sans):** Chosen for its friendly but clean geometric forms. It remains highly legible even when the group chat gets chaotic.
- **Microcopy:** A specialized "micro-cheeky" style is used for parenthetical jokes, "fine print" banter, and playful instructions, usually set in italics to distinguish it from functional text.

## Layout & Spacing

This design system utilizes a **fixed-width, centered grid** for desktop to maintain a boutique feel, and a single-column fluid layout for mobile.

The spacing rhythm is based on an 8px base unit. Cards are the primary container, using generous internal padding (24px) to allow content to breathe. Grouped items (like an itinerary list) should use tighter vertical spacing, while distinct sections (Activities vs. Accommodation) should be separated by large whitespace gaps (64px+) to maintain an organized, premium flow.

## Elevation & Depth

Depth is conveyed through **Tonal Layers and Ambient Shadows**. Rather than heavy drop shadows, the design system uses "soft lifts"—large blur radii with very low opacity (5-10%) tinted with the primary Forest Green or Charcoal.

- **Level 0 (Base):** The Cream background.
- **Level 1 (Cards):** Slightly elevated with a soft shadow to appear as physical cards resting on the cream surface.
- **Level 2 (Active Elements):** Buttons and active chips have a slightly more pronounced shadow and a 1px soft border to indicate interactability.
- **Overlays:** High-blur backdrop filters are used behind modals to keep the focus on the content while maintaining the visual context of the "vineyard" aesthetic.

## Shapes

The shape language is **Refined and Intentional**.

We use a "Medium Rounded" approach (0.5rem / 8px). This is soft enough to feel approachable and modern, but sharp enough to avoid the "bubbly" or "childish" look of more rounded systems.

- **Primary Buttons:** Feature 8px corners.
- **Chips & Badges:** Use a full pill shape (rounded-xl) to contrast against the structured squareness of the cards.
- **Images:** All photography (vineyards, steak, the groom looking confused) should follow the 8px corner radius to maintain a cohesive gallery look.

## Components

### Buttons

Primary buttons are solid Forest Green with Cream text. Secondary buttons use a transparent background with a 1.5px Forest Green border. All button labels are set in bold Plus Jakarta Sans.

### The "Vibe" Chips

Unique to this system, "Vibe" chips (e.g., "High Stakes," "Sophisticated Sipping," "Likely to Result in a Fine") use the Burgundy and Gold colors. They are pill-shaped and always accompanied by a small, minimalist icon.

### Cards

Cards are the backbone of the system. They feature a 1px "ghost border" (#E5E0D5) and a soft ambient shadow. Within cards, use "Label-Caps" typography for secondary metadata like "COST PER HEAD" or "LOCATION."

### Inputs & Selection

Input fields are minimalist—bottom borders only or very light subtle containers—to keep the UI from looking like a tax form. Radio buttons and checkboxes are custom-styled in Forest Green.

### The "Cheeky" Tooltip

A specialized tooltip component designed for banter. When a user hovers over a cost or a rule, a small tooltip may appear with a quip (e.g., hovering over "Deposit Due" might show "Don't be that guy, Dave").

### Itinerary List

A vertical timeline component using a thin Charcoal line and Forest Green dots. Each entry is a "Card" that displays the time, activity, and a "Vibe" chip.
