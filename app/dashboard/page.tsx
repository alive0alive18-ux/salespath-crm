'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const NAVY    = '#1B2A4A'
const NAVY2   = '#243758'
const NAVY3   = '#6A7E9E'
const CREAM   = '#F8F5F0'
const CREAM2  = '#F2EDE8'
const BORDER  = '#E8E0D5'
const BORDER2 = '#F0EBE4'
const WHITE   = '#FFFFFF'
const TX1     = '#1A1A1A'
const TX2     = '#555550'
const TX3     = '#AAAAAA'
const GOLD    = '#C9A84C'
const GOLD_BG = '#FBF6E8'
const GOLD_TX = '#8B6914'
const GREEN   = '#2D6A4F'; const GREEN_BG = '#F0FAF4'; const GREEN_BD = '#BBF7D0'
const BLUE    = '#1D4ED8'; const BLUE_BG  = '#EFF6FF'; const BLUE_BD  = '#BFDBFE'
const AMBER   = '#92400E'; const AMBER_BG = '#FFFBEB'; const AMBER_BD = '#FDE68A'
const RED     = '#DC2626'

// 전화번호 자동 하이픈
function formatPhone(v: string) {
  const n = v.replace(/\D/g, '')
  if (n.length <= 3) return n
  if (n.length <= 7) return `${n.slice(0,3)}-${n.slice(3)}`
  if (n.length <= 11) return `${n.slice(0,3)}-${n.slice(3,7)}-${n.slice(7)}`
  return `${n.slice(0,3)}-${n.slice(3,7)}-${n.slice(7,11)}`
}

