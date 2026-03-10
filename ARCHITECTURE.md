# ARCHITECTURE.md — Drivers Company Logistics System

> Living document. Updated as the system evolves.
> Last updated: 2026-03-09

---

## 1. System Overview

**Drivers Company** is a logistics service based in Udine, Italy (Via Oderzo 1, 33100 Udine). They pick up packages from businesses (primarily dental studios) and deliver them to multiple destinations.

This system is a **web-based order intake form** that:
1. Collects pickup & delivery details from the client (dental studio)
2. Records the order in Google Sheets
3. Sends a notification email to the Drivers Company team
4. Sends a confirmation email back to the client
5. Generates a PDF with delivery slips (one A4 page per delivery)
6. Returns a success response to the web form

### Architecture Diagram

```
┌─────────────────────────────────┐
│       CLIENT (Browser)          │
│  React SPA on Vercel            │
│  driverscompany.vercel.app      │
│                                 │
│  Multi-step form:               │
│  1. Studio info + pickup        │
│  2. Recipients + deliveries     │
│                                 │
│  POST JSON ──────────────────────┼──► n8n Webhook (POST /webhook/dental-logistics)
│                                 │
│  GET JSON ───────────────────────┼──► n8n Billing (GET /webhook/dental-logistics-billing)
└─────────────────────────────────┘    (Railway)
                                        │
                    ┌───────────────────┘
                    ▼
┌──────────────────────────────────────────────────────┐
│              n8n WORKFLOW                             │
│  "iagency-driverscompany form to email+sheets"       │
│  ID: 4thMwDmBvacFEGNZ                               │
│                                                      │
│  ┌─────────┐   ┌───────────┐   ┌──────────────┐     │
│  │ Webhook  │──►│ Transform │──►│ Google       │     │
│  │ (POST)   │   │ Data      │   │ Sheets       │     │
│  └─────────┘   └───────────┘   └──────┬───────┘     │
│                                        │              │
│                                        ▼              │
│  ┌──────────────────┐   ┌─────────────────────┐      │
│  │ Generate         │──►│ Generate            │      │
│  │ Confirmation     │   │ Notification        │      │
│  │ Email            │   │ Email               │      │
│  └──────────────────┘   └──────────┬──────────┘      │
│                                     │                 │
│                                     ▼                 │
│  ┌──────────────────┐   ┌─────────────────────┐      │
│  │ Generate PDF     │──►│ HTML to PDF         │      │
│  │ HTML             │   │ (YakPDF API)        │      │
│  └──────────────────┘   └──────────┬──────────┘      │
│                                     │                 │
│                                     ▼                 │
│  ┌──────────────────┐   ┌─────────────────────┐      │
│  │ Send             │──►│ Send                │      │
│  │ Notification     │   │ Confirmation        │      │
│  │ Email (SMTP)     │   │ Email (SMTP)        │      │
│  └──────────────────┘   └──────────┬──────────┘      │
│                                     │                 │
│                                     ▼                 │
│                            ┌──────────────┐           │
│                            │ JSON Response │           │
│                            │ to Frontend   │           │
│                            └──────────────┘           │
└──────────────────────────────────────────────────────┘
```

---

## 2. Frontend (React SPA)

### Hosting & Deployment
- **Platform**: Vercel
- **URL**: `https://driverscompany.vercel.app`
- **Deploy**: Push to `main` branch → auto-deploy

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 |
| Language | TypeScript (strict) |
| Bundler | Vite 4 |
| Styling | TailwindCSS 3 + CSS variables |
| UI Lib | shadcn/ui (Radix + CVA) |
| Icons | lucide-react |
| Phone Input | react-phone-number-input + libphonenumber-js |
| Storage | Browser LocalStorage (versioned) |

### View Mode Navigation

The application uses a state-based navigation system (no `react-router`) controlled by the `viewMode` state:

- **'form'**: The main multi-step logistics request form.
- **'history'**: A list of previous submissions stored locally.
- **'admin'**: Administrative dashboard for billing and configuration.

Navigation is handled via a 3-pill tab component at the top of the page.

### Client-Side Storage (LocalStorage)

The system uses a versioned LocalStorage schema to persist user data, address book, and submission history.

- **Schema Interface**: `StorageSchema` (versioned)
- **Storage Key**: `drivers_company_data`
- **Storage Strategy**:
  - **Sender Profile**: Auto-populated on mount to save time for returning users.
  - **Address Book**: Automatically saves new recipients upon successful submission.
  - **Submission History**: Stores the last 50 submissions (FIFO strategy).
  - **Address Book Limit**: Stores up to 100 recipients.

