let pipeline: ((text: string) => Promise<{ data: Float32Array }>) | null = null

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // Use Groq to generate embeddings via a simple approach
    // We'll create a deterministic embedding from text for free
    const response = await fetch('/api/ai/embed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    const data = await response.json()
    return data.embedding
  } catch {
    return []
  }
}