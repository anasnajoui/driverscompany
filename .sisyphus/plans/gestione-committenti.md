# Gestione Committenti — Self-Service Admin Management

## TL;DR

> **Quick Summary**: Replace the hardcoded committenti dropdown list with a dynamic Google Sheets-backed system that the admin can manage from the admin panel without touching code.
> 
> **Deliverables**:
> - New "COMMITTENTI" tab in existing Google Sheet with seeded data
> - n8n GET webhook returning committenti list as JSON
> - n8n POST webhook for add/remove operations
> - Form dropdown dynamically loads committenti from API (with hardcoded fallback)
> - Admin panel "Gestione Committenti" section for CRUD management
> 
> **Estimated Effort**: Medium
> **Parallel Execution**: YES — 3 waves
> **Critical Path**: Task 1 → Task 2 → Task 4/5 → Task 6

---

## Context

### Original Request
The client asked: can I update the committenti dropdown myself to add new studios/labs? Currently the list is hardcoded in `src/constants/formOptions.ts` — any change requires a code deploy. The client wants self-service management from the admin panel.

### Interview Summary
**Key Discussions**:
- **Storage**: Google Sheets (new tab in existing spreadsheet) — fits the current stack perfectly
- **Access**: Only from admin panel (already password-protected)
- **Approach**: n8n webhooks for read/write, form fetches dynamically, hardcoded array as fallback

**Research Findings**:
- `COMMITTENTI` array lives in `src/constants/formOptions.ts` (lines 25-40, 14 entries, alphabetically sorted)
- Imported by `StudioInformationStep.tsx` (line 8), used in dropdown (lines 82-84)
- Google Sheets credential ID: `ZcD9zgNs6CVlHKcT` (name: "Google Sheets account"), OAuth2
- Spreadsheet ID: `1CMlvDX86A2gJUcckjwBWvANKbXlAeYcyjGhnM955fQw`
- Existing tab: "Logistica" (gid: 653702461)
- n8n naming convention: `[DriversCompany] ...`
- Google Sheets node typeVersion: 3 with `__rl` resource locator format

### Gap Analysis
**Addressed gaps**:
- Duplicate prevention: add action checks if name already exists before appending
- Empty/whitespace names: validation before add
- Alphabetical ordering: maintained on both GET response and form dropdown
- Network failure: form falls back to hardcoded `COMMITTENTI` array
- Removed committente: existing orders unaffected (FATTURARE_A is a stored string, not a reference)

---

## Work Objectives

### Core Objective
Enable the admin to add and remove committenti (commissioning labs) from the admin panel, with changes immediately reflected in the order form dropdown — no code deploys needed.

### Concrete Deliverables
- Google Sheet tab "COMMITTENTI" with column header `NOME` and 14 seeded entries
- n8n workflow: `[DriversCompany] Committenti API` — GET `/webhook/committenti`
- n8n workflow: `[DriversCompany] Committenti Manage` — POST `/webhook/committenti-manage`
- Updated `components/StudioInformationStep.tsx` — dynamic fetch with fallback
- New `components/GestioneCommittenti.tsx` — admin CRUD component
- Updated `src/app/page.tsx` — admin sub-navigation (Fatturazione | Committenti)

### Definition of Done
- [ ] Admin adds "TestLab" from panel → form dropdown shows "TestLab"
- [ ] Admin removes "TestLab" from panel → form dropdown no longer shows "TestLab"
- [ ] Form dropdown loads within 2s, shows committenti alphabetically
- [ ] If n8n is down, form still shows hardcoded fallback list
- [ ] `npm run build` passes with 0 errors

