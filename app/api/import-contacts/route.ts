import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { fileContent, fileType, userId } = await request.json()

    if(!fileContent) return NextResponse.json({error:'파일 내용이 없어요'},{status:400})
    if(!userId) return NextResponse.json({error:'로그인이 필요해요'},{status:401})

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    )

    let contacts: any[] = []

    if(fileType==='vcf') {
      const cards = fileContent.split(/BEGIN:VCARD/i).filter((c:string) => c.trim())
      for(const card of cards) {
        const contact: any = {}
        const lines = card.split(/\r?\n/)
        for(const line of lines) {
          const colonIdx = line.indexOf(':')
          if(colonIdx < 0) continue
          const key = line.slice(0, colonIdx).split(';')[0].toUpperCase().trim()
          const value = line.slice(colonIdx + 1).trim()
          if(!value) continue
          if(key==='FN') contact.name = value
          else if(key==='TEL') {
            let p = value.replace(/[^\d+]/g,'')
            p = p.replace(/^\+82/,'0').replace(/^82/,'0')
            if(p.startsWith('10')&&p.length===10) p='0'+p
            p = p.replace(/(\d{3})(\d{3,4})(\d{4})/,'$1-$2-$3')
            if(!contact.phone||p.includes('010')) contact.phone=p
          }
          else if(key==='EMAIL'&&!contact.email) contact.email=value
          else if(key==='ADR') contact.address=value.split(';').filter(Boolean).join(' ').trim()
          else if(key==='NOTE') contact.memo=value.replace(/\\n/g,'\n')
        }
        if(contact.name) contacts.push(contact)
      }
    } else {
      const lines = fileContent.split(/\r?\n/).filter((l:string)=>l.trim())
      if(lines.length>=2){
        const headers = lines[0].split(',').map((h:string)=>h.replace(/"/g,'').trim().toLowerCase())
        const map:Record<string,string>={
          '이름':'name','name':'name','성명':'name',
          '전화번호':'phone','phone':'phone','휴대전화':'phone','mobile':'phone',
          '이메일':'email','email':'email',
          '주소':'address','address':'address',
          '메모':'memo','note':'memo','notes':'memo',
        }
        for(let i=1;i<lines.length;i++){
          const values=lines[i].split(',')
          const contact:any={}
          headers.forEach((h:string,idx:number)=>{
            const field=map[h]
            if(field&&values[idx]){
              let val=values[idx].replace(/^"|"$/g,'').trim()
              if(field==='phone'){
                val=val.replace(/[^\d+]/g,'').replace(/^\+82/,'0').replace(/^82/,'0')
                val=val.replace(/(\d{3})(\d{3,4})(\d{4})/,'$1-$2-$3')
              }
              if(val) contact[field]=val
            }
          })
          if(contact.name) contacts.push(contact)
        }
      }
    }

    if(contacts.length===0) return NextResponse.json({error:'연락처를 찾을 수 없어요. 파일 형식을 확인해주세요.'},{status:400})

    const inserts=contacts.map(c=>({
      salesperson_id:userId,
      name:c.name,
      phone:c.phone||null,
      email:c.email||null,
      address:c.address||null,
      memo:c.memo||null,
      stage:'first_visit',
    }))

    const {data,error}=await supabase.from('clients').insert(inserts).select()
    if(error) return NextResponse.json({error:'DB 저장 오류: '+error.message},{status:500})

    return NextResponse.json({success:true,count:data?.length||0,contacts:contacts.slice(0,5)})
  } catch(e:any) {
    return NextResponse.json({error:'서버 오류: '+e.message},{status:500})
  }
}
