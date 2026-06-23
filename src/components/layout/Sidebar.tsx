import { NavLink, useNavigate } from 'react-router-dom'
import {
  Home,
  Newspaper,
  Users,
  MessageCircle,
  User,
  Shield,
  LogOut,
  Bell,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useUIStore } from '../../store/uiStore'

const navItems = [
  { to: '/', icon: Home, label: '公司主页' },
  { to: '/feed', icon: Newspaper, label: '公共动态' },
  { to: '/friends', icon: Users, label: '好友' },
  { to: '/chat', icon: MessageCircle, label: '私信' },
  { to: '/profile/me', icon: User, label: '个人主页' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const unreadMessages = useUIStore((s) => s.unreadMessages)
  const unreadNotifications = useUIStore((s) => s.unreadNotifications)
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-btn transition-all duration-200 ${
      isActive
        ? 'bg-primary-500 text-white shadow-sm'
        : 'text-gray-500 hover:bg-white/10 hover:text-gray-300'
    } ${collapsed ? 'justify-center px-2' : ''}`

  return (
    <aside
      className={`bg-transparent border-r border-white/20 flex flex-col h-full transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-white/20 px-4">
        {collapsed ? (
          <img src={import.meta.env.BASE_URL + 'logo.png'} alt="归宁" className="w-8 h-8 rounded-lg" />
        ) : (
          <div className="flex items-center gap-2">
            <img src={import.meta.env.BASE_URL + 'logo.png'} alt="归宁" className="w-8 h-8 rounded-lg" />
            <span className="font-semibold text-gray-400 text-base">归宁</span>
          </div>
        )}
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'} className={linkClass}>
            <div className="relative">
              <item.icon size={20} />
              {item.label === '私信' && unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadMessages > 9 ? '9+' : unreadMessages}
                </span>
              )}
            </div>
            {!collapsed && <span className="text-sm">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* 管理员入口 */}
      {user?.is_admin && (
        <div className="px-2 pb-2">
          <NavLink to="/admin" className={linkClass}>
            <Shield size={20} />
            {!collapsed && <span className="text-sm">管理后台</span>}
          </NavLink>
        </div>
      )}

      {/* 底部信息 */}
      <div className="border-t border-white/20 p-3">
        {!collapsed && (
          <div className="flex items-center gap-2 mb-2 px-2">
            <div className="w-8 h-8 bg-gray-400/30 text-gray-400 rounded-full flex items-center justify-center text-sm font-medium">
              {user?.display_name?.charAt(0) || user?.username?.charAt(0) || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-500 truncate">
                {user?.display_name || user?.username}
              </div>
            </div>
            <button
              onClick={() => {}}
              className="relative text-gray-500 hover:text-gray-300 transition-colors"
            >
              <Bell size={18} />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </button>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 text-gray-500 hover:text-red-400 transition-colors text-sm py-2 ${
            collapsed ? 'justify-center w-full' : 'px-2 w-full'
          }`}
        >
          <LogOut size={18} />
          {!collapsed && '退出登录'}
        </button>
      </div>
    </aside>
  )
}
