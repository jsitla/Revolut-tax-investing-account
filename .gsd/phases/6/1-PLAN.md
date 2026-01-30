---
phase: 6
plan: 1
wave: 1
---

# Plan 6.1: UX Improvements & Advanced Features

## Objective
Elevate the user experience with modern UI patterns, animations, and preview capabilities.

## Context
- User requested "significant improvements".
- Need to keep app lightweight but premium.
- Using `framer-motion` for animations and strict React patterns.

## Tasks

<task type="auto">
  <name>Install UI Dependencies</name>
  <files>package.json</files>
  <action>
    Install:
    - `framer-motion` (Animations)
    - `clsx`, `tailwind-merge` (Styling utils)
    - `lucide-react` (Better icons)
  </action>
  <verify>npm list framer-motion</verify>
  <done>Deps installed</done>
</task>

<task type="auto">
  <name>Implement Tabs & Animations</name>
  <files>src/components/Dashboard.tsx</files>
  <action>
    Refactor Dashboard:
    - Use `AnimatePresence` and `motion.div` for page transitions.
    - Create a Tab navigation for "Prodaje", "Dividende", "Povzetek".
  </action>
  <verify>grep "motion.div" src/components/Dashboard.tsx</verify>
  <done>Tabs implemented</done>
</task>

<task type="auto">
  <name>Implement XML Preview</name>
  <files>src/components/XMLPreview.tsx</files>
  <action>
    Create a Modal/Dialog component:
    - Display XML string in a `<pre>`.
    - "Copy to Clipboard" button.
    - "Download" button.
  </action>
  <verify>Test-Path src/components/XMLPreview.tsx</verify>
  <done>Preview implemented</done>
</task>

## Success Criteria
- [ ] Dashboard transitions are smooth
- [ ] Users can preview XML before downloading
- [ ] UI looks significantly more polished
