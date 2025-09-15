# 🔧 Google Cloud Console Setup Guide

This guide will walk you through setting up Google Business Profile API integration for Overnight Biz.

## 📋 Prerequisites

- Google account with access to Google Cloud Console
- Business profiles already created on Google Business Profile
- Admin access to the business profiles you want to manage

## 🚀 Step-by-Step Setup

### Step 1: Create a Google Cloud Project

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create a New Project**
   - Click "Select a project" dropdown at the top
   - Click "New Project"
   - Enter project name: `overnight-biz-dashboard`
   - Click "Create"

3. **Select Your Project**
   - Make sure your new project is selected in the dropdown

### Step 2: Enable Required APIs

1. **Navigate to APIs & Services**
   - In the left sidebar, click "APIs & Services" > "Library"

2. **Enable Google Business Profile API**
   - Search for "My Business Business Information API"
   - Click on it and press "Enable"
   - Search for "My Business Account Management API"
   - Click on it and press "Enable"

3. **Enable Additional APIs (if needed)**
   - "Google+ API" (for user profile info)
   - "Places API" (for location data)

### Step 3: Configure OAuth Consent Screen

1. **Go to OAuth Consent Screen**
   - Navigate to "APIs & Services" > "OAuth consent screen"

2. **Choose User Type**
   - Select "External" (unless you have a Google Workspace account)
   - Click "Create"

3. **Fill App Information**
   ```
   App name: Overnight Biz Dashboard
   User support email: your-email@example.com
   Developer contact email: your-email@example.com
   ```

4. **Add Scopes**
   - Click "Add or Remove Scopes"
   - Add these scopes:
     - `https://www.googleapis.com/auth/business.manage`
     - `https://www.googleapis.com/auth/userinfo.email`
     - `https://www.googleapis.com/auth/userinfo.profile`

5. **Add Test Users** (for development)
   - Add your email and any other emails that need access during testing

### Step 4: Create OAuth 2.0 Credentials

1. **Go to Credentials**
   - Navigate to "APIs & Services" > "Credentials"

2. **Create OAuth Client ID**
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"

3. **Configure the Client**
   ```
   Name: Overnight Biz Web Client
   Authorized JavaScript origins: http://localhost:3000
   Authorized redirect URIs: http://localhost:3000/auth/callback
   ```

4. **Save Credentials**
   - Click "Create"
   - **IMPORTANT**: Copy the Client ID and Client Secret
   - Download the JSON file for backup

### Step 5: Set Up Environment Variables

1. **Create `.env.local` file** in your project root:
   ```env
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id_here
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   NEXT_PUBLIC_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback
   ```

2. **Replace the values** with your actual credentials from Step 4

### Step 6: Verify Business Profile Access

1. **Check Business Profile Manager**
   - Go to: https://business.google.com/
   - Ensure you have admin access to the business profiles you want to manage

2. **Note Business Profile IDs**
   - You'll need these for API calls
   - They look like: `accounts/123456789/locations/987654321`

## 🔐 Security Best Practices

### Production Setup

When deploying to production, update these settings:

1. **Update OAuth Consent Screen**
   - Change from "Testing" to "In production"
   - Add your production domain

2. **Update Authorized Origins**
   ```
   Authorized JavaScript origins: https://yourdomain.com
   Authorized redirect URIs: https://yourdomain.com/auth/callback
   ```

3. **Environment Variables**
   ```env
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   NEXT_PUBLIC_GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/callback
   ```

### Security Notes

- **Never expose Client Secret** in frontend code
- **Use HTTPS** in production
- **Regularly rotate** API keys and secrets
- **Limit scopes** to only what you need
- **Monitor API usage** in Google Cloud Console

## 🧪 Testing the Integration

1. **Start your development server**
   ```bash
   npm run dev
   ```

2. **Navigate to Business Profiles**
   - Go to http://localhost:3000
   - Click "Business Profiles" in the sidebar

3. **Connect Google Account**
   - Click "Connect Google Account"
   - Complete the OAuth flow
   - You should see your business profiles

## 📊 API Quotas and Limits

### Free Tier Limits
- **My Business API**: 1,000 requests per day
- **Places API**: $200 free credit per month

### Rate Limits
- **Queries per second**: 10 QPS
- **Queries per minute**: 600 QPM

## 🔧 Troubleshooting

### Common Issues

1. **"Access blocked" error**
   - Ensure OAuth consent screen is configured
   - Add your email as a test user
   - Check that all required scopes are added

2. **"Invalid redirect URI" error**
   - Verify redirect URI matches exactly in OAuth settings
   - Check for trailing slashes or typos

3. **"Insufficient permissions" error**
   - Ensure you have admin access to business profiles
   - Check that Business Profile API is enabled

4. **"Invalid client" error**
   - Verify Client ID and Secret are correct
   - Check environment variables are loaded

### Debug Steps

1. **Check Console Logs**
   - Open browser developer tools
   - Look for error messages in console

2. **Verify API Responses**
   - Check network tab for failed requests
   - Look at response status codes and messages

3. **Test API Endpoints**
   - Use Google's API Explorer: https://developers.google.com/my-business/reference/rest
   - Test with your access token

## 📞 Support

If you encounter issues:

1. **Google Cloud Support**
   - Check Google Cloud Console for API status
   - Review quota usage and billing

2. **Google Business Profile Help**
   - Visit: https://support.google.com/business/

3. **API Documentation**
   - My Business API: https://developers.google.com/my-business/reference/rest

## ✅ Checklist

Before going live, ensure:

- [ ] Google Cloud project created
- [ ] Required APIs enabled
- [ ] OAuth consent screen configured
- [ ] OAuth credentials created
- [ ] Environment variables set
- [ ] Business profile access verified
- [ ] Test authentication flow works
- [ ] Production domains configured
- [ ] Security best practices implemented

---

**Next Steps**: Once setup is complete, you can start managing business profiles, creating posts, and responding to reviews through the dashboard! 