# Client Feature Requests — Drivers Company Logistics

## TL;DR

> **Quick Summary**: Implement 5 client-requested features for the Drivers Company logistics form: localStorage persistence (sender profiles + recipient address book), notes field in UI + backend, structured opening hours dropdown, admin billing dashboard, and submission history view.
> 
> **Deliverables**:
> - localStorage service with versioned schema for sender profiles, recipient address book, and submission history
> - Notes textarea rendered in Step 1 + notes mapped through n8n to Google Sheets + emails
> - 7-day structured opening hours component replacing free text input
> - Admin billing dashboard page reading delivery data from Google Sheets via new n8n endpoint
> - Submission history view ("Storico Richieste") showing last 50 submissions with full details
> - Updated n8n workflow with notes column mapping + new read-only billing endpoint
> 
> **Estimated Effort**: Large
> **Parallel Execution**: YES — 4 waves
> **Critical Path**: Task 1 (localStorage service) → Task 7 (auto-populate) → Task 10 (submission history) → Task 14 (final integration QA)

---

## Context

### Original Request
Client ("Luca") forwarded user survey feedback requesting 5 features for the Drivers Company logistics web form. All dental studio users want data persistence to avoid re-entering information. Additional requests for notes, structured hours, billing management, and delivery history visibility.

### Interview Summary
**Key Discussions**:
- **Persistence approach**: localStorage chosen over auth+database — dental studios use same office PC, no need for cross-device sync
- **Notes destination**: Both Google Sheets (new column) AND email templates (notification + confirmation)
- **Billing scope**: Admin page in the React app with per-client monthly counters, per-service cost, and total taxable calculation
- **History depth**: Last 50 submissions stored in localStorage with FIFO eviction
- **Priority**: All 5 features at once in parallel waves

**Research Findings**:
- `FormData.notes` already exists in types (`src/types/form.ts:29`) and defaults (`src/constants/formOptions.ts:21`) but is never rendered in the UI — REQ-2 is partially done
- `studioHours` is NOT mapped to any Google Sheets column in the n8n Transform Data node — only exists in raw webhook body
- No routing library exists — app uses `currentStep` state for navigation. Admin page and history view will use a top-level `viewMode` state
- shadcn/ui checkbox component already exists (`components/ui/checkbox.tsx`) — useful for the 7-day hours component
- The n8n workflow is write-only (form → Sheets). Billing needs a new read endpoint

### Self-Performed Gap Analysis (Metis timed out)
**Identified Gaps** (addressed):
- **Google Sheets reading for billing**: No read capability exists. Resolved by adding a new n8n webhook endpoint that queries Sheets and returns JSON
- **Admin access control**: No auth system. Resolved with URL-based access + optional simple PIN
- **No routing library**: Resolved with state-based view switching (`viewMode` state) instead of adding react-router
- **localStorage schema versioning**: Risk of breaking on schema changes. Resolved by including a `version` key in all localStorage entries
- **studioHours validation change**: Currently validates non-empty string. Resolved by updating validation to check structured object has at least one day selected

---

## Work Objectives

### Core Objective
Add data persistence, notes field, structured hours, billing dashboard, and submission history to the Drivers Company logistics form while maintaining the existing SPA architecture and Italian-language UI.

### Concrete Deliverables
- `src/services/localStorage.ts` — Versioned localStorage service (profiles, address book, submissions, billing config)
- Notes `<Textarea>` in `StudioInformationStep.tsx` + n8n Transform Data mapping + email template updates
- `components/StudioHoursSelector.tsx` — 7-day structured hours component
- `components/SubmissionHistory.tsx` — Last 50 submissions view with expandable details
- `components/AdminBilling.tsx` — Billing dashboard with per-client counters, cost config, totals
- New n8n webhook endpoint at `/webhook/dental-logistics-billing` for reading Sheets data
- Updated n8n Transform Data node with `NOTE_GENERALI` column
- Updated n8n email templates with notes section

### Definition of Done
- [ ] `npm run build` succeeds with zero errors
- [ ] Form submission still works end-to-end (POST to webhook, receive confirmation)
- [ ] Sender data persists across browser refreshes (localStorage)
- [ ] Recipient address book saves and loads previously used recipients
- [ ] Notes field visible in Step 1, appears in Google Sheet and emails after submission
- [ ] Opening hours uses structured 7-day selector, serializes for webhook
- [ ] Last 50 submissions visible in "Storico Richieste" view
- [ ] Admin billing page shows per-client delivery counts and costs
- [ ] All UI text is in Italian

### Must Have
- All form data saved/loaded from localStorage
- Backward compatibility — existing form submission flow unchanged
- Italian language for all new UI elements
- Versioned localStorage schema (for future migration)
- Notes mapped to both Google Sheets column AND email templates

