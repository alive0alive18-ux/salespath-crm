'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const NAVY  = '#1B2A4A'
const CREAM = '#F8F5F0'
const WHITE = '#FFFFFF'
const GOLD  = '#C9A84C'
const BORDER = '#E8E0D5'
const TX1   = '#1A1A1A'
const TX3   = '#AAAAAA'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setError('이메일을 확인해주세요!')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError('이메일 또는 비밀번호가 틀렸어요')
      else router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight:'100vh', background:NAVY, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'DM Sans','Apple SD Gothic Neo',system-ui,sans-serif" }}>
      <div style={{ width:400 }}>

        {/* 로고 */}
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ fontSize:10, color:'#6A7E9E', letterSpacing:'.22em', textTransform:'uppercase', marginBottom:8 }}>Sales CRM</div>
          <div style={{ fontSize:32, fontWeight:600, color:WHITE, letterSpacing:'.02em' }}>SalesPath</div>
          <div style={{ fontSize:14, color:'#6A7E9E', marginTop:8 }}>{isSignUp ? '새 계정 만들기' : '영업사원 로그인'}</div>
        </div>

        {/* 폼 */}
        <div style={{ background:WHITE, borderRadius:6, padding:'36px 32px' }}>
          <div style={{ marginBottom:18 }}>
            <label style={{ fontSize:11, color:TX3, letterSpacing:'.07em', textTransform:'uppercase', marginBottom:6, display:'block', fontWeight:500 }}>이메일</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="example@email.com"
              style={{ background:CREAM, border:`1px solid ${BORDER}`, borderRadius:3, padding:'11px 14px', fontSize:14, color:TX1, outline:'none', width:'100%', boxSizing:'border-box' as const, fontFamily:'inherit' }}
            />
          </div>

          <div style={{ marginBottom:24 }}>
            <label style={{ fontSize:11, color:TX3, letterSpacing:'.07em', textTransform:'uppercase', marginBottom:6, display:'block', fontWeight:500 }}>비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{ background:CREAM, border:`1px solid ${BORDER}`, borderRadius:3, padding:'11px 14px', fontSize:14, color:TX1, outline:'none', width:'100%', boxSizing:'border-box' as const, fontFamily:'inherit' }}
            />
          </div>

          {error && (
            <div style={{ fontSize:13, color: error.includes('확인') ? '#2D6A4F' : '#DC2626', marginBottom:18, padding:'10px 14px', background: error.includes('확인') ? '#F0FAF4' : '#FEF2F2', borderRadius:3, border:`1px solid ${error.includes('확인') ? '#BBF7D0' : '#FECACA'}` }}>
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ width:'100%', background:NAVY, color:WHITE, border:'none', borderRadius:3, padding:'13px', fontSize:14, fontWeight:600, cursor:'pointer', letterSpacing:'.04em', marginBottom:16 }}
          >
            {loading ? '처리중...' : isSignUp ? '회원가입' : '로그인'}
          </button>

          <div style={{ textAlign:'center', fontSize:13, color:TX3, cursor:'pointer' }} onClick={() => { setIsSignUp(v => !v); setError('') }}>
            {isSignUp ? '이미 계정이 있어요 → 로그인' : '계정이 없어요 → 30일 무료 체험 시작'}
          </div>
        </div>

        <div style={{ textAlign:'center', marginTop:24, fontSize:12, color:'#4A6080' }}>
          신용카드 불필요 · 30일 무료 · 언제든 취소 가능
        </div>

        {/* 랜딩으로 돌아가기 */}
        <div style={{ textAlign:'center', marginTop:16 }}>
          <span style={{ fontSize:12, color:'#6A7E9E', cursor:'pointer' }} onClick={() => router.push('/')}>
            ← SalesPath 소개 보기
          </span>
        </div>
      </div>
    </div>
  )
}
