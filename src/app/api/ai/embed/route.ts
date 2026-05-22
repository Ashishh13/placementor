import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()

    // Use Groq to create a condensed representation
    // then hash it into a 768-dim vector
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'Extract exactly 768 unique numerical features from the text as a JSON array of numbers between -1 and 1. Respond ONLY with the JSON array, nothing else.',
        },
        {
          role: 'user',
          content: `Extract semantic features from: "${text.slice(0, 500)}"`,
        },
      ],
      max_tokens: 4000,
    })

    const raw = completion.choices[0]?.message?.content ?? '[]'
    const clean = raw.replace(/```json|```/g, '').trim()

    let embedding: number[] = []
    try {
      embedding = JSON.parse(clean)
    } catch {
      // Fallback: generate pseudo-embedding from text hash
      embedding = textToVector(text, 768)
    }

    // Ensure exactly 768 dimensions
    while (embedding.length < 768) embedding.push(0)
    embedding = embedding.slice(0, 768)

    return NextResponse.json({ embedding })
  } catch {
    // Fallback to deterministic vector
    const { text } = await req.json().catch(() => ({ text: '' }))
    return NextResponse.json({ embedding: textToVector(text, 768) })
  }
}

function textToVector(text: string, dims: number): number[] {
  const vector = new Array(dims).fill(0)
  for (let i = 0; i < text.length; i++) {
    const idx = (text.charCodeAt(i) * (i + 1)) % dims
    vector[idx] = (vector[idx] + text.charCodeAt(i) / 128) % 1
  }
  return vector
}