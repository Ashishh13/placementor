'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Profile } from '@/types'
import {
  Users, Plus, Building2, Star, ChevronDown,
  ChevronUp, Send, Eye, EyeOff, Trophy, Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }

interface Experience {
  id: string
  company_name: string
  role: string
  year: number
  package_lpa: number
  oa_pattern: string
  questions_asked: string[]
  tips: string
  difficulty: string
  outcome: string
  is_anonymous: boolean
  created_at: string
  college: string
}

const POPULAR_COMPANIES = [
  'Google', 'Microsoft', 'Amazon', 'Meta', 'Flipkart',
  'Infosys', 'TCS', 'Wipro', 'Cognizant', 'Goldman Sachs',
]

export default function CommunityPage({
  profile, experiences
}: {
  profile: Profile | null
  experiences: Experience[]
}) {
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filterCompany, setFilterCompany] = useState('')

  const [form, setForm] = useState({
    companyName: '',
    role: '',
    year: new Date().getFullYear().toString(),
    packageLpa: '',
    placementType: 'oncampus',
    oaPattern: '',
    questionsAsked: '',
    tips: '',
    difficulty: 'medium',
    outcome: 'selected',
    isAnonymous: false,
  })

  const set = (key: string, value: string | boolean) =>
    setForm(f => ({ ...f, [key]: value }))

  const handleSubmit = async () => {
    if (!form.companyName || !form.role || !form.tips) {
      toast.error('Please fill company, role and tips at minimum')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/community/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          packageLpa: parseFloat(form.packageLpa) || null,
          year: parseInt(form.year),
          questionsAsked: form.questionsAsked.split('\n').filter(Boolean),
          interviewRounds: [],
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      toast.success('Experience shared! It will help others prepare 🎉')
      setShowForm(false)
      setForm({ companyName: '', role: '', year: new Date().getFullYear().toString(), packageLpa: '', placementType: 'oncampus', oaPattern: '', questionsAsked: '', tips: '', difficulty: 'medium', outcome: 'selected', isAnonymous: false })
      window.location.reload()
    } catch (err) {
      toast.error('Failed to submit')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = filterCompany
    ? experiences.filter(e => e.company_name.toLowerCase().includes(filterCompany.toLowerCase()))
    : experiences

  const difficultyColor = (d: string) =>
    d === 'easy' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
    d === 'medium' ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' :
    'text-red-400 bg-red-500/10 border-red-500/20'

  const outcomeColor = (o: string) =>
    o === 'selected' ? 'text-emerald-400' : o === 'rejected' ? 'text-red-400' : 'text-yellow-400'

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-violet-400" /> Community Experiences
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Real interview experiences from placed students — powering smarter AI recommendations
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white rounded-xl h-10 px-5"
        >
          <Plus className="w-4 h-4 mr-2" />
          Share Experience
        </Button>
      </motion.div>

      {/* Stats Banner */}
      <motion.div variants={item} className="grid grid-cols-3 gap-4">
        {[
          { label: 'Experiences Shared', value: experiences.length, icon: Users },
          { label: 'Companies Covered', value: new Set(experiences.map(e => e.company_name)).size, icon: Building2 },
          { label: 'Powers AI Answers', value: '100%', icon: Star },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <Icon className="w-5 h-5 text-violet-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-zinc-500 text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </motion.div>

      {/* Submit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white/5 border border-violet-500/20 rounded-2xl p-6 space-y-4 overflow-hidden"
          >
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Send className="w-4 h-4 text-violet-400" />
              Share Your Interview Experience
            </h2>
            <p className="text-zinc-400 text-sm">
              Your experience will be used to make AI recommendations more accurate for everyone.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-zinc-300 text-sm">Company Name *</Label>
                <Input value={form.companyName} onChange={e => set('companyName', e.target.value)}
                  placeholder="Google, Microsoft..." className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600" />
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {POPULAR_COMPANIES.slice(0, 6).map(c => (
                    <button key={c} onClick={() => set('companyName', c)}
                      className="text-xs px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-all">
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-zinc-300 text-sm">Role *</Label>
                <Input value={form.role} onChange={e => set('role', e.target.value)}
                  placeholder="Software Engineer..." className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-zinc-300 text-sm">Year</Label>
                <Input value={form.year} onChange={e => set('year', e.target.value)}
                  type="number" placeholder="2025" className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-zinc-300 text-sm">Package (LPA)</Label>
                <Input value={form.packageLpa} onChange={e => set('packageLpa', e.target.value)}
                  type="number" placeholder="12.5" className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-zinc-300 text-sm">Placement Type</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[{ v: 'oncampus', l: 'On Campus' }, { v: 'offcampus', l: 'Off Campus' }, { v: 'referral', l: 'Referral' }].map(({ v, l }) => (
                    <button key={v} onClick={() => set('placementType', v)}
                      className={cn('text-xs p-2 rounded-xl border transition-all text-center',
                        form.placementType === v ? 'bg-violet-500/20 border-violet-500/40 text-white' : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white')}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-zinc-300 text-sm">Difficulty</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[{ v: 'easy', l: '🟢 Easy' }, { v: 'medium', l: '🟡 Medium' }, { v: 'hard', l: '🔴 Hard' }].map(({ v, l }) => (
                    <button key={v} onClick={() => set('difficulty', v)}
                      className={cn('text-xs p-2 rounded-xl border transition-all text-center',
                        form.difficulty === v ? 'bg-violet-500/20 border-violet-500/40 text-white' : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white')}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-zinc-300 text-sm">OA Pattern (Online Assessment)</Label>
              <textarea value={form.oaPattern} onChange={e => set('oaPattern', e.target.value)}
                placeholder="Describe the online assessment — number of questions, topics, time limit, difficulty..."
                rows={3} className="w-full px-3 py-2 bg-white/5 border border-white/10 text-white placeholder:text-zinc-600 rounded-xl text-sm focus:outline-none focus:border-violet-500 resize-none" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-zinc-300 text-sm">Questions Asked (one per line)</Label>
              <textarea value={form.questionsAsked} onChange={e => set('questionsAsked', e.target.value)}
                placeholder={"Two Sum\nLRU Cache\nDesign a URL shortener\nExplain OOPS concepts"}
                rows={4} className="w-full px-3 py-2 bg-white/5 border border-white/10 text-white placeholder:text-zinc-600 rounded-xl text-sm focus:outline-none focus:border-violet-500 resize-none" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-zinc-300 text-sm">Tips for Future Candidates *</Label>
              <textarea value={form.tips} onChange={e => set('tips', e.target.value)}
                placeholder="What would you tell someone preparing for this company? Be specific..."
                rows={3} className="w-full px-3 py-2 bg-white/5 border border-white/10 text-white placeholder:text-zinc-600 rounded-xl text-sm focus:outline-none focus:border-violet-500 resize-none" />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Label className="text-zinc-300 text-sm">Outcome</Label>
                <div className="flex gap-2">
                  {[{ v: 'selected', l: '✅ Selected' }, { v: 'rejected', l: '❌ Rejected' }].map(({ v, l }) => (
                    <button key={v} onClick={() => set('outcome', v)}
                      className={cn('text-xs px-3 py-1.5 rounded-xl border transition-all',
                        form.outcome === v ? 'bg-violet-500/20 border-violet-500/40 text-white' : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white')}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={() => set('isAnonymous', !form.isAnonymous)}
                className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
                {form.isAnonymous ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {form.isAnonymous ? 'Anonymous' : 'Show name'}
              </button>
            </div>

            <Button onClick={handleSubmit} disabled={submitting}
              className="w-full bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-xl h-11">
              {submitting ? 'Submitting...' : '🚀 Submit Experience'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter */}
      <motion.div variants={item}>
        <Input
          value={filterCompany}
          onChange={e => setFilterCompany(e.target.value)}
          placeholder="Filter by company..."
          className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:border-violet-500"
        />
      </motion.div>

      {/* Experiences List */}
      {filtered.length === 0 ? (
        <motion.div variants={item} className="bg-white/5 border border-dashed border-white/10 rounded-2xl p-12 text-center">
          <Users className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <p className="text-white font-medium">No experiences yet</p>
          <p className="text-zinc-500 text-sm mt-1">Be the first to share your interview experience!</p>
        </motion.div>
      ) : (
        <motion.div variants={item} className="space-y-3">
          {filtered.map(exp => (
            <div key={exp.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <button onClick={() => setExpandedId(expandedId === exp.id ? null : exp.id)}
                className="w-full p-5 text-left hover:bg-white/[0.02] transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="text-white font-semibold">{exp.company_name}</p>
                      <span className={cn('text-xs px-2 py-0.5 rounded-full border', difficultyColor(exp.difficulty))}>
                        {exp.difficulty}
                      </span>
                      <span className={cn('text-xs font-medium', outcomeColor(exp.outcome))}>
                        {exp.outcome === 'selected' ? '✅ Selected' : '❌ Rejected'}
                      </span>
                      {exp.package_lpa && (
                        <span className="text-xs text-emerald-400 flex items-center gap-1">
                          <Trophy className="w-3 h-3" /> {exp.package_lpa} LPA
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-400 text-sm mt-1">{exp.role}</p>
                    <p className="text-zinc-600 text-xs mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {exp.year} •
                      {exp.is_anonymous ? ' Anonymous' : exp.college ? ` ${exp.college}` : ' Student'}
                    </p>
                  </div>
                  {expandedId === exp.id
                    ? <ChevronUp className="w-4 h-4 text-zinc-400 shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />}
                </div>
              </button>

              <AnimatePresence>
                {expandedId === exp.id && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                    className="overflow-hidden">
                    <div className="px-5 pb-5 space-y-4 border-t border-white/5 pt-4">
                      {exp.oa_pattern && (
                        <div>
                          <p className="text-zinc-400 text-xs font-semibold mb-1 uppercase tracking-wider">OA Pattern</p>
                          <p className="text-zinc-300 text-sm">{exp.oa_pattern}</p>
                        </div>
                      )}
                      {exp.questions_asked?.length > 0 && (
                        <div>
                          <p className="text-zinc-400 text-xs font-semibold mb-2 uppercase tracking-wider">Questions Asked</p>
                          <div className="flex flex-wrap gap-2">
                            {exp.questions_asked.map((q, i) => (
                              <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300">
                                {q}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {exp.tips && (
                        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4">
                          <p className="text-zinc-400 text-xs font-semibold mb-1 uppercase tracking-wider">💡 Tips</p>
                          <p className="text-zinc-300 text-sm">{exp.tips}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}