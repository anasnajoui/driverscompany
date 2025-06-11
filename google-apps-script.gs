// 🚚 DENTAL LOGISTICS - GOOGLE APPS SCRIPT
// Questo script riceve i dati dal form React e invia email via Brevo

// ⚠️ CONFIGURAZIONE - AGGIORNA QUESTI VALORI
const CONFIG = {
  // Brevo API (signup gratis su brevo.com)
  BREVO_API_KEY: 'YOUR_BREVO_API_KEY_HERE', // ⚠️ DA CAMBIARE!
  
  // Email settings
  FROM_EMAIL: 'logistics@your-consulting-studio.com', // ⚠️ DA CAMBIARE!
  FROM_NAME: 'Sistema Logistica Dentale',
  TO_EMAIL: 'drivers@cooperativatrasporti.it', // ⚠️ DA CAMBIARE!
  
  // Google Sheets
  SHEET_NAME: 'Consegne',
  LOG_SHEET_NAME: 'Email_Log'
};

// 📥 MAIN FUNCTION - Riceve dati dal React form
function doPost(e) {
  try {
    console.log('📨 Nuova richiesta ricevuta');
    
    // Parse JSON data
    const formData = JSON.parse(e.postData.contents);
    console.log('📋 Dati form:', formData);
    
    // Process each recipient as separate delivery
    const deliveries = processFormData(formData);
    console.log(`📦 Processate ${deliveries.length} consegne`);
    
    // Save to Google Sheets
    saveToSheets(deliveries);
    console.log('✅ Dati salvati in Google Sheets');
    
    // Send emails for each delivery
    deliveries.forEach((delivery, index) => {
      setTimeout(() => {
        sendDeliveryEmail(delivery);
      }, index * 1000); // Spread emails 1 second apart
    });
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Richiesta processata con successo',
        deliveries: deliveries.length
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('❌ Errore:', error);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 🔄 TRANSFORM DATA - Converte una richiesta in multiple consegne
function processFormData(formData) {
  const baseRequestId = `REQ_${Date.now()}`;
  const submissionDate = new Date().toISOString().split('T')[0];
  
  const deliveries = [];
  
  formData.recipients.forEach((recipient, index) => {
    const deliveryId = `${baseRequestId}_${index + 1}`;
    
    // Create items summary
    const itemsSummary = recipient.items.map(item => {
      const type = item.type === 'altro' ? item.description : item.type.replace('_', ' ');
      return type;
    }).join(', ');
    
    // Special handling notes
    const specialNotes = [];
    if (recipient.items.some(item => item.fragile)) specialNotes.push('FRAGILE');
    if (recipient.items.some(item => item.urgent)) specialNotes.push('URGENTE');
    if (recipient.specialInstructions) specialNotes.push(recipient.specialInstructions);
    
    const delivery = {
      // Google Sheets columns
      id: deliveryId,
      data: formData.pickupDate,
      stato: 'In Attesa',
      nomeStudio: formData.companyName,
      telefonoStudio: formData.companyPhone,
      indirizzoRitiro: formData.pickupLocation,
      orarioRitiro: formData.pickupTime,
      consegnaA: recipient.destination,
      telefonoConsegna: recipient.phoneNumber,
      indirizzoConsegna: recipient.shippingAddress,
      cosaConsegnare: itemsSummary,
      noteSpeciali: specialNotes.join(' | '),
      autista: '',
      ritiroFatto: false,
      consegnaFatta: false,
      
      // Additional data for email
      originalForm: formData,
      recipient: recipient,
      isUrgent: recipient.items.some(item => item.urgent),
      isFragile: recipient.items.some(item => item.fragile)
    };
    
    deliveries.push(delivery);
  });
  
  return deliveries;
}

// 📊 SAVE TO SHEETS - Salva dati nel Google Sheet
function saveToSheets(deliveries) {
  const sheet = getOrCreateSheet(CONFIG.SHEET_NAME);
  
  // Create headers if sheet is empty
  if (sheet.getLastRow() === 0) {
    const headers = [
      'ID', 'DATA', 'STATO', 'NOME_STUDIO', 'TELEFONO_STUDIO', 
      'INDIRIZZO_RITIRO', 'ORARIO_RITIRO', 'CONSEGNA_A', 
      'TELEFONO_CONSEGNA', 'INDIRIZZO_CONSEGNA', 'COSA_CONSEGNARE', 
      'NOTE_SPECIALI', 'AUTISTA', 'RITIRO_FATTO', 'CONSEGNA_FATTA'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  
  // Add delivery rows
  deliveries.forEach(delivery => {
    const row = [
      delivery.id,
      delivery.data,
      delivery.stato,
      delivery.nomeStudio,
      delivery.telefonoStudio,
      delivery.indirizzoRitiro,
      delivery.orarioRitiro,
      delivery.consegnaA,
      delivery.telefonoConsegna,
      delivery.indirizzoConsegna,
      delivery.cosaConsegnare,
      delivery.noteSpeciali,
      delivery.autista,
      delivery.ritiroFatto,
      delivery.consegnaFatta
    ];
    
    sheet.appendRow(row);
  });
}

// 📧 SEND EMAIL - Invia email via Brevo API
function sendDeliveryEmail(delivery) {
  try {
    const emailHtml = generateEmailHTML(delivery);
    
    const emailPayload = {
      sender: {
        name: CONFIG.FROM_NAME,
        email: CONFIG.FROM_EMAIL
      },
      to: [{
        email: CONFIG.TO_EMAIL,
        name: 'Team Drivers'
      }],
      subject: `🚚 Nuova Consegna - ${delivery.id} - ${delivery.nomeStudio}`,
      htmlContent: emailHtml
    };
    
    const response = UrlFetchApp.fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': CONFIG.BREVO_API_KEY
      },
      payload: JSON.stringify(emailPayload)
    });
    
    const responseData = JSON.parse(response.getContentText());
    
    if (response.getResponseCode() === 201) {
      console.log(`✅ Email inviata per ${delivery.id}`);
      logEmailSent(delivery, 'SUCCESS', responseData.messageId);
    } else {
      console.error(`❌ Errore email ${delivery.id}:`, responseData);
      logEmailSent(delivery, 'ERROR', JSON.stringify(responseData));
    }
    
  } catch (error) {
    console.error(`❌ Errore invio email ${delivery.id}:`, error);
    logEmailSent(delivery, 'ERROR', error.toString());
  }
}

// 🎨 GENERATE EMAIL HTML - Crea HTML professionale per email
function generateEmailHTML(delivery) {
  const currentDate = new Date().toLocaleDateString('it-IT');
  const currentTime = new Date().toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'});
  
  const urgentBadge = delivery.isUrgent ? '<span style="background: #f44336; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; margin-left: 8px;">URGENTE</span>' : '';
  const fragileBadge = delivery.isFragile ? '<span style="background: #ff9800; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; margin-left: 8px;">FRAGILE</span>' : '';
  
  const specialNotesSection = delivery.noteSpeciali ? 
    `<div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 15px; margin: 15px 0;">
       <strong>⚠️ NOTE SPECIALI:</strong><br>
       ${delivery.noteSpeciali}
     </div>` : '';
  
  return `
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nuova Consegna - ${delivery.id}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    
    <div style="background: linear-gradient(135deg, #4285f4 0%, #2196f3 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">🚚 Nuova Richiesta di Consegna</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Sistema Logistica Dentale</p>
    </div>
    
    <div style="background: white; padding: 30px 20px; border: 1px solid #ddd; border-top: none;">
        
        <div style="background: #e8f5e8; color: #2e7d32; padding: 8px 16px; border-radius: 20px; font-weight: 600; font-size: 14px; display: inline-block; margin-bottom: 20px;">
            🏷️ ID: ${delivery.id}
        </div>
        
        <p style="font-size: 16px; margin-bottom: 20px;">Ciao team! È arrivata una nuova richiesta di ritiro e consegna.</p>
        
        <!-- RITIRO -->
        <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3;">
            <h3 style="color: #2c3e50; margin-bottom: 15px; display: flex; align-items: center;">
                <span style="font-size: 20px; margin-right: 8px;">📤</span>
                RITIRO DA
            </h3>
            <p><strong>Studio:</strong> ${delivery.nomeStudio}</p>
            <p><strong>Indirizzo:</strong> ${delivery.indirizzoRitiro}</p>
            <p><strong>Data e Ora:</strong> ${delivery.data} - ${delivery.orarioRitiro}</p>
            <p><strong>Telefono:</strong> ${delivery.telefonoStudio}</p>
        </div>
        
        <!-- CONSEGNA -->
        <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
            <h3 style="color: #2c3e50; margin-bottom: 15px; display: flex; align-items: center;">
                <span style="font-size: 20px; margin-right: 8px;">📥</span>
                CONSEGNA A
            </h3>
            <p><strong>Destinatario:</strong> ${delivery.consegnaA}</p>
            <p><strong>Indirizzo:</strong> ${delivery.indirizzoConsegna}</p>
            <p><strong>Telefono:</strong> ${delivery.telefonoConsegna}</p>
            <p><strong>Materiali:</strong> ${delivery.cosaConsegnare} ${urgentBadge} ${fragileBadge}</p>
        </div>
        
        ${specialNotesSection}
        
        <div style="text-align: center; margin: 30px 0;">
            <p style="color: #666;">Per qualsiasi domanda, contattateci immediatamente.</p>
            <p style="font-weight: bold;">Buon lavoro! 🚀</p>
        </div>
        
    </div>
    
    <div style="background: #f1f3f4; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; color: #666; font-size: 14px;">
        <div>🚚 <strong>Cooperativa Trasporti</strong></div>
        <div>Servizio Logistico Dentale Professionale</div>
        <div style="margin-top: 10px; font-size: 12px; color: #888;">
            Email generata automaticamente il ${currentDate} alle ${currentTime}
        </div>
    </div>
    
</body>
</html>`;
}

// 📝 LOG EMAIL - Tiene traccia degli invii email
function logEmailSent(delivery, status, details) {
  const logSheet = getOrCreateSheet(CONFIG.LOG_SHEET_NAME);
  
  // Create headers if sheet is empty
  if (logSheet.getLastRow() === 0) {
    const headers = ['TIMESTAMP', 'DELIVERY_ID', 'STATUS', 'EMAIL_TO', 'DETAILS'];
    logSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  
  const row = [
    new Date().toISOString(),
    delivery.id,
    status,
    CONFIG.TO_EMAIL,
    details
  ];
  
  logSheet.appendRow(row);
}

// 🛠 UTILITY - Ottiene o crea un sheet
function getOrCreateSheet(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  
  return sheet;
}

// 🧪 TEST FUNCTION - Per testare manualmente
function testWithSampleData() {
  const sampleData = {
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
  };
  
  const e = {
    postData: {
      contents: JSON.stringify(sampleData)
    }
  };
  
  return doPost(e);
} 