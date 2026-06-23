import { NavLink, useNavigate } from 'react-router-dom'
import { Home, Newspaper, Users, MessageCircle, User, Shield, LogOut, Bell, Phone } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import logoImg from '/logo.png'
import { useUIStore } from '../../store/uiStore'

const navItems = [
  { to: '/', icon: Home, label: '公司主页' },
  { to: '/feed', icon: Newspaper, label: '公共动态' },
  { to: '/friends', icon: Users, label: '好友' },
  { to: '/chat', icon: MessageCircle, label: '私信' },
  { to: '/profile/me', icon: User, label: '个人主页' },
  { to: '/contact', icon: Phone, label: '请联系我' },
]

export default function TopNav() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const unreadMessages = useUIStore((s) => s.unreadMessages)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-1.5 px-3 py-2 rounded-btn text-sm transition-all duration-200 ${
      isActive
        ? 'bg-primary-500 text-white'
        : 'text-gray-500 hover:text-gray-700 hover:bg-white/10'
    }`

  return (
    <header className="h-14 bg-transparent border-b border-white/20 flex items-center px-4 flex-shrink-0">
      {/* Logo */}
      <NavLink to="/" className="flex items-center gap-2 mr-8 flex-shrink-0">
        <img src={logoImg} alt="归宁" className="w-8 h-8 rounded-lg" />
        <span className="font-semibold text-gray-500 text-base">归宁</span>
      </NavLink>

      {/* 导航菜单 */}
      <nav className="flex items-center gap-1 flex-1">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'} className={linkClass}>
            <div className="relative">
              <item.icon size={18} />
              {item.label === '私信' && unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadMessages > 9 ? '9+' : unreadMessages}
                </span>
              )}
            </div>
            <span>{item.label}</span>
          </NavLink>
        ))}
        {user?.is_admin && (
          <NavLink to="/admin" className={linkClass}>
            <Shield size={18} />
            <span>管理后台</span>
          </NavLink>
        )}
      </nav>

      {/* 右侧用户区 */}
      <div className="flex items-center gap-3 ml-auto flex-shrink-0">
        <button className="relative text-gray-500 hover:text-gray-700 transition-colors">
          <Bell size={18} />
        </button>
        <div className="flex items-center gap-2 pl-3 border-l border-white/20">
          <div className="w-7 h-7 bg-gray-400/30 text-gray-400 rounded-full flex items-center justify-center text-xs font-medium">
            {user?.display_name?.charAt(0) || user?.username?.charAt(0) || '?'}
          </div>
          <span className="text-sm text-gray-500">{user?.display_name || user?.username}</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-gray-400 hover:text-red-400 transition-colors ml-1"
          title="退出登录"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  )
}
