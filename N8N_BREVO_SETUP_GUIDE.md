# 🚀 Setup Guide - n8n + Brevo Hybrid Solution

## 📋 Overview
**Perfect hybrid:** n8n for workflow management + Brevo for professional emails

**Benefits:**
- ✅ **n8n execution tracking** - See every step, debug easily
- ✅ **Brevo professional emails** - No SMTP setup needed  
- ✅ **Google Sheets integration** - All deliveries tracked
- ✅ **Zero custom domains** - Use any email address
- ✅ **300 free emails/day** - Perfect for dental logistics volume

---

## ⚡ Quick Setup (15 minuti)

### **Step 1: Setup Brevo Account (5 min)**
1. **Go to [Brevo.com](https://brevo.com)**
2. **Sign up free** (300 emails/day)
3. **Go to Settings → API Keys**
4. **Create new API key**
5. **Copy the API key** (you'll need it for n8n)

### **Step 2: Setup Google Sheets (3 min)**
1. **Go to [Google Sheets](https://sheets.google.com)**
2. **Create new sheet**: "Dental Logistics"
3. **Copy the Sheet ID** from URL: `https://docs.google.com/spreadsheets/d/[THIS_IS_THE_ID]/edit`
4. **Share the sheet** with your Google service account email (if using one)

### **Step 3: Setup n8n Workflow (5 min)**
1. **Open n8n**
2. **Create new workflow** 
3. **Import the workflow** from `n8n_workflow_template.json`
4. **Configure the nodes:**

#### A. Google Sheets Node:
```
Document ID: [YOUR_GOOGLE_SHEET_ID]
Sheet Name: Sheet1
```

#### B. Brevo Email Node:
```
api-key: [YOUR_BREVO_API_KEY]
sender email: logistics@your-consulting-studio.com
to email: drivers@cooperativatrasporti.it
```

5. **Activate the workflow**
6. **Copy the webhook URL**

### **Step 4: Update React Form (2 min)**
1. **In `src/app/page.tsx`**, find:
   ```javascript
   const n8nWebhookUrl = 'https://hooks.n8n.cloud/webhook/YOUR_N8N_WEBHOOK_ID';
   ```
2. **Replace with your webhook URL** from Step 3
3. **Restart dev server**: `npm run dev`

---

## 🧪 Testing

### **Test the Full Flow:**
1. **Fill out the React form** with test data
2. **Submit the form**
3. **Check n8n execution log** - should show success
4. **Check Google Sheets** - should have new delivery rows
5. **Check email** - should receive professional notification

### **Sample Test Data:**
```json
{
  "companyName": "Studio Test",
  "companyPhone": "+39 0432 123456", 
  "pickupLocation": "Via Roma 123, 33100 Udine",
  "pickupDate": "2024-12-15",
  "pickupTime": "10:00-11:00",
  "recipients": [
    {
      "destination": "Laboratorio Test",
      "phoneNumber": "+39 0432 654321",
      "shippingAddress": "Via Venezia 456, 33100 Udine",
      "items": [
        {
          "type": "impronte_dentali",
          "fragile": true,
          "urgent": false
        }
      ],
      "specialInstructions": "Handle with care"
    }
  ]
}
```

---

## 🎯 Configuration Details

### **Required n8n Node Configurations:**

#### **1. Webhook Node** (Auto-generated)
- Path: `dental-logistics`
- Method: POST
- Response mode: Response node

#### **2. Transform Data Node** (Pre-configured)
- Converts form data into delivery rows
- Generates unique IDs
- Processes multiple recipients

#### **3. Google Sheets Node**
```
Authentication: Service Account (recommended)
Document ID: YOUR_SHEET_ID
Sheet Name: Sheet1
Operation: Append or Update
Column to match: A (ID column)
```

#### **4. Generate Email HTML Node** (Pre-configured)
- Creates professional email template
- Adds priority badges (URGENT/FRAGILE)
- Italian formatting

#### **5. Brevo Email Node**
```
URL: https://api.brevo.com/v3/smtp/email
Headers:
  - Content-Type: application/json
  - api-key: YOUR_BREVO_API_KEY

Body:
  - sender: {"name": "Sistema Logistica", "email": "YOUR_EMAIL"}
  - to: [{"email": "drivers@cooperativatrasporti.it"}]
  - subject: Dynamic based on delivery
  - htmlContent: From previous node
```

#### **6. Response Node** (Pre-configured)
- Returns success/error to React form

---

## 🔧 Customization

### **Change Email Branding:**
In the "Generate Email HTML" node, modify:
```javascript
// Company name
<div>🚚 <strong>Your Company Name</strong></div>

// Colors
background: linear-gradient(135deg, #YOUR_COLOR_1 0%, #YOUR_COLOR_2 100%);

// Add logo
<img src="https://yoursite.com/logo.png" style="max-height: 50px;">
```

### **Change Email Addresses:**
In the "Send Email via Brevo" node:
```javascript
// From address (must be verified in Brevo)
"sender": {"name": "Your Name", "email": "your-email@domain.com"}

// To address
"to": [{"email": "your-drivers@company.com"}]
```

### **Add More Fields:**
1. **Add to React form**
2. **Modify Transform Data node** to include new fields
3. **Update Google Sheets headers**
4. **Modify email template** to show new data

---

## 🛠 Troubleshooting

### **❌ n8n webhook not receiving data**
- Check React form URL matches n8n webhook
- Verify workflow is activated
- Check browser Network tab for request errors

### **❌ Google Sheets not updating**
- Verify Sheet ID is correct
- Check service account permissions
- Ensure sheet is shared with service account

### **❌ Emails not sending**
- Verify Brevo API key is correct
- Check sender email is verified in Brevo
- Ensure recipient email exists
- Check n8n execution logs for Brevo errors

### **❌ Email formatting issues**
- Verify HTML syntax in Generate Email HTML node
- Test with simple text first
- Check for special characters in data

---

## 📊 What You Get

### **Professional Email Output:**
```
🚚 Nuova Richiesta di Consegna
Sistema Logistica Dentale

🏷️ ID: REQ_1701234567_1

Ciao team! È arrivata una nuova richiesta...

📤 RITIRO DA
Studio: Studio Dentistico Bianchi
Indirizzo: Via Roma 123, 33100 Udine
Data e Ora: 15/12/2024 - 10:00-11:00
Telefono: +39 0432 123456

📥 CONSEGNA A
Destinatario: Laboratorio Rossi
Indirizzo: Via Venezia 456, 33100 Udine
Telefono: +39 0432 654321
Materiali: Impronte Dentali [FRAGILE]

Buon lavoro! 🚀
```

### **Google Sheets Tracking:**
- Automatic delivery row creation
- Unique IDs for each delivery
- Status tracking columns
- Driver assignment fields

### **n8n Execution Logs:**
- See every step of processing
- Debug failed executions
- Monitor email delivery status
- Track form submissions

---

## 💰 Costs

- **n8n Cloud Starter:** $20/month (or self-hosted free)
- **Brevo:** FREE (300 emails/day) 
- **Google Sheets:** FREE
- **Total:** $0-20/month depending on n8n hosting

---

## 🎉 Production Checklist

- [ ] Brevo API key configured
- [ ] Google Sheets ID set correctly
- [ ] Email addresses updated
- [ ] n8n webhook URL in React form
- [ ] End-to-end test completed
- [ ] Email delivery confirmed
- [ ] Workflow activated in n8n

---

**🚀 You're all set!** 

This hybrid solution gives you the best of both worlds: powerful n8n workflow management with simple, professional Brevo email delivery. Every form submission will create trackable deliveries and send beautiful email notifications to your drivers team.

**For support:** Check n8n execution logs - they show exactly what's happening at each step! 