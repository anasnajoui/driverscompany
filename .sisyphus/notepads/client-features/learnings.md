# Learnings — client-features

## [2026-03-11] Session — Orchestrator audit

### Confirmed Done (verified by reading files)
- `src/types/storage.ts`: Has DaySchedule, StructuredHours, SenderProfile, SavedRecipient, BillingConfig, StorageSchema — BUT missing `SavedSubmission` interface and `submissions: SavedSubmission[]` in StorageSchema
- `src/services/localStorage.ts`: Has getSenderProfile, saveSenderProfile, getAddressBook, saveRecipient, removeRecipient, getBillingConfig, saveBillingConfig, clearAll — BUT missing `saveSubmission()` and `getSubmissions()`
- `components/StudioHoursSelector.tsx`: EXISTS and exports `defaultStructuredHours`, `serializeHours`
- `components/RecipientAddressBook.tsx`: EXISTS and integrated in RecipientsDeliveryStep
- `components/AdminBilling.tsx`: EXISTS (517 lines, fully functional)
- `src/app/page.tsx`: Has `viewMode` state as `'form' | 'admin'` (line 24), has 2 nav tabs (Nuova Richiesta, Amministrazione), renders AdminBilling when viewMode==='admin'. Auto-populates from localStorage on mount. Saves sender profile + recipients on submit.
- `ARCHITECTURE.md`: Already updated with most features (365+ lines, mentions SubmissionHistory, localStorage, billing endpoint, etc.)

### Confirmed NOT Done (confirmed missing)
1. `src/types/storage.ts` line 52: Missing `SavedSubmission` interface + `submissions: SavedSubmission[]` in StorageSchema
2. `src/services/localStorage.ts`: Missing `saveSubmission()` and `getSubmissions()` functions
3. `components/SubmissionHistory.tsx`: Does NOT exist
4. `src/app/page.tsx` line 24: viewMode type is `'form' | 'admin'` — needs `'history'` added
5. `src/app/page.tsx`: Missing "Storico Richieste" nav tab
6. `src/app/page.tsx`: Missing `<SubmissionHistory />` render when viewMode==='history'
7. `src/app/page.tsx` handleSubmit: Missing `saveSubmission()` call after response.ok

### Key Architecture Facts
- Components live in `/components/` (project root), NOT in `src/`
- Types/services live in `src/types/` and `src/services/`
- Import path from components to src: `'../src/types/storage'` or `'../src/services/localStorage'`
- Import path from page.tsx to components: `'../../components/SubmissionHistory'`
- Import path from page.tsx to services: `'../services/localStorage'` (already used)
- `viewMode` state is on line 24 of page.tsx
- Nav tabs are in the JSX starting around line 282
- handleSubmit success block starts around line 221
- `saveSubmission` needs to be imported from `'../services/localStorage'`

### SavedSubmission Interface (to add to storage.ts)
```typescript
export interface SavedSubmission {
  id: string;        // 'SUB_' + Date.now()
  timestamp: string; // ISO timestamp
  formData: FormData;
  recipientCount: number;
}
```
NOTE: FormData is imported from `'../types/form'` in localStorage.ts

### StorageSchema additions needed
```typescript
submissions: SavedSubmission[];
```
And in getDefaultStorage():
```typescript
submissions: [],
```

### localStorage.ts additions needed
```typescript
export const saveSubmission = (submission: SavedSubmission): void => {
  const storage = getStorage();
  storage.submissions.unshift(submission);
  if (storage.submissions.length > 50) {
    storage.submissions = storage.submissions.slice(0, 50);
  }
  saveStorage(storage);
};

export const getSubmissions = (): SavedSubmission[] => {
  return getStorage().submissions;
};
```

### page.tsx changes needed
1. Line 24: `'form' | 'admin'` → `'form' | 'history' | 'admin'`
2. Add import: `import { SubmissionHistory } from '../../components/SubmissionHistory';`
3. Add import: `saveSubmission` to existing localStorage import on line 5
4. Add "Storico Richieste" tab button between "Nuova Richiesta" and "Amministrazione"
5. Add `{viewMode === 'history' && <SubmissionHistory />}` render block
6. In handleSubmit after response.ok (around line 225): add saveSubmission call

### Style Tokens (from existing codebase)
- Labels: `text-sm font-medium text-gray-700 mb-1.5 block`
- Card: `bg-white shadow-xl border-0 rounded-2xl overflow-hidden`
- Primary button: `bg-blue-600 hover:bg-blue-700 text-white`
- Danger button: `bg-red-600 hover:bg-red-700 text-white`
- Nav tab active: `bg-blue-600 text-white shadow-md`
- Nav tab inactive: `text-gray-600 hover:text-gray-900 hover:bg-gray-100`
- Tab container: `bg-white rounded-full p-1 sm:p-1.5 shadow-lg border border-gray-100 inline-flex gap-0.5 sm:gap-1`
- Tab button: `px-3 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200`

### ARCHITECTURE.md Status
Already updated with most features. The file already mentions:
- SubmissionHistory component (line 363-364)
- localStorage schema with submissions (line 200)
- getSubmissions/saveSubmission in service functions (line 124)
- viewMode 'history' (line 104)
- Billing endpoint (line 315+)
So ARCHITECTURE.md may already be complete — verify before editing.

### Constraints (MUST NOT violate)
- No `as any` or `@ts-ignore`
- No English UI text
- No react-router
- No new npm dependencies
- Do NOT touch `components/ui/*.tsx`
- No console.log in new code
- All user-facing text in Italian


## Submission History Implementation (2026-03-11)
- `SavedSubmission` interface added to `storage.ts` with FormData import from `'../types/form'`
- `clearSubmissions()` added as dedicated function instead of reusing `clearAll()` — avoids wiping sender profile and address book
- `submissions: SavedSubmission[]` added to StorageSchema; `submissions: []` in getDefaultStorage()
- `saveSubmission` uses `unshift` + `slice(0, 50)` for FIFO max 50
- SubmissionHistory component uses `expandedId` state (single expansion) for clean UX
- Nav tab order: Nuova Richiesta → Storico Richieste → Amministrazione
- `saveSubmission()` call placed AFTER `setIsSubmitted(true)` and BEFORE `saveSenderProfile()` in handleSubmit
- Italian date formatting: `toLocaleDateString('it-IT', {...})` with day/month/year/hour/minute