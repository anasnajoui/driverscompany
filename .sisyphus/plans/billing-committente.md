# Billing Committente + Admin Panel Improvements

## TL;DR

> **Quick Summary**: Add "Laboratorio committente" optional dropdown to the order form so billing goes to the commissioning company, not the pickup location. Update n8n workflows and admin panel accordingly.
> 
> **Deliverables**:
> - "Laboratorio committente" dropdown in Step 1 of the form
> - n8n main workflow: cleaned columns + FATTURARE_A field
> - n8n billing workflow: returns FATTURARE_A + billing grouping
> - Admin panel: €6 default, alphabetical sorting, ritiro/consegna color distinction, FATTURARE_A display
> 
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 2 waves
> **Critical Path**: Task 1 → Task 2 → Task 3 → Task 4 → Task 5 → Task 6

---

## Context

### Original Request
The billing system currently groups by `NOME_STUDIO` (who fills the form), but billing should go to the "committente" (company that commissions the service). Example: Pozzi fills the form but the service is commissioned by Dentalica → bill should go to Dentalica.

### Known Committente ↔ Sub-client Mapping
```
Ortolab        → Meneguzzi, Dini Dental Team, Zampieri
Dentalica      → Distretto Sanitario, Stacchi di Gorizia, Pozzi, Tosolini, 
                 Distretto di Cervignano, Ambulatorio Prontosoccorso
Dentaltre      → Spizzo, Fiume Dentale
Syntesis       → Fiappo, Policlinico San Giorgio, Cicutto, Zangrando
Orodental      → Magris, Salus, Zanelli
Unident        → Omina Dent
Bravin, Creattiva, Saccher, Dentalline, Delpin → standalone (no sub-clients)
Lovato, Mangione, Pascolo → multi-lab (special handling, multiple labs)
```

### Google Sheet Columns (updated by user)
```
ID | DATA_RICHIESTA | DATA_RITIRO | NOME_STUDIO | EMAIL_STUDIO | TELEFONO_STUDIO | INDIRIZZO_RITIRO | ORARIO_RITIRO | CONSEGNA_A | TELEFONO_CONSEGNA | INDIRIZZO_CONSEGNA | ORARIO_CONSEGNA | NOTE_SPECIALI | NOTE_GENERALI | FATTURARE_A
```
Removed: STATO, AUTISTA, RITIRO_FATTO, CONSEGNA_FATTA, duplicate CONSEGNA_A

### Additional Requirements from Client Meeting
- Fixed price: **€6 per delivery** (not €5)
- Alphabetical sorting of clients in admin
- Visual distinction (color) between ritiro and consegna in admin detail dropdown
- Delete test data ("testing biz") from Google Sheet — **user does this manually**
- Manual Google Sheet entries may not show correctly (known limitation)

---

## Work Objectives

### Core Objective
Add a "Laboratorio committente" field to the order form that flows through to Google Sheets and the admin billing panel, enabling correct billing attribution.

### Concrete Deliverables
- `billingClient` field on `FormData` interface
- Committenti list constant with all known companies
- Dropdown UI in StudioInformationStep
- n8n Transform Data outputs `FATTURARE_A` (no more STATO/AUTISTA/RITIRO_FATTO/CONSEGNA_FATTA)
- n8n Billing Aggregate reads `FATTURARE_A`
- Admin panel: €6 default, alphabetical sort, ritiro/consegna colors, FATTURARE_A display

### Must Have
- Dropdown is **optional** — empty = billing defaults to NOME_STUDIO
- All known committenti in the dropdown list (Ortolab, Dentalica, Dentaltre, Bravin, Syntesis, Creattiva, Orodental, Saccher, Dentalline, Unident, Delpin, Lovato, Mangione, Pascolo)
- n8n writes FATTURARE_A to Google Sheets on every new submission
- Admin panel groups billing by FATTURARE_A when present, falls back to NOME_STUDIO
- Default cost per delivery = €6
- Clients sorted alphabetically in admin panel
- Ritiro and consegna visually distinct (different colors) in the delivery detail dropdown

