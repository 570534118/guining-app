import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import logoImg from '/logo.webp'
import loginBg from '/login-bg.webp'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // 注册 auth 用户
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      // 更新 profiles 记录（触发器已自动创建，此处更新用户名）
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        username,
        display_name: displayName,
      })

      if (profileError) {
        setError(profileError.message)
        setLoading(false)
        return
      }

      // 注册成功，跳转登录页
      navigate('/login', { state: { registered: true } })
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
        <div className="text-center mb-8">
          <img src={logoImg} alt="归宁" className="w-16 h-16 rounded-2xl mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white">创建账号</h1>
          <p className="text-white/70 mt-1">加入归宁</p>
        </div>

        {error && (
          <div className="bg-red-500/30 text-white text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-btn bg-transparent border border-white/40 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all text-white placeholder-white/50"
              placeholder="用户名"
              required
            />
          </div>
          <div>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 rounded-btn bg-transparent border border-white/40 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all text-white placeholder-white/50"
              placeholder="显示名称"
              required
            />
          </div>
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
              placeholder="密码 (至少6位)"
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-btn bg-white/20 border border-white/30 text-white font-medium hover:bg-white/30 transition-all text-base disabled:opacity-40"
          >
            {loading ? '注册中...' : '注 册'}
          </button>
        </form>

        <p className="text-center text-sm text-white/60 mt-6">
          已有账号？
          <Link to="/login" className="text-white hover:text-white/80 ml-1 font-medium underline">
            立即登录
          </Link>
        </p>
      </div>
    </div>
  )
}