### Must Have
- Alphabetical sorting in both admin list and form dropdown
- Duplicate prevention (can't add a name that already exists)
- Empty/whitespace name rejection
- Hardcoded fallback in form if API fails
- All UI text in Italian
- Admin-only access (existing password protection)

### Must NOT Have (Guardrails)
- No new npm dependencies
- No authentication changes
- No changes to `components/ui/*.tsx`
- No editing/renaming of committenti (only add/remove — keeps it simple)
- No committente metadata (email, phone, etc.) — just names
- No modification of existing Google Sheet tabs or data
- No `as any` or `@ts-ignore`
- No English-language UI text

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: NO
- **Automated tests**: None (no test framework in project)
- **Framework**: N/A

### QA Policy
Every task includes agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **n8n workflows**: Use Bash (curl) — call webhooks, assert status + response fields
- **Frontend/UI**: Use Playwright (playwright skill) — navigate, interact, assert DOM, screenshot
- **Build**: Use Bash — `npm run build`, assert exit code 0

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (n8n Backend — all parallel, no dependencies):
├── Task 1: Seed COMMITTENTI Google Sheet tab [quick]
├── Task 2: Create GET committenti n8n workflow [quick]
└── Task 3: Create POST committenti-manage n8n workflow [quick]

Wave 2 (Frontend — parallel, depends on Wave 1):
├── Task 4: StudioInformationStep.tsx dynamic fetch (depends: 2) [quick]
└── Task 5: GestioneCommittenti admin component + page.tsx wiring (depends: 2, 3) [unspecified-high]

Wave 3 (Deploy — depends on Wave 2):
└── Task 6: Build + commit + push (depends: 4, 5) [quick, git-master]

Wave FINAL (After ALL tasks — independent review, 4 parallel):
├── F1: Plan compliance audit [oracle]
├── F2: Code quality review [unspecified-high]
├── F3: Real QA [unspecified-high, playwright]
└── F4: Scope fidelity check [deep]

Critical Path: Task 1 → Task 2 → Task 5 → Task 6 → F1-F4
Parallel Speedup: ~50% faster than sequential
Max Concurrent: 3 (Wave 1)
```

### Dependency Matrix

| Task | Blocked By | Blocks |
|------|-----------|--------|
| 1 | — | 2, 3 |
| 2 | 1 | 4, 5 |
| 3 | 1 | 5 |
| 4 | 2 | 6 |
| 5 | 2, 3 | 6 |
| 6 | 4, 5 | F1-F4 |

### Agent Dispatch Summary

- **Wave 1**: 3 tasks — T1 → `quick`, T2 → `quick`, T3 → `quick`
- **Wave 2**: 2 tasks — T4 → `quick`, T5 → `unspecified-high`
- **Wave 3**: 1 task — T6 → `quick` + `git-master` skill
- **FINAL**: 4 tasks — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high` + `playwright`, F4 → `deep`

---

## TODOs

- [x] 1. Seed COMMITTENTI Google Sheet Tab

  **What to do**:
  - Create an n8n workflow that creates a new sheet tab named "COMMITTENTI" in the existing spreadsheet
  - The tab must have a header row with column `NOME` in cell A1
  - Populate rows 2-15 with the 14 current committenti names (alphabetically): Bravin, Creattiva, Delpin, Dentalica, Dentalline, Dentaltre, Lovato, Mangione, Orodental, Ortolab, Pascolo, Saccher, Syntesis, Unident
  - Workflow structure: `Webhook (POST) → Code (generate 14 rows) → Google Sheets (Create tab "COMMITTENTI") → Google Sheets (Append rows) → Respond to Webhook`
  - Use existing Google Sheets OAuth2 credential: ID `ZcD9zgNs6CVlHKcT`, name `Google Sheets account`
  - Spreadsheet document ID: `1CMlvDX86A2gJUcckjwBWvANKbXlAeYcyjGhnM955fQw`
  - Name the workflow: `[DriversCompany] Committenti Seed`
  - After creating, activate the workflow, call it once via curl to seed the data, then deactivate it
  - Verify the tab exists with 14 rows by reading it back

  **Must NOT do**:
  - Do NOT modify the existing "Logistica" tab
  - Do NOT delete any existing data
  - Do NOT change credentials on any existing workflow

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`
  - Reason: Simple n8n workflow creation + one-time execution. No frontend or complex logic.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3)
  - **Blocks**: Tasks 2, 3 (they need the tab to exist)
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - Existing Google Sheets node config in main workflow (node ID `5c5d16f6-ec59-42c3-a05a-9ab613207071`) — copy the `documentId` resource locator format exactly: `{ "__rl": true, "value": "1CMlvDX86A2gJUcckjwBWvANKbXlAeYcyjGhnM955fQw", "mode": "list", "cachedResultName": "DriversCompany Form" }`
  - Existing credential reference format: `{ "googleSheetsOAuth2Api": { "id": "ZcD9zgNs6CVlHKcT", "name": "Google Sheets account" } }`

  **API/Type References**:
  - Google Sheets node `operation: "create"` with `resource: "sheet"` creates a new tab — use `sheetsUi.sheetValues.title: "COMMITTENTI"` for the tab name
  - Google Sheets node `operation: "append"` with `resource: "sheet"` appends rows — set `sheetName` to `"COMMITTENTI"`
  - n8n create workflow API: `n8n_create_workflow` tool

  **External References**:
  - Current COMMITTENTI array: `src/constants/formOptions.ts` lines 25-40 (the 14 names to seed)

  **Acceptance Criteria**:
  - [ ] n8n workflow `[DriversCompany] Committenti Seed` created
  - [ ] Workflow executed successfully (curl returns 200)
  - [ ] Google Sheet now has "COMMITTENTI" tab with header row `NOME` and 14 data rows

  **QA Scenarios:**

  ```
  Scenario: Verify seeded COMMITTENTI tab via n8n GET
    Tool: Bash (curl)
    Preconditions: Seed workflow has been executed
    Steps:
      1. Call the seed webhook: curl -s -X POST https://n8n.madani.agency/webhook/committenti-seed
      2. Verify response contains success indicator
      3. Create a temporary read workflow or use GET committenti workflow (Task 2) to verify 14 rows exist
    Expected Result: 14 committenti names present in COMMITTENTI tab, alphabetically ordered
    Failure Indicators: HTTP error, empty response, fewer than 14 rows
    Evidence: .sisyphus/evidence/task-1-seed-verification.json

  Scenario: Verify no damage to existing Logistica tab
    Tool: Bash (curl)
    Preconditions: Seed workflow has been executed
    Steps:
      1. Use the billing API to verify Logistica data is intact: curl -s 'https://n8n.madani.agency/webhook/dental-logistics-billing?month=2026-03'
      2. Verify response returns valid billing data (not an error)
    Expected Result: Billing API returns data or empty month — NOT an error
    Failure Indicators: HTTP 500, missing fields, corrupted data
    Evidence: .sisyphus/evidence/task-1-logistica-intact.json
  ```

  **Commit**: NO (n8n-only change, no code files modified)

- [x] 2. Create GET Committenti n8n Workflow

  **What to do**:
  - Create a new n8n workflow named `[DriversCompany] Committenti API`
  - Webhook trigger: GET method, path: `committenti`
  - Google Sheets node: Read all rows from "COMMITTENTI" tab in spreadsheet `1CMlvDX86A2gJUcckjwBWvANKbXlAeYcyjGhnM955fQw`
  - Code node: Transform rows into a sorted JSON array. Extract `NOME` field from each row, filter out empty/null, sort alphabetically, return as `{ committenti: ["Bravin", ...] }`
  - Respond to Webhook node: Return the JSON response
  - Workflow structure: `Webhook (GET, /committenti) → Google Sheets (Read COMMITTENTI) → Code (format + sort) → Respond to Webhook`
  - Activate the workflow so the form can fetch from it
  - Use credential: `googleSheetsOAuth2Api` ID `ZcD9zgNs6CVlHKcT`

  **Must NOT do**:
  - Do NOT modify any existing workflows
  - Do NOT write to the Google Sheet (this is read-only)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`
  - Reason: Simple 4-node n8n workflow. Pattern matches existing billing API workflow.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3)
  - **Blocks**: Tasks 4, 5
  - **Blocked By**: Task 1 (COMMITTENTI tab must exist)

  **References**:

  **Pattern References**:
  - `[DriversCompany] Billing API` workflow (ID: `7DUsuL7VeiBObF3l`) — follow the exact same pattern: Webhook → Google Sheets Read → Code (transform) → Respond. Copy node structure, credential format, and response pattern.
  - Billing webhook node config: `httpMethod: "GET"`, `path: "dental-logistics-billing"`, `responseMode: "responseNode"` — use same pattern with path `committenti`
  - Google Sheets Read node: copy the `documentId` resource locator format from the main workflow's "Add to Google Sheets" node (ID: `5c5d16f6...`), but change `sheetName` to `"COMMITTENTI"`

  **Code Node Logic (for the transform):**
  ```javascript
  const rows = $input.all();
  const committenti = rows
    .map(row => row.json.NOME)
    .filter(name => name && name.trim() !== '')
    .sort((a, b) => a.localeCompare(b));
  return [{ json: { committenti } }];
  ```

  **Acceptance Criteria**:
  - [ ] n8n workflow `[DriversCompany] Committenti API` created and active
  - [ ] `curl -s https://n8n.madani.agency/webhook/committenti` returns HTTP 200
  - [ ] Response body is JSON: `{ "committenti": ["Bravin", "Creattiva", ...] }`
  - [ ] Array contains exactly 14 items, alphabetically sorted

  **QA Scenarios:**

  ```
  Scenario: GET committenti returns full sorted list
    Tool: Bash (curl)
    Preconditions: Task 1 completed (COMMITTENTI tab seeded)
    Steps:
      1. curl -s https://n8n.madani.agency/webhook/committenti
      2. Parse JSON response
      3. Assert response has key "committenti" that is an array
      4. Assert array length is 14
      5. Assert first element is "Bravin" (alphabetically first)
      6. Assert last element is "Unident" (alphabetically last)
    Expected Result: `{ "committenti": ["Bravin", "Creattiva", "Delpin", "Dentalica", "Dentalline", "Dentaltre", "Lovato", "Mangione", "Orodental", "Ortolab", "Pascolo", "Saccher", "Syntesis", "Unident"] }`
    Failure Indicators: HTTP error, empty array, unsorted list, missing names
    Evidence: .sisyphus/evidence/task-2-get-committenti.json
  ```

  **Commit**: NO (n8n-only change, no code files modified)

