'use client'
import React, { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const NAVY='#1B2A4A',NAVY2='#243758',NAVY3='#6A7E9E',CREAM='#F8F5F0',CREAM2='#F2EDE8'
const BORDER='#E8E0D5',BORDER2='#F0EBE4',WHITE='#FFFFFF',TX1='#1A1A1A',TX2='#555550',TX3='#888888'
const GOLD='#C9A84C',GOLD_BG='#FBF6E8',GOLD_TX='#8B6914'
const GREEN='#2D6A4F',GREEN_BG='#F0FAF4',GREEN_BD='#BBF7D0'
const BLUE='#1D4ED8',BLUE_BG='#EFF6FF',BLUE_BD='#BFDBFE'
const AMBER='#92400E',AMBER_BG='#FFFBEB',AMBER_BD='#FDE68A'
const RED='#DC2626',PURPLE='#6D28D9',PURPLE_BG='#F5F3FF',PURPLE_BD='#DDD6FE'

const STAGES = [
  {key:'first_visit', label:'첫 방문', color:TX3, bg:'#F5F5F5', bd:'#DDD'},
  {key:'test_drive',  label:'시승',   color:BLUE, bg:BLUE_BG, bd:BLUE_BD},
  {key:'quote',       label:'견적',   color:AMBER, bg:AMBER_BG, bd:AMBER_BD},
  {key:'contract',    label:'계약',   color:PURPLE, bg:PURPLE_BG, bd:PURPLE_BD},
  {key:'delivered',   label:'출고',   color:GREEN, bg:GREEN_BG, bd:GREEN_BD},
]
const getStage = (key:string) => STAGES.find(s=>s.key===key) || STAGES[0]

function formatPhone(v:string) {
  // +82, 82, +8210, 8210 → 010 자동 변환
  v = v.replace(/^\+82[-.\s]?0?/, '0')
  v = v.replace(/^82[-.\s]?0?/, '0')
  const n=v.replace(/\D/g,'')
  if(n.length<=3) return n
  if(n.length<=7) return `${n.slice(0,3)}-${n.slice(3)}`
  if(n.length<=11) return `${n.slice(0,3)}-${n.slice(3,7)}-${n.slice(7)}`
  return `${n.slice(0,3)}-${n.slice(3,7)}-${n.slice(7,11)}`
}

function PhoneInput({value, onChange, style, placeholder}:any) {
  const ref = React.useRef<HTMLInputElement>(null)
  const handleChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target
    const cursorPos = input.selectionStart || 0
    const oldVal = input.value
    const newVal = formatPhone(e.target.value)
    
    // 커서 위치 계산
    const oldDashes = oldVal.slice(0, cursorPos).split('-').length - 1
    const newDashes = newVal.slice(0, cursorPos).split('-').length - 1
    const newCursor = cursorPos + (newDashes - oldDashes)
    
    onChange(newVal)
    
    // 다음 렌더링 후 커서 위치 복원
    setTimeout(() => {
      if(ref.current) {
        ref.current.setSelectionRange(newCursor, newCursor)
      }
    }, 0)
  }
  return <input ref={ref} style={style} placeholder={placeholder||'010-0000-0000'} value={value} onChange={handleChange} type="tel" />
}

const av=(c=NAVY)=>({width:36,height:36,borderRadius:'50%',background:c+'15',border:`1px solid ${c}40`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:500,color:c,flexShrink:0})
const badge=(c:string,bg:string,bd:string)=>({fontSize:11,fontWeight:500,padding:'3px 10px',borderRadius:3,color:c,background:bg,border:`1px solid ${bd}`,whiteSpace:'nowrap' as const,letterSpacing:'.02em'})
const btn=(v='def')=>({padding:v==='sm'?'6px 14px':v==='gold'?'10px 22px':'9px 18px',borderRadius:3,fontSize:13,fontWeight:500,cursor:'pointer',border:v==='gold'?'none':v==='navy'?'none':`1px solid ${BORDER}`,background:v==='gold'?GOLD:v==='navy'?NAVY:'transparent',color:v==='gold'?WHITE:v==='navy'?CREAM:TX2,transition:'all .12s',letterSpacing:'.02em'})
const inp={background:WHITE,border:`1px solid ${BORDER}`,borderRadius:3,padding:'10px 14px',fontSize:14,color:TX1,outline:'none',width:'100%',boxSizing:'border-box' as const,fontFamily:'inherit'}
const lbl={fontSize:11,color:'#666',letterSpacing:'.07em',textTransform:'uppercase' as const,marginBottom:6,display:'block',fontWeight:600}
const card={background:WHITE,border:`1px solid ${BORDER}`,borderRadius:4,overflow:'hidden',marginBottom:16}
const cardH={padding:'14px 20px',borderBottom:`1px solid ${BORDER2}`,fontSize:14,fontWeight:600,color:TX1,display:'flex',alignItems:'center',justifyContent:'space-between',letterSpacing:'.01em'}
const row={display:'flex',alignItems:'center',padding:'15px 20px',borderBottom:`1px solid ${BORDER2}`,gap:12}

function getLabel(note:string){
  if(note?.includes('감사')) return {label:'감사문자',color:GREEN,bg:GREEN_BG,bd:GREEN_BD}
  if(note?.includes('1년')) return {label:'1년 점검',color:BLUE,bg:BLUE_BG,bd:BLUE_BD}
  if(note?.includes('2년')) return {label:'2년 점검',color:BLUE,bg:BLUE_BG,bd:BLUE_BD}
  if(note?.includes('3년')) return {label:'3년 점검',color:BLUE,bg:BLUE_BG,bd:BLUE_BD}
  if(note?.includes('팔로')) return {label:'팔로업',color:AMBER,bg:AMBER_BG,bd:AMBER_BD}
  return {label:'연락',color:GOLD_TX,bg:GOLD_BG,bd:GOLD+'60'}
}

