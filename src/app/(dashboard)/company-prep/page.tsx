import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CompanyPrepPage from '@/components/dashboard/CompanyPrepPage'

export default async function CompanyPrep() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const { data: savedPreps } = await supabase
    .from('company_preps').select('*').eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return <CompanyPrepPage profile={profile} savedPreps={savedPreps ?? []} />
}