---
phase: 1
plan: 2
wave: 1
---

# Plan 1.2: Install Dependencies & Configure Tailwind

## Objective
Install all required npm packages and configure Tailwind CSS.

## Context
- .gsd/SPEC.md
- .gsd/phases/1/1-PLAN.md (depends on)

## Tasks

<task type="auto">
  <name>Install npm dependencies</name>
  <files>package.json, package-lock.json</files>
  <action>
    Run npm install to get base dependencies, then add project-specific ones:
    ```
    npm install
    npm install papaparse file-saver
    npm install -D @types/papaparse @types/file-saver tailwindcss postcss autoprefixer
    ```
  </action>
  <verify>Test-Path "node_modules/papaparse"</verify>
  <done>papaparse and file-saver installed in node_modules</done>
</task>

<task type="auto">
  <name>Initialize Tailwind CSS</name>
  <files>tailwind.config.js, postcss.config.js</files>
  <action>
    Run `npx tailwindcss init -p` to create config files.
    Update tailwind.config.js content paths:
    ```js
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ]
    ```
  </action>
  <verify>Test-Path "tailwind.config.js"</verify>
  <done>tailwind.config.js exists with correct content paths</done>
</task>

<task type="auto">
  <name>Add Tailwind directives to CSS</name>
  <files>src/index.css</files>
  <action>
    Replace src/index.css content with Tailwind directives:
    ```css
    @tailwind base;
    @tailwind components;
    @tailwind utilities;
    ```
  </action>
  <verify>Select-String -Path "src/index.css" -Pattern "@tailwind"</verify>
  <done>src/index.css contains @tailwind directives</done>
</task>

## Success Criteria
- [ ] npm install completes without errors
- [ ] tailwind.config.js exists
- [ ] src/index.css contains Tailwind directives
- [ ] `npm run dev` starts without errors
