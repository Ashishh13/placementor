import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

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

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = buildCompanyPrompt({ companyName, role, difficulty, profile })

    const result = await model.generateContent(prompt)
    const raw = result.response.text()
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

function buildCompanyPrompt({ companyName, role, difficulty, profile }: {
  companyName: string
  role: string
  difficulty: string
  profile: Record<string, unknown> | null
}) {
  return `
You are PlaceMentor AI, an elite placement coach. Generate a comprehensive, highly specific interview preparation plan based on your knowledge of ${companyName}'s hiring process.

Student Profile:
- Skills: ${(profile?.skills as string[])?.join(', ') ?? 'Not listed'}
- Branch: ${profile?.branch ?? 'CS'}
- Target Role: ${role}
- Prep Intensity: ${difficulty}

Generate a detailed prep plan for ${companyName} ${role} position based on well-known interview patterns, common questions, and hiring culture of this company.

Respond ONLY with this exact JSON, no other text:
{
  "companyOverview": {
    "name": "${companyName}",
    "about": "<2-3 sentence company description>",
    "techStack": ["<technologies they use>"],
    "culture": "<company culture in 1-2 sentences>",
    "hiringDifficulty": "${difficulty}",
    "averagePackage": "<salary range>",
    "interviewRounds": <number>
  },
  "interviewProcess": [
    {
      "round": <number>,
      "name": "<round name>",
      "description": "<what happens>",
      "duration": "<estimated duration>",
      "tips": "<specific tips>"
    }
  ],
  "topicsToCover": [
    {
      "topic": "<topic name>",
      "importance": "high|medium|low",
      "description": "<why this matters for this company>",
      "resources": ["<specific resource>"]
    }
  ],
  "practiceProblems": [
    {
      "title": "<problem title or pattern>",
      "difficulty": "Easy|Medium|Hard",
      "topic": "<DSA topic>",
      "why": "<why this company asks this>"
    }
  ],
  "weeklyPlan": [
    {
      "week": <number>,
      "focus": "<main focus>",
      "dailyTasks": ["<specific daily task>"],
      "goal": "<measurable goal>"
    }
  ],
  "insiderTips": ["<specific tip based on real interview experiences>"],
  "dosDonts": {
    "dos": ["<what to do>"],
    "donts": ["<what to avoid>"]
  },
  "estimatedPrepTime": "<realistic prep time in weeks>",
  "readinessScore": <0-100>
}
`
}