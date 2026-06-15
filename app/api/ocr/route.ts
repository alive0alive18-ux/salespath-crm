import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { image } = await request.json()

  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_VISION_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [{
          image: { content: image },
          features: [{ type: 'TEXT_DETECTION', maxResults: 1 }]
        }]
      })
    }
  )

  const data = await response.json()
  const text = data.responses?.[0]?.fullTextAnnotation?.text || ''

  // 이름, 전화번호, 이메일 추출
  const phoneMatch = text.match(/(\d{2,3}[-.\s]?\d{3,4}[-.\s]?\d{4})/)
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/)
  const lines = text.split('\n').filter((l:string) => l.trim())

  // 이름 추출 (보통 첫 번째 또는 두 번째 줄)
  const name = lines[0] || ''

  return NextResponse.json({
    name: name.trim(),
    phone: phoneMatch ? phoneMatch[0].replace(/[-.\s]/g, '').replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3') : '',
    email: emailMatch ? emailMatch[0] : '',
    raw: text
  })
}
