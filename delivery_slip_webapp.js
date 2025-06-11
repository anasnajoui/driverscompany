/**
 * GOOGLE APPS SCRIPT - WEB APP PER BOLLE DI CONSEGNA
 * 
 * SETUP INSTRUCTIONS:
 * 1. Apri Google Apps Script (script.google.com)
 * 2. Crea nuovo progetto
 * 3. Incolla questo codice
 * 4. Deploy come Web App (Execute as: Me, Access: Anyone)
 * 5. Copia l'URL generato
 * 6. Aggiorna google_sheets_setup.js con l'URL
 */

// ID del tuo Google Sheet (prendi dall'URL)
const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE'; // ⚠️ DA CAMBIARE!

/**
 * Funzione principale che gestisce le richieste HTTP
 */
function doGet(e) {
  const id = e.parameter.id;
  
  if (!id) {
    return HtmlService.createHtmlOutput('❌ ID richiesta mancante');
  }
  
  try {
    // Apri il Google Sheet
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    const data = sheet.getDataRange().getValues();
    
    // Trova la riga con l'ID specificato
    let deliveryData = null;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === id) { // Colonna A = ID
        deliveryData = {
          id: data[i][0],           // A: ID
          data: data[i][1],         // B: DATA
          stato: data[i][2],        // C: STATO
          nomeStudio: data[i][3],   // D: NOME_STUDIO
          telefonoStudio: data[i][4], // E: TELEFONO_STUDIO
          indirizzoRitiro: data[i][5], // F: INDIRIZZO_RITIRO
          orarioRitiro: data[i][6], // G: ORARIO_RITIRO
          consegnaA: data[i][7],    // H: CONSEGNA_A
          telefonoConsegna: data[i][8], // I: TELEFONO_CONSEGNA
          indirizzoConsegna: data[i][9], // J: INDIRIZZO_CONSEGNA
          cosaConsegnare: data[i][10], // K: COSA_CONSEGNARE
          noteSpeciali: data[i][11], // L: NOTE_SPECIALI
          autista: data[i][12]      // M: AUTISTA
        };
        break;
      }
    }
    
    if (!deliveryData) {
      return HtmlService.createHtmlOutput('❌ ID non trovato: ' + id);
    }
    
    // Genera e restituisci la bolla HTML
    const html = generateDeliverySlipHTML(deliveryData);
    return HtmlService.createHtmlOutput(html)
      .setTitle('Bolla di Consegna - ' + id)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
      
  } catch (error) {
    Logger.log('Errore: ' + error.toString());
    return HtmlService.createHtmlOutput('❌ Errore nel caricamento dati: ' + error.toString());
  }
}

/**
 * Genera l'HTML della bolla di consegna
 */
