'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const NAVY = '#1B2A4A'
const GOLD = '#C9A84C'
const CREAM = '#F8F5F0'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async () => {
    if (!email || !password) { setError('이메일과 비밀번호를 입력해주세요'); return }
    setLoading(true)
    setError('')
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else router.push('/dashboard')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError('이메일 또는 비밀번호가 틀렸어요')
      else router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Apple SD Gothic Neo', system-ui, sans-serif", padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* 로고 */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>Sales CRM</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#fff', letterSpacing: '-0.03em' }}>SalesPath</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>
            {isSignUp ? '30일 무료 체험을 시작하세요' : '영업사원 로그인'}
          </div>
        </div>

        {/* 탭 선택 */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: 4, marginBottom: 24 }}>
          <button
            onClick={() => { setIsSignUp(false); setError('') }}
            style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: !isSignUp ? '#fff' : 'transparent', color: !isSignUp ? NAVY : 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: !isSignUp ? 600 : 400, cursor: 'pointer', transition: 'all .2s' }}
          >
            로그인
          </button>
          <button
            onClick={() => { setIsSignUp(true); setError('') }}
            style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: isSignUp ? GOLD : 'transparent', color: isSignUp ? '#fff' : 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: isSignUp ? 600 : 400, cursor: 'pointer', transition: 'all .2s' }}
          >
            30일 무료 시작
          </button>
        </div>

        {/* 입력 폼 */}
        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 24, border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>이메일</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="example@email.com"
              style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '11px 14px', fontSize: 14, color: '#fff', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="6자리 이상"
              style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '11px 14px', fontSize: 14, color: '#fff', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {error && (
            <div style={{ fontSize: 13, color: '#FF6B6B', marginBottom: 16, padding: '10px 12px', background: 'rgba(255,107,107,0.1)', borderRadius: 7 }}>
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ width: '100%', background: GOLD, color: '#fff', border: 'none', borderRadius: 9, padding: '13px', fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'all .2s' }}
          >
            {loading ? '처리중...' : isSignUp ? '무료 체험 시작하기 →' : '로그인'}
          </button>

          {isSignUp && (
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 12 }}>
              신용카드 불필요 · 30일 무료 · 언제든 취소 가능
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <a href="/" style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>← SalesPath 소개 보기</a>
        </div>
      </div>
    </div>
  )
}
