import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles').select('*').eq('id', user.id).single()

    const { data: latestAnalysis } = await supabase
      .from('analyses').select('score').eq('user_id', user.id)
      .order('created_at', { ascending: false }).limit(1).single()

    // Fetch live platform data
    let githubStats = null
    let leetcodeStats = null

    if (profile?.github_username) {
      const ghRes = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/github?username=${profile.github_username}`
      )
      if (ghRes.ok) githubStats = await ghRes.json()
    }

    if (profile?.leetcode_username) {
      const lcRes = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/leetcode?username=${profile.leetcode_username}`
      )
      if (lcRes.ok) leetcodeStats = await lcRes.json()
    }

    const overallScore = latestAnalysis?.score ?? 0

    const { error } = await supabase.from('progress_snapshots').insert({
      user_id: user.id,
      github_stats: githubStats,
      leetcode_stats: leetcodeStats,
      overall_score: overallScore,
      snapshot_date: new Date().toISOString().split('T')[0],
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to save snapshot' }, { status: 500 })
  }
}