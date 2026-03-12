# Draft: Gestione Committenti (Self-Service)

## Requirements (confirmed)
- Admin should be able to add/remove committenti from the admin panel — no code changes needed
- List stored in Google Sheets (new tab in existing spreadsheet)
- Form dropdown reads dynamically from Google Sheets instead of hardcoded array
- Access restricted to admin panel only (existing password protection)

## Technical Decisions
- **Storage**: New "COMMITTENTI" tab in existing Google Sheet (`1CMlvDX86A2gJUcckjwBWvANKbXlAeYcyjGhnM955fQw`)
- **API**: n8n webhook(s) to read/write the COMMITTENTI tab
- **Form**: Replace hardcoded `COMMITTENTI` import with dynamic fetch on mount
- **Fallback**: Keep hardcoded array as fallback if fetch fails
- **Admin UI**: New "Gestione Committenti" section in admin area

## Current Architecture
- `COMMITTENTI` array: `src/constants/formOptions.ts` (lines 25-40, 14 entries)
- Imported by: `components/StudioInformationStep.tsx` (line 8)
- Used in dropdown: `StudioInformationStep.tsx` (lines 82-84)
- Admin panel: `components/AdminBilling.tsx` (doesn't use COMMITTENTI array)
- Google Sheet ID: `1CMlvDX86A2gJUcckjwBWvANKbXlAeYcyjGhnM955fQw`
- Existing n8n workflow: `4thMwDmBvacFEGNZ` (main), `7DUsuL7VeiBObF3l` (billing)

## Scope Boundaries
- INCLUDE: Google Sheet tab, n8n webhooks, admin CRUD UI, dynamic form fetch
- EXCLUDE: Authentication changes, new npm dependencies, changes to components/ui/

## Open Questions
- None — all requirements clear

## Test Strategy
- No test infrastructure in project
- QA scenarios only (Playwright for UI, curl for API)
