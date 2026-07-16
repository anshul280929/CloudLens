# ☁️ CloudLens — Developer Intelligence Platform

**"A lens into every cloud service you use."**

CloudLens is a powerful, unified dashboard that automatically detects, categorizes, and tracks every cloud service dependency across your GitHub repositories. It provides developers and engineering teams with full visibility into their infrastructure footprint, keeping track of active services, identifying exposed secrets, recommending cost optimizations, and warning you about inactive or expiring cloud services.

## ✨ Features

- **Automated Service Detection:** Connect your GitHub account and CloudLens will instantly scan your repositories for packages, imports, configurations, and environment variables related to cloud providers (AWS, GCP, Azure, Vercel, Supabase, Stripe, etc.).
- **Smart Alerts & Notifications:** Receive alerts for unused services, upcoming free-tier expirations, and real-time outages.
- **AI-Powered Insights:** Employs advanced LLMs to perform deep scans on your codebase, detecting exposed API keys and suggesting intelligent architectural optimizations and cost-saving consolidations.
- **Visual Architecture Maps:** Auto-generates interactive node-based relationship diagrams of your repository's cloud infrastructure.
- **Cost Tracking & Burn Rate:** Predicts your monthly cloud infrastructure burn rate and helps identify wasted spend.
- **Developer Hygiene Scores:** Gamifies repository maintenance with health scores and achievement badges.

## 🛠️ Tech Stack (2026 Edition)

- **Framework:** Next.js 15 (App Router, React Server Components)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + Framer Motion
- **UI Components:** shadcn/ui
- **Database:** Neon (Serverless PostgreSQL)
- **ORM:** Drizzle ORM
- **Authentication:** NextAuth.js v5
- **Background Jobs:** Inngest
- **AI Integration:** Vercel AI SDK (GPT-4o-mini / Gemini 1.5 Flash)

## 🚀 Getting Started

### Prerequisites

- Node.js (>= 20)
- npm, yarn, or pnpm
- A Neon Serverless Postgres Database (or any PostgreSQL database)
- A GitHub OAuth Application (for authentication)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/cloudlens.git
   cd cloudlens
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env.local` and fill in your keys:
   ```bash
   cp .env.example .env.local
   ```
   *Note: Generate your NextAuth secret using `npx auth secret`.*

4. **Initialize the Database:**
   Push the Drizzle schema to your Neon database:
   ```bash
   npx drizzle-kit push
   ```

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## 📄 License

This project is licensed under the MIT License.
