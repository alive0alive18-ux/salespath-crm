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

  // =====================
  // 1. 핸드폰 번호 추출 (010만, +8210/8210 → 010 변환)
  // =====================
  let phone = ''
  // M 010, Mobile 010, 핸드폰 등 접두어 패턴
  const mobilePatterns = [
    /[Mm](?:obile)?\.?\s*:?\s*(\+?82[-.\s]?0?10[-.\s]?\d{3,4}[-.\s]?\d{4})/,
    /[Mm](?:obile)?\.?\s*:?\s*(010[-.\s]?\d{3,4}[-.\s]?\d{4})/,
    /핸드폰\s*:?\s*(010[-.\s]?\d{3,4}[-.\s]?\d{4})/,
    /휴대폰\s*:?\s*(010[-.\s]?\d{3,4}[-.\s]?\d{4})/,
    /(\+82[-.\s]?10[-.\s]?\d{3,4}[-.\s]?\d{4})/,
    /(010[-.\s]?\d{3,4}[-.\s]?\d{4})/,
  ]
  for(const pattern of mobilePatterns) {
    const match = text.match(pattern)
    if(match) {
      let p = match[1] || match[0]
      p = p.replace(/\+82[-.\s]?0?/, '0')
        .replace(/^82[-.\s]?0?/, '0')
        .replace(/[^\d]/g, '')
      if(p.startsWith('10') && p.length === 10) p = '0' + p
      phone = p.replace(/(\d{3})(\d{3,4})(\d{4})/, '$1-$2-$3')
      break
    }
  }

  // =====================
  // 2. 이메일 추출
  // =====================
  const emailMatch = text.match(/[\w.+-]+@[\w.-]+\.\w+/)
  const email = emailMatch ? emailMatch[0] : ''

  // =====================
  // 3. 이름 추출 (한국 명함 다양한 패턴)
  // =====================
  const JOB_TITLES = ['대표','이사','부장','차장','과장','대리','사원','팀장','실장','본부장','상무','전무','사장','회장','주임','선임','수석','매니저','컨설턴트','연구원','교수','원장','소장','감독']
  
  let name = ''
  
  for(const line of lines) {
    // 패턴1: "조 원 준 과장" 또는 "조원준 과장" - 직함 앞에 한글 이름
    for(const title of JOB_TITLES) {
      const m = line.match(new RegExp(`([가-힣]\\s?[가-힣]\\s?[가-힣]?)\\s*${title}`))
      if(m) { name = m[1].replace(/\s/g, ''); break }
    }
    if(name) break

    // 패턴2: "Won-Jun Cho | 조 원 준" - | 뒤에 한글
    const afterPipe = line.match(/[|｜]\s*([가-힣]\s?[가-힣]\s?[가-힣]?)/)
    if(afterPipe) { name = afterPipe[1].replace(/\s/g, ''); break }

    // 패턴3: "조원준 | Won-Jun" - | 앞에 한글
    const beforePipe = line.match(/([가-힣]{2,4})\s*[|｜]/)
    if(beforePipe) { name = beforePipe[1]; break }

    // 패턴4: 순수 한글 2-4글자
    if(line.match(/^[가-힣]{2,4}$/)) { name = line; break }

    // 패턴5: 한글 이름 + 공백 포함 (조 원 준)
    const spaced = line.match(/^([가-힣]\s[가-힣]\s?[가-힣]?)$/)
    if(spaced) { name = spaced[1].replace(/\s/g, ''); break }
  }

  // =====================
  // 4. 주소 추출
  // =====================
  let address = ''
  const addressKeywords = ['서울', '경기', '부산', '인천', '대구', '대전', '광주', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주']
  
  for(const line of lines) {
    // 한국 주소 패턴
    if(addressKeywords.some(k => line.includes(k)) && 
       (line.includes('구') || line.includes('로') || line.includes('길') || line.includes('동'))) {
      address = line
      break
    }
  }

  return NextResponse.json({
    name: name.trim(),
    phone,
    email,
    address,
    raw: text
  })
}
