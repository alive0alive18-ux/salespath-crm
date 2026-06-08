'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const GOLD = '#C9A84C'
const BG = '#0E0E10'
const CARD = '#141416'
const BORDER = '#252528'
const TEXT_PRI = '#F0EEE8'
const TEXT_SEC = '#888880'
const TEXT_MUT = '#444440'

const TYPE_META: Record<string,any> = {
  inspection:  { label:'정기점검',   color:'#1D9E75', bg:'#0F4030' },
  insurance:   { label:'보험갱신',   color:'#EF9F27', bg:'#4A2E00' },
  anniversary: { label:'차량기념일', color:'#378ADD', bg:'#0A2A4A' },
}
const STATUS: Record<string,any> = {
  pending:    { label:'대기중',   color:'#EF9F27', bg:'#4A2E00' },
  consulting: { label:'상담중',   color:'#378ADD', bg:'#0A2A4A' },
  converted:  { label:'전환완료', color:'#1D9E75', bg:'#0F4030' },
  cancelled:  { label:'취소',     color:'#888',    bg:'#222' },
}

const avStyle = (c=GOLD) => ({ width:32, height:32, borderRadius:'50%', background:c+'20', border:`1px solid ${c}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:600, color:c, flexShrink:0 })
const badgeStyle = (c:string, b:string) => ({ fontSize:10, fontWeight:600, padding:'3px 7px', borderRadius:4, color:c, background:b, border:`0.5px solid ${c}40`, whiteSpace:'nowrap' as const })
const btnStyle = (v='def') => ({ padding: v==='sm'?'5px 12px':'8px 16px', borderRadius:7, fontSize:11, fontWeight:500, cursor:'pointer', border:`0.5px solid ${BORDER}`, background: v==='gold'?GOLD:'transparent', color: v==='gold'?'#0E0E10':TEXT_SEC, transition:'all .12s' })
const inputStyle = { background:'#1A1A1E', border:`0.5px solid ${BORDER}`, borderRadius:7, padding:'9px 12px', fontSize:13, color:TEXT_PRI, outline:'none', width:'100%', boxSizing:'border-box' as const }
const labelStyle = { fontSize:10, color:TEXT_MUT, letterSpacing:'.06em', textTransform:'uppercase' as const, marginBottom:5, display:'block' }
const cardStyle = { background:CARD, border:`0.5px solid ${BORDER}`, borderRadius:10, overflow:'hidden', marginBottom:14 }
const cardHStyle = { padding:'13px 18px', borderBottom:`0.5px solid ${BORDER}`, fontSize:12, fontWeight:500, color:TEXT_SEC, display:'flex', alignItems:'center', justifyContent:'space-between' }
const rowStyle = { display:'flex', alignItems:'center', padding:'12px 18px', borderBottom:`0.5px solid #1A1A1C`, gap:12, cursor:'pointer' }

export default function Home() {
  const [page, setPage] = useState('dashboard')
  const [user, setUser] = useState<any>(null)
  const [clients, setClients] = useState<any[]>([])
  const [partners, setPartners] = useState<any[]>([])
  const [referrals, setReferrals] = useState<any[]>([])
  const [schedules, setSchedules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      const today = new Date().toISOString().split('T')[0]
      const [c, p, r, sc] = await Promise.all([
        supabase.from('clients').select('*').order('created_at', { ascending: false }),
        supabase.from('partners').select('*').order('created_at', { ascending: false }),
        supabase.from('referrals').select('*, clients(name), partners(name)').order('clicked_at', { ascending: false }),
        supabase.from('schedules').select('*, clients(name, car_model)').eq('is_contacted', false).eq('scheduled_date', today),
      ])
      setClients(c.data || [])
      setPartners(p.data || [])
      setReferrals(r.data || [])
      setSchedules(sc.data || [])
      setLoading(false)
    }
    load()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const nav = [
    { id:'dashboard', label:'대시보드' },
    { id:'today',     label:'오늘의 리스트' },
    { id:'clients',   label:'고객 관리' },
    { id:'referrals', label:'리퍼럴' },
    { id:'partners',  label:'제휴업체' },
  ]

  if (loading) return (
    <div style={{ minHeight:'100vh', background:BG, display:'flex', alignItems:'center', justifyContent:'center', color:GOLD, fontSize:13 }}>
      불러오는 중...
    </div>
  )

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:BG, color:TEXT_PRI, fontFamily:"'DM Sans','Apple SD Gothic Neo',system-ui,sans-serif", fontSize:14 }}>
      <aside style={{ width:200, background:'#111113', borderRight:`0.5px solid ${BORDER}`, display:'flex', flexDirection:'column', flexShrink:0 }}>
        <div style={{ padding:'24px 20px 20px', borderBottom:`0.5px solid ${BORDER}` }}>
          <div style={{ fontSize:10, color:TEXT_MUT, letterSpacing:'.18em', marginBottom:3, textTransform:'uppercase' }}>Sales CRM</div>
          <div style={{ fontSize:17, fontWeight:700, color:TEXT_PRI, letterSpacing:'-0.03em' }}>AutoRef</div>
        </div>
        <div style={{ paddingTop:8, flex:1 }}>
          {nav.map(n => (
            <div key={n.id}
              style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 20px', fontSize:13, color: page===n.id ? TEXT_PRI : TEXT_SEC, background: page===n.id ? '#1C1C20' : 'transparent', borderLeft: page===n.id ? `2px solid ${GOLD}` : '2px solid transparent', cursor:'pointer', fontWeight: page===n.id ? 500 : 400, transition:'all .12s', userSelect:'none' }}
              onClick={() => setPage(n.id)}
            >{n.label}</div>
          ))}
        </div>
        <div style={{ padding:'16px 20px', borderTop:`0.5px solid ${BORDER}` }}>
          <div style={{ fontSize:11, color:TEXT_MUT, marginBottom:8, wordBreak:'break-all' }}>{user?.email}</div>
          <button style={btnStyle()} onClick={signOut}>로그아웃</button>
        </div>
      </aside>

      <main style={{ flex:1, padding:'28px 32px', maxWidth:940 }}>
        {page === 'dashboard' && <Dashboard clients={clients} referrals={referrals} schedules={schedules} setPage={setPage} />}
        {page === 'today'     && <Today schedules={schedules} setSchedules={setSchedules} />}
        {page === 'clients'   && <Clients clients={clients} setClients={setClients} />}
        {page === 'referrals' && <Referrals referrals={referrals} />}
        {page === 'partners'  && <Partners partners={partners} setPartners={setPartners} />}
      </main>
    </div>
  )
}

