---
phase: 5
plan: 1
wave: 1
---

# Plan 5.1: Final Polish & Documentation

## Objective
Finalize the application with proper metadata, documentation, and a polished user experience.

## Context
- Phase 4 Complete
- Need to ensure user trust (Privacy focus)

## Tasks

<task type="auto">
  <name>Update HTML Metadata</name>
  <files>index.html</files>
  <action>
    - Set title to "Revolut FURS Poročanje".
    - Add meta description.
    - Add FURS/Slovenia flag favicon (using SVG data URI or external link if possible, or simple generic money icon).
  </action>
  <verify>Select-String -Path "index.html" -Pattern "Revolut FURS"</verify>
  <done>HTML updated</done>
</task>

<task type="auto">
  <name>Create README.md</name>
  <files>README.md</files>
  <action>
    Create comprehensive documentation:
    - **Instructions**: How to export from Revolut (Trading Statement).
    - **Usage**: Drag & Drop -> Review -> Download.
    - **Privacy**: Explicitly state that data never leaves the browser.
    - **Disclaimer**: Not official tax advice.
  </action>
  <verify>Test-Path "README.md"</verify>
  <done>README exists</done>
</task>

<task type="auto">
  <name>UI Final Polish</name>
  <files>src/App.tsx, src/components/Dashboard.tsx</files>
  <action>
    - Add Footer with "Made with ❤️ for crypto/stock traders".
    - Ensure "Reset" button is prominent enough.
    - Check Mobile responsiveness one last time.
  </action>
  <verify>Select-String -Path "src/App.tsx" -Pattern "footer"</verify>
  <done>UI polished</done>
</task>

## Success Criteria
- [ ] README provides clear instructions for end-users
- [ ] Application title and metadata are correct
- [ ] UI looks finished (no placeholders)
