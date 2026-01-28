---
phase: 4
plan: 2
wave: 1
---

# Plan 4.2: Dashboard Integration and Download Flow

## Objective
Add download functionality to the UI allowing users to export their tax reports.

## Context
- src/components/Dashboard.tsx
- src/utils/xml-builder.ts

## Tasks

<task type="auto">
  <name>Add Export UI to Dashboard</name>
  <files>src/components/Dashboard.tsx</files>
  <action>
    - Add "Prenesi XML za FURS" buttons to summary or table headers.
    - One button for Doh-KDVP (Capital Gains).
    - One button for Doh-Div (Dividends).
    - Styled as primary action buttons (vibrant colors/gradients).
  </action>
  <verify>Select-String -Path "src/components/Dashboard.tsx" -Pattern "Prenesi XML"</verify>
  <done>Buttons added to UI</done>
</task>

<task type="auto">
  <name>Implement Download Logic</name>
  <files>src/components/Dashboard.tsx</files>
  <action>
    - Import `saveAs` from `file-saver`.
    - Import `generateKDVPXml` and `generateDivXml`.
    - Function `handleDownloadKDVP`: generate XML then `saveAs(blob, 'Doh-KDVP-YEAR.xml')`.
    - Function `handleDownloadDiv`: generate XML then `saveAs(blob, 'Doh-Div-YEAR.xml')`.
  </action>
  <verify>Select-String -Path "src/components/Dashboard.tsx" -Pattern "saveAs"</verify>
  <done>Download logic functional</done>
</task>

## Success Criteria
- [ ] User can click buttons to trigger browser file download
- [ ] Downloaded file contains XML content