function Dashboard({ clients, referrals, schedules, setPage }: any) {
  const converted = referrals.filter((r:any) => r.status === 'converted').length
  return (
    <div>
      <div style={{ fontSize:20, fontWeight:600, color:TEXT_PRI, letterSpacing:'-0.03em', marginBottom:3 }}>대시보드</div>
      <div style={{ fontSize:12, color:TEXT_MUT, marginBottom:24 }}>{new Date().toLocaleDateString('ko-KR', { year:'numeric', month:'long', day:'numeric', weekday:'long' })}</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:24 }}>
        {[
          { l:'관리 고객',  v: clients.length,   s:'전체 등록 고객' },
          { l:'총 추천 수', v: referrals.length,  s:'전체 리퍼럴' },
          { l:'전환 완료',  v: converted,          s:`전환율 ${referrals.length ? Math.round(converted/referrals.length*100) : 0}%` },
          { l:'오늘 연락',  v: schedules.length,  s:'오늘의 리스트' },
        ].map((st,i) => (
          <div key={i} style={{ background:CARD, border:`0.5px solid ${BORDER}`, borderRadius:10, padding:'16px 18px' }}>
            <div style={{ fontSize:10, color:TEXT_MUT, textTransform:'uppercase', letterSpacing:'.06em', marginBottom:6 }}>{st.l}</div>
            <div style={{ fontSize:24, fontWeight:600, color:TEXT_PRI, letterSpacing:'-0.03em' }}>{st.v}</div>
            <div style={{ fontSize:11, color:'#3A3A38', marginTop:2 }}>{st.s}</div>
          </div>
        ))}
      </div>
      <div style={cardStyle}>
        <div style={cardHStyle}>
          <span>오늘의 연락 리스트 <span style={{ color:GOLD, marginLeft:4 }}>{schedules.length}</span></span>
          <span style={{ fontSize:11, color:GOLD, cursor:'pointer' }} onClick={() => setPage('today')}>전체 보기 →</span>
        </div>
        {schedules.length === 0 && <div style={{ padding:'24px 18px', color:TEXT_MUT, fontSize:13 }}>오늘 연락할 고객이 없어요 😊</div>}
        {schedules.slice(0,3).map((sc:any, i:number) => {
          const m = TYPE_META[sc.type] || TYPE_META.inspection
          return (
            <div key={sc.id} style={{ ...rowStyle, borderBottom: i===2?'none':undefined }}>
              <div style={avStyle(m.color)}>{sc.clients?.name?.[0] || '?'}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:500, color:TEXT_PRI, marginBottom:2 }}>{sc.clients?.name}</div>
                <div style={{ fontSize:11, color:TEXT_MUT }}>{sc.clients?.car_model}</div>
              </div>
              <span style={badgeStyle(m.color, m.bg)}>{m.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Today({ schedules, setSchedules }: any) {
  const supabase = createClient()
  const [done, setDone] = useState<string[]>([])

  const toggle = async (id: string) => {
    setDone(p => p.includes(id) ? p.filter(x=>x!==id) : [...p, id])
    await supabase.from('schedules').update({ is_contacted: true }).eq('id', id)
  }

  return (
    <div>
      <div style={{ fontSize:20, fontWeight:600, color:TEXT_PRI, letterSpacing:'-0.03em', marginBottom:3 }}>오늘의 연락 리스트</div>
      <div style={{ fontSize:12, color:TEXT_MUT, marginBottom:24 }}>완료 {done.length}/{schedules.length}</div>
      <div style={cardStyle}>
        {schedules.length === 0 && <div style={{ padding:'24px 18px', color:TEXT_MUT, fontSize:13 }}>오늘 연락할 고객이 없어요 😊</div>}
        {schedules.map((sc:any, i:number) => {
          const m = TYPE_META[sc.type] || TYPE_META.inspection
          const ok = done.includes(sc.id)
          return (
            <div key={sc.id} style={{ ...rowStyle, opacity:ok?0.5:1, borderBottom:i===schedules.length-1?'none':undefined }}>
              <div style={{ width:20, height:20, borderRadius:'50%', border:`1.5px solid ${ok?GOLD:'#333'}`, background:ok?GOLD:'transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'#0E0E10', transition:'all .2s' }} onClick={() => toggle(sc.id)}>{ok?'✓':''}</div>
              <div style={avStyle(m.color)}>{sc.clients?.name?.[0]||'?'}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:500, color:TEXT_PRI, marginBottom:2 }}>{sc.clients?.name}</div>
                <div style={{ fontSize:11, color:TEXT_MUT }}>{sc.clients?.car_model}</div>
              </div>
              <span style={badgeStyle(m.color, m.bg)}>{m.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Clients({ clients, setClients }: any) {
  const supabase = createClient()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name:'', phone:'', car_model:'', consultation_date:'' })
  const [saving, setSaving] = useState(false)

  const filtered = clients.filter((c:any) => c.name?.includes(search) || c.car_model?.includes(search))

  const save = async () => {
    if (!form.name) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    const insertData: any = {
      salesperson_id: user?.id,
      name: form.name,
      phone: form.phone || null,
      car_model: form.car_model || null,
    }
    if (form.consultation_date) insertData.delivery_date = form.consultation_date
    const { data } = await supabase.from('clients').insert(insertData).select()
    if (data) setClients((p:any) => [data[0], ...p])
    setForm({ name:'', phone:'', car_model:'', consultation_date:'' })
    setShowForm(false)
    setSaving(false)
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div>
          <div style={{ fontSize:20, fontWeight:600, color:TEXT_PRI, letterSpacing:'-0.03em', marginBottom:3 }}>고객 관리</div>
          <div style={{ fontSize:12, color:TEXT_MUT }}>등록 고객 {clients.length}명</div>
        </div>
        <button style={btnStyle('gold')} onClick={() => setShowForm(v=>!v)}>{showForm?'✕ 닫기':'+ 고객 등록'}</button>
      </div>

      {showForm && (
        <div style={{ ...cardStyle, marginBottom:16 }}>
          <div style={cardHStyle}>신규 고객 등록</div>
          <div style={{ padding:18, display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <div>
              <label style={labelStyle}>이름 *</label>
              <input style={inputStyle} placeholder="홍길동" value={form.name} onChange={e=>setForm(p=>({...p, name:e.target.value}))} />
            </div>
            <div>
              <label style={labelStyle}>전화번호</label>
              <input style={inputStyle} placeholder="010-0000-0000" value={form.phone} onChange={e=>setForm(p=>({...p, phone:e.target.value}))} />
            </div>
            <div style={{ gridColumn:'1/-1' }}>
              <label style={labelStyle}>차량 모델</label>
              <input style={inputStyle} placeholder="E 350 4MATIC" value={form.car_model} onChange={e=>setForm(p=>({...p, car_model:e.target.value}))} />
            </div>
            <div style={{ gridColumn:'1/-1' }}>
              <label style={labelStyle}>최초 상담일</label>
              <input style={inputStyle} type="date" value={form.consultation_date} onChange={e=>setForm(p=>({...p, consultation_date:e.target.value}))} />
            </div>
            <div style={{ gridColumn:'1/-1', display:'flex', gap:8, justifyContent:'flex-end' }}>
              <button style={btnStyle()} onClick={()=>setShowForm(false)}>취소</button>
              <button style={btnStyle('gold')} onClick={save} disabled={saving}>{saving?'저장중...':'저장'}</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginBottom:12 }}>
        <input style={inputStyle} placeholder="이름 또는 차량 검색..." value={search} onChange={e=>setSearch(e.target.value)} />
      </div>

      <div style={cardStyle}>
        <div style={{ display:'grid', gridTemplateColumns:'1.4fr 2fr 1.2fr 0.6fr', padding:'9px 18px', background:'#111113', fontSize:10, color:TEXT_MUT, letterSpacing:'.06em', textTransform:'uppercase' }}>
          <span>고객</span><span>차량</span><span>상담일</span><span></span>
        </div>
        {filtered.length === 0 && <div style={{ padding:'24px 18px', color:TEXT_MUT, fontSize:13 }}>등록된 고객이 없어요. 위에서 추가해보세요!</div>}
        {filtered.map((c:any, i:number) => (
          <div key={c.id} style={{ display:'grid', gridTemplateColumns:'1.4fr 2fr 1.2fr 0.6fr', padding:'12px 18px', borderBottom:i===filtered.length-1?'none':`0.5px solid #1A1A1C`, alignItems:'center', fontSize:13 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={avStyle(GOLD)}>{c.name?.[0]||'?'}</div>
              <span style={{ color:TEXT_PRI, fontWeight:500 }}>{c.name}</span>
            </div>
            <span style={{ color:TEXT_SEC }}>{c.car_model || '—'}</span>
            <span style={{ color:TEXT_MUT, fontSize:12 }}>{c.delivery_date || '—'}</span>
            <button style={btnStyle('sm')}>상세</button>
          </div>
        ))}
      </div>
    </div>
  )
}

function Referrals({ referrals }: any) {
  const [filter, setFilter] = useState('all')
  const filtered = filter==='all' ? referrals : referrals.filter((r:any)=>r.status===filter)
  return (
    <div>
      <div style={{ fontSize:20, fontWeight:600, color:TEXT_PRI, letterSpacing:'-0.03em', marginBottom:3 }}>리퍼럴 기록</div>
      <div style={{ fontSize:12, color:TEXT_MUT, marginBottom:24 }}>추천 링크로 들어온 상담 신청 현황</div>
      <div style={{ display:'flex', gap:6, marginBottom:18 }}>
        {['all','pending','consulting','converted'].map(t => (
          <button key={t} onClick={()=>setFilter(t)} style={{ padding:'5px 14px', borderRadius:6, fontSize:11, cursor:'pointer', background:filter===t?GOLD:'transparent', color:filter===t?'#0E0E10':TEXT_MUT, border:filter===t?'none':`0.5px solid ${BORDER}`, fontWeight:filter===t?600:400, transition:'all .12s' }}>
            {t==='all'?'전체':STATUS[t]?.label}
          </button>
        ))}
      </div>
      <div style={cardStyle}>
        {filtered.length === 0 && <div style={{ padding:'24px 18px', color:TEXT_MUT, fontSize:13 }}>리퍼럴 기록이 없어요.</div>}
        {filtered.map((r:any, i:number) => {
          const m = STATUS[r.status] || STATUS.pending
          return (
            <div key={r.id} style={{ display:'grid', gridTemplateColumns:'1.2fr 1.2fr 0.9fr', padding:'12px 18px', borderBottom:i===filtered.length-1?'none':`0.5px solid #1A1A1C`, alignItems:'center', fontSize:13 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={avStyle(GOLD)}>{r.clients?.name?.[0]||'?'}</div>
                <span style={{ color:TEXT_PRI }}>{r.clients?.name}</span>
              </div>
              <span style={{ color:TEXT_MUT, fontSize:12 }}>{r.partners?.name}</span>
              <span style={badgeStyle(m.color, m.bg)}>{m.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Partners({ partners, setPartners }: any) {
  const supabase = createClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name:'', category:'', phone:'', reward_description:'' })
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!form.name) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('partners').insert({ ...form, salesperson_id: user?.id }).select()
    if (data) setPartners((p:any) => [data[0], ...p])
    setForm({ name:'', category:'', phone:'', reward_description:'' })
    setShowForm(false)
    setSaving(false)
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div>
          <div style={{ fontSize:20, fontWeight:600, color:TEXT_PRI, letterSpacing:'-0.03em', marginBottom:3 }}>제휴업체 관리</div>
          <div style={{ fontSize:12, color:TEXT_MUT }}>직접 등록·수정 가능</div>
        </div>
        <button style={btnStyle('gold')} onClick={()=>setShowForm(v=>!v)}>{showForm?'✕ 닫기':'+ 업체 등록'}</button>
      </div>

      {showForm && (
        <div style={{ ...cardStyle, marginBottom:16 }}>
          <div style={cardHStyle}>신규 제휴업체 등록</div>
          <div style={{ padding:18, display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <div>
              <label style={labelStyle}>업체명 *</label>
              <input style={inputStyle} placeholder="프리미엄 광택 강남점" value={form.name} onChange={e=>setForm(p=>({...p, name:e.target.value}))} />
            </div>
            <div>
              <label style={labelStyle}>전화번호</label>
              <input style={inputStyle} placeholder="02-000-0000" value={form.phone} onChange={e=>setForm(p=>({...p, phone:e.target.value}))} />
            </div>
            <div>
              <label style={labelStyle}>업종</label>
              <input style={inputStyle} placeholder="광택·세라믹" value={form.category} onChange={e=>setForm(p=>({...p, category:e.target.value}))} />
            </div>
            <div>
              <label style={labelStyle}>리워드 내용</label>
              <input style={inputStyle} placeholder="20% 할인 바우처" value={form.reward_description} onChange={e=>setForm(p=>({...p, reward_description:e.target.value}))} />
            </div>
            <div style={{ gridColumn:'1/-1', display:'flex', gap:8, justifyContent:'flex-end' }}>
              <button style={btnStyle()} onClick={()=>setShowForm(false)}>취소</button>
              <button style={btnStyle('gold')} onClick={save} disabled={saving}>{saving?'저장중...':'저장'}</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        {partners.length === 0 && <div style={{ color:TEXT_MUT, fontSize:13, gridColumn:'1/-1' }}>등록된 제휴업체가 없어요. 추가해보세요!</div>}
        {partners.map((p:any) => (
          <div key={p.id} style={cardStyle}>
            <div style={{ padding:'16px 18px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={avStyle(GOLD)}>제</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:500, color:TEXT_PRI }}>{p.name}</div>
                    <div style={{ fontSize:11, color:TEXT_MUT }}>{p.category}</div>
                  </div>
                </div>
                <div style={{ width:7, height:7, borderRadius:'50%', background:p.is_active?'#1D9E75':'#333' }} />
              </div>
              <div style={{ fontSize:12, color:TEXT_MUT, marginBottom:4 }}>📞 {p.phone || '—'}</div>
              <div style={{ fontSize:12, color:TEXT_SEC }}>{p.reward_description || '—'}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