### Must NOT Have (Guardrails)
- **No authentication system** — no login pages, no JWT, no sessions
- **No external database** — all client-side data in localStorage only
- **No react-router** — use state-based view switching, not URL routing
- **No new npm dependencies** for core features (use existing shadcn/ui + Radix primitives)
- **No modifications to the existing Google Sheet structure** except adding new columns via n8n
- **No `as any` or `@ts-ignore`** — maintain TypeScript strict mode
- **No English-language UI text** — all user-facing strings in Italian
- **No console.log in production** except existing ones in page.tsx (don't add new ones)
- **Do NOT touch `components/ui/*.tsx`** — shadcn primitives are stable

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: NO
- **Automated tests**: None (no test framework configured)
- **Framework**: None
- **Note**: All verification relies on agent-executed QA scenarios

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use Playwright — Navigate to localhost, interact with form, assert DOM, screenshot
- **n8n Workflow**: Use Bash (curl) — Send webhook requests, assert response JSON
- **localStorage**: Use Playwright `browser_evaluate` — Check localStorage keys/values
- **Build**: Use Bash — `npm run build`, verify zero errors

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation — start immediately, all independent):
├── Task 1: localStorage service + types [quick]
├── Task 2: Notes textarea in Step 1 UI [quick]
├── Task 3: StudioHoursSelector component [unspecified-high]
├── Task 4: View mode navigation (main/history/admin) [quick]
├── Task 5: n8n — Add notes to Transform Data + Sheets [quick]
└── Task 6: n8n — Add notes to email templates [quick]

Wave 2 (Core features — depends on Wave 1):
├── Task 7: Auto-populate form from localStorage profiles (depends: 1) [unspecified-high]
├── Task 8: Recipient address book — save/load/pick (depends: 1) [unspecified-high]
├── Task 9: Integrate StudioHoursSelector + localStorage (depends: 1, 3) [quick]
├── Task 10: Submission history — save + display (depends: 1, 4) [unspecified-high]
└── Task 11: n8n — New billing read endpoint (depends: none, but logically Wave 2) [unspecified-high]

Wave 3 (Admin + Integration — depends on Wave 2):
├── Task 12: Admin billing dashboard UI (depends: 4, 11) [unspecified-high]
├── Task 13: Save submission on successful POST (depends: 7, 8, 10) [quick]
└── Task 14: Update ARCHITECTURE.md with new features [writing]

Wave FINAL (Verification — after ALL tasks):
├── Task F1: Plan compliance audit [oracle]
├── Task F2: Code quality review + build verification [unspecified-high]
├── Task F3: Full QA — Playwright end-to-end [unspecified-high]
└── Task F4: Scope fidelity check [deep]

Critical Path: Task 1 → Task 7 → Task 13 → F1-F4
Parallel Speedup: ~60% faster than sequential
Max Concurrent: 6 (Wave 1)
```

### Dependency Matrix

| Task | Depends On | Blocks | Wave |
|------|-----------|--------|------|
| 1 | — | 7, 8, 9, 10, 13 | 1 |
| 2 | — | — | 1 |
| 3 | — | 9 | 1 |
| 4 | — | 10, 12 | 1 |
| 5 | — | — | 1 |
| 6 | — | — | 1 |
| 7 | 1 | 13 | 2 |
| 8 | 1 | 13 | 2 |
| 9 | 1, 3 | — | 2 |
| 10 | 1, 4 | 13 | 2 |
| 11 | — | 12 | 2 |
| 12 | 4, 11 | — | 3 |
| 13 | 7, 8, 10 | — | 3 |
| 14 | all | — | 3 |
| F1-F4 | all | — | FINAL |

### Agent Dispatch Summary

- **Wave 1**: **6 tasks** — T1 → `quick`, T2 → `quick`, T3 → `unspecified-high`, T4 → `quick`, T5 → `quick`, T6 → `quick`
- **Wave 2**: **5 tasks** — T7 → `unspecified-high`, T8 → `unspecified-high`, T9 → `quick`, T10 → `unspecified-high`, T11 → `unspecified-high`
- **Wave 3**: **3 tasks** — T12 → `unspecified-high`, T13 → `quick`, T14 → `writing`
- **FINAL**: **4 tasks** — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high` + `playwright`, F4 → `deep`

---

## TODOs