### Must NOT Have
- No authentication changes
- No new npm dependencies
- No react-router
- No `as any` or `@ts-ignore`
- No English UI text
- Do NOT touch `components/ui/*.tsx`
- Do NOT delete Google Sheet rows (user handles test data manually)
- No complex auto-mapping logic — just a simple dropdown

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed.

### Test Decision
- **Infrastructure exists**: NO
- **Automated tests**: None
- **Agent-Executed QA**: Playwright for UI, curl for API, browser for admin panel

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation — all independent):
├── Task 1: Add billingClient to types + constants [quick]
├── Task 4: Update n8n main workflow Transform Data [quick]
└── Task 5: Update n8n billing workflow Aggregate [quick]

Wave 2 (Depends on Wave 1):
├── Task 2: Add dropdown to StudioInformationStep (depends: 1) [quick]
├── Task 3: Wire billingClient in page.tsx submission (depends: 1) [quick]
└── Task 6: Update AdminBilling panel (depends: 5) [unspecified-high]

Wave FINAL:
└── Task 7: Build verification + deploy [quick]
```

---

## TODOs

- [ ] 1. Add `billingClient` field to FormData type and constants

  **What to do**:
  - In `src/types/form.ts`: Add `billingClient: string;` to the `FormData` interface, between `pickupLocation` and `recipients`
  - In `src/constants/formOptions.ts`: 
    - Add `billingClient: ''` to `initialFormData`
    - Export a `COMMITTENTI` array constant with these values in alphabetical order:
      ```typescript
      export const COMMITTENTI = [
        'Bravin',
        'Creattiva',
        'Delpin',
        'Dentalica',
        'Dentalline',
        'Dentaltre',
        'Lovato',
        'Mangione',
        'Orodental',
        'Ortolab',
        'Pascolo',
        'Saccher',
        'Syntesis',
        'Unident',
      ];
      ```

  **Must NOT do**:
  - Don't add any validation — the field is optional
  - Don't change any other fields in FormData

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 4, 5)
  - **Blocks**: Tasks 2, 3
  - **Blocked By**: None

  **References**:
  - `src/types/form.ts` — Current FormData interface (add field after line 23 `pickupLocation`)
  - `src/constants/formOptions.ts` — Current initialFormData (add `billingClient: ''` after `pickupLocation` line 19)

  **QA Scenarios**:
  ```
  Scenario: TypeScript compiles with new field
    Tool: Bash
    Steps:
      1. Run `npm run build` in project root
    Expected Result: Build succeeds with 0 errors
    Evidence: .sisyphus/evidence/task-1-build.txt
  ```

  **Commit**: YES (groups with Task 2, 3)
  - Message: `feat(form): add billingClient field and committenti list`
  - Files: `src/types/form.ts`, `src/constants/formOptions.ts`

---

- [ ] 2. Add "Laboratorio committente" dropdown to StudioInformationStep

  **What to do**:
  - In `components/StudioInformationStep.tsx`:
    - Import `COMMITTENTI` from `'../src/constants/formOptions'`
    - Add a new form field AFTER the "Nome dell'azienda" field (after line 67) and BEFORE the Contact grid (before line 70)
    - The field is an **optional** native `<select>` dropdown:
      ```tsx
      {/* Laboratorio Committente (optional) */}
      <div>
        <Label htmlFor="billingClient" className="text-sm font-medium text-gray-700 mb-1.5 block">
          Laboratorio committente <span className="text-gray-400 font-normal">(opzionale)</span>
        </Label>
        <select
          id="billingClient"
          value={formData.billingClient}
          onChange={(e) => onInputChange('billingClient', e.target.value)}
          className="w-full px-4 h-12 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none text-gray-700 transition-all duration-200"
        >
          <option value="">— Seleziona (se applicabile) —</option>
          {COMMITTENTI.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        <p className="text-sm text-gray-400 mt-1">
          A quale laboratorio fatturare questo servizio?
        </p>
      </div>
      ```
    - Style must match existing dropdowns (same classes as pickupTime select on line 191)
    - All text in Italian

  **Must NOT do**:
  - Don't make the field required
  - Don't add validation for this field
  - Don't change any other fields

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 3)
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 7
  - **Blocked By**: Task 1

  **References**:
  - `components/StudioInformationStep.tsx` — Full component, insert after company name field (line 67)
  - `components/StudioInformationStep.tsx:187-196` — Existing select pattern to match (pickupTime)
  - `src/constants/formOptions.ts` — Where COMMITTENTI is exported from

  **QA Scenarios**:
  ```
  Scenario: Dropdown renders with all committenti options
    Tool: Playwright
    Steps:
      1. Navigate to http://localhost:3001
      2. Take snapshot of page
      3. Verify select element with id="billingClient" exists
      4. Verify it has 15 options (1 empty + 14 committenti)
      5. Select "Dentalica" from dropdown
      6. Verify selection persists
    Expected Result: Dropdown visible, selectable, shows all 14 committenti + empty option
    Evidence: .sisyphus/evidence/task-2-dropdown.png

  Scenario: Dropdown is optional — form submits without selection
    Tool: Playwright
    Steps:
      1. Navigate to http://localhost:3001
      2. Leave billingClient dropdown empty
      3. Fill all required fields
      4. Click "Continua"
    Expected Result: Form proceeds to Step 2 without error
    Evidence: .sisyphus/evidence/task-2-optional.png
  ```

  **Commit**: YES (groups with Task 1, 3)
  - Message: `feat(form): add billingClient field and committenti list`
  - Files: `components/StudioInformationStep.tsx`

---

- [ ] 3. Wire billingClient through page.tsx form submission

  **What to do**:
  - The form already sends `JSON.stringify(formData)` on line 214 of `src/app/page.tsx`, so `billingClient` is automatically included if it's in the FormData interface
  - **BUT** check the localStorage save logic — the `saveSenderProfile` call (around line 230-240) may need updating to include `billingClient`
  - Check `src/services/localStorage.ts` — the `SenderProfile` type in `src/types/storage.ts` may need `billingClient` added
  - Add `billingClient` to the `SenderProfile` interface and the `saveSenderProfile`/`getSenderProfile` functions
  - In the `useEffect` that loads saved profile (page.tsx around line 27-39), add `billingClient: savedProfile.billingClient || ''`
  - In the submission success handler, ensure `billingClient` is saved to localStorage profile

  **Must NOT do**:
  - Don't change the webhook URL
  - Don't change any validation logic
  - Don't add billingClient to validation — it's optional

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 2)
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 7
  - **Blocked By**: Task 1

  **References**:
  - `src/app/page.tsx:27-39` — useEffect loading saved profile
  - `src/app/page.tsx:214` — form submission (already sends full formData)
  - `src/app/page.tsx:230-240` — saveSenderProfile call after successful submission
  - `src/types/storage.ts` — SenderProfile interface
  - `src/services/localStorage.ts` — saveSenderProfile/getSenderProfile functions

  **QA Scenarios**:
  ```
  Scenario: billingClient included in form POST body
    Tool: Playwright
    Steps:
      1. Navigate to http://localhost:3001
      2. Select "Dentalica" from billingClient dropdown
      3. Fill all required fields with test data
      4. Monitor network requests
      5. Submit the form (or inspect form data before submission)
    Expected Result: POST body includes `billingClient: "Dentalica"`
    Evidence: .sisyphus/evidence/task-3-submission.txt

  Scenario: billingClient persists via localStorage
    Tool: Playwright
    Steps:
      1. Navigate to http://localhost:3001
      2. Select "Ortolab" from billingClient dropdown
      3. Fill company name with "Test Studio"
      4. Reload page
      5. Check if billingClient dropdown shows "Ortolab"
    Expected Result: billingClient value restored from localStorage
    Evidence: .sisyphus/evidence/task-3-persist.png
  ```

  **Commit**: YES (groups with Task 1, 2)
  - Message: `feat(form): add billingClient field and committenti list`
  - Files: `src/app/page.tsx`, `src/types/storage.ts`, `src/services/localStorage.ts`

---

- [ ] 4. Update n8n main workflow — clean columns + add FATTURARE_A

  **What to do**:
  - Update the **Transform Data** code node (id: `f0f7c870-1591-4602-85ce-ef58cf08e3ac`) in workflow `4thMwDmBvacFEGNZ`
  - **Remove** these fields from the output JSON: `STATO`, `AUTISTA`, `RITIRO_FATTO`, `CONSEGNA_FATTA`
  - **Add** this field to the output JSON: `FATTURARE_A: formData.billingClient || ''`
  - The field reads from `formData.billingClient` which comes from the POST body
  - Use `n8n_update_partial_workflow` with `updateNode` operation targeting nodeId `f0f7c870-1591-4602-85ce-ef58cf08e3ac`
  - The updated jsCode should produce output items with exactly these fields in this order:
    ```
    ID, DATA_RICHIESTA, DATA_RITIRO, NOME_STUDIO, EMAIL_STUDIO, TELEFONO_STUDIO,
    INDIRIZZO_RITIRO, ORARIO_RITIRO, CONSEGNA_A, TELEFONO_CONSEGNA, 
    INDIRIZZO_CONSEGNA, ORARIO_CONSEGNA, NOTE_SPECIALI, NOTE_GENERALI, FATTURARE_A
    ```
  - Keep ALL existing logic (date formatting, pickup time display, recipient iteration, error handling)
  - Just remove the 4 fields and add FATTURARE_A

  **Must NOT do**:
  - Don't change the webhook path or node connections
  - Don't deactivate the workflow
  - Don't modify any other nodes (emails, PDF, response)
  - Don't change the output structure beyond removing 4 fields and adding 1

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 5)
  - **Blocks**: Task 7
  - **Blocked By**: None

  **References**:
  - n8n workflow `4thMwDmBvacFEGNZ`, node id `f0f7c870-1591-4602-85ce-ef58cf08e3ac` (Transform Data)
  - Current jsCode is in the workflow — keep ALL logic, just modify the output object fields
  - The email template nodes (`Generate Confirmation Email`, `Generate Notification Email`) reference `STATO` — check if they do and remove those references too. Actually the confirmation email node (id `b1e83eed-8ab0-4299-b7ed-8413a56b90d5`) and notification email node (id `e3e9a749-b193-4c41-b897-9fcaab3c1ea5`) build their HTML from the Transform Data output. If they reference `data.STATO`, remove those references.

  **QA Scenarios**:
  ```
  Scenario: Workflow validates after update
    Tool: n8n MCP
    Steps:
      1. Use n8n_validate_workflow with id "4thMwDmBvacFEGNZ"
    Expected Result: No critical errors
    Evidence: .sisyphus/evidence/task-4-validate.txt
  
  Scenario: Verify Transform Data output fields
    Tool: n8n MCP
    Steps:
      1. Use n8n_get_workflow with id "4thMwDmBvacFEGNZ" mode "full"
      2. Read Transform Data node jsCode
      3. Verify output includes FATTURARE_A
      4. Verify output does NOT include STATO, AUTISTA, RITIRO_FATTO, CONSEGNA_FATTA
    Expected Result: Correct fields in output
    Evidence: .sisyphus/evidence/task-4-fields.txt
  ```

  **Commit**: NO (n8n workflow, not in git)

---

- [ ] 5. Update n8n billing workflow — include FATTURARE_A in response

  **What to do**:
  - Update the **Aggregate Billing** code node (id: `billing-aggregate`) in workflow `7DUsuL7VeiBObF3l`
  - The node was already updated in a previous session to include `deliveryDetails` — now also include `FATTURARE_A`
  - In the `deliveryDetails.push()` call, add: `billingClient: data.FATTURARE_A || ''`
  - In the client-level output, add: `billingClient` field (use the most common FATTURARE_A value for that client, or empty if none)
  - Use `n8n_update_partial_workflow` targeting nodeId `billing-aggregate`

  **Must NOT do**:
  - Don't change webhook path or other nodes
  - Don't break existing deliveryDetails structure

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 4)
  - **Blocks**: Task 6
  - **Blocked By**: None

  **References**:
  - n8n workflow `7DUsuL7VeiBObF3l`, node id `billing-aggregate`
  - The current code already iterates rows and builds `deliveryDetails` array — just add `billingClient` field to each detail and to the client summary

  **QA Scenarios**:
  ```
  Scenario: Billing API returns FATTURARE_A data
    Tool: Bash (curl)
    Steps:
      1. curl -s "https://n8n.madani.agency/webhook/dental-logistics-billing?month=2026-03"
      2. Parse JSON response
      3. Check client objects have billingClient field
      4. Check deliveryDetails items have billingClient field
    Expected Result: Fields present (may be empty if no data has FATTURARE_A yet)
    Evidence: .sisyphus/evidence/task-5-api.json
  ```

  **Commit**: NO (n8n workflow, not in git)

---

- [ ] 6. Update AdminBilling panel — €6 default, alphabetical sort, colors, FATTURARE_A

  **What to do**:
  - In `components/AdminBilling.tsx`:
  
  **6a. Default cost €6:**
  - Line 61: Change `const [costPerDelivery, setCostPerDelivery] = useState(5.0);` → `useState(6.0);`
  
  **6b. Alphabetical sorting:**
  - In the client list rendering (around line 283-293), the clients are already mapped from the API which sorts by delivery count. Add a sort toggle or just sort alphabetically by default:
  - Add a state: `const [sortAlpha, setSortAlpha] = useState(true);`
  - Before rendering clients, sort: `const sortedClients = [...data.clients].sort((a, b) => sortAlpha ? a.name.localeCompare(b.name) : b.deliveries - a.deliveries)`
  - Add a small toggle button next to "Dettaglio Clienti" heading to switch between alphabetical (A-Z) and by delivery count
  
  **6c. Ritiro/Consegna color distinction in dropdown:**
  - In the ClientCard expandable delivery details section, each detail row currently shows destination, address, time, notes
  - Add visual indicators:
    - Use a small colored badge/tag for the delivery type
    - Ritiro (pickup): orange color scheme (bg-orange-50, text-orange-700)
    - Consegna (delivery): green color scheme (bg-green-50, text-green-700)
    - Since each Google Sheets row is a delivery (CONSEGNA_A), and the pickup info (INDIRIZZO_RITIRO) is the same for all rows from that client, show:
      - A "Ritiro" section at the top of the expanded area with the pickup address (orange)
      - Individual "Consegna" items below (green)
  
  **6d. Show FATTURARE_A (billing client):**
  - Add `billingClient` to the `DeliveryDetail` interface (already has it from Task 5)
  - Add `billingClient` to the `BillingClient` interface
  - In the ClientCard, if `client.billingClient` exists and differs from `client.name`, show a small badge: "Fatturare a: {billingClient}" in blue/purple

  **Must NOT do**:
  - Don't break existing functionality
  - Don't add English text
  - Don't touch components/ui/
  - Don't add new npm dependencies

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 7
  - **Blocked By**: Tasks 1, 5

  **References**:
  - `components/AdminBilling.tsx` — Full file, all changes happen here
  - `components/AdminBilling.tsx:61` — costPerDelivery default (change 5.0 → 6.0)
  - `components/AdminBilling.tsx:283-293` — Client list rendering (add sorting)
  - `components/AdminBilling.tsx:374-490` — ClientCard component (add colors, FATTURARE_A badge)
  - `components/AdminBilling.tsx:22-44` — DeliveryDetail and BillingClient interfaces (add billingClient)

  **QA Scenarios**:
  ```
  Scenario: Default cost is €6
    Tool: Playwright
    Steps:
      1. Navigate to http://localhost:3001
      2. Enter admin password "Drivers123@"
      3. Click "Configurazione Costi"
      4. Check default value in cost input
    Expected Result: Input shows 6.00
    Evidence: .sisyphus/evidence/task-6-cost.png

  Scenario: Clients sorted alphabetically
    Tool: Playwright
    Steps:
      1. Navigate to admin panel
      2. Check client card order
    Expected Result: Cards appear in A-Z order by name
    Evidence: .sisyphus/evidence/task-6-sort.png

  Scenario: Ritiro/Consegna color distinction
    Tool: Playwright
    Steps:
      1. Navigate to admin panel
      2. Expand a client's delivery details
      3. Check for orange (ritiro) and green (consegna) colored sections
    Expected Result: Pickup info in orange, delivery items in green
    Evidence: .sisyphus/evidence/task-6-colors.png
  ```

  **Commit**: YES
  - Message: `feat(admin): €6 default, alphabetical sort, ritiro/consegna colors, billing client display`
  - Files: `components/AdminBilling.tsx`

---

- [ ] 7. Build verification + deploy

  **What to do**:
  - Run `npm run build` to verify everything compiles
  - Fix any TypeScript errors
  - Commit all frontend changes
  - Push to `main` for Vercel auto-deploy
  - Verify deployed site loads correctly

  **Must NOT do**:
  - Don't force push
  - Don't skip the build check

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `['git-master']`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave FINAL
  - **Blocks**: None
  - **Blocked By**: All previous tasks

  **References**:
  - `package.json` — build command: `npm run build`
  - Git remote: `origin` → `https://github.com/anasnajoui/driverscompany.git`
  - Branch: `main`

  **QA Scenarios**:
  ```
  Scenario: Production build succeeds
    Tool: Bash
    Steps:
      1. Run npm run build in project root
    Expected Result: "✓ built in Xs" with 0 errors
    Evidence: .sisyphus/evidence/task-7-build.txt

  Scenario: Deployed site loads
    Tool: Playwright
    Steps:
      1. Navigate to https://driverscompany.vercel.app
      2. Verify page loads with form
      3. Verify billingClient dropdown exists
    Expected Result: Site loads, dropdown visible
    Evidence: .sisyphus/evidence/task-7-deploy.png
  ```

  **Commit**: YES
  - Message: `feat: billing committente field, admin panel improvements`
  - Files: All modified files
  - Pre-commit: `npm run build`

---

## Commit Strategy

- **Commit 1** (Tasks 1+2+3): `feat(form): add billingClient field and committenti dropdown`
  - `src/types/form.ts`, `src/constants/formOptions.ts`, `components/StudioInformationStep.tsx`, `src/app/page.tsx`, `src/types/storage.ts`, `src/services/localStorage.ts`
- **Commit 2** (Task 6): `feat(admin): €6 default, alphabetical sort, ritiro/consegna colors, billing client display`
  - `components/AdminBilling.tsx`
- **Push**: After all commits, single push to `main`
- **n8n** (Tasks 4, 5): Updated via API, no git commits needed

---

## Success Criteria

### Verification Commands
```bash
npm run build  # Expected: ✓ built in Xs, 0 errors
```

### Final Checklist
- [ ] Form has "Laboratorio committente" optional dropdown with 14 committenti
- [ ] Dropdown value persists via localStorage
- [ ] n8n writes FATTURARE_A to Google Sheets
- [ ] n8n no longer writes STATO, AUTISTA, RITIRO_FATTO, CONSEGNA_FATTA
- [ ] Admin panel default cost is €6
- [ ] Admin panel clients sorted alphabetically
- [ ] Admin panel delivery details show ritiro (orange) vs consegna (green)
- [ ] Admin panel shows "Fatturare a" when billingClient differs from NOME_STUDIO
- [ ] All UI text in Italian
- [ ] Build passes, deployed to Vercel
