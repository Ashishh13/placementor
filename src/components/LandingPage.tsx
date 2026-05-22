'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Sparkles, ArrowRight, GitBranch, Code2, FileSearch,
  Building2, TrendingUp, CheckCircle2, Star, Zap, Shield, Globe
} from 'lucide-react'

const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }

const features = [
  {
    icon: FileSearch, title: 'AI Resume Analyzer',
    desc: 'GROQ AI reads your resume and and ensures cross-references your GitHub and LeetCode to give brutally honest, specific feedback.',
    color: 'from-violet-500 to-purple-600',
  },
  {
    icon: Building2, title: 'Company Prep Engine',
    desc: 'Get a real-time prep plan for any company — Google, Microsoft, Infosys — powered by live web search.',
    color: 'from-blue-500 to-cyan-600',
  },
  {
    icon: GitBranch, title: 'GitHub Integration',
    desc: 'Automatically pulls your repos, languages, and star count to paint a full picture of your technical depth.',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: Code2, title: 'LeetCode Tracker',
    desc: 'Tracks your DSA progress — easy, medium, hard — and tells you exactly what to focus on next.',
    color: 'from-orange-500 to-yellow-500',
  },
  {
    icon: TrendingUp, title: 'Progress Analytics',
    desc: 'Beautiful charts track your growth over time. Save snapshots and watch your placement readiness climb.',
    color: 'from-pink-500 to-rose-600',
  },
  {
    icon: Globe, title: 'Live Web Search',
    desc: 'GROQ AI searches the internet in real-time to get the latest interview questions and hiring trends.',
    color: 'from-indigo-500 to-violet-600',
  },
]

const steps = [
  { step: '01', title: 'Create your profile', desc: 'Add your resume, GitHub, LeetCode, and target companies in minutes.' },
  { step: '02', title: 'Run AI analysis', desc: 'GROQ AI analyzes everything and gives you a detailed placement readiness score.' },
  { step: '03', title: 'Get your prep plan', desc: 'Pick any company and get a live, personalized interview preparation roadmap.' },
  { step: '04', title: 'Track your growth', desc: 'Save progress snapshots and watch your score improve over time.' },
]

const stats = [
  { value: '100+', label: 'Companies supported' },
  { value: 'Live', label: 'Web search powered' },
  { value: 'AI', label: 'GROQ AI powered analysis' },
  { value: 'Free', label: 'To get started' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-900/5 rounded-full blur-3xl" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold text-lg">PlaceMentor</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login"
            className="text-zinc-400 hover:text-white text-sm font-medium transition-colors px-4 py-2">
            Sign In
          </Link>
          <Link href="/register"
            className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.div variants={fadeUp}>
            <span className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
              <Zap className="w-3 h-3" /> Powered by GROQ AI + Live Web Search
            </span>
          </motion.div>

          <motion.h1 variants={fadeUp}
            className="text-5xl md:text-7xl font-black leading-tight mb-6">
            Your AI-Powered
            <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent block">
              Placement Coach
            </span>
          </motion.h1>

          <motion.p variants={fadeUp}
            className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            PlaceMentor analyzes your resume, GitHub, and LeetCode to give you
            hyper-specific placement guidance — and builds you a live prep plan
            for any company you target.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register"
              className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-semibold px-8 py-4 rounded-2xl text-base transition-all shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5">
              Start for Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/login"
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium px-8 py-4 rounded-2xl text-base transition-all">
              Sign In
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-6 mt-12 text-zinc-500 text-sm">
            {['No credit card required', 'Free to start', 'Real-time AI analysis'].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {t}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Bar */}
      <section className="relative z-10 border-y border-white/5 bg-white/[0.02] py-8">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-3xl font-black text-white">{value}</p>
              <p className="text-zinc-500 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Everything you need to crack placements
          </h2>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            One platform. Complete placement intelligence.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] hover:border-white/20 transition-all"
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-white font-semibold text-base mb-2">{f.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">How it works</h2>
          <p className="text-zinc-400 text-lg">From zero to placement-ready in 4 steps</p>
        </div>
        <div className="space-y-4">
          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-6 bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] transition-all"
            >
              <span className="text-4xl font-black text-white/10 shrink-0 w-14">{s.step}</span>
              <div>
                <h3 className="text-white font-semibold text-lg">{s.title}</h3>
                <p className="text-zinc-400 text-sm mt-1">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonial / CTA Banner */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-violet-600/20 to-blue-600/20 border border-violet-500/20 rounded-3xl p-10 text-center"
        >
          <div className="flex justify-center mb-4">
            {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />)}
          </div>
          <p className="text-white text-xl md:text-2xl font-semibold max-w-2xl mx-auto leading-relaxed mb-2">
            &quot;Finally an AI tool that gives real, specific feedback — not generic advice.
            It called out exactly what was weak in my resume.&quot;
          </p>
          <p className="text-zinc-400 text-sm">— Computer Science student, RKNEC Nagpur</p>
        </motion.div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Ready to crack your dream company?
          </h2>
          <p className="text-zinc-400 text-lg mb-10">
            Start free. No credit card. Get your AI analysis in minutes.
          </p>
          <Link href="/register"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-semibold px-10 py-4 rounded-2xl text-lg transition-all shadow-2xl shadow-violet-500/30 hover:-translate-y-1">
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-white font-semibold">PlaceMentor</span>
        </div>
        <p className="text-zinc-600 text-sm flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5" /> Built for students. Powered by Claude AI.
        </p>
      </footer>
    </div>
  )
}