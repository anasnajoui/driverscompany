# AGENTS.md — Drivers Company Logistics

> Reference for AI coding agents operating in this repository.

## Project Overview

Italian logistics company ("Drivers Company", Udine) web form for dental studios/businesses to request pickup & delivery services. React SPA submits to an n8n webhook which handles data persistence, email notifications, PDF generation, and Google Sheets logging.

**Live**: `https://driverscompany.vercel.app`
**Webhook**: `https://n8n.madani.agency/webhook/dental-logistics`

## Tech Stack

- **Runtime**: React 18, TypeScript (strict mode), Vite 4
- **Styling**: TailwindCSS 3 + `tailwindcss-animate`, CSS variables for theming
- **UI Components**: shadcn/ui pattern (Radix UI + CVA + `cn()` utility)
- **Icons**: `lucide-react`
- **Phone**: `react-phone-number-input` + `libphonenumber-js`
- **Backend**: n8n workflow (webhook → Google Sheets → emails → PDF via YakPDF)
- **Deployment**: Vercel (frontend), Railway (n8n)

## Build / Dev Commands

```bash
npm run dev        # Start Vite dev server (HMR)
npm run build      # Production build → dist/
npm run preview    # Preview production build locally
npm run deploy     # Build + ready for manual deploy
```

**No test framework is configured.** No ESLint or Prettier config exists.
**No single-test command** — testing infrastructure needs to be added.

## Project Structure

```
├── src/
│   ├── main.tsx              # React entry point
│   ├── App.tsx               # Root component (renders DentalLogisticsForm)
│   ├── app/page.tsx          # Main form component (multi-step wizard)
│   ├── types/form.ts         # TypeScript interfaces (FormData, Recipient, Item)
│   ├── constants/formOptions.ts  # Default form values, factory functions
│   ├── styles/globals.css    # Tailwind base + CSS variables + phone input styles
│   └── lib/utils.ts          # cn() utility (clsx + tailwind-merge)
├── components/
│   ├── StudioInformationStep.tsx   # Step 1: Company info, contact, pickup details
│   ├── RecipientsDeliveryStep.tsx  # Step 2: Delivery destinations
│   ├── RecipientCard.tsx           # Single recipient form card
│   ├── SubmissionRecap.tsx         # Post-submission confirmation view
│   └── ui/                         # shadcn/ui primitives (button, card, input, etc.)
├── public/                   # Static assets (logo, manifest)
├── index.html                # Vite HTML entry (Italian lang, SEO meta tags)
├── vite.config.ts            # Vite config with @/ path alias
├── tsconfig.json             # Strict TS, path mapping @/* → ./src/*
├── tailwind.config.js        # shadcn/ui theme tokens, CSS variable colors
└── google-apps-script.gs     # Legacy: Google Apps Script alternative flow (unused)
```

## Code Style & Conventions

### TypeScript
- **Strict mode** enabled (`strict: true`, `noUnusedLocals`, `noUnusedParameters`)
- Target: ES2020, module: ESNext, JSX: react-jsx
- Path alias: `@/*` maps to `./src/*`
- Interfaces preferred over types for data shapes (see `src/types/form.ts`)
- Component props use explicit interfaces (e.g., `StudioInformationStepProps`)

### Imports
- React imports at top: `import React from 'react'`
- Types/interfaces imported from `../src/types/form` (components are outside `src/`)
- UI components from relative `./ui/` or `../../components/ui/`
- Utility `cn()` imported from `../../src/lib/utils` (in components) or `@/lib/utils`
- Third-party libs grouped after React imports
- **Note**: Components live in `/components/` (outside `src/`), types/constants live in `/src/`

### Component Patterns
- **Functional components only** with `React.FC<Props>` typing
- Named exports for components (`export const StudioInformationStep`)
- Default export for page-level components (`export default DentalLogisticsForm`)
- State managed with `useState` hooks — no external state library
- Validation errors stored as `Record<string, string>`
- Form handlers follow pattern: `handleInputChange(field, value)`, `updateRecipient(id, field, value)`