- [ ] 1. **localStorage Service + Storage Types**

  **What to do**:
  - Create `src/types/storage.ts` with interfaces: StorageSchema, SenderProfile, SavedRecipient, SavedSubmission, StructuredHours, DayOfWeek, BillingConfig
  - Create `src/services/localStorage.ts` with: getStorage(), saveSenderProfile(), getSenderProfile(), saveRecipient(), getAddressBook(), removeRecipient(), saveSubmission() (FIFO max 50), getSubmissions(), saveBillingConfig(), getBillingConfig(), clearAll()
  - STORAGE_VERSION = 1 constant, migration stub, try/catch on all reads, storage key: `drivers_company_data`

  **Must NOT do**: Don't import/use in components yet, no UI, no `as any`

  **Recommended Agent Profile**: Category: `quick`, Skills: []

  **Parallelization**: Wave 1, blocks 7/8/9/10/13, blocked by none

  **References**:
  - `src/types/form.ts` — interface patterns (FormData:15-30, Recipient:6-13)
  - `src/constants/formOptions.ts` — defaults pattern (initialFormData)

  **Acceptance Criteria**:
  - [ ] Files exist: `src/types/storage.ts`, `src/services/localStorage.ts`
  - [ ] `npm run build` succeeds

  **QA Scenarios:**
  ```
  Scenario: Fresh storage returns defaults
    Tool: Playwright (browser_evaluate)
    Steps: Clear localStorage, call getStorage(), assert version===1 and empty arrays
    Evidence: .sisyphus/evidence/task-1-fresh-storage.json

  Scenario: Corrupted localStorage returns defaults gracefully
    Tool: Playwright (browser_evaluate)
    Steps: Set drivers_company_data to invalid JSON, call getStorage(), assert no crash
    Evidence: .sisyphus/evidence/task-1-corrupted-storage.json
  ```

  **Commit**: `feat(storage): add versioned localStorage service with types` — `src/services/localStorage.ts`, `src/types/storage.ts`

---

- [ ] 2. **Notes Textarea in Step 1 UI**

  **What to do**:
  - In `components/StudioInformationStep.tsx`, add `<Textarea>` for `formData.notes` AFTER pickup info section, BEFORE blue notice (line ~200)
  - Label: "Note generali (opzionale)", Placeholder: "Es. Informazioni aggiuntive per il ritiro o la consegna"
  - Helper: "Eventuali note aggiuntive per il nostro team". Optional — no validation.
  - `Textarea` already imported on line 6. `onInputChange` already supports notes field.

  **Must NOT do**: No validation for notes, don't modify form.ts, don't touch n8n

  **Recommended Agent Profile**: Category: `quick`, Skills: []

  **Parallelization**: Wave 1, blocks none, blocked by none

  **References**:
  - `components/StudioInformationStep.tsx:137-155` — pickupLocation Textarea pattern to copy
  - `src/types/form.ts:29` — notes field already exists in FormData

  **Acceptance Criteria**:
  - [ ] Notes textarea visible in Step 1 between pickup info and blue notice
  - [ ] `npm run build` succeeds

  **QA Scenarios:**
  ```
  Scenario: Notes textarea visible and functional
    Tool: Playwright
    Steps: Navigate to localhost:5173, assert textarea#notes exists, type text, take screenshot
    Evidence: .sisyphus/evidence/task-2-notes-visible.png

  Scenario: Notes is optional (form validates without it)
    Tool: Playwright
    Steps: Fill all required Step 1 fields, leave notes empty, click Continua, assert Step 2 shows
    Evidence: .sisyphus/evidence/task-2-notes-optional.png
  ```

  **Commit**: `feat(ui): render notes textarea in Step 1` — `components/StudioInformationStep.tsx`

---

- [ ] 3. **StudioHoursSelector Component**

  **What to do**:
  - Create `components/StudioHoursSelector.tsx` — 7 rows (Lunedì-Domenica)
  - Each row: checkbox (use `components/ui/checkbox.tsx`) + day label + two time `<select>` (open/close, 30-min intervals 06:00-22:00)
  - Default: Mon-Fri checked 09:00-18:00, Sat-Sun unchecked
  - Output: `StructuredHours` object. Include `serializeHours()` for webhook backward compat
  - Props: `{ value: StructuredHours; onChange: (hours: StructuredHours) => void; error?: string }`
  - Match styling: border-2, rounded-xl, h-14 selects, responsive grid

  **Must NOT do**: Don't integrate into StudioInformationStep (Task 9), don't import localStorage, no external time picker

  **Recommended Agent Profile**: Category: `unspecified-high`, Skills: []

  **Parallelization**: Wave 1, blocks 9, blocked by none

  **References**:
  - `components/StudioInformationStep.tsx:186-195` — pickupTime select styling
  - `components/ui/checkbox.tsx` — shadcn checkbox component
  - Italian days: Lunedì, Martedì, Mercoledì, Giovedì, Venerdì, Sabato, Domenica

  **Acceptance Criteria**:
  - [ ] File `components/StudioHoursSelector.tsx` exists
  - [ ] 7 day rows, Mon-Fri default checked 09:00-18:00
  - [ ] `serializeHours()` produces readable Italian string
  - [ ] `npm run build` succeeds

  **QA Scenarios:**
  ```
  Scenario: Hours selector renders with correct defaults
    Tool: Playwright
    Steps: Render component, assert 7 rows, Mon-Fri checked, time selects show 09:00/18:00
    Evidence: .sisyphus/evidence/task-3-hours-defaults.png

  Scenario: Toggling day disables/enables time selects
    Tool: Playwright
    Steps: Uncheck Lunedì, assert selects disabled. Check Sabato, assert selects enabled.
    Evidence: .sisyphus/evidence/task-3-hours-toggle.png
  ```

  **Commit**: `feat(ui): add structured 7-day studio hours selector` — `components/StudioHoursSelector.tsx`

