'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const NAVY   = '#1B2A4A'
const NAVY2  = '#243758'
const CREAM  = '#F8F5F0'
const CREAM2 = '#F2EDE8'
const WHITE  = '#FFFFFF'
const GOLD   = '#C9A84C'
const GOLD_BG = '#FBF6E8'
const GOLD_TX = '#8B6914'
const TX1    = '#1A1A1A'
const TX2    = '#555550'
const TX3    = '#AAAAAA'
const BORDER = '#E8E0D5'
const GREEN  = '#2D6A4F'
const GREEN_BG = '#F0FAF4'

export default function LandingPage() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  const features = [
    {
      icon: '📋',
      title: '스마트 고객 스케줄러',
      desc: '차량 인도일 입력 하나로 감사문자, 1·2·3년 정기점검 알림이 자동 생성됩니다. 더 이상 놓치는 고객이 없어요.',
    },
    {
      icon: '📁',
      title: '고객 정보 완벽 관리',
      desc: '기본 정보, 차량 정보, 연락 히스토리, 견적서까지 한 곳에서 관리하세요. 어떤 고객이든 3초 안에 파악할 수 있어요.',
    },
    {
      icon: '📊',
      title: '영업 대시보드',
      desc: '오늘 연락할 고객, 이번 주 예정, 실적 현황을 한눈에 확인하세요. 매일 아침 하루 계획이 자동으로 잡혀있습니다.',
    },
    {
      icon: '💬',
      title: '자동 문자 & 카카오 발송',
      desc: '정해진 시점에 자동으로 문자가 발송됩니다. 감사 인사, 점검 안내까지 — 직접 보내지 않아도 고객 관계가 유지돼요.',
    },
    {
      icon: '🔗',
      title: '리퍼럴 추천 시스템',
      desc: '고객이 지인을 추천하면 자동으로 기록됩니다. 추천 현황과 전환율을 실시간으로 확인할 수 있어요.',
    },
    {
      icon: '📎',
      title: '견적서 저장',
      desc: '고객별 견적서 이미지를 바로 저장하고 언제든 꺼내볼 수 있어요. 재상담 시 이전 견적을 1초 만에 확인합니다.',
    },
  ]

  const plans = [
    {
      name: 'Free',
      price: '무료',
      period: '',
      desc: '처음 시작하는 영업사원을 위한 플랜',
      features: [
        '고객 20명까지',
        '오늘의 연락 리스트',
        '고객 기본 정보 관리',
        '연락 히스토리',
      ],
      disabled: ['자동 문자/카카오 발송', '견적서 저장', '리퍼럴 시스템'],
      cta: '무료로 시작',
      highlight: false,
    },
    {
      name: 'Pro',
      price: '월 29,900원',
      period: '/ 월',
      desc: '고객 관리를 자동화하고 싶은 영업사원을 위한 플랜',
      features: [
        '고객 무제한',
        '오늘의 연락 리스트',
        '고객 정보 완벽 관리',
        '자동 문자 & 카카오 발송',
        '견적서 저장',
        '리퍼럴 추천 시스템',
        '월간 실적 리포트',
        '우선 고객 지원',
      ],
      disabled: [],
      cta: '30일 무료 체험',
      highlight: true,
    },
  ]

  const testimonials = [
    { name: '김○○ 컨설턴트', brand: 'Mercedes-Benz 강남', text: '예전엔 엑셀로 고객 관리하다가 실수도 많고 힘들었는데, SalesPath 쓰고 나서 한 달에 계약이 2건 더 늘었어요. 자동으로 연락 리스트가 만들어지니까 고객을 절대 안 놓쳐요.' },
    { name: '이○○ 컨설턴트', brand: 'BMW 서초', text: '인도 후 감사문자를 직접 보내다 보면 바쁠 때 놓치는 경우가 많았는데, 이제 자동으로 알림이 오고 발송까지 되니까 고객 만족도가 확실히 올라갔습니다.' },
    { name: '박○○ 컨설턴트', brand: 'Audi 잠실', text: '견적서 이미지를 고객별로 저장해두니까 재상담할 때 너무 편해요. 이전에 어떤 조건으로 얘기했는지 바로 확인할 수 있어서 고객 신뢰도가 올라갔어요.' },
  ]

  return (
    <div style={{ fontFamily:"'DM Sans','Apple SD Gothic Neo',system-ui,sans-serif", color:TX1, background:WHITE }}>

      {/* 네비게이션 */}
      <nav style={{ position:'sticky', top:0, zIndex:100, background:NAVY, borderBottom:`1px solid ${NAVY2}` }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 32px', display:'flex', alignItems:'center', justifyContent:'space-between', height:64 }}>
          <div style={{ fontSize:20, fontWeight:600, color:WHITE, letterSpacing:'.02em' }}>SalesPath</div>
          <div style={{ display:'flex', alignItems:'center', gap:32 }}>
            {['기능','가격','후기'].map(m => (
              <a key={m} href={`#${m}`} style={{ fontSize:14, color:'#8A9EBF', textDecoration:'none', letterSpacing:'.02em' }}>{m}</a>
            ))}
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={()=>router.push('/login')} style={{ padding:'8px 18px', borderRadius:3, fontSize:13, fontWeight:500, cursor:'pointer', border:`1px solid #3A5070`, background:'transparent', color:CREAM, letterSpacing:'.02em' }}>
              로그인
            </button>
            <button onClick={()=>router.push('/login')} style={{ padding:'8px 18px', borderRadius:3, fontSize:13, fontWeight:600, cursor:'pointer', border:'none', background:GOLD, color:WHITE, letterSpacing:'.02em' }}>
              무료 시작
            </button>
          </div>
        </div>
      </nav>

      {/* 히어로 섹션 */}
      <section style={{ background:`linear-gradient(135deg, ${NAVY} 0%, #2A3F6A 100%)`, padding:'100px 32px', textAlign:'center' }}>
        <div style={{ maxWidth:800, margin:'0 auto' }}>
          <div style={{ display:'inline-block', background:GOLD_BG, color:GOLD_TX, fontSize:12, fontWeight:600, padding:'6px 16px', borderRadius:3, marginBottom:24, letterSpacing:'.06em', border:`1px solid ${GOLD}40` }}>
            자동차 영업사원 전용 CRM
          </div>
          <h1 style={{ fontSize:52, fontWeight:600, color:WHITE, lineHeight:1.2, letterSpacing:'-.03em', marginBottom:20 }}>
            고객을 절대<br />놓치지 마세요
          </h1>
          <p style={{ fontSize:18, color:'#8A9EBF', lineHeight:1.7, marginBottom:40, letterSpacing:'.01em' }}>
            차량 인도일 하나만 입력하면<br />
            감사문자부터 3년 정기점검 안내까지 자동으로 발송됩니다.
          </p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={()=>router.push('/login')} style={{ padding:'14px 32px', borderRadius:3, fontSize:15, fontWeight:600, cursor:'pointer', border:'none', background:GOLD, color:WHITE, letterSpacing:'.04em' }}>
              30일 무료 체험 시작
            </button>
            <button style={{ padding:'14px 32px', borderRadius:3, fontSize:15, fontWeight:500, cursor:'pointer', border:`1px solid #3A5070`, background:'transparent', color:CREAM, letterSpacing:'.04em' }}>
              기능 둘러보기 ↓
            </button>
          </div>
          <p style={{ fontSize:12, color:'#4A6080', marginTop:16, letterSpacing:'.02em' }}>신용카드 불필요 · 30일 무료 · 언제든 취소 가능</p>
        </div>
      </section>

      {/* 숫자로 보는 효과 */}
      <section style={{ background:CREAM, padding:'60px 32px', borderBottom:`1px solid ${BORDER}` }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:40, textAlign:'center' }}>
          {[
            { num:'평균 +2.3건', label:'월 계약 증가', sub:'SalesPath 사용 후 평균' },
            { num:'0원', label:'놓친 고객 비용', sub:'자동 알림으로 이탈 방지' },
            { num:'3초', label:'고객 정보 확인', sub:'어떤 고객이든 즉시 파악' },
            { num:'100%', label:'자동화', sub:'인도 후 모든 연락 자동 처리' },
          ].map((s,i) => (
            <div key={i}>
              <div style={{ fontSize:36, fontWeight:600, color:NAVY, letterSpacing:'-.03em', marginBottom:6 }}>{s.num}</div>
              <div style={{ fontSize:15, fontWeight:600, color:TX1, marginBottom:4 }}>{s.label}</div>
              <div style={{ fontSize:12, color:TX3 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 기능 섹션 */}
      <section id="기능" style={{ padding:'80px 32px', background:WHITE }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <div style={{ fontSize:12, color:GOLD_TX, fontWeight:600, letterSpacing:'.1em', textTransform:'uppercase', marginBottom:12 }}>Features</div>
            <h2 style={{ fontSize:36, fontWeight:600, color:TX1, letterSpacing:'-.02em', marginBottom:14 }}>영업에 필요한 모든 것</h2>
            <p style={{ fontSize:16, color:TX2, lineHeight:1.7 }}>복잡한 설정 없이 바로 사용할 수 있어요</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
            {features.map((f,i) => (
              <div key={i} style={{ background:CREAM, border:`1px solid ${BORDER}`, borderRadius:6, padding:'28px 26px' }}>
                <div style={{ fontSize:32, marginBottom:16 }}>{f.icon}</div>
                <div style={{ fontSize:16, fontWeight:600, color:TX1, marginBottom:10, letterSpacing:'-.01em' }}>{f.title}</div>
                <div style={{ fontSize:14, color:TX2, lineHeight:1.7 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 자동화 흐름 섹션 */}
      <section style={{ padding:'80px 32px', background:NAVY }}>
        <div style={{ maxWidth:900, margin:'0 auto', textAlign:'center' }}>
          <div style={{ fontSize:12, color:GOLD, fontWeight:600, letterSpacing:'.1em', textTransform:'uppercase', marginBottom:12 }}>Automation</div>
          <h2 style={{ fontSize:36, fontWeight:600, color:WHITE, letterSpacing:'-.02em', marginBottom:14 }}>인도일 하나로<br />모든 게 자동으로</h2>
          <p style={{ fontSize:16, color:'#8A9EBF', lineHeight:1.7, marginBottom:56 }}>차량 인도일만 입력하면 이후 모든 연락이 자동으로 예약됩니다</p>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:0, flexWrap:'wrap' }}>
            {[
              { day:'인도일', label:'차량 인도', color:GOLD },
              { day:'+3일', label:'감사 문자', color:'#1D9E75' },
              { day:'+11개월 15일', label:'1년 점검 안내', color:'#378ADD' },
              { day:'+23개월 15일', label:'2년 점검 안내', color:'#378ADD' },
              { day:'+35개월 15일', label:'3년 점검 안내', color:'#378ADD' },
            ].map((s,i,arr) => (
              <div key={i} style={{ display:'flex', alignItems:'center' }}>
                <div style={{ textAlign:'center', padding:'0 12px' }}>
                  <div style={{ width:52, height:52, borderRadius:'50%', background:s.color+'20', border:`2px solid ${s.color}`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 10px', fontSize:11, fontWeight:700, color:s.color }}>
                    {i+1}
                  </div>
                  <div style={{ fontSize:12, color:s.color, fontWeight:600, marginBottom:4, letterSpacing:'.02em' }}>{s.day}</div>
                  <div style={{ fontSize:12, color:'#8A9EBF' }}>{s.label}</div>
                </div>
                {i<arr.length-1 && <div style={{ width:32, height:1, background:'#2A3F6A', flexShrink:0 }} />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 가격 섹션 */}
      <section id="가격" style={{ padding:'80px 32px', background:CREAM }}>
        <div style={{ maxWidth:800, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <div style={{ fontSize:12, color:GOLD_TX, fontWeight:600, letterSpacing:'.1em', textTransform:'uppercase', marginBottom:12 }}>Pricing</div>
            <h2 style={{ fontSize:36, fontWeight:600, color:TX1, letterSpacing:'-.02em', marginBottom:14 }}>합리적인 가격</h2>
            <p style={{ fontSize:16, color:TX2 }}>계약 한 건이면 연간 구독료가 해결돼요</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
            {plans.map((plan,i) => (
              <div key={i} style={{ background:plan.highlight?NAVY:WHITE, border:`1px solid ${plan.highlight?NAVY:BORDER}`, borderRadius:6, padding:'32px 28px', position:'relative' }}>
                {plan.highlight && (
                  <div style={{ position:'absolute', top:-12, left:'50%', transform:'translateX(-50%)', background:GOLD, color:WHITE, fontSize:11, fontWeight:700, padding:'4px 16px', borderRadius:3, letterSpacing:'.06em', whiteSpace:'nowrap' }}>
                    가장 인기
                  </div>
                )}
                <div style={{ fontSize:13, fontWeight:600, color:plan.highlight?'#8A9EBF':TX3, letterSpacing:'.06em', textTransform:'uppercase', marginBottom:8 }}>{plan.name}</div>
                <div style={{ fontSize:28, fontWeight:600, color:plan.highlight?WHITE:TX1, letterSpacing:'-.02em', marginBottom:6 }}>{plan.price}</div>
                <div style={{ fontSize:13, color:plan.highlight?'#6A7E9E':TX3, marginBottom:24, lineHeight:1.5 }}>{plan.desc}</div>
                <div style={{ borderTop:`1px solid ${plan.highlight?NAVY2:BORDER}`, paddingTop:20, marginBottom:24 }}>
                  {plan.features.map((f,j) => (
                    <div key={j} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10, fontSize:14, color:plan.highlight?CREAM:TX1 }}>
                      <span style={{ color:plan.highlight?GOLD:GREEN, fontWeight:700, fontSize:16 }}>✓</span> {f}
                    </div>
                  ))}
                  {plan.disabled.map((f,j) => (
                    <div key={j} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10, fontSize:14, color:plan.highlight?'#3A5070':'#CCC' }}>
                      <span style={{ color:plan.highlight?'#3A5070':'#DDD', fontWeight:700, fontSize:16 }}>✕</span> {f}
                    </div>
                  ))}
                </div>
                <button onClick={()=>router.push('/login')} style={{ width:'100%', padding:'12px', borderRadius:3, fontSize:14, fontWeight:600, cursor:'pointer', border:'none', background:plan.highlight?GOLD:NAVY, color:WHITE, letterSpacing:'.04em' }}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
          <p style={{ textAlign:'center', fontSize:13, color:TX3, marginTop:20 }}>💳 Pro 플랜 30일 무료 체험 · 신용카드 불필요 · 언제든 취소 가능</p>
        </div>
      </section>

      {/* 후기 섹션 */}
      <section id="후기" style={{ padding:'80px 32px', background:WHITE }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <div style={{ fontSize:12, color:GOLD_TX, fontWeight:600, letterSpacing:'.1em', textTransform:'uppercase', marginBottom:12 }}>Reviews</div>
            <h2 style={{ fontSize:36, fontWeight:600, color:TX1, letterSpacing:'-.02em' }}>실제 영업사원의 후기</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
            {testimonials.map((t,i) => (
              <div key={i} style={{ background:CREAM, border:`1px solid ${BORDER}`, borderRadius:6, padding:'28px 26px' }}>
                <div style={{ fontSize:24, color:GOLD, marginBottom:16 }}>❝</div>
                <p style={{ fontSize:14, color:TX2, lineHeight:1.8, marginBottom:20 }}>{t.text}</p>
                <div style={{ borderTop:`1px solid ${BORDER}`, paddingTop:16 }}>
                  <div style={{ fontSize:14, fontWeight:600, color:TX1 }}>{t.name}</div>
                  <div style={{ fontSize:12, color:TX3, marginTop:2 }}>{t.brand}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section style={{ padding:'80px 32px', background:NAVY, textAlign:'center' }}>
        <div style={{ maxWidth:600, margin:'0 auto' }}>
          <h2 style={{ fontSize:36, fontWeight:600, color:WHITE, letterSpacing:'-.02em', marginBottom:16 }}>지금 바로 시작하세요</h2>
          <p style={{ fontSize:16, color:'#8A9EBF', lineHeight:1.7, marginBottom:36 }}>30일 동안 무료로 모든 기능을 사용해보세요.<br />신용카드 없이 바로 시작할 수 있어요.</p>
          <button onClick={()=>router.push('/login')} style={{ padding:'16px 40px', borderRadius:3, fontSize:16, fontWeight:600, cursor:'pointer', border:'none', background:GOLD, color:WHITE, letterSpacing:'.04em' }}>
            30일 무료 체험 시작하기
          </button>
          <p style={{ fontSize:12, color:'#4A6080', marginTop:16 }}>신용카드 불필요 · 언제든 취소 가능</p>
        </div>
      </section>

      {/* 푸터 */}
      <footer style={{ background:'#0A0A0A', padding:'32px', textAlign:'center' }}>
        <div style={{ fontSize:16, fontWeight:600, color:WHITE, marginBottom:8, letterSpacing:'.02em' }}>SalesPath</div>
        <div style={{ fontSize:12, color:'#444', letterSpacing:'.02em' }}>자동차 영업사원을 위한 스마트 CRM</div>
        <div style={{ fontSize:11, color:'#333', marginTop:16 }}>© 2026 SalesPath. All rights reserved.</div>
      </footer>
    </div>
  )
}
