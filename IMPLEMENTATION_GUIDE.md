# 🚀 Guida all'Implementazione: Sistema Logistica Dentale con n8n

## 📋 Panoramica
Questa guida ti aiuterà a configurare il workflow completo che trasforma le richieste dal form React in bolle di consegna PDF inviate automaticamente via email.

## 🔧 Pre-requisiti

### 1. Account n8n
- Account n8n Cloud o installazione self-hosted
- Accesso all'editor di workflow

### 2. Servizi Esterni
- **Google Sheets API**: Per il tracking delle consegne
- **Service per HTML-to-PDF**: Per generare i PDF
- **Provider Email**: Per l'invio automatico

## 📊 Step 1: Configurazione Google Sheets

### Crea il Foglio di Lavoro
1. Vai su [Google Sheets](https://sheets.google.com)
2. Crea un nuovo foglio chiamato "Logistica Dentale"
3. Copia e incolla nella prima riga i seguenti header:

```
ID,DATA,STATO,NOME_STUDIO,TELEFONO_STUDIO,INDIRIZZO_RITIRO,ORARIO_RITIRO,CONSEGNA_A,TELEFONO_CONSEGNA,INDIRIZZO_CONSEGNA,COSA_CONSEGNARE,NOTE_SPECIALI,AUTISTA,RITIRO_FATTO,CONSEGNA_FATTA
```

### Ottieni l'ID del Foglio
- L'ID è nella URL: `https://docs.google.com/spreadsheets/d/[QUESTO_È_L'ID]/edit`
- Salva questo ID per n8n

### Configura l'API di Google Sheets
1. Vai su [Google Cloud Console](https://console.cloud.google.com)
2. Crea un nuovo progetto o seleziona esistente
3. Abilita "Google Sheets API"
4. Crea credenziali "Service Account"
5. Scarica il file JSON delle credenziali
6. Condividi il foglio Google con l'email del service account

## 🔗 Step 2: Importa il Workflow n8n

### Importazione
1. Apri n8n
2. Clicca "+" per nuovo workflow
3. Clicca "Import from file"
4. Carica il file `n8n_workflow_template.json`

### Configurazioni Obbligatorie

#### A. Webhook Node
- Il webhook verrà generato automaticamente
- Copia l'URL per aggiornare il React form
- **IMPORTANTE**: Aggiorna `src/app/page.tsx` con il vero URL webhook

#### B. Google Sheets Node
```javascript
// Sostituisci questi valori:
documentId: "IL_TUO_GOOGLE_SHEET_ID"
sheetName: "Sheet1" // o il nome del tuo sheet
```

#### C. Email Node
```javascript
// Configura questi campi:
fromEmail: "noreply@tuodominio.it"
toEmail: "drivers@tuodominio.it"
```

#### D. HTML-to-PDF Service
Il workflow usa `html-css-to-pdf.com`. Alternative:
- **Puppeteer self-hosted**
- **wkhtmltopdf**
- **Gotenberg**

Per usare un servizio diverso, modifica il nodo "Convert to PDF".

## 🎨 Step 3: Personalizzazione

### Modifica il Design della Bolla PDF
Nel nodo "Generate HTML Slip", personalizza:

```javascript
// Cambia il nome dell'azienda
<div class="company-name">🚚 IL_TUO_NOME_AZIENDA</div>

