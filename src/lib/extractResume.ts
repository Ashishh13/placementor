export async function extractTextFromFile(file: File): Promise<string> {
  if (file.type === 'application/pdf') {
    return extractFromPDF(file)
  }
  if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return extractFromDocx(file)
  }
  // Plain text fallback
  return file.text()
}

async function extractFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const bytes = new Uint8Array(arrayBuffer)
  let text = ''

  // Extract readable ASCII text from PDF bytes
  const decoder = new TextDecoder('utf-8', { fatal: false })
  const raw = decoder.decode(bytes)

  // Pull text between BT and ET markers (PDF text objects)
  const btEtRegex = /BT([\s\S]*?)ET/g
  let match
  while ((match = btEtRegex.exec(raw)) !== null) {
    const block = match[1]
    const tjRegex = /\((.*?)\)\s*T[jJ]/g
    let tjMatch
    while ((tjMatch = tjRegex.exec(block)) !== null) {
      text += tjMatch[1] + ' '
    }
    const tfRegex = /\[(.*?)\]\s*TJ/g
    let tfMatch
    while ((tfMatch = tfRegex.exec(block)) !== null) {
      const inner = tfMatch[1].replace(/\(([^)]*)\)/g, '$1').replace(/-?\d+/g, ' ')
      text += inner + ' '
    }
  }

  // Fallback: grab anything in parentheses that looks like words
  if (text.trim().length < 100) {
    const fallback = raw.match(/\(([A-Za-z0-9 .,:;@+\-_/\\]{3,})\)/g) ?? []
    text = fallback.map(s => s.slice(1, -1)).join(' ')
  }

  return text.replace(/\s+/g, ' ').trim().slice(0, 12000)
}

async function extractFromDocx(file: File): Promise<string> {
  try {
    const mammoth = await import('mammoth')
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer })
    return result.value.slice(0, 12000)
  } catch {
    return 'Could not extract text from DOCX file.'
  }
}