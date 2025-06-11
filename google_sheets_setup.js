/**
 * Google Apps Script to set up Logistics Log sheet
 * 
 * HOW TO USE:
 * 1. Open your Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. Paste this code
 * 4. Run setupLogisticsSheet()
 * 5. Authorize permissions when prompted
 */

function setupLogisticsSheet() {
  const sheet = SpreadsheetApp.getActiveSheet();
  
  // Clear existing content
  sheet.clear();
  
  // Set up headers (in Italian)
  const headers = [
    'ID', 'DATA', 'STATO', 'NOME_STUDIO', 'TELEFONO_STUDIO', 
    'INDIRIZZO_RITIRO', 'ORARIO_RITIRO', 'CONSEGNA_A', 'TELEFONO_CONSEGNA', 
    'INDIRIZZO_CONSEGNA', 'COSA_CONSEGNARE', 'NOTE_SPECIALI', 
    'AUTISTA', 'RITIRO_FATTO', 'CONSEGNA_FATTA', 'STAMPA_BOLLA'
  ];
  
  // Add headers to row 1
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format header row
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#4285f4')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setFontSize(11);
  
  // Set column widths
  const columnWidths = [120, 100, 100, 150, 120, 200, 100, 150, 120, 200, 200, 200, 100, 100, 100, 120];
  columnWidths.forEach((width, index) => {
    sheet.setColumnWidth(index + 1, width);
  });
  
  // Set up data validation for STATO column (C)
  const statusValues = ['In Attesa', 'Ritiro', 'Consegna', 'Completato'];
  const statusValidation = SpreadsheetApp.newDataValidation()
    .requireValueInList(statusValues)
    .setAllowInvalid(false)
    .build();
  sheet.getRange('C:C').setDataValidation(statusValidation);
  
  // Set up data validation for ORARIO_RITIRO column (G)
  const pickupTimeValues = ['Standard', 'Mattina', 'Pomeriggio', 'Urgente'];
  const pickupTimeValidation = SpreadsheetApp.newDataValidation()
    .requireValueInList(pickupTimeValues)
    .setAllowInvalid(false)
    .build();
  sheet.getRange('G:G').setDataValidation(pickupTimeValidation);
  
  // Format DATA column (B) as date
  sheet.getRange('B:B').setNumberFormat('yyyy-mm-dd');
  
  // Format phone columns
  sheet.getRange('E:E').setNumberFormat('@'); // TELEFONO_STUDIO
  sheet.getRange('I:I').setNumberFormat('@'); // TELEFONO_CONSEGNA
  
  // Set up conditional formatting for STATO
  const statusRule1 = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('In Attesa')
    .setBackground('#fef7e0')
    .setFontColor('#f59e0b')
    .setRanges([sheet.getRange('C:C')])
    .build();
    
  const statusRule2 = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Ritiro')
    .setBackground('#dbeafe')
    .setFontColor('#3b82f6')
    .setRanges([sheet.getRange('C:C')])
    .build();
    
  const statusRule3 = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Consegna')
    .setBackground('#fef3c7')
    .setFontColor('#d97706')
    .setRanges([sheet.getRange('C:C')])
    .build();
    
  const statusRule4 = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Completato')
    .setBackground('#dcfce7')
    .setFontColor('#16a34a')
    .setRanges([sheet.getRange('C:C')])
    .build();
  
  sheet.setConditionalFormatRules([statusRule1, statusRule2, statusRule3, statusRule4]);
  
  // Freeze header row
  sheet.setFrozenRows(1);
  
  // Add alternating row colors for better readability
  const dataRange = sheet.getRange(2, 1, 100, headers.length);
  dataRange.applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY);
  
  // Set up checkbox data validation for RITIRO_FATTO and CONSEGNA_FATTA
  const checkboxValidation = SpreadsheetApp.newDataValidation()
    .requireCheckbox()
    .build();
  sheet.getRange('N:N').setDataValidation(checkboxValidation); // RITIRO_FATTO
  sheet.getRange('O:O').setDataValidation(checkboxValidation); // CONSEGNA_FATTA
  
  // Add sample data row for reference (optional)
  const sampleData = [
    'REQ_001_1', '2024-01-15', 'In Attesa', 'Studio Dr. Rossi', '+39 02 1234567',
    'Via Roma 10, 20100 Milano MI', 'Mattina', 'Laboratorio Milano', '+39 02 9876543',
    'Via Brera 5, 20121 Milano MI', 'Impronte dentali x2', 'FRAGILE',
    '', false, false, '=HYPERLINK("https://script.google.com/macros/s/YOUR_WEB_APP_ID/exec?id="&A2, "🖨️ Apri Bolla")'
  ];
  sheet.getRange(2, 1, 1, sampleData.length).setValues([sampleData]);
  
  // Set text wrapping for address and notes columns
  sheet.getRange('F:F').setWrap(true); // INDIRIZZO_RITIRO
  sheet.getRange('J:J').setWrap(true); // INDIRIZZO_CONSEGNA
  sheet.getRange('K:K').setWrap(true); // COSA_CONSEGNARE
  sheet.getRange('L:L').setWrap(true); // NOTE_SPECIALI
  
  Logger.log('Foglio logistica configurato con successo!');
  SpreadsheetApp.getUi().alert('Il foglio logistica è stato configurato con successo!\n\nFunzionalità aggiunte:\n• Stati colorati\n• Menu a tendina per validazione\n• Checkbox per completamento\n• Formattazione corretta\n• Dati di esempio nella riga 2\n• Colonna link per bolle di consegna\n\n⚠️ IMPORTANTE: Configura il WEB_APP_URL nella funzione setupDeliverySlipLinks()');
}