**Service Functions (`src/services/localStorage.ts`):**
- `getSenderProfile()` / `saveSenderProfile(profile)`
- `getAddressBook()` / `saveRecipient(recipient)` / `removeRecipient(id)`
- `getSubmissions()` / `saveSubmission(submission)`
- `getBillingConfig()` / `saveBillingConfig(config)`
- `getStorage()` / `saveStorage(data)`

### Application Flow

```
User opens form
    │
    ▼
[Auto-populate from LocalStorage]
    │
    ▼
┌─────────────────────────┐
│ Step 1: Studio Info      │
│ - Company name           │
│ - Email                  │
│ - Phone (intl, IT default)│
│ - Studio hours (Selector)│
│ - Pickup address         │
│ - Pickup date & time     │
│ - General Notes          │
│                          │
│ [Validate] → Next        │
└──────────┬──────────────┘
           ▼
┌─────────────────────────┐
│ Step 2: Recipients       │
│ - Address Book (Panel)   │
│ - Destination name *     │
│ - Delivery address *     │
│ - Delivery time pref     │
│ - Special instructions   │
│ - [+ Add another]        │
│                          │
│ [Validate] → Submit      │
└──────────┬──────────────┘
           ▼
    POST to n8n webhook
           │
    ┌──────┴──────┐
    │ Success?    │
    ├─── Yes ─────► [Save Recipient(s) & Submission to LocalStorage] ──► SubmissionRecap
    └─── No ──────► alert() with error
```

### Data Model

```typescript
// src/types/form.ts
interface FormData {
  companyName: string;      // Business name
  email: string;            // Contact email (receives confirmation)
  companyPhone: string;     // International format
  studioHours: string;      // Free text (e.g., "Lun-Ven 9:00-18:00")
  pickupDate: string;       // YYYY-MM-DD
  pickupTime: string;       // 'standard' | 'morning' | 'afternoon'
  pickupLocation: string;   // Full address (multiline)
  recipients: Recipient[];  // 1 or more delivery destinations
  notes: string;            // General notes
}

interface Recipient {
  id: string;                 // Client-generated (Math.random base36)
  destination: string;        // Recipient name
  phoneNumber: string;        // Optional, international format
  shippingAddress: string;    // Full delivery address
  deliveryTime: string;       // 'standard' | 'morning' | 'afternoon'
  specialInstructions: string; // Free text
}

// src/types/storage.ts
export interface StorageSchema {
  version: number;
  senderProfile: SenderProfile | null;
  addressBook: SavedRecipient[];
  submissions: SavedSubmission[];
  billingConfig: BillingConfig;
}

interface SenderProfile {
  companyName: string;
  email: string;
  companyPhone: string;
  studioHours: string;           // Serialized string
  structuredHours: StructuredHours;
  pickupLocation: string;
}
```

### Validation Rules
| Field | Rule |
|-------|------|
| companyName | Required, non-empty |
| email | Required, regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` |
| companyPhone | Required, valid via `isValidPhoneNumber()` |
| studioHours | Required, non-empty |
| pickupDate | Required |
| pickupLocation | Required, non-empty |
| recipient.destination | Required per recipient |
| recipient.shippingAddress | Required per recipient |

---

## 3. Backend — n8n Workflow

### Hosting
- **Platform**: Railway
- **Base URL**: `https://n8n.madani.agency`
- **Workflow ID**: `4thMwDmBvacFEGNZ`
- **Workflow Name**: `iagency-driverscompany form to email+sheets`
- **Status**: Active
- **Error Workflow**: `vMBSxwu3WB2YfQn9`

### Webhook Endpoint

```
POST https://n8n.madani.agency/webhook/dental-logistics
Content-Type: application/json
```

**Request body**: Raw `FormData` JSON (see Data Model above)

**Response**:
```json
{
  "success": true,
  "message": "Richiesta ricevuta con successo",
  "deliveries": 2,
  "timestamp": "2026-03-09T15:00:00.000Z"
}
```

### Node-by-Node Breakdown

#### 1. Webhook - Form Data
- Receives POST at `/webhook/dental-logistics`
- Response mode: `responseNode` (deferred — response sent at end of workflow)

