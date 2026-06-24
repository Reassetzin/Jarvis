import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
export async function POST(req: NextRequest) {
  try {
    const { message, context } = await req.json()
    const response = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      system: `You are Jarvis, a personal life operating system AI assistant. Be concise and actionable. Context: ${JSON.stringify(context)}`,
      messages: [{ role: 'user', content: message }],
    })
    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    return NextResponse.json({ response: text })
  } catch {
    return NextResponse.json({ error: 'Failed to get response' }, { status: 500 })
  }
}