/**
 * Configura i link alle bolle di consegna
 * ⚠️ CHIAMARE DOPO AVER DEPLOYATO LA WEB APP!
 */
function setupDeliverySlipLinks() {
  // ⚠️ INSERISCI QUI L'URL DELLA TUA WEB APP
  const WEB_APP_URL = 'https://script.google.com/macros/s/YOUR_WEB_APP_ID/exec';
  
  if (WEB_APP_URL.includes('YOUR_WEB_APP_ID')) {
    SpreadsheetApp.getUi().alert('⚠️ ERRORE: Devi prima inserire l\'URL della tua Web App nella variabile WEB_APP_URL!');
    return;
  }
  
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();
  
  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert('Nessun dato trovato. Aggiungi prima delle righe di dati.');
    return;
  }
  
  // Formula per la colonna STAMPA_BOLLA (colonna P = 16)
  const formula = `=IF(A2<>"", HYPERLINK("${WEB_APP_URL}?id="&A2, "🖨️ Apri Bolla"), "")`;
  
  // Applica la formula a tutte le righe con dati
  const range = sheet.getRange(2, 16, lastRow - 1, 1); // Colonna P (16), dalla riga 2
  
  // Riempie tutte le celle con la formula
  for (let i = 2; i <= lastRow; i++) {
    const cellFormula = `=IF(A${i}<>"", HYPERLINK("${WEB_APP_URL}?id="&A${i}, "🖨️ Apri Bolla"), "")`;
    sheet.getRange(i, 16).setFormula(cellFormula);
  }
  
  // Formattazione della colonna link
  range.setHorizontalAlignment('center')
       .setFontSize(10)
       .setFontWeight('bold');
  
  SpreadsheetApp.getUi().alert(`✅ Link configurati con successo!\n\nURL Web App: ${WEB_APP_URL}\n\nOra puoi cliccare sui link "🖨️ Apri Bolla" per vedere le bolle di consegna.`);
}

/**
 * Helper function to add new logistics entries
 * Call this function from your web app
 */
function addLogisticsEntry(data) {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();
  
  const rowData = [
    data.ID,
    data.DATA,
    data.STATO || 'In Attesa',
    data.NOME_STUDIO,
    data.TELEFONO_STUDIO,
    data.INDIRIZZO_RITIRO,
    data.ORARIO_RITIRO,
    data.CONSEGNA_A,
    data.TELEFONO_CONSEGNA,
    data.INDIRIZZO_CONSEGNA,
    data.COSA_CONSEGNARE,
    data.NOTE_SPECIALI,
    data.AUTISTA || '',
    false, // RITIRO_FATTO
    false  // CONSEGNA_FATTA
  ];
  
  sheet.getRange(lastRow + 1, 1, 1, rowData.length).setValues([rowData]);
  return lastRow + 1;
}

/**
 * Helper function to update status
 */
function updateDeliveryStatus(id, stato, autista = '') {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) { // Check ID column
      sheet.getRange(i + 1, 3).setValue(stato); // Update STATO
      if (autista) {
        sheet.getRange(i + 1, 13).setValue(autista); // Update AUTISTA
      }
      break;
    }
  }
} 