# Drivers Company - Professional Logistics Form

A modern, responsive web application for managing logistics and delivery requests for Drivers Company.

## 🚀 Features

- **Professional Form Interface**: Clean, user-friendly form for logistics requests
- **Real-time Validation**: Comprehensive form validation with immediate feedback
- **Phone Number Validation**: International phone number support with proper formatting
- **Multi-step Process**: Organized form flow with progress indication
- **Email Integration**: Automated confirmation emails and internal notifications
- **n8n Workflow Integration**: Seamless backend automation with Google Sheets and email
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices

## 📋 Prerequisites

- Node.js 18+ and npm
- Modern web browser
- n8n instance (for backend automation)
- Google Sheets API access
- Email service (Brevo/SendGrid recommended)

## 🛠️ Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/anasnajoui/driverscompany.git
   cd driverscompany
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## 🚀 Deployment

### Quick Deploy
```bash
npm run deploy
```

### Manual Deployment
1. Build the project: `npm run build`
2. Deploy the `dist/` folder to your hosting platform:
   - **Netlify**: Drag and drop the `dist` folder
   - **Vercel**: Connect GitHub repo and deploy
   - **Apache/Nginx**: Copy `dist` contents to web root

### Environment Setup
The application is configured to work with the included n8n workflow template. Make sure to:

1. Import the n8n workflow from `n8n_workflow_fixed.json`
2. Configure your Google Sheets integration
3. Set up email service credentials
4. Update webhook URLs in the form

## 📁 Project Structure

```
├── src/
│   ├── app/                    # Main application components
│   │   ├── components/         # React components
│   │   ├── steps/             # Form step components
│   │   └── App.tsx            # Main app component
│   ├── constants/             # Application constants
│   ├── lib/                   # Utility functions
│   ├── styles/               # CSS and styling
│   └── types/                # TypeScript type definitions
├── components/               # UI component library
├── n8n_workflow_fixed.json   # n8n automation workflow
├── email_template.html       # Email templates
└── README.md                # This file
```

## 🔧 Configuration

### Form Settings
- Edit `src/constants/` for form field configurations
- Modify `src/types/` for data structure changes
- Update validation rules in respective component files

### Styling
- Global styles: `src/styles/globals.css`
- Tailwind configuration: `tailwind.config.js`
- Component-specific styles: individual `.tsx` files

### n8n Integration
1. Import `n8n_workflow_fixed.json` into your n8n instance
2. Configure Google Sheets connection
3. Set up email service (Brevo recommended)
4. Update webhook URL in form submission

## 📧 Email Templates

The project includes professional email templates:
- **Customer Confirmation**: Detailed order confirmation with company contact info
- **Internal Notification**: Staff notification with complete form data
- **PDF Generation**: Automated delivery slip creation

## 🌐 Company Information

**Drivers Company**
- Address: Via Oderzo 1, 33100 Udine, Italy
- Phone: 0432-526200
- Fax: 0432-620126
- Mobile: 328-2090944

## 🔨 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run deploy` - Build and prepare for deployment

### Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **UI Components**: Radix UI, Lucide React
- **Phone Validation**: libphonenumber-js
- **Backend**: n8n workflows
- **Storage**: Google Sheets
- **Email**: Brevo/SendGrid

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📄 License

© 2024 Drivers Company. All rights reserved.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

For technical support or questions, contact: [Your Contact Information] 