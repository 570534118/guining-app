import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Announcement } from '../types'

export default function AnnouncementPage() {
  const { id } = useParams<{ id: string }>()

  const { data: announcement, isLoading } = useQuery({
    queryKey: ['announcement', id],
    queryFn: async () => {
      const { data } = await supabase
        .from('announcements')
        .select('*')
        .eq('id', Number(id))
        .single()
      return data as Announcement | null
    },
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center text-gray-500/50 py-12">
        加载中...
      </div>
    )
  }

  if (!announcement) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center text-gray-400 py-12">
        公告不存在
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Link to="/" className="inline-flex items-center gap-1 text-gray-400 hover:text-gray-600 mb-6 transition-colors">
        <ArrowLeft size={18} /> 返回主页
      </Link>
      <div className="card p-6">
        <h1 className="text-xl font-bold text-gray-800 mb-2">{announcement.title}</h1>
        <p className="text-sm text-gray-400 mb-6">
          {new Date(announcement.created_at).toLocaleDateString('zh-CN')}
          {announcement.updated_at !== announcement.created_at ? ' (已编辑)' : ''}
        </p>
        <div className="text-gray-600 leading-relaxed whitespace-pre-line text-sm">
          {announcement.content}
        </div>
      </div>
    </div>
  )
}
