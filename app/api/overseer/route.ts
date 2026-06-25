import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { message } = await req.json()

  const systemPrompt = `You are Overseer — a sharp, direct personal AI assistant for a 22-year-old entrepreneur and athlete.
You are embedded in their personal life operating system (Life OS / Jarvis).
You help with: daily goals, vitamins, hydration, energy, finances (income/expenses/budgets), content/brand strategy, and athletic training (soccer, volleyball, pickleball, running, rock climbing, calisthenics).
Be concise, direct, and actionable. No fluff. Use short sentences. Max 3-4 sentences unless more detail is needed.
Today's date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}.`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY!, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 300, system: systemPrompt, messages: [{ role: 'user', content: message }] }),
    })
    const data = await res.json()
    const reply = data.content?.[0]?.text || 'No response.'
    return NextResponse.json({ reply })
  } catch (e) {
    return NextResponse.json({ reply: 'Error reaching Claude API.' }, { status: 500 })
  }
}
