import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { description } = await req.json()

  const prompt = `Estimate the calories for this food: "${description}".
Respond with ONLY a JSON object, no other text, in this exact format:
{"food": "short cleaned-up name", "calories": number, "protein": number, "carbs": number, "fat": number}
Use your best estimate for typical portions. Numbers only, grams for macros.`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY!, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 200, messages: [{ role: 'user', content: prompt }] }),
    })
    const data = await res.json()
    let text = data.content?.[0]?.text || '{}'
    text = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(text)
    return NextResponse.json(parsed)
  } catch (e) {
    return NextResponse.json({ error: 'Could not estimate' }, { status: 500 })
  }
}