---

- [ ] 4. **View Mode Navigation (main/history/admin)**

  **What to do**:
  - In `src/app/page.tsx`, add `viewMode` state: `'form' | 'history' | 'admin'`
  - Add navigation tabs ABOVE the form header: "Nuova Richiesta" (default), "Storico Richieste", "Amministrazione"
  - Render different views: form (existing), history placeholder, admin placeholder
  - Tab styling: match blue-600 primary, rounded-full pills, gray inactive
  - When `isSubmitted === true`, still show SubmissionRecap (override viewMode)

  **Must NOT do**: Don't add react-router, don't implement actual history/admin content (just placeholders), don't change form logic

  **Recommended Agent Profile**: Category: `quick`, Skills: []

  **Parallelization**: Wave 1, blocks 10/12, blocked by none

  **References**:
  - `src/app/page.tsx:14-228` — current component structure
  - `src/app/page.tsx:227-229` — isSubmitted check for SubmissionRecap
  - `src/app/page.tsx:231-274` — header section where tabs go above

  **Acceptance Criteria**:
  - [ ] 3 tabs visible at top of page
  - [ ] Clicking tabs switches view
  - [ ] Form still works on default tab
  - [ ] `npm run build` succeeds

  **QA Scenarios:**
  ```
  Scenario: Navigation tabs visible and functional
    Tool: Playwright
    Steps: Navigate to localhost:5173, assert 3 tab buttons exist, click "Storico Richieste", assert placeholder shown
    Evidence: .sisyphus/evidence/task-4-tabs.png

  Scenario: Form submission still works with new navigation
    Tool: Playwright
    Steps: On default tab, fill form, submit, assert SubmissionRecap shows
    Evidence: .sisyphus/evidence/task-4-form-works.png
  ```

  **Commit**: `feat(nav): add view mode navigation (main/history/admin)` — `src/app/page.tsx`

---

- [ ] 5. **n8n — Add Notes to Transform Data + Google Sheets**

  **What to do**:
  - Update n8n workflow `4thMwDmBvacFEGNZ`, Transform Data node (ID: `f0f7c870-1591-4602-85ce-ef58cf08e3ac`)
  - Add `NOTE_GENERALI: body.notes || ''` to each delivery record output
  - Google Sheets auto-maps — new column appears automatically
  - Read current Transform Data code first, only add the notes mapping line

  **Must NOT do**: Don't modify email templates (Task 6), don't rewrite the entire code node

  **Recommended Agent Profile**: Category: `quick`, Skills: []

  **Parallelization**: Wave 1, blocks none, blocked by none

  **References**:
  - n8n workflow ID: `4thMwDmBvacFEGNZ`, Transform Data node ID: `f0f7c870-1591-4602-85ce-ef58cf08e3ac`
  - ARCHITECTURE.md:218-236 — Google Sheets column definitions

  **Acceptance Criteria**:
  - [ ] Transform Data node outputs NOTE_GENERALI field
  - [ ] Test webhook POST with notes returns success

  **QA Scenarios:**
  ```
  Scenario: Notes field reaches Google Sheets
    Tool: Bash (curl)
    Steps: curl -X POST https://n8n.madani.agency/webhook/dental-logistics with JSON body including notes, assert 200 response
    Evidence: .sisyphus/evidence/task-5-notes-webhook.json
  ```

  **Commit**: n8n workflow update (via MCP, no git file)

---