function generateDeliverySlipHTML(data) {
  const currentDate = new Date().toLocaleDateString('it-IT');
  const currentTime = new Date().toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'});
  
  // Determina priorità e colori
  const isUrgent = data.noteSpeciali && data.noteSpeciali.includes('URGENTE');
  const isFragile = data.noteSpeciali && data.noteSpeciali.includes('FRAGILE');
  
  const urgentClass = isUrgent ? 'urgent' : '';
  const fragileClass = isFragile ? 'fragile' : '';
  
  return `
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bolla di Consegna - ${data.id}</title>
    <style>
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
            .page { page-break-after: avoid; }
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            font-size: 14px;
            line-height: 1.4;
            color: #333;
            background: #f5f5f5;
            padding: 20px;
        }
        
        .delivery-slip {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border: 2px solid #333;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .header {
            text-align: center;
            border-bottom: 2px solid #4285f4;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        
        .company-name {
            font-size: 20px;
            font-weight: bold;
            color: #4285f4;
            margin-bottom: 5px;
        }
        
        .document-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .document-id {
            font-size: 18px;
            font-weight: bold;
            color: #333;
            background: #f0f0f0;
            padding: 5px 10px;
            border-radius: 4px;
            display: inline-block;
        }
        
        .section {
            margin-bottom: 20px;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 6px;
            background: #fafafa;
        }
        
        .section-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #333;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .from-section {
            background: #e3f2fd;
            border-left: 4px solid #2196f3;
        }
        
        .to-section {
            background: #e8f5e8;
            border-left: 4px solid #4caf50;
        }
        
        .content-section {
            background: #fff3e0;
            border-left: 4px solid #ff9800;
        }
        
        .info-row {
            margin-bottom: 8px;
            display: flex;
            flex-wrap: wrap;
        }
        
        .info-label {
            font-weight: bold;
            min-width: 120px;
            color: #555;
        }
        
        .info-value {
            flex: 1;
            color: #333;
        }
        
        .items-list {
            list-style: none;
            padding: 0;
        }
        
        .item {
            padding: 8px;
            margin: 5px 0;
            background: white;
            border-radius: 4px;
            border-left: 3px solid #ddd;
        }
        
        .item.urgent {
            border-left-color: #f44336;
            background: #ffebee;
        }
        
        .item.fragile {
            border-left-color: #ff9800;
            background: #fff8e1;
        }
        
        .special-notes {
            background: #fffbf0;
            border: 1px solid #ffc107;
            border-radius: 4px;
            padding: 10px;
            margin: 10px 0;
        }
        
        .signature-section {
            border-top: 2px solid #333;
            padding-top: 20px;
            margin-top: 30px;
        }
        
        .signature-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
            align-items: center;
        }
        
        .checkbox {
            display: inline-block;
            width: 18px;
            height: 18px;
            border: 2px solid #333;
            margin-right: 8px;
            vertical-align: middle;
        }
        
        .signature-line {
            border-bottom: 1px solid #333;
            width: 200px;
            height: 30px;
            display: inline-block;
            margin-left: 10px;
        }
        
        .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4285f4;
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 6px;
            font-size: 16px;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .print-button:hover {
            background: #3367d6;
        }
        
        .urgent-badge {
            background: #f44336;
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
            margin-left: 8px;
        }
        
        .fragile-badge {
            background: #ff9800;
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
            margin-left: 8px;
        }
        
        @media (max-width: 600px) {
            body { padding: 10px; }
            .delivery-slip { padding: 15px; }
            .signature-row { flex-direction: column; align-items: flex-start; }
            .signature-line { width: 100%; margin-left: 0; margin-top: 5px; }
        }
    </style>
</head>
<body>
    <button class="print-button no-print" onclick="window.print()">🖨️ Stampa</button>
    
    <div class="delivery-slip page">
        <!-- HEADER -->
        <div class="header">
            <div class="company-name">🚚 COOPERATIVA TRASPORTI</div>
            <div style="color: #666; font-size: 14px;">Logistica Dentale Professionale</div>
            <div class="document-title" style="margin-top: 10px;">BOLLA DI CONSEGNA</div>
            <div class="document-id">${data.id}</div>
            <div style="margin-top: 10px; color: #666;">
                Generata il: ${currentDate} alle ${currentTime}
            </div>
        </div>
        
        <!-- RITIRO DA -->
        <div class="section from-section">
            <div class="section-title">📤 RITIRO DA</div>
            <div class="info-row">
                <span class="info-label">Studio:</span>
                <span class="info-value">${data.nomeStudio}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Indirizzo:</span>
                <span class="info-value">${data.indirizzoRitiro}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Telefono:</span>
                <span class="info-value">${data.telefonoStudio}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Data Ritiro:</span>
                <span class="info-value">${data.data}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Orario:</span>
                <span class="info-value">${data.orarioRitiro}</span>
            </div>
        </div>
        
        <!-- CONSEGNA A -->
        <div class="section to-section">
            <div class="section-title">📥 CONSEGNA A</div>
            <div class="info-row">
                <span class="info-label">Destinatario:</span>
                <span class="info-value">${data.consegnaA}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Indirizzo:</span>
                <span class="info-value">${data.indirizzoConsegna}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Telefono:</span>
                <span class="info-value">${data.telefonoConsegna}</span>
            </div>
        </div>
        
        <!-- CONTENUTO -->
        <div class="section content-section">
            <div class="section-title">📦 MATERIALI DA CONSEGNARE</div>
            <ul class="items-list">
                <li class="item ${urgentClass} ${fragileClass}">
                    ${data.cosaConsegnare}
                    ${isUrgent ? '<span class="urgent-badge">URGENTE</span>' : ''}
                    ${isFragile ? '<span class="fragile-badge">FRAGILE</span>' : ''}
                </li>
            </ul>
            
            ${data.noteSpeciali ? `
            <div class="special-notes">
                <strong>⚠️ NOTE SPECIALI:</strong><br>
                ${data.noteSpeciali}
            </div>
            ` : ''}
        </div>
        
        <!-- FIRMA E CONFERME -->
        <div class="signature-section">
            <div class="signature-row">
                <div>
                    <span class="checkbox"></span>
                    <strong>RITIRATO</strong> il ___/___/_____ alle ___:___
                </div>
            </div>
            
            <div class="signature-row">
                <div>
                    <span class="checkbox"></span>
                    <strong>CONSEGNATO</strong> il ___/___/_____ alle ___:___
                </div>
            </div>
            
            <div class="signature-row" style="margin-top: 20px;">
                <div style="width: 100%;">
                    <strong>Firma del Destinatario:</strong>
                    <span class="signature-line"></span>
                </div>
            </div>
            
            ${data.autista ? `
            <div class="signature-row">
                <div><strong>Autista Assegnato:</strong> ${data.autista}</div>
            </div>
            ` : ''}
        </div>
        
        <!-- FOOTER -->
        <div style="text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
            Cooperativa Trasporti - Servizio Logistico Dentale<br>
            Per informazioni: info@cooperativatrasporti.it
        </div>
    </div>
    
    <script>
        // Auto-focus per stampa rapida
        window.onload = function() {
            // Opzionale: stampa automatica
            // window.print();
        };
    </script>
</body>
</html>
  `;
}

/**
 * Funzione per testare localmente (esegui questa per verificare)
 */
function testDeliverySlip() {
  const testData = {
    id: 'REQ_001_1',
    data: '2024-01-15',
    stato: 'In Attesa',
    nomeStudio: 'Studio Dr. Rossi',
    telefonoStudio: '+39 02 1234567',
    indirizzoRitiro: 'Via Roma 10, 20100 Milano MI',
    orarioRitiro: 'Mattina',
    consegnaA: 'Laboratorio Milano',
    telefonoConsegna: '+39 02 9876543',
    indirizzoConsegna: 'Via Brera 5, 20121 Milano MI',
    cosaConsegnare: 'Impronte dentali x2',
    noteSpeciali: 'FRAGILE - URGENTE',
    autista: 'Mario Rossi'
  };
  
  const html = generateDeliverySlipHTML(testData);
  Logger.log('HTML generato correttamente');
  return html;
} 