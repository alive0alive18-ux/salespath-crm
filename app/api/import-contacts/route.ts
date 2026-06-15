import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

function parseVCF(text: string) {
  const contacts: any[] = []
  const cards = text.split(/BEGIN:VCARD/i).filter(c => c.trim())
  
  for(const card of cards) {
    const contact: any = {}
    const lines = card.split(/\r?\n/)
    
    for(const line of lines) {
      const [key, ...valueParts] = line.split(':')
      const value = valueParts.join(':').trim()
      if(!value) continue
      
      const keyBase = key.split(';')[0].toUpperCase()
      
      switch(keyBase) {
        case 'FN':
          contact.name = value
          break
        case 'N':
          if(!contact.name) {
            const parts = value.split(';')
            contact.name = [parts[1], parts[0]].filter(Boolean).join(' ').trim()
          }
          break
        case 'TEL': {
          let phone = value.replace(/[^\d+]/g, '')
          phone = phone.replace(/^\+82/, '0').replace(/^82/, '0')
          if(phone.startsWith('10')) phone = '0' + phone
          phone = phone.replace(/(\d{3})(\d{3,4})(\d{4})/, '$1-$2-$3')
          if(phone.includes('010') || phone.startsWith('010')) {
            contact.phone = phone
          } else if(!contact.phone) {
            contact.phone = phone
          }
          break
        }
        case 'EMAIL':
          if(!contact.email) contact.email = value
          break
        case 'ADR': {
          const addr = value.split(';').filter(Boolean).join(' ').trim()
          if(addr) contact.address = addr
          break
        }
        case 'NOTE':
          contact.memo = value.replace(/\\n/g, '\n')
          break
        case 'ORG':
          contact.company = value.split(';')[0]
          break
        case 'BDAY':
          contact.birthday = value
          break
      }
    }
    
    if(contact.name) contacts.push(contact)
  }
  
  return contacts
}

function parseCSV(text: string) {
  const lines = text.split(/\r?\n/).filter(l => l.trim())
  if(lines.length < 2) return []
  
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase())
  const contacts: any[] = []
  
  // 헤더 매핑 (삼성/아이폰/구글/일반 CSV 모두 대응)
  const headerMap: Record<string, string> = {
    '이름': 'name', 'name': 'name', '성명': 'name', 'full name': 'name',
    '전화번호': 'phone', 'phone': 'phone', '휴대전화': 'phone', 'mobile': 'phone',
    '이메일': 'email', 'email': 'email', 'e-mail': 'email',
    '주소': 'address', 'address': 'address', '집주소': 'address',
    '메모': 'memo', 'note': 'memo', 'notes': 'memo', '비고': 'memo',
    '회사': 'company', 'company': 'company', '직장': 'company',
    '생일': 'birthday', 'birthday': 'birthday',
  }
  
  for(let i = 1; i < lines.length; i++) {
    const values = lines[i].match(/(".*?"|[^,]+|(?<=,)(?=,)|(?<=,)$|^(?=,))/g) || []
    const contact: any = {}
    
    headers.forEach((header, idx) => {
      const field = headerMap[header]
      if(field && values[idx]) {
        let val = values[idx].replace(/^"|"$/g, '').trim()
        if(field === 'phone') {
          val = val.replace(/[^\d+]/g, '')
          val = val.replace(/^\+82/, '0').replace(/^82/, '0')
          if(val.startsWith('10')) val = '0' + val
          val = val.replace(/(\d{3})(\d{3,4})(\d{4})/, '$1-$2-$3')
        }
        if(val) contact[field] = val
      }
    })
    
    if(contact.name) contacts.push(contact)
  }
  
  return contacts
}

export async function POST(request: Request) {
  try {
    const { fileContent, fileType, userId } = await request.json()
    
    let contacts: any[] = []
    
    if(fileType === 'vcf') {
      contacts = parseVCF(fileContent)
    } else if(fileType === 'csv') {
      contacts = parseCSV(fileContent)
    }
    
    if(contacts.length === 0) {
      return NextResponse.json({ error: '연락처를 찾을 수 없어요' }, { status: 400 })
    }
    
    // Supabase에 저장
    const inserts = contacts.map(c => ({
      salesperson_id: userId,
      name: c.name,
      phone: c.phone || null,
      email: c.email || null,
      address: c.address || null,
      memo: c.memo || null,
      birthday: c.birthday || null,
      stage: 'first_visit',
    }))
    
    const { data, error } = await supabase
      .from('clients')
      .insert(inserts)
      .select()
    
    if(error) throw error
    
    return NextResponse.json({ 
      success: true, 
      count: data?.length || 0,
      contacts: contacts.slice(0, 5) // 미리보기용 5개
    })
  } catch(e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