- [x] 3. Create POST Committenti-Manage n8n Workflow

  **What to do**:
  - Create a new n8n workflow named `[DriversCompany] Committenti Manage`
  - Webhook trigger: POST method, path: `committenti-manage`
  - Code node ("Handle Action"): Handles both add and remove actions using the Google Sheets API directly via `this.helpers.httpRequestWithAuthentication`. The input body has `{ action: "add" | "remove", name: "LabName" }`
  - For **add**: validate name is non-empty and not a duplicate (read existing rows first), then append a new row with `NOME` = trimmed name
  - For **remove**: read all rows, find the row containing the target name, delete that row by index using the Google Sheets batchUpdate API
  - Return the updated committenti list in the response: `{ success: true, committenti: [...updated sorted list...] }`
  - Return error for invalid actions: `{ success: false, error: "message" }`
  - Respond to Webhook node: Return the JSON response from the Code node
  - Workflow structure: `Webhook (POST, /committenti-manage) → Code (handle add/remove via API) → Respond to Webhook`
  - Activate the workflow
  - Use credential: `googleSheetsOAuth2Api` ID `ZcD9zgNs6CVlHKcT`

  **Must NOT do**:
  - Do NOT allow adding empty/whitespace-only names
  - Do NOT allow adding duplicate names (case-insensitive check)
  - Do NOT modify any existing workflows
  - Do NOT touch the "Logistica" tab

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`
  - Reason: 3-node n8n workflow. The Code node has moderate logic but is self-contained.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2)
  - **Blocks**: Task 5
  - **Blocked By**: Task 1 (COMMITTENTI tab must exist)

  **References**:

  **Pattern References**:
  - `[DriversCompany] Billing API` workflow (ID: `7DUsuL7VeiBObF3l`) — same Webhook → Code → Respond pattern
  - Google Sheets API for appending: `POST https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}/values/{sheetName}!A:A:append?valueInputOption=USER_ENTERED` with body `{ values: [["NewName"]] }`
  - Google Sheets API for reading: `GET https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}/values/{sheetName}!A:A`
  - Google Sheets API for deleting a row: `POST https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}:batchUpdate` with `deleteDimension` request (requires sheetId/gid)
  - To get sheetId (gid) for the COMMITTENTI tab: `GET https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}?fields=sheets.properties` — find the sheet with title "COMMITTENTI" and extract `sheetId`

  **Code Node Logic (reference implementation):**
  ```javascript
  const input = $input.first().json.body || $input.first().json;
  const { action, name } = input;
  const SPREADSHEET_ID = '1CMlvDX86A2gJUcckjwBWvANKbXlAeYcyjGhnM955fQw';
  const SHEET_NAME = 'COMMITTENTI';
  const BASE_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}`;
  
  // Helper: read all committenti
  async function readAll() {
    const res = await $http.request({
      method: 'GET',
      url: `${BASE_URL}/values/${SHEET_NAME}!A:A`,
      auth: { type: 'oauth2', credential: 'googleSheetsOAuth2Api' },
    });
    // Skip header row (index 0), extract names
    return (res.data.values || []).slice(1).map(r => r[0]).filter(Boolean);
  }
  
  // Use this.helpers.httpRequestWithAuthentication for actual API calls
  // Return { success, committenti, error? }
  ```
  - **IMPORTANT**: Use `this.helpers.httpRequestWithAuthentication('googleSheetsOAuth2Api', requestOptions)` for all Google Sheets API calls in the Code node. This handles OAuth2 token refresh automatically.

  **Acceptance Criteria**:
  - [ ] n8n workflow `[DriversCompany] Committenti Manage` created and active
  - [ ] Add action: `curl -X POST .../committenti-manage -d '{"action":"add","name":"TestLab"}'` returns `{ success: true, committenti: [...15 items...] }`
  - [ ] Remove action: `curl -X POST .../committenti-manage -d '{"action":"remove","name":"TestLab"}'` returns `{ success: true, committenti: [...14 items...] }`
  - [ ] Duplicate prevention: adding "Bravin" again returns `{ success: false, error: "..." }`
  - [ ] Empty name prevention: adding "" returns `{ success: false, error: "..." }`

  **QA Scenarios:**

  ```
  Scenario: Add a new committente
    Tool: Bash (curl)
    Preconditions: Task 1 completed (COMMITTENTI tab seeded with 14 entries)
    Steps:
      1. curl -s -X POST https://n8n.madani.agency/webhook/committenti-manage -H 'Content-Type: application/json' -d '{"action":"add","name":"ZetaLab"}'
      2. Assert response has success: true
      3. Assert committenti array has 15 items
      4. Assert "ZetaLab" is in the array
      5. Verify GET endpoint also returns 15 items: curl -s https://n8n.madani.agency/webhook/committenti | jq '.committenti | length'
    Expected Result: success: true, 15 committenti, "ZetaLab" present
    Evidence: .sisyphus/evidence/task-3-add-committente.json

  Scenario: Remove a committente
    Tool: Bash (curl)
    Preconditions: "ZetaLab" was added in previous scenario
    Steps:
      1. curl -s -X POST https://n8n.madani.agency/webhook/committenti-manage -H 'Content-Type: application/json' -d '{"action":"remove","name":"ZetaLab"}'
      2. Assert response has success: true
      3. Assert committenti array has 14 items
      4. Assert "ZetaLab" is NOT in the array
    Expected Result: success: true, back to 14 committenti
    Evidence: .sisyphus/evidence/task-3-remove-committente.json

  Scenario: Reject duplicate add
    Tool: Bash (curl)
    Preconditions: "Bravin" already exists
    Steps:
      1. curl -s -X POST https://n8n.madani.agency/webhook/committenti-manage -H 'Content-Type: application/json' -d '{"action":"add","name":"Bravin"}'
      2. Assert response has success: false
      3. Assert error message mentions duplicate
    Expected Result: success: false with descriptive error
    Evidence: .sisyphus/evidence/task-3-duplicate-rejection.json

  Scenario: Reject empty name
    Tool: Bash (curl)
    Steps:
      1. curl -s -X POST https://n8n.madani.agency/webhook/committenti-manage -H 'Content-Type: application/json' -d '{"action":"add","name":"  "}'
      2. Assert response has success: false
    Expected Result: success: false with descriptive error
    Evidence: .sisyphus/evidence/task-3-empty-rejection.json
  ```

  **Commit**: NO (n8n-only change, no code files modified)

