'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Profile, CompanyPrep } from '@/types'
import {
  Building2, Search, Loader2, Sparkles, ChevronDown, ChevronUp,
  Target, Clock, BookOpen, Code2, Lightbulb, CheckCircle2,
  XCircle, Calendar, TrendingUp, AlertTriangle, Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const POPULAR_COMPANIES = [
  'Google', 'Microsoft', 'Amazon', 'Meta', 'Apple',
  'Flipkart', 'Infosys', 'TCS', 'Wipro', 'Cognizant',
  'Goldman Sachs', 'Morgan Stanley', 'Uber', 'Swiggy', 'Zomato',
]

const ROLES = [
  'Software Engineer', 'Frontend Developer', 'Backend Developer',
  'Full Stack Developer', 'Data Scientist', 'ML Engineer',
  'DevOps Engineer', 'Android Developer', 'iOS Developer',
]

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }

interface InterviewRound {
  round: number
  name: string
  description: string
  duration: string
  tips: string
}

interface Topic {
  topic: string
  importance: string
  description: string
  resources: string[]
}

interface Problem {
  title: string
  difficulty: string
  topic: string
  why: string
}

interface WeekPlan {
  week: number
  focus: string
  dailyTasks: string[]
  goal: string
}

interface DosDonts {
  dos: string[]
  donts: string[]
}

interface CompanyOverview {
  name: string
  about: string
  techStack: string[]
  culture: string
  hiringDifficulty: string
  averagePackage: string
  interviewRounds: number
}

interface PrepPlan {
  companyOverview: CompanyOverview
  interviewProcess: InterviewRound[]
  topicsToCover: Topic[]
  practiceProblems: Problem[]
  weeklyPlan: WeekPlan[]
  insiderTips: string[]
  dosDonts: DosDonts
  estimatedPrepTime: string
  readinessScore: number
}

