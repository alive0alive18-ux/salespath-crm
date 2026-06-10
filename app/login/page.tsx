'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const NAVY = '#1B2A4A'
const GOLD = '#C9A84C'

const BRANDS = [
  '현대', '기아', '제네시스', '쌍용(KG모빌리티)', '르노코리아', 'GM 한국사업장',
  '메르세데스-벤츠', 'BMW', '아우디', '폭스바겐', '포르쉐', '볼보',
  '랜드로버', 'Jeep', '푸조', '시트로엥', '미니(MINI)', '렉서스',
  '도요타', '혼다', '닛산', '인피니티', '캐딜락', '링컨', '포드', '테슬라', '기타'
]

export default function LoginPage() {
  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [brand, setBrand] = useState('')
  const [dealerName, setDealerName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async () => {
    if (!email || !password) { setError('이메일과 비밀번호를 입력해주세요'); return }
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('이메일 또는 비밀번호가 틀렸어요')
    else router.push('/dashboard')
    setLoading(false)
  }

  const handleSignUp = async () => {
    if (!email || !password) { setError('이메일과 비밀번호를 입력해주세요'); return }
    if (!name) { setError('이름을 입력해주세요'); return }
    if (!brand) { setError('브랜드를 선택해주세요'); return }
    if (password.length < 6) { setError('비밀번호는 6자리 이상이어야 해요'); return }
    setLoading(true); setError('')
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    if (data.user) {
      await supabase.from('salespersons').upsert({
        id: data.user.id,
        name,
        phone,
        brand,
        dealer_name: dealerName,
        referral_code: name.replace(/\s/g, '').toUpperCase() + Math.floor(Math.random() * 1000),
      })
      router.push('/dashboard')
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 8, padding: '11px 14px', fontSize: 14, color: '#fff', outline: 'none', boxSizing: 'border-box' as const
  }
  const labelStyle = {
    fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em',
    textTransform: 'uppercase' as const, display: 'block', marginBottom: 6
  }

  return (
    <div style={{ minHeight: '100vh', background: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Apple SD Gothic Neo', system-ui, sans-serif", padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>Sales CRM</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#fff', letterSpacing: '-0.03em' }}>SalesPath</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>
            {tab === 'signup' ? '30일 무료 체험을 시작하세요' : '영업사원 로그인'}
          </div>
        </div>

        {/* 탭 */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: 4, marginBottom: 24 }}>
          <button onClick={() => { setTab('login'); setError('') }}
            style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: tab === 'login' ? '#fff' : 'transparent', color: tab === 'login' ? NAVY : 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: tab === 'login' ? 600 : 400, cursor: 'pointer', transition: 'all .2s' }}>
            로그인
          </button>
          <button onClick={() => { setTab('signup'); setError('') }}
            style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: tab === 'signup' ? GOLD : 'transparent', color: tab === 'signup' ? '#fff' : 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: tab === 'signup' ? 600 : 400, cursor: 'pointer', transition: 'all .2s' }}>
            30일 무료 시작
          </button>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 24, border: '1px solid rgba(255,255,255,0.1)' }}>
          {tab === 'login' ? (
            <>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>이메일</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} placeholder="example@email.com" style={inputStyle} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>비밀번호</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} placeholder="비밀번호" style={inputStyle} />
              </div>
              {error && <div style={{ fontSize: 13, color: '#FF6B6B', marginBottom: 16, padding: '10px 12px', background: 'rgba(255,107,107,0.1)', borderRadius: 7 }}>{error}</div>}
              <button onClick={handleLogin} disabled={loading}
                style={{ width: '100%', background: GOLD, color: '#fff', border: 'none', borderRadius: 9, padding: '13px', fontSize: 15, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                {loading ? '로그인 중...' : '로그인'}
              </button>
            </>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={labelStyle}>이메일 *</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="example@email.com" style={inputStyle} />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={labelStyle}>비밀번호 * (6자리 이상)</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>이름 *</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="홍길동" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>전화번호</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="010-0000-0000" style={inputStyle} />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={labelStyle}>브랜드 *</label>
                  <select value={brand} onChange={e => setBrand(e.target.value)}
                    style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="" style={{ background: NAVY }}>브랜드 선택</option>
                    {BRANDS.map(b => <option key={b} value={b} style={{ background: NAVY }}>{b}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={labelStyle}>전시장명</label>
                  <input type="text" value={dealerName} onChange={e => setDealerName(e.target.value)} placeholder="강남 공식 전시장" style={inputStyle} />
                </div>
              </div>
              {error && <div style={{ fontSize: 13, color: '#FF6B6B', margin: '14px 0', padding: '10px 12px', background: 'rgba(255,107,107,0.1)', borderRadius: 7 }}>{error}</div>}
              <button onClick={handleSignUp} disabled={loading}
                style={{ width: '100%', background: GOLD, color: '#fff', border: 'none', borderRadius: 9, padding: '13px', fontSize: 15, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1, marginTop: 16 }}>
                {loading ? '가입 중...' : '무료 체험 시작하기 →'}
              </button>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 10 }}>
                신용카드 불필요 · 30일 무료 · 언제든 취소 가능
              </div>
            </>
          )}
        </div>
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <a href="/" style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>← SalesPath 소개 보기</a>
        </div>
      </div>
    </div>
  )
}
