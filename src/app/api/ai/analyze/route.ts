import Groq from 'groq-sdk'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

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

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are PlaceMentor AI, an elite placement coach and technical recruiter with 15+ years of experience at top tech companies like Google, Microsoft, Amazon. You give brutally honest, deeply specific, and highly actionable feedback. You NEVER give generic advice. Every suggestion must be specific to THIS student. You always respond in valid JSON only — no markdown, no preamble, no text outside JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    })

    const raw = completion.choices[0]?.message?.content ?? ''
    const clean = raw.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    await supabase.from('analyses').insert({
      user_id: user.id,
      type: 'resume',
      score: parsed.overallScore,
      strengths: parsed.strengths,
      weaknesses: parsed.weaknesses,
      suggestions: parsed.suggestions,
      raw_feedback: raw,
    })

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
Analyze this student's complete placement profile and provide a comprehensive assessment.

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

Cross-reference resume claims vs GitHub and LeetCode reality. Be direct and specific.

Respond ONLY with this exact JSON, no other text whatsoever:
{
  "overallScore": <number 0-100>,
  "scoreBreakdown": {
    "resumeQuality": <0-100>,
    "technicalStrength": <0-100>,
    "projectDepth": <0-100>,
    "dsaReadiness": <0-100>,
    "profileCompleteness": <0-100>
  },
  "strengths": ["<specific strength>"],
  "weaknesses": ["<specific weakness>"],
  "suggestions": {
    "immediate": [{ "title": "<title>", "detail": "<specific 2-3 sentence action>", "priority": "high" }],
    "shortTerm": [{ "title": "<title>", "detail": "<specific action>", "priority": "medium" }],
    "longTerm": [{ "title": "<title>", "detail": "<strategic action>", "priority": "low" }]
  },
  "resumeFeedback": {
    "format": "<specific formatting feedback>",
    "content": "<specific content feedback>",
    "missingElements": ["<missing item>"],
    "keywordsToAdd": ["<ATS keyword>"]
  },
  "dsaFeedback": {
    "currentLevel": "<DSA level assessment>",
    "topicsToFocus": ["<topic>"],
    "targetProblems": "<problem count and difficulty target>"
  },
  "projectFeedback": {
    "assessment": "<honest project assessment>",
    "improvements": ["<specific improvement>"],
    "suggestedProjects": ["<project idea>"]
  },
  "placementReadiness": "<2-3 sentence readiness summary>",
  "estimatedTimeToReady": "<realistic time estimate>"
}
`
}