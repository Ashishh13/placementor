'use client'

import { useGitHub } from '@/hooks/useGitHub'
import { GitBranch, Star, GitFork, BookOpen, Users, ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'

const LANG_COLORS: Record<string, string> = {
  JavaScript: '#f7df1e', TypeScript: '#3178c6', Python: '#3572A5',
  Java: '#b07219', 'C++': '#f34b7d', C: '#555555', Go: '#00ADD8',
  Rust: '#dea584', Kotlin: '#A97BFF', Swift: '#FA7343',
}

export default function GitHubCard({ username }: { username: string | null }) {
  const { data, loading, error } = useGitHub(username)

  if (!username) return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 min-h-[200px]">
      <GitBranch className="w-8 h-8 text-zinc-600" />
      <p className="text-zinc-500 text-sm text-center">Add your GitHub username in Profile to see stats</p>
    </div>
  )

  if (loading) return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
      <Skeleton className="h-5 w-32 bg-white/10" />
      <div className="grid grid-cols-3 gap-3">
        {[1,2,3].map(i => <Skeleton key={i} className="h-16 bg-white/10 rounded-xl" />)}
      </div>
      <Skeleton className="h-4 w-full bg-white/10" />
    </div>
  )

  if (error) return (
    <div className="bg-white/5 border border-red-500/20 rounded-2xl p-5 flex items-center gap-3">
      <GitBranch className="w-5 h-5 text-red-400" />
      <p className="text-red-400 text-sm">{error}</p>
    </div>
  )

  if (!data) return null

  const stats = [
    { label: 'Repos', value: data.publicRepos, icon: BookOpen },
    { label: 'Stars', value: data.totalStars, icon: Star },
    { label: 'Followers', value: data.followers, icon: Users },
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <GitBranch className="w-5 h-5 text-white" />
          <div>
            <p className="text-white font-semibold text-sm">{String(data.name ?? data.username)}</p>
            <p className="text-zinc-500 text-xs">@{String(data.username)}</p>
          </div>
        </div>
        <a href={String(data.profileUrl)} target="_blank" rel="noopener noreferrer"
          className="text-zinc-400 hover:text-white transition-colors">
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white/5 rounded-xl p-3 text-center">
            <Icon className="w-4 h-4 text-violet-400 mx-auto mb-1" />
            <p className="text-white font-bold text-lg">{String(value)}</p>
            <p className="text-zinc-500 text-xs">{label}</p>
          </div>
        ))}
      </div>

      {/* Top Languages */}
      {Array.isArray(data.topLanguages) && data.topLanguages.length > 0 && (
        <div>
          <p className="text-zinc-400 text-xs mb-2 font-medium">TOP LANGUAGES</p>
          <div className="flex flex-wrap gap-2">
            {(data.topLanguages as { lang: string; count: number }[]).map(({ lang }) => (
              <span key={lang} className="flex items-center gap-1.5 text-xs text-zinc-300 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: LANG_COLORS[lang] ?? '#888' }} />
                {lang}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recent Repos */}
      {Array.isArray(data.recentRepos) && data.recentRepos.length > 0 && (
        <div>
          <p className="text-zinc-400 text-xs mb-2 font-medium">RECENT REPOS</p>
          <div className="space-y-2">
            {(data.recentRepos as { name: string; description: string; url: string; stars: number; language: string }[])
              .slice(0, 3).map(repo => (
              <a key={repo.name} href={repo.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all group">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium truncate group-hover:text-violet-300 transition-colors">{repo.name}</p>
                  {repo.description && <p className="text-zinc-500 text-xs truncate mt-0.5">{repo.description}</p>}
                </div>
                <div className="flex items-center gap-1 ml-2 shrink-0">
                  {repo.stars > 0 && <><Star className="w-3 h-3 text-zinc-500" /><span className="text-zinc-500 text-xs">{repo.stars}</span></>}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}