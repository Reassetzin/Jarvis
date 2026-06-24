import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
export async function POST(req: NextRequest) {
  try {
    const { whoopData } = await req.json()
    const response = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 512,
      system: 'You are a performance coach analyzing WHOOP biometric data. Give a brief, actionable daily coaching message. Max 3 sentences.',
      messages: [{ role: 'user', content: `WHOOP data: Recovery ${whoopData.recovery}%, Sleep ${whoopData.sleep_pct}%, Strain ${whoopData.strain}, HRV ${whoopData.hrv}ms, RHR ${whoopData.rhr}bpm. Status and key action?` }],
    })
    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    return NextResponse.json({ summary: text })
  } catch {
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 })
  }
}
