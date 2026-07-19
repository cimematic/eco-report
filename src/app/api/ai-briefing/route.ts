import { NextResponse } from 'next/server'

const OR_API = 'https://openrouter.ai/api/v1/chat/completions'
const MODEL = 'tencent/hy3:free'

export async function POST(req: Request) {
  let reports: any[] = [], foodShares: any[] = []
  try {
    const body = await req.json()
    reports = body.reports || []
    foodShares = body.foodShares || []
    const question = body.question?.trim() || ''

    const trashCount = reports.filter((r: any) => r.type === 'trash' && r.status === 'open').length
    const blindspotCount = reports.filter((r: any) => r.type === 'blindspot' && r.status === 'open').length
    const foodCount = foodShares.filter((f: any) => f.status === 'available').length

    const apiKey = process.env.OPENROUTER_API_KEY
    const hasApiKey = apiKey && apiKey.startsWith('sk-or-')

    if (!hasApiKey) {
      const fallbackSummary = question
        ? `죄송합니다. AI 키가 설정되지 않아 질문에 답변할 수 없습니다.`
        : `오늘의 리포트입니다. 쓰레기 제보 ${trashCount}건, 사각지대 ${blindspotCount}건, 음식 나눔 ${foodCount}건이 등록되었습니다.`
      return NextResponse.json({
        summary: fallbackSummary,
        trashCount, blindspotCount, foodCount,
        topReporter: null, hotDistrict: null, tips: null,
        model: null,
      })
    }

    const today = new Date().toLocaleDateString('ko-KR', {
      year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
    })

    const hasData = reports.length > 0 || foodShares.length > 0
    const dataSection = hasData
      ? `오늘은 ${today}입니다. 현재까지 수집된 데이터입니다:
- 쓰레기 제보 ${trashCount}건
- 사각지대 제보 ${blindspotCount}건
- 음식 나눔 ${foodCount}건
- 제보 목록: ${JSON.stringify(reports.slice(0, 30))}
- 음식 나눔 목록: ${JSON.stringify(foodShares.slice(0, 15))}`
      : `오늘은 ${today}입니다. 아직 등록된 제보 데이터가 없습니다.`

    const prompt = question
      ? `${dataSection}

사용자의 질문: "${question}"

위 데이터가 있다면 데이터를 바탕으로 답변하고, 질문이 데이터와 무관한 일반적인 질문(환경, 분리수거, 생활 팁 등)이라면 당신의 일반 지식을 활용해 친근하게 답변해주세요.
데이터가 없는 경우 "데이터가 없어 정확히 말씀드리기는 어렵지만"이라고 먼저 말한 후 일반 지식으로 답변해주세요.

JSON 형식으로만 응답해주세요:
{
  "summary": "2~3문장의 친근한 답변"
}`
      : `${dataSection}

위 데이터를 바탕으로 아래 JSON 형식으로만 응답해주세요 (다른 말 없이 JSON만):
{
  "summary": "오늘의 제보를 요약한 2~3문장, 친근한 말투로",
  "topReporter": "가장 많이 제보한 사람의 닉네임 (없으면 null)",
  "hotDistrict": "가장 이슈가 된 동네 (없으면 null)",
  "tips": "환경 관련 실천 팁 한 문장"
}`

    const res = await fetch(OR_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    })

    const data = await res.json()

    if (data.error) {
      console.error('OpenRouter error:', data.error)
      return NextResponse.json({
        summary: `데이터 분석 중입니다. 쓰레기 ${trashCount}건, 사각지대 ${blindspotCount}건, 음식나눔 ${foodCount}건이 등록되었습니다. (AI: ${data.error.message || '일시적 오류'})`,
        trashCount, blindspotCount, foodCount,
        topReporter: null, hotDistrict: null, tips: null,
        model: MODEL,
      })
    }

    const text = data?.choices?.[0]?.message?.content || '{}'
    const cleaned = text.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '')
    const parsed = JSON.parse(cleaned)

    return NextResponse.json({
      summary: parsed.summary || `오늘의 리포트입니다. 쓰레기 ${trashCount}건, 사각지대 ${blindspotCount}건, 음식나눔 ${foodCount}건이 등록되었습니다.`,
      trashCount, blindspotCount, foodCount,
      topReporter: parsed.topReporter || null,
      hotDistrict: parsed.hotDistrict || null,
      tips: parsed.tips || null,
      model: MODEL,
    })
  } catch (err) {
    console.error('Briefing error:', err)
    return NextResponse.json({
      summary: `오늘의 리포트입니다. 쓰레기 ${reports?.filter((r: any) => r.type === 'trash').length || 0}건, 사각지대 ${reports?.filter((r: any) => r.type === 'blindspot').length || 0}건, 음식나눔 ${foodShares?.filter((f: any) => f.status === 'available').length || 0}건이 등록되었습니다.`,
      trashCount: reports?.filter((r: any) => r.type === 'trash').length || 0,
      blindspotCount: reports?.filter((r: any) => r.type === 'blindspot').length || 0,
      foodCount: foodShares?.filter((f: any) => f.status === 'available').length || 0,
      topReporter: null, hotDistrict: null, tips: null,
      model: MODEL,
    })
  }
}