### Styling
- **TailwindCSS classes inline** — no separate CSS modules
- shadcn/ui CSS variables in `globals.css` (HSL format: `--primary: 221.2 83.2% 53.3%`)
- Large touch targets: `h-14` to `h-16` for form inputs
- Consistent border radius: `rounded-xl` (inputs), `rounded-2xl` (cards)
- Consistent border width: `border-2` for interactive elements
- Color palette: blue-600 primary, green-600 success, red-600 errors, gray-50/100 backgrounds
- Transition pattern: `transition-all duration-200`
- Responsive: `sm:` breakpoint for mobile → desktop layouts
- Error state classes: `border-red-300 focus:border-red-500 focus:ring-red-100`

### Naming Conventions
- **Files**: PascalCase for components (`RecipientCard.tsx`), camelCase for utilities (`formOptions.ts`)
- **Interfaces**: PascalCase (`FormData`, `Recipient`, `StudioInformationStepProps`)
- **Variables/functions**: camelCase (`handleSubmit`, `validateStep1`, `createNewRecipient`)
- **CSS variables**: kebab-case (`--primary-foreground`, `--card`)
- **Form field IDs**: camelCase matching FormData keys (`companyName`, `pickupDate`)
- **Validation error keys**: camelCase for simple fields, `recipient-{index}-{field}` for nested

### Error Handling
- Form validation returns `Record<string, string>` errors displayed inline under fields
- API errors caught with try/catch, shown via `alert()` with Italian messages
- Phone validation uses `libphonenumber-js` `isValidPhoneNumber()`
- Email validation uses regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Real-time validation on phone and email fields as user types

### Language
- **All user-facing text is in Italian** (form labels, errors, emails, UI copy)
- Code comments and variable names are in English
- Google Sheets column headers are in SCREAMING_SNAKE_CASE Italian (`NOME_STUDIO`, `DATA_RITIRO`)

## n8n Workflow (ID: 4thMwDmBvacFEGNZ)

The backend is an n8n workflow, not a traditional API server. See `ARCHITECTURE.md` for full details.

**Flow**: `Webhook POST → Transform Data → Google Sheets → Generate Confirmation Email → Generate Notification Email → Generate PDF HTML → YakPDF → Send Notification → Send Confirmation → JSON Response`

**Key details**:
- Webhook path: `/webhook/dental-logistics` (POST)
- Google Sheet ID: `1CMlvDX86A2gJUcckjwBWvANKbXlAeYcyjGhnM955fQw` (sheet: "Logistica")
- Emails sent via SMTP from `driverscompany.notifiche@gmail.com`
- Notification goes to: `driverscompanysc@gmail.com`
- Confirmation goes to: the submitter's email
- PDF generated via YakPDF RapidAPI
- Delivery IDs: `REQ_{timestamp}_{recipientIndex}`

## Key Data Types

```typescript
interface FormData {
  companyName: string;
  email: string;
  companyPhone: string;      // International format via libphonenumber-js
  studioHours: string;
  pickupDate: string;         // YYYY-MM-DD from date input
  pickupTime: string;         // 'standard' | 'morning' | 'afternoon'
  pickupLocation: string;
  recipients: Recipient[];
  notes: string;
}

interface Recipient {
  id: string;                 // Random ID via Math.random().toString(36)
  destination: string;
  phoneNumber: string;
  shippingAddress: string;
  deliveryTime: string;       // 'standard' | 'morning' | 'afternoon'
  specialInstructions: string;
}
```

## Important Notes for Agents

1. **No test infrastructure** — if adding tests, use Vitest (Vite-native)
2. **No linter** — if adding, use ESLint with `@typescript-eslint`
3. **Components outside src/** — `components/` is at project root, included via `tsconfig.json`
4. **shadcn/ui pattern** — don't install shadcn CLI, manually add components to `components/ui/`
5. **The `google-apps-script.gs` is legacy** — the active backend is the n8n workflow
6. **Phone numbers** must be international format (default country: IT)
7. **All form copy is Italian** — maintain Italian for any user-facing strings
8. **No env files** — the webhook URL is hardcoded in `src/app/page.tsx` line 185
9. **Vercel deployment** — push to `main` branch auto-deploys
