'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types'
import { useRouter } from 'next/navigation'
import {
  User, GitBranch, Code2, Link2, GraduationCap,
  Target, Wrench, Upload, Loader2, Save, CheckCircle2,
  LucideGitBranchPlus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ResumeUpload from './ResumeUpload'
import SkillsInput from './SkillsInput'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }

const sectionClass = "bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4"
const inputClass = "bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:border-violet-500"

export default function ProfilePage({ profile, userId }: { profile: Profile | null; userId: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    full_name: profile?.full_name ?? '',
    college: profile?.college ?? '',
    branch: profile?.branch ?? '',
    graduation_year: profile?.graduation_year?.toString() ?? '',
    bio: profile?.bio ?? '',
    target_role: profile?.target_role ?? '',
    target_companies: profile?.target_companies?.join(', ') ?? '',
    github_username: profile?.github_username ?? '',
    leetcode_username: profile?.leetcode_username ?? '',
    codolio_username: profile?.codolio_username ?? '',
    linkedin_url: profile?.linkedin_url ?? '',
    portfolio_url: profile?.portfolio_url ?? '',
  })
  const [skills, setSkills] = useState<string[]>(profile?.skills ?? [])
  const [resumeUrl, setResumeUrl] = useState<string>(profile?.resume_url ?? '')

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }))

  const handleSave = async () => {
  setSaving(true)
  try {
    const updateData = {
      id: userId,
      full_name: form.full_name || null,
      college: form.college || null,
      branch: form.branch || null,
      graduation_year: form.graduation_year ? parseInt(form.graduation_year) : null,
      bio: form.bio || null,
      target_role: form.target_role || null,
      target_companies: form.target_companies
        ? form.target_companies.split(',').map(s => s.trim()).filter(Boolean)
        : [],
      github_username: form.github_username || null,
      leetcode_username: form.leetcode_username || null,
      codolio_username: form.codolio_username || null,
      linkedin_url: form.linkedin_url || null,
      portfolio_url: form.portfolio_url || null,
      skills: skills ?? [],
      resume_url: resumeUrl || null,
      updated_at: new Date().toISOString(),
    }

    console.log('Saving profile data:', updateData)

    const { data, error } = await supabase
      .from('profiles')
      .upsert(updateData)
      .select()

    console.log('Supabase response:', { data, error })

    if (error) {
      console.error('Supabase error:', error)
      toast.error(`Save failed: ${error.message}`)
      return
    }

    toast.success('Profile saved!')
    router.refresh()
  } catch (err) {
    console.error('Unexpected error:', err)
    toast.error('Unexpected error saving profile')
  } finally {
    setSaving(false)
  }
}

  const completionItems = [
    form.full_name, form.college, form.branch,
    form.github_username, form.leetcode_username,
    resumeUrl, skills.length > 0, form.target_role
  ]
  const completion = Math.round((completionItems.filter(Boolean).length / completionItems.length) * 100)

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Profile</h1>
          <p className="text-zinc-400 text-sm mt-1">Complete your profile for better AI insights</p>
        </div>
        <Button onClick={handleSave} disabled={saving}
          className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white rounded-xl h-10 px-5">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" />Save Profile</>}
        </Button>
      </motion.div>

      {/* Completion Bar */}
      <motion.div variants={item} className="bg-white/5 border border-white/10 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-zinc-300 text-sm font-medium">Profile Completion</span>
          <span className="text-violet-400 font-bold text-sm">{completion}%</span>
        </div>
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completion}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-violet-500 to-blue-500 rounded-full"
          />
        </div>
        {completion === 100 && (
          <p className="text-emerald-400 text-xs mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Profile complete — AI has full context!
          </p>
        )}
      </motion.div>

      {/* Resume Upload */}
      <motion.div variants={item} className={sectionClass}>
        <div className="flex items-center gap-2 mb-2">
          <Upload className="w-4 h-4 text-violet-400" />
          <h2 className="text-white font-semibold">Resume / CV</h2>
        </div>
        <ResumeUpload userId={userId} currentUrl={resumeUrl} onUpload={setResumeUrl} />
      </motion.div>

      {/* Personal Info */}
      <motion.div variants={item} className={sectionClass}>
        <div className="flex items-center gap-2 mb-2">
          <User className="w-4 h-4 text-violet-400" />
          <h2 className="text-white font-semibold">Personal Info</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-zinc-300 text-sm">Full Name</Label>
            <Input value={form.full_name} onChange={e => set('full_name', e.target.value)}
              placeholder="Your full name" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-zinc-300 text-sm">College / University</Label>
            <Input value={form.college} onChange={e => set('college', e.target.value)}
              placeholder="RKNEC, Nagpur" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-zinc-300 text-sm">Branch</Label>
            <Input value={form.branch} onChange={e => set('branch', e.target.value)}
              placeholder="Computer Science & Engineering" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-zinc-300 text-sm">Graduation Year</Label>
            <Input value={form.graduation_year} onChange={e => set('graduation_year', e.target.value)}
              placeholder="2026" type="number" className={inputClass} />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-zinc-300 text-sm">Bio</Label>
            <textarea value={form.bio} onChange={e => set('bio', e.target.value)}
              placeholder="A short intro about yourself..."
              rows={3}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 text-white placeholder:text-zinc-600 rounded-xl text-sm focus:outline-none focus:border-violet-500 resize-none" />
          </div>
        </div>
      </motion.div>

      {/* Target */}
      <motion.div variants={item} className={sectionClass}>
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-violet-400" />
          <h2 className="text-white font-semibold">Placement Goals</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-zinc-300 text-sm">Target Role</Label>
            <Input value={form.target_role} onChange={e => set('target_role', e.target.value)}
              placeholder="Software Engineer, Data Scientist..." className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-zinc-300 text-sm">Target Companies (comma separated)</Label>
            <Input value={form.target_companies} onChange={e => set('target_companies', e.target.value)}
              placeholder="Google, Microsoft, Amazon..." className={inputClass} />
          </div>
        </div>
      </motion.div>

      {/* Skills */}
      <motion.div variants={item} className={sectionClass}>
        <div className="flex items-center gap-2 mb-2">
          <Wrench className="w-4 h-4 text-violet-400" />
          <h2 className="text-white font-semibold">Skills</h2>
        </div>
        <SkillsInput skills={skills} onChange={setSkills} />
      </motion.div>

      {/* Social Links */}
      <motion.div variants={item} className={sectionClass}>
        <div className="flex items-center gap-2 mb-2">
          <Link2 className="w-4 h-4 text-violet-400" />
          <h2 className="text-white font-semibold">Platform Integrations</h2>
          <span className="ml-1 text-xs text-zinc-500 bg-white/5 px-2 py-0.5 rounded-full">Used by AI for analysis</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-zinc-300 text-sm flex items-center gap-1.5">
              <LucideGitBranchPlus className="w-3.5 h-3.5" /> GitHub Username
            </Label>
            <Input value={form.github_username} onChange={e => set('github_username', e.target.value)}
              placeholder="your-github-username" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-zinc-300 text-sm flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5" /> LeetCode Username
            </Label>
            <Input value={form.leetcode_username} onChange={e => set('leetcode_username', e.target.value)}
              placeholder="your-leetcode-username" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-zinc-300 text-sm">Codolio Username</Label>
            <Input value={form.codolio_username} onChange={e => set('codolio_username', e.target.value)}
              placeholder="your-codolio-username" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-zinc-300 text-sm">LinkedIn URL</Label>
            <Input value={form.linkedin_url} onChange={e => set('linkedin_url', e.target.value)}
              placeholder="https://linkedin.com/in/yourname" className={inputClass} />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-zinc-300 text-sm">Portfolio / Website URL</Label>
            <Input value={form.portfolio_url} onChange={e => set('portfolio_url', e.target.value)}
              placeholder="https://yourportfolio.dev" className={inputClass} />
          </div>
        </div>
      </motion.div>

      {/* Save Button Bottom */}
      <motion.div variants={item} className="flex justify-end pb-6">
        <Button onClick={handleSave} disabled={saving}
          className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white rounded-xl h-11 px-8 text-base">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" />Save All Changes</>}
        </Button>
      </motion.div>
    </motion.div>
  )
}