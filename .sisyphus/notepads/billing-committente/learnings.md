# Learnings — billing-committente

## [2026-03-10] Session ses_32cd5f3ceffeDTexUd5Fzlt00V

### Key Architecture Facts
- Form sends full `formData` object as JSON POST to n8n webhook
- `billingClient` will be auto-included in POST body once added to FormData interface
- n8n Transform Data node (id: `f0f7c870-1591-4602-85ce-ef58cf08e3ac`) in workflow `4thMwDmBvacFEGNZ` writes to Google Sheets
- Billing API workflow `7DUsuL7VeiBObF3l`, aggregate node id: `billing-aggregate`
- Google Sheet columns NOW: ID | DATA_RICHIESTA | DATA_RITIRO | NOME_STUDIO | EMAIL_STUDIO | TELEFONO_STUDIO | INDIRIZZO_RITIRO | ORARIO_RITIRO | CONSEGNA_A | TELEFONO_CONSEGNA | INDIRIZZO_CONSEGNA | ORARIO_CONSEGNA | NOTE_SPECIALI | NOTE_GENERALI | FATTURARE_A
- Removed from sheet: STATO, AUTISTA, RITIRO_FATTO, CONSEGNA_FATTA, duplicate CONSEGNA_A
- n8n partial workflow updates: use `updates:` key inside operations, not direct parameters
- Components live in `/components/` (outside `src/`), types in `/src/types/`
- Path alias `@/*` maps to `./src/*`

### Committenti List (14 total, alphabetical)
Bravin, Creattiva, Delpin, Dentalica, Dentalline, Dentaltre, Lovato, Mangione, Orodental, Ortolab, Pascolo, Saccher, Syntesis, Unident

### Style Tokens (established)
- Labels: `text-sm font-medium text-gray-700 mb-1.5 block`
- Selects: `w-full px-4 h-12 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none text-gray-700 transition-all duration-200`
- Helper text: `text-sm text-gray-400 mt-1`

### n8n Quirk
- `n8n_update_partial_workflow` requires `updates:` key: `{type: "updateNode", nodeId: "...", updates: {parameters: {jsCode: "..."}}}`