- [ ] 6. **n8n — Add Notes to Email Templates**

  **What to do**:
  - Update n8n workflow `4thMwDmBvacFEGNZ`:
    - Confirmation Email node (ID: `b1e83eed-8ab0-4299-b7ed-8413a56b90d5`): Add "Note Generali" HTML section, conditional on non-empty notes
    - Notification Email node (ID: `e3e9a749-b193-4c41-b897-9fcaab3c1ea5`): Add "Note del Cliente" HTML section, conditional
  - Read each node's current code first. Only ADD notes section.

  **Must NOT do**: Don't modify Transform Data (Task 5), don't change email subject lines, don't rewrite entire templates

  **Recommended Agent Profile**: Category: `quick`, Skills: []

  **Parallelization**: Wave 1, blocks none, blocked by none

  **References**:
  - Confirmation Email node ID: `b1e83eed-8ab0-4299-b7ed-8413a56b90d5`
  - Notification Email node ID: `e3e9a749-b193-4c41-b897-9fcaab3c1ea5`

  **Acceptance Criteria**:
  - [ ] Email HTML contains notes section when notes is non-empty
  - [ ] Email HTML omits notes section when notes is empty

  **QA Scenarios:**
  ```
  Scenario: Email includes notes when provided
    Tool: Bash (curl)
    Steps: POST to webhook with notes field, check n8n execution for email HTML containing notes text
    Evidence: .sisyphus/evidence/task-6-email-notes.json
  ```

  **Commit**: n8n workflow update (via MCP, no git file)

---

- [ ] 7. **Auto-populate Form from localStorage Profiles**

  **What to do**:
  - In `src/app/page.tsx`: On mount (useEffect), call `getSenderProfile()`. If exists, pre-fill formData
  - Show dismissable banner: "Dati caricati dal profilo salvato" when auto-populated
  - After successful submission (response.ok), call `saveSenderProfile()` with current sender fields
  - For studioHours: handle both string and StructuredHours formats

  **Must NOT do**: Don't change validation, don't change submission endpoint, don't auto-save on keystroke (only on submit)

  **Recommended Agent Profile**: Category: `unspecified-high`, Skills: []

  **Parallelization**: Wave 2, blocks 13, blocked by 1

  **References**:
  - `src/app/page.tsx:15-16` — useState for formData (change init to use localStorage)
  - `src/app/page.tsx:199-203` — success handler (add saveSenderProfile)
  - `src/services/localStorage.ts` — getSenderProfile(), saveSenderProfile()

  **Acceptance Criteria**:
  - [ ] Form auto-fills from saved profile on reload
  - [ ] Banner shows when data loaded
  - [ ] Profile saves after successful submission

  **QA Scenarios:**
  ```
  Scenario: Form auto-populates after submission
    Tool: Playwright
    Steps: Fill form, submit, reload page, assert fields contain saved values, assert banner visible
    Evidence: .sisyphus/evidence/task-7-auto-populate.png

  Scenario: Fresh visit shows empty form (no saved profile)
    Tool: Playwright
    Steps: Clear localStorage, reload, assert all fields empty, no banner
    Evidence: .sisyphus/evidence/task-7-fresh-visit.png
  ```

  **Commit**: `feat(storage): auto-populate sender form from localStorage profile` — `src/app/page.tsx`

---

- [ ] 8. **Recipient Address Book — Save/Load/Pick**

  **What to do**:
  - Create `components/RecipientAddressBook.tsx`: list of saved recipients with click-to-fill
  - Each entry: destination name, address (truncated), last used date, delete (X) button
  - In `components/RecipientsDeliveryStep.tsx`: add "Scegli da rubrica" button near each RecipientCard
  - Clicking opens dropdown/popover with saved recipients from localStorage
  - In `src/app/page.tsx` success handler: save all recipients to address book via saveRecipient()

  **Must NOT do**: Don't add search for <5 entries, don't modify RecipientCard props beyond needed, no pagination

  **Recommended Agent Profile**: Category: `unspecified-high`, Skills: []

  **Parallelization**: Wave 2, blocks 13, blocked by 1

  **References**:
  - `components/RecipientsDeliveryStep.tsx:35-44` — where RecipientCards render
  - `components/RecipientCard.tsx:10-17` — RecipientCardProps interface
  - `src/services/localStorage.ts` — getAddressBook(), saveRecipient(), removeRecipient()

  **Acceptance Criteria**:
  - [ ] "Scegli da rubrica" button visible near recipient cards
  - [ ] Clicking saved recipient fills card fields
  - [ ] Address book saves recipients after submission

  **QA Scenarios:**
  ```
  Scenario: Address book fills recipient from saved entry
    Tool: Playwright
    Steps: Submit form with recipient, reload, add new recipient, click "Scegli da rubrica", select saved entry, assert fields fill
    Evidence: .sisyphus/evidence/task-8-address-book.png

  Scenario: Empty address book shows appropriate message
    Tool: Playwright
    Steps: Clear localStorage, click "Scegli da rubrica", assert empty state message
    Evidence: .sisyphus/evidence/task-8-empty-book.png
  ```

  **Commit**: `feat(storage): recipient address book with save/load/pick` — `components/RecipientAddressBook.tsx`, `components/RecipientsDeliveryStep.tsx`

