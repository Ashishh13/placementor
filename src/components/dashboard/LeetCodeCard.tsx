'use client'

import { useLeetCode } from '@/hooks/useLeetCode'
import { Code2, Trophy, Target, ExternalLink, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'

export default function LeetCodeCard({ username }: { username: string | null }) {
  const { data, loading, error } = useLeetCode(username)

  if (!username) return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 min-h-[200px]">
      <Code2 className="w-8 h-8 text-zinc-600" />
      <p className="text-zinc-500 text-sm text-center">Add your LeetCode username in Profile to see stats</p>
    </div>
  )

  if (loading) return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
      <Skeleton className="h-5 w-32 bg-white/10" />
      <div className="grid grid-cols-3 gap-3">
        {[1,2,3].map(i => <Skeleton key={i} className="h-16 bg-white/10 rounded-xl" />)}
      </div>
      <Skeleton className="h-20 bg-white/10 rounded-xl" />
    </div>
  )

  if (error) return (
    <div className="bg-white/5 border border-red-500/20 rounded-2xl p-5 flex items-center gap-3">
      <Code2 className="w-5 h-5 text-red-400" />
      <p className="text-red-400 text-sm">{error}</p>
    </div>
  )

  if (!data) return null

  const total = Number(data.totalSolved)
  const easy = Number(data.easy)
  const medium = Number(data.medium)
  const hard = Number(data.hard)
  const easyPct = total ? Math.round((easy / total) * 100) : 0
  const medPct = total ? Math.round((medium / total) * 100) : 0
  const hardPct = total ? Math.round((hard / total) * 100) : 0

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Code2 className="w-5 h-5 text-orange-400" />
          <div>
            <p className="text-white font-semibold text-sm">{String(data.username)}</p>
            <p className="text-zinc-500 text-xs">Rank #{Number(data.ranking).toLocaleString()}</p>
          </div>
        </div>
        <a href={`https://leetcode.com/${data.username}`} target="_blank" rel="noopener noreferrer"
          className="text-zinc-400 hover:text-white transition-colors">
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Total Solved */}
      <div className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20 rounded-xl p-4 text-center">
        <p className="text-3xl font-bold text-white">{total}</p>
        <p className="text-zinc-400 text-sm">Problems Solved</p>
      </div>

      {/* Difficulty Breakdown */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Easy', count: easy, pct: easyPct, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Medium', count: medium, pct: medPct, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
          { label: 'Hard', count: hard, pct: hardPct, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
        ].map(({ label, count, color, bg }) => (
          <div key={label} className={`${bg} border rounded-xl p-3 text-center`}>
            <p className={`text-xl font-bold ${color}`}>{count}</p>
            <p className="text-zinc-500 text-xs">{label}</p>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>Difficulty distribution</span>
          <span>{total} solved</span>
        </div>
        <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
          {easyPct > 0 && <div className="bg-emerald-500 rounded-full transition-all" style={{ width: `${easyPct}%` }} />}
          {medPct > 0 && <div className="bg-yellow-500 rounded-full transition-all" style={{ width: `${medPct}%` }} />}
          {hardPct > 0 && <div className="bg-red-500 rounded-full transition-all" style={{ width: `${hardPct}%` }} />}
        </div>
      </div>

      {/* Contest Stats */}
      {Number(data.contestRating) > 0 && (
        <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
          <Trophy className="w-5 h-5 text-yellow-400 shrink-0" />
          <div>
            <p className="text-white text-sm font-medium">Contest Rating: {Number(data.contestRating).toLocaleString()}</p>
            <p className="text-zinc-500 text-xs">{Number(data.contestsAttended)} contests attended</p>
          </div>
        </div>
      )}

      {/* Top Tags */}
      {Array.isArray(data.topTags) && data.topTags.length > 0 && (
        <div>
          <p className="text-zinc-400 text-xs mb-2 font-medium flex items-center gap-1.5">
            <Zap className="w-3 h-3" /> TOP TOPICS
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(data.topTags as { tagName: string; problemsSolved: number }[]).map(tag => (
              <span key={tag.tagName}
                className="text-xs px-2 py-0.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-300">
                {tag.tagName} ({tag.problemsSolved})
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}