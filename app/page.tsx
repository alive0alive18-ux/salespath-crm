'use client'
import { useRouter } from 'next/navigation'

const NAVY='#1B2A4A',NAVY2='#243758',CREAM='#F8F5F0',WHITE='#FFFFFF'
const GOLD='#C9A84C',GOLD_BG='#FBF6E8',GOLD_TX='#8B6914'
const TX1='#1A1A1A',TX2='#555550',TX3='#AAAAAA',BORDER='#E8E0D5'
const GREEN='#2D6A4F',BLUE='#1D4ED8',PURPLE='#6D28D9'

export default function LandingPage() {
  const router = useRouter()

  const features = [
    { icon:'⚡', title:'당직 고객 빠른 등록', desc:'이름, 전화번호, 관심 차종으로 10초 안에 등록', color:GOLD },
    { icon:'🗓️', title:'스마트 자동 스케줄러', desc:'인도일 입력 하나로 감사문자·점검 알림 자동 생성', color:GREEN },
    { icon:'📊', title:'계약 단계 관리', desc:'첫방문→시승→견적→계약→출고 한눈에', color:PURPLE },
    { icon:'💬', title:'문자 템플릿', desc:'자주 쓰는 문자 저장, 원클릭 복사', color:BLUE },
    { icon:'🎂', title:'생일 & 기념일 알림', desc:'고객 생일, 인도 기념일 자동 알림', color:'#E91E8C' },
    { icon:'🤝', title:'소개 고객 추적', desc:'소개 경로 기록, TOP 고객 파악', color:'#F59E0B' },
    { icon:'📎', title:'견적서 저장', desc:'고객별 견적서 저장, 재상담 시 즉시 확인', color:'#0EA5E9' },
    { icon:'📈', title:'실적 리포트', desc:'월별 추이, 단계별 현황, 소개 TOP 5', color:GREEN },
    { icon:'⭐', title:'VIP 고객 관리', desc:'VIP 분류, 이번달 목표 대비 실적 관리', color:GOLD },
  ]

  const plans = [
    {
      name:'Free', price:'무료', highlight:false, cta:'무료로 시작',
      desc:'처음 시작하는 영업사원을 위한 플랜',
      features:['고객 20명까지','오늘의 연락 리스트','고객 기본 정보 관리','연락 히스토리','당직 빠른 등록'],
      disabled:['자동 스케줄 알림','문자 템플릿','실적 리포트','견적서 저장'],
    },
    {
      name:'Pro', price:'월 9,900원', highlight:true, cta:'30일 무료 체험',
      desc:'고객 관리를 자동화하고 싶은 영업사원을 위한 플랜',
      features:['고객 무제한','자동 스케줄 알림','계약 단계 관리','문자 템플릿 무제한','생일 & 기념일 알림','소개 고객 추적','견적서 저장','실적 리포트','VIP 고객 관리','이번달 목표 관리','월간 캘린더'],
      disabled:[],
    },
  ]

  const testimonials = [
    { name:'김○○ 컨설턴트', brand:'Mercedes-Benz 강남', text:'SalesPath 쓰고 나서 한 달에 계약이 2건 더 늘었어요. 자동으로 연락 리스트가 만들어지니까 고객을 절대 안 놓쳐요.' },
    { name:'이○○ 컨설턴트', brand:'BMW 서초', text:'인도 후 감사문자를 놓치는 경우가 많았는데, 이제 자동으로 알림이 오니까 고객 만족도가 확실히 올라갔습니다.' },
    { name:'박○○ 컨설턴트', brand:'Audi 잠실', text:'견적서를 고객별로 저장해두니까 재상담할 때 너무 편해요. 고객 신뢰도가 확실히 올라갔어요.' },
  ]

  return (
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        .nav-links{display:flex;align-items:center;gap:32px;}
        .nav-login{display:block;}
        .hero-title{font-size:52px;}
        .hero-sub{font-size:18px;}
        .stats-grid{grid-template-columns:repeat(4,1fr)!important;}
        .features-grid{grid-template-columns:repeat(3,1fr)!important;}
        .auto-grid{grid-template-columns:repeat(5,1fr)!important;}
        .auto-arrow{display:block!important;}
        .plans-grid{grid-template-columns:1fr 1fr!important;}
        .reviews-grid{grid-template-columns:repeat(3,1fr)!important;}
        .feature-card{padding:28px 26px!important;}
        .feature-title{font-size:16px!important;}
        .feature-desc{font-size:14px!important;}
        @media(max-width:767px){
          .nav-links{display:none!important;}
          .nav-login{display:none!important;}
          .hero-title{font-size:32px!important;letter-spacing:-.01em!important;}
          .hero-sub{font-size:15px!important;}
          .stats-grid{grid-template-columns:1fr 1fr!important;gap:12px!important;}
          .features-grid{grid-template-columns:1fr 1fr!important;gap:12px!important;}
          .auto-grid{grid-template-columns:1fr 1fr!important;gap:12px!important;}
          .auto-arrow{display:none!important;}
          .plans-grid{grid-template-columns:1fr!important;}
          .reviews-grid{grid-template-columns:1fr!important;}
          .feature-card{padding:16px 14px!important;}
          .feature-title{font-size:13px!important;}
          .feature-desc{font-size:12px!important;}
          .section-title{font-size:26px!important;}
          .section-pad{padding:40px 16px!important;}
          .hero-pad{padding:56px 20px!important;}
          .stats-pad{padding:28px 16px!important;}
          .nav-pad{padding:0 16px!important;}
          .hero-btn{padding:12px 24px!important;font-size:14px!important;}
          .cta-title{font-size:24px!important;}
          .plan-price{font-size:24px!important;}
        }
      `}</style>

      <div style={{ fontFamily:"'Apple SD Gothic Neo','DM Sans',system-ui,sans-serif", color:TX1, background:WHITE }}>

        {/* 네비 */}
        <nav style={{ position:'sticky', top:0, zIndex:100, background:NAVY, borderBottom:`1px solid ${NAVY2}` }}>
          <div className="nav-pad" style={{ maxWidth:1100, margin:'0 auto', padding:'0 32px', display:'flex', alignItems:'center', justifyContent:'space-between', height:56 }}>
            <div style={{ fontSize:18, fontWeight:700, color:WHITE }}>SalesPath</div>
            <div className="nav-links">
              {['기능','가격','후기'].map(m=>(
                <a key={m} href={`#${m}`} style={{ fontSize:14, color:'#8A9EBF', textDecoration:'none' }}>{m}</a>
              ))}
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button className="nav-login" onClick={()=>router.push('/login')} style={{ padding:'7px 16px', borderRadius:4, fontSize:13, fontWeight:500, cursor:'pointer', border:`1px solid #3A5070`, background:'transparent', color:'#F8F5F0' }}>로그인</button>
              <button onClick={()=>router.push('/login')} style={{ padding:'7px 16px', borderRadius:4, fontSize:13, fontWeight:600, cursor:'pointer', border:'none', background:GOLD, color:WHITE }}>무료 시작</button>
            </div>
          </div>
        </nav>

        {/* 히어로 */}
        <section className="hero-pad" style={{ background:`linear-gradient(135deg,${NAVY} 0%,#2A3F6A 100%)`, padding:'90px 32px', textAlign:'center' }}>
          <div style={{ maxWidth:800, margin:'0 auto' }}>
            <div style={{ display:'inline-block', background:GOLD_BG, color:GOLD_TX, fontSize:11, fontWeight:600, padding:'5px 14px', borderRadius:20, marginBottom:18, letterSpacing:'.06em' }}>
              자동차 영업사원 전용 CRM
            </div>
            <h1 className="hero-title" style={{ fontWeight:700, color:WHITE, lineHeight:1.2, marginBottom:16 }}>
              고객을 절대<br />놓치지 마세요
            </h1>
            <p className="hero-sub" style={{ color:'#8A9EBF', lineHeight:1.7, marginBottom:28 }}>
              차량 인도일 하나만 입력하면<br />감사문자부터 3년 점검 안내까지 자동으로
            </p>
            <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' as const }}>
              <button className="hero-btn" onClick={()=>router.push('/login')} style={{ padding:'13px 30px', borderRadius:6, fontSize:15, fontWeight:600, cursor:'pointer', border:'none', background:GOLD, color:WHITE }}>
                30일 무료 체험 시작
              </button>
              <a className="hero-btn" href="#기능" style={{ padding:'13px 30px', borderRadius:6, fontSize:15, fontWeight:500, border:`1px solid #3A5070`, background:'transparent', color:'#F8F5F0', textDecoration:'none', display:'inline-block' }}>
                기능 보기 ↓
              </a>
            </div>
            <p style={{ fontSize:12, color:'#4A6080', marginTop:14 }}>신용카드 불필요 · 30일 무료 · 언제든 취소</p>
          </div>
        </section>

        {/* 숫자 */}
        <section className="stats-pad" style={{ background:CREAM, padding:'52px 32px', borderBottom:`1px solid ${BORDER}` }}>
          <div className="stats-grid" style={{ maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:32, textAlign:'center' as const }}>
            {[
              { num:'평균 +2.3건', label:'월 계약 증가' },
              { num:'0원', label:'놓친 고객 비용' },
              { num:'3초', label:'고객 정보 확인' },
              { num:'100%', label:'인도 후 자동화' },
            ].map((s,i)=>(
              <div key={i}>
                <div style={{ fontSize:32, fontWeight:700, color:NAVY, marginBottom:6 }}>{s.num}</div>
                <div style={{ fontSize:14, fontWeight:600, color:TX1 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 기능 */}
        <section className="section-pad" id="기능" style={{ padding:'72px 32px', background:WHITE }}>
          <div style={{ maxWidth:1100, margin:'0 auto' }}>
            <div style={{ textAlign:'center' as const, marginBottom:40 }}>
              <div style={{ fontSize:11, color:GOLD_TX, fontWeight:600, letterSpacing:'.1em', textTransform:'uppercase' as const, marginBottom:10 }}>Features</div>
              <h2 className="section-title" style={{ fontSize:36, fontWeight:700, color:TX1, marginBottom:10 }}>영업에 필요한 모든 것</h2>
              <p style={{ fontSize:15, color:TX2 }}>복잡한 설정 없이 바로 사용할 수 있어요</p>
            </div>
            <div className="features-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
              {features.map((f,i)=>(
                <div className="feature-card" key={i} style={{ background:CREAM, border:`1px solid ${BORDER}`, borderRadius:8, padding:'24px 20px', borderTop:`3px solid ${f.color}` }}>
                  <div style={{ fontSize:28, marginBottom:10 }}>{f.icon}</div>
                  <div className="feature-title" style={{ fontSize:15, fontWeight:600, color:TX1, marginBottom:6 }}>{f.title}</div>
                  <div className="feature-desc" style={{ fontSize:13, color:TX2, lineHeight:1.6 }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 자동화 흐름 */}
        <section className="section-pad" style={{ padding:'72px 32px', background:NAVY }}>
          <div style={{ maxWidth:900, margin:'0 auto', textAlign:'center' as const }}>
            <div style={{ fontSize:11, color:GOLD, fontWeight:600, letterSpacing:'.1em', textTransform:'uppercase' as const, marginBottom:10 }}>Automation</div>
            <h2 className="section-title" style={{ fontSize:36, fontWeight:700, color:WHITE, marginBottom:12 }}>인도일 하나로<br />모든 게 자동으로</h2>
            <p style={{ fontSize:15, color:'#8A9EBF', lineHeight:1.7, marginBottom:40 }}>차량 인도일만 입력하면 이후 모든 연락이 자동 예약됩니다</p>
            <div className="auto-grid" style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8, alignItems:'center' }}>
              {[
                { day:'인도일', label:'차량 인도', color:GOLD },
                { day:'+3일', label:'감사 문자', color:'#1D9E75' },
                { day:'+1년', label:'1년 점검', color:'#378ADD' },
                { day:'+2년', label:'2년 점검', color:'#378ADD' },
                { day:'+3년', label:'3년 점검', color:'#378ADD' },
              ].map((s,i)=>(
                <div key={i} style={{ textAlign:'center' as const, padding:'8px 4px' }}>
                  <div style={{ width:44, height:44, borderRadius:'50%', background:s.color+'20', border:`2px solid ${s.color}`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 8px', fontSize:13, fontWeight:700, color:s.color }}>{i+1}</div>
                  <div style={{ fontSize:12, color:s.color, fontWeight:600, marginBottom:2 }}>{s.day}</div>
                  <div style={{ fontSize:11, color:'#8A9EBF' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 가격 */}
        <section className="section-pad" id="가격" style={{ padding:'72px 32px', background:CREAM }}>
          <div style={{ maxWidth:800, margin:'0 auto' }}>
            <div style={{ textAlign:'center' as const, marginBottom:40 }}>
              <div style={{ fontSize:11, color:GOLD_TX, fontWeight:600, letterSpacing:'.1em', textTransform:'uppercase' as const, marginBottom:10 }}>Pricing</div>
              <h2 className="section-title" style={{ fontSize:36, fontWeight:700, color:TX1, marginBottom:10 }}>합리적인 가격</h2>
              <p style={{ fontSize:15, color:TX2 }}>커피 두 잔 가격으로 고객 관리를 자동화하세요</p>
            </div>
            <div className="plans-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              {plans.map((plan,i)=>(
                <div key={i} style={{ background:plan.highlight?NAVY:WHITE, border:`1px solid ${plan.highlight?NAVY:BORDER}`, borderRadius:10, padding:'28px 24px', position:'relative' as const }}>
                  {plan.highlight&&(
                    <div style={{ position:'absolute' as const, top:-12, left:'50%', transform:'translateX(-50%)', background:GOLD, color:WHITE, fontSize:11, fontWeight:700, padding:'4px 16px', borderRadius:20, whiteSpace:'nowrap' as const }}>가장 인기</div>
                  )}
                  <div style={{ fontSize:11, fontWeight:600, color:plan.highlight?'#8A9EBF':TX3, letterSpacing:'.06em', textTransform:'uppercase' as const, marginBottom:6 }}>{plan.name}</div>
                  <div className="plan-price" style={{ fontSize:26, fontWeight:700, color:plan.highlight?WHITE:TX1, marginBottom:6 }}>{plan.price}</div>
                  <div style={{ fontSize:13, color:plan.highlight?'#6A7E9E':TX3, marginBottom:18, lineHeight:1.5 }}>{plan.desc}</div>
                  <div style={{ borderTop:`1px solid ${plan.highlight?NAVY2:BORDER}`, paddingTop:14, marginBottom:18 }}>
                    {plan.features.map((f,j)=>(
                      <div key={j} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, fontSize:13, color:plan.highlight?'#F8F5F0':TX1 }}>
                        <span style={{ color:plan.highlight?GOLD:GREEN, fontWeight:700, flexShrink:0 }}>✓</span>{f}
                      </div>
                    ))}
                    {plan.disabled.map((f,j)=>(
                      <div key={j} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, fontSize:13, color:plan.highlight?'#3A5070':'#CCC' }}>
                        <span style={{ color:plan.highlight?'#3A5070':'#DDD', fontWeight:700, flexShrink:0 }}>✕</span>{f}
                      </div>
                    ))}
                  </div>
                  <button onClick={()=>router.push('/login')} style={{ width:'100%', padding:'13px', borderRadius:6, fontSize:14, fontWeight:600, cursor:'pointer', border:'none', background:plan.highlight?GOLD:NAVY, color:WHITE }}>
                    {plan.cta}
                  </button>
                </div>
              ))}
            </div>
            <p style={{ textAlign:'center' as const, fontSize:13, color:TX3, marginTop:16 }}>💳 30일 무료 · 신용카드 불필요 · 언제든 취소</p>
          </div>
        </section>

        {/* 후기 */}
        <section className="section-pad" id="후기" style={{ padding:'72px 32px', background:WHITE }}>
          <div style={{ maxWidth:1100, margin:'0 auto' }}>
            <div style={{ textAlign:'center' as const, marginBottom:40 }}>
              <div style={{ fontSize:11, color:GOLD_TX, fontWeight:600, letterSpacing:'.1em', textTransform:'uppercase' as const, marginBottom:10 }}>Reviews</div>
              <h2 className="section-title" style={{ fontSize:36, fontWeight:700, color:TX1 }}>실제 영업사원의 후기</h2>
            </div>
            <div className="reviews-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
              {testimonials.map((t,i)=>(
                <div key={i} style={{ background:CREAM, border:`1px solid ${BORDER}`, borderRadius:10, padding:'22px 20px' }}>
                  <div style={{ fontSize:20, color:GOLD, marginBottom:10 }}>❝</div>
                  <p style={{ fontSize:14, color:TX2, lineHeight:1.8, marginBottom:14 }}>{t.text}</p>
                  <div style={{ borderTop:`1px solid ${BORDER}`, paddingTop:12 }}>
                    <div style={{ fontSize:14, fontWeight:600, color:TX1 }}>{t.name}</div>
                    <div style={{ fontSize:12, color:TX3, marginTop:2 }}>{t.brand}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-pad" style={{ padding:'72px 32px', background:NAVY, textAlign:'center' as const }}>
          <div style={{ maxWidth:600, margin:'0 auto' }}>
            <h2 className="cta-title" style={{ fontSize:36, fontWeight:700, color:WHITE, marginBottom:14 }}>지금 바로 시작하세요</h2>
            <p style={{ fontSize:15, color:'#8A9EBF', lineHeight:1.7, marginBottom:28 }}>30일 동안 무료로 모든 기능을 사용해보세요.<br />신용카드 없이 바로 시작할 수 있어요.</p>
            <button className="hero-btn" onClick={()=>router.push('/login')} style={{ padding:'14px 36px', borderRadius:6, fontSize:15, fontWeight:600, cursor:'pointer', border:'none', background:GOLD, color:WHITE }}>
              30일 무료 체험 시작하기
            </button>
            <p style={{ fontSize:12, color:'#4A6080', marginTop:14 }}>신용카드 불필요 · 언제든 취소 가능</p>
          </div>
        </section>

        {/* 푸터 */}
        <footer style={{ background:'#0A0A0A', padding:'24px 16px', textAlign:'center' as const }}>
          <div style={{ fontSize:15, fontWeight:600, color:WHITE, marginBottom:6 }}>SalesPath</div>
          <div style={{ fontSize:12, color:'#444' }}>자동차 영업사원을 위한 스마트 CRM</div>
          <div style={{ fontSize:11, color:'#333', marginTop:10 }}>© 2026 SalesPath. All rights reserved.</div>
        </footer>
      </div>
    </>
  )
}
