import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  let reports: any[] = [], foodShares: any[] = []
  try {
    const body = await req.json()
    reports = body.reports || []
    foodShares = body.foodShares || []

    const trashCount = reports.filter((r: any) => r.type === 'trash' && r.status === 'open').length
    const blindspotCount = reports.filter((r: any) => r.type === 'blindspot' && r.status === 'open').length
    const foodCount = foodShares.filter((f: any) => f.status === 'available').length

    const geminiKey = process.env.GOOGLE_GEMINI_KEY
    if (!geminiKey) {
      return NextResponse.json({
        summary: `오늘의 리포트입니다. 쓰레기 제보 ${trashCount}건, 사각지대 ${blindspotCount}건, 음식 나눔 ${foodCount}건이 등록되었습니다.`,
        trashCount,
        blindspotCount,
        foodCount,
        topReporter: 'AI 키 미설정',
        hotDistrict: '분석 불가',
        tips: 'GOOGLE_GEMINI_KEY를 .env.local에 설정해주세요',
      })
    }

    const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })

    const prompt = `오늘은 ${today}입니다. 다음은 오늘의 제보 및 나눔 데이터입니다:

- 쓰레기 무단투기 제보: ${trashCount}건
- 사각지대 제보: ${blindspotCount}건
- 음식 나눔: ${foodCount}건

제보 목록:
${JSON.stringify(reports.slice(0, 20))}

음식 나눔 목록:
${JSON.stringify(foodShares.slice(0, 10))}

위 데이터를 바탕으로 아래 JSON 형식으로만 응답해주세요 (다른 말 없이 JSON만):
{
  "summary": "데이터를 요약한 2~3문장, 친근한 말투로",
  "topReporter": "가장 많이 제보한 사람의 닉네임 (없으면 null)",
  "hotDistrict": "가장 이슈가 된 동네 (없으면 null)",
  "tips": "환경 관련 실천 팁 한 문장"
}`

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            responseMimeType: 'application/json',
          },
        }),
      },
    )

    const data = await res.json()

    if (data.error) {
      console.error('Gemini API error:', data.error)
      return NextResponse.json({
        summary: `데이터 분석 중입니다. 쓰레기 ${trashCount}건, 사각지대 ${blindspotCount}건, 음식나눔 ${foodCount}건이 등록되었습니다. (AI: ${data.error.message || '일시적 오류'})`,
        trashCount,
        blindspotCount,
        foodCount,
        topReporter: null,
        hotDistrict: null,
        tips: null,
      })
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
    const parsed = JSON.parse(text)

    return NextResponse.json({
      summary: parsed.summary || `오늘의 리포트입니다. 쓰레기 ${trashCount}건, 사각지대 ${blindspotCount}건, 음식나눔 ${foodCount}건이 등록되었습니다.`,
      trashCount,
      blindspotCount,
      foodCount,
      topReporter: parsed.topReporter || null,
      hotDistrict: parsed.hotDistrict || null,
      tips: parsed.tips || null,
    })
  } catch (err) {
    console.error('Briefing error:', err)
    return NextResponse.json({
      summary: `오늘의 리포트입니다. 쓰레기 ${reports?.filter((r: any) => r.type === 'trash').length || 0}건, 사각지대 ${reports?.filter((r: any) => r.type === 'blindspot').length || 0}건, 음식나눔 ${foodShares?.filter((f: any) => f.status === 'available').length || 0}건이 등록되었습니다.`,
      trashCount: reports?.filter((r: any) => r.type === 'trash').length || 0,
      blindspotCount: reports?.filter((r: any) => r.type === 'blindspot').length || 0,
      foodCount: foodShares?.filter((f: any) => f.status === 'available').length || 0,
      topReporter: null,
      hotDistrict: null,
      tips: null,
    })
  }
}
