'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'
import { Profile, Analysis } from '@/types'
import { extractTextFromFile } from '@/lib/extractResume'
import {
  FileSearch, Upload, Loader2, Sparkles, ChevronDown,
  ChevronUp, AlertTriangle, CheckCircle2, Clock, Zap,
  Target, Code2, FileText, Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }

export default function AnalyzePage({ profile, pastAnalyses }: { profile: Profile | null; pastAnalyses: Analysis[] }) {
  const [file, setFile] = useState<File | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [activeSection, setActiveSection] = useState<string | null>('suggestions')

  const onDrop = useCallback((files: File[]) => {
    if (files[0]) { setFile(files[0]); setResult(null) }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    maxFiles: 1,
  })

  const handleAnalyze = async () => {
    if (!file && !profile?.resume_url) {
      toast.error('Please upload a resume first')
      return
    }
    setAnalyzing(true)

    try {
      let resumeText = ''
      if (file) resumeText = await extractTextFromFile(file)

      // Fetch GitHub + LeetCode data in parallel
      const [ghRes, lcRes] = await Promise.all([
        profile?.github_username ? fetch(`/api/integrations/github?username=${profile.github_username}`) : null,
        profile?.leetcode_username ? fetch(`/api/integrations/leetcode?username=${profile.leetcode_username}`) : null,
      ])
      const githubData = ghRes?.ok ? await ghRes.json() : null
      const leetcodeData = lcRes?.ok ? await lcRes.json() : null

      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, githubData, leetcodeData }),
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error)

      setResult(data)
      toast.success('Analysis complete!')
    } catch (err) {
      toast.error('Analysis failed. Please try again.')
      console.error(err)
    } finally {
      setAnalyzing(false)
    }
  }

  const scoreColor = (s: number) => s >= 75 ? 'text-emerald-400' : s >= 50 ? 'text-yellow-400' : 'text-red-400'
  const scoreBg = (s: number) => s >= 75 ? 'from-emerald-500 to-teal-500' : s >= 50 ? 'from-yellow-500 to-orange-500' : 'from-red-500 to-pink-500'

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileSearch className="w-6 h-6 text-violet-400" /> AI Resume Analyzer
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Upload your resume and get deep AI-powered placement feedback
        </p>
      </motion.div>

      {/* Upload + Analyze */}
      <motion.div variants={item} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <div {...getRootProps()} className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
          isDragActive ? 'border-violet-500 bg-violet-500/10' : 'border-white/10 hover:border-violet-500/50 hover:bg-white/5'
        )}>
          <input {...getInputProps()} />
          <Upload className="w-8 h-8 text-violet-400 mx-auto mb-3" />
          {file ? (
            <div>
              <p className="text-white font-medium">{file.name}</p>
              <p className="text-zinc-500 text-xs mt-1">Drop another file to replace</p>
            </div>
          ) : (
            <div>
              <p className="text-white font-medium">Drop your resume here</p>
              <p className="text-zinc-500 text-sm mt-1">PDF, DOC, DOCX supported</p>
              {profile?.resume_url && <p className="text-violet-400 text-xs mt-2">Or we&apos;ll use your saved resume</p>}
            </div>
          )}
        </div>

        {/* Profile context chips */}
        <div className="flex flex-wrap gap-2">
          {profile?.github_username && (
            <span className="flex items-center gap-1.5 text-xs bg-white/5 border border-white/10 text-zinc-300 px-2.5 py-1 rounded-lg">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> GitHub connected
            </span>
          )}
          {profile?.leetcode_username && (
            <span className="flex items-center gap-1.5 text-xs bg-white/5 border border-white/10 text-zinc-300 px-2.5 py-1 rounded-lg">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> LeetCode connected
            </span>
          )}
          {profile?.target_role && (
            <span className="flex items-center gap-1.5 text-xs bg-white/5 border border-white/10 text-zinc-300 px-2.5 py-1 rounded-lg">
              <Target className="w-3 h-3 text-violet-400" /> Target: {profile.target_role}
            </span>
          )}
        </div>

        <Button onClick={handleAnalyze} disabled={analyzing}
          className="w-full h-12 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-medium rounded-xl text-base">
          {analyzing ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing your profile... (this takes ~20 seconds)
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" /> Run AI Analysis
            </span>
          )}
        </Button>
      </motion.div>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

            {/* Score Overview */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-white font-bold text-lg">Overall Score</h2>
                  <p className="text-zinc-400 text-sm">{String(result.placementReadiness)}</p>
                </div>
                <div className="text-right">
                  <p className={`text-5xl font-black ${scoreColor(Number(result.overallScore))}`}>
                    {Number(result.overallScore)}
                  </p>
                  <p className="text-zinc-500 text-sm">out of 100</p>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="space-y-3">
                {Object.entries(result.scoreBreakdown as Record<string, number>).map(([key, val]) => (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-zinc-300 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className={scoreColor(val)}>{val}/100</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${val}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                        className={`h-full bg-gradient-to-r ${scoreBg(val)} rounded-full`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/10">
                <p className="text-zinc-300 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-violet-400 shrink-0" />
                  <span><span className="text-white font-medium">Estimated time to placement-ready: </span>
                  {String(result.estimatedTimeToReady)}</span>
                </p>
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5">
                <h3 className="text-emerald-400 font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Strengths
                </h3>
                <ul className="space-y-2">
                  {(result.strengths as string[]).map((s, i) => (
                    <li key={i} className="text-zinc-300 text-sm flex items-start gap-2">
                      <Star className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" /> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5">
                <h3 className="text-red-400 font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Areas to Improve
                </h3>
                <ul className="space-y-2">
                  {(result.weaknesses as string[]).map((w, i) => (
                    <li key={i} className="text-zinc-300 text-sm flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" /> {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Accordion Sections */}
            {[
              {
                key: 'suggestions', label: 'Action Plan', icon: Zap,
                content: (
                  <div className="space-y-4">
                    {(['immediate', 'shortTerm', 'longTerm'] as const).map(phase => {
                      const sugg = result.suggestions as Record<string, { title: string; detail: string }[]>
                      const labels = { immediate: '🔥 Do Now', shortTerm: '📅 Next 2-4 Weeks', longTerm: '🎯 1-3 Months' }
                      return (
                        <div key={phase}>
                          <p className="text-zinc-400 text-xs font-semibold mb-2 uppercase tracking-wider">{labels[phase]}</p>
                          <div className="space-y-2">
                            {sugg[phase]?.map((s, i) => (
                              <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/10">
                                <p className="text-white text-sm font-medium">{s.title}</p>
                                <p className="text-zinc-400 text-sm mt-1">{s.detail}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              },
              {
                key: 'resume', label: 'Resume Feedback', icon: FileText,
                content: (
                  <div className="space-y-3">
                    {(() => {
                      const rf = result.resumeFeedback as Record<string, unknown>
                      return <>
                        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                          <p className="text-zinc-400 text-xs mb-1">FORMAT</p>
                          <p className="text-zinc-300 text-sm">{String(rf.format)}</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                          <p className="text-zinc-400 text-xs mb-1">CONTENT</p>
                          <p className="text-zinc-300 text-sm">{String(rf.content)}</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                          <p className="text-zinc-400 text-xs mb-2">MISSING ELEMENTS</p>
                          <div className="flex flex-wrap gap-1.5">
                            {(rf.missingElements as string[]).map((el, i) => (
                              <span key={i} className="text-xs px-2 py-0.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300">{el}</span>
                            ))}
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                          <p className="text-zinc-400 text-xs mb-2">ATS KEYWORDS TO ADD</p>
                          <div className="flex flex-wrap gap-1.5">
                            {(rf.keywordsToAdd as string[]).map((kw, i) => (
                              <span key={i} className="text-xs px-2 py-0.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300">{kw}</span>
                            ))}
                          </div>
                        </div>
                      </>
                    })()}
                  </div>
                )
              },
              {
                key: 'dsa', label: 'DSA Feedback', icon: Code2,
                content: (
                  <div className="space-y-3">
                    {(() => {
                      const df = result.dsaFeedback as Record<string, unknown>
                      return <>
                        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                          <p className="text-zinc-400 text-xs mb-1">CURRENT LEVEL</p>
                          <p className="text-zinc-300 text-sm">{String(df.currentLevel)}</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                          <p className="text-zinc-400 text-xs mb-1">TARGET</p>
                          <p className="text-zinc-300 text-sm">{String(df.targetProblems)}</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                          <p className="text-zinc-400 text-xs mb-2">TOPICS TO FOCUS</p>
                          <div className="flex flex-wrap gap-1.5">
                            {(df.topicsToFocus as string[]).map((t, i) => (
                              <span key={i} className="text-xs px-2 py-0.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-300">{t}</span>
                            ))}
                          </div>
                        </div>
                      </>
                    })()}
                  </div>
                )
              },
            ].map(({ key, label, icon: Icon, content }) => (
              <div key={key} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <button onClick={() => setActiveSection(activeSection === key ? null : key)}
                  className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors">
                  <span className="flex items-center gap-2 text-white font-semibold">
                    <Icon className="w-4 h-4 text-violet-400" /> {label}
                  </span>
                  {activeSection === key ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                </button>
                <AnimatePresence>
                  {activeSection === key && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                      className="overflow-hidden">
                      <div className="px-5 pb-5">{content}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Past Analyses */}
      {pastAnalyses.length > 0 && !result && (
        <motion.div variants={item}>
          <h2 className="text-white font-semibold mb-3">Past Analyses</h2>
          <div className="space-y-2">
            {pastAnalyses.map(a => (
              <div key={a.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-medium capitalize">{a.type} Analysis</p>
                  <p className="text-zinc-500 text-xs">{new Date(a.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                {a.score !== null && (
                  <span className={`text-lg font-bold ${scoreColor(a.score)}`}>{a.score}/100</span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}