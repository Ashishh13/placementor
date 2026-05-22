import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CommunityPage from '@/components/dashboard/CommunityPage'

export default async function Community() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  const { data: experiences } = await supabase
    .from('community_experiences')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20)

  return <CommunityPage profile={profile} experiences={experiences ?? []} />
}