#### 2. Transform Data (Code Node)
- Converts form submission into flat delivery records
- One record per recipient
- Generates IDs: `REQ_{Date.now()}_{index+1}`
- Formats dates to `DD/MM/YYYY` for Google Sheets
- Maps `pickupTime` codes to Italian labels
- **Includes `NOTE_GENERALI` field** from the form's general notes.

#### 3. Add to Google Sheets
- **Sheet ID**: `1CMlvDX86A2gJUcckjwBWvANKbXlAeYcyjGhnM955fQw`
- **Sheet Name**: "Logistica" (GID: 653702461)
- **Auth**: Google Sheets OAuth2 (credential ID: `ZcD9zgNs6CVlHKcT`)
- Operation: Append rows (auto-map input data)

#### 4. Generate Confirmation Email (Code Node v2)
- Builds styled HTML email for the **client**
- **Conditional rendering for notes**: Displays a "Note" section only if `NOTE_GENERALI` is present.
- Contains: request summary, tracking ID, next steps, contact info
- Subject: `✅ Conferma Richiesta {REQ_ID} - Drivers Company`

#### 5. Generate Notification Email (Code Node v2)
- Builds styled HTML email for the **Drivers Company team**
- **Conditional rendering for notes**: Displays a "Note" section only if `NOTE_GENERALI` is present.
- Contains: studio details, all deliveries listed, action items
- Subject: `{REQ_ID} - 🚨 Nuova Richiesta Logistica - {studio_name} ({N} consegne)`

#### 6. Generate PDF HTML (Code Node v2)
- Creates a single HTML document with multiple A4 pages (one per delivery)
- Each page is a delivery slip with: pickup info, delivery info, signature boxes
- Styled for print with `@page` rules and `page-break-after`

#### 7. HTML to PDF via YakPDF (Code Node v1)
- Calls YakPDF RapidAPI to convert HTML → PDF
- **API**: `https://yakpdf.p.rapidapi.com/pdf`
- **Auth**: RapidAPI key (hardcoded in node)
- Returns binary PDF attached to the workflow item
- Filename: `{REQ_ID}_Fogli_Consegna_{N}_Consegne.pdf`

#### 8. Send Notification Email
- **From**: `driverscompany.notifiche@gmail.com`
- **To**: `driverscompanysc@gmail.com`
- **SMTP Credential**: ID `6zzoopFcyfqzSNgW`
- Attaches the generated PDF

#### 9. Send Confirmation Email
- **From**: `driverscompany.notifiche@gmail.com`
- **To**: The submitter's email (from form data)
- Attaches the same PDF

#### 10. Response
- Returns JSON success to the frontend with delivery count

### Billing Webhook (NEW)

**Endpoint**: `GET https://n8n.madani.agency/webhook/dental-logistics-billing?month=YYYY-MM`

**Workflow Nodes**:
1. **Billing Webhook**: Receives GET request with `month` query parameter.
2. **Read Billing Data**: Fetches all rows from the "Logistica" Google Sheet.
3. **Aggregate Billing**: Filters data by the requested month and groups by `NOME_STUDIO`.
4. **Billing Response**: Returns aggregated JSON data with CORS headers.

**Response Format**:
```json
{
  "month": "2026-03",
  "totalClients": 5,
  "totalDeliveries": 12,
  "totalPickups": 8,
  "clients": [
    {
      "name": "Studio Rossi",
      "deliveries": 3,
      "pickups": 2,
      "totalCost": 45.00
    }
  ]
}
```

---

## 4. External Services & Credentials

| Service | Purpose | Auth Method |
|---------|---------|-------------|
| Google Sheets | Order persistence | OAuth2 (`ZcD9zgNs6CVlHKcT`) |
| SMTP (Gmail) | Email sending | SMTP credential (`6zzoopFcyfqzSNgW`) |
| YakPDF (RapidAPI) | HTML → PDF conversion | API key (in code node) |
| Vercel | Frontend hosting | Git-based deploy |
| Railway | n8n hosting | — |

---

## 5. New Components

- **`StudioHoursSelector`**: A 7-day schedule manager with checkboxes for open/closed status and dropdowns for time selection (30-min intervals).
  - Exports `defaultStructuredHours` and `serializeHours` (converts to Italian string like "Lun-Ven 09:00-18:00").
- **`RecipientAddressBook`**: A dropdown panel for selecting previously saved recipients.
  - Features: Click-outside-to-close, delete support, automatic saving on submission.
- **`SubmissionHistory`**: Displays a list of previous requests with expandable cards.
  - Features: Italian date formatting, detailed recipient breakdown, "Clear History" functionality.
