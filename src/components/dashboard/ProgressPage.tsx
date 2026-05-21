'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Profile, Analysis, CompanyPrep } from '@/types'
import {
  TrendingUp, Camera, Activity, Target,
  Code2, GitBranch, Building2, CheckCircle2,
  Clock, Zap, Award
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, BarChart, Bar
} from 'recharts'
import { cn } from '@/lib/utils'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }

interface Snapshot {
  id: string
  snapshot_date: string
  overall_score: number | null
  github_stats: Record<string, unknown> | null
  leetcode_stats: Record<string, unknown> | null
}

interface ActivityLog {
  id: string
  activity_type: string
  description: string
  created_at: string
  metadata: Record<string, unknown> | null
}

const activityIcon: Record<string, React.ReactNode> = {
  analysis_run: <Zap className="w-3.5 h-3.5 text-violet-400" />,
  company_prep: <Building2 className="w-3.5 h-3.5 text-blue-400" />,
  resume_upload: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean
  payload?: { value: number; color: string; name: string }[]
  label?: string
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a2e] border border-white/10 rounded-xl p-3 shadow-xl">
        <p className="text-zinc-400 text-xs mb-2">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function ProgressPage({
  profile, snapshots, analyses, activityLogs, companyPreps
}: {
  profile: Profile | null
  snapshots: Snapshot[]
  analyses: Analysis[]
  activityLogs: ActivityLog[]
  companyPreps: CompanyPrep[]
}) {
  const [snapping, setSnapping] = useState(false)

  const handleSnapshot = async () => {
    setSnapping(true)
    try {
      const res = await fetch('/api/integrations/snapshot', { method: 'POST' })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      toast.success('Progress snapshot saved!')
      window.location.reload()
    } catch {
      toast.error('Failed to save snapshot')
    } finally {
      setSnapping(false)
    }
  }

  // Chart data
  const scoreChartData = analyses.map(a => ({
    date: new Date(a.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    score: a.score ?? 0,
  }))

  const leetcodeChartData = snapshots
    .filter(s => s.leetcode_stats)
    .map(s => ({
      date: new Date(s.snapshot_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      solved: Number((s.leetcode_stats as Record<string, unknown>)?.totalSolved ?? 0),
      easy: Number((s.leetcode_stats as Record<string, unknown>)?.easy ?? 0),
      medium: Number((s.leetcode_stats as Record<string, unknown>)?.medium ?? 0),
      hard: Number((s.leetcode_stats as Record<string, unknown>)?.hard ?? 0),
    }))

  const githubChartData = snapshots
    .filter(s => s.github_stats)
    .map(s => ({
      date: new Date(s.snapshot_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      repos: Number((s.github_stats as Record<string, unknown>)?.publicRepos ?? 0),
      stars: Number((s.github_stats as Record<string, unknown>)?.totalStars ?? 0),
    }))

  // Latest snapshot stats
  const latest = snapshots[snapshots.length - 1]
  const latestLC = latest?.leetcode_stats as Record<string, unknown> | null
  const latestGH = latest?.github_stats as Record<string, unknown> | null
  const latestAnalysis = analyses[analyses.length - 1]

  // Radar chart data
  const radarData = [
    { subject: 'DSA', value: Math.min(Number(latestLC?.totalSolved ?? 0) / 4, 100) },
    { subject: 'Projects', value: Math.min(Number(latestGH?.publicRepos ?? 0) * 8, 100) },
    { subject: 'Resume', value: latestAnalysis?.score ?? 0 },
    { subject: 'Companies', value: Math.min(companyPreps.length * 20, 100) },
    { subject: 'Skills', value: Math.min((profile?.skills?.length ?? 0) * 8, 100) },
    { subject: 'Profile', value: profile?.github_username && profile?.leetcode_username ? 80 : 40 },
  ]

  // Summary stats
  const summaryStats = [
    {
      label: 'Best Analysis Score',
      value: analyses.length ? `${Math.max(...analyses.map(a => a.score ?? 0))}/100` : 'N/A',
      icon: Award, color: 'from-violet-500 to-purple-600'
    },
    {
      label: 'Problems Solved',
      value: latestLC?.totalSolved ? String(latestLC.totalSolved) : 'N/A',
      icon: Code2, color: 'from-orange-500 to-yellow-500'
    },
    {
      label: 'GitHub Repos',
      value: latestGH?.publicRepos ? String(latestGH.publicRepos) : 'N/A',
      icon: GitBranch, color: 'from-blue-500 to-cyan-500'
    },
    {
      label: 'Companies Prepped',
      value: String(companyPreps.length),
      icon: Building2, color: 'from-emerald-500 to-teal-500'
    },
  ]

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-violet-400" /> Progress Tracker
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Track your placement journey over time
          </p>
        </div>
        <Button
          onClick={handleSnapshot}
          disabled={snapping}
          className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white rounded-xl h-10 px-5"
        >
          {snapping
            ? <Activity className="w-4 h-4 animate-pulse mr-2" />
            : <Camera className="w-4 h-4 mr-2" />}
          {snapping ? 'Saving...' : 'Save Snapshot'}
        </Button>
      </motion.div>

      {/* Summary Stats */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryStats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/[0.07] transition-all">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 shadow-lg`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-zinc-400 text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </motion.div>

      {/* Radar Chart — Placement Readiness */}
      <motion.div variants={item} className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-1 flex items-center gap-2">
          <Target className="w-4 h-4 text-violet-400" /> Placement Readiness Radar
        </h2>
        <p className="text-zinc-500 text-xs mb-5">Overall view across all skill dimensions</p>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#ffffff10" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#71717a', fontSize: 12 }} />
            <Radar
              name="Score"
              dataKey="value"
              stroke="#8b5cf6"
              fill="#8b5cf6"
              fillOpacity={0.25}
              strokeWidth={2}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Analysis Score Over Time */}
      {scoreChartData.length > 0 && (
        <motion.div variants={item} className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-1 flex items-center gap-2">
            <Award className="w-4 h-4 text-violet-400" /> AI Analysis Score Over Time
          </h2>
          <p className="text-zinc-500 text-xs mb-5">Your resume + profile score across analyses</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={scoreChartData}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone" dataKey="score" name="Score"
                stroke="#8b5cf6" strokeWidth={2}
                fill="url(#scoreGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* LeetCode Progress */}
      {leetcodeChartData.length > 1 && (
        <motion.div variants={item} className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-1 flex items-center gap-2">
            <Code2 className="w-4 h-4 text-orange-400" /> LeetCode Progress
          </h2>
          <p className="text-zinc-500 text-xs mb-5">Problems solved over time by difficulty</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={leetcodeChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="easy" name="Easy" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="medium" name="Medium" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="hard" name="Hard" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* GitHub Growth */}
      {githubChartData.length > 1 && (
        <motion.div variants={item} className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-1 flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-blue-400" /> GitHub Growth
          </h2>
          <p className="text-zinc-500 text-xs mb-5">Repositories and stars over time</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={githubChartData}>
              <defs>
                <linearGradient id="repoGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="repos" name="Repos" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />
              <Line type="monotone" dataKey="stars" name="Stars" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* No snapshot data yet */}
      {snapshots.length === 0 && (
        <motion.div variants={item} className="bg-white/5 border border-dashed border-white/10 rounded-2xl p-10 text-center">
          <Camera className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <p className="text-white font-medium">No snapshots yet</p>
          <p className="text-zinc-500 text-sm mt-1 mb-4">
            Save your first snapshot to start tracking growth over time
          </p>
          <Button onClick={handleSnapshot} disabled={snapping}
            className="bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-xl">
            Save First Snapshot
          </Button>
        </motion.div>
      )}

      {/* Two Column Bottom */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Activity Log */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-violet-400" /> Recent Activity
          </h2>
          {activityLogs.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center py-6">No activity yet</p>
          ) : (
            <div className="space-y-3">
              {activityLogs.map(log => (
                <div key={log.id} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    {activityIcon[log.activity_type] ?? <Activity className="w-3.5 h-3.5 text-zinc-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-300 text-sm">{log.description}</p>
                    <p className="text-zinc-600 text-xs mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(log.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Company Prep Status */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-violet-400" /> Company Prep Status
          </h2>
          {companyPreps.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center py-6">No companies prepped yet</p>
          ) : (
            <div className="space-y-2">
              {companyPreps.map(prep => (
                <div key={prep.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                  <div>
                    <p className="text-white text-sm font-medium">{prep.company_name}</p>
                    <p className="text-zinc-500 text-xs mt-0.5">{prep.role}</p>
                  </div>
                  <span className={cn(
                    'text-xs px-2.5 py-1 rounded-full border',
                    prep.status === 'completed'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : 'bg-violet-500/10 border-violet-500/20 text-violet-400'
                  )}>
                    {prep.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}