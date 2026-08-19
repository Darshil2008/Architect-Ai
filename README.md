# Architect AI — Interactive Landing Page

> From idea to architecture, in one interview.

A dark, cyberpunk-styled landing page for **Architect AI**, a concept product that interviews developers about their project idea and generates a blueprint — recommended stack, roadmap, and resume impact — in real time. This repo is the marketing/demo front end: a fully static, framework-free site with a working mock interview built in vanilla JS.

## Live demo flow

Scroll to the **"Try it now"** section and the interview starts automatically. Answer four questions (via the quick-reply chips or by typing your own answer) and watch the blueprint panel fill in live:

1. What are you building?
2. Who is it for?
3. What's your strongest stack?
4. How soon do you want v1 shipped?

Based on your answers, the app generates:
- A **recommended stack** (matched against your stated skill)
- A **roadmap** (scaled to your chosen timeline — weekend sprint through 3-month build)
- A **resume impact** line summarizing the shipped project

Click **Restart interview** to run it again.

## Tech stack

No frameworks, no build step — just three files:

| File         | Purpose                                                              |
|--------------|-----------------------------------------------------------------------|
| `index.html` | Page structure and markup                                            |
| `styles.css` | All styling — dark theme, glassmorphism, animations, responsive layout |
| `script.js`  | All behavior — interview engine, blueprint generation, UI interactions |

Fonts (Google Fonts, loaded via CDN): **Inter** (body), **Space Grotesk** (display/headings), **JetBrains Mono** (code/labels).

## Project structure

```
architect-ai/
├── index.html      # Markup for header, hero, features, workflow, demo, FAQ, footer, modal
├── styles.css       # Design tokens (CSS variables) + component styles
├── script.js        # Content data + interview logic + all interactivity
└── README.md
```

## Running it locally

No install, no server required.

1. Make sure all three files (`index.html`, `styles.css`, `script.js`) are in the **same folder**, with those **exact filenames**.
2. Open `index.html` directly in a browser (double-click it, or drag it into a browser tab).

Optional — if you prefer serving it over `http://` instead of `file://` (e.g. for consistent font loading):

```bash
# Python
python3 -m http.server 8000

# Node
npx serve .
```

Then visit `http://localhost:8000`.

## Features implemented

- **Sticky, blurred header** that activates on scroll, with a mobile hamburger menu
- **Animated hero** with gradient text, a live particle-network canvas background, and a cursor-following glow
- **Feature grid** with mouse-tracking spotlight hover effect
- **3-step "how it works"** section
- **Interactive interview demo**
  - Typewriter-style bot replies
  - Typing indicator between messages
  - Quick-reply chips or free-text input
  - Progress bar synced to question count
  - Live-streaming blueprint panel (stack, roadmap, resume impact)
  - Restart flow that fully resets state and UI
- **Sample blueprint modal** — a static example blueprint for a recipe-sharing PWA, closable via button, backdrop click, or `Esc`
- **FAQ accordion**
- **Animated stat counters** (interview time, artifacts per run, blueprint accuracy) that count up when scrolled into view
- **Scroll-reveal animations** on all major sections
- Respects `prefers-reduced-motion` (disables animation timing)

## Customizing content

Everything text-based lives in `script.js` as plain data objects near the top of the file — edit these directly, no markup changes needed:

- `FEATURES` — the 6 feature cards
- `STEPS` — the 3-step workflow cards
- `FAQ` — question/answer pairs
- `QUESTIONS` — the interview script (id, bot message, quick-reply options, blueprint label)

The stack recommendation logic lives in `recommendStack()`, and the timeline-based roadmaps live in `generateRoadmap()` — both are plain functions you can extend with new cases.

## Known limitations

- The interview logic is a **client-side mock** — it pattern-matches your answers to canned stack/roadmap templates. It does not call any AI model or backend.
- The **Schema** and **Roadmap** tabs above the blueprint panel are visual only (not wired to switch views yet).
- No blueprint export (Markdown/PDF/share link) is implemented — this is referenced in the FAQ as a planned feature.

## Status

Private beta — interactive landing page only. Code generation / scaffolding is a planned later phase (see FAQ section on the page).
