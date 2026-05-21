'use client'

import { useState, KeyboardEvent } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const SUGGESTIONS = [
  'Python', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'Java', 'C++', 'C',
  'SQL', 'MongoDB', 'PostgreSQL', 'Docker', 'Git', 'AWS', 'Machine Learning',
  'Deep Learning', 'Computer Vision', 'Data Structures', 'System Design', 'Next.js'
]

export default function SkillsInput({ skills, onChange }: { skills: string[]; onChange: (s: string[]) => void }) {
  const [input, setInput] = useState('')

  const addSkill = (skill: string) => {
    const trimmed = skill.trim()
    if (trimmed && !skills.includes(trimmed)) {
      onChange([...skills, trimmed])
    }
    setInput('')
  }

  const removeSkill = (skill: string) => onChange(skills.filter(s => s !== skill))

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill(input) }
    if (e.key === 'Backspace' && !input && skills.length > 0) removeSkill(skills[skills.length - 1])
  }

  const filtered = SUGGESTIONS.filter(s => s.toLowerCase().includes(input.toLowerCase()) && !skills.includes(s))

  return (
    <div className="space-y-3">
      {/* Input */}
      <div className="flex flex-wrap gap-2 p-3 bg-white/5 border border-white/10 rounded-xl min-h-[48px] focus-within:border-violet-500 transition-colors">
        <AnimatePresence>
          {skills.map(skill => (
            <motion.span key={skill} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1.5 bg-violet-500/20 text-violet-300 border border-violet-500/30 px-2.5 py-1 rounded-lg text-sm">
              {skill}
              <button onClick={() => removeSkill(skill)} className="hover:text-white transition-colors">
                <X className="w-3 h-3" />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={skills.length === 0 ? 'Type a skill and press Enter...' : ''}
          className="flex-1 min-w-[120px] bg-transparent text-white text-sm outline-none placeholder:text-zinc-600"
        />
      </div>

      {/* Suggestions */}
      {input && filtered.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filtered.slice(0, 6).map(s => (
            <button key={s} onClick={() => addSkill(s)}
              className="text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:border-violet-500/50 transition-all">
              + {s}
            </button>
          ))}
        </div>
      )}

      {/* Quick add suggestions */}
      {skills.length === 0 && !input && (
        <div className="flex flex-wrap gap-2">
          <span className="text-zinc-500 text-xs self-center">Quick add:</span>
          {SUGGESTIONS.slice(0, 8).map(s => (
            <button key={s} onClick={() => addSkill(s)}
              className="text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:border-violet-500/50 transition-all">
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}