---

- [x] 4. Dynamic Committenti Fetch in Form Dropdown

  **What to do**:
  - Modify `components/StudioInformationStep.tsx` to fetch committenti from the GET webhook instead of using the hardcoded import
  - Add a `committentiList` state (`useState<string[]>`) initialized with the hardcoded `COMMITTENTI` as fallback
  - Add a `committentiLoading` state (`useState<boolean>`, initial: `true`)
  - Add a `useEffect` that fetches from `https://n8n.madani.agency/webhook/committenti` on mount:
    - On success: parse JSON, set `committentiList` to `response.committenti`, set loading false
    - On error: keep the hardcoded `COMMITTENTI` fallback, set loading false, `console.warn` the error
  - Replace `COMMITTENTI.map(...)` in the dropdown (line 82-84) with `committentiList.map(...)`
  - While loading, show a disabled `<option>` with text `Caricamento...` instead of the committenti list
  - Keep the `COMMITTENTI` import from `formOptions.ts` as the fallback source — do NOT remove it

  **Must NOT do**:
  - Do NOT remove the hardcoded `COMMITTENTI` array from `formOptions.ts` (it's the fallback)
  - Do NOT add loading spinners or complex UI — just a disabled option text
  - Do NOT add new npm dependencies
  - Do NOT change any other form fields or validation logic

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`
  - Reason: Small change to one component — add useState, useEffect, swap data source.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Task 5)
  - **Blocks**: Task 6
  - **Blocked By**: Task 2 (GET webhook must exist)

  **References**:

  **Pattern References**:
  - `components/StudioInformationStep.tsx:1-89` — current component structure, the dropdown is at lines 70-89, imports at line 8
  - `components/AdminBilling.tsx:94-117` — example of fetch pattern with loading/error state in this codebase (fetchBillingData callback)
  - `src/constants/formOptions.ts:25-40` — the COMMITTENTI array (keep as fallback)

  **API/Type References**:
  - GET endpoint: `https://n8n.madani.agency/webhook/committenti` returns `{ committenti: string[] }`

  **Acceptance Criteria**:
  - [ ] `StudioInformationStep.tsx` fetches committenti from webhook on mount
  - [ ] Dropdown shows alphabetically sorted committenti from API
  - [ ] If API fails, dropdown shows hardcoded COMMITTENTI fallback
  - [ ] While loading, dropdown shows "Caricamento..." disabled option
  - [ ] No TypeScript errors: `npm run build` passes

  **QA Scenarios:**

  ```
  Scenario: Form dropdown loads committenti dynamically
    Tool: Playwright (playwright skill)
    Preconditions: App running at https://driverscompany.vercel.app, Tasks 1-2 complete
    Steps:
      1. Navigate to https://driverscompany.vercel.app
      2. Wait for page load (wait for "Informazioni Mittente" heading)
      3. Find the #billingClient select element
      4. Get all option elements within the select
      5. Assert first option is the placeholder ("— Seleziona (se applicabile) —")
      6. Assert remaining options include "Bravin" (first alphabetically)
      7. Assert total option count is 15 (1 placeholder + 14 committenti)
      8. Take screenshot of the dropdown area
    Expected Result: Dropdown populated with 14 committenti from API, alphabetically sorted
    Failure Indicators: Dropdown empty, shows "Caricamento..." permanently, missing committenti
    Evidence: .sisyphus/evidence/task-4-dropdown-loaded.png

  Scenario: Form works when API is slow/unavailable (fallback)
    Tool: Playwright (playwright skill)
    Preconditions: App running
    Steps:
      1. Navigate to https://driverscompany.vercel.app
      2. Open browser DevTools Network tab, check if committenti fetch completed
      3. Regardless of fetch result, verify dropdown has options (fallback works)
      4. Verify dropdown is functional (can select a value)
    Expected Result: Dropdown always has options — either from API or from fallback
    Evidence: .sisyphus/evidence/task-4-fallback-check.png
  ```

  **Commit**: YES (groups with Task 5)
  - Message: `feat(committenti): dynamic committenti management from admin panel`
  - Files: `components/StudioInformationStep.tsx`

- [x] 5. Gestione Committenti Admin Component + Page Wiring

  **What to do**:
  - Create a new file `components/GestioneCommittenti.tsx` — admin CRUD component for committenti
  - The component should:
    - Fetch and display the current committenti list from GET webhook on mount
    - Show each committente as a styled row with a red "X" remove button
    - Have an input field + "Aggiungi" button at the top to add new committenti
    - Show inline success/error messages after add/remove operations
    - Show a loading state while fetching the initial list
    - After add/remove, update the list from the API response (don't refetch separately)
    - Handle errors gracefully with Italian error messages
  - Update `src/app/page.tsx` to add admin sub-navigation:
    - Add a new state: `adminView: 'billing' | 'committenti'` (default: `'billing'`)
    - In the `viewMode === 'admin'` section, render a toggle bar above the content:
      - Two buttons: "Fatturazione" and "Gestione Committenti"
      - Active button gets `bg-blue-600 text-white`, inactive gets `text-gray-600 hover:bg-gray-100`
      - Use same rounded-full pill style as the form/admin toggle
    - Render `<AdminBilling />` when `adminView === 'billing'`
    - Render `<GestioneCommittenti />` when `adminView === 'committenti'`
    - Import `GestioneCommittenti` at the top of page.tsx

  **UI Design for GestioneCommittenti.tsx:**
  - Use existing style tokens from the project:
    - Card: `bg-white shadow-xl border-0 rounded-2xl overflow-hidden`
    - Labels: `text-sm font-medium text-gray-700 mb-1.5 block`
    - Input: `border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 h-12 transition-all duration-200`
    - Primary button: `bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 px-6`
    - Danger button (remove): `text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg p-1.5 transition-colors`
  - Import icons from `lucide-react`: `Plus`, `X`, `Building2`, `AlertCircle`, `Check`
  - Import `Card`, `CardContent` from `./ui/card`, `Button` from `./ui/button`, `Input` from `./ui/input`
  - Header: "Gestione Committenti" with `Building2` icon
  - Success toast: green bg with check icon, auto-dismiss after 3s
  - Error toast: red bg with alert icon
  - Empty state: "Nessun committente configurato" message
  - Count badge: "N committenti" in a gray pill

  **Must NOT do**:
  - Do NOT add new npm dependencies
  - Do NOT modify `components/ui/*.tsx`
  - Do NOT add English UI text
  - Do NOT add authentication changes (admin already password-protected)
  - Do NOT add editing/renaming (only add/remove)
  - Do NOT add committente metadata (email, phone, etc.)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `[]`
  - Reason: New component creation with fetch logic, state management, and UI. More complex than a quick change but not visual-engineering level.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Task 4)
  - **Blocks**: Task 6
  - **Blocked By**: Tasks 2, 3 (both GET and POST webhooks must exist)

  **References**:

  **Pattern References**:
  - `components/AdminBilling.tsx` — follow exact same patterns for: component structure, Card/CardContent usage, icon imports from lucide-react, loading/error/empty states, fetch pattern, Button/Input usage
  - `components/AdminBilling.tsx:75-91` — state declarations pattern (useState hooks)
  - `components/AdminBilling.tsx:94-117` — fetch callback pattern (useCallback, try/catch, setIsLoading)
  - `components/AdminBilling.tsx:134-192` — loading/error/empty render pattern
  - `components/AdminBilling.tsx:386-404` — styled card with badge pattern
  - `src/app/page.tsx:281-318` — view mode toggle pattern (form/admin pills) — replicate for billing/committenti sub-toggle

  **API/Type References**:
  - GET: `https://n8n.madani.agency/webhook/committenti` → `{ committenti: string[] }`
  - POST add: `https://n8n.madani.agency/webhook/committenti-manage` body `{ action: "add", name: "X" }` → `{ success: boolean, committenti?: string[], error?: string }`
  - POST remove: `https://n8n.madani.agency/webhook/committenti-manage` body `{ action: "remove", name: "X" }` → `{ success: boolean, committenti?: string[], error?: string }`

  **Acceptance Criteria**:
  - [ ] `components/GestioneCommittenti.tsx` created with correct structure
  - [ ] `src/app/page.tsx` has admin sub-navigation (Fatturazione | Committenti)
  - [ ] Admin panel shows "Gestione Committenti" section when tab is selected
  - [ ] List displays current 14 committenti from API
  - [ ] Add: typing name + clicking "Aggiungi" adds to list, shows success message
  - [ ] Remove: clicking "X" removes from list, shows success message
  - [ ] Duplicate add shows error message in Italian
  - [ ] Empty name add shows error message in Italian
  - [ ] All UI text is in Italian
  - [ ] No TypeScript errors: `npm run build` passes

  **QA Scenarios:**

  ```
  Scenario: Admin can view committenti list
    Tool: Playwright (playwright skill)
    Preconditions: App running at https://driverscompany.vercel.app, n8n workflows active
    Steps:
      1. Navigate to https://driverscompany.vercel.app
      2. Click "Amministrazione" tab
      3. Handle password prompt: enter "Drivers123@"
      4. Click "Gestione Committenti" sub-tab
      5. Wait for committenti list to load
      6. Assert 14 committente entries are visible
      7. Assert entries include "Bravin", "Dentalica", "Unident"
      8. Take screenshot
    Expected Result: 14 committenti displayed in a styled list
    Failure Indicators: Empty list, loading spinner stuck, error message shown
    Evidence: .sisyphus/evidence/task-5-view-committenti.png

  Scenario: Admin can add a new committente
    Tool: Playwright (playwright skill)
    Preconditions: Admin panel open on Gestione Committenti tab
    Steps:
      1. Find the input field for adding a new committente
      2. Type "NuovoLab" in the input
      3. Click "Aggiungi" button
      4. Wait for success message to appear
      5. Assert "NuovoLab" now appears in the committenti list
      6. Assert list now has 15 entries
      7. Take screenshot
    Expected Result: "NuovoLab" added to list, success message shown
    Evidence: .sisyphus/evidence/task-5-add-committente.png

  Scenario: Admin can remove a committente
    Tool: Playwright (playwright skill)
    Preconditions: "NuovoLab" was added in previous scenario
    Steps:
      1. Find "NuovoLab" entry in the committenti list
      2. Click the red "X" remove button next to it
      3. Wait for success message to appear
      4. Assert "NuovoLab" no longer appears in the list
      5. Assert list is back to 14 entries
      6. Take screenshot
    Expected Result: "NuovoLab" removed from list, success message shown
    Evidence: .sisyphus/evidence/task-5-remove-committente.png

  Scenario: Duplicate add shows error
    Tool: Playwright (playwright skill)
    Preconditions: Admin panel open on Gestione Committenti tab
    Steps:
      1. Type "Bravin" in the add input field (already exists)
      2. Click "Aggiungi" button
      3. Wait for error message to appear
      4. Assert error message is in Italian
      5. Assert list still has 14 entries (not 15)
    Expected Result: Error message shown, list unchanged
    Evidence: .sisyphus/evidence/task-5-duplicate-error.png
  ```

  **Commit**: YES
  - Message: `feat(committenti): dynamic committenti management from admin panel`
  - Files: `components/GestioneCommittenti.tsx`, `components/StudioInformationStep.tsx`, `src/app/page.tsx`
  - Pre-commit: `npm run build`

- [x] 6. Build Verification + Commit + Push

  **What to do**:
  - Run `npm run build` in the project directory to verify zero TypeScript errors
  - If build fails, fix any TypeScript errors in the files changed by Tasks 4 and 5
  - Stage all changed files: `StudioInformationStep.tsx`, `GestioneCommittenti.tsx`, `page.tsx`
  - Create a single commit: `feat(committenti): dynamic committenti management from admin panel`
  - Push to `origin/main`
  - Vercel will auto-deploy from the push

  **Must NOT do**:
  - Do NOT force push
  - Do NOT modify files that weren't changed by Tasks 4-5
  - Do NOT skip the build check

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `['git-master']`
  - Reason: Standard build + commit + push. git-master skill for proper commit workflow.

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (sequential after Wave 2)
  - **Blocks**: F1-F4 (final verification)
  - **Blocked By**: Tasks 4, 5

  **References**:

  **Pattern References**:
  - Previous commits: `26639b6` and `5ea2109` — follow same commit message style (`feat(scope): description`)
  - Build command: `npm run build` in project root

  **Acceptance Criteria**:
  - [ ] `npm run build` exits with code 0
  - [ ] Single commit created with descriptive message
  - [ ] Pushed to `origin/main`
  - [ ] No untracked/unstaged files left behind

  **QA Scenarios:**

  ```
  Scenario: Build succeeds and deploy triggers
    Tool: Bash
    Steps:
      1. Run `npm run build` in project directory
      2. Assert exit code is 0
      3. Run `git status` — assert working tree clean
      4. Run `git log -1 --oneline` — assert latest commit message starts with "feat(committenti)"
      5. Run `git status` — assert "Your branch is up to date with 'origin/main'"
    Expected Result: Build passes, commit pushed, branch up to date
    Failure Indicators: Build errors, uncommitted changes, unpushed commits
    Evidence: .sisyphus/evidence/task-6-build-deploy.txt
  ```

  **Commit**: YES (this IS the commit task)
  - Message: `feat(committenti): dynamic committenti management from admin panel`
  - Files: `components/GestioneCommittenti.tsx`, `components/StudioInformationStep.tsx`, `src/app/page.tsx`
  - Pre-commit: `npm run build`

---
## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Rejection → fix → re-run.

- [x] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (curl endpoint, read file, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [x] F2. **Code Quality Review** — `unspecified-high`
  Run `npm run build`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names. Verify TypeScript strict compliance.
  Output: `Build [PASS/FAIL] | Files [N clean/N issues] | VERDICT`

- [x] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
  Start from clean state. Open admin panel → "Gestione Committenti" → add a new committente → verify it appears in the list. Navigate to form → verify new committente appears in dropdown. Go back to admin → remove it → verify form dropdown no longer shows it. Test edge cases: empty name, duplicate name, special characters. Save evidence to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [x] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec was built, nothing beyond spec was built. Check "Must NOT do" compliance. Detect cross-task contamination. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **Wave 2 complete**: `feat(committenti): dynamic committenti management from admin panel` — StudioInformationStep.tsx, GestioneCommittenti.tsx, page.tsx, formOptions.ts
- Pre-commit: `npm run build`

---

## Success Criteria

### Verification Commands
```bash
# GET committenti list
curl -s https://n8n.madani.agency/webhook/committenti | jq '.committenti | length'  # Expected: 14

# Add a committente
curl -s -X POST https://n8n.madani.agency/webhook/committenti-manage -H "Content-Type: application/json" -d '{"action":"add","name":"TestLab"}' | jq '.success'  # Expected: true

# Verify it was added
curl -s https://n8n.madani.agency/webhook/committenti | jq '.committenti | map(select(. == "TestLab")) | length'  # Expected: 1

# Remove it
curl -s -X POST https://n8n.madani.agency/webhook/committenti-manage -H "Content-Type: application/json" -d '{"action":"remove","name":"TestLab"}' | jq '.success'  # Expected: true

# Verify it was removed
curl -s https://n8n.madani.agency/webhook/committenti | jq '.committenti | length'  # Expected: 14

# Build
npm run build  # Expected: exit code 0
```

### Final Checklist
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] Build passes
- [ ] Admin can add/remove committenti without code changes
- [ ] Form dropdown reflects changes immediately
