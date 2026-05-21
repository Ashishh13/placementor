export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  college: string | null
  branch: string | null
  graduation_year: number | null
  bio: string | null
  target_role: string | null
  target_companies: string[] | null
  resume_url: string | null
  linkedin_url: string | null
  github_username: string | null
  leetcode_username: string | null
  codolio_username: string | null
  portfolio_url: string | null
  skills: string[] | null
  created_at: string
  updated_at: string
}

export interface Analysis {
  id: string
  user_id: string
  type: string
  score: number | null
  strengths: string[] | null
  weaknesses: string[] | null
  suggestions: Record<string, unknown> | null
  raw_feedback: string | null
  created_at: string
}

export interface CompanyPrep {
  id: string
  user_id: string
  company_name: string
  role: string | null
  difficulty: string | null
  prep_plan: Record<string, unknown> | null
  resources: Record<string, unknown> | null
  status: string
  created_at: string
}

export interface ProgressSnapshot {
  id: string
  user_id: string
  github_stats: Record<string, unknown> | null
  leetcode_stats: Record<string, unknown> | null
  codolio_stats: Record<string, unknown> | null
  overall_score: number | null
  snapshot_date: string
  created_at: string
}