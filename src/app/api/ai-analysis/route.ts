import { NextResponse } from 'next/server'

const OR_API = 'https://openrouter.ai/api/v1/chat/completions'
const MODEL = 'tencent/hy3:free'

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json()

    if (!imageUrl) {
      return NextResponse.json({ error: '이미지 URL이 필요합니다' }, { status: 400 })
    }

    const apiKey = process.env.OPENROUTER_API_KEY
    const hasApiKey = apiKey && apiKey.startsWith('sk-or-')

    if (!hasApiKey) {
      return NextResponse.json({
        tags: ['API 키 미설정'],
        severity: 1,
        description: 'OPENROUTER_API_KEY를 .env.local에 설정해주세요',
        model: null,
      })
    }

    const prompt = `이 이미지를 분석해주세요. 쓰레기 무단투기, 위험한 시설물, 환경 문제 등이 보이면 알려주세요.
아래 JSON 형식으로만 응답해주세요 (다른 말 없이 JSON만):
{
  "tags": ["관련 태그들", "예: 쓰레기봉투, 플라스틱, 가로등고장"],
  "severity": 1에서 3까지의 심각도 (1: 낮음, 2: 보통, 3: 심각),
  "description": "30자 이내의 간단한 설명"
}`

    const res = await fetch(OR_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageUrl } },
          ],
        }],
        temperature: 0.3,
        max_tokens: 300,
      }),
    })

    const data = await res.json()

    if (data.error) {
      console.error('OpenRouter error:', data.error)
      return NextResponse.json({
        tags: ['분석 중 오류'],
        severity: 1,
        description: data.error.message || '일시적 오류',
        model: MODEL,
      })
    }

    const text = data?.choices?.[0]?.message?.content || '{}'
    const cleaned = text.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '')
    const parsed = JSON.parse(cleaned)

    return NextResponse.json({
      tags: parsed.tags || [],
      severity: parsed.severity || 1,
      description: parsed.description || '',
      model: MODEL,
    })
  } catch (err) {
    console.error('AI analysis error:', err)
    return NextResponse.json({ tags: [], severity: 1, description: '분석 실패', model: null })
  }
}
