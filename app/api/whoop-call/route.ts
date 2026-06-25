import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { whoop } = await req.json()

  const prompt = `Analyze these WHOOP stats and give a coaching summary:
Recovery: ${whoop.recovery}%
Sleep: ${whoop.sleep}%
Strain: ${whoop.strain}
HRV: ${whoop.hrv}ms
RHR: ${whoop.rhr}bpm
Skin Temp: ${whoop.skinTemp}°F
Blood O2: ${whoop.bloodO2}%
Resp Rate: ${whoop.respRate}/min

Respond with:
1. A GREEN/YELLOW/RED status label on the first line (just the word)
2. 3-5 bullet points of direct coaching advice for today based on these stats.
Be concise. Focus on what to do today. No preamble.`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 400,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await res.json()
    const text = data.content?.[0]?.text || ''
    const lines = text.split('\n').filter(Boolean)
    const firstLine = lines[0]?.trim().toUpperCase()
    let level = 'YELLOW'
    if (firstLine === 'GREEN') level = 'GREEN'
    else if (firstLine === 'RED') level = 'RED'
    else if (firstLine === 'YELLOW') level = 'YELLOW'

    const body = lines.slice(firstLine === 'GREEN' || firstLine === 'RED' || firstLine === 'YELLOW' ? 1 : 0).join('\n')

    return NextResponse.json({ text: body, level })
  } catch (e) {
    return NextResponse.json({ text: 'Error reaching Claude API.', level: 'YELLOW' }, { status: 500 })
  }
}
