'use client'

import { Bell, Search } from 'lucide-react'
import { Profile } from '@/types'
import { useState } from 'react'

export default function Topbar({ profile }: { profile: Profile | null }) {
  const [search, setSearch] = useState('')

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <header className="h-16 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-40">
      <div>
        <p className="text-zinc-400 text-sm">{getGreeting()},</p>
        <p className="text-white font-semibold text-base leading-none mt-0.5">
          {profile?.full_name?.split(' ')[0] ?? 'Student'} 👋
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search companies, topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 w-64 transition-all"
          />
        </div>

        {/* Notification bell */}
        <button className="relative w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full" />
        </button>
      </div>
    </header>
  )
}