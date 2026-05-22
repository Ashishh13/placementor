import Groq from 'groq-sdk'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { companyName, role, difficulty } = await req.json()

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // Fetch real community experiences for RAG
let communityContext = ''
try {
  const searchRes = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/community/search?company=${encodeURIComponent(companyName)}&query=${encodeURIComponent(role)}`
  )
  const { experiences } = await searchRes.json()
  if (experiences && experiences.length > 0) {
    communityContext = `
## REAL STUDENT EXPERIENCES FROM PLACEMENTOR COMMUNITY
${experiences.map((e: Record<string, unknown>, i: number) => `
Experience ${i + 1}:
- Role: ${e.role} | Year: ${e.year} | Package: ${e.package_lpa} LPA
- OA Pattern: ${e.oa_pattern}
- Questions Asked: ${(e.questions_asked as string[])?.join(', ')}
- Tips from placed student: ${e.tips}
- Difficulty: ${e.difficulty}
`).join('\n')}
Use these REAL experiences to make your prep plan more accurate.
`
  }
} catch { /* no community data yet, continue normally */ }

const prompt = buildCompanyPrompt({ companyName, role, difficulty, profile, communityContext })

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are PlaceMentor AI, an elite placement coach. Generate highly specific, accurate interview preparation plans. Always respond with valid JSON only — no markdown, no preamble, no text outside JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 5000,
    })

    const raw = completion.choices[0]?.message?.content ?? ''
    const clean = raw.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    await supabase.from('company_preps').insert({
      user_id: user.id,
      company_name: companyName,
      role,
      difficulty,
      prep_plan: parsed,
      status: 'active',
    })

    await supabase.from('activity_logs').insert({
      user_id: user.id,
      activity_type: 'company_prep',
      description: `Generated prep plan for ${companyName}`,
      metadata: { company: companyName, role },
    })

    return NextResponse.json(parsed)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to generate prep plan' }, { status: 500 })
  }
}

function buildCompanyPrompt({ companyName, role, difficulty, profile, communityContext }: {
  companyName: string
  role: string
  difficulty: string
  profile: Record<string, unknown> | null
  communityContext: string
}) {
  return `
  ${communityContext}
Generate a comprehensive interview preparation plan for:
Company: ${companyName}
Role: ${role}
Prep Intensity: ${difficulty}

Student Profile:
- Skills: ${(profile?.skills as string[])?.join(', ') ?? 'Not listed'}
- Branch: ${profile?.branch ?? 'CS'}
- Target Role: ${role}

Respond ONLY with this exact JSON, no other text:
{
  "companyOverview": {
    "name": "${companyName}",
    "about": "<2-3 sentence description>",
    "techStack": ["<technology>"],
    "culture": "<culture description>",
    "hiringDifficulty": "${difficulty}",
    "averagePackage": "<salary range>",
    "interviewRounds": <number>
  },
  "interviewProcess": [
    {
      "round": <number>,
      "name": "<round name>",
      "description": "<what happens>",
      "duration": "<duration>",
      "tips": "<specific tips>"
    }
  ],
  "topicsToCover": [
    {
      "topic": "<topic>",
      "importance": "high|medium|low",
      "description": "<why important>",
      "resources": ["<resource>"]
    }
  ],
  "practiceProblems": [
    {
      "title": "<problem title>",
      "difficulty": "Easy|Medium|Hard",
      "topic": "<DSA topic>",
      "why": "<why this company asks this>"
    }
  ],
  "weeklyPlan": [
    {
      "week": <number>,
      "focus": "<focus>",
      "dailyTasks": ["<task>"],
      "goal": "<measurable goal>"
    }
  ],
  "insiderTips": ["<specific tip>"],
  "dosDonts": {
    "dos": ["<do this>"],
    "donts": ["<avoid this>"]
  },
  "estimatedPrepTime": "<weeks>",
  "readinessScore": <0-100>
}
`
}