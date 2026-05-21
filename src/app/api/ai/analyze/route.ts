import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { resumeText, githubData, leetcodeData } = await req.json()

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    const prompt = buildPrompt({ profile, resumeText, githubData, leetcodeData })

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
      system: `You are PlaceMentor AI, an elite placement coach and technical recruiter with 15+ years of experience at top tech companies like Google, Microsoft, Amazon, and startups. You give brutally honest, deeply specific, and highly actionable feedback. You NEVER give generic advice. Every suggestion must be specific to THIS student's profile. You always respond in valid JSON only — no markdown, no preamble.`,
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    const clean = raw.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    // Save to database
    await supabase.from('analyses').insert({
      user_id: user.id,
      type: 'resume',
      score: parsed.overallScore,
      strengths: parsed.strengths,
      weaknesses: parsed.weaknesses,
      suggestions: parsed.suggestions,
      raw_feedback: raw,
    })

    // Log activity
    await supabase.from('activity_logs').insert({
      user_id: user.id,
      activity_type: 'analysis_run',
      description: 'Resume analysis completed',
      metadata: { score: parsed.overallScore },
    })

    return NextResponse.json(parsed)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}

function buildPrompt({ profile, resumeText, githubData, leetcodeData }: {
  profile: Record<string, unknown> | null
  resumeText: string
  githubData: Record<string, unknown> | null
  leetcodeData: Record<string, unknown> | null
}) {
  return `
Analyze this student's complete placement profile and provide a comprehensive, highly specific assessment.

## STUDENT PROFILE
- Name: ${profile?.full_name ?? 'Unknown'}
- College: ${profile?.college ?? 'Unknown'}
- Branch: ${profile?.branch ?? 'Unknown'}
- Graduation Year: ${profile?.graduation_year ?? 'Unknown'}
- Target Role: ${profile?.target_role ?? 'Not specified'}
- Target Companies: ${(profile?.target_companies as string[])?.join(', ') ?? 'Not specified'}
- Listed Skills: ${(profile?.skills as string[])?.join(', ') ?? 'None listed'}

## RESUME CONTENT
${resumeText ?? 'No resume uploaded'}

## GITHUB STATS
${githubData ? JSON.stringify(githubData, null, 2) : 'GitHub not connected'}

## LEETCODE STATS
${leetcodeData ? JSON.stringify(leetcodeData, null, 2) : 'LeetCode not connected'}

## YOUR TASK
Provide a deeply specific analysis. Cross-reference what they CLAIM on their resume vs what their GitHub and LeetCode ACTUALLY show. Call out any inconsistencies. Be direct.

Respond ONLY with this exact JSON structure:
{
  "overallScore": <number 0-100>,
  "scoreBreakdown": {
    "resumeQuality": <0-100>,
    "technicalStrength": <0-100>,
    "projectDepth": <0-100>,
    "dsaReadiness": <0-100>,
    "profileCompleteness": <0-100>
  },
  "strengths": [<3-5 specific strength strings>],
  "weaknesses": [<3-5 specific weakness strings>],
  "suggestions": {
    "immediate": [
      { "title": "<action title>", "detail": "<very specific 2-3 sentence action>", "priority": "high" }
    ],
    "shortTerm": [
      { "title": "<action title>", "detail": "<specific action for next 2-4 weeks>", "priority": "medium" }
    ],
    "longTerm": [
      { "title": "<action title>", "detail": "<strategic action for 1-3 months>", "priority": "low" }
    ]
  },
  "resumeFeedback": {
    "format": "<specific formatting feedback>",
    "content": "<specific content feedback>",
    "missingElements": [<list of missing sections or info>],
    "keywordsToAdd": [<ATS keywords relevant to their target role>]
  },
  "dsaFeedback": {
    "currentLevel": "<assessment of their DSA level>",
    "topicsToFocus": [<specific DSA topics to study>],
    "targetProblems": "<specific problem count and difficulty target>"
  },
  "projectFeedback": {
    "assessment": "<honest assessment of their projects>",
    "improvements": [<specific improvements for existing projects>],
    "suggestedProjects": [<2-3 specific project ideas for their target role>]
  },
  "placementReadiness": "<overall honest placement readiness summary in 2-3 sentences>",
  "estimatedTimeToReady": "<realistic time estimate to be placement-ready>"
}
`
}