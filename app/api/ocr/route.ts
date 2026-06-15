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
  const lines = text.split('\n').map((l:string) => l.trim()).filter((l:string) => l)

  // 전화번호 추출
  const phoneMatch = text.match(/(\d{2,3}[-.\s]?\d{3,4}[-.\s]?\d{4})/)
  const phone = phoneMatch ? phoneMatch[0].replace(/[-.\s]/g,'').replace(/(\d{3})(\d{3,4})(\d{4})/,'$1-$2-$3') : ''

  // 이메일 추출
  const emailMatch = text.match(/[\w.+-]+@[\w.-]+\.\w+/)
  const email = emailMatch ? emailMatch[0] : ''

  // 이름 추출 (한글 2-4글자 or 영문 이름 패턴)
  let name = ''
  for(const line of lines) {
    const koreanName = line.match(/^[가-힣]{2,4}$/)
    const englishName = line.match(/^[A-Z][a-z]+ [A-Z][a-z]+$/)
    if(koreanName || englishName) {
      name = line
      break
    }
  }
  // 이름 못 찾으면 첫 번째 짧은 줄
  if(!name) {
    name = lines.find((l:string) => l.length <= 10 && !l.includes('@') && !l.match(/\d{4}/)) || lines[0] || ''
  }

  // 회사명 추출 (주식회사, ㈜, Corp, Inc 등 포함된 줄)
  const companyMatch = lines.find((l:string) =>
    l.includes('주식회사') || l.includes('㈜') || l.includes('Corp') ||
    l.includes('Inc') || l.includes('Co.,') || l.includes('그룹') || l.includes('기업')
  )

  return NextResponse.json({
    name: name.trim(),
    phone,
    email,
    company: companyMatch || '',
    raw: text
  })
}