export default function CompanyPrepPage({
  profile,
  savedPreps,
}: {
  profile: Profile | null
  savedPreps: CompanyPrep[]
}) {
  const [company, setCompany] = useState('')
  const [role, setRole] = useState(profile?.target_role ?? '')
  const [difficulty, setDifficulty] = useState('medium')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PrepPlan | null>(null)
  const [activeSection, setActiveSection] = useState<string>('interviewProcess')
  const [selectedSaved, setSelectedSaved] = useState<CompanyPrep | null>(null)

  const handleGenerate = async () => {
    if (!company.trim()) { toast.error('Enter a company name'); return }
    if (!role.trim()) { toast.error('Enter a role'); return }
    setLoading(true)
    setResult(null)
    setSelectedSaved(null)
    try {
      const res = await fetch('/api/ai/company-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName: company, role, difficulty }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data as PrepPlan)
      toast.success(`Prep plan for ${company} ready!`)
    } catch (err) {
      toast.error('Failed to generate prep plan')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const displayData: PrepPlan | null = result ?? (selectedSaved?.prep_plan as PrepPlan | null)

  const toggle = (key: string) => setActiveSection(activeSection === key ? '' : key)

  const sections = displayData ? [
    {
      key: 'interviewProcess',
      label: 'Interview Process',
      icon: Target,
      content: (
        <div className="space-y-3">
          {displayData.interviewProcess?.map((round) => (
            <div key={round.round} className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-7 h-7 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-400 text-xs font-bold flex items-center justify-center shrink-0">
                  {round.round}
                </span>
                <div>
                  <p className="text-white font-medium text-sm">{round.name}</p>
                  <p className="text-zinc-500 text-xs">{round.duration}</p>
                </div>
              </div>
              <p className="text-zinc-300 text-sm">{round.description}</p>
              <div className="mt-2 flex items-start gap-2 bg-violet-500/5 border border-violet-500/10 rounded-lg p-2">
                <Lightbulb className="w-3.5 h-3.5 text-violet-400 mt-0.5 shrink-0" />
                <p className="text-zinc-400 text-xs">{round.tips}</p>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      key: 'topicsToCover',
      label: 'Topics to Cover',
      icon: BookOpen,
      content: (
        <div className="space-y-2">
          {displayData.topicsToCover?.map((t) => (
            <div key={t.topic} className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-1">
                <p className="text-white font-medium text-sm">{t.topic}</p>
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded-full border',
                  t.importance === 'high'
                    ? 'bg-red-500/10 border-red-500/20 text-red-400'
                    : t.importance === 'medium'
                    ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                )}>
                  {t.importance}
                </span>
              </div>
              <p className="text-zinc-400 text-sm">{t.description}</p>
            </div>
          ))}
        </div>
      ),
    },
    {
      key: 'practiceProblems',
      label: 'Practice Problems',
      icon: Code2,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {displayData.practiceProblems?.map((p, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/10">
              <div className="flex items-center justify-between mb-1">
                <p className="text-white text-sm font-medium">{p.title}</p>
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded-full',
                  p.difficulty === 'Easy'
                    ? 'text-emerald-400 bg-emerald-500/10'
                    : p.difficulty === 'Medium'
                    ? 'text-yellow-400 bg-yellow-500/10'
                    : 'text-red-400 bg-red-500/10'
                )}>
                  {p.difficulty}
                </span>
              </div>
              <p className="text-zinc-500 text-xs">{p.topic}</p>
              <p className="text-zinc-400 text-xs mt-1">{p.why}</p>
            </div>
          ))}
        </div>
      ),
    },
    {
      key: 'weeklyPlan',
      label: 'Weekly Study Plan',
      icon: Calendar,
      content: (
        <div className="space-y-3">
          {displayData.weeklyPlan?.map((w) => (
            <div key={w.week} className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-lg">
                  Week {w.week}
                </span>
                <p className="text-white font-medium text-sm">{w.focus}</p>
              </div>
              <ul className="space-y-1.5 mb-3">
                {w.dailyTasks.map((task, i) => (
                  <li key={i} className="text-zinc-400 text-sm flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-violet-400 mt-0.5 shrink-0" />
                    {task}
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-2">
                <Target className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <p className="text-zinc-300 text-xs font-medium">{w.goal}</p>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      key: 'tipsAndDos',
      label: "Insider Tips & Do's / Don'ts",
      icon: Lightbulb,
      content: (
        <div className="space-y-4">
          {Array.isArray(displayData.insiderTips) && (
            <div>
              <p className="text-zinc-400 text-xs font-semibold mb-3 uppercase tracking-wider flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-yellow-400" /> Insider Tips
              </p>
              <div className="space-y-2">
                {displayData.insiderTips.map((tip, i) => (
                  <div key={i} className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3 flex items-start gap-2">
                    <Star className="w-3.5 h-3.5 text-yellow-400 mt-0.5 shrink-0" />
                    <p className="text-zinc-300 text-sm">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {displayData.dosDonts && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-emerald-400 text-xs font-semibold mb-2 uppercase tracking-wider">
                  ✅ DO
                </p>
                <div className="space-y-2">
                  {(displayData.dosDonts.dos ?? []).map((d, i) => (
                    <div key={i} className="flex items-start gap-2 bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-2.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <p className="text-zinc-300 text-sm">{d}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-red-400 text-xs font-semibold mb-2 uppercase tracking-wider">
                  ❌ DON&apos;T
                </p>
                <div className="space-y-2">
                  {(displayData.dosDonts.donts ?? []).map((d, i) => (
                    <div key={i} className="flex items-start gap-2 bg-red-500/5 border border-red-500/10 rounded-xl p-2.5">
                      <XCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
                      <p className="text-zinc-300 text-sm">{d}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ),
    },
  ] : []

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Building2 className="w-6 h-6 text-violet-400" /> Company Prep
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Get a real-time AI prep plan for any company — powered by live web search
        </p>
      </motion.div>

      {/* Input Card */}
      <motion.div variants={item} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">

        {/* Company Input */}
        <div className="space-y-2">
          <Label className="text-zinc-300 text-sm">Company Name</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Google, Microsoft, Infosys..."
              className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:border-violet-500"
            />
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {POPULAR_COMPANIES.map((c) => (
              <button
                key={c}
                onClick={() => setCompany(c)}
                className={cn(
                  'text-xs px-2.5 py-1 rounded-lg border transition-all',
                  company === c
                    ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                    : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Role Input */}
        <div className="space-y-2">
          <Label className="text-zinc-300 text-sm">Role</Label>
          <Input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Software Engineer"
            className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:border-violet-500"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {ROLES.map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={cn(
                  'text-xs px-2.5 py-1 rounded-lg border transition-all',
                  role === r
                    ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                    : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div className="space-y-2">
          <Label className="text-zinc-300 text-sm">Prep Intensity</Label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'easy', label: '🟢 Light', desc: '1-2 weeks' },
              { value: 'medium', label: '🟡 Standard', desc: '3-4 weeks' },
              { value: 'hard', label: '🔴 Intensive', desc: '6-8 weeks' },
            ].map((d) => (
              <button
                key={d.value}
                onClick={() => setDifficulty(d.value)}
                className={cn(
                  'p-3 rounded-xl border text-center transition-all',
                  difficulty === d.value
                    ? 'bg-violet-500/20 border-violet-500/40 text-white'
                    : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                )}
              >
                <p className="text-sm font-medium">{d.label}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{d.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full h-12 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-medium rounded-xl text-base"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Searching the web & generating plan... (~30 seconds)
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" /> Generate Prep Plan
            </span>
          )}
        </Button>
      </motion.div>

      {/* Saved Preps */}
      {savedPreps.length > 0 && !displayData && (
        <motion.div variants={item}>
          <h2 className="text-white font-semibold mb-3">Saved Prep Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {savedPreps.map((prep) => (
              <button
                key={prep.id}
                onClick={() => { setSelectedSaved(prep); setResult(null) }}
                className="bg-white/5 border border-white/10 rounded-xl p-4 text-left hover:bg-white/[0.07] hover:border-white/20 transition-all"
              >
                <div className="flex items-center justify-between">
                  <p className="text-white font-medium">{prep.company_name}</p>
                  <span className={cn(
                    'text-xs px-2 py-0.5 rounded-full border',
                    prep.status === 'completed'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : 'bg-violet-500/10 border-violet-500/20 text-violet-400'
                  )}>
                    {prep.status}
                  </span>
                </div>
                <p className="text-zinc-500 text-sm mt-1">{prep.role}</p>
                <p className="text-zinc-600 text-xs mt-2">
                  {new Date(prep.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </p>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Results */}
      <AnimatePresence>
        {displayData && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

            {/* Company Overview */}
            <div className="bg-gradient-to-br from-violet-600/10 to-blue-600/10 border border-violet-500/20 rounded-2xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-white text-xl font-bold">{displayData.companyOverview?.name}</h2>
                  <p className="text-zinc-400 text-sm mt-1 max-w-2xl">{displayData.companyOverview?.about}</p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-3xl font-black text-violet-400">{displayData.readinessScore}%</p>
                  <p className="text-zinc-500 text-xs">Your readiness</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
                {[
                  { label: 'Avg Package', value: displayData.companyOverview?.averagePackage ?? 'N/A', icon: TrendingUp },
                  { label: 'Interview Rounds', value: String(displayData.companyOverview?.interviewRounds ?? 'N/A'), icon: Target },
                  { label: 'Difficulty', value: displayData.companyOverview?.hiringDifficulty ?? difficulty, icon: AlertTriangle },
                  { label: 'Prep Time', value: displayData.estimatedPrepTime ?? 'N/A', icon: Clock },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="bg-white/5 rounded-xl p-3">
                    <Icon className="w-4 h-4 text-violet-400 mb-1" />
                    <p className="text-white text-sm font-semibold">{value}</p>
                    <p className="text-zinc-500 text-xs">{label}</p>
                  </div>
                ))}
              </div>

              {Array.isArray(displayData.companyOverview?.techStack) && (
                <div className="mt-4">
                  <p className="text-zinc-500 text-xs mb-2">TECH STACK</p>
                  <div className="flex flex-wrap gap-2">
                    {displayData.companyOverview.techStack.map((tech) => (
                      <span key={tech} className="text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-zinc-300">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Accordion Sections */}
            {sections.map(({ key, label, icon: Icon, content }) => (
              <div key={key} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <button
                  onClick={() => toggle(key)}
                  className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors"
                >
                  <span className="flex items-center gap-2 text-white font-semibold">
                    <Icon className="w-4 h-4 text-violet-400" /> {label}
                  </span>
                  {activeSection === key
                    ? <ChevronUp className="w-4 h-4 text-zinc-400" />
                    : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                </button>
                <AnimatePresence>
                  {activeSection === key && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5">{content}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}