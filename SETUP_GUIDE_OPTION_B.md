# 🚀 Setup Guide - Option B: Google Sheets + Apps Script + Brevo

## 📋 Overview
Questa guida ti porterà da zero a sistema funzionante in **20 minuti**.

**Stack:**
React Form → Google Sheets → Apps Script → Brevo API → Professional Email

---

## ⚡ Quick Setup (20 minuti)

### **Step 1: Setup Brevo Account (5 min)**

1. **Vai su [Brevo.com](https://brevo.com)** 
2. **Sign up gratis** (300 email/giorno)
3. **Vai su "Settings" → "API Keys"**
4. **Crea nuovo API key** 
5. **Salva l'API key** - la userai dopo

### **Step 2: Setup Google Sheets (3 min)**

1. **Vai su [Google Sheets](https://sheets.google.com)**
2. **Crea nuovo foglio**: "Logistica Dentale"
3. **Salva il foglio** (ti serve l'ID dalla URL)

### **Step 3: Setup Apps Script (10 min)**

1. **Nel tuo Google Sheet**, vai su **Extensions → Apps Script**
2. **Cancella il codice default**
3. **Copia e incolla** tutto il contenuto di `google-apps-script.gs`
4. **Aggiorna la configurazione** all'inizio del file:

```javascript
const CONFIG = {
  BREVO_API_KEY: 'la-tua-api-key-brevo',
  FROM_EMAIL: 'logistics@tuo-consulting-studio.com',
  TO_EMAIL: 'drivers@cooperativatrasporti.it',
  // ... resto configurazione
};
```

5. **Salva il progetto** (Ctrl+S)
6. **Deploy as Web App:**
   - Clicca **Deploy → New Deployment**
   - Scegli **Type: Web App**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Clicca **Deploy**
7. **Copia l'URL del Web App** (simile a: `https://script.google.com/macros/s/ABC123.../exec`)

### **Step 4: Aggiorna React Form (2 min)**

1. **Nel file `src/app/page.tsx`**
2. **Trova questa riga:**
   ```javascript
   const googleSheetsUrl = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
   ```
3. **Sostituisci** con l'URL che hai copiato dallo step 3
4. **Riavvia** il dev server: `npm run dev`

---

## 🧪 Test del Sistema

### **Test manuale in Apps Script:**
1. **Nel tuo Apps Script editor**
2. **Vai su function dropdown** → scegli `testWithSampleData`
3. **Clicca Run** ▶️
4. **Controlla:**
   - Se il Google Sheet ha nuove righe
   - Se è arrivata l'email di test
   - Se ci sono errori nel log

### **Test dal React Form:**
1. **Vai sulla tua app React** (`http://localhost:3000`)
2. **Compila il form** con dati di test
3. **Submit**
4. **Controlla:**
   - Google Sheet per nuove righe
   - Email ricevuta
   - Sheet "Email_Log" per tracking

---

## 🛠 Troubleshooting

### **❌ "Script function not found"**
- Controlla che hai salvato il file Apps Script
- Verifica che la function `doPost` esista

### **❌ "Unauthorized"**
- Nel deployment, assicurati di aver scelto "Anyone" per access
- Re-deploy se necessario

### **❌ "Email not sent"**
- Verifica l'API key Brevo
- Controlla il Sheet "Email_Log" per errori
- Verifica che FROM_EMAIL sia autorizzato in Brevo

### **❌ "No data in sheets"**
- Controlla che l'URL nel React form sia corretto
- Verifica nei Network tab del browser se la richiesta viene inviata

---

## 📊 What You Get

### **Automatic Features:**
- ✅ **Every form submission** creates separate delivery rows
- ✅ **Professional emails** sent immediately  
- ✅ **Email tracking** in dedicated sheet
- ✅ **Error logging** for debugging
- ✅ **Priority badges** (URGENT/FRAGILE)
- ✅ **Italian formatting** and professional design

### **Google Sheets Structure:**
```
Sheet "Consegne":
ID | DATA | STATO | NOME_STUDIO | TELEFONO_STUDIO | ... | CONSEGNA_FATTA

Sheet "Email_Log":  
TIMESTAMP | DELIVERY_ID | STATUS | EMAIL_TO | DETAILS
```

### **Email Example:**
- 🎨 **Professional design** with company branding
- 📱 **Mobile responsive**
- 🚨 **Priority indicators** for urgent/fragile items
- 📋 **All delivery details** clearly formatted

---

## 💡 Customization

### **Change Email Design:**
Modifica la function `generateEmailHTML()` nel Apps Script per:
- Colori aziendali
- Logo personalizzato  
- Layout diverso

### **Add More Fields:**
1. Aggiungi campi nel React form
2. Modifica `processFormData()` per includere nuovi campi
3. Aggiorna headers in `saveToSheets()`

### **Change Email Provider:**
Se vuoi usare altro invece di Brevo, modifica solo la function `sendDeliveryEmail()`.

---

## 🎯 Production Checklist

- [ ] Brevo API key configurata
- [ ] Email addresses corrette in CONFIG
- [ ] Apps Script deployed come Web App
- [ ] React form URL aggiornato
- [ ] Test end-to-end completato
- [ ] Email delivery confirmata

---

## 💰 Costs

- **Google Sheets/Apps Script:** FREE
- **Brevo:** FREE (300 emails/day)
- **React hosting:** Dipende dal provider
- **Total monthly:** $0 (per volume normale)

---

## 🚀 You're Done!

Il sistema è ora completamente funzionale e professionale. Ogni richiesta dal form genererà automaticamente:

1. 📊 **Righe trackabili** in Google Sheets
2. 📧 **Email professionali** al team drivers
3. 📝 **Log dettagliati** per debugging
4. 🎯 **Zero costi** per volume normale

**Per supporto:** Controlla i log in Apps Script e nel Sheet "Email_Log". 