// Modifica i colori
.header {
    background: linear-gradient(135deg, #TUO_COLORE_1 0%, #TUO_COLORE_2 100%);
}

// Aggiungi il tuo logo
<img src="https://il-tuo-dominio.com/logo.png" alt="Logo" style="max-height: 50px;">
```

### Personalizza l'Email Template
Nel nodo "Send Email to Drivers":

```html
<!-- Cambia header email -->
<h1>🚚 IL_TUO_NOME_AZIENDA</h1>

<!-- Modifica footer -->
<div>
    🚚 <strong>Il Tuo Nome Azienda</strong><br>
    Il Tuo Servizio
</div>
```

## 🧪 Step 4: Test del Sistema

### Test Passo-Passo
1. **Attiva il workflow** in n8n
2. **Aggiorna l'URL** nel React form (`src/app/page.tsx`)
3. **Riavvia** l'app React: `npm run dev`
4. **Compila** il form con dati di test
5. **Verifica** che:
   - I dati arrivino a Google Sheets
   - Il PDF venga generato correttamente
   - L'email venga inviata

### Dati di Test Consigliati
```javascript
{
  companyName: "Studio Test",
  companyPhone: "+39 0432 123456",
  pickupLocation: "Via Roma 123, 33100 Udine",
  pickupDate: "2024-12-15",
  pickupTime: "10:00-11:00",
  recipients: [
    {
      destination: "Laboratorio Test",
      phoneNumber: "+39 0432 654321",
      shippingAddress: "Via Venezia 456, 33100 Udine",
      items: [
        {
          type: "impronte_dentali",
          fragile: true,
          urgent: false
        }
      ],
      specialInstructions: "Maneggiare con cura"
    }
  ]
}
```

## 🔒 Step 5: Sicurezza

### Webhook Security
```javascript
// Aggiungi autenticazione al webhook (opzionale)
const authToken = $input.first().headers.authorization;
if (authToken !== 'Bearer IL_TUO_TOKEN_SEGRETO') {
  throw new Error('Unauthorized');
}
```

### Validazione Dati
```javascript
// Aggiungi validazione nel nodo Transform Data
if (!formData.companyName || !formData.recipients || formData.recipients.length === 0) {
  throw new Error('Dati mancanti nel form');
}
```

## 📈 Step 6: Monitoraggio

### Log Personalizzati
```javascript
// Aggiungi nei nodi Code per debugging
console.log('Processing delivery:', deliveryId);
console.log('Form data received:', JSON.stringify(formData, null, 2));
```

### Gestione Errori
```javascript
try {
  // Il tuo codice
} catch (error) {
  console.error('Errore nella generazione PDF:', error);
  // Invia notifica di errore
  return [{error: error.message, formData}];
}
```

## 🚀 Step 7: Deploy in Produzione

### Checklist Pre-Deploy
- [ ] Webhook URL aggiornato nel React form
- [ ] Credenziali Google Sheets configurate
- [ ] Email provider configurato
- [ ] HTML-to-PDF service funzionante
- [ ] Test completo eseguito
- [ ] Backup del workflow esportato

### Manutenzione
- **Backup** settimanale del Google Sheet
- **Monitoraggio** delle email inviate
- **Pulizia** periodica dei log n8n
- **Test** mensile del workflow completo

## 🆘 Troubleshooting

### Problemi Comuni

#### Webhook non riceve dati
```bash
# Verifica URL nel React form
console.log('Sending to:', n8nWebhookUrl);

# Verifica CORS se necessario
headers: {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*'
}
```

#### Google Sheets non aggiorna
- Verifica permessi del service account
- Controlla l'ID del foglio
- Verifica il nome del sheet

#### PDF non genera
- Verifica il servizio HTML-to-PDF
- Controlla i permessi API
- Verifica la sintassi HTML

#### Email non inviate
- Controlla le credenziali del provider
- Verifica gli indirizzi email
- Controlla i filtri spam

## 📞 Supporto

Per supporto tecnico:
1. Verifica i log n8n
2. Controlla la console del browser
3. Testa ogni nodo singolarmente
4. Esporta e re-importa il workflow se necessario

---

**🎉 Il tuo sistema di logistica dentale è pronto!**

Una volta configurato, ogni richiesta dal form React genererà automaticamente:
- ✅ Una o più righe in Google Sheets
- 📄 Bolle di consegna PDF professionali  
- 📧 Email automatiche al team di consegna 