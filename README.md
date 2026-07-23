# Silsila — سلسلة

A single-page website for **Silsila**, a fictional Lebanese restaurant in Mar Mikhael, Beirut, built around a simple idea: every recipe on the menu carries the name of the person who gave it to the kitchen.

## Structure

```
.
├── index.html        Single-page site: hero, story, menu, gallery, reservations, visit
├── css/
│   └── styles.css    Design system (custom properties), layout, motion, responsive rules
├── js/
│   └── main.js        Nav, scroll reveals, ARIA tab menu, reservation form, hours logic
└── assets/            (reserved — all visuals are CSS/SVG, no external images)
```

No build step, no dependencies — plain HTML/CSS/JS, plus Google Fonts (Reem Kufi, Amiri, Jost) loaded via `<link>`.

## Design notes

- **Palette**: petrol teal, terracotta, brass gold, bougainvillea magenta and warm sand — Mediterranean dusk rather than cedar-and-flag cliché.
- **Type**: Reem Kufi (display, Arabic-Latin geometric) for headlines, Amiri for Arabic script accents, Jost for body copy.
- **Visuals**: every illustration (skyline, sunburst, arched window, gallery plates, street map) is hand-built SVG/CSS — no stock photography or placeholder boxes.
- **Motion**: IntersectionObserver-driven scroll reveals, hover lifts, animated nav underline; everything respects `prefers-reduced-motion`.
- **Accessibility**: skip link, semantic landmarks, ARIA tablist for the menu, labelled SVGs, visible focus states, an accessible form with inline validation and live-region status messages.

## Run locally

```
python3 -m http.server 8080
```

Then open `http://localhost:8080`.
