# Personal Portfolio Website — Build Prompt

## Project Overview
Build a personal portfolio website for a developer. The site should feel confident, warm, and premium — not templated. It needs to support four core features that go beyond a static page: an About Me section, a certificates showcase, a dynamic resume upload/update feature, and a categorized tech stack section.

## Tech Stack
- Frontend: React with Next.js
- Backend/Database: Supabase (or Firebase as an alternative)
- Deployment target: standard responsive web app (desktop, tablet, mobile)

## Design System

### Color Palette
Use exactly these four colors, applied by role — do not introduce additional colors except standard system feedback states (error red, success green, warning yellow) where functionally needed:

| Name  | Hex       | Role                                              |
|-------|-----------|----------------------------------------------------|
| Paper | `#F6F4F1` | Primary background (~60% of the UI)                |
| Stone | `#E4DED2` | Secondary surfaces, section backgrounds, dividers (~30%) |
| Brown | `#704214` | Accent — CTAs, active states, highlights, small corner tabs on cards (~10%) |
| Black | `#000000` | Text, headings, high-contrast elements (footer, closing CTA band) |

### Typography
- Do not use system-default fonts (no Roboto, no Arial).
- Choose one or two deliberate typefaces with a clear type scale and intentional weights — not a generic default pairing.
- Body line length under 80 characters.

### Layout & Spacing Rules
- Minimum 120px padding top/bottom per section.
- Minimum 80px gap between major content blocks within a section.
- 40px gap between paragraph blocks.
- When in doubt, add more space, not less.
- Header/navigation is static — it should NOT stick or follow on scroll.
- No pill-shaped badges at the top of the header.
- Footer holds legal content and contact links.

### Visual Style
- Base style: minimalism, clean and calm.
- Layer in one distinctive visual device at high-impact zones only (for example: the brown offset-accent behind the hero photo, and small brown corner tabs on certificate and tech-stack cards) — do not spread this treatment across every element.
- No blue or purple gradients anywhere.
- No decorative gradients outside the defined color system.
- No emojis anywhere in the UI or copy.
- No em dashes in copy.
- Real written copy only — no lorem ipsum or placeholder filler in the final build.
- Skeleton loaders before content displays.
- Visible success states whenever a task completes (e.g. resume upload confirmation).
- Standard accessibility compliance: visible focus-visible outlines on every interactive element, styled to match the palette rather than left as browser default.

## Page Structure (Wireframe Reference)
Build the site in this section order:

1. **Header** — static, not sticky. Name/logo on the left, nav links on the right: Home, About, Certificates, Tech Stack, Resume, Contact.

2. **Hero Section** — Greeting + name, role tagline, short intro paragraph, two buttons ("View My Work" and "Download Resume"), portrait photo on the right with a brown rectangle offset behind it (peeking from the top-right corner).

3. **About Me** — Set on a Stone-colored section background. Photo on one side, narrative text plus a short highlight checklist on the other (e.g. years of experience, key strengths, what makes this person distinct).

4. **Certificates Showcase** — A card grid (not a plain list). Each card has an icon, a date, an award title, and a short description. Each card has a small brown tab in the top-right corner as a structural accent.

5. **Categorized Tech Stack** — Four category cards: Frontend, Backend, Data, Tools. Each card sits on a Stone background with a brown corner tab, an icon, a heading, and a row of skill chips (white chips on the stone card). This should read as an organized system, not a flat tag cloud.

6. **Resume Section** — Set on a Stone-colored section background. Shows a preview of the current resume file, a "Last updated [date]" label, a visible success indicator, and an "Upload / Replace" button that lets the site owner swap the file without touching code.

7. **Closing CTA Band** — Black background, Paper text, short invitation line, single "Contact" button in brown.

8. **Footer** — Same black background as the CTA band (reads as one continuous block). Name/role on the left, contact links (Email, LinkedIn, GitHub) on the right, legal/copyright line.

## Core Functional Requirements
1. **About Me** — editable content (can be hardcoded for v1, but structure the component so content could later move to the database).
2. **Certificates Showcase** — certificates should be manageable (add/edit/remove) from the database, not hardcoded, so new milestones can be posted without a code change.
3. **Dynamic Resume Upload** — the site owner should be able to upload a new resume file (PDF) through some authenticated interface, which replaces the current file and updates the "Last updated" date. The public-facing site always serves the current version.
4. **Categorized Tech Stack** — skills and their categories should be stored in the database so they can be added, removed, or recategorized without hardcoding, while still rendering into the grouped card layout above.

## What to Build First
Start with the responsive frontend using the wireframe structure above, styled with the design system. Use realistic placeholder copy that matches the tone of a professional portfolio (not lorem ipsum). Hold off on wiring up the database and upload functionality until the frontend layout and styling are approved — backend integration is a separate phase.