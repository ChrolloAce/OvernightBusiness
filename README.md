# 🚀 Overnight Biz Dashboard

A comprehensive client management platform with integrated Google Business Profile management and AI-powered content generation.

## ✨ Features

### 🏢 Client Management
- **Client Dashboard**: Track active clients, MRR, profit margins, and outstanding invoices
- **Client Profiles**: Detailed client information with Google Business Profile integration
- **Project Tracking**: Manage projects and tasks across all clients
- **Sales Pipeline**: Kanban-style deal management with stage tracking
- **Financial Reports**: Revenue tracking, invoice management, and expense reporting

### 🏪 Google Business Profile Integration
- **Multi-Profile Management**: Connect and manage multiple Google Business Profiles per client
- **Performance Analytics**: Track views, clicks, and engagement metrics
- **Review Management**: Respond to and manage customer reviews
- **AI Content Generation**: Generate blogs and posts using GPT-4
- **Content Scheduling**: Automated posting with intelligent timing

### 📊 Business Intelligence
- **KPI Dashboard**: Real-time metrics for clients, revenue, and performance
- **Financial Tracking**: Invoice status, payment tracking, and profit analysis
- **Task Management**: Assign and track tasks across team members
- **Access Vault**: Secure credential management for client accounts

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS with custom animations
- **UI Components**: Radix UI primitives
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Charts**: Recharts
- **File Uploads**: UploadThing
- **Email**: Resend
- **Payments**: Stripe (optional)

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
overnight-biz/
├── app/
│   ├── globals.css          # Global styles and animations
│   ├── layout.tsx           # Root layout component
│   └── page.tsx             # Main dashboard page
├── lib/
│   └── utils.ts             # Utility functions
├── components/              # Reusable UI components
├── public/                  # Static assets
└── ...config files
```

## 🎨 Design Features

- **Cyberpunk Theme**: Dark gradients with neon accents
- **Glassmorphism**: Translucent panels with backdrop blur
- **Smooth Animations**: Framer Motion powered interactions
- **Responsive Design**: Mobile-first approach
- **Custom Scrollbars**: Themed scrollbars with gradient effects

## 🔗 API Integrations (Planned)

- Google Business Profile API
- Google OAuth 2.0
- OpenAI GPT-4 API
- Google Gemini API
- Anthropic Claude API

## 📊 Dashboard Sections

1. **Dashboard**: KPIs, revenue charts, and recent invoices
2. **Clients**: Client management with Google Business Profile integration
3. **Tasks**: Task assignment and tracking across clients
4. **Deals**: Sales pipeline with kanban-style deal management
5. **Business Profiles**: Google Business Profile management
6. **Analytics**: Performance insights and trends
7. **Reports**: Financial reports and business intelligence

## 🚧 Development Status

This is a prototype dashboard showcasing the UI/UX design. API integrations and backend functionality are planned for future releases.

## 📝 License

MIT License - see LICENSE file for details. 