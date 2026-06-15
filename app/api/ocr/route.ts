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

  // 전화번호 추출 (+8210 → 010 자동변환)
  const phoneMatch = text.match(/(\+82[-.\s]?10[-.\s]?\d{3,4}[-.\s]?\d{4}|010[-.\s]?\d{3,4}[-.\s]?\d{4})/)
  let phone = ''
  if(phoneMatch) {
    phone = phoneMatch[0].replace(/[-.\s]/g,'')
    phone = phone.replace(/^\+8210/, '010')
    phone = phone.replace(/(\d{3})(\d{3,4})(\d{4})/, '$1-$2-$3')
  }

  // 이메일 추출
  const emailMatch = text.match(/[\w.+-]+@[\w.-]+\.\w+/)
  const email = emailMatch ? emailMatch[0] : ''

  // 한글 이름 추출 (2-4글자)
  let name = ''
  for(const line of lines) {
    if(line.match(/^[가-힣]{2,4}$/)) { name = line; break }
  }
  // 한글 이름 없으면 영문 이름 찾아서 번역 API 호출
  if(!name) {
    for(const line of lines) {
      if(line.match(/^[A-Z][a-z]+ [A-Z][a-z]+$/) || line.match(/^[A-Z][A-Z ]+$/)) {
        name = line; break
      }
    }
  }
  if(!name) {
    name = lines.find((l:string) => l.length <= 10 && !l.includes('@') && !l.match(/\d{3}/) && !l.includes('.')) || lines[0] || ''
  }

  // 주소 추출
  const addressMatch = lines.find((l:string) =>
    l.includes('시') || l.includes('구') || l.includes('동') ||
    l.includes('로') || l.includes('길') || l.includes('층')
  )

  return NextResponse.json({
    name: name.trim(),
    phone,
    email,
    address: addressMatch || '',
    raw: text
  })
}
