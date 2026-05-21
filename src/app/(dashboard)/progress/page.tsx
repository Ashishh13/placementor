import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProgressPage from '@/components/dashboard/ProgressPage'

export default async function Progress() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  const { data: snapshots } = await supabase
    .from('progress_snapshots').select('*').eq('user_id', user.id)
    .order('snapshot_date', { ascending: true })

  const { data: analyses } = await supabase
    .from('analyses').select('*').eq('user_id', user.id)
    .order('created_at', { ascending: true })

  const { data: activityLogs } = await supabase
    .from('activity_logs').select('*').eq('user_id', user.id)
    .order('created_at', { ascending: false }).limit(10)

  const { data: companyPreps } = await supabase
    .from('company_preps').select('*').eq('user_id', user.id)

  return (
    <ProgressPage
      profile={profile}
      snapshots={snapshots ?? []}
      analyses={analyses ?? []}
      activityLogs={activityLogs ?? []}
      companyPreps={companyPreps ?? []}
    />
  )
}