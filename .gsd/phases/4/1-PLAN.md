---
phase: 4
plan: 1
wave: 1
---

# Plan 4.1: XML Templates and Building Logic

## Objective
Implement core logic to transform Revolut data into FURS-compatible XML formats.

## Context
- Phase 2 Parser outputs
- FURS XML Research results

## Tasks

<task type="auto">
  <name>Define XML Building Utilities</name>
  <files>src/utils/xml-builder.ts</files>
  <action>
    Implement functions:
    - `generateKDVPXml(trades: RevolutTrade[], year: number): string`
    - `generateDivXml(dividends: RevolutDividend[], year: number): string`
    - Helper for FURS ElectronicDeclaration header.
    - Helper to sanitize XML strings.
  </action>
  <verify>Test-Path "src/utils/xml-builder.ts"</verify>
  <done>Utilities implemented</done>
</task>

<task type="auto">
  <name>Create Unit Tests for XML Builder</name>
  <files>src/utils/xml-builder.test.ts</files>
  <action>
    Verify generated XML structure:
    - Check root element tags.
    - Verify mandatory fields (ISIN, Date, Amount) are present.
    - Check for correct year in header.
  </action>
  <verify>npm run test src/utils/xml-builder.test.ts</verify>
  <done>Tests pass</done>
</task>

## Success Criteria
- [ ] XML strings are generated without syntax errors
- [ ] Essential data fields from Revolut trades/dividends are correctly mapped to XML elements
