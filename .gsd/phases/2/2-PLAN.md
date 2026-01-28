---
phase: 2
plan: 2
wave: 1
---

# Plan 2.2: Implement Data Model & Parser

## Objective
Define TypeScript interfaces and implement the Revolut CSV parser logic.

## Context
- .gsd/SPEC.md (Input format)
- Sample data from brief:
  - "Income from Sells" section
  - "Other income & fees" section

## Tasks

<task type="auto">
  <name>Define TypeScript Interfaces</name>
  <files>src/types/revolut.ts</files>
  <action>
    Create interfaces:
    - `RevolutTrade`: Date acquired, Date sold, Symbol, ISIN, Quantity, Cost basis, Gross proceeds, Currency
    - `RevolutDividend`: Date, Symbol, ISIN, Gross amount, Withholding tax, Currency
    - `RevolutExport`: trades: RevolutTrade[], dividends: RevolutDividend[]
  </action>
  <verify>Test-Path "src/types/revolut.ts"</verify>
  <done>File exists with exported interfaces</done>
</task>

<task type="auto">
  <name>Implement Parser Logic</name>
  <files>src/utils/parser.ts</files>
  <action>
    Implement `parseRevolutExport(csvContent: string): RevolutExport`
    Logic:
    1. Parse full CSV using PapaParse
    2. Split data into sections based on headers ("Income from Sells", "Other income & fees")
    3. Map "Income from Sells" rows to `RevolutTrade`
    4. Map "Other income & fees" rows to `RevolutDividend` (filter key: "Type" or similar, or just map all and filter later. Brief says "Other income" has specific fields different from Sells.)
       *Correction*: "Other income" rows in brief don't have explicit "Type" column in the example, but Account Statement does. The Trading Statement example shows "Symbol, Security name, ISIN...". We need to be careful identifying Dividends vs Custody fees if they share this table. We will map all valid rows that look like dividends.
  </action>
  <verify>Test-Path "src/utils/parser.ts"</verify>
  <done>File exists with exported function</done>
</task>

<task type="auto">
  <name>Create Unit Tests</name>
  <files>src/utils/parser.test.ts</files>
  <action>
    Create tests using sample data from brief.
    - Test Case 1: Parse "Income from Sells" correctly (NVDA example)
    - Test Case 2: Parse "Other income & fees" correctly (TSM Dividend example)
    - Test Case 3: Handle numeric formatting (currency symbols, commas)
  </action>
  <verify>Test-Path "src/utils/parser.test.ts"</verify>
  <done>Test file created</done>
</task>

## Success Criteria
- [ ] All unit tests pass (`npm run test`)
- [ ] Parser correctly handles the provided sample inputs
