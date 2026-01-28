---
phase: 3
plan: 1
wave: 1
---

# Plan 3.1: File Uploader & App Integration

## Objective
Create a drag & drop file uploader and integrate it into the main App component to handle state.

## Context
- .gsd/SPEC.md
- src/App.tsx
- src/utils/parser.ts

## Tasks

<task type="auto">
  <name>Create FileUploader Component</name>
  <files>src/components/FileUploader.tsx</files>
  <action>
    Create a component with:
    - Drag & drop zone (HTML5 drag events).
    - File reading mechanism (FileReader API).
    - Integration with `parseRevolutExport`.
    - Props: `onUpload(data: RevolutExport)`.
    - UI: Dashed border, hover state, "Click or drag file here" text.
  </action>
  <verify>Test-Path "src/components/FileUploader.tsx"</verify>
  <done>Component exists and exports default</done>
</task>

<task type="auto">
  <name>Integrate into App.tsx</name>
  <files>src/App.tsx</files>
  <action>
    - Add state: `data` (RevolutExport | null).
    - Render `FileUploader` when `data` is null.
    - Render simple "Data Loaded: X trades" placeholder when `data` is present (Dashboard comes in next plan).
    - Handle `onUpload` to set state.
  </action>
  <verify>Select-String -Path "src/App.tsx" -Pattern "FileUploader"</verify>
  <done>App uses FileUploader</done>
</task>

## Success Criteria
- [ ] User can drag a CSV file onto the UI
- [ ] App state updates with parsed data on drop
