import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import logoImg from '/logo.png'
import loginBg from '/login-bg.png'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)
  const setSession = useAuthStore((s) => s.setSession)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      setError(loginError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      setSession(data.session)
      // 获取用户资料
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profile) {
        setUser(profile)
        navigate('/')
      }
    }
    setLoading(false)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url(${loginBg}) center/cover no-repeat`
      }}
    >
      <div className="rounded-2xl p-8 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src={logoImg} alt="归宁" className="w-16 h-16 rounded-2xl mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white">归宁</h1>
          <p className="text-white/70 mt-1">登录你的账号</p>
        </div>

        {error && (
          <div className="bg-red-500/30 text-white text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-btn bg-transparent border border-white/40 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all text-white placeholder-white/50"
              placeholder="邮箱"
              required
            />
          </div>
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-btn bg-transparent border border-white/40 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all text-white placeholder-white/50"
              placeholder="密码"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-btn bg-white/20 border border-white/30 text-white font-medium hover:bg-white/30 transition-all text-base disabled:opacity-40"
          >
            {loading ? '登录中...' : '登 录'}
          </button>
        </form>

        <p className="text-center text-sm text-white/60 mt-6">
          还没有账号？
          <Link to="/register" className="text-white hover:text-white/80 ml-1 font-medium underline">
            立即注册
          </Link>
        </p>
      </div>
    </div>
  )
}
