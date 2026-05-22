import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

function textToVector(text: string, dims: number): number[] {
  const vector = new Array(dims).fill(0)
  for (let i = 0; i < text.length; i++) {
    const idx = (text.charCodeAt(i) * (i + 1)) % dims
    vector[idx] = (vector[idx] + text.charCodeAt(i) / 128) % 1
  }
  return vector
}

async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'Respond ONLY with a JSON array of exactly 768 numbers between -1 and 1 representing semantic features of the input text. No other text.',
        },
        { role: 'user', content: text.slice(0, 400) },
      ],
      max_tokens: 4000,
    })
    const raw = completion.choices[0]?.message?.content ?? '[]'
    const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())
    const embedding = Array.isArray(parsed) ? parsed : textToVector(text, 768)
    while (embedding.length < 768) embedding.push(0)
    return embedding.slice(0, 768)
  } catch {
    return textToVector(text, 768)
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const {
      companyName, role, year, packageLpa, placementType,
      oaPattern, interviewRounds, questionsAsked, tips,
      difficulty, outcome, isAnonymous
    } = body

    const { data: profile } = await supabase
      .from('profiles').select('college, branch').eq('id', user.id).single()

    // Build text for embedding
    const embeddingText = `
      Company: ${companyName}
      Role: ${role}
      OA Pattern: ${oaPattern}
      Questions: ${questionsAsked?.join(', ')}
      Tips: ${tips}
      Difficulty: ${difficulty}
    `.trim()

    const embedding = await generateEmbedding(embeddingText)

    const { error } = await supabase.from('community_experiences').insert({
      user_id: isAnonymous ? null : user.id,
      company_name: companyName,
      role,
      year: year ?? new Date().getFullYear(),
      package_lpa: packageLpa,
      college: profile?.college,
      branch: profile?.branch,
      placement_type: placementType,
      oa_pattern: oaPattern,
      interview_rounds: interviewRounds,
      questions_asked: questionsAsked,
      tips,
      difficulty,
      outcome,
      is_anonymous: isAnonymous ?? false,
      embedding,
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await supabase.from('activity_logs').insert({
      user_id: user.id,
      activity_type: 'experience_shared',
      description: `Shared interview experience for ${companyName}`,
      metadata: { company: companyName, role },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 })
  }
}