---

- [ ] 9. **Integrate StudioHoursSelector + localStorage Persistence**

  **What to do**:
  - In `components/StudioInformationStep.tsx`: replace `<Input>` for studioHours (lines 110-125) with `<StudioHoursSelector>` from Task 3
  - Add props: `structuredHours: StructuredHours`, `onHoursChange: (hours: StructuredHours) => void`
  - In `src/app/page.tsx`: add `structuredHours` state, init from localStorage. On change, update both state AND `formData.studioHours` via `serializeHours()`
  - Update validation: check at least one day is open instead of non-empty string
  - On submit, save structuredHours as part of sender profile

  **Must NOT do**: Don't change webhook payload format (studioHours stays string in FormData)

  **Recommended Agent Profile**: Category: `quick`, Skills: []

  **Parallelization**: Wave 2, blocks none, blocked by 1 and 3

  **References**:
  - `components/StudioInformationStep.tsx:106-126` — current studioHours Input to replace
  - `components/StudioHoursSelector.tsx` — new component from Task 3
  - `src/app/page.tsx:57-59` — studioHours validation to update

  **Acceptance Criteria**:
  - [ ] Hours selector renders in Step 1 (not free text)
  - [ ] Submitting sends serialized string to webhook
  - [ ] `npm run build` succeeds

  **QA Scenarios:**
  ```
  Scenario: Hours selector integrated in Step 1
    Tool: Playwright
    Steps: Navigate to form, assert 7-day selector visible (not text input), toggle days, take screenshot
    Evidence: .sisyphus/evidence/task-9-hours-integrated.png
  ```

  **Commit**: `feat(ui): integrate hours selector with localStorage persistence` — `components/StudioInformationStep.tsx`, `src/app/page.tsx`

---

- [ ] 10. **Submission History — Save + Display**

  **What to do**:
  - Create `components/SubmissionHistory.tsx`: reads submissions via `getSubmissions()`, displays newest first
  - Each entry: date/time, company name, recipient count, expandable details (full recipient list)
  - Empty state: "Nessuna richiesta precedente" with icon
  - "Cancella storico" button with confirm dialog
  - In `src/app/page.tsx`: render SubmissionHistory when `viewMode === 'history'` (replace placeholder from Task 4)

  **Must NOT do**: No pagination, no export, no filtering

  **Recommended Agent Profile**: Category: `unspecified-high`, Skills: []

  **Parallelization**: Wave 2, blocks 13, blocked by 1 and 4

  **References**:
  - `components/SubmissionRecap.tsx` — submission display pattern/styling
  - `src/services/localStorage.ts` — getSubmissions()
  - `src/app/page.tsx` — viewMode state from Task 4

  **Acceptance Criteria**:
  - [ ] Empty state shows "Nessuna richiesta precedente"
  - [ ] After submission, history shows entry with correct details
  - [ ] Expandable details show full recipient info

  **QA Scenarios:**
  ```
  Scenario: History shows empty state then populates
    Tool: Playwright
    Steps: Clear localStorage, navigate to history tab, assert empty state. Submit form, navigate to history, assert entry appears.
    Evidence: .sisyphus/evidence/task-10-history.png
  ```

  **Commit**: `feat(history): submission history view with last 50 entries` — `components/SubmissionHistory.tsx`

---

- [ ] 11. **n8n — New Billing Read Endpoint**

  **What to do**:
  - Add new webhook path to existing n8n workflow: `/webhook/dental-logistics-billing` (GET)
  - New branch: Webhook → Read Google Sheets → Code (aggregate by NOME_STUDIO) → Respond
  - Query param: `?month=2026-03` (default: current month)
  - Response: `{ month, clients: [{ name, deliveries, pickups, dates }] }`
  - Read-only — no writes to Google Sheets

  **Must NOT do**: Don't modify form submission flow, don't add auth, don't create separate n8n instance

  **Recommended Agent Profile**: Category: `unspecified-high`, Skills: []

  **Parallelization**: Wave 2, blocks 12, blocked by none

  **References**:
  - n8n workflow ID: `4thMwDmBvacFEGNZ`
  - Google Sheets node ID: `5c5d16f6-ec59-42c3-a05a-9ab613207071` — reuse Sheet ID and credentials
  - Sheet ID: `1CMlvDX86A2gJUcckjwBWvANKbXlAeYcyjGhnM955fQw`, sheet: "Logistica"
  - ARCHITECTURE.md:218-236 — column definitions

  **Acceptance Criteria**:
  - [ ] GET `/webhook/dental-logistics-billing` returns JSON
  - [ ] Response groups deliveries by client name
  - [ ] Empty month returns empty clients array

  **QA Scenarios:**
  ```
  Scenario: Billing endpoint returns aggregated data
    Tool: Bash (curl)
    Steps: curl -X GET 'https://n8n.madani.agency/webhook/dental-logistics-billing?month=2026-03', assert JSON with clients array
    Evidence: .sisyphus/evidence/task-11-billing-endpoint.json

  Scenario: Empty month returns empty array
    Tool: Bash (curl)
    Steps: curl with month=2099-01, assert clients is empty array
    Evidence: .sisyphus/evidence/task-11-empty-month.json
  ```

  **Commit**: n8n workflow update (via MCP, no git file)

