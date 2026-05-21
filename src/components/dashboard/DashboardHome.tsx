'use client'

import GitHubCard from './GitHubCard'
import LeetCodeCard from './LeetCodeCard'

import { motion } from 'framer-motion'
import { Profile, Analysis, CompanyPrep } from '@/types'
import { FileSearch, Building2, TrendingUp, AlertCircle, ArrowRight, Zap } from 'lucide-react'
import Link from 'next/link'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

export default function DashboardHome({
  profile, analyses, companyPreps
}: {
  profile: Profile | null
  analyses: Analysis[]
  companyPreps: CompanyPrep[]
}) {
  const isNewUser = !profile?.resume_url && !profile?.github_username

  const stats = [
    { label: 'Analyses Run', value: analyses.length, icon: FileSearch, color: 'from-violet-500 to-purple-600' },
    { label: 'Companies Prepped', value: companyPreps.length, icon: Building2, color: 'from-blue-500 to-cyan-600' },
    { label: 'Profile Score', value: profile?.skills?.length ? `${Math.min(profile.skills.length * 10, 100)}%` : '0%', icon: TrendingUp, color: 'from-emerald-500 to-teal-600' },
  ]

  const quickActions = [
    { href: '/analyze', label: 'Analyze Resume', desc: 'Get AI feedback on your resume', icon: FileSearch, color: 'violet' },
    { href: '/company-prep', label: 'Company Prep', desc: 'Prepare for a specific company', icon: Building2, color: 'blue' },
    { href: '/profile', label: 'Complete Profile', desc: 'Add GitHub, LeetCode & more', icon: TrendingUp, color: 'emerald' },
  ]

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-6xl mx-auto">
      {/* Welcome Banner */}
      {isNewUser && (
        <motion.div variants={item} className="bg-gradient-to-r from-violet-600/20 to-blue-600/20 border border-violet-500/20 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-violet-400" />
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold">Complete your profile to unlock AI insights</p>
            <p className="text-zinc-400 text-sm mt-0.5">Add your resume, GitHub, and LeetCode to get personalized placement guidance.</p>
          </div>
          <Link href="/profile" className="shrink-0 flex items-center gap-1.5 text-violet-400 text-sm font-medium hover:text-violet-300 transition-colors">
            Setup now <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>
      )}

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/[0.07] transition-all">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 shadow-lg`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-zinc-400 text-sm mt-0.5">{stat.label}</p>
            </div>
          )
        })}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item}>
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-violet-400" />
          <h2 className="text-white font-semibold">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link key={action.href} href={action.href}>
                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/[0.07] hover:border-white/20 transition-all cursor-pointer group"
                >
                  <Icon className="w-6 h-6 text-violet-400 mb-3" />
                  <p className="text-white font-medium">{action.label}</p>
                  <p className="text-zinc-500 text-sm mt-1">{action.desc}</p>
                  <div className="flex items-center gap-1 text-violet-400 text-sm mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    Get started <ArrowRight className="w-3 h-3" />
                  </div>
                </motion.div>
              </Link>
            )
          })}
        </div>
      </motion.div>

      {/* Recent Analyses */}
      {analyses.length > 0 && (
        <motion.div variants={item}>
          <h2 className="text-white font-semibold mb-4">Recent Analyses</h2>
          <div className="space-y-3">
            {analyses.map((analysis) => (
              <div key={analysis.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-medium capitalize">{analysis.type} Analysis</p>
                  <p className="text-zinc-500 text-xs mt-0.5">{new Date(analysis.created_at).toLocaleDateString()}</p>
                </div>
                {analysis.score !== null && (
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-violet-500 to-blue-500 rounded-full" style={{ width: `${analysis.score}%` }} />
                    </div>
                    <span className="text-white text-sm font-semibold">{analysis.score}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Platform Stats */}
<motion.div variants={item}>
  <h2 className="text-white font-semibold mb-4">Platform Stats</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <GitHubCard username={profile?.github_username ?? null} />
    <LeetCodeCard username={profile?.leetcode_username ?? null} />
  </div>
</motion.div>



    </motion.div>
  )
}