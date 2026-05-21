import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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

    // Use Claude with web search to get live company data
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 5000,
      tools: [{ type: 'web_search_20250305' as const, name: 'web_search' }],
      system: `You are PlaceMentor AI, an elite placement coach. You search the web for the LATEST and most accurate interview information for companies. You always respond with valid JSON only after gathering information. Never make up interview questions — always base them on real reported experiences.`,
      messages: [
        {
          role: 'user',
          content: buildCompanyPrompt({ companyName, role, difficulty, profile }),
        }
      ],
    })

    // Extract final text response after tool use
    let finalText = ''
    for (const block of response.content) {
      if (block.type === 'text') finalText = block.text
    }

    // If Claude used web search, get the final answer
    if (response.stop_reason === 'tool_use') {
      const toolResults = []
      for (const block of response.content) {
        if (block.type === 'tool_use') {
          toolResults.push({
            type: 'tool_result' as const,
            tool_use_id: block.id,
            content: 'Search completed',
          })
        }
      }

      const followUp = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 5000,
        tools: [{ type: 'web_search_20250305' as const, name: 'web_search' }],
        system: `You are PlaceMentor AI. Now synthesize all the web search results and respond ONLY with the JSON structure requested. No markdown, no preamble.`,
        messages: [
          { role: 'user', content: buildCompanyPrompt({ companyName, role, difficulty, profile }) },
          { role: 'assistant', content: response.content },
          { role: 'user', content: toolResults },
        ],
      })

      for (const block of followUp.content) {
        if (block.type === 'text') finalText = block.text
      }
    }

    const clean = finalText.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    // Save to database
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
Search the web for the LATEST interview process, questions, and preparation strategy for:
Company: ${companyName}
Role: ${role}
Student Profile:
- Skills: ${(profile?.skills as string[])?.join(', ') ?? 'Not listed'}
- LeetCode Solved: connected
- Branch: ${profile?.branch ?? 'CS'}
- Target: ${profile?.target_role ?? role}

Search for:
1. "${companyName} ${role} interview process 2024 2025"
2. "${companyName} coding interview questions"
3. "${companyName} software engineer hiring process campus"

Then respond ONLY with this JSON:
{
  "companyOverview": {
    "name": "${companyName}",
    "about": "<2-3 sentence company description>",
    "techStack": ["<technologies they use>"],
    "culture": "<company culture in 1-2 sentences>",
    "hiringDifficulty": "${difficulty}",
    "averagePackage": "<salary range if found>",
    "interviewRounds": <number of rounds>
  },
  "interviewProcess": [
    {
      "round": <number>,
      "name": "<round name>",
      "description": "<what happens in this round>",
      "duration": "<estimated duration>",
      "tips": "<specific tips for this round>"
    }
  ],
  "topicsToCover": [
    {
      "topic": "<topic name>",
      "importance": "high|medium|low",
      "description": "<why this topic matters for this company>",
      "resources": ["<specific resource or approach>"]
    }
  ],
  "practiceProblems": [
    {
      "title": "<problem title or pattern>",
      "difficulty": "Easy|Medium|Hard",
      "topic": "<DSA topic>",
      "why": "<why this company asks this type>"
    }
  ],
  "weeklyPlan": [
    {
      "week": <number>,
      "focus": "<main focus for this week>",
      "dailyTasks": ["<specific daily task>"],
      "goal": "<measurable goal for the week>"
    }
  ],
  "insiderTips": ["<specific tip based on real interview experiences>"],
  "dosDonts": {
    "dos": ["<what to do>"],
    "donts": ["<what to avoid>"]
  },
  "estimatedPrepTime": "<realistic prep time in weeks>",
  "readinessScore": <0-100 based on student profile vs company requirements>
}
`
}