---

- [ ] 12. **Admin Billing Dashboard UI**

  **What to do**:
  - Create `components/AdminBilling.tsx`:
    - On mount, fetch from `GET https://n8n.madani.agency/webhook/dental-logistics-billing?month={selectedMonth}`
    - Month selector (default: current month, navigate previous months)
    - Summary cards: Totale Clienti, Totale Consegne, Totale Ritiri, Imponibile Totale
    - Per-client table: Cliente | Consegne | Ritiri | Costo Unitario Consegna | Costo Unitario Ritiro | Totale
    - Editable cost fields (saved to localStorage billingConfig)
    - "Imponibile" total row at bottom
    - Loading/error states
  - In `src/app/page.tsx`: render AdminBilling when `viewMode === 'admin'`

  **Must NOT do**: No print/export PDF, no authentication, no separate app

  **Recommended Agent Profile**: Category: `unspecified-high`, Skills: []

  **Parallelization**: Wave 3, blocks none, blocked by 4 and 11

  **References**:
  - `components/SubmissionRecap.tsx:23-36` — grid layout pattern
  - `components/ui/card.tsx`, `components/ui/input.tsx` — shadcn components
  - `src/services/localStorage.ts` — getBillingConfig(), saveBillingConfig()
  - Billing endpoint: `https://n8n.madani.agency/webhook/dental-logistics-billing`

  **Acceptance Criteria**:
  - [ ] Admin view loads billing data from n8n endpoint
  - [ ] Month selector changes displayed data
  - [ ] Cost fields are editable and persist
  - [ ] Total imponibile calculates correctly

  **QA Scenarios:**
  ```
  Scenario: Admin billing loads and displays data
    Tool: Playwright
    Steps: Navigate to admin tab, assert summary cards visible, assert per-client table rows, change month, assert data updates
    Evidence: .sisyphus/evidence/task-12-admin-billing.png

  Scenario: Editing cost field updates total
    Tool: Playwright
    Steps: Change a cost field value, assert total row recalculates, reload, assert cost persisted from localStorage
    Evidence: .sisyphus/evidence/task-12-cost-edit.png
  ```

  **Commit**: `feat(admin): billing dashboard with per-client counters and costs` — `components/AdminBilling.tsx`

---

- [ ] 13. **Save Submission on Successful POST**

  **What to do**:
  - In `src/app/page.tsx` handleSubmit, after `response.ok` (line ~199-203):
    - Create SavedSubmission: `{ id: 'SUB_' + Date.now(), timestamp: new Date().toISOString(), formData, recipientCount: formData.recipients.length }`
    - Call `saveSubmission()`
    - Call `saveRecipient()` for each recipient (update lastUsed)
  - This is the glue connecting persistence (REQ-1) with history (REQ-5)

  **Must NOT do**: Don't save on failed submissions, don't modify form UI

  **Recommended Agent Profile**: Category: `quick`, Skills: []

  **Parallelization**: Wave 3, blocks none, blocked by 7, 8, 10

  **References**:
  - `src/app/page.tsx:174-216` — handleSubmit function, add in `if (response.ok)` block
  - `src/services/localStorage.ts` — saveSubmission(), saveRecipient()
  - `src/types/storage.ts` — SavedSubmission, SavedRecipient types

  **Acceptance Criteria**:
  - [ ] localStorage contains submission after successful POST
  - [ ] History view shows the submission
  - [ ] Address book contains recipients after submission

  **QA Scenarios:**
  ```
  Scenario: Submission saved to localStorage after POST
    Tool: Playwright
    Steps: Fill form, submit, use browser_evaluate to check localStorage for submission entry, navigate to history, assert visible
    Evidence: .sisyphus/evidence/task-13-save-submission.png
  ```

  **Commit**: `feat(storage): save submission + response to localStorage on success` — `src/app/page.tsx`

---

