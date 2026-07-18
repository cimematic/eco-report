import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json()

    if (!imageUrl) {
      return NextResponse.json({ error: '이미지 URL이 필요합니다' }, { status: 400 })
    }

    const geminiKey = process.env.GOOGLE_GEMINI_KEY
    if (!geminiKey) {
      return NextResponse.json({
        tags: ['AI 키 미설정'],
        severity: 1,
        description: 'GOOGLE_GEMINI_KEY를 .env.local에 설정해주세요',
      })
    }

    const imageRes = await fetch(imageUrl)
    const imageBuffer = await imageRes.arrayBuffer()
    const base64 = Buffer.from(imageBuffer).toString('base64')
    const mimeType = imageRes.headers.get('content-type') || 'image/jpeg'

    const prompt = `이 이미지를 분석해주세요. 쓰레기 무단투기, 위험한 시설물, 환경 문제 등이 보이면 알려주세요.
아래 JSON 형식으로만 응답해주세요 (다른 말 없이 JSON만):
{
  "tags": ["관련 태그들", "예: 쓰레기봉투, 플라스틱, 가로등고장"],
  "severity": 1에서 3까지의 심각도 (1: 낮음, 2: 보통, 3: 심각),
  "description": "30자 이내의 간단한 설명"
}`

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inlineData: { mimeType, data: base64 } },
            ],
          }],
          generationConfig: {
            temperature: 0.3,
            responseMimeType: 'application/json',
          },
        }),
      },
    )

    const data = await res.json()

    if (data.error) {
      console.error('Gemini API error:', data.error)
      return NextResponse.json({
        tags: ['분석 중 오류'],
        severity: 1,
        description: data.error.message || '일시적 오류',
      })
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
    const parsed = JSON.parse(text)

    return NextResponse.json({
      tags: parsed.tags || [],
      severity: parsed.severity || 1,
      description: parsed.description || '',
    })
  } catch (err) {
    console.error('AI analysis error:', err)
    return NextResponse.json({ tags: [], severity: 1, description: '분석 실패' })
  }
}
