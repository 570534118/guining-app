import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Announcement } from '../types'

export default function HomePage() {
  const { data: announcements } = useQuery({
    queryKey: ['home-announcements'],
    queryFn: async () => {
      const { data } = await supabase
        .from('announcements')
        .select('id, title, created_at')
        .order('created_at', { ascending: false })
        .limit(5)
      return (data || []) as Pick<Announcement, 'id' | 'title' | 'created_at'>[]
    },
  })

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Banner */}
      <div className="bg-gradient-green rounded-2xl p-8 mb-6 text-white">
        <h1 className="text-3xl font-bold mb-2">欢迎来到归宁</h1>
        <p className="text-white/80 text-lg">尊重生命，止于至善</p>
      </div>

      {/* 公司使命 */}
      <div className="card p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-primary-500 rounded-full inline-block"></span>
          公司使命
        </h2>
        <p className="text-gray-600 leading-relaxed">
          生态葬，让生命回归自然。我们以专业规划与施行，守护每一份绿色心愿，让告别更纯净，让思念在青山绿水间永恒留存。
        </p>
      </div>

      {/* 核心价值观 */}
      <div className="card p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-primary-500 rounded-full inline-block"></span>
          核心价值观
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { title: '敬天惜土', desc: '敬畏自然，珍惜土地资源，体现生态责任', bg: 'bg-green-50', border: 'border-l-green-400' },
            { title: '向绿而生', desc: '即便在终点，亦以绿色方式延续生命的意义', bg: 'bg-emerald-50', border: 'border-l-emerald-400' },
            { title: '圆满送行', desc: '以专业规划抚慰人心，让告别仪式完满无憾', bg: 'bg-teal-50', border: 'border-l-teal-400' },
            { title: '永续思念', desc: '让记忆在自然循环中长青，精神长存', bg: 'bg-lime-50', border: 'border-l-lime-400' },
          ].map((v) => (
            <div key={v.title} className={`${v.bg} rounded-lg p-4 border-l-4 ${v.border} hover:shadow-md transition-shadow`}>
              <h3 className="font-semibold text-green-800 mb-1">{v.title}</h3>
              <p className="text-sm text-green-700">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 公告区 */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-primary-500 rounded-full inline-block"></span>
          公司公告
        </h2>
        <div className="space-y-3">
          {announcements && announcements.length > 0 ? (
            announcements.map((a, i) => (
              <Link
                key={a.id}
                to={`/announcement/${a.id}`}
                className={`block border-l-4 pl-4 py-2 hover:bg-gray-50/50 rounded-r-lg transition-colors cursor-pointer ${
                  i === 0 ? 'border-primary-500' : 'border-gray-300'
                }`}
              >
                <h3 className="font-medium text-gray-800">{a.title}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  发布于 {new Date(a.created_at).toLocaleDateString('zh-CN')}
                </p>
              </Link>
            ))
          ) : (
            <p className="text-gray-400 text-sm">暂无公告</p>
          )}
        </div>
      </div>
    </div>
  )
}