function ClientDetail({client,allClients=[],onClose,onUpdate,onDelete}:any){
  const supabase=createClient()
  const [tab,setTab]=useState<'info'|'vehicle'|'history'|'estimates'>('info')
  const [editing,setEditing]=useState(false)
  const [saving,setSaving]=useState(false)
  const [note,setNote]=useState('')
  const [noteDate,setNoteDate]=useState(new Date().toISOString().split('T')[0])
  const [notes,setNotes]=useState<any[]>([])
  const [estimates,setEstimates]=useState<any[]>([])
  const [uploading,setUploading]=useState(false)
  const [confirmDelete,setConfirmDelete]=useState(false)
  const [form,setForm]=useState({
    name:client.name||'',phone:client.phone||'',email:client.email||'',
    address:client.address||'',contact_place:client.contact_place||'',
    previous_car:client.previous_car||'',memo:client.memo||'',
    car_model:client.car_model||'',delivery_date:client.delivery_date||'',
    car_year:client.car_year||'',car_color:client.car_color||'',
    car_number:client.car_number||'',consultation_date:client.consultation_date||'',
    stage:client.stage||'first_visit',interest_model:client.interest_model||'',
    purchase_type:client.purchase_type||'',competitor:client.competitor||'',birthday:client.birthday||'',
    is_vip:client.is_vip||false,referred_by:client.referred_by||'',
  })

  useEffect(()=>{
    supabase.from('schedules').select('*').eq('client_id',client.id).order('scheduled_date',{ascending:false}).then(({data})=>setNotes(data||[]))
    loadEst()
  },[client.id])

  const loadEst=async()=>{
    const{data}=await supabase.storage.from('estimates').list(client.id,{sortBy:{column:'created_at',order:'desc'}})
    setEstimates(data||[])
  }
  const uploadEst=async(e:React.ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0];if(!file) return
    setUploading(true)
    await supabase.storage.from('estimates').upload(`${client.id}/${Date.now()}_${file.name}`,file)
    await loadEst();setUploading(false)
  }
  const getUrl=(name:string)=>supabase.storage.from('estimates').getPublicUrl(`${client.id}/${name}`).data.publicUrl
  const delEst=async(name:string)=>{await supabase.storage.from('estimates').remove([`${client.id}/${name}`]);await loadEst()}

  const save=async()=>{
    setSaving(true)
    const u:any={name:form.name,phone:form.phone||null,email:form.email||null,address:form.address||null,contact_place:form.contact_place||null,previous_car:form.previous_car||null,memo:form.memo||null,car_model:form.car_model||null,car_year:form.car_year||null,car_color:form.car_color||null,car_number:form.car_number||null,stage:form.stage,interest_model:form.interest_model||null,purchase_type:form.purchase_type||null,competitor:form.competitor||null,is_vip:form.is_vip,referred_by:form.referred_by||null}
    if(form.delivery_date) u.delivery_date=form.delivery_date
    if(form.consultation_date) u.consultation_date=form.consultation_date
    if(form.birthday) u.birthday=form.birthday
    const{data}=await supabase.from('clients').update(u).eq('id',client.id).select()
    if(data) onUpdate(data[0]);setEditing(false);setSaving(false)
  }
  const addNote=async()=>{
    if(!note.trim()) return
    const{data}=await supabase.from('schedules').insert({client_id:client.id,type:'inspection',scheduled_date:noteDate,is_contacted:true,note}).select()
    if(data) setNotes(p=>[data[0],...p]);setNote('');setNoteDate(new Date().toISOString().split('T')[0])
  }

  const deleteClient=async()=>{
    const supabase2=createClient()
    await supabase2.from('clients').delete().eq('id',client.id)
    onDelete(client.id);onClose()
  }

  const tabs=[{id:'info',l:'기본 정보'},{id:'vehicle',l:'차량 정보'},{id:'history',l:'연락 히스토리'},{id:'estimates',l:'견적서'}]
  const stg=getStage(client.stage||'first_visit')

  return(
    <div style={{position:'fixed',inset:0,background:'rgba(27,42,74,0.6)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}} onClick={onClose}>
      {confirmDelete&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:2000}} onClick={e=>e.stopPropagation()}>
          <div style={{background:WHITE,borderRadius:6,padding:32,width:360,textAlign:'center',boxShadow:'0 24px 80px rgba(0,0,0,0.3)'}}>
            <div style={{fontSize:32,marginBottom:16}}>⚠️</div>
            <div style={{fontSize:17,fontWeight:600,color:TX1,marginBottom:8}}>{client.name} 고객을 삭제할까요?</div>
            <div style={{fontSize:13,color:TX3,marginBottom:24,lineHeight:1.6}}>삭제하면 모든 연락 기록, 견적서,<br/>스케줄이 함께 삭제됩니다.</div>
            <div style={{display:'flex',gap:10,justifyContent:'center'}}>
              <button style={btn()} onClick={()=>setConfirmDelete(false)}>취소</button>
              <button style={{...btn('navy'),background:RED}} onClick={deleteClient}>삭제하기</button>
            </div>
          </div>
        </div>
      )}
      <div style={{background:WHITE,borderRadius:6,width:660,maxHeight:'90vh',overflow:'hidden',display:'flex',flexDirection:'column',boxShadow:'0 24px 80px rgba(27,42,74,0.2)'}} onClick={e=>e.stopPropagation()}>
        <div style={{padding:'22px 28px',borderBottom:`1px solid ${BORDER}`,display:'flex',alignItems:'center',justifyContent:'space-between',background:CREAM}}>
          <div style={{display:'flex',alignItems:'center',gap:14}}>
            <div style={{...av(NAVY),width:50,height:50,fontSize:18,position:'relative'}}>
              {client.name?.[0]||'?'}
              {client.is_vip&&<div style={{position:'absolute',top:-4,right:-4,fontSize:10}}>⭐</div>}
            </div>
            <div>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
                <div style={{fontSize:18,fontWeight:500,color:TX1,letterSpacing:'-.01em'}}>{client.name}</div>
                <span style={badge(stg.color,stg.bg,stg.bd)}>{stg.label}</span>
              </div>
              <div style={{fontSize:13,color:TX3}}>{client.phone||'전화번호 없음'}</div>
            </div>
          </div>
          <div style={{display:'flex',gap:8}}>
            {!editing&&tab!=='estimates'&&tab!=='history'&&<button style={btn('navy')} onClick={()=>setEditing(true)}>수정</button>}
            {editing&&<><button style={btn('gold')} onClick={save} disabled={saving}>{saving?'저장중...':'저장'}</button><button style={btn()} onClick={()=>setEditing(false)}>취소</button></>}
            {!editing&&<button style={{...btn(),color:RED,borderColor:RED+'30'}} onClick={()=>setConfirmDelete(true)}>🗑 삭제</button>}
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
          {tab==='info'&&(editing?(
            <div style={{background:WHITE,borderRadius:4,padding:22,border:`1px solid ${BORDER}`}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                <div><label style={lbl}>이름</label><input style={inp} value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} /></div>
                <div><label style={lbl}>전화번호</label><PhoneInput style={inp} value={form.phone} onChange={(v:string)=>setForm(p=>({...p,phone:v}))} /></div>
                <div><label style={lbl}>이메일</label><input style={inp} value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} /></div>
                <div><label style={lbl}>생일</label><input style={inp} type="date" value={form.birthday} onChange={e=>setForm(p=>({...p,birthday:e.target.value}))} /></div>
                <div><label style={lbl}>최초 컨택 장소</label><input style={inp} value={form.contact_place} onChange={e=>setForm(p=>({...p,contact_place:e.target.value}))} /></div>
                <div><label style={lbl}>기존 차량</label><input style={inp} value={form.previous_car} onChange={e=>setForm(p=>({...p,previous_car:e.target.value}))} /></div>
                <div style={{gridColumn:'1/-1'}}><label style={lbl}>고객 주소</label><input style={inp} value={form.address} onChange={e=>setForm(p=>({...p,address:e.target.value}))} /></div>
                <div><label style={lbl}>최초 상담일</label><input style={inp} type="date" value={form.consultation_date} onChange={e=>setForm(p=>({...p,consultation_date:e.target.value}))} /></div>
                <div style={{display:'flex',alignItems:'center',gap:10,paddingTop:22}}>
                  <input type="checkbox" id="vip" checked={form.is_vip} onChange={e=>setForm(p=>({...p,is_vip:e.target.checked}))} />
                  <label htmlFor="vip" style={{fontSize:13,color:TX1,cursor:'pointer'}}>⭐ VIP 고객</label>
                </div>
                <div style={{gridColumn:'1/-1'}}>
                  <label style={lbl}>소개자 (이 고객을 소개해준 기존 고객)</label>
                  <select style={inp} value={form.referred_by} onChange={e=>setForm(p=>({...p,referred_by:e.target.value}))}>
                    <option value="">소개자 없음 (직접 방문)</option>
                    {allClients.filter((c:any)=>c.id!==client.id).map((c:any)=>(
                      <option key={c.id} value={c.id}>{c.name} {c.phone?`(${c.phone})`:''}</option>
                    ))}
                  </select>
                </div>
                <div style={{gridColumn:'1/-1'}}><label style={lbl}>메모</label><textarea style={{...inp,height:140,resize:'none' as const,fontSize:15,lineHeight:1.7}} value={form.memo} onChange={e=>setForm(p=>({...p,memo:e.target.value}))} /></div>
              </div>
            </div>
          ):(
            <div style={{background:WHITE,borderRadius:4,border:`1px solid ${BORDER}`,overflow:'hidden'}}>
              {[{l:'이름',v:client.name},{l:'전화번호',v:client.phone||'—'},{l:'이메일',v:client.email||'—'},{l:'생일',v:client.birthday||'—'},{l:'최초 컨택 장소',v:client.contact_place||'—'},{l:'고객 주소',v:client.address||'—'},{l:'기존 차량',v:client.previous_car||'—'},{l:'최초 상담일',v:client.consultation_date||'—'},{l:'VIP',v:client.is_vip?'⭐ VIP':'—'},{l:'소개자',v:allClients.find((c:any)=>c.id===client.referred_by)?.name||'직접 방문'},{l:'등록일',v:client.created_at?new Date(client.created_at).toLocaleDateString('ko-KR'):'—'}].map((r,i,arr)=>(
                <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'13px 22px',borderBottom:i<arr.length-1?`1px solid ${BORDER2}`:'none'}}>
                  <span style={{fontSize:13,color:TX3,fontWeight:500}}>{r.l}</span>
                  <span style={{fontSize:14,color:TX1,fontWeight:500}}>{r.v}</span>
                </div>
              ))}
              {client.memo&&<div style={{padding:'15px 22px',background:CREAM,borderTop:`1px solid ${BORDER}`}}><div style={{fontSize:11,color:TX3,marginBottom:6,letterSpacing:'.06em',textTransform:'uppercase'}}>메모</div><div style={{fontSize:14,color:TX2,lineHeight:1.7}}>{client.memo}</div></div>}
            </div>
          ))}
          {tab==='vehicle'&&(editing?(
            <div style={{background:WHITE,borderRadius:4,padding:22,border:`1px solid ${BORDER}`}}>
              <div style={{marginBottom:16}}>
                <label style={lbl}>계약 단계</label>
                <div style={{display:'flex',gap:8,flexWrap:'wrap' as const}}>
                  {STAGES.map(s=>(
                    <button key={s.key} onClick={()=>setForm(p=>({...p,stage:s.key}))}
                      style={{padding:'7px 14px',borderRadius:3,fontSize:13,cursor:'pointer',border:`1px solid ${form.stage===s.key?s.color:BORDER}`,background:form.stage===s.key?s.bg:WHITE,color:form.stage===s.key?s.color:TX3,fontWeight:form.stage===s.key?600:400}}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                <div style={{gridColumn:'1/-1'}}><label style={lbl}>계약 차량 모델</label><input style={inp} placeholder="E 350 4MATIC" value={form.car_model} onChange={e=>setForm(p=>({...p,car_model:e.target.value}))} /></div>
                <div><label style={lbl}>관심 차종 (구매 희망)</label><input style={inp} placeholder="GLE 450 AMG" value={form.interest_model} onChange={e=>setForm(p=>({...p,interest_model:e.target.value}))} /></div>
                <div>
                  <label style={lbl}>구매 방식</label>
                  <select style={inp} value={form.purchase_type} onChange={e=>setForm(p=>({...p,purchase_type:e.target.value}))}>
                    <option value="">선택</option>
                    <option value="현금">현금</option>
                    <option value="할부">할부</option>
                    <option value="리스">리스</option>
                    <option value="렌트">렌트</option>
                  </select>
                </div>
                <div><label style={lbl}>기존 보유 차량</label><input style={inp} placeholder="BMW 5시리즈 (2021)" value={form.previous_car} onChange={e=>setForm(p=>({...p,previous_car:e.target.value}))} /></div>
                <div style={{gridColumn:'1/-1'}}><label style={lbl}>경쟁 차종</label><input style={inp} placeholder="BMW 5시리즈도 검토 중" value={form.competitor} onChange={e=>setForm(p=>({...p,competitor:e.target.value}))} /></div>
                <div><label style={lbl}>차량 연식</label><input style={inp} placeholder="2024" value={form.car_year} onChange={e=>setForm(p=>({...p,car_year:e.target.value}))} /></div>
                <div><label style={lbl}>차량 색상</label><input style={inp} placeholder="옵시디안 블랙" value={form.car_color} onChange={e=>setForm(p=>({...p,car_color:e.target.value}))} /></div>
                <div><label style={lbl}>차량 번호</label><input style={inp} placeholder="12가 3456" value={form.car_number} onChange={e=>setForm(p=>({...p,car_number:e.target.value}))} /></div>
                <div><label style={lbl}>차량 인도일</label><input style={inp} type="date" value={form.delivery_date} onChange={e=>setForm(p=>({...p,delivery_date:e.target.value}))} /></div>
              </div>
            </div>
          ):(
            <div style={{background:WHITE,borderRadius:4,border:`1px solid ${BORDER}`,overflow:'hidden'}}>
              <div style={{padding:'14px 22px',borderBottom:`1px solid ${BORDER2}`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <span style={{fontSize:13,color:TX3,fontWeight:500}}>계약 단계</span>
                <span style={badge(stg.color,stg.bg,stg.bd)}>{stg.label}</span>
              </div>
              {[{l:'차량 모델',v:client.car_model||'—'},{l:'관심 차종',v:client.interest_model||'—'},{l:'구매 방식',v:client.purchase_type||'—'},{l:'기존 차량',v:client.previous_car||'—'},{l:'경쟁 차종',v:client.competitor||'—'},{l:'차량 연식',v:client.car_year||'—'},{l:'차량 색상',v:client.car_color||'—'},{l:'차량 번호',v:client.car_number||'—'},{l:'차량 인도일',v:client.delivery_date||'—'}].map((r,i,arr)=>(
                <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'13px 22px',borderBottom:i<arr.length-1?`1px solid ${BORDER2}`:'none'}}>
                  <span style={{fontSize:13,color:TX3,fontWeight:500}}>{r.l}</span>
                  <span style={{fontSize:14,color:TX1,fontWeight:500}}>{r.v}</span>
                </div>
              ))}
              {!client.delivery_date&&<div style={{padding:'14px 22px',background:GOLD_BG,borderTop:`1px solid ${BORDER}`}}><div style={{fontSize:13,color:GOLD_TX}}>💡 차량 인도일을 입력하면 감사문자·정기점검 알림이 자동 생성돼요!</div></div>}
            </div>
          ))}
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
                      <span style={{fontSize:12,color:GOLD_TX,fontWeight:600}}>📞 연락</span>
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
              <label style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'24px',border:`2px dashed ${BORDER}`,borderRadius:4,cursor:'pointer',color:TX3,fontSize:14,background:WHITE,marginBottom:16}}>
                {uploading?'업로드 중...':'📎 견적서 이미지 또는 PDF 선택'}
                <input type="file" accept="image/*,.pdf" style={{display:'none'}} onChange={uploadEst} disabled={uploading} />
              </label>
              {estimates.length===0&&<div style={{padding:'32px',textAlign:'center',color:TX3,fontSize:14,background:WHITE,borderRadius:4,border:`1px solid ${BORDER}`}}>저장된 견적서가 없어요.</div>}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                {estimates.map((file:any)=>{
                  const url=getUrl(file.name);const isImg=/\.(jpg|jpeg|png|gif|webp)$/i.test(file.name)
                  return(
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

export default function Home(){
  const [page,setPage]=useState('dashboard')
  const [user,setUser]=useState<any>(null)
  const [salesperson,setSalesperson]=useState<any>(null)
  const [clients,setClients]=useState<any[]>([])
  const [partners,setPartners]=useState<any[]>([])
  const [schedules,setSchedules]=useState<any[]>([])
  const [weekSchedules,setWeekSchedules]=useState<any[]>([])
  const [templates,setTemplates]=useState<any[]>([])
  const [loading,setLoading]=useState(true)
  const [selectedClient,setSelectedClient]=useState<any>(null)
  const [isMobile,setIsMobile]=useState(false)
  const router=useRouter()
  const supabase=createClient()

  useEffect(()=>{
    const check=()=>setIsMobile(window.innerWidth<768)
    check()
    window.addEventListener('resize',check)
    return()=>window.removeEventListener('resize',check)
  },[])

  useEffect(()=>{
    const registerPush=async()=>{
      if(!('serviceWorker' in navigator)||!('Notification' in window)) return
      try {
        const reg=await navigator.serviceWorker.register('/sw.js')
        const permission=await Notification.requestPermission()
        if(permission!=='granted') return
        const sub=await reg.pushManager.subscribe({
          userVisibleOnly:true,
          applicationServerKey:process.env.NEXT_PUBLIC_VAPID_KEY
        })
        const{data:{user}}=await supabase.auth.getUser()
        if(user){
          await supabase.from('salespersons').update({
            push_subscription:JSON.stringify(sub)
          }).eq('id',user.id)
        }
      } catch(e){ console.log('SW error:', e) }
    }
    registerPush()
  },[])

  useEffect(()=>{
    const load=async()=>{
      const{data:{user}}=await supabase.auth.getUser()
      if(!user){router.push('/login');return}
      setUser(user)
      const today=new Date().toISOString().split('T')[0]
      const nextWeek=new Date(Date.now()+7*24*60*60*1000).toISOString().split('T')[0]
      const[sp,c,p,sc,wk,tmpl]=await Promise.all([
        supabase.from('salespersons').select('*').eq('id',user.id).single(),
        supabase.from('clients').select('*').order('created_at',{ascending:false}),
        supabase.from('partners').select('*').order('created_at',{ascending:false}),
        supabase.from('schedules').select('*, clients(name,car_model)').eq('is_contacted',false).eq('scheduled_date',today),
        supabase.from('schedules').select('*, clients(name,car_model)').eq('is_contacted',false).gt('scheduled_date',today).lte('scheduled_date',nextWeek).order('scheduled_date'),
        supabase.from('templates').select('*').order('created_at',{ascending:false}),
      ])
      setSalesperson(sp.data)
      setClients(c.data||[]);setPartners(p.data||[])
      setSchedules(sc.data||[]);setWeekSchedules(wk.data||[])
      setTemplates(tmpl.data||[]);setLoading(false)
    }
    load()
  },[])

  const signOut=async()=>{await supabase.auth.signOut();router.push('/login')}

  const nav=[
    {id:'dashboard',label:'대시보드'},
    {id:'today',label:'오늘의 리스트'},
    {id:'clients',label:'고객 관리'},
    {id:'templates',label:'문자 템플릿'},
    {id:'partners',label:'제휴업체'},
    {id:'calendar',label:'캘린더'},
    {id:'report',label:'실적 리포트'},
    {id:'profile',label:'프로필 설정'},
  ]

  if(loading) return <div style={{minHeight:'100vh',background:CREAM,display:'flex',alignItems:'center',justifyContent:'center',color:NAVY,fontSize:14}}>Loading...</div>

  if(isMobile) return <MobileApp page={page} setPage={setPage} user={user} salesperson={salesperson} setSalesperson={setSalesperson} clients={clients} setClients={setClients} schedules={schedules} weekSchedules={weekSchedules} templates={templates} setTemplates={setTemplates} partners={partners} setPartners={setPartners} selectedClient={selectedClient} setSelectedClient={setSelectedClient} signOut={signOut} />

  return(
    <div style={{display:'flex',minHeight:'100vh',background:CREAM,fontFamily:"'DM Sans','Apple SD Gothic Neo',system-ui,sans-serif",fontSize:14}}>
      {selectedClient&&<ClientDetail client={selectedClient} allClients={clients} onClose={()=>setSelectedClient(null)} onUpdate={(u:any)=>{setClients(p=>p.map(c=>c.id===u.id?u:c));setSelectedClient(u)}} onDelete={(id:string)=>setClients(p=>p.filter(c=>c.id!==id))} />}
      <aside style={{width:210,background:NAVY,display:'flex',flexDirection:'column',flexShrink:0}}>
        <div style={{padding:'24px 22px 20px',borderBottom:`1px solid ${NAVY2}`,cursor:'pointer'}} onClick={()=>setPage('dashboard')}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="6" fill="#243758"/>
              <polygon points="18,6 18,14 12,10 12,18 24,18 24,10" fill="none" stroke="#C9A84C" strokeWidth="1.8" strokeLinejoin="round"/>
              <circle cx="12" cy="9" r="2.2" fill="#C9A84C"/>
              <circle cx="18" cy="5" r="2.2" fill="#C9A84C"/>
              <circle cx="24" cy="9" r="2.2" fill="#C9A84C"/>
            </svg>
            <div>
              <div style={{fontSize:17,fontWeight:600,color:CREAM,letterSpacing:'.03em',lineHeight:1.1}}>SalesPath</div>
              <div style={{fontSize:9,color:NAVY3,letterSpacing:'.18em',textTransform:'uppercase' as const,marginTop:2}}>Sales CRM</div>
            </div>
          </div>
        </div>
        <div style={{paddingTop:8,flex:1}}>
          {nav.map(n=>(
            <div key={n.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 22px',fontSize:13,color:page===n.id?CREAM:NAVY3,background:page===n.id?NAVY2:'transparent',borderLeft:page===n.id?`2px solid ${GOLD}`:'2px solid transparent',cursor:'pointer',fontWeight:page===n.id?500:400,transition:'all .12s',userSelect:'none',letterSpacing:'.02em'}} onClick={()=>setPage(n.id)}>
              {n.label}
              {n.id==='today'&&schedules.length>0&&<span style={{fontSize:10,background:GOLD,color:NAVY,padding:'1px 7px',borderRadius:2,fontWeight:700}}>{schedules.length}</span>}
            </div>
          ))}
        </div>
        <div style={{padding:'20px 22px',borderTop:`1px solid ${NAVY2}`}}>
          <div style={{fontSize:13,color:CREAM,marginBottom:2,fontWeight:500}}>{salesperson?.name||user?.email} 컨설턴트</div>
          <div style={{fontSize:11,color:NAVY3,marginBottom:14}}>{salesperson?.brand||''}</div>
          <button style={{...btn(),fontSize:12,color:NAVY3,borderColor:NAVY2,width:'100%',letterSpacing:'.04em'}} onClick={signOut}>로그아웃</button>
        </div>
      </aside>
      <main style={{flex:1,padding:'32px 40px',overflowY:'auto',background:CREAM}}>
        {page==='dashboard'&&<Dashboard clients={clients} schedules={schedules} weekSchedules={weekSchedules} setPage={setPage} onSelect={setSelectedClient} salesperson={salesperson} />}
        {page==='today'&&<Today schedules={schedules} />}
        {page==='clients'&&<Clients clients={clients} setClients={setClients} onSelect={setSelectedClient} />}
        {page==='templates'&&<Templates templates={templates} setTemplates={setTemplates} />}
        {page==='partners'&&<Partners partners={partners} setPartners={setPartners} />}
        {page==='calendar'&&<Calendar />}
        {page==='report'&&<Report clients={clients} />}
        {page==='profile'&&<Profile salesperson={salesperson} setSalesperson={setSalesperson} user={user} />}
      </main>
    </div>
  )
}

function Dashboard({clients,schedules,weekSchedules,setPage,onSelect,salesperson}:any){
  const supabase=createClient()
  const [goal,setGoal]=useState(5)
  const [editGoal,setEditGoal]=useState(false)
  const [goalInput,setGoalInput]=useState('5')

  const now=new Date()
  const thisMonth=clients.filter((c:any)=>{const d=new Date(c.created_at);return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear()})
  const contracted=clients.filter((c:any)=>c.stage==='contract'||c.stage==='delivered')
  const vipClients=clients.filter((c:any)=>c.is_vip)

  useEffect(()=>{
    const loadGoal=async()=>{
      const{data:{user}}=await supabase.auth.getUser()
      if(!user) return
      const{data}=await supabase.from('monthly_goals').select('goal').eq('salesperson_id',user.id).eq('year',now.getFullYear()).eq('month',now.getMonth()+1).single()
      if(data){setGoal(data.goal);setGoalInput(String(data.goal))}
    }
    loadGoal()
  },[])

  const saveGoal=async()=>{
    const{data:{user}}=await supabase.auth.getUser()
    if(!user) return
    const g=parseInt(goalInput)||5
    await supabase.from('monthly_goals').upsert({salesperson_id:user.id,year:now.getFullYear(),month:now.getMonth()+1,goal:g})
    setGoal(g);setEditGoal(false)
  }

  const getDayLabel=(ds:string)=>{
    const diff=Math.round((new Date(ds).getTime()-new Date().getTime())/(1000*60*60*24))
    if(diff===1) return '내일';if(diff===2) return '모레';return `${diff}일 후`
  }

  // 오늘 생일인 고객
  const todayMMDD=`${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
  const birthdayClients=clients.filter((c:any)=>c.birthday&&c.birthday.slice(5)===todayMMDD)

  return(
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:28}}>
        <div>
          <div style={{fontSize:24,fontWeight:500,color:TX1,letterSpacing:'-.02em',marginBottom:5}}>대시보드</div>
          <div style={{fontSize:13,color:TX3}}>{now.toLocaleDateString('ko-KR',{year:'numeric',month:'long',day:'numeric',weekday:'long'})} · 오늘 연락 {schedules.length}건</div>
        </div>
        <div style={{background:NAVY,color:GOLD,fontSize:12,fontWeight:500,padding:'8px 16px',borderRadius:3,letterSpacing:'.06em'}}>30일 무료 체험 중</div>
      </div>

      {birthdayClients.length>0&&(
        <div style={{background:'#FFF5F5',border:'1px solid #FFC0C0',borderRadius:4,padding:'14px 20px',marginBottom:16,display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:18}}>🎂</span>
          <span style={{fontSize:14,color:'#C0392B',fontWeight:500}}>오늘 생일인 고객: {birthdayClients.map((c:any)=>c.name).join(', ')} — 축하 연락 해보세요!</span>
        </div>
      )}

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
        {[
          {l:'전체 고객',v:clients.length,s:`이번달 +${thisMonth.length}명`,vc:TX1},
          {l:'오늘 연락',v:schedules.length,s:'미완료',vc:schedules.length>0?GOLD:TX1},
          {l:'계약·출고',v:contracted.length,s:'이번달',vc:contracted.length>0?GREEN:TX1},
          {l:'VIP 고객',v:vipClients.length,s:'⭐ 관리 중',vc:vipClients.length>0?AMBER:TX1},
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
            <span style={{fontSize:12,color:GOLD,cursor:'pointer',fontWeight:500}} onClick={()=>setPage('today')}>전체 보기 →</span>
          </div>
          {schedules.length===0&&<div style={{padding:'32px',color:TX3,fontSize:14,textAlign:'center'}}>오늘 연락할 고객이 없어요 😊</div>}
          {schedules.map((sc:any,i:number)=>{
            const lb=getLabel(sc.note)
            return(
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
              return(
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
            <div style={cardH}>
              <span>이번달 목표</span>
              {!editGoal&&<span style={{fontSize:12,color:GOLD,cursor:'pointer'}} onClick={()=>setEditGoal(true)}>수정</span>}
            </div>
            <div style={{padding:'18px 20px'}}>
              {editGoal?(
                <div style={{display:'flex',gap:8,marginBottom:12}}>
                  <input style={{...inp,width:80}} type="number" value={goalInput} onChange={e=>setGoalInput(e.target.value)} />
                  <button style={btn('navy')} onClick={saveGoal}>저장</button>
                </div>
              ):null}
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                <span style={{fontSize:13,color:TX2}}>계약 목표</span>
                <span style={{fontSize:13,fontWeight:500,color:TX1}}>{contracted.length} / {goal}</span>
              </div>
              <div style={{height:6,background:BORDER,borderRadius:3,marginBottom:12}}>
                <div style={{height:6,width:`${Math.min(Math.round(contracted.length/goal*100),100)}%`,background:contracted.length>=goal?GREEN:GOLD,borderRadius:3,transition:'width .3s'}} />
              </div>
              <div style={{fontSize:12,color:TX3}}>{contracted.length>=goal?'🎉 목표 달성!':goal-contracted.length>0?`목표까지 ${goal-contracted.length}건 남았어요`:'—'}</div>
            </div>
          </div>
        </div>
      </div>

      <div style={card}>
        <div style={cardH}>
          <span>계약 단계별 현황</span>
        </div>
        <div style={{display:'flex',padding:'16px 20px',gap:12,overflowX:'auto' as const}}>
          {STAGES.map(s=>{
            const count=clients.filter((c:any)=>c.stage===s.key).length
            return(
              <div key={s.key} style={{flex:1,minWidth:80,background:s.bg,border:`1px solid ${s.bd}`,borderRadius:4,padding:'14px 12px',textAlign:'center'}}>
                <div style={{fontSize:22,fontWeight:500,color:s.color,marginBottom:4}}>{count}</div>
                <div style={{fontSize:12,color:s.color,fontWeight:500}}>{s.label}</div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={card}>
        <div style={cardH}>
          <span>최근 등록 고객</span>
          <span style={{fontSize:12,color:GOLD,cursor:'pointer',fontWeight:500}} onClick={()=>setPage('clients')}>전체 보기 →</span>
        </div>
        {clients.length===0&&<div style={{padding:'32px',color:TX3,fontSize:14,textAlign:'center'}}>등록된 고객이 없어요.</div>}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)'}}>
          {clients.slice(0,6).map((c:any,i:number)=>{
            const stg=getStage(c.stage||'first_visit')
            return(
              <div key={c.id} style={{padding:'16px 20px',borderRight:i%3!==2?`1px solid ${BORDER2}`:'none',borderBottom:i<3?`1px solid ${BORDER2}`:'none',cursor:'pointer'}} onClick={()=>onSelect(c)}>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                  <div style={{...av(NAVY),position:'relative'}}>
                    {c.name?.[0]||'?'}
                    {c.is_vip&&<div style={{position:'absolute',top:-4,right:-4,fontSize:9}}>⭐</div>}
                  </div>
                  <div>
                    <div style={{fontSize:14,fontWeight:500,color:TX1}}>{c.name}</div>
                    <div style={{fontSize:12,color:TX3}}>{c.phone||'—'}</div>
                  </div>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{fontSize:12,color:TX2}}>{c.car_model||'차량 미등록'}</span>
                  <span style={badge(stg.color,stg.bg,stg.bd)}>{stg.label}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Today({schedules}:any){
  const supabase=createClient()
  const [done,setDone]=useState<string[]>([])
  const toggle=async(id:string)=>{
    setDone(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id])
    await supabase.from('schedules').update({is_contacted:true}).eq('id',id)
  }
  return(
    <div>
      <div style={{fontSize:24,fontWeight:500,color:TX1,letterSpacing:'-.02em',marginBottom:5}}>오늘의 연락 리스트</div>
      <div style={{fontSize:13,color:TX3,marginBottom:26}}>완료 {done.length} / {schedules.length}건</div>
      <div style={card}>
        {schedules.length===0&&<div style={{padding:'48px',color:TX3,fontSize:14,textAlign:'center'}}>오늘 연락할 고객이 없어요 😊</div>}
        {schedules.map((sc:any,i:number)=>{
          const lb=getLabel(sc.note);const ok=done.includes(sc.id)
          return(
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

function Clients({clients,setClients,onSelect}:any){
  const supabase=createClient()
  const [search,setSearch]=useState('')
  const [stageFilter,setStageFilter]=useState('all')
  const [categoryFilter,setCategoryFilter]=useState('all')
  const [showForm,setShowForm]=useState(false)
  const [quickMode,setQuickMode]=useState(false)
  const [form,setForm]=useState({name:'',phone:'',car_model:'',consultation_date:'',address:'',memo:'',interest_model:'',budget:'',stage:'first_visit'})
  const [saving,setSaving]=useState(false)

  const filtered=clients.filter((c:any)=>{
    const matchSearch=c.name?.includes(search)||c.car_model?.includes(search)||c.phone?.includes(search)
    const matchStage=stageFilter==='all'||c.stage===stageFilter
    let matchCat=true
    if(categoryFilter==='delivered') matchCat=c.stage==='delivered'
    else if(categoryFilter==='prospect') matchCat=c.stage!=='delivered'
    else if(categoryFilter.startsWith('month_')){
      const m=parseInt(categoryFilter.split('_')[1])
      const d=c.consultation_date||c.created_at
      if(d) matchCat=new Date(d).getMonth()+1===m
    }
    return matchSearch&&matchStage&&matchCat
  })

  const save=async()=>{
    if(!form.name) return;setSaving(true)
    const{data:{user}}=await supabase.auth.getUser()
    const ins:any={salesperson_id:user?.id,name:form.name,phone:form.phone||null,car_model:form.car_model||null,address:form.address||null,memo:form.memo||null,stage:form.stage,interest_model:form.interest_model||null}
    if(form.consultation_date) ins.consultation_date=form.consultation_date
    const{data}=await supabase.from('clients').insert(ins).select()
    if(data) setClients((p:any)=>[data[0],...p])
    setForm({name:'',phone:'',car_model:'',consultation_date:'',address:'',memo:'',interest_model:'',budget:'',stage:'first_visit'});setShowForm(false);setSaving(false)
  }

  return(
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:26}}>
        <div>
          <div style={{fontSize:24,fontWeight:500,color:TX1,letterSpacing:'-.02em',marginBottom:5}}>고객 관리</div>
          <div style={{fontSize:13,color:TX3}}>등록 고객 {clients.length}명</div>
        </div>
        <div style={{display:'flex',gap:8}}>
          <button style={{...btn(),background:GOLD_BG,color:GOLD_TX,border:`1px solid ${GOLD}60`}} onClick={()=>{setQuickMode(true);setShowForm(true)}}>⚡ 당직 빠른 등록</button>
          <button style={btn('navy')} onClick={()=>{setQuickMode(false);setShowForm(v=>!v)}}>{showForm&&!quickMode?'✕ 닫기':'+ 고객 등록'}</button>
        </div>
      </div>

      {showForm&&(
        <div style={{...card,marginBottom:16}}>
          <div style={cardH}>
            <span>{quickMode?'⚡ 당직 고객 빠른 등록':'신규 고객 등록'}</span>
            <button style={{...btn(),fontSize:12}} onClick={()=>setShowForm(false)}>✕</button>
          </div>
          <div style={{padding:22,display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            <div><label style={lbl}>이름 *</label><input style={inp} placeholder="홍길동" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} /></div>
            <div><label style={lbl}>전화번호</label><PhoneInput style={inp} value={form.phone} onChange={(v:string)=>setForm(p=>({...p,phone:v}))} /></div>
            <div><label style={lbl}>관심 차종</label><input style={inp} placeholder="GLE 450" value={form.interest_model} onChange={e=>setForm(p=>({...p,interest_model:e.target.value}))} /></div>
            <div style={{gridColumn:'1/-1'}}><label style={lbl}>메모</label><textarea style={{...inp,height:80,resize:'none' as const}} placeholder="특이사항 메모..." value={form.memo} onChange={e=>setForm(p=>({...p,memo:e.target.value}))} /></div>
            {!quickMode&&<>
              <div style={{gridColumn:'1/-1'}}><label style={lbl}>계약 차량 모델</label><input style={inp} placeholder="E 350 4MATIC" value={form.car_model} onChange={e=>setForm(p=>({...p,car_model:e.target.value}))} /></div>
              <div style={{gridColumn:'1/-1'}}><label style={lbl}>고객 주소</label><input style={inp} placeholder="서울시 강남구..." value={form.address} onChange={e=>setForm(p=>({...p,address:e.target.value}))} /></div>
              <div style={{gridColumn:'1/-1'}}><label style={lbl}>최초 상담일</label><input style={inp} type="date" value={form.consultation_date} onChange={e=>setForm(p=>({...p,consultation_date:e.target.value}))} /></div>
              <div style={{gridColumn:'1/-1'}}>
                <label style={lbl}>메모</label>
                <textarea style={{...inp,height:72,resize:'none' as const}} placeholder="특이사항 메모..." value={form.memo} onChange={e=>setForm(p=>({...p,memo:e.target.value}))} />
              </div>
            </>}
            <div style={{gridColumn:'1/-1'}}>
              <label style={lbl}>상담 단계</label>
              <div style={{display:'flex',gap:8,flexWrap:'wrap' as const}}>
                {STAGES.map(s=>(
                  <button key={s.key} onClick={()=>setForm(p=>({...p,stage:s.key}))}
                    style={{padding:'6px 12px',borderRadius:3,fontSize:12,cursor:'pointer',border:`1px solid ${form.stage===s.key?s.color:BORDER}`,background:form.stage===s.key?s.bg:WHITE,color:form.stage===s.key?s.color:TX3,fontWeight:form.stage===s.key?600:400}}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{gridColumn:'1/-1',display:'flex',gap:8,justifyContent:'flex-end'}}>
              <button style={btn()} onClick={()=>setShowForm(false)}>취소</button>
              <button style={btn('navy')} onClick={save} disabled={saving}>{saving?'저장중...':'저장'}</button>
            </div>
          </div>
        </div>
      )}

      <div style={{display:'flex',gap:8,marginBottom:10,flexWrap:'wrap' as const}}>
        {[{key:'all',label:'전체',c:TX1},{key:'delivered',label:'출고 고객',c:GREEN},{key:'prospect',label:'가망 고객',c:BLUE},...Array.from({length:12},(_,i)=>({key:`month_${i+1}`,label:`${i+1}월`,c:TX2}))].map(cat=>(
          <button key={cat.key} onClick={()=>setCategoryFilter(cat.key)} style={{padding:'6px 12px',borderRadius:3,fontSize:12,cursor:'pointer',background:categoryFilter===cat.key?NAVY:WHITE,color:categoryFilter===cat.key?CREAM:TX2,border:`1px solid ${categoryFilter===cat.key?NAVY:BORDER}`,fontWeight:categoryFilter===cat.key?500:400,flexShrink:0}}>
            {cat.label}
          </button>
        ))}
      </div>

      <div style={{display:'flex',gap:8,marginBottom:12,flexWrap:'wrap' as const}}>
        <input style={{...inp,flex:1,minWidth:200}} placeholder="이름, 전화번호, 차량 검색..." value={search} onChange={e=>setSearch(e.target.value)} />
        <select style={{...inp,width:'auto'}} value={stageFilter} onChange={e=>setStageFilter(e.target.value)}>
          <option value="all">전체 단계</option>
          {STAGES.map(s=><option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
      </div>

      <div style={card}>
        <div style={{display:'grid',gridTemplateColumns:'1.5fr 1.5fr 1fr 0.8fr 0.6fr',padding:'12px 20px',background:CREAM2,fontSize:11,color:TX3,letterSpacing:'.07em',textTransform:'uppercase' as const,fontWeight:500,borderBottom:`1px solid ${BORDER}`}}>
          <span>고객</span><span>관심 차종</span><span>상담일</span><span>단계</span><span></span>
        </div>
        {filtered.length===0&&<div style={{padding:'48px',color:TX3,fontSize:14,textAlign:'center'}}>등록된 고객이 없어요.</div>}
        {filtered.map((c:any,i:number)=>{
          const stg=getStage(c.stage||'first_visit')
          return(
            <div key={c.id} style={{display:'grid',gridTemplateColumns:'1.5fr 1.5fr 1fr 0.8fr 0.6fr',padding:'13px 20px',borderBottom:i===filtered.length-1?'none':`1px solid ${BORDER2}`,alignItems:'center',cursor:'pointer'}} onClick={()=>onSelect(c)}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{...av(NAVY),position:'relative'}}>
                  {c.name?.[0]||'?'}
                  {c.is_vip&&<div style={{position:'absolute',top:-4,right:-4,fontSize:9}}>⭐</div>}
                </div>
                <div>
                  <div style={{fontSize:14,fontWeight:500,color:TX1}}>{c.name}</div>
                  <div style={{fontSize:12,color:TX3}}>{c.phone||'—'}</div>
                </div>
              </div>
              <span style={{fontSize:13,color:TX2}}>{c.interest_model||c.car_model||'—'}</span>
              <span style={{fontSize:13,color:TX3}}>{c.consultation_date||c.delivery_date||'—'}</span>
              <span style={badge(stg.color,stg.bg,stg.bd)}>{stg.label}</span>
              <button style={btn('sm')} onClick={e=>{e.stopPropagation();onSelect(c)}}>상세 →</button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Templates({templates,setTemplates}:any){
  const supabase=createClient()
  const [showForm,setShowForm]=useState(false)
  const [form,setForm]=useState({title:'',content:'',category:'general'})
  const [saving,setSaving]=useState(false)
  const [copied,setCopied]=useState<string|null>(null)
  const [filter,setFilter]=useState('all')

  const CATEGORIES=[{key:'all',label:'전체'},{key:'general',label:'일반'},{key:'greeting',label:'안부'},{key:'followup',label:'팔로업'},{key:'inspection',label:'점검 안내'},{key:'birthday',label:'생일 축하'}]

  const save=async()=>{
    if(!form.title||!form.content) return;setSaving(true)
    const{data:{user}}=await supabase.auth.getUser()
    const{data}=await supabase.from('templates').insert({...form,salesperson_id:user?.id}).select()
    if(data) setTemplates((p:any)=>[data[0],...p])
    setForm({title:'',content:'',category:'general'});setShowForm(false);setSaving(false)
  }
  const del=async(id:string)=>{
    await supabase.from('templates').delete().eq('id',id)
    setTemplates((p:any)=>p.filter((t:any)=>t.id!==id))
  }
  const copy=async(text:string,id:string)=>{
    await navigator.clipboard.writeText(text)
    setCopied(id);setTimeout(()=>setCopied(null),2000)
  }

  const filtered=filter==='all'?templates:templates.filter((t:any)=>t.category===filter)

  const DEFAULT_TEMPLATES=[
    {title:'차량 인도 감사 문자',category:'greeting',content:'안녕하세요 고객님! 오늘 [차량명] 인도 진심으로 축하드립니다 🎉 앞으로도 소중한 드라이빙 라이프를 위해 항상 함께하겠습니다. 불편하신 점 있으시면 언제든지 연락 주세요 😊'},
    {title:'정기점검 안내',category:'inspection',content:'안녕하세요 고객님! 담당 컨설턴트 [이름]입니다. 차량 인도 후 1년이 되었습니다. 정기점검을 통해 안전한 드라이빙을 유지하시기 바랍니다. 편하신 시간에 전시장으로 방문해 주세요 🔧'},
    {title:'생일 축하 문자',category:'birthday',content:'안녕하세요 고객님! 오늘 생신을 진심으로 축하드립니다 🎂🎉 항상 건강하시고 행복한 하루 보내세요! 담당 컨설턴트 [이름] 드림'},
    {title:'시승 팔로업',category:'followup',content:'안녕하세요 고객님! 지난번 시승 어떠셨나요? 궁금하신 점이나 추가로 확인하고 싶으신 사항 있으시면 편하게 연락 주세요. 좋은 결정 도와드리겠습니다 😊'},
  ]

  const addDefault=async(t:any)=>{
    const{data:{user}}=await supabase.auth.getUser()
    const{data}=await supabase.from('templates').insert({...t,salesperson_id:user?.id}).select()
    if(data) setTemplates((p:any)=>[data[0],...p])
  }

  return(
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:26}}>
        <div>
          <div style={{fontSize:24,fontWeight:500,color:TX1,letterSpacing:'-.02em',marginBottom:5}}>문자 템플릿</div>
          <div style={{fontSize:13,color:TX3}}>자주 쓰는 문자 저장하고 원클릭 복사</div>
        </div>
        <button style={btn('navy')} onClick={()=>setShowForm(v=>!v)}>{showForm?'✕ 닫기':'+ 템플릿 추가'}</button>
      </div>

      {templates.length===0&&(
        <div style={{...card,padding:24,marginBottom:16}}>
          <div style={{fontSize:14,color:TX2,marginBottom:16,fontWeight:500}}>💡 자주 쓰는 템플릿을 추가해보세요! 아래 기본 템플릿으로 시작할 수 있어요.</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            {DEFAULT_TEMPLATES.map((t,i)=>(
              <div key={i} style={{background:CREAM,border:`1px solid ${BORDER}`,borderRadius:4,padding:'14px 16px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{fontSize:13,color:TX1,fontWeight:500}}>{t.title}</span>
                <button style={btn('navy')} onClick={()=>addDefault(t)}>추가</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {showForm&&(
        <div style={{...card,marginBottom:16}}>
          <div style={cardH}><span>새 템플릿 추가</span></div>
          <div style={{padding:22,display:'grid',gap:14}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
              <div><label style={lbl}>제목</label><input style={inp} placeholder="차량 인도 감사 문자" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} /></div>
              <div>
                <label style={lbl}>카테고리</label>
                <select style={inp} value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>
                  {CATEGORIES.filter(c=>c.key!=='all').map(c=><option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={lbl}>내용</label>
              <textarea style={{...inp,height:120,resize:'none' as const}} placeholder="문자 내용을 입력하세요. [고객명], [차량명], [이름] 등으로 변수 표시 가능" value={form.content} onChange={e=>setForm(p=>({...p,content:e.target.value}))} />
            </div>
            <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
              <button style={btn()} onClick={()=>setShowForm(false)}>취소</button>
              <button style={btn('navy')} onClick={save} disabled={saving}>{saving?'저장중...':'저장'}</button>
            </div>
          </div>
        </div>
      )}

      <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap' as const}}>
        {CATEGORIES.map(c=>(
          <button key={c.key} onClick={()=>setFilter(c.key)} style={{padding:'7px 16px',borderRadius:3,fontSize:12,cursor:'pointer',background:filter===c.key?NAVY:WHITE,color:filter===c.key?CREAM:TX2,border:`1px solid ${filter===c.key?NAVY:BORDER}`,fontWeight:filter===c.key?500:400}}>
            {c.label}
          </button>
        ))}
      </div>

      {filtered.length===0&&templates.length>0&&<div style={{padding:'48px',color:TX3,fontSize:14,textAlign:'center',background:WHITE,borderRadius:4,border:`1px solid ${BORDER}`}}>이 카테고리에 템플릿이 없어요.</div>}
      <div style={{display:'grid',gap:12}}>
        {filtered.map((t:any)=>(
          <div key={t.id} style={{background:WHITE,border:`1px solid ${BORDER}`,borderRadius:4,padding:'18px 22px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <span style={{fontSize:15,fontWeight:500,color:TX1}}>{t.title}</span>
                <span style={badge(NAVY3,CREAM2,BORDER)}>{CATEGORIES.find(c=>c.key===t.category)?.label||'일반'}</span>
              </div>
              <div style={{display:'flex',gap:8}}>
                <button style={{...btn('navy'),background:copied===t.id?GREEN:NAVY}} onClick={()=>copy(t.content,t.id)}>
                  {copied===t.id?'✓ 복사됨':'📋 복사'}
                </button>
                <button style={{...btn(),color:RED,borderColor:RED+'40'}} onClick={()=>del(t.id)}>삭제</button>
              </div>
            </div>
            <div style={{fontSize:13,color:TX2,lineHeight:1.8,background:CREAM,borderRadius:3,padding:'12px 14px',whiteSpace:'pre-wrap' as const}}>{t.content}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Partners({partners,setPartners}:any){
  const supabase=createClient()
  const [showForm,setShowForm]=useState(false)
  const [form,setForm]=useState({name:'',category:'',phone:'',reward_description:''})
  const [saving,setSaving]=useState(false)
  const save=async()=>{
    if(!form.name) return;setSaving(true)
    const{data:{user}}=await supabase.auth.getUser()
    const{data}=await supabase.from('partners').insert({...form,salesperson_id:user?.id}).select()
    if(data) setPartners((p:any)=>[data[0],...p])
    setForm({name:'',category:'',phone:'',reward_description:''});setShowForm(false);setSaving(false)
  }
  return(
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
            <div><label style={lbl}>전화번호</label><PhoneInput style={inp} placeholder="02-000-0000" value={form.phone} onChange={(v:string)=>setForm(p=>({...p,phone:v}))} /></div>
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

function Calendar(){
  const supabase=createClient()
  const [currentDate,setCurrentDate]=useState(new Date())
  const [allSchedules,setAllSchedules]=useState<any[]>([])
  const [allClients,setAllClients]=useState<any[]>([])
  const [selectedDate,setSelectedDate]=useState<string|null>(null)
  const [loading,setLoading]=useState(true)
  const [showAddForm,setShowAddForm]=useState(false)
  const [addForm,setAddForm]=useState({type:'memo',client_id:'',note:'',time:''})
  const [saving,setSaving]=useState(false)
  const year=currentDate.getFullYear(),month=currentDate.getMonth()

  useEffect(()=>{
    const load=async()=>{
      setLoading(true)
      const s=new Date(year,month,1).toISOString().split('T')[0]
      const e=new Date(year,month+1,0).toISOString().split('T')[0]
      const[sc,cl]=await Promise.all([
        supabase.from('schedules').select('*, clients(name,car_model)').gte('scheduled_date',s).lte('scheduled_date',e).order('scheduled_date'),
        supabase.from('clients').select('id,name,phone').order('name')
      ])
      setAllSchedules(sc.data||[]);setAllClients(cl.data||[]);setLoading(false)
    }
    load()
  },[year,month])

  const firstDay=new Date(year,month,1).getDay()
  const daysInMonth=new Date(year,month+1,0).getDate()
  const days:(number|null)[]=[]
  for(let i=0;i<firstDay;i++) days.push(null)
  for(let i=1;i<=daysInMonth;i++) days.push(i)

  const getDateStr=(day:number)=>`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
  const handleDateClick=(dateStr:string)=>{setSelectedDate(dateStr===selectedDate?null:dateStr);setShowAddForm(false);setAddForm({type:'memo',client_id:'',note:'',time:''})}
  const addSchedule=async()=>{
    if(!addForm.note.trim()||!selectedDate) return;setSaving(true)
    const ins:any={scheduled_date:selectedDate,type:'inspection',is_contacted:false,note:(addForm.time?`[${addForm.time}] `:'')+( addForm.type==='client'?addForm.note:`📝 ${addForm.note}`)}
    if(addForm.type==='client'&&addForm.client_id) ins.client_id=addForm.client_id
    const{data}=await supabase.from('schedules').insert(ins).select('*, clients(name,car_model)')
    if(data) setAllSchedules(p=>[...p,...data])
    setShowAddForm(false);setAddForm({type:'memo',client_id:'',note:'',time:''});setSaving(false)
  }
  const delSchedule=async(id:string)=>{await supabase.from('schedules').delete().eq('id',id);setAllSchedules(p=>p.filter(s=>s.id!==id))}
  const todayStr=new Date().toISOString().split('T')[0]
  const selectedSchedules=selectedDate?allSchedules.filter(s=>s.scheduled_date===selectedDate):[]
  const weekDays=['일','월','화','수','목','금','토']
  const monthNames=['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']

  return(
    <div>
      <div style={{fontSize:24,fontWeight:500,color:TX1,letterSpacing:'-.02em',marginBottom:5}}>캘린더</div>
      <div style={{fontSize:13,color:TX3,marginBottom:26}}>월별 연락 일정 한눈에 보기</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:20}}>
        <div style={{background:WHITE,border:`1px solid ${BORDER}`,borderRadius:4,overflow:'hidden'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'18px 24px',borderBottom:`1px solid ${BORDER}`}}>
            <button onClick={()=>setCurrentDate(new Date(year,month-1,1))} style={{background:'transparent',border:`1px solid ${BORDER}`,borderRadius:3,padding:'6px 14px',fontSize:13,cursor:'pointer',color:TX2}}>‹</button>
            <div style={{fontSize:16,fontWeight:500,color:TX1}}>{year}년 {monthNames[month]}</div>
            <button onClick={()=>setCurrentDate(new Date(year,month+1,1))} style={{background:'transparent',border:`1px solid ${BORDER}`,borderRadius:3,padding:'6px 14px',fontSize:13,cursor:'pointer',color:TX2}}>›</button>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',background:CREAM2}}>
            {weekDays.map((d,i)=><div key={d} style={{padding:'10px 0',textAlign:'center',fontSize:11,fontWeight:500,color:i===0?RED:i===6?BLUE:TX3}}>{d}</div>)}
          </div>
          {loading?<div style={{padding:'48px',textAlign:'center',color:TX3}}>불러오는 중...</div>:(
            <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)'}}>
              {days.map((day,idx)=>{
                if(!day) return <div key={`e-${idx}`} style={{minHeight:80,borderRight:`1px solid ${BORDER2}`,borderBottom:`1px solid ${BORDER2}`}} />
                const dateStr=getDateStr(day)
                const daySc=allSchedules.filter(s=>s.scheduled_date===dateStr)
                const isToday=dateStr===todayStr,isSel=dateStr===selectedDate
                const isSun=idx%7===0,isSat=idx%7===6
                return(
                  <div key={day} onClick={()=>handleDateClick(dateStr)}
                    style={{minHeight:80,padding:'8px 10px',borderRight:`1px solid ${BORDER2}`,borderBottom:`1px solid ${BORDER2}`,background:isSel?'#EEF2FF':isToday?GOLD_BG:WHITE,cursor:'pointer',transition:'background .1s'}}>
                    <div style={{fontSize:13,fontWeight:isToday?600:400,width:24,height:24,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'50%',background:isToday?GOLD:'transparent',color:isToday?WHITE:isSun?RED:isSat?BLUE:TX1,marginBottom:4}}>{day}</div>
                    <div style={{display:'flex',flexDirection:'column',gap:2}}>
                      {daySc.slice(0,3).map((sc:any)=>{
                        const lb=getLabel(sc.note)
                        return <div key={sc.id} style={{fontSize:10,padding:'2px 5px',borderRadius:2,background:lb.bg,color:lb.color,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{sc.clients?.name} {lb.label}</div>
                      })}
                      {daySc.length>3&&<div style={{fontSize:10,color:TX3}}>+{daySc.length-3}건</div>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
        <div>
          <div style={{background:WHITE,border:`1px solid ${BORDER}`,borderRadius:4,overflow:'hidden',position:'sticky',top:0}}>
            <div style={{padding:'14px 20px',borderBottom:`1px solid ${BORDER}`,fontSize:13,fontWeight:600,color:TX1,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <span>{selectedDate?`${selectedDate.replace(/-/g,'.')} 일정`:'날짜를 선택하세요'}</span>
              {selectedDate&&<button style={{...btn('navy'),padding:'5px 12px',fontSize:12}} onClick={()=>setShowAddForm(v=>!v)}>{showAddForm?'✕ 닫기':'+ 추가'}</button>}
            </div>
            {showAddForm&&selectedDate&&(
              <div style={{padding:'16px 18px',borderBottom:`1px solid ${BORDER2}`,background:CREAM}}>
                <div style={{display:'flex',gap:8,marginBottom:12}}>
                  {[{v:'memo',l:'📝 개인 메모'},{v:'client',l:'👤 고객 연결'}].map(t=>(
                    <button key={t.v} onClick={()=>setAddForm(p=>({...p,type:t.v,client_id:''}))} style={{flex:1,padding:'8px',borderRadius:4,fontSize:12,cursor:'pointer',fontWeight:addForm.type===t.v?600:400,background:addForm.type===t.v?NAVY:WHITE,color:addForm.type===t.v?WHITE:TX2,border:`1px solid ${addForm.type===t.v?NAVY:BORDER}`}}>{t.l}</button>
                  ))}
                </div>
                {addForm.type==='client'&&(
                  <div style={{marginBottom:10}}>
                    <label style={lbl}>고객 선택</label>
                    <select style={inp} value={addForm.client_id} onChange={e=>setAddForm(p=>({...p,client_id:e.target.value}))}>
                      <option value="">고객 선택...</option>
                      {allClients.map((c:any)=><option key={c.id} value={c.id}>{c.name} {c.phone?`(${c.phone})`:''}</option>)}
                    </select>
                  </div>
                )}
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
                  <div><label style={lbl}>시간 (선택)</label><input style={inp} type="time" value={addForm.time} onChange={e=>setAddForm(p=>({...p,time:e.target.value}))} /></div>
                  <div style={{display:'flex',alignItems:'flex-end',paddingBottom:4}}><span style={{fontSize:12,color:TX3}}>{selectedDate}</span></div>
                </div>
                <div style={{marginBottom:10}}>
                  <label style={lbl}>내용 *</label>
                  <textarea style={{...inp,height:72,resize:'none' as const,fontSize:14}} placeholder={addForm.type==='memo'?'메모 내용...':'팔로업, 미팅 내용...'} value={addForm.note} onChange={e=>setAddForm(p=>({...p,note:e.target.value}))} />
                </div>
                <button style={{...btn('navy'),width:'100%',padding:'10px'}} onClick={addSchedule} disabled={saving}>{saving?'저장중...':'저장'}</button>
              </div>
            )}
            {!selectedDate&&<div style={{padding:'32px',textAlign:'center',color:TX3,fontSize:13}}>달력에서 날짜를 클릭하면<br/>그날 일정이 표시돼요</div>}
            {selectedDate&&selectedSchedules.length===0&&!showAddForm&&<div style={{padding:'28px',textAlign:'center',color:TX3,fontSize:13}}><div style={{fontSize:22,marginBottom:8}}>📅</div>이날 일정이 없어요<br/><span style={{fontSize:12,color:GOLD,cursor:'pointer'}} onClick={()=>setShowAddForm(true)}>+ 일정 추가하기</span></div>}
            {selectedSchedules.map((sc:any,i:number)=>{
              const lb=getLabel(sc.note)
              return(
                <div key={sc.id} style={{padding:'14px 20px',borderBottom:i===selectedSchedules.length-1?'none':`1px solid ${BORDER2}`}}>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6}}>
                    <div style={{...av(lb.color),width:32,height:32,fontSize:12}}>{sc.clients?.name?.[0]||'?'}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:500,color:TX1}}>{sc.clients?.name}</div>
                      <div style={{fontSize:11,color:TX3}}>{sc.clients?.car_model||'차량 미등록'}</div>
                    </div>
                    <span style={badge(lb.color,lb.bg,lb.bd)}>{lb.label}</span>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                    {sc.note&&<div style={{fontSize:12,color:TX2,paddingLeft:42,flex:1}}>{sc.note.replace(/^\[.+?\]\s*/,'').replace(/^📝\s*/,'')}</div>}
                    <button style={{fontSize:11,color:TX3,background:'transparent',border:'none',cursor:'pointer',padding:'0 4px',flexShrink:0}} onClick={()=>delSchedule(sc.id)}>✕</button>
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{background:WHITE,border:`1px solid ${BORDER}`,borderRadius:4,padding:'18px 20px',marginTop:16}}>
            <div style={{fontSize:12,fontWeight:500,color:TX1,marginBottom:14}}>{monthNames[month]} 일정 요약</div>
            {[{label:'감사문자',color:GREEN,bg:GREEN_BG,bd:GREEN_BD},{label:'1년 점검',color:BLUE,bg:BLUE_BG,bd:BLUE_BD},{label:'2년 점검',color:BLUE,bg:BLUE_BG,bd:BLUE_BD},{label:'3년 점검',color:BLUE,bg:BLUE_BG,bd:BLUE_BD}].map(type=>{
              const count=allSchedules.filter(s=>getLabel(s.note).label===type.label).length
              if(count===0) return null
              return(
                <div key={type.label} style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                  <span style={badge(type.color,type.bg,type.bd)}>{type.label}</span>
                  <span style={{fontSize:13,fontWeight:500,color:TX1}}>{count}건</span>
                </div>
              )
            })}
            {allSchedules.length===0&&<div style={{fontSize:13,color:TX3}}>이번달 일정이 없어요</div>}
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

function Report({clients}:any){
  const now=new Date()
  const [selYear,setSelYear]=useState(now.getFullYear())
  const [selMonth,setSelMonth]=useState(now.getMonth()+1)

  const monthNames=['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']
  const years=[now.getFullYear()-1,now.getFullYear(),now.getFullYear()+1]

  // 해당 월 계약/출고 고객
  const monthClients=clients.filter((c:any)=>{
    const d=new Date(c.created_at)
    return d.getFullYear()===selYear&&d.getMonth()+1===selMonth
  })
  const contracted=clients.filter((c:any)=>c.stage==='contract'||c.stage==='delivered')
  const delivered=clients.filter((c:any)=>c.stage==='delivered')

  // 소개 받은 고객 수
  const referred=clients.filter((c:any)=>c.referred_by)
  // 소개를 많이 한 고객 TOP5
  const referrerCount:Record<string,number>={}
  referred.forEach((c:any)=>{
    if(c.referred_by) referrerCount[c.referred_by]=(referrerCount[c.referred_by]||0)+1
  })
  const topReferrers=Object.entries(referrerCount)
    .sort((a:any,b:any)=>b[1]-a[1])
    .slice(0,5)
    .map(([id,count])=>({client:clients.find((c:any)=>c.id===id),count}))
    .filter(r=>r.client)

  // 단계별 전환율
  const total=clients.length||1
  const stageStats=STAGES.map(s=>({
    ...s,
    count:clients.filter((c:any)=>c.stage===s.key).length,
    pct:Math.round(clients.filter((c:any)=>c.stage===s.key).length/total*100)
  }))

  // 월별 등록 추이 (최근 6개월)
  const monthlyData=Array.from({length:6},(_,i)=>{
    const d=new Date(selYear,selMonth-1-i,1)
    const y=d.getFullYear(),m=d.getMonth()+1
    const cnt=clients.filter((c:any)=>{
      const cd=new Date(c.created_at)
      return cd.getFullYear()===y&&cd.getMonth()+1===m
    }).length
    return {label:`${m}월`,count:cnt,y,m}
  }).reverse()
  const maxMonthly=Math.max(...monthlyData.map(d=>d.count),1)

  return(
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:28}}>
        <div>
          <div style={{fontSize:24,fontWeight:500,color:TX1,letterSpacing:'-.02em',marginBottom:5}}>실적 리포트</div>
          <div style={{fontSize:13,color:TX3}}>영업 현황 분석</div>
        </div>
        <div style={{display:'flex',gap:8}}>
          <select style={{...inp,width:'auto'}} value={selYear} onChange={e=>setSelYear(Number(e.target.value))}>
            {years.map(y=><option key={y} value={y}>{y}년</option>)}
          </select>
          <select style={{...inp,width:'auto'}} value={selMonth} onChange={e=>setSelMonth(Number(e.target.value))}>
            {monthNames.map((m,i)=><option key={i+1} value={i+1}>{m}</option>)}
          </select>
        </div>
      </div>

      {/* 핵심 지표 */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
        {[
          {l:'전체 고객',v:clients.length,s:'누적',c:TX1},
          {l:'이번달 신규',v:monthClients.length,s:`${selMonth}월`,c:BLUE},
          {l:'계약·출고',v:contracted.length,s:'누적',c:PURPLE},
          {l:'소개 고객',v:referred.length,s:`전체의 ${Math.round(referred.length/total*100)}%`,c:GREEN},
        ].map((s,i)=>(
          <div key={i} style={{background:WHITE,border:`1px solid ${BORDER}`,borderRadius:4,padding:'18px 20px'}}>
            <div style={{fontSize:10,color:TX3,textTransform:'uppercase' as const,letterSpacing:'.08em',marginBottom:8,fontWeight:500}}>{s.l}</div>
            <div style={{fontSize:30,fontWeight:400,color:s.c,letterSpacing:'-.02em'}}>{s.v}</div>
            <div style={{fontSize:12,color:TX3,marginTop:4}}>{s.s}</div>
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
        {/* 월별 신규 고객 추이 */}
        <div style={card}>
          <div style={cardH}><span>최근 6개월 신규 고객</span></div>
          <div style={{padding:'20px 24px'}}>
            <div style={{display:'flex',alignItems:'flex-end',gap:10,height:120}}>
              {monthlyData.map((d,i)=>(
                <div key={i} style={{flex:1,display:'flex',flexDirection:'column' as const,alignItems:'center',gap:6}}>
                  <div style={{fontSize:12,fontWeight:500,color:d.y===selYear&&d.m===selMonth?NAVY:TX2}}>{d.count}</div>
                  <div style={{width:'100%',borderRadius:'2px 2px 0 0',background:d.y===selYear&&d.m===selMonth?NAVY:BORDER,height:`${Math.max(Math.round(d.count/maxMonthly*80),4)}px`,transition:'height .3s'}} />
                  <div style={{fontSize:11,color:TX3}}>{d.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 계약 단계별 현황 */}
        <div style={card}>
          <div style={cardH}><span>계약 단계별 현황</span></div>
          <div style={{padding:'16px 20px'}}>
            {stageStats.map((s,i)=>(
              <div key={i} style={{marginBottom:i===stageStats.length-1?0:14}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                  <span style={badge(s.color,s.bg,s.bd)}>{s.label}</span>
                  <span style={{fontSize:13,fontWeight:500,color:TX1}}>{s.count}명 ({s.pct}%)</span>
                </div>
                <div style={{height:4,background:BORDER,borderRadius:2}}>
                  <div style={{height:4,width:`${s.pct}%`,background:s.color,borderRadius:2,transition:'width .3s'}} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        {/* 소개 TOP 고객 */}
        <div style={card}>
          <div style={cardH}><span>소개 많이 해준 고객 TOP 5</span></div>
          {topReferrers.length===0&&<div style={{padding:'32px',textAlign:'center',color:TX3,fontSize:14}}>소개 데이터가 없어요</div>}
          {topReferrers.map((r:any,i:number)=>(
            <div key={i} style={{...row,borderBottom:i===topReferrers.length-1?'none':`1px solid ${BORDER2}`}}>
              <div style={{width:24,height:24,borderRadius:'50%',background:i===0?GOLD:BORDER,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:i===0?WHITE:TX3,flexShrink:0}}>{i+1}</div>
              <div style={av(NAVY)}>{r.client.name?.[0]||'?'}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:500,color:TX1}}>{r.client.name}</div>
                <div style={{fontSize:12,color:TX3}}>{r.client.phone||'—'}</div>
              </div>
              <span style={{fontSize:14,fontWeight:600,color:GREEN}}>{r.count}건</span>
            </div>
          ))}
        </div>

        {/* 이번달 신규 고객 목록 */}
        <div style={card}>
          <div style={cardH}>
            <span>{selMonth}월 신규 고객</span>
            <span style={{fontSize:12,color:TX3}}>{monthClients.length}명</span>
          </div>
          {monthClients.length===0&&<div style={{padding:'32px',textAlign:'center',color:TX3,fontSize:14}}>이번달 신규 고객이 없어요</div>}
          {monthClients.map((c:any,i:number)=>{
            const stg=getStage(c.stage||'first_visit')
            return(
              <div key={c.id} style={{...row,padding:'12px 20px',borderBottom:i===monthClients.length-1?'none':`1px solid ${BORDER2}`}}>
                <div style={av(NAVY)}>{c.name?.[0]||'?'}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:500,color:TX1}}>{c.name}</div>
                  <div style={{fontSize:11,color:TX3}}>{c.interest_model||c.car_model||'차량 미정'}</div>
                </div>
                <span style={badge(stg.color,stg.bg,stg.bd)}>{stg.label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Profile({salesperson,setSalesperson,user}:any){
  const supabase=createClient()
  const [form,setForm]=useState({
    name:salesperson?.name||'',
    phone:salesperson?.phone||'',
    brand:salesperson?.brand||'',
    dealer_name:salesperson?.dealer_name||'',
  })
  const [saving,setSaving]=useState(false)
  const [saved,setSaved]=useState(false)
  const [pwForm,setPwForm]=useState({current:'',next:'',confirm:''})
  const [pwSaving,setPwSaving]=useState(false)
  const [pwMsg,setPwMsg]=useState('')
  const [resetSent,setResetSent]=useState(false)

  const BRANDS=['현대','기아','제네시스','쌍용(KG모빌리티)','르노코리아','GM 한국사업장','메르세데스-벤츠','BMW','아우디','폭스바겐','포르쉐','볼보','랜드로버','Jeep','푸조','시트로엥','미니(MINI)','렉서스','도요타','혼다','닛산','인피니티','캐딜락','링컨','포드','테슬라','기타']

  const saveProfile=async()=>{
    setSaving(true)
    const{data:{user:u}}=await supabase.auth.getUser()
    const{data}=await supabase.from('salespersons').update({name:form.name,phone:form.phone||null,brand:form.brand,dealer_name:form.dealer_name||null}).eq('id',u?.id).select()
    if(data) setSalesperson(data[0])
    setSaving(false);setSaved(true);setTimeout(()=>setSaved(false),2000)
  }

  const changePw=async()=>{
    if(pwForm.next!==pwForm.confirm){setPwMsg('새 비밀번호가 일치하지 않아요');return}
    if(pwForm.next.length<6){setPwMsg('비밀번호는 6자리 이상이어야 해요');return}
    setPwSaving(true);setPwMsg('')
    const{error}=await supabase.auth.updateUser({password:pwForm.next})
    if(error) setPwMsg('비밀번호 변경 실패: '+error.message)
    else{setPwMsg('✓ 비밀번호가 변경됐어요!');setPwForm({current:'',next:'',confirm:''})}
    setPwSaving(false)
  }

  const sendReset=async()=>{
    if(!user?.email) return
    await supabase.auth.resetPasswordForEmail(user.email,{redirectTo:window.location.origin+'/login'})
    setResetSent(true)
  }

  return(
    <div>
      <div style={{fontSize:24,fontWeight:500,color:TX1,letterSpacing:'-.02em',marginBottom:5}}>프로필 설정</div>
      <div style={{fontSize:13,color:TX3,marginBottom:26}}>내 정보 및 계정 설정</div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
        {/* 프로필 정보 */}
        <div style={card}>
          <div style={cardH}><span>기본 정보</span></div>
          <div style={{padding:22,display:'grid',gap:14}}>
            <div><label style={lbl}>이름</label><input style={inp} value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} /></div>
            <div><label style={lbl}>전화번호</label><PhoneInput style={inp} value={form.phone} onChange={(v:string)=>setForm(p=>({...p,phone:v}))} /></div>
            <div>
              <label style={lbl}>브랜드</label>
              <select style={inp} value={form.brand} onChange={e=>setForm(p=>({...p,brand:e.target.value}))}>
                <option value="">선택</option>
                {BRANDS.map(b=><option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div><label style={lbl}>전시장명</label><input style={inp} placeholder="강남 공식 전시장" value={form.dealer_name} onChange={e=>setForm(p=>({...p,dealer_name:e.target.value}))} /></div>
            <div style={{fontSize:13,color:TX3,padding:'10px 14px',background:CREAM,borderRadius:3}}>
              📧 이메일: {user?.email}
            </div>
            <button style={btn('navy')} onClick={saveProfile} disabled={saving}>
              {saving?'저장중...':saved?'✓ 저장됐어요!':'저장'}
            </button>
          </div>
        </div>

        {/* 비밀번호 변경 */}
        <div>
          <div style={card}>
            <div style={cardH}><span>비밀번호 변경</span></div>
            <div style={{padding:22,display:'grid',gap:14}}>
              <div><label style={lbl}>새 비밀번호</label><input style={inp} type="password" placeholder="6자리 이상" value={pwForm.next} onChange={e=>setPwForm(p=>({...p,next:e.target.value}))} /></div>
              <div><label style={lbl}>새 비밀번호 확인</label><input style={inp} type="password" placeholder="동일하게 입력" value={pwForm.confirm} onChange={e=>setPwForm(p=>({...p,confirm:e.target.value}))} /></div>
              {pwMsg&&<div style={{fontSize:13,color:pwMsg.includes('✓')?GREEN:RED,padding:'10px 12px',background:pwMsg.includes('✓')?GREEN_BG:'#FFF5F5',borderRadius:3}}>{pwMsg}</div>}
              <button style={btn('navy')} onClick={changePw} disabled={pwSaving}>{pwSaving?'변경중...':'비밀번호 변경'}</button>
            </div>
          </div>

          <div style={card}>
            <div style={cardH}><span>비밀번호를 잊으셨나요?</span></div>
            <div style={{padding:22}}>
              <div style={{fontSize:13,color:TX2,marginBottom:16,lineHeight:1.6}}>
                가입한 이메일({user?.email})로 비밀번호 재설정 링크를 보내드려요.
              </div>
              {resetSent?(
                <div style={{fontSize:13,color:GREEN,padding:'10px 12px',background:GREEN_BG,borderRadius:3}}>✓ 이메일을 확인해주세요!</div>
              ):(
                <button style={btn()} onClick={sendReset}>재설정 이메일 보내기</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ===================== 모바일 앱 =====================
function MobileApp({page,setPage,user,salesperson,setSalesperson,clients,setClients,schedules,weekSchedules,templates,setTemplates,partners,setPartners,selectedClient,setSelectedClient,signOut}:any){
  const [showQuickAdd,setShowQuickAdd]=useState(false)
  const [showCardScan,setShowCardScan]=useState(false)
  const [callMemo,setCallMemo]=useState<any>(null)

  const tabs=[
    {id:'dashboard',icon:'🏠',label:'홈'},
    {id:'today',icon:'📋',label:'오늘'},
    {id:'clients',icon:'👥',label:'고객'},
    {id:'templates',icon:'💬',label:'템플릿'},
    {id:'more',icon:'⋯',label:'더보기'},
  ]

  return(
    <div style={{minHeight:'100vh',background:CREAM,fontFamily:"'Apple SD Gothic Neo',system-ui,sans-serif",paddingBottom:70}}>
      {selectedClient&&<ClientDetail client={selectedClient} allClients={clients} onClose={()=>setSelectedClient(null)} onUpdate={(u:any)=>{setClients((p:any)=>p.map((c:any)=>c.id===u.id?u:c));setSelectedClient(u)}} onDelete={(id:string)=>{setClients((p:any)=>p.filter((c:any)=>c.id!==id));setSelectedClient(null)}} />}
      {showQuickAdd&&<MobileQuickAdd clients={clients} setClients={setClients} onClose={()=>setShowQuickAdd(false)} />}
      {showCardScan&&<MobileCardScan clients={clients} setClients={setClients} onClose={()=>setShowCardScan(false)} />}
      {callMemo&&<CallMemoPopup client={callMemo} onClose={()=>setCallMemo(null)} />}

      {/* 상단 헤더 */}
      <div style={{background:NAVY,padding:'16px 20px 12px',position:'sticky',top:0,zIndex:50}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer'}} onClick={()=>setPage('dashboard')}>
            <svg width="30" height="30" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="6" fill="#243758"/>
              <polygon points="18,6 18,14 12,10 12,18 24,18 24,10" fill="none" stroke="#C9A84C" strokeWidth="1.8" strokeLinejoin="round"/>
              <circle cx="12" cy="9" r="2.2" fill="#C9A84C"/>
              <circle cx="18" cy="5" r="2.2" fill="#C9A84C"/>
              <circle cx="24" cy="9" r="2.2" fill="#C9A84C"/>
            </svg>
            <div>
              <div style={{fontSize:9,color:NAVY3,letterSpacing:'.18em',textTransform:'uppercase' as const}}>Sales CRM</div>
              <div style={{fontSize:17,fontWeight:700,color:WHITE,letterSpacing:'.02em'}}>SalesPath</div>
            </div>
          </div>
          <div style={{textAlign:'right' as const}}>
            <div style={{fontSize:13,color:WHITE,fontWeight:500}}>{salesperson?.name||user?.email}</div>
            <div style={{fontSize:11,color:NAVY3}}>{salesperson?.brand||''}</div>
          </div>
        </div>
        {schedules.length>0&&(
          <div style={{marginTop:10,background:GOLD+'20',borderRadius:6,padding:'8px 12px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <span style={{fontSize:13,color:GOLD,fontWeight:500}}>🔔 오늘 연락 {schedules.length}건</span>
            <span style={{fontSize:12,color:GOLD,cursor:'pointer'}} onClick={()=>setPage('today')}>보기 →</span>
          </div>
        )}
      </div>

      {/* 메인 콘텐츠 */}
      <div style={{padding:'16px 16px'}}>
        {page==='dashboard'&&<MobileDashboard clients={clients} schedules={schedules} weekSchedules={weekSchedules} setPage={setPage} onSelect={setSelectedClient} salesperson={salesperson} onQuickAdd={()=>setShowQuickAdd(true)} onCardScan={()=>setShowCardScan(true)} />}
        {page==='today'&&<MobileToday schedules={schedules} />}
        {page==='clients'&&<MobileClients clients={clients} setClients={setClients} onSelect={setSelectedClient} onCall={(c:any)=>{window.location.href=`tel:${c.phone.replace(/-/g,'')}`;setTimeout(()=>setCallMemo(c),3000)}} />}
        {page==='templates'&&<MobileTemplates templates={templates} setTemplates={setTemplates} />}
        {page==='more'&&<MobileMore salesperson={salesperson} setSalesperson={setSalesperson} user={user} partners={partners} setPartners={setPartners} signOut={signOut} setPage={setPage} />}
        {page==='calendar'&&<MobileCalendar setPage={setPage} />}
        {page==='report'&&<div><div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}><button style={{...btn(),padding:'6px 12px',borderRadius:8}} onClick={()=>setPage('more')}>← 뒤로</button><div style={{fontSize:18,fontWeight:600,color:TX1}}>실적 리포트</div></div><Report clients={clients} /></div>}
        {page==='partners'&&<div><div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}><button style={{...btn(),padding:'6px 12px',borderRadius:8}} onClick={()=>setPage('more')}>← 뒤로</button><div style={{fontSize:18,fontWeight:600,color:TX1}}>제휴업체</div></div><Partners partners={partners} setPartners={setPartners} /></div>}
      </div>

      {/* 하단 탭바 */}
      <div style={{position:'fixed',bottom:0,left:0,right:0,background:WHITE,borderTop:`1px solid ${BORDER}`,display:'flex',zIndex:100,paddingBottom:'env(safe-area-inset-bottom)'}}>
        {tabs.map(t=>(
          <div key={t.id} onClick={()=>setPage(t.id)} style={{flex:1,padding:'10px 0 8px',display:'flex',flexDirection:'column' as const,alignItems:'center',gap:3,cursor:'pointer',background:page===t.id?CREAM:'transparent'}}>
            <div style={{fontSize:20}}>{t.icon}</div>
            <div style={{fontSize:10,color:page===t.id?NAVY:TX3,fontWeight:page===t.id?600:400}}>{t.label}</div>
            {t.id==='today'&&schedules.length>0&&<div style={{position:'absolute' as const,top:6,fontSize:9,background:RED,color:WHITE,borderRadius:8,padding:'1px 5px',fontWeight:700}}>{schedules.length}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}

function MobileDashboard({clients,schedules,weekSchedules,setPage,onSelect,salesperson,onQuickAdd,onCardScan}:any){
  const supabase=createClient()
  const [goal,setGoal]=useState(5)
  const now=new Date()
  const contracted=clients.filter((c:any)=>c.stage==='contract'||c.stage==='delivered')
  const todayMMDD=`${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
  const birthdayClients=clients.filter((c:any)=>c.birthday&&c.birthday.slice(5)===todayMMDD)

  useEffect(()=>{
    const load=async()=>{
      const{data:{user}}=await supabase.auth.getUser()
      if(!user) return
      const{data}=await supabase.from('monthly_goals').select('goal').eq('salesperson_id',user.id).eq('year',now.getFullYear()).eq('month',now.getMonth()+1).single()
      if(data) setGoal(data.goal)
    }
    load()
  },[])

  return(
    <div>
      {birthdayClients.length>0&&(
        <div style={{background:'#FFF5F5',border:'1px solid #FFC0C0',borderRadius:8,padding:'12px 16px',marginBottom:14,display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:20}}>🎂</span>
          <span style={{fontSize:13,color:'#C0392B',fontWeight:500}}>{birthdayClients.map((c:any)=>c.name).join(', ')} 오늘 생일!</span>
        </div>
      )}

      {/* 빠른 등록 버튼 */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
        <button onClick={onQuickAdd} style={{background:NAVY,color:WHITE,border:'none',borderRadius:10,padding:'14px',fontSize:14,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
          <span style={{fontSize:16}}>⚡</span> 빠른 등록
        </button>
        <button onClick={onCardScan} style={{background:GOLD,color:WHITE,border:'none',borderRadius:10,padding:'14px',fontSize:14,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
          <span style={{fontSize:16}}>📷</span> 명함 촬영
        </button>
      </div>

      {/* 핵심 지표 */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
        {[
          {l:'전체 고객',v:clients.length,c:TX1},
          {l:'오늘 연락',v:schedules.length,c:schedules.length>0?GOLD:TX1},
          {l:'계약·출고',v:contracted.length,c:contracted.length>0?GREEN:TX1},
          {l:'이번달 목표',v:`${contracted.length}/${goal}`,c:TX1},
        ].map((s,i)=>(
          <div key={i} style={{background:WHITE,border:`1px solid ${BORDER}`,borderRadius:8,padding:'14px 16px'}}>
            <div style={{fontSize:10,color:TX3,textTransform:'uppercase' as const,letterSpacing:'.06em',marginBottom:6,fontWeight:500}}>{s.l}</div>
            <div style={{fontSize:26,fontWeight:500,color:s.c}}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* 계약 단계 */}
      <div style={{background:WHITE,border:`1px solid ${BORDER}`,borderRadius:8,padding:'14px 16px',marginBottom:14}}>
        <div style={{fontSize:13,fontWeight:500,color:TX1,marginBottom:12}}>계약 단계 현황</div>
        <div style={{display:'flex',gap:8}}>
          {STAGES.map(s=>{
            const count=clients.filter((c:any)=>c.stage===s.key).length
            return(
              <div key={s.key} style={{flex:1,background:s.bg,border:`1px solid ${s.bd}`,borderRadius:6,padding:'10px 6px',textAlign:'center' as const}}>
                <div style={{fontSize:18,fontWeight:500,color:s.color}}>{count}</div>
                <div style={{fontSize:10,color:s.color,fontWeight:500,marginTop:2}}>{s.label}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 오늘 연락 리스트 */}
      {schedules.length>0&&(
        <div style={{background:WHITE,border:`1px solid ${BORDER}`,borderRadius:8,overflow:'hidden',marginBottom:14}}>
          <div style={{padding:'12px 16px',borderBottom:`1px solid ${BORDER2}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontSize:13,fontWeight:500,color:TX1}}>오늘 연락 <span style={{color:GOLD}}>{schedules.length}</span></span>
            <span style={{fontSize:12,color:GOLD}} onClick={()=>setPage('today')}>전체 →</span>
          </div>
          {schedules.slice(0,3).map((sc:any,i:number)=>{
            const lb=getLabel(sc.note)
            return(
              <div key={sc.id} style={{display:'flex',alignItems:'center',padding:'12px 16px',gap:10,borderBottom:i===Math.min(schedules.length,3)-1?'none':`1px solid ${BORDER2}`}} onClick={()=>onSelect(sc.clients)}>
                <div style={av(lb.color)}>{sc.clients?.name?.[0]||'?'}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:500,color:TX1}}>{sc.clients?.name}</div>
                  <div style={{fontSize:11,color:TX3}}>{sc.note}</div>
                </div>
                <span style={badge(lb.color,lb.bg,lb.bd)}>{lb.label}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* 최근 고객 */}
      <div style={{background:WHITE,border:`1px solid ${BORDER}`,borderRadius:8,overflow:'hidden'}}>
        <div style={{padding:'12px 16px',borderBottom:`1px solid ${BORDER2}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span style={{fontSize:13,fontWeight:500,color:TX1}}>최근 고객</span>
          <span style={{fontSize:12,color:GOLD}} onClick={()=>setPage('clients')}>전체 →</span>
        </div>
        {clients.length===0&&<div style={{padding:'24px',textAlign:'center' as const,color:TX3,fontSize:13}}>등록된 고객이 없어요</div>}
        {clients.slice(0,5).map((c:any,i:number)=>{
          const stg=getStage(c.stage||'first_visit')
          return(
            <div key={c.id} style={{display:'flex',alignItems:'center',padding:'12px 16px',gap:10,borderBottom:i===Math.min(clients.length,5)-1?'none':`1px solid ${BORDER2}`,cursor:'pointer'}} onClick={()=>onSelect(c)}>
              <div style={av(NAVY)}>{c.name?.[0]||'?'}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:500,color:TX1}}>{c.name}</div>
                <div style={{fontSize:11,color:TX3}}>{c.phone||'—'}</div>
              </div>
              <span style={badge(stg.color,stg.bg,stg.bd)}>{stg.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CallMemoPopup({client,onClose}:any){
  const supabase=createClient()
  const [memo,setMemo]=useState('')
  const [saving,setSaving]=useState(false)
  const today=new Date().toISOString().split('T')[0]

  const save=async()=>{
    if(!memo.trim()){onClose();return}
    setSaving(true)
    await supabase.from('schedules').insert({
      client_id:client.id,
      type:'inspection',
      scheduled_date:today,
      is_contacted:true,
      note:memo
    })
    setSaving(false)
    onClose()
  }

  return(
    <div style={{position:'fixed',inset:0,background:'rgba(27,42,74,0.8)',display:'flex',alignItems:'flex-end',justifyContent:'center',zIndex:300}} onClick={onClose}>
      <div style={{background:WHITE,borderRadius:'16px 16px 0 0',width:'100%',padding:'24px 20px 40px',boxShadow:'0 -8px 40px rgba(0,0,0,0.2)'}} onClick={e=>e.stopPropagation()}>
        <div style={{width:40,height:4,background:BORDER,borderRadius:2,margin:'0 auto 20px'}} />
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
          <div style={av(NAVY)}>{client.name?.[0]||'?'}</div>
          <div>
            <div style={{fontSize:16,fontWeight:600,color:TX1}}>{client.name}</div>
            <div style={{fontSize:12,color:TX3}}>📞 통화 완료 · {today}</div>
          </div>
        </div>
        <div style={{fontSize:14,fontWeight:500,color:TX1,marginBottom:10}}>통화 내용 메모</div>
        <textarea
          style={{...inp,fontSize:15,height:120,resize:'none' as const,marginBottom:14}}
          placeholder="통화 내용, 고객 반응, 다음 액션 등..."
          value={memo}
          onChange={e=>setMemo(e.target.value)}
          autoFocus
        />
        <div style={{display:'flex',gap:10}}>
          <button style={{...btn(),flex:1,padding:'14px',borderRadius:8,fontSize:15}} onClick={onClose}>건너뛰기</button>
          <button style={{...btn('navy'),flex:2,padding:'14px',borderRadius:8,fontSize:15}} onClick={save} disabled={saving}>{saving?'저장중...':'메모 저장'}</button>
        </div>
      </div>
    </div>
  )
}

function MobileCardScan({clients,setClients,onClose}:any){
  const supabase=createClient()
  const [scanning,setScanning]=useState(false)
  const [result,setResult]=useState<any>(null)
  const [saving,setSaving]=useState(false)
  const [form,setForm]=useState({name:'',phone:'',email:'',address:'',interest_model:'',memo:'',stage:'first_visit'})

  const scanCard=async(e:React.ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0];if(!file) return
    setScanning(true)
    const reader=new FileReader()
    reader.onload=async()=>{
      const base64=(reader.result as string).split(',')[1]
      const res=await fetch('/api/ocr',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image:base64})})
      const data=await res.json()
      setForm(p=>({...p,name:data.name||'',phone:data.phone||'',email:data.email||'',address:data.address||''}))
      setResult(data)
      setScanning(false)
    }
    reader.readAsDataURL(file)
  }

  const rescan=()=>{setResult(null);setForm({name:'',phone:'',email:'',address:'',interest_model:'',memo:'',stage:'first_visit'})}

  const save=async()=>{
    if(!form.name) return;setSaving(true)
    const{data:{user}}=await supabase.auth.getUser()
    const{data}=await supabase.from('clients').insert({
      salesperson_id:user?.id,name:form.name,phone:form.phone||null,
      email:form.email||null,address:form.address||null,
      interest_model:form.interest_model||null,
      memo:form.memo||null,stage:form.stage
    }).select()
    if(data) setClients((p:any)=>[data[0],...p])
    onClose()
  }

  return(
    <div style={{position:'fixed',inset:0,background:'rgba(27,42,74,0.8)',display:'flex',alignItems:'flex-end',justifyContent:'center',zIndex:200}} onClick={onClose}>
      <div style={{background:WHITE,borderRadius:'16px 16px 0 0',width:'100%',maxHeight:'90vh',overflowY:'auto' as const,padding:'24px 20px 40px',boxShadow:'0 -8px 40px rgba(0,0,0,0.2)'}} onClick={e=>e.stopPropagation()}>
        <div style={{width:40,height:4,background:BORDER,borderRadius:2,margin:'0 auto 20px'}} />
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
          <div style={{fontSize:17,fontWeight:600,color:TX1}}>📷 명함 촬영으로 고객 등록</div>
          {result&&<button style={{...btn(),fontSize:12,padding:'5px 10px'}} onClick={rescan}>다시 촬영</button>}
        </div>

        {!result&&(
          <label style={{display:'flex',flexDirection:'column' as const,alignItems:'center',justifyContent:'center',gap:10,padding:'32px',border:`2px dashed ${GOLD}`,borderRadius:12,cursor:'pointer',marginBottom:16,background:GOLD_BG}}>
            {scanning?(
              <div style={{fontSize:14,color:GOLD_TX,textAlign:'center' as const}}>🔍 명함 인식 중...<br/><span style={{fontSize:12}}>잠시만 기다려주세요</span></div>
            ):(
              <>
                <div style={{fontSize:40}}>📷</div>
                <div style={{fontSize:15,fontWeight:600,color:GOLD_TX}}>명함 사진 촬영 또는 선택</div>
                <div style={{fontSize:12,color:TX3}}>카메라로 찍거나 갤러리에서 선택</div>
              </>
            )}
            <input type="file" accept="image/*" capture="environment" style={{display:'none'}} onChange={scanCard} disabled={scanning} />
          </label>
        )}

        {result&&(
          <div style={{display:'grid',gap:12,marginBottom:16}}>
            <div style={{background:GREEN_BG,border:`1px solid ${GREEN_BD}`,borderRadius:8,padding:'10px 14px',fontSize:13,color:GREEN}}>
              ✓ 명함 인식 완료! 정보를 확인하고 수정해주세요
            </div>
            <div><label style={lbl}>이름 *</label><input style={{...inp,fontSize:16}} placeholder="홍길동" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} /></div>
            <div><label style={lbl}>전화번호</label><PhoneInput style={{...inp,fontSize:16}} value={form.phone} onChange={(v:string)=>setForm(p=>({...p,phone:v}))} /></div>
            <div><label style={lbl}>이메일</label><input style={{...inp,fontSize:16}} placeholder="example@email.com" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} /></div>
            <div><label style={lbl}>주소</label><input style={{...inp,fontSize:16}} placeholder="서울시 강남구..." value={form.address} onChange={e=>setForm(p=>({...p,address:e.target.value}))} /></div>
            <div><label style={lbl}>관심 차종</label><input style={{...inp,fontSize:16}} placeholder="GLE 450" value={form.interest_model} onChange={e=>setForm(p=>({...p,interest_model:e.target.value}))} /></div>
            <div>
              <label style={lbl}>상담 단계</label>
              <div style={{display:'flex',gap:6,flexWrap:'wrap' as const}}>
                {STAGES.map(s=>(
                  <button key={s.key} onClick={()=>setForm(p=>({...p,stage:s.key}))}
                    style={{padding:'6px 12px',borderRadius:6,fontSize:12,cursor:'pointer',
                    border:`1px solid ${form.stage===s.key?s.color:BORDER}`,
                    background:form.stage===s.key?s.bg:WHITE,
                    color:form.stage===s.key?s.color:TX3,
                    fontWeight:form.stage===s.key?600:400}}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div><label style={lbl}>메모</label><textarea style={{...inp,fontSize:15,height:72,resize:'none' as const}} placeholder="특이사항..." value={form.memo} onChange={e=>setForm(p=>({...p,memo:e.target.value}))} /></div>
          </div>
        )}

        <div style={{display:'flex',gap:10}}>
          <button style={{...btn(),flex:1,padding:'14px',borderRadius:8,fontSize:15}} onClick={onClose}>취소</button>
          {result&&<button style={{...btn('navy'),flex:2,padding:'14px',borderRadius:8,fontSize:15}} onClick={save} disabled={saving}>{saving?'저장중...':'고객 등록'}</button>}
        </div>
      </div>
    </div>
  )
}

function MobileQuickAdd({clients,setClients,onClose}:any){
  const supabase=createClient()
  const [form,setForm]=useState({name:'',phone:'',interest_model:'',memo:''})
  const [saving,setSaving]=useState(false)

  const save=async()=>{
    if(!form.name) return;setSaving(true)
    const{data:{user}}=await supabase.auth.getUser()
    const{data}=await supabase.from('clients').insert({salesperson_id:user?.id,name:form.name,phone:form.phone||null,interest_model:form.interest_model||null,memo:form.memo||null,stage:'first_visit'}).select()
    if(data) setClients((p:any)=>[data[0],...p])
    onClose()
  }

  return(
    <div style={{position:'fixed',inset:0,background:'rgba(27,42,74,0.8)',display:'flex',alignItems:'flex-end',justifyContent:'center',zIndex:200}} onClick={onClose}>
      <div style={{background:WHITE,borderRadius:'16px 16px 0 0',width:'100%',padding:'24px 20px 40px',boxShadow:'0 -8px 40px rgba(0,0,0,0.2)'}} onClick={e=>e.stopPropagation()}>
        <div style={{width:40,height:4,background:BORDER,borderRadius:2,margin:'0 auto 20px'}} />
        <div style={{fontSize:17,fontWeight:600,color:TX1,marginBottom:20}}>⚡ 당직 고객 빠른 등록</div>
        <div style={{display:'grid',gap:14}}>
          <div><label style={lbl}>이름 *</label><input style={{...inp,fontSize:16}} placeholder="홍길동" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} /></div>
          <div><label style={lbl}>전화번호</label><PhoneInput style={{...inp,fontSize:16}} value={form.phone} onChange={(v:string)=>setForm(p=>({...p,phone:v}))} /></div>
          <div><label style={lbl}>관심 차종</label><input style={{...inp,fontSize:16}} placeholder="GLE 450" value={form.interest_model} onChange={e=>setForm(p=>({...p,interest_model:e.target.value}))} /></div>
          <div><label style={lbl}>메모</label><textarea style={{...inp,fontSize:15,height:80,resize:'none' as const}} placeholder="특이사항 메모..." value={form.memo} onChange={e=>setForm(p=>({...p,memo:e.target.value}))} /></div>
          <button style={{...btn('navy'),padding:'14px',fontSize:16,borderRadius:8,marginTop:4}} onClick={save} disabled={saving}>{saving?'저장중...':'저장하기'}</button>
        </div>
      </div>
    </div>
  )
}

function MobileToday({schedules}:any){
  const supabase=createClient()
  const [done,setDone]=useState<string[]>([])
  const toggle=async(id:string)=>{
    setDone(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id])
    await supabase.from('schedules').update({is_contacted:true}).eq('id',id)
  }
  return(
    <div>
      <div style={{fontSize:20,fontWeight:600,color:TX1,marginBottom:4}}>오늘의 연락 리스트</div>
      <div style={{fontSize:13,color:TX3,marginBottom:16}}>완료 {done.length} / {schedules.length}건</div>
      {schedules.length===0&&<div style={{background:WHITE,borderRadius:8,padding:'40px',textAlign:'center' as const,color:TX3,fontSize:14}}>오늘 연락할 고객이 없어요 😊</div>}
      <div style={{background:WHITE,borderRadius:8,border:`1px solid ${BORDER}`,overflow:'hidden'}}>
        {schedules.map((sc:any,i:number)=>{
          const lb=getLabel(sc.note);const ok=done.includes(sc.id)
          return(
            <div key={sc.id} style={{display:'flex',alignItems:'center',padding:'14px 16px',gap:12,opacity:ok?.5:1,borderBottom:i===schedules.length-1?'none':`1px solid ${BORDER2}`}}>
              <div style={{width:26,height:26,borderRadius:'50%',border:`2px solid ${ok?GREEN:BORDER}`,background:ok?GREEN:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,color:WHITE,flexShrink:0}} onClick={()=>toggle(sc.id)}>{ok?'✓':''}</div>
              <div style={av(lb.color)}>{sc.clients?.name?.[0]||'?'}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:15,fontWeight:500,color:TX1}}>{sc.clients?.name}</div>
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

function MobileClients({clients,setClients,onSelect,onCall}:any){
  const supabase=createClient()
  const [search,setSearch]=useState('')
  const [showAdd,setShowAdd]=useState(false)
  const [form,setForm]=useState({name:'',phone:'',interest_model:'',budget:'',stage:'first_visit'})
  const [saving,setSaving]=useState(false)

  const filtered=clients.filter((c:any)=>c.name?.includes(search)||c.phone?.includes(search)||c.interest_model?.includes(search))

  const save=async()=>{
    if(!form.name) return;setSaving(true)
    const{data:{user}}=await supabase.auth.getUser()
    const{data}=await supabase.from('clients').insert({salesperson_id:user?.id,name:form.name,phone:form.phone||null,interest_model:form.interest_model||null,budget:form.budget||null,stage:form.stage}).select()
    if(data) setClients((p:any)=>[data[0],...p])
    setForm({name:'',phone:'',interest_model:'',budget:'',stage:'first_visit'});setShowAdd(false);setSaving(false)
  }

  return(
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
        <div style={{fontSize:20,fontWeight:600,color:TX1}}>고객 관리 <span style={{fontSize:14,color:TX3,fontWeight:400}}>{clients.length}명</span></div>
        <button style={{...btn('navy'),padding:'8px 16px',borderRadius:8}} onClick={()=>setShowAdd(v=>!v)}>{showAdd?'✕':'+ 등록'}</button>
      </div>

      {showAdd&&(
        <div style={{background:WHITE,border:`1px solid ${BORDER}`,borderRadius:8,padding:16,marginBottom:14}}>
          <div style={{display:'grid',gap:12}}>
            <div><label style={lbl}>이름 *</label><input style={{...inp,fontSize:16}} value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} /></div>
            <div><label style={lbl}>전화번호</label><PhoneInput style={{...inp,fontSize:16}} value={form.phone} onChange={(v:string)=>setForm(p=>({...p,phone:v}))} /></div>
            <div><label style={lbl}>관심 차종</label><input style={{...inp,fontSize:16}} value={form.interest_model} onChange={e=>setForm(p=>({...p,interest_model:e.target.value}))} /></div>
            <div><label style={lbl}>예산</label><input style={{...inp,fontSize:16}} value={form.budget} onChange={e=>setForm(p=>({...p,budget:e.target.value}))} /></div>
            <div>
              <label style={lbl}>단계</label>
              <div style={{display:'flex',gap:6,flexWrap:'wrap' as const}}>
                {STAGES.map(s=><button key={s.key} onClick={()=>setForm(p=>({...p,stage:s.key}))} style={{padding:'6px 10px',borderRadius:6,fontSize:12,cursor:'pointer',border:`1px solid ${form.stage===s.key?s.color:BORDER}`,background:form.stage===s.key?s.bg:WHITE,color:form.stage===s.key?s.color:TX3,fontWeight:form.stage===s.key?600:400}}>{s.label}</button>)}
              </div>
            </div>
            <button style={{...btn('navy'),padding:'12px',fontSize:15,borderRadius:8}} onClick={save} disabled={saving}>{saving?'저장중...':'저장'}</button>
          </div>
        </div>
      )}

      <input style={{...inp,fontSize:16,marginBottom:12,borderRadius:8}} placeholder="이름, 전화번호 검색..." value={search} onChange={e=>setSearch(e.target.value)} />

      <div style={{background:WHITE,borderRadius:8,border:`1px solid ${BORDER}`,overflow:'hidden'}}>
        {filtered.length===0&&<div style={{padding:'32px',textAlign:'center' as const,color:TX3,fontSize:14}}>고객이 없어요</div>}
        {filtered.map((c:any,i:number)=>{
          const stg=getStage(c.stage||'first_visit')
          return(
            <div key={c.id} style={{display:'flex',alignItems:'center',padding:'14px 16px',gap:12,borderBottom:i===filtered.length-1?'none':`1px solid ${BORDER2}`}}>
              <div style={{...av(NAVY),position:'relative',cursor:'pointer',flexShrink:0}} onClick={()=>onSelect(c)}>
                {c.name?.[0]||'?'}
                {c.is_vip&&<div style={{position:'absolute' as const,top:-3,right:-3,fontSize:9}}>⭐</div>}
              </div>
              <div style={{flex:1,cursor:'pointer'}} onClick={()=>onSelect(c)}>
                <div style={{fontSize:15,fontWeight:500,color:TX1}}>{c.name}</div>
                <div style={{fontSize:12,color:TX3}}>{c.phone||'—'} · {c.interest_model||c.car_model||'차종 미정'}</div>
              </div>
              <div style={{display:'flex',gap:8,alignItems:'center'}}>
                {c.phone&&<button onClick={e=>{e.stopPropagation();onCall(c)}} style={{width:36,height:36,borderRadius:'50%',background:GREEN_BG,border:`1px solid ${GREEN_BD}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:16}}>📞</button>}
                <span style={badge(stg.color,stg.bg,stg.bd)} onClick={()=>onSelect(c)}>{stg.label}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function MobileTemplates({templates,setTemplates}:any){
  const supabase=createClient()
  const [copied,setCopied]=useState<string|null>(null)
  const [showAdd,setShowAdd]=useState(false)
  const [form,setForm]=useState({title:'',content:'',category:'general'})
  const [saving,setSaving]=useState(false)

  const copy=async(text:string,id:string)=>{
    await navigator.clipboard.writeText(text)
    setCopied(id);setTimeout(()=>setCopied(null),2000)
  }
  const del=async(id:string)=>{
    await supabase.from('templates').delete().eq('id',id)
    setTemplates((p:any)=>p.filter((t:any)=>t.id!==id))
  }
  const save=async()=>{
    if(!form.title||!form.content) return;setSaving(true)
    const{data:{user}}=await supabase.auth.getUser()
    const{data}=await supabase.from('templates').insert({...form,salesperson_id:user?.id}).select()
    if(data) setTemplates((p:any)=>[data[0],...p])
    setForm({title:'',content:'',category:'general'});setShowAdd(false);setSaving(false)
  }

  return(
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
        <div style={{fontSize:20,fontWeight:600,color:TX1}}>문자 템플릿</div>
        <button style={{...btn('navy'),padding:'8px 16px',borderRadius:8}} onClick={()=>setShowAdd(v=>!v)}>{showAdd?'✕':'+ 추가'}</button>
      </div>

      {showAdd&&(
        <div style={{background:WHITE,border:`1px solid ${BORDER}`,borderRadius:8,padding:16,marginBottom:14}}>
          <div style={{display:'grid',gap:12}}>
            <div><label style={lbl}>제목</label><input style={{...inp,fontSize:16}} value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} /></div>
            <div><label style={lbl}>내용</label><textarea style={{...inp,height:100,resize:'none' as const,fontSize:15}} value={form.content} onChange={e=>setForm(p=>({...p,content:e.target.value}))} /></div>
            <button style={{...btn('navy'),padding:'12px',fontSize:15,borderRadius:8}} onClick={save} disabled={saving}>{saving?'저장중...':'저장'}</button>
          </div>
        </div>
      )}

      {templates.length===0&&<div style={{background:WHITE,borderRadius:8,padding:'32px',textAlign:'center' as const,color:TX3,fontSize:14}}>템플릿이 없어요. 추가해보세요!</div>}
      <div style={{display:'grid',gap:10}}>
        {templates.map((t:any)=>(
          <div key={t.id} style={{background:WHITE,border:`1px solid ${BORDER}`,borderRadius:8,padding:'14px 16px'}}>
            <div style={{fontSize:15,fontWeight:500,color:TX1,marginBottom:8}}>{t.title}</div>
            <div style={{fontSize:13,color:TX2,lineHeight:1.7,background:CREAM,borderRadius:6,padding:'10px 12px',marginBottom:10,whiteSpace:'pre-wrap' as const}}>{t.content}</div>
            <div style={{display:'flex',gap:8}}>
              <button style={{flex:1,...btn('navy'),background:copied===t.id?GREEN:NAVY,borderRadius:8,padding:'10px'}} onClick={()=>copy(t.content,t.id)}>{copied===t.id?'✓ 복사됨':'📋 복사'}</button>
              <button style={{...btn(),color:RED,borderColor:RED+'40',borderRadius:8,padding:'10px'}} onClick={()=>del(t.id)}>삭제</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MobileCalendar({setPage}:any){
  const supabase=createClient()
  const [currentDate,setCurrentDate]=useState(new Date())
  const [allSchedules,setAllSchedules]=useState<any[]>([])
  const [allClients,setAllClients]=useState<any[]>([])
  const [selectedDate,setSelectedDate]=useState<string|null>(null)
  const [loading,setLoading]=useState(true)
  const [showAddForm,setShowAddForm]=useState(false)
  const [addForm,setAddForm]=useState({type:'memo',client_id:'',note:'',time:''})
  const [saving,setSaving]=useState(false)
  const year=currentDate.getFullYear(),month=currentDate.getMonth()

  useEffect(()=>{
    const load=async()=>{
      setLoading(true)
      const s=new Date(year,month,1).toISOString().split('T')[0]
      const e=new Date(year,month+1,0).toISOString().split('T')[0]
      const[sc,cl]=await Promise.all([
        supabase.from('schedules').select('*, clients(name,car_model)').gte('scheduled_date',s).lte('scheduled_date',e).order('scheduled_date'),
        supabase.from('clients').select('id,name,phone').order('name')
      ])
      setAllSchedules(sc.data||[]);setAllClients(cl.data||[]);setLoading(false)
    }
    load()
  },[year,month])

  const firstDay=new Date(year,month,1).getDay()
  const daysInMonth=new Date(year,month+1,0).getDate()
  const days:(number|null)[]=[]
  for(let i=0;i<firstDay;i++) days.push(null)
  for(let i=1;i<=daysInMonth;i++) days.push(i)

  const getDateStr=(day:number)=>`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
  const todayStr=new Date().toISOString().split('T')[0]
  const selectedSchedules=selectedDate?allSchedules.filter(s=>s.scheduled_date===selectedDate):[]
  const weekDays=['일','월','화','수','목','금','토']
  const monthNames=['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']

  const addSchedule=async()=>{
    if(!addForm.note.trim()||!selectedDate) return;setSaving(true)
    const ins:any={scheduled_date:selectedDate,type:'inspection',is_contacted:false,note:(addForm.time?`[${addForm.time}] `:'')+( addForm.type==='client'?addForm.note:`📝 ${addForm.note}`)}
    if(addForm.type==='client'&&addForm.client_id) ins.client_id=addForm.client_id
    const{data}=await supabase.from('schedules').insert(ins).select('*, clients(name,car_model)')
    if(data) setAllSchedules(p=>[...p,...data])
    setShowAddForm(false);setAddForm({type:'memo',client_id:'',note:'',time:''});setSaving(false)
  }
  const delSchedule=async(id:string)=>{await supabase.from('schedules').delete().eq('id',id);setAllSchedules(p=>p.filter(s=>s.id!==id))}

  return(
    <div>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
        <button style={{...btn(),padding:'6px 12px',borderRadius:8}} onClick={()=>setPage('more')}>← 뒤로</button>
        <div style={{fontSize:18,fontWeight:600,color:TX1}}>캘린더</div>
      </div>

      {/* 월 네비게이션 */}
      <div style={{background:WHITE,border:`1px solid ${BORDER}`,borderRadius:8,overflow:'hidden',marginBottom:12}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 16px',borderBottom:`1px solid ${BORDER2}`}}>
          <button onClick={()=>setCurrentDate(new Date(year,month-1,1))} style={{background:'transparent',border:`1px solid ${BORDER}`,borderRadius:6,padding:'6px 14px',fontSize:16,cursor:'pointer',color:TX2}}>‹</button>
          <div style={{fontSize:16,fontWeight:600,color:TX1}}>{year}년 {monthNames[month]}</div>
          <button onClick={()=>setCurrentDate(new Date(year,month+1,1))} style={{background:'transparent',border:`1px solid ${BORDER}`,borderRadius:6,padding:'6px 14px',fontSize:16,cursor:'pointer',color:TX2}}>›</button>
        </div>

        {/* 요일 헤더 */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',background:CREAM2}}>
          {weekDays.map((d,i)=>(
            <div key={d} style={{padding:'8px 0',textAlign:'center' as const,fontSize:11,fontWeight:600,color:i===0?RED:i===6?BLUE:TX3}}>{d}</div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        {loading?<div style={{padding:'32px',textAlign:'center' as const,color:TX3}}>불러오는 중...</div>:(
          <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)'}}>
            {days.map((day,idx)=>{
              if(!day) return <div key={`e-${idx}`} style={{minHeight:44,borderRight:`1px solid ${BORDER2}`,borderBottom:`1px solid ${BORDER2}`}} />
              const dateStr=getDateStr(day)
              const daySc=allSchedules.filter(s=>s.scheduled_date===dateStr)
              const isToday=dateStr===todayStr
              const isSel=dateStr===selectedDate
              const isSun=idx%7===0,isSat=idx%7===6
              return(
                <div key={day} onClick={()=>{setSelectedDate(dateStr===selectedDate?null:dateStr);setShowAddForm(false)}}
                  style={{minHeight:44,padding:'4px 2px',borderRight:`1px solid ${BORDER2}`,borderBottom:`1px solid ${BORDER2}`,background:isSel?'#EEF2FF':isToday?GOLD_BG:WHITE,cursor:'pointer',display:'flex',flexDirection:'column' as const,alignItems:'center'}}>
                  <div style={{width:26,height:26,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'50%',background:isToday?GOLD:'transparent',color:isToday?WHITE:isSun?RED:isSat?BLUE:TX1,fontSize:12,fontWeight:isToday?700:400,marginBottom:2}}>{day}</div>
                  {daySc.length>0&&(
                    <div style={{display:'flex',gap:2,flexWrap:'wrap' as const,justifyContent:'center'}}>
                      {daySc.slice(0,2).map((sc:any)=>{
                        const lb=getLabel(sc.note)
                        return <div key={sc.id} style={{width:6,height:6,borderRadius:'50%',background:lb.color}} />
                      })}
                      {daySc.length>2&&<div style={{fontSize:8,color:TX3}}>+{daySc.length-2}</div>}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 선택된 날짜 일정 */}
      {selectedDate&&(
        <div style={{background:WHITE,border:`1px solid ${BORDER}`,borderRadius:8,overflow:'hidden',marginBottom:12}}>
          <div style={{padding:'12px 16px',borderBottom:`1px solid ${BORDER2}`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <span style={{fontSize:14,fontWeight:600,color:TX1}}>{selectedDate.replace(/-/g,'.')} 일정</span>
            <button style={{...btn('navy'),padding:'5px 12px',fontSize:12,borderRadius:6}} onClick={()=>setShowAddForm(v=>!v)}>{showAddForm?'✕':'+ 추가'}</button>
          </div>

          {showAddForm&&(
            <div style={{padding:'14px 16px',borderBottom:`1px solid ${BORDER2}`,background:CREAM}}>
              <div style={{display:'flex',gap:8,marginBottom:10}}>
                {[{v:'memo',l:'📝 개인 메모'},{v:'client',l:'👤 고객 연결'}].map(t=>(
                  <button key={t.v} onClick={()=>setAddForm(p=>({...p,type:t.v,client_id:''}))} style={{flex:1,padding:'7px',borderRadius:6,fontSize:12,cursor:'pointer',fontWeight:addForm.type===t.v?600:400,background:addForm.type===t.v?NAVY:WHITE,color:addForm.type===t.v?WHITE:TX2,border:`1px solid ${addForm.type===t.v?NAVY:BORDER}`}}>{t.l}</button>
                ))}
              </div>
              {addForm.type==='client'&&(
                <select style={{...inp,fontSize:16,marginBottom:10}} value={addForm.client_id} onChange={e=>setAddForm(p=>({...p,client_id:e.target.value}))}>
                  <option value="">고객 선택...</option>
                  {allClients.map((c:any)=><option key={c.id} value={c.id}>{c.name} {c.phone?`(${c.phone})`:''}</option>)}
                </select>
              )}
              <input style={{...inp,fontSize:16,marginBottom:10}} type="time" value={addForm.time} onChange={e=>setAddForm(p=>({...p,time:e.target.value}))} placeholder="시간 (선택)" />
              <textarea style={{...inp,height:72,resize:'none' as const,fontSize:15,marginBottom:10}} placeholder={addForm.type==='memo'?'메모 내용...':'팔로업, 미팅 내용...'} value={addForm.note} onChange={e=>setAddForm(p=>({...p,note:e.target.value}))} />
              <button style={{...btn('navy'),width:'100%',padding:'12px',borderRadius:6,fontSize:15}} onClick={addSchedule} disabled={saving}>{saving?'저장중...':'저장'}</button>
            </div>
          )}

          {selectedSchedules.length===0&&!showAddForm&&(
            <div style={{padding:'24px',textAlign:'center' as const,color:TX3,fontSize:13}}>
              <div style={{fontSize:20,marginBottom:6}}>📅</div>
              이날 일정이 없어요<br/>
              <span style={{fontSize:12,color:GOLD,cursor:'pointer'}} onClick={()=>setShowAddForm(true)}>+ 일정 추가하기</span>
            </div>
          )}

          {selectedSchedules.map((sc:any,i:number)=>{
            const lb=getLabel(sc.note)
            return(
              <div key={sc.id} style={{padding:'12px 16px',borderBottom:i===selectedSchedules.length-1?'none':`1px solid ${BORDER2}`,display:'flex',alignItems:'center',gap:10}}>
                <div style={{...av(lb.color),width:32,height:32,fontSize:12,flexShrink:0}}>{sc.clients?.name?.[0]||'📝'}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:500,color:TX1}}>{sc.clients?.name||'개인 메모'}</div>
                  <div style={{fontSize:11,color:TX3}}>{sc.note.replace(/^\[.+?\]\s*/,'').replace(/^📝\s*/,'')}</div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <span style={badge(lb.color,lb.bg,lb.bd)}>{lb.label}</span>
                  <button style={{fontSize:13,color:TX3,background:'transparent',border:'none',cursor:'pointer',padding:'4px'}} onClick={()=>delSchedule(sc.id)}>✕</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 이달 요약 */}
      <div style={{background:WHITE,border:`1px solid ${BORDER}`,borderRadius:8,padding:'14px 16px'}}>
        <div style={{fontSize:13,fontWeight:600,color:TX1,marginBottom:10}}>{monthNames[month]} 일정 요약</div>
        {allSchedules.length===0&&<div style={{fontSize:13,color:TX3}}>이번달 일정이 없어요</div>}
        {[{label:'감사문자',color:GREEN,bg:GREEN_BG,bd:GREEN_BD},{label:'1년 점검',color:BLUE,bg:BLUE_BG,bd:BLUE_BD},{label:'2년 점검',color:BLUE,bg:BLUE_BG,bd:BLUE_BD},{label:'3년 점검',color:BLUE,bg:BLUE_BG,bd:BLUE_BD}].map(type=>{
          const count=allSchedules.filter(s=>getLabel(s.note).label===type.label).length
          if(count===0) return null
          return(
            <div key={type.label} style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
              <span style={badge(type.color,type.bg,type.bd)}>{type.label}</span>
              <span style={{fontSize:13,fontWeight:500,color:TX1}}>{count}건</span>
            </div>
          )
        })}
        {allSchedules.length>0&&(
          <div style={{borderTop:`1px solid ${BORDER2}`,marginTop:8,paddingTop:8,display:'flex',justifyContent:'space-between'}}>
            <span style={{fontSize:12,color:TX3}}>총 일정</span>
            <span style={{fontSize:13,fontWeight:600,color:TX1}}>{allSchedules.length}건</span>
          </div>
        )}
      </div>
    </div>
  )
}

function MobileMore({salesperson,setSalesperson,user,partners,setPartners,signOut,setPage}:any){
  const supabase=createClient()
  const [section,setSection]=useState<string|null>(null)
  const [form,setForm]=useState({name:salesperson?.name||'',phone:salesperson?.phone||'',brand:salesperson?.brand||'',dealer_name:salesperson?.dealer_name||''})
  const [saved,setSaved]=useState(false)
  const BRANDS=['현대','기아','제네시스','쌍용(KG모빌리티)','르노코리아','GM 한국사업장','메르세데스-벤츠','BMW','아우디','폭스바겐','포르쉐','볼보','랜드로버','Jeep','푸조','시트로엥','미니(MINI)','렉서스','도요타','혼다','닛산','인피니티','캐딜락','링컨','포드','테슬라','기타']

  const saveProfile=async()=>{
    const{data:{user:u}}=await supabase.auth.getUser()
    const{data}=await supabase.from('salespersons').update({name:form.name,phone:form.phone||null,brand:form.brand,dealer_name:form.dealer_name||null}).eq('id',u?.id).select()
    if(data) setSalesperson(data[0])
    setSaved(true);setTimeout(()=>setSaved(false),2000)
  }

  const menus=[
    {id:'profile',icon:'👤',label:'프로필 설정'},
    {id:'calendar',icon:'📅',label:'캘린더'},
    {id:'report',icon:'📊',label:'실적 리포트'},
    {id:'partners',icon:'🤝',label:'제휴업체'},
  ]

  if(section==='profile') return(
    <div>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20}}>
        <button style={{...btn(),padding:'6px 12px',borderRadius:8}} onClick={()=>setSection(null)}>← 뒤로</button>
        <div style={{fontSize:18,fontWeight:600,color:TX1}}>프로필 설정</div>
      </div>
      <div style={{background:WHITE,borderRadius:8,border:`1px solid ${BORDER}`,padding:16,display:'grid',gap:12}}>
        <div><label style={lbl}>이름</label><input style={{...inp,fontSize:16}} value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} /></div>
        <div><label style={lbl}>전화번호</label><PhoneInput style={{...inp,fontSize:16}} value={form.phone} onChange={(v:string)=>setForm(p=>({...p,phone:v}))} /></div>
        <div><label style={lbl}>브랜드</label>
          <select style={{...inp,fontSize:16}} value={form.brand} onChange={e=>setForm(p=>({...p,brand:e.target.value}))}>
            <option value="">선택</option>
            {BRANDS.map(b=><option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div><label style={lbl}>전시장명</label><input style={{...inp,fontSize:16}} value={form.dealer_name} onChange={e=>setForm(p=>({...p,dealer_name:e.target.value}))} /></div>
        <div style={{fontSize:13,color:TX3,padding:'10px',background:CREAM,borderRadius:6}}>📧 {user?.email}</div>
        <button style={{...btn('navy'),padding:'12px',fontSize:15,borderRadius:8}} onClick={saveProfile}>{saved?'✓ 저장됐어요!':'저장'}</button>
      </div>
    </div>
  )

  return(
    <div>
      <div style={{fontSize:20,fontWeight:600,color:TX1,marginBottom:16}}>더보기</div>
      <div style={{background:WHITE,borderRadius:8,border:`1px solid ${BORDER}`,overflow:'hidden',marginBottom:14}}>
        {menus.map((m,i)=>(
          <div key={m.id} style={{display:'flex',alignItems:'center',padding:'16px',gap:14,borderBottom:i===menus.length-1?'none':`1px solid ${BORDER2}`,cursor:'pointer'}}
            onClick={()=>m.id==='calendar'||m.id==='report'||m.id==='partners'?setPage(m.id):setSection(m.id)}>
            <span style={{fontSize:22}}>{m.icon}</span>
            <span style={{fontSize:15,color:TX1,fontWeight:500}}>{m.label}</span>
            <span style={{marginLeft:'auto',color:TX3,fontSize:16}}>›</span>
          </div>
        ))}
      </div>
      <button style={{width:'100%',background:'transparent',border:`1px solid ${BORDER}`,borderRadius:8,padding:'14px',fontSize:15,color:RED,cursor:'pointer',fontWeight:500}} onClick={signOut}>로그아웃</button>
    </div>
  )
}
