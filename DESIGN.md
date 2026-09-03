# Design Brief

## Direction

Aero Mission Control — a professional dark aerospace digital-twin dashboard for real-time MALE UAV piston engine health monitoring, built like a flight-instrument panel.

## Tone

Dark, precise, mission-critical: deep near-black blue-steel surfaces with metallic panels, glowing cyan telemetry, and amber warning highlights — calm instrument clarity, not flashy decoration.

## Differentiation

Every data surface reads like a real flight instrument: mono-font telemetry readouts, cyan glow on live channels, amber pulse on warnings, and a scan-sweep animation that makes the 3D twin feel actively monitored.

## Color Palette

| Token      | OKLCH           | Role                          |
| ---------- | --------------- | ----------------------------- |
| background | 0.12 0.012 240  | deep near-black mission deck  |
| foreground | 0.93 0.01 240   | cool near-white text          |
| card       | 0.15 0.014 240  | metallic panel surface        |
| primary    | 0.72 0.14 195   | glowing cyan telemetry        |
| accent     | 0.78 0.13 75    | amber warning highlight       |
| muted      | 0.19 0.016 240  | raised metallic surface       |
| destructive| 0.58 0.21 22    | critical fault red            |
| success    | 0.62 0.16 150   | nominal / healthy green       |
| warning    | 0.78 0.13 75    | caution amber                 |

## Typography

- Display: Space Grotesk — instrument headings, health score, section titles
- Body: DM Sans — UI labels, descriptions, nav
- Mono: JetBrains Mono — telemetry values, sensor readouts, timestamps, gauges
- Scale: hero text-4xl/6xl font-bold tracking-tight, h2 text-2xl/3xl, label text-xs font-semibold tracking-widest uppercase, body text-sm/base

## Elevation & Depth

Layered metallic surfaces: flat near-black background, slightly raised card panels with subtle borders, elevated shadow for modals and the health-score hero card.

## Structural Zones

| Zone     | Background        | Border   | Notes                                  |
| -------- | ----------------- | -------- | -------------------------------------- |
| Header   | bg-card           | border-b | mission title + phase + status         |
| Sidebar  | bg-sidebar        | border-r | nav rail, mission controls             |
| Content  | bg-background     | —        | 3D twin + gauges, alternating bg-muted |
| Footer   | bg-muted/40       | border-t | synthetic/demo data disclaimer         |

## Spacing & Rhythm

Section gaps p-6/8, tight card padding p-4/5, mono readouts grouped with 2px gap for instrument density, generous whitespace around the 3D twin.

## Component Patterns

- Buttons: rounded-md, primary cyan gradient, amber for caution actions, destructive red for reset
- Cards: rounded-md, bg-card, border-border, shadow-subtle
- Badges: rounded-full, cyan/green for nominal, amber for caution, red for critical

## Motion

- Entrance: telemetry-fade 0.4s on panel load
- Hover: transition-smooth on interactive surfaces
- Decorative: fault-pulse on warning badges, scan-sweep across the 3D twin viewport

## Constraints

- Dark mode only (mission-control aesthetic)
- Synthetic/demo data clearly labeled throughout
- Token-only styling — no raw color literals in components
- Mono font for all live telemetry values

## Engine Visual Direction — HE 580 Boxer (3D twin)

Procedural react-three-fiber engine (box/cylinder primitives, no GLB). Props (rpm/running/faults) + animation/sensor-sync contract are pinned — do not change. Keep dark background. WebGL materials use literal OKLCH (Canvas cannot resolve CSS vars); tokens below are canonical.
| Material       | OKLCH          | metal | rough | Use                              |
| -------------- | -------------- | ----- | ----- | -------------------------------- |
| crankcase      | 0.72 0.02 240  | 0.9   | 0.35  | central silver/grey case         |
| fins           | 0.65 0.015 240 | 0.8   | 0.45  | cooling fins (matte silver)      |
| fins-dark      | 0.55 0.012 240 | 0.7   | 0.55  | fin gaps / shadow between ribs   |
| head           | 0.22 0.01 250  | 0.7   | 0.5   | dark cylinder head covers        |
| hub            | 0.78 0.02 240  | 0.95  | 0.25  | polished circular propeller hub  |
| hub-dark       | 0.4 0.012 250  | 0.85  | 0.4   | hub recess / spinner detail      |
| carb           | 0.3 0.01 250   | 0.75  | 0.5   | lower-mounted carburetor body    |
| gold           | 0.72 0.13 75   | 0.9   | 0.3   | hub mounting hardware, accents   |
| red            | 0.58 0.21 22   | 0.6   | 0.5   | carb accent, fault detail        |
| telemetry-glow | 0.72 0.14 195  | —     | —     | cyan emissive when running/heat  |
| warning-glow   | 0.78 0.13 75   | —     | —     | amber emissive on caution        |
Geometry: Crankcase = central rounded box along X (engine axis). Two cylinders per side opposed across the crankcase: left bank (+X) and right bank (−X), each with two cylinders stacked along Z (front/back). Each cylinder = dark head cover box on the outboard face + a barrel wrapped in 3–5 thin silver fin slabs (fins) separated by thin dark gaps (fins-dark), fins perpendicular to the barrel axis. Propeller hub = circular cylinder at the front (−Z face), polished silver with recessed dark spinner cap + gold mounting bolts around the rim. Carburetor = small dark body mounted low on the crankcase underside (Y down), red accent. Orientation: engine axis along X, propeller faces the viewer at front, cylinders splay left/right.
Constraints: dark background preserved; rpm/running/faults drive propeller spin, fin/crankcase emissive heat glow (cyan), fault flash (amber/red); token-only styling for UI, literal OKLCH allowed inside WebGL materials only.

## Signature Detail

The scan-sweep light across the 3D engine viewport plus mono telemetry readouts make the digital twin feel like a live instrument, not a mockup.
