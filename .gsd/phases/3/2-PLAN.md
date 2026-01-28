---
phase: 3
plan: 2
wave: 1
---

# Plan 3.2: Dashboard UI Components

## Objective
Implement the main dashboard view with year selection, summary cards, and data tables.

## Context
- .gsd/phases/3/1-PLAN.md (Integration point)
- src/types/revolut.ts

## Tasks

<task type="auto">
  <name>Create UI Components</name>
  <files>src/components/YearSelector.tsx, src/components/SummaryCards.tsx, src/components/Tables.tsx, src/components/Dashboard.tsx</files>
  <action>
    Create sub-components:
    - YearSelector: simple pill/button list of years.
    - SummaryCards: Stats display (Total Trade PnL, Dividends, Tax).
    - Tables: TradesTable and DividendsTable (Tailwind styled).
    - Dashboard: Orchestrator component. Manages `year` state. Calls `filterByYear`.
  </action>
  <verify>Test-Path "src/components/Dashboard.tsx"</verify>
  <done>All components created</done>
</task>

<task type="auto">
  <name>Integrate Dashboard into App</name>
  <files>src/App.tsx</files>
  <action>
    Replace the "Data Loaded" placeholder with `<Dashboard data={data} />`.
    Add a "Reset" button to App header/footer to clear data and return to upload screen.
  </action>
  <verify>Select-String -Path "src/App.tsx" -Pattern "Dashboard"</verify>
  <done>App renders Dashboard</done>
</task>

## Success Criteria
- [ ] Dashboard shows correct summary numbers
- [ ] Changing year filters the data visible in tables
- [ ] Tables are styled and readable
