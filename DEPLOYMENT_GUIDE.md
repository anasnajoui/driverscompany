# 🚀 Deployment Guide - Drivers Company Logistics Form

This guide provides step-by-step instructions for deploying your Drivers Company logistics form application to various hosting platforms.

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:
- [ ] Tested the application locally (`npm run dev`)
- [ ] Successfully built the project (`npm run build`)
- [ ] Set up your n8n workflow with the correct webhook URL
- [ ] Configured Google Sheets integration
- [ ] Set up email service (Brevo/SendGrid)
- [ ] Updated any hardcoded URLs in the code

## 🌐 Deployment Options

### Option 1: Netlify (Recommended - Free & Easy)

1. **Via GitHub Integration:**
   ```bash
   # Your code is already pushed to GitHub!
   # Go to: https://app.netlify.com/
   # Click "New site from Git"
   # Connect your GitHub account
   # Select repository: anasnajoui/driverscompany
   ```

2. **Build Settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 18

3. **Deploy:**
   - Click "Deploy site"
   - Your site will be live in 2-3 minutes
   - You'll get a URL like: `https://amazing-name-123456.netlify.app`

4. **Custom Domain (Optional):**
   - Go to Site settings > Domain management
   - Add your custom domain
   - Follow DNS configuration instructions

### Option 2: Vercel (Excellent for React)

1. **Via GitHub:**
   ```bash
   # Go to: https://vercel.com/
   # Click "Continue with GitHub"
   # Import your repository: anasnajoui/driverscompany
   ```

2. **Configuration:**
   - Framework Preset: Vite
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Deploy:**
   - Click "Deploy"
   - Live in 1-2 minutes
   - Auto-deploys on every push to main branch

### Option 3: Manual Deployment (Any Web Host)

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Upload dist folder:**
   - Copy everything inside the `dist/` folder
   - Upload to your web host's public folder (usually `public_html/`, `www/`, or `htdocs/`)

3. **Common hosting providers:**
   - **cPanel hosting:** Upload via File Manager
   - **FTP/SFTP:** Use FileZilla or similar
   - **Shared hosting:** Follow provider's file upload instructions

### Option 4: GitHub Pages (Free)

1. **Install gh-pages:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add deploy script to package.json:**
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Deploy:**
   ```bash
   npm run deploy
   ```

4. **Configure GitHub Pages:**
   - Go to your repository settings
   - Scroll to "Pages" section
   - Source: Deploy from a branch
   - Branch: gh-pages
   - Your site: `https://anasnajoui.github.io/driverscompany/`

## ⚙️ Post-Deployment Configuration

### 1. Update Webhook URLs

After deployment, update your n8n workflow:
```json
{
  "webhook_url": "https://your-deployed-site.com/webhook"
}
```

### 2. Test Form Submission

1. Visit your deployed site
2. Fill out the form completely
3. Submit and verify:
   - Email confirmation received
   - Data appears in Google Sheets
   - Internal notification email sent

### 3. Configure Domain (If using custom domain)

Update any hardcoded URLs in:
- n8n workflow webhook endpoints
- Email templates (if any contain links)
- Form action URLs

## 🔧 Environment-Specific Settings

### Development
```bash
npm run dev
# Local server: http://localhost:5173
```

### Production Build
```bash
npm run build
# Creates optimized build in dist/
```

### Preview Production Build
```bash
npm run preview
# Test production build locally
```

## 📱 Mobile & Responsive Testing

After deployment, test on:
- [ ] Desktop browsers (Chrome, Firefox, Safari, Edge)
- [ ] Mobile devices (iOS Safari, Android Chrome)
- [ ] Tablet devices
- [ ] Different screen sizes

## 🚨 Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 404 Errors on Refresh
Add this to your hosting platform:
- **Netlify:** Create `_redirects` file in `public/` with: `/*    /index.html   200`
- **Vercel:** Create `vercel.json` with rewrites configuration
- **Apache:** Add `.htaccess` with rewrite rules

### Form Not Submitting
1. Check browser console for errors
2. Verify n8n webhook URL is accessible
3. Test webhook endpoint manually
4. Check CORS settings if needed

## 📊 Performance Optimization

Your app is already optimized with:
- ✅ Vite build optimization
- ✅ CSS minification
- ✅ JavaScript code splitting
- ✅ Optimized React build

## 🔐 Security Considerations

- ✅ No sensitive data in client-side code
- ✅ Form validation on both client and server
- ✅ HTTPS enforced (handled by hosting platforms)
- ✅ No API keys exposed in frontend

## 📈 Analytics (Optional)

Add Google Analytics:
1. Get tracking ID from Google Analytics
2. Add to `index.html` in the public folder
3. Rebuild and redeploy

## 🎯 Quick Deploy Command

```bash
# One-command deploy (after initial setup)
npm run deploy
```

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Test locally first (`npm run dev`)
3. Verify all integrations (n8n, Google Sheets, email)
4. Check hosting platform documentation

---

**Your app is now live and ready to handle logistics requests! 🎉**

Repository: https://github.com/anasnajoui/driverscompany.git 