- **`AdminBilling`**: (In Development) Dashboard for viewing monthly billing data fetched from the n8n billing endpoint.

---

## 6. Legacy Components

These files exist in the repo but are **NOT actively used**:

| File | Purpose | Status |
|------|---------|--------|
| `google-apps-script.gs` | Earlier backend via Google Apps Script + Brevo API | Replaced by n8n |
| `delivery_slip_webapp.js` | Standalone delivery slip generator | Superseded |
| `google_sheets_setup.js` | Sheet initialization script | One-time use |
| `google_sheets_template.csv` | Sheet column template | Reference only |
| `email_template.html` | Static email template | Replaced by n8n code nodes |
| `n8n_workflow_template.json` | Exported workflow templates | Snapshots |
| `n8n_workflow_fixed.json` | Exported workflow | Snapshot |
| `n8n_workflow_template_fixed.json` | Exported workflow | Snapshot |
| `node5.json` | Single n8n node export | Snapshot |

---

## 7. Project Structure

```
├── src/
│   ├── main.tsx              # React entry point
│   ├── App.tsx               # Root component (renders DentalLogisticsForm)
│   ├── app/page.tsx          # Main form component (multi-step wizard)
│   ├── types/form.ts         # TypeScript interfaces (FormData, Recipient, Item)
│   ├── types/storage.ts      # NEW: LocalStorage schema and sub-interfaces
│   ├── services/localStorage.ts # NEW: LocalStorage persistence service
│   ├── constants/formOptions.ts  # Default form values, factory functions
│   ├── styles/globals.css    # Tailwind base + CSS variables + phone input styles
│   └── lib/utils.ts          # cn() utility (clsx + tailwind-merge)
├── components/
│   ├── StudioInformationStep.tsx   # Step 1: Modified with StudioHoursSelector
│   ├── StudioHoursSelector.tsx     # NEW: Structured hours selection
│   ├── RecipientsDeliveryStep.tsx  # Step 2: Modified with RecipientAddressBook
│   ├── RecipientAddressBook.tsx    # NEW: Saved recipients panel
│   ├── RecipientCard.tsx           # Single recipient form card
│   ├── SubmissionHistory.tsx       # NEW: Local submission history view
│   ├── AdminBilling.tsx            # NEW: Billing dashboard (In Development)
│   ├── SubmissionRecap.tsx         # Post-submission confirmation view
│   └── ui/                         # shadcn/ui primitives (button, card, input, etc.)
├── public/                   # Static assets (logo, manifest)
├── index.html                # Vite HTML entry (Italian lang, SEO meta tags)
├── vite.config.ts            # Vite config with @/ path alias
├── tsconfig.json             # Strict TS, path mapping @/* → ./src/*
├── tailwind.config.js        # shadcn/ui theme tokens, CSS variable colors
└── google-apps-script.gs     # Legacy: Google Apps Script alternative flow (unused)
```

---

## 8. Known Limitations & Technical Debt

1. **No authentication** — anyone with the form URL can submit
2. **No rate limiting** — the webhook accepts unlimited requests
3. **Hardcoded webhook URL** in frontend (`src/app/page.tsx:185`) — should be env variable
4. **Hardcoded API key** for YakPDF in n8n code node — security risk
5. **No error retry** — if email or PDF generation fails, the whole chain fails
6. **No status tracking UI** — clients can't check delivery status after submission
7. **No test suite** — zero automated tests
8. **No linter/formatter** — no ESLint, Prettier, or pre-commit hooks
9. **alert() for errors** — should be replaced with inline toast/notification
10. **Legacy files clutter** — `google-apps-script.gs` and related files should be archived

---

## 9. Environment & Deployment

### Frontend
```bash
# Local development
npm install
npm run dev          # → http://localhost:5173

# Production build
npm run build        # → dist/

# Deployed on Vercel via Git push to main
```

### n8n Workflow
- Managed at: `https://n8n.madani.agency`
- Workflow ID: `4thMwDmBvacFEGNZ`
- Active: Yes
- Changes made in n8n UI, not in code

---

## 10. Contact & Business Context

- **Company**: Drivers Company
- **Address**: Via Oderzo 1, 33100 Udine, Italy
- **Phone**: 0432-526200
- **Mobile**: 328-2090944
- **Notification Email**: driverscompanysc@gmail.com
- **System Email**: driverscompany.notifiche@gmail.com
- **Primary Clients**: Dental studios in the Friuli Venezia Giulia region