- [ ] 14. **Update ARCHITECTURE.md with New Features**

  **What to do**:
  - Add "Data Persistence" section describing localStorage schema and service
  - Update Data Model with new types (StructuredHours, StorageSchema)
  - Add "Admin Billing" section describing billing endpoint and dashboard
  - Update Application Flow diagram with new views (form/history/admin)
  - Update n8n section with notes column and billing endpoint
  - Remove/update "no persistence" from Known Limitations
  - Update last modified date

  **Must NOT do**: Don't rewrite unchanged sections, don't remove legacy section, don't change business context

  **Recommended Agent Profile**: Category: `writing`, Skills: []

  **Parallelization**: Wave 3, blocks none, blocked by all previous tasks

  **References**:
  - `ARCHITECTURE.md` — current 361-line file, read fully before editing
  - `src/types/storage.ts`, `src/services/localStorage.ts` — new items to document
  - All new component files from Tasks 2-12

  **Acceptance Criteria**:
  - [ ] All 5 features documented in ARCHITECTURE.md
  - [ ] No stale "no persistence" references remain
  - [ ] Updated date in header

  **QA Scenarios:**
  ```
  Scenario: ARCHITECTURE.md is accurate and complete
    Tool: Grep/Read
    Steps: Read ARCHITECTURE.md, search for "localStorage", "billing", "history", "notes" — assert all present. Search for "No persistence" — assert removed/updated.
    Evidence: .sisyphus/evidence/task-14-architecture-updated.txt
  ```

  **Commit**: `docs: update ARCHITECTURE.md with new features and data flows` — `ARCHITECTURE.md`

---
## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Rejection → fix → re-run.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `npm run build`. Review all changed/new files for: `as any`/`@ts-ignore`, empty catches, console.log in new code, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names (data/result/item/temp). Verify TypeScript strict mode compliance.
  Output: `Build [PASS/FAIL] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` + `playwright` skill
  Start dev server (`npm run dev`). Open browser. Test EVERY feature end-to-end:
  1. Fill form Step 1 → verify notes textarea visible → submit → check localStorage has sender profile
  2. Reload page → verify auto-populate from localStorage
  3. Check structured hours selector works (toggle days, set times)
  4. Submit form → verify notes appear in Google Sheet (via curl to n8n or check sheet)
  5. Check "Storico Richieste" shows submission with full recipient details
  6. Navigate to admin billing view → verify data loads
  7. Test empty states (no history, no saved profiles)
  Save all evidence to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual code changes. Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Detect cross-task contamination. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

| After Task(s) | Commit Message | Files |
|--------------|----------------|-------|
| 1 | `feat(storage): add versioned localStorage service with types` | `src/services/localStorage.ts`, `src/types/storage.ts` |
| 2 | `feat(ui): render notes textarea in Step 1` | `components/StudioInformationStep.tsx` |
| 3 | `feat(ui): add structured 7-day studio hours selector` | `components/StudioHoursSelector.tsx` |
| 4 | `feat(nav): add view mode navigation (main/history/admin)` | `src/app/page.tsx` |
| 5, 6 | `feat(n8n): add notes to Transform Data, Sheets column, and email templates` | n8n workflow (via MCP) |
| 7 | `feat(storage): auto-populate sender form from localStorage profile` | `src/app/page.tsx`, `components/StudioInformationStep.tsx` |
| 8 | `feat(storage): recipient address book with save/load/pick` | `components/RecipientAddressBook.tsx`, `components/RecipientsDeliveryStep.tsx` |
| 9 | `feat(ui): integrate hours selector with localStorage persistence` | `components/StudioInformationStep.tsx`, `src/app/page.tsx` |
| 10 | `feat(history): submission history view with last 50 entries` | `components/SubmissionHistory.tsx` |
| 11 | `feat(n8n): add billing read endpoint for Google Sheets data` | n8n workflow (via MCP) |
| 12 | `feat(admin): billing dashboard with per-client counters and costs` | `components/AdminBilling.tsx` |
| 13 | `feat(storage): save submission + response to localStorage on success` | `src/app/page.tsx` |
| 14 | `docs: update ARCHITECTURE.md with new features and data flows` | `ARCHITECTURE.md` |

---

## Success Criteria

### Verification Commands
```bash
npm run build    # Expected: zero errors, dist/ created
npm run dev      # Expected: dev server starts on localhost:5173
```

### Final Checklist
- [ ] All "Must Have" present (verified by F1)
- [ ] All "Must NOT Have" absent (verified by F1)
- [ ] Build succeeds (verified by F2)
- [ ] All QA scenarios pass (verified by F3)
- [ ] No scope creep (verified by F4)
- [ ] ARCHITECTURE.md updated
- [ ] All UI text in Italian
