# Gestione Committenti — Learnings

## [2026-03-12] Session: ses_32cd5f3ceffeDTexUd5Fzlt00V — Initial Setup

### Project Context
- Project: Drivers Company logistics form — React SPA, Vite, TypeScript strict
- Live: https://driverscompany.vercel.app
- Main n8n workflow: `4thMwDmBvacFEGNZ` (dental-logistics webhook)
- Billing n8n workflow: `7DUsuL7VeiBObF3l` (dental-logistics-billing GET endpoint) — use as pattern
- Google Sheets spreadsheet ID: `1CMlvDX86A2gJUcckjwBWvANKbXlAeYcyjGhnM955fQw`
- Existing sheet tab: "Logistica" (gid: 653702461) — DO NOT TOUCH
- Google Sheets credential: `googleSheetsOAuth2Api`, ID: `ZcD9zgNs6CVlHKcT`, name: "Google Sheets account"

### Codebase Conventions
- Components live at /components/ (project root), NOT in src/
- Import from components to src: `'../src/services/localStorage'`
- Import from page.tsx to components: `'../../components/ComponentName'`
- All user-facing text MUST be in Italian
- No `as any`, no `@ts-ignore`, no react-router, no new npm dependencies
- Do NOT touch `components/ui/*.tsx`
- No `console.log` in new code (except existing ones in page.tsx)
- Build command: `npm run build` (exit 0 = success)
- No test framework in project

### n8n Patterns
- n8n naming convention: `[DriversCompany] ...`
- Google Sheets node typeVersion: 3 with `__rl` resource locator format:
  `{ "__rl": true, "value": "SPREADSHEET_ID", "mode": "list", "cachedResultName": "DriversCompany Form" }`
- Credential reference format: `{ "googleSheetsOAuth2Api": { "id": "ZcD9zgNs6CVlHKcT", "name": "Google Sheets account" } }`
- Use `responseMode: "responseNode"` on webhooks + a "Respond to Webhook" node
- Billing API workflow pattern: Webhook → Google Sheets Read → Code (transform) → Respond

### Current COMMITTENTI List (14 entries, alphabetically sorted)
Bravin, Creattiva, Delpin, Dentalica, Dentalline, Dentaltre, Lovato, Mangione, Orodental, Ortolab, Pascolo, Saccher, Syntesis, Unident

### Admin Password
The admin panel is password-protected with: `Drivers123@`
(from StudioInformationStep or page.tsx — existing auth, do not change)

### Client-features (previous plan — COMPLETED)
All 14 tasks done. Key files:
- src/types/storage.ts — StorageSchema, SavedSubmission, etc.
- src/services/localStorage.ts — full CRUD for localStorage
- components/SubmissionHistory.tsx — submission history view
- components/AdminBilling.tsx — billing dashboard (517 lines)
- viewMode: 'form' | 'history' | 'admin' in src/app/page.tsx
Latest commit: b98ba1a feat(history): submission history view with save and display

## [2026-03-12] Task 1: Seed COMMITTENTI Tab
- Workflow ID: 6YEI0aAF3VNMvw0Q
- Workflow Name: [DriversCompany] Committenti Seed
- Status: CREATED (not executed due to webhook registration issue)
- Nodes: 4 (Webhook, Code, Create Sheet, Append Rows)
- Seed webhook path: committenti-seed
- COMMITTENTI tab: Not created (workflow not executed)
- Committenti count: 14 (configured in Code node)
- Issue: n8n webhook registration system requires manual UI trigger
  - Attempted multiple approaches: direct curl, test_workflow, browser automation
  - All failed due to webhook not being registered in n8n instance
  - Webhook registration appears to require manual UI interaction
  - n8n UI requires authentication (not available)
- Workaround needed: Manually trigger workflow from n8n UI or use alternative seeding method
- Evidence saved to: .sisyphus/evidence/task-1-seed-verification.json
