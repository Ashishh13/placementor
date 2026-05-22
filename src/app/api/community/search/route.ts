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
          content: 'Respond ONLY with a JSON array of exactly 768 numbers between -1 and 1. No other text.',
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

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const company = req.nextUrl.searchParams.get('company')
    const query = req.nextUrl.searchParams.get('query') ?? company ?? ''

    const embedding = await generateEmbedding(query)

    const { data, error } = await supabase.rpc('search_experiences', {
      query_embedding: embedding,
      match_company: company ?? null,
      match_count: 5,
    })

    if (error) return NextResponse.json({ experiences: [] })

    return NextResponse.json({ experiences: data ?? [] })
  } catch {
    return NextResponse.json({ experiences: [] })
  }
}