const av = (c=NAVY) => ({ width:36, height:36, borderRadius:'50%', background:c+'15', border:`1px solid ${c}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:500, color:c, flexShrink:0 })
const badge = (c:string, bg:string, bd:string) => ({ fontSize:11, fontWeight:500, padding:'3px 10px', borderRadius:3, color:c, background:bg, border:`1px solid ${bd}`, whiteSpace:'nowrap' as const, letterSpacing:'.02em' })
const btn = (v='def') => ({ padding: v==='sm'?'6px 14px':v==='gold'?'10px 22px':'9px 18px', borderRadius:3, fontSize:13, fontWeight:500, cursor:'pointer', border: v==='gold'?'none':v==='navy'?'none':`1px solid ${BORDER}`, background: v==='gold'?GOLD:v==='navy'?NAVY:'transparent', color: v==='gold'?WHITE:v==='navy'?CREAM:TX2, transition:'all .12s', letterSpacing:'.02em' })
const inp = { background:WHITE, border:`1px solid ${BORDER}`, borderRadius:3, padding:'10px 14px', fontSize:14, color:TX1, outline:'none', width:'100%', boxSizing:'border-box' as const, fontFamily:'inherit' }
const lbl = { fontSize:11, color:TX3, letterSpacing:'.07em', textTransform:'uppercase' as const, marginBottom:6, display:'block', fontWeight:500 }
const card = { background:WHITE, border:`1px solid ${BORDER}`, borderRadius:4, overflow:'hidden', marginBottom:16 }
const cardH = { padding:'14px 20px', borderBottom:`1px solid ${BORDER2}`, fontSize:13, fontWeight:500, color:TX1, display:'flex', alignItems:'center', justifyContent:'space-between', letterSpacing:'.01em' }
const row = { display:'flex', alignItems:'center', padding:'14px 20px', borderBottom:`1px solid ${BORDER2}`, gap:12 }

function getLabel(note: string) {
  if (note?.includes('감사')) return { label:'감사문자', color:GREEN, bg:GREEN_BG, bd:GREEN_BD }
  if (note?.includes('1년')) return { label:'1년 점검', color:BLUE, bg:BLUE_BG, bd:BLUE_BD }
  if (note?.includes('2년')) return { label:'2년 점검', color:BLUE, bg:BLUE_BG, bd:BLUE_BD }
  if (note?.includes('3년')) return { label:'3년 점검', color:BLUE, bg:BLUE_BG, bd:BLUE_BD }
  if (note?.includes('팔로')) return { label:'팔로업', color:AMBER, bg:AMBER_BG, bd:AMBER_BD }
  return { label:'연락', color:GOLD_TX, bg:GOLD_BG, bd:GOLD+'60' }
}

function ClientDetail({ client, onClose, onUpdate }: any) {
  const supabase = createClient()
  const [tab, setTab] = useState<'info'|'vehicle'|'history'|'estimates'>('info')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [note, setNote] = useState('')
  const [noteDate, setNoteDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState<any[]>([])
  const [estimates, setEstimates] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({
    name:client.name||'', phone:client.phone||'', email:client.email||'',
    address:client.address||'', contact_place:client.contact_place||'',
    previous_car:client.previous_car||'', memo:client.memo||'',
    car_model:client.car_model||'', delivery_date:client.delivery_date||'',
    car_year:client.car_year||'', car_color:client.car_color||'',
    car_number:client.car_number||'', consultation_date:client.consultation_date||'',
  })

  useEffect(() => {
    supabase.from('schedules').select('*').eq('client_id',client.id).order('scheduled_date',{ascending:false}).then(({data})=>setNotes(data||[]))
    loadEst()
  }, [client.id])

  const loadEst = async () => {
    const {data} = await supabase.storage.from('estimates').list(client.id,{sortBy:{column:'created_at',order:'desc'}})
    setEstimates(data||[])
  }
  const uploadEst = async (e:React.ChangeEvent<HTMLInputElement>) => {
    const file=e.target.files?.[0]; if(!file) return
    setUploading(true)
    await supabase.storage.from('estimates').upload(`${client.id}/${Date.now()}_${file.name}`,file)
    await loadEst(); setUploading(false)
  }
  const getUrl = (name:string) => supabase.storage.from('estimates').getPublicUrl(`${client.id}/${name}`).data.publicUrl
  const delEst = async (name:string) => { await supabase.storage.from('estimates').remove([`${client.id}/${name}`]); await loadEst() }

  const save = async () => {
    setSaving(true)
    const u:any = {name:form.name,phone:form.phone||null,email:form.email||null,address:form.address||null,contact_place:form.contact_place||null,previous_car:form.previous_car||null,memo:form.memo||null,car_model:form.car_model||null,car_year:form.car_year||null,car_color:form.car_color||null,car_number:form.car_number||null}
    if(form.delivery_date) u.delivery_date=form.delivery_date
    if(form.consultation_date) u.consultation_date=form.consultation_date
    const {data} = await supabase.from('clients').update(u).eq('id',client.id).select()
    if(data) onUpdate(data[0]); setEditing(false); setSaving(false)
  }
  const addNote = async () => {
    if(!note.trim()) return
    const {data} = await supabase.from('schedules').insert({client_id:client.id,type:'inspection',scheduled_date:noteDate,is_contacted:true,note}).select()
    if(data) setNotes(p=>[data[0],...p]); setNote(''); setNoteDate(new Date().toISOString().split('T')[0])
  }

  const tabs = [{id:'info',l:'기본 정보'},{id:'vehicle',l:'차량 정보'},{id:'history',l:'연락 히스토리'},{id:'estimates',l:'견적서'}]

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(27,42,74,0.6)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}} onClick={onClose}>
      <div style={{background:WHITE,borderRadius:6,width:640,maxHeight:'90vh',overflow:'hidden',display:'flex',flexDirection:'column',boxShadow:'0 24px 80px rgba(27,42,74,0.2)'}} onClick={e=>e.stopPropagation()}>
        <div style={{padding:'22px 28px',borderBottom:`1px solid ${BORDER}`,display:'flex',alignItems:'center',justifyContent:'space-between',background:CREAM}}>
          <div style={{display:'flex',alignItems:'center',gap:14}}>
            <div style={{...av(NAVY),width:50,height:50,fontSize:18}}>{client.name?.[0]||'?'}</div>
            <div>
              <div style={{fontSize:18,fontWeight:500,color:TX1,letterSpacing:'-.01em'}}>{client.name}</div>
              <div style={{fontSize:13,color:TX3,marginTop:3}}>{client.phone||'전화번호 없음'}</div>
            </div>
          </div>
          <div style={{display:'flex',gap:8}}>
            {!editing&&tab!=='estimates'&&tab!=='history'&&<button style={btn('navy')} onClick={()=>setEditing(true)}>수정</button>}
            {editing&&<><button style={btn('gold')} onClick={save} disabled={saving}>{saving?'저장중...':'저장'}</button><button style={btn()} onClick={()=>setEditing(false)}>취소</button></>}
            <button style={{...btn(),fontSize:18,padding:'4px 12px',color:TX3}} onClick={onClose}>✕</button>
          </div>
        </div>
        <div style={{display:'flex',borderBottom:`1px solid ${BORDER}`,background:WHITE}}>
          {tabs.map(t=>(
            <div key={t.id} onClick={()=>{setTab(t.id as any);setEditing(false)}} style={{flex:1,padding:'13px',textAlign:'center',fontSize:13,fontWeight:500,color:tab===t.id?NAVY:TX3,borderBottom:tab===t.id?`2px solid ${NAVY}`:'2px solid transparent',cursor:'pointer',transition:'all .12s',letterSpacing:'.01em'}}>
              {t.l}
            </div>
          ))}
        </div>
        <div style={{flex:1,overflowY:'auto',padding:'24px 28px',background:CREAM}}>
          {tab==='info'&&(
            editing?(
              <div style={{background:WHITE,borderRadius:4,padding:22,border:`1px solid ${BORDER}`}}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                  {[{k:'name',l:'이름',p:'홍길동'},{k:'email',l:'이메일',p:'이메일 주소'},{k:'contact_place',l:'최초 컨택 장소',p:'전시장 방문'},{k:'address',l:'고객 주소',p:'서울시 강남구...',full:true},{k:'previous_car',l:'기존 차량',p:'BMW 5시리즈'},{k:'consultation_date',l:'최초 상담일',p:'',type:'date'}].map((f:any)=>(
                    <div key={f.k} style={f.full?{gridColumn:'1/-1'}:{}}>
                      <label style={lbl}>{f.l}</label>
                      <input style={inp} type={f.type||'text'} placeholder={f.p} value={(form as any)[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} />
                    </div>
                  ))}
                  <div>
                    <label style={lbl}>전화번호</label>
                    <input style={inp} placeholder="010-0000-0000" value={form.phone} onChange={e=>setForm(p=>({...p,phone:formatPhone(e.target.value)}))} />
                  </div>
                  <div style={{gridColumn:'1/-1'}}>
                    <label style={lbl}>메모</label>
                    <textarea style={{...inp,height:80,resize:'none' as const}} placeholder="특이사항 메모..." value={form.memo} onChange={e=>setForm(p=>({...p,memo:e.target.value}))} />
                  </div>
                </div>
              </div>
            ):(
              <div style={{background:WHITE,borderRadius:4,border:`1px solid ${BORDER}`,overflow:'hidden'}}>
                {[{l:'이름',v:client.name},{l:'전화번호',v:client.phone||'—'},{l:'이메일',v:client.email||'—'},{l:'최초 컨택 장소',v:client.contact_place||'—'},{l:'고객 주소',v:client.address||'—'},{l:'기존 차량',v:client.previous_car||'—'},{l:'최초 상담일',v:client.consultation_date||'—'},{l:'등록일',v:client.created_at?new Date(client.created_at).toLocaleDateString('ko-KR'):'—'}].map((r,i,arr)=>(
                  <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'15px 22px',borderBottom:i<arr.length-1?`1px solid ${BORDER2}`:'none'}}>
                    <span style={{fontSize:13,color:TX3,fontWeight:500,letterSpacing:'.02em'}}>{r.l}</span>
                    <span style={{fontSize:14,color:TX1,fontWeight:500}}>{r.v}</span>
                  </div>
                ))}
                {client.memo&&<div style={{padding:'15px 22px',background:CREAM,borderTop:`1px solid ${BORDER}`}}><div style={{fontSize:11,color:TX3,marginBottom:6,letterSpacing:'.06em',textTransform:'uppercase'}}>메모</div><div style={{fontSize:14,color:TX2,lineHeight:1.7}}>{client.memo}</div></div>}
              </div>
            )
          )}
          {tab==='vehicle'&&(
            editing?(
              <div style={{background:WHITE,borderRadius:4,padding:22,border:`1px solid ${BORDER}`}}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                  <div style={{gridColumn:'1/-1'}}><label style={lbl}>차량 모델</label><input style={inp} placeholder="E 350 4MATIC" value={form.car_model} onChange={e=>setForm(p=>({...p,car_model:e.target.value}))} /></div>
                  <div><label style={lbl}>차량 연식</label><input style={inp} placeholder="2024" value={form.car_year} onChange={e=>setForm(p=>({...p,car_year:e.target.value}))} /></div>
                  <div><label style={lbl}>차량 색상</label><input style={inp} placeholder="옵시디안 블랙" value={form.car_color} onChange={e=>setForm(p=>({...p,car_color:e.target.value}))} /></div>
                  <div><label style={lbl}>차량 번호</label><input style={inp} placeholder="12가 3456" value={form.car_number} onChange={e=>setForm(p=>({...p,car_number:e.target.value}))} /></div>
                  <div><label style={lbl}>차량 인도일</label><input style={inp} type="date" value={form.delivery_date} onChange={e=>setForm(p=>({...p,delivery_date:e.target.value}))} /></div>
                </div>
              </div>
            ):(
              <div style={{background:WHITE,borderRadius:4,border:`1px solid ${BORDER}`,overflow:'hidden'}}>
                {[{l:'차량 모델',v:client.car_model||'—'},{l:'차량 연식',v:client.car_year||'—'},{l:'차량 색상',v:client.car_color||'—'},{l:'차량 번호',v:client.car_number||'—'},{l:'차량 인도일',v:client.delivery_date||'—'}].map((r,i,arr)=>(
                  <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'15px 22px',borderBottom:i<arr.length-1?`1px solid ${BORDER2}`:'none'}}>
                    <span style={{fontSize:13,color:TX3,fontWeight:500,letterSpacing:'.02em'}}>{r.l}</span>
                    <span style={{fontSize:14,color:TX1,fontWeight:500}}>{r.v}</span>
                  </div>
                ))}
                {!client.delivery_date&&<div style={{padding:'15px 22px',background:GOLD_BG,borderTop:`1px solid ${BORDER}`}}><div style={{fontSize:13,color:GOLD_TX,letterSpacing:'.01em'}}>💡 차량 인도일을 입력하면 감사문자·정기점검 알림이 자동 생성돼요!</div></div>}
              </div>
            )
          )}
          {tab==='history'&&(
            <div>
              <div style={{background:WHITE,borderRadius:4,border:`1px solid ${BORDER}`,padding:20,marginBottom:16}}>
                <label style={lbl}>연락 내용 추가</label>
                <input style={{...inp,marginBottom:10}} type="date" value={noteDate} onChange={e=>setNoteDate(e.target.value)} />
                <div style={{display:'flex',gap:8}}>
                  <input style={{...inp,flex:1}} placeholder="통화 내용, 방문 메모 등..." value={note} onChange={e=>setNote(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addNote()} />
                  <button style={btn('navy')} onClick={addNote}>추가</button>
                </div>
              </div>
              <div style={{background:WHITE,borderRadius:4,border:`1px solid ${BORDER}`,overflow:'hidden'}}>
                {notes.length===0&&<div style={{padding:'32px',textAlign:'center',color:TX3,fontSize:14}}>연락 기록이 없어요.</div>}
                {notes.map((n:any,i:number)=>(
                  <div key={n.id} style={{padding:'15px 22px',borderBottom:i===notes.length-1?'none':`1px solid ${BORDER2}`}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                      <span style={{fontSize:12,color:GOLD_TX,fontWeight:600,letterSpacing:'.04em'}}>📞 연락</span>
                      <span style={{fontSize:12,color:TX3}}>{n.scheduled_date}</span>
                    </div>
                    {n.note&&<div style={{fontSize:14,color:TX2,lineHeight:1.6}}>{n.note}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab==='estimates'&&(
            <div>
              <label style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'24px',border:`2px dashed ${BORDER}`,borderRadius:4,cursor:'pointer',color:TX3,fontSize:14,background:WHITE,marginBottom:16,letterSpacing:'.02em'}}>
                {uploading?'업로드 중...':'📎 견적서 이미지 또는 PDF 선택'}
                <input type="file" accept="image/*,.pdf" style={{display:'none'}} onChange={uploadEst} disabled={uploading} />
              </label>
              {estimates.length===0&&<div style={{padding:'32px',textAlign:'center',color:TX3,fontSize:14,background:WHITE,borderRadius:4,border:`1px solid ${BORDER}`}}>저장된 견적서가 없어요.</div>}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                {estimates.map((file:any)=>{
                  const url=getUrl(file.name); const isImg=/\.(jpg|jpeg|png|gif|webp)$/i.test(file.name)
                  return (
                    <div key={file.name} style={{background:WHITE,border:`1px solid ${BORDER}`,borderRadius:4,overflow:'hidden'}}>
                      {isImg?<a href={url} target="_blank" rel="noreferrer"><img src={url} alt="" style={{width:'100%',height:140,objectFit:'cover',display:'block'}} /></a>
                        :<a href={url} target="_blank" rel="noreferrer" style={{display:'flex',alignItems:'center',justifyContent:'center',height:140,color:TX3,fontSize:13,textDecoration:'none'}}>📄 PDF 보기</a>}
                      <div style={{padding:'10px 14px',display:'flex',justifyContent:'space-between',alignItems:'center',borderTop:`1px solid ${BORDER2}`}}>
                        <span style={{fontSize:12,color:TX3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:150}}>{file.name.replace(/^\d+_/,'')}</span>
                        <button style={{fontSize:12,color:RED,background:'transparent',border:'none',cursor:'pointer'}} onClick={()=>delEst(file.name)}>삭제</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const [page, setPage] = useState('dashboard')
  const [user, setUser] = useState<any>(null)
  const [salesperson, setSalesperson] = useState<any>(null)
  const [clients, setClients] = useState<any[]>([])
  const [partners, setPartners] = useState<any[]>([])
  const [referrals, setReferrals] = useState<any[]>([])
  const [schedules, setSchedules] = useState<any[]>([])
  const [weekSchedules, setWeekSchedules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(()=>{
    const load = async () => {
      const {data:{user}} = await supabase.auth.getUser()
      if(!user){router.push('/login');return}
      setUser(user)
      const today = new Date().toISOString().split('T')[0]
      const nextWeek = new Date(Date.now()+7*24*60*60*1000).toISOString().split('T')[0]
      const [sp,c,p,r,sc,wk] = await Promise.all([
        supabase.from('salespersons').select('*').eq('id',user.id).single(),
        supabase.from('clients').select('*').order('created_at',{ascending:false}),
        supabase.from('partners').select('*').order('created_at',{ascending:false}),
        supabase.from('referrals').select('*, clients(name), partners(name)').order('clicked_at',{ascending:false}),
        supabase.from('schedules').select('*, clients(name, car_model)').eq('is_contacted',false).eq('scheduled_date',today),
        supabase.from('schedules').select('*, clients(name, car_model)').eq('is_contacted',false).gt('scheduled_date',today).lte('scheduled_date',nextWeek).order('scheduled_date'),
      ])
      setSalesperson(sp.data)
      setClients(c.data||[]); setPartners(p.data||[]); setReferrals(r.data||[])
      setSchedules(sc.data||[]); setWeekSchedules(wk.data||[]); setLoading(false)
    }
    load()
  },[])

  const signOut = async () => {await supabase.auth.signOut(); router.push('/login')}

  const nav = [
    {id:'dashboard',label:'대시보드'},
    {id:'today',label:'오늘의 리스트'},
    {id:'clients',label:'고객 관리'},
    {id:'referrals',label:'리퍼럴'},
    {id:'partners',label:'제휴업체'},
    {id:'calendar',label:'캘린더'},
  ]

  if(loading) return <div style={{minHeight:'100vh',background:CREAM,display:'flex',alignItems:'center',justifyContent:'center',color:NAVY,fontSize:14,letterSpacing:'.06em'}}>Loading...</div>

  return (
    <div style={{display:'flex',minHeight:'100vh',background:CREAM,fontFamily:"'DM Sans','Apple SD Gothic Neo',system-ui,sans-serif",fontSize:14}}>
      {selectedClient&&<ClientDetail client={selectedClient} onClose={()=>setSelectedClient(null)} onUpdate={(u:any)=>{setClients(p=>p.map(c=>c.id===u.id?u:c));setSelectedClient(u)}} />}
      <aside style={{width:210,background:NAVY,display:'flex',flexDirection:'column',flexShrink:0}}>
        <div style={{padding:'28px 22px 22px',borderBottom:`1px solid ${NAVY2}`}}>
          <div style={{fontSize:10,color:NAVY3,letterSpacing:'.22em',marginBottom:6,textTransform:'uppercase'}}>Sales CRM</div>
          <div style={{fontSize:21,fontWeight:500,color:CREAM,letterSpacing:'.02em'}}>SalesPath</div>
        </div>
        <div style={{paddingTop:8,flex:1}}>
          {nav.map(n=>(
            <div key={n.id}
              style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 22px',fontSize:13,color:page===n.id?CREAM:NAVY3,background:page===n.id?NAVY2:'transparent',borderLeft:page===n.id?`2px solid ${GOLD}`:'2px solid transparent',cursor:'pointer',fontWeight:page===n.id?500:400,transition:'all .12s',userSelect:'none',letterSpacing:'.02em'}}
              onClick={()=>setPage(n.id)}
            >
              {n.label}
              {n.id==='today'&&schedules.length>0&&<span style={{fontSize:10,background:GOLD,color:NAVY,padding:'1px 7px',borderRadius:2,fontWeight:700}}>{schedules.length}</span>}
            </div>
          ))}
        </div>
        <div style={{padding:'20px 22px',borderTop:`1px solid ${NAVY2}`}}>
          <div style={{fontSize:13,color:CREAM,marginBottom:2,fontWeight:500}}>{salesperson?.name || user?.email} 컨설턴트</div>
          <div style={{fontSize:11,color:NAVY3,marginBottom:14}}>{salesperson?.brand || ''}</div>
          <button style={{...btn(),fontSize:12,color:NAVY3,borderColor:NAVY2,width:'100%',letterSpacing:'.04em'}} onClick={signOut}>로그아웃</button>
        </div>
      </aside>
      <main style={{flex:1,padding:'32px 40px',overflowY:'auto',background:CREAM}}>
        {page==='dashboard'&&<Dashboard clients={clients} referrals={referrals} schedules={schedules} weekSchedules={weekSchedules} setPage={setPage} onSelect={setSelectedClient} />}
        {page==='today'&&<Today schedules={schedules} />}
        {page==='clients'&&<Clients clients={clients} setClients={setClients} onSelect={setSelectedClient} />}
        {page==='referrals'&&<Referrals referrals={referrals} />}
        {page==='partners'&&<Partners partners={partners} setPartners={setPartners} />}
        {page==='calendar'&&<Calendar />}
      </main>
    </div>
  )
}

function Dashboard({clients,referrals,schedules,weekSchedules,setPage,onSelect}:any) {
  const converted = referrals.filter((r:any)=>r.status==='converted').length
  const thisMonth = clients.filter((c:any)=>{const d=new Date(c.created_at);const n=new Date();return d.getMonth()===n.getMonth()&&d.getFullYear()===n.getFullYear()}).length
  const getDayLabel = (ds:string) => {
    const diff = Math.round((new Date(ds).getTime()-new Date().getTime())/(1000*60*60*24))
    if(diff===1) return '내일'; if(diff===2) return '모레'; return `${diff}일 후`
  }
  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:28}}>
        <div>
          <div style={{fontSize:24,fontWeight:500,color:TX1,letterSpacing:'-.02em',marginBottom:5}}>대시보드</div>
          <div style={{fontSize:13,color:TX3,letterSpacing:'.01em'}}>{new Date().toLocaleDateString('ko-KR',{year:'numeric',month:'long',day:'numeric',weekday:'long'})} · 오늘 연락 {schedules.length}건</div>
        </div>
        <div style={{background:NAVY,color:GOLD,fontSize:12,fontWeight:500,padding:'8px 16px',borderRadius:3,letterSpacing:'.06em'}}>30일 무료 체험 중</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
        {[
          {l:'전체 고객',v:clients.length,s:`이번달 +${thisMonth}명`,vc:TX1},
          {l:'오늘 연락',v:schedules.length,s:'미완료',vc:schedules.length>0?GOLD:TX1},
          {l:'이번주 예정',v:weekSchedules.length,s:'향후 7일',vc:TX1},
          {l:'리퍼럴 전환',v:converted,s:`총 ${referrals.length}건 중`,vc:converted>0?GREEN:TX1},
        ].map((s,i)=>(
          <div key={i} style={{background:WHITE,border:`1px solid ${BORDER}`,borderRadius:4,padding:'18px 20px'}}>
            <div style={{fontSize:10,color:TX3,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:8,fontWeight:500}}>{s.l}</div>
            <div style={{fontSize:30,fontWeight:400,color:s.vc,letterSpacing:'-.02em'}}>{s.v}</div>
            <div style={{fontSize:12,color:TX3,marginTop:4}}>{s.s}</div>
          </div>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:16,marginBottom:16}}>
        <div style={card}>
          <div style={cardH}>
            <span>오늘의 연락 리스트 <span style={{color:GOLD,fontWeight:700,marginLeft:4}}>{schedules.length}</span></span>
            <span style={{fontSize:12,color:GOLD,cursor:'pointer',fontWeight:500,letterSpacing:'.03em'}} onClick={()=>setPage('today')}>전체 보기 →</span>
          </div>
          {schedules.length===0&&<div style={{padding:'32px',color:TX3,fontSize:14,textAlign:'center'}}>오늘 연락할 고객이 없어요 😊</div>}
          {schedules.map((sc:any,i:number)=>{
            const lb=getLabel(sc.note)
            return (
              <div key={sc.id} style={{...row,borderBottom:i===schedules.length-1?'none':`1px solid ${BORDER2}`,cursor:'pointer'}} onClick={()=>onSelect(sc.clients)}>
                <div style={av(lb.color)}>{sc.clients?.name?.[0]||'?'}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:500,color:TX1,marginBottom:3}}>{sc.clients?.name}</div>
                  <div style={{fontSize:12,color:TX3}}>{sc.clients?.car_model||'차량 미등록'} · {sc.note}</div>
                </div>
                <span style={badge(lb.color,lb.bg,lb.bd)}>{lb.label}</span>
              </div>
            )
          })}
        </div>
        <div>
          <div style={{...card,marginBottom:16}}>
            <div style={cardH}>
              <span>이번주 예정</span>
              <span style={{fontSize:12,color:TX3}}>{weekSchedules.length}건</span>
            </div>
            {weekSchedules.length===0&&<div style={{padding:'24px',color:TX3,fontSize:14,textAlign:'center'}}>예정 없음</div>}
            {weekSchedules.map((sc:any,i:number)=>{
              const lb=getLabel(sc.note)
              return (
                <div key={sc.id} style={{...row,padding:'12px 16px',borderBottom:i===weekSchedules.length-1?'none':`1px solid ${BORDER2}`}}>
                  <div style={{width:7,height:7,borderRadius:'50%',background:lb.color,flexShrink:0}} />
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,color:TX1,fontWeight:500}}>{sc.clients?.name}</div>
                    <div style={{fontSize:11,color:TX3}}>{sc.note}</div>
                  </div>
                  <span style={{fontSize:12,color:TX3}}>{getDayLabel(sc.scheduled_date)}</span>
                </div>
              )
            })}
          </div>
          <div style={card}>
            <div style={cardH}><span>실적 현황</span></div>
            <div style={{padding:'18px 20px'}}>
              {[{l:'계약 목표',v:2,t:5,c:GOLD},{l:'연락 완료율',v:18,t:22,c:GREEN}].map((s,i)=>(
                <div key={i} style={{marginBottom:i===0?16:0}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                    <span style={{fontSize:13,color:TX2}}>{s.l}</span>
                    <span style={{fontSize:13,fontWeight:500,color:TX1}}>{s.v} / {s.t}</span>
                  </div>
                  <div style={{height:2,background:BORDER,borderRadius:2}}>
                    <div style={{height:2,width:`${Math.round(s.v/s.t*100)}%`,background:s.c,borderRadius:2}} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div style={card}>
        <div style={cardH}>
          <span>최근 등록 고객</span>
          <span style={{fontSize:12,color:GOLD,cursor:'pointer',fontWeight:500}} onClick={()=>setPage('clients')}>전체 보기 →</span>
        </div>
        {clients.length===0&&<div style={{padding:'32px',color:TX3,fontSize:14,textAlign:'center'}}>등록된 고객이 없어요.</div>}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)'}}>
          {clients.slice(0,6).map((c:any,i:number)=>(
            <div key={c.id} style={{padding:'16px 20px',borderRight:i%3!==2?`1px solid ${BORDER2}`:'none',borderBottom:i<3?`1px solid ${BORDER2}`:'none',cursor:'pointer'}} onClick={()=>onSelect(c)}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                <div style={av(NAVY)}>{c.name?.[0]||'?'}</div>
                <div>
                  <div style={{fontSize:14,fontWeight:500,color:TX1}}>{c.name}</div>
                  <div style={{fontSize:12,color:TX3}}>{c.phone||'—'}</div>
                </div>
              </div>
              <div style={{fontSize:12,color:TX2}}>{c.car_model||'차량 미등록'}</div>
              <div style={{fontSize:12,color:TX3,marginTop:2}}>{c.delivery_date?`인도일 ${c.delivery_date}`:c.consultation_date?`상담일 ${c.consultation_date}`:'날짜 미입력'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Today({schedules}:any) {
  const supabase = createClient()
  const [done, setDone] = useState<string[]>([])
  const toggle = async (id:string) => {
    setDone(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id])
    await supabase.from('schedules').update({is_contacted:true}).eq('id',id)
  }
  return (
    <div>
      <div style={{fontSize:24,fontWeight:500,color:TX1,letterSpacing:'-.02em',marginBottom:5}}>오늘의 연락 리스트</div>
      <div style={{fontSize:13,color:TX3,marginBottom:26}}>완료 {done.length} / {schedules.length}건</div>
      <div style={card}>
        {schedules.length===0&&<div style={{padding:'48px',color:TX3,fontSize:14,textAlign:'center'}}>오늘 연락할 고객이 없어요 😊</div>}
        {schedules.map((sc:any,i:number)=>{
          const lb=getLabel(sc.note); const ok=done.includes(sc.id)
          return (
            <div key={sc.id} style={{...row,opacity:ok?.5:1,borderBottom:i===schedules.length-1?'none':`1px solid ${BORDER2}`}}>
              <div style={{width:22,height:22,borderRadius:'50%',border:`2px solid ${ok?GREEN:BORDER}`,background:ok?GREEN:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,color:WHITE,flexShrink:0,transition:'all .2s'}} onClick={()=>toggle(sc.id)}>{ok?'✓':''}</div>
              <div style={av(lb.color)}>{sc.clients?.name?.[0]||'?'}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:500,color:TX1,marginBottom:3}}>{sc.clients?.name}</div>
                <div style={{fontSize:12,color:TX3}}>{sc.clients?.car_model} · {sc.note}</div>
              </div>
              <span style={badge(lb.color,lb.bg,lb.bd)}>{lb.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Clients({clients,setClients,onSelect}:any) {
  const supabase = createClient()
  const [search,setSearch] = useState('')
  const [showForm,setShowForm] = useState(false)
  const [form,setForm] = useState({name:'',phone:'',car_model:'',consultation_date:'',address:'',memo:''})
  const [saving,setSaving] = useState(false)
  const filtered = clients.filter((c:any)=>c.name?.includes(search)||c.car_model?.includes(search))

  const save = async () => {
    if(!form.name) return; setSaving(true)
    const {data:{user}} = await supabase.auth.getUser()
    const ins:any = {
      salesperson_id:user?.id,
      name:form.name,
      phone:form.phone||null,
      car_model:form.car_model||null,
      address:form.address||null,
      memo:form.memo||null,
    }
    if(form.consultation_date) ins.consultation_date=form.consultation_date
    const {data} = await supabase.from('clients').insert(ins).select()
    if(data) setClients((p:any)=>[data[0],...p])
    setForm({name:'',phone:'',car_model:'',consultation_date:'',address:'',memo:''}); setShowForm(false); setSaving(false)
  }

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:26}}>
        <div>
          <div style={{fontSize:24,fontWeight:500,color:TX1,letterSpacing:'-.02em',marginBottom:5}}>고객 관리</div>
          <div style={{fontSize:13,color:TX3}}>등록 고객 {clients.length}명</div>
        </div>
        <button style={btn('navy')} onClick={()=>setShowForm(v=>!v)}>{showForm?'✕ 닫기':'+ 고객 등록'}</button>
      </div>

      {showForm&&(
        <div style={{...card,marginBottom:16}}>
          <div style={cardH}><span>신규 고객 등록</span></div>
          <div style={{padding:22,display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            <div><label style={lbl}>이름 *</label><input style={inp} placeholder="홍길동" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} /></div>
            <div>
              <label style={lbl}>전화번호</label>
              <input style={inp} placeholder="010-0000-0000" value={form.phone} onChange={e=>setForm(p=>({...p,phone:formatPhone(e.target.value)}))} />
            </div>
            <div style={{gridColumn:'1/-1'}}><label style={lbl}>차량 모델</label><input style={inp} placeholder="E 350 4MATIC" value={form.car_model} onChange={e=>setForm(p=>({...p,car_model:e.target.value}))} /></div>
            <div style={{gridColumn:'1/-1'}}><label style={lbl}>고객 주소</label><input style={inp} placeholder="서울시 강남구..." value={form.address} onChange={e=>setForm(p=>({...p,address:e.target.value}))} /></div>
            <div style={{gridColumn:'1/-1'}}><label style={lbl}>최초 상담일</label><input style={inp} type="date" value={form.consultation_date} onChange={e=>setForm(p=>({...p,consultation_date:e.target.value}))} /></div>
            <div style={{gridColumn:'1/-1'}}>
              <label style={lbl}>메모</label>
              <textarea style={{...inp,height:72,resize:'none' as const}} placeholder="특이사항 메모..." value={form.memo} onChange={e=>setForm(p=>({...p,memo:e.target.value}))} />
            </div>
            <div style={{gridColumn:'1/-1',display:'flex',gap:8,justifyContent:'flex-end'}}>
              <button style={btn()} onClick={()=>setShowForm(false)}>취소</button>
              <button style={btn('navy')} onClick={save} disabled={saving}>{saving?'저장중...':'저장'}</button>
            </div>
          </div>
        </div>
      )}

      <div style={{marginBottom:14}}><input style={inp} placeholder="이름 또는 차량 모델 검색..." value={search} onChange={e=>setSearch(e.target.value)} /></div>
      <div style={card}>
        <div style={{display:'grid',gridTemplateColumns:'1.5fr 2fr 1.2fr 0.7fr',padding:'12px 20px',background:CREAM2,fontSize:11,color:TX3,letterSpacing:'.07em',textTransform:'uppercase',fontWeight:500,borderBottom:`1px solid ${BORDER}`}}>
          <span>고객</span><span>차량</span><span>상담일</span><span></span>
        </div>
        {filtered.length===0&&<div style={{padding:'48px',color:TX3,fontSize:14,textAlign:'center'}}>등록된 고객이 없어요.</div>}
        {filtered.map((c:any,i:number)=>(
          <div key={c.id} style={{display:'grid',gridTemplateColumns:'1.5fr 2fr 1.2fr 0.7fr',padding:'15px 20px',borderBottom:i===filtered.length-1?'none':`1px solid ${BORDER2}`,alignItems:'center',cursor:'pointer'}} onClick={()=>onSelect(c)}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={av(NAVY)}>{c.name?.[0]||'?'}</div>
              <span style={{fontSize:14,fontWeight:500,color:TX1}}>{c.name}</span>
            </div>
            <span style={{fontSize:13,color:TX2}}>{c.car_model||'—'}</span>
            <span style={{fontSize:13,color:TX3}}>{c.consultation_date||c.delivery_date||'—'}</span>
            <button style={btn('sm')} onClick={e=>{e.stopPropagation();onSelect(c)}}>상세 →</button>
          </div>
        ))}
      </div>
    </div>
  )
}

function Referrals({referrals}:any) {
  const [filter,setFilter] = useState('all')
  const STATUS:Record<string,any> = {pending:{label:'대기중',color:AMBER,bg:AMBER_BG,bd:AMBER_BD},consulting:{label:'상담중',color:BLUE,bg:BLUE_BG,bd:BLUE_BD},converted:{label:'전환완료',color:GREEN,bg:GREEN_BG,bd:GREEN_BD},cancelled:{label:'취소',color:'#888',bg:'#F5F5F5',bd:'#DDD'}}
  const filtered = filter==='all'?referrals:referrals.filter((r:any)=>r.status===filter)
  return (
    <div>
      <div style={{fontSize:24,fontWeight:500,color:TX1,letterSpacing:'-.02em',marginBottom:5}}>리퍼럴 기록</div>
      <div style={{fontSize:13,color:TX3,marginBottom:26}}>추천 링크로 들어온 상담 신청 현황</div>
      <div style={{display:'flex',gap:8,marginBottom:16}}>
        {['all','pending','consulting','converted'].map(t=>(
          <button key={t} onClick={()=>setFilter(t)} style={{padding:'8px 18px',borderRadius:3,fontSize:13,cursor:'pointer',background:filter===t?NAVY:WHITE,color:filter===t?CREAM:TX2,border:`1px solid ${filter===t?NAVY:BORDER}`,fontWeight:filter===t?500:400,letterSpacing:'.02em'}}>
            {t==='all'?'전체':STATUS[t]?.label}
          </button>
        ))}
      </div>
      <div style={card}>
        {filtered.length===0&&<div style={{padding:'48px',color:TX3,fontSize:14,textAlign:'center'}}>리퍼럴 기록이 없어요.</div>}
        {filtered.map((r:any,i:number)=>{
          const m=STATUS[r.status]||STATUS.pending
          return (
            <div key={r.id} style={{display:'grid',gridTemplateColumns:'1.2fr 1.2fr 0.9fr',padding:'15px 20px',borderBottom:i===filtered.length-1?'none':`1px solid ${BORDER2}`,alignItems:'center'}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}><div style={av(NAVY)}>{r.clients?.name?.[0]||'?'}</div><span style={{fontSize:14,fontWeight:500,color:TX1}}>{r.clients?.name}</span></div>
              <span style={{fontSize:13,color:TX2}}>{r.partners?.name}</span>
              <span style={badge(m.color,m.bg,m.bd)}>{m.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Partners({partners,setPartners}:any) {
  const supabase = createClient()
  const [showForm,setShowForm] = useState(false)
  const [form,setForm] = useState({name:'',category:'',phone:'',reward_description:''})
  const [saving,setSaving] = useState(false)
  const save = async () => {
    if(!form.name) return; setSaving(true)
    const {data:{user}} = await supabase.auth.getUser()
    const {data} = await supabase.from('partners').insert({...form,salesperson_id:user?.id}).select()
    if(data) setPartners((p:any)=>[data[0],...p])
    setForm({name:'',category:'',phone:'',reward_description:''}); setShowForm(false); setSaving(false)
  }
  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:26}}>
        <div>
          <div style={{fontSize:24,fontWeight:500,color:TX1,letterSpacing:'-.02em',marginBottom:5}}>제휴업체 관리</div>
          <div style={{fontSize:13,color:TX3}}>직접 등록·수정 가능</div>
        </div>
        <button style={btn('navy')} onClick={()=>setShowForm(v=>!v)}>{showForm?'✕ 닫기':'+ 업체 등록'}</button>
      </div>
      {showForm&&(
        <div style={{...card,marginBottom:16}}>
          <div style={cardH}><span>신규 제휴업체 등록</span></div>
          <div style={{padding:22,display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            <div><label style={lbl}>업체명 *</label><input style={inp} placeholder="프리미엄 광택 강남점" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} /></div>
            <div><label style={lbl}>전화번호</label><input style={inp} placeholder="02-000-0000" value={form.phone} onChange={e=>setForm(p=>({...p,phone:formatPhone(e.target.value)}))} /></div>
            <div><label style={lbl}>업종</label><input style={inp} placeholder="광택·세라믹" value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))} /></div>
            <div><label style={lbl}>리워드 내용</label><input style={inp} placeholder="20% 할인 바우처" value={form.reward_description} onChange={e=>setForm(p=>({...p,reward_description:e.target.value}))} /></div>
            <div style={{gridColumn:'1/-1',display:'flex',gap:8,justifyContent:'flex-end'}}>
              <button style={btn()} onClick={()=>setShowForm(false)}>취소</button>
              <button style={btn('navy')} onClick={save} disabled={saving}>{saving?'저장중...':'저장'}</button>
            </div>
          </div>
        </div>
      )}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        {partners.length===0&&<div style={{color:TX3,fontSize:14,gridColumn:'1/-1',padding:'48px',textAlign:'center',background:WHITE,borderRadius:4,border:`1px solid ${BORDER}`}}>등록된 제휴업체가 없어요.</div>}
        {partners.map((p:any)=>(
          <div key={p.id} style={{background:WHITE,border:`1px solid ${BORDER}`,borderRadius:4,padding:'20px 22px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <div style={av(NAVY)}>제</div>
                <div>
                  <div style={{fontSize:14,fontWeight:500,color:TX1}}>{p.name}</div>
                  <div style={{fontSize:12,color:TX3}}>{p.category}</div>
                </div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:6}}>
                <div style={{width:7,height:7,borderRadius:'50%',background:p.is_active?GREEN:'#DDD'}} />
                <span style={{fontSize:12,color:p.is_active?GREEN:TX3}}>{p.is_active?'활성':'비활성'}</span>
              </div>
            </div>
            <div style={{fontSize:13,color:TX2,marginBottom:5}}>📞 {p.phone||'—'}</div>
            <div style={{fontSize:13,color:TX2}}>🎁 {p.reward_description||'—'}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Calendar() {
  const supabase = createClient()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [allSchedules, setAllSchedules] = useState<any[]>([])
  const [selectedDate, setSelectedDate] = useState<string|null>(null)
  const [loading, setLoading] = useState(true)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const startOfMonth = new Date(year, month, 1).toISOString().split('T')[0]
      const endOfMonth = new Date(year, month + 1, 0).toISOString().split('T')[0]
      const { data } = await supabase.from('schedules').select('*, clients(name, car_model)').gte('scheduled_date', startOfMonth).lte('scheduled_date', endOfMonth).order('scheduled_date')
      setAllSchedules(data || [])
      setLoading(false)
    }
    load()
  }, [year, month])

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)

  const getDateStr = (day: number) => `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
  const getSchedulesForDay = (day: number) => allSchedules.filter(s => s.scheduled_date === getDateStr(day))
  const todayStr = new Date().toISOString().split('T')[0]
  const selectedSchedules = selectedDate ? allSchedules.filter(s => s.scheduled_date === selectedDate) : []
  const weekDays = ['일','월','화','수','목','금','토']
  const monthNames = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']

  return (
    <div>
      <div style={{fontSize:24,fontWeight:500,color:TX1,letterSpacing:'-.02em',marginBottom:5}}>캘린더</div>
      <div style={{fontSize:13,color:TX3,marginBottom:26}}>월별 연락 일정 한눈에 보기</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:20}}>
        <div style={{background:WHITE,border:`1px solid ${BORDER}`,borderRadius:4,overflow:'hidden'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'18px 24px',borderBottom:`1px solid ${BORDER}`}}>
            <button onClick={prevMonth} style={{background:'transparent',border:`1px solid ${BORDER}`,borderRadius:3,padding:'6px 14px',fontSize:13,cursor:'pointer',color:TX2}}>‹</button>
            <div style={{fontSize:16,fontWeight:500,color:TX1,letterSpacing:'-.01em'}}>{year}년 {monthNames[month]}</div>
            <button onClick={nextMonth} style={{background:'transparent',border:`1px solid ${BORDER}`,borderRadius:3,padding:'6px 14px',fontSize:13,cursor:'pointer',color:TX2}}>›</button>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',background:CREAM2}}>
            {weekDays.map((d,i) => (
              <div key={d} style={{padding:'10px 0',textAlign:'center',fontSize:11,fontWeight:500,color:i===0?'#DC2626':i===6?'#1D4ED8':TX3,letterSpacing:'.04em'}}>{d}</div>
            ))}
          </div>
          {loading ? (
            <div style={{padding:'48px',textAlign:'center',color:TX3,fontSize:14}}>불러오는 중...</div>
          ) : (
            <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)'}}>
              {days.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} style={{minHeight:80,borderRight:`1px solid ${BORDER2}`,borderBottom:`1px solid ${BORDER2}`}} />
                const dateStr = getDateStr(day)
                const daySchedules = getSchedulesForDay(day)
                const isToday = dateStr === todayStr
                const isSelected = dateStr === selectedDate
                const isWeekend = (idx % 7 === 0)
                const isSat = (idx % 7 === 6)
                return (
                  <div key={day} onClick={() => setSelectedDate(dateStr === selectedDate ? null : dateStr)}
                    style={{minHeight:80,padding:'8px 10px',borderRight:`1px solid ${BORDER2}`,borderBottom:`1px solid ${BORDER2}`,background:isSelected?'#EEF2FF':isToday?GOLD_BG:WHITE,cursor:'pointer',transition:'background .1s'}}>
                    <div style={{fontSize:13,fontWeight:isToday?600:400,width:24,height:24,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'50%',background:isToday?GOLD:'transparent',color:isToday?WHITE:isWeekend?'#DC2626':isSat?'#1D4ED8':TX1,marginBottom:4}}>{day}</div>
                    <div style={{display:'flex',flexDirection:'column',gap:2}}>
                      {daySchedules.slice(0,3).map((sc:any) => {
                        const lb = getLabel(sc.note)
                        return (
                          <div key={sc.id} style={{fontSize:10,padding:'2px 5px',borderRadius:2,background:lb.bg,color:lb.color,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                            {sc.clients?.name} {lb.label}
                          </div>
                        )
                      })}
                      {daySchedules.length > 3 && <div style={{fontSize:10,color:TX3}}>+{daySchedules.length-3}건</div>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
        <div>
          <div style={{background:WHITE,border:`1px solid ${BORDER}`,borderRadius:4,overflow:'hidden',position:'sticky',top:0}}>
            <div style={{padding:'14px 20px',borderBottom:`1px solid ${BORDER}`,fontSize:13,fontWeight:500,color:TX1}}>
              {selectedDate ? `${selectedDate.replace(/-/g,'.')} 일정` : '날짜를 선택하세요'}
            </div>
            {!selectedDate && <div style={{padding:'32px',textAlign:'center',color:TX3,fontSize:13}}>달력에서 날짜를 클릭하면<br/>그날 일정이 표시돼요</div>}
            {selectedDate && selectedSchedules.length === 0 && <div style={{padding:'32px',textAlign:'center',color:TX3,fontSize:13}}>이날 일정이 없어요 😊</div>}
            {selectedSchedules.map((sc:any, i:number) => {
              const lb = getLabel(sc.note)
              return (
                <div key={sc.id} style={{padding:'14px 20px',borderBottom:i===selectedSchedules.length-1?'none':`1px solid ${BORDER2}`}}>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6}}>
                    <div style={{...av(lb.color),width:32,height:32,fontSize:12}}>{sc.clients?.name?.[0]||'?'}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:500,color:TX1}}>{sc.clients?.name}</div>
                      <div style={{fontSize:11,color:TX3}}>{sc.clients?.car_model||'차량 미등록'}</div>
                    </div>
                    <span style={badge(lb.color,lb.bg,lb.bd)}>{lb.label}</span>
                  </div>
                  {sc.note && <div style={{fontSize:12,color:TX2,paddingLeft:42}}>{sc.note}</div>}
                </div>
              )
            })}
          </div>
          <div style={{background:WHITE,border:`1px solid ${BORDER}`,borderRadius:4,padding:'18px 20px',marginTop:16}}>
            <div style={{fontSize:12,fontWeight:500,color:TX1,marginBottom:14,letterSpacing:'.02em'}}>{monthNames[month]} 일정 요약</div>
            {[{label:'감사문자',color:GREEN,bg:GREEN_BG,bd:GREEN_BD},{label:'1년 점검',color:BLUE,bg:BLUE_BG,bd:BLUE_BD},{label:'2년 점검',color:BLUE,bg:BLUE_BG,bd:BLUE_BD},{label:'3년 점검',color:BLUE,bg:BLUE_BG,bd:BLUE_BD}].map(type => {
              const count = allSchedules.filter(s => getLabel(s.note).label === type.label).length
              if (count === 0) return null
              return (
                <div key={type.label} style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                  <span style={badge(type.color,type.bg,type.bd)}>{type.label}</span>
                  <span style={{fontSize:13,fontWeight:500,color:TX1}}>{count}건</span>
                </div>
              )
            })}
            {allSchedules.length === 0 && <div style={{fontSize:13,color:TX3}}>이번달 일정이 없어요</div>}
            <div style={{borderTop:`1px solid ${BORDER2}`,marginTop:10,paddingTop:10,display:'flex',justifyContent:'space-between'}}>
              <span style={{fontSize:12,color:TX3}}>총 일정</span>
              <span style={{fontSize:13,fontWeight:600,color:TX1}}>{allSchedules.length}건</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
