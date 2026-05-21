import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardHome from '@/components/dashboard/DashboardHome'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const { data: analyses } = await supabase.from('analyses').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5)
  const { data: companyPreps } = await supabase.from('company_preps').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3)

  return <DashboardHome profile={profile} analyses={analyses ?? []} companyPreps={companyPreps ?? []} />
}