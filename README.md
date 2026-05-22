<div align="center">

<img src="https://img.shields.io/badge/PlaceMentor-AI%20Placement%20Coach-7c3aed?style=for-the-badge&logo=sparkles&logoColor=white" alt="PlaceMentor" />

# 🎓 PlaceMentor — AI-Powered Placement Coach

### The smartest placement preparation platform for engineering students.
### Analyze your resume, track your coding progress, and get company-specific prep plans — all powered by AI.

[![Next.js](https://img.shields.io/badge/Next.js_15-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![Groq](https://img.shields.io/badge/Groq_AI-F55036?style=for-the-badge&logo=groq&logoColor=white)](https://groq.com/)

<br />

**[🚀 Live Demo](https://placementor-peach.vercel.app/)** • **[📸 Screenshots](#screenshots)** • **[✨ Features](#features)** • **[🛠️ Tech Stack](#tech-stack)** • **[⚡ Quick Start](#quick-start)**

<br />

![PlaceMentor Dashboard](https://via.placeholder.com/900x500/0a0a0f/8b5cf6?text=PlaceMentor+Dashboard)

</div>

---

## 🧠 What is PlaceMentor?

PlaceMentor is a **full-stack AI-powered placement preparation platform** built for engineering students. It goes far beyond a simple resume checker — it builds a complete picture of your technical profile by analyzing your resume, GitHub activity, and LeetCode performance together, then gives you hyper-specific, actionable guidance tailored to your actual skill level and target companies.

> Built by a student, for students. Every feature was designed with one goal: getting you placed at your dream company.

---

## ✨ Features

### 🤖 AI Resume Analyzer
- Upload your resume (PDF/DOCX) and get a detailed score out of 100
- AI cross-references your resume claims against your **real** GitHub and LeetCode data
- Identifies inconsistencies, missing keywords, and ATS optimization opportunities
- Gives immediate, short-term, and long-term action plans
- Powered by **Llama 3.3 70B via Groq** for fast, accurate analysis

### 🏢 Company-Specific Prep Engine
- Select any company (Google, Microsoft, Amazon, Infosys, TCS, and 100+ more)
- Get a complete prep plan including:
  - Full interview process breakdown with round-by-round tips
  - Topics to cover ranked by importance
  - Practice problems with difficulty levels
  - Week-by-week study plan
  - Insider tips and Do's & Don'ts
- Plans are saved and accessible anytime

### 📊 GitHub Integration
- Live stats: repos, stars, forks, followers
- Top programming languages breakdown
- Recent repository showcase
- All fetched in real-time via GitHub API

### 💻 LeetCode Integration
- Total problems solved with Easy/Medium/Hard breakdown
- Visual difficulty distribution bar
- Contest rating and attendance tracking
- Top problem-solving topics

### 📈 Progress Tracker
- Save progress snapshots over time
- Beautiful charts: Score trends, LeetCode growth, GitHub growth
- Placement readiness radar chart across 6 dimensions
- Activity log and company prep status tracker

### 👤 Smart Profile System
- Completion percentage tracker
- Resume storage via Supabase Storage
- Skills input with quick-add suggestions
- Target role and company tracking
- All data used by AI for personalized analysis

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router) + TypeScript |
| **Styling** | Tailwind CSS + shadcn/ui + Framer Motion |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth |
| **Storage** | Supabase Storage |
| **AI Engine** | Groq API (Llama 3.3 70B) |
| **Charts** | Recharts |
| **APIs** | GitHub REST API, LeetCode GraphQL API |
| **Deployment** | Vercel |
| **Package Manager** | pnpm |

---

## 🏗️ Architecture

placementor/
├── src/
│   ├── app/
│   │   ├── (auth)/          # Login & Register pages
│   │   ├── (dashboard)/     # Protected dashboard pages
│   │   │   ├── dashboard/   # Home dashboard
│   │   │   ├── profile/     # Profile setup
│   │   │   ├── analyze/     # AI Resume Analyzer
│   │   │   ├── company-prep/# Company prep engine
│   │   │   └── progress/    # Progress tracker
│   │   └── api/
│   │       ├── ai/          # AI analysis routes
│   │       └── integrations/# GitHub, LeetCode, snapshot
│   ├── components/          # React components
│   ├── lib/                 # Supabase clients, utilities
│   ├── hooks/               # Custom React hooks
│   ├── store/               # Zustand state management
│   └── types/               # TypeScript interfaces


---

## ⚡ Quick Start

### Prerequisites
- Node.js 20+
- pnpm (`npm install -g pnpm`)
- Supabase account
- Groq API key (free at [console.groq.com](https://console.groq.com))

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/placementor.git
cd placementor
```

### 2. Install dependencies
```bash
pnpm install
```

### 3. Set up environment variables
```bash
cp .env.example .env.local
```

Fill in your `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GROQ_API_KEY=your_groq_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Set up Supabase
- Create a new Supabase project
- Run the SQL schema from `supabase/schema.sql`
- Enable Email auth provider
- Create a `resumes` storage bucket

### 5. Run the development server
```bash
pnpm dev
```

Visit `http://localhost:3000` 🎉

---

## 🔑 Environment Variables

| Variable | Description | Required |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | ✅ |
| `GROQ_API_KEY` | Groq AI API key (free) | ✅ |
| `NEXT_PUBLIC_APP_URL` | Your app's public URL | ✅ |

---

## 🚀 Deployment

This project is deployed on **Vercel**. To deploy your own:

1. Fork this repository
2. Create a new project on [Vercel](https://vercel.com)
3. Connect your GitHub repository
4. Add all environment variables in Vercel project settings
5. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/placementor)

---

## 📱 Screenshots

<div align="center">

### Landing Page
![Landing](https://github.com/Ashishh13/placementor/issues/1)

### Dashboard
![Dashboard](https://github.com/Ashishh13/placementor/issues/2)

### AI Resume Analyzer
![Analyzer](https://github.com/Ashishh13/placementor/issues/3)

### Company Prep
![Company Prep](https://github.com/Ashishh13/placementor/issues/4)

### Profile
![Company Prep](https://github.com/Ashishh13/placementor/issues/5)

### Progress
![Company Prep](https://github.com/Ashishh13/placementor/issues/5)

</div>

---

## 🗺️ Roadmap

- [ ] LinkedIn profile analysis
- [ ] Mock interview simulator with AI feedback
- [ ] Peer comparison and leaderboard
- [ ] Email notifications for prep reminders
- [ ] Mobile app (React Native)
- [ ] Browser extension for LeetCode tracking
- [ ] Resume builder with AI suggestions
- [ ] Referral network for placed students

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 👨‍💻 Author

**Ashish Singh**
- College: Shri Ramdeobaba College of Engineering and Management, Nagpur
- Branch: Computer Science & Engineering
- GitHub: [@YOUR_GITHUB](https://github.com/Ashishh13)
- LinkedIn: [Your LinkedIn](https://www.linkedin.com/in/ashish-singh-82311639a)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**⭐ Star this repo if PlaceMentor helped you!**

Made with ❤️ for engineering students everywhere

</div>
