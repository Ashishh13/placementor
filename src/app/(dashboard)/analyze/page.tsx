import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AnalyzePage from '@/components/dashboard/AnalyzePage'

export default async function Analyze() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const { data: pastAnalyses } = await supabase
    .from('analyses').select('*').eq('user_id', user.id)
    .order('created_at', { ascending: false }).limit(5)

  return <AnalyzePage profile={profile} pastAnalyses={pastAnalyses ?? []} />
}