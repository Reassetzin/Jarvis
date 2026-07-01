import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { summary } = await req.json()

  const systemPrompt = `You are Overseer, the AI inside a personal life dashboard (Jarvis) for a 22-year-old entrepreneur and athlete.
You are given a structured summary of the user's past week across health, fitness, finances, content, and productivity.
Your job: surface 3-5 SHORT, SPECIFIC, actionable insights and patterns. Be direct and useful, not generic.
Good examples: "You logged 0 workouts Mon-Wed but 3 Thu-Sat — front-load your week." / "Spending spiked on Food this week ($X), 2x your usual." / "Water streak is at 5 days — strongest habit right now."
Rules:
- Reference actual numbers from the data.
- Each insight one sentence, punchy.
- Mix praise and constructive flags.
- No fluff, no preamble. Return a JSON array of strings ONLY, e.g. ["insight 1","insight 2"]. No markdown, no backticks.`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY!, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6', max_tokens: 400, system: systemPrompt,
        messages: [{ role: 'user', content: `Here is my week's data:\n\n${summary}\n\nGive me my insights as a JSON array of strings.` }],
      }),
    })
    const data = await res.json()
    let text = data.content?.[0]?.text || '[]'
    text = text.replace(/```json|```/g, '').trim()
    let insights: string[] = []
    try { insights = JSON.parse(text) } catch { insights = text.split('\n').filter((l: string) => l.trim()).slice(0, 5) }
    return NextResponse.json({ insights })
  } catch (e) {
    return NextResponse.json({ insights: [], error: 'Could not reach Claude API.' }, { status: 500 })
  }
}
