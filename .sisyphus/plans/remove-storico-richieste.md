# Rimuovi Storico Richieste

## TL;DR

> **Quick Summary**: Remove the "Storico Richieste" (submission history) feature entirely — navigation tab, component, and related code.
> 
> **Deliverables**:
> - `src/app/page.tsx` cleaned of all history references
> - `components/SubmissionHistory.tsx` deleted
> 
> **Estimated Effort**: Quick
> **Parallel Execution**: NO — 1 task

---

## Context

### Original Request
User wants the "Storico Richieste" tab and feature removed from the app.

---

## Work Objectives

### Core Objective
Remove the submission history feature from the UI and codebase.

### Must Have
- "Storico Richieste" tab removed from navigation
- History view removed
- Component file deleted
- Build passes
- Committed and pushed

### Must NOT Have (Guardrails)
- No changes to `components/ui/*.tsx`
- No changes to `localStorage.ts` (keep functions there, just unused)
- No other feature changes

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION**

### Test Decision
- **Automated tests**: None
- **Framework**: N/A

### QA Policy
- Build must pass: `npm run build` exits 0
- Verify "Storico Richieste" button is gone from navigation

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1:
└── Task 1: Remove storico richieste + build + commit + push [quick, git-master]
```

---

## TODOs

- [ ] 1. Remove Storico Richieste Feature

  **What to do**:

  Edit `src/app/page.tsx` — make these 6 changes:

  **A.** Line 5: Remove `saveSubmission` from import:
  ```
  // FROM:
  import { getSenderProfile, saveSenderProfile, saveRecipient, saveSubmission } from '../services/localStorage';
  // TO:
  import { getSenderProfile, saveSenderProfile, saveRecipient } from '../services/localStorage';
  ```

  **B.** Line 16: Delete the entire SubmissionHistory import line:
  ```
  import { SubmissionHistory } from '../../components/SubmissionHistory';
  ```

  **C.** Line 26: Remove `'history'` from viewMode type:
  ```
  // FROM:
  const [viewMode, setViewMode] = useState<'form' | 'history' | 'admin'>('form');
  // TO:
  const [viewMode, setViewMode] = useState<'form' | 'admin'>('form');
  ```

  **D.** Lines 303-312: Delete the "Storico Richieste" nav button:
  ```tsx
  <button
    onClick={() => setViewMode('history')}
    className={`px-3 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
      viewMode === 'history'
        ? 'bg-blue-600 text-white shadow-md'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
    }`}
  >
    Storico Richieste
  </button>
  ```

  **E.** Lines 229-234: Delete the `saveSubmission(...)` call inside handleSubmit:
  ```tsx
  saveSubmission({
    id: `SUB_${Date.now()}`,
    timestamp: new Date().toISOString(),
    formData,
    recipientCount: formData.recipients.length,
  });
  ```

  **F.** Lines 497-499: Delete the history view render block:
  ```tsx
  {viewMode === 'history' && (
    <SubmissionHistory />
  )}
  ```

  Then delete the component file:
  ```bash
  rm components/SubmissionHistory.tsx
  ```

  Then build + commit + push:
  ```bash
  npm run build  # must exit 0
  git add src/app/page.tsx components/SubmissionHistory.tsx
  git commit -m "chore: remove storico richieste feature"
  git push origin main
  ```

  **Must NOT do**:
  - Do NOT touch `components/ui/*.tsx`
  - Do NOT modify `src/services/localStorage.ts`
  - Do NOT modify any other files

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`git-master`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1 (solo)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `src/app/page.tsx` — all changes are here plus the file deletion
  - `components/SubmissionHistory.tsx` — to be deleted

  **Acceptance Criteria**:
  - [ ] `saveSubmission` removed from import on line 5
  - [ ] `SubmissionHistory` import line deleted
  - [ ] viewMode type narrowed to `'form' | 'admin'`
  - [ ] "Storico Richieste" button removed from navigation
  - [ ] `saveSubmission(...)` call removed from handleSubmit
  - [ ] `{viewMode === 'history' && ...}` block removed
  - [ ] `components/SubmissionHistory.tsx` file deleted
  - [ ] `npm run build` exits 0
  - [ ] Committed and pushed to origin/main

  **QA Scenarios:**

  ```
  Scenario: Build passes after removal
    Tool: Bash
    Steps:
      1. Run `npm run build`
      2. Assert exit code 0
    Expected Result: Clean build with no TypeScript errors
    Evidence: .sisyphus/evidence/remove-storico-build.txt

  Scenario: Navigation only shows two tabs
    Tool: Bash (grep)
    Steps:
      1. grep -c "Storico" src/app/page.tsx
      2. Assert count is 0
      3. grep -c "SubmissionHistory" src/app/page.tsx
      4. Assert count is 0
    Expected Result: Zero references to storico/history in page.tsx
  ```

  **Commit**: YES
  - Message: `chore: remove storico richieste feature`
  - Files: `src/app/page.tsx`, `components/SubmissionHistory.tsx` (deleted)

---

## Success Criteria

### Final Checklist
- [ ] "Storico Richieste" completely removed
- [ ] Build passes
- [ ] Pushed to origin/main
