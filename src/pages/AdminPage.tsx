import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, FileText, MessageSquare, Trash2, Shield, Megaphone, Plus, Edit } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import type { Profile, Post, Comment, Announcement } from '../types'

type Tab = 'users' | 'posts' | 'comments' | 'announcements'

export default function AdminPage() {
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<Tab>('users')

  if (!user?.is_admin) {
    return <div className="text-center text-gray-500/50 py-12">无权访问</div>
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="text-primary-500" size={24} />
        <h1 className="text-2xl font-bold text-gray-500">管理后台</h1>
      </div>

      {/* 标签切换 */}
      <div className="flex gap-2 mb-6 border-b">
        {[
          { key: 'users' as Tab, icon: Users, label: '用户管理' },
          { key: 'posts' as Tab, icon: FileText, label: '动态管理' },
          { key: 'comments' as Tab, icon: MessageSquare, label: '评论管理' },
          { key: 'announcements' as Tab, icon: Megaphone, label: '公告管理' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500/60 hover:text-gray-500/80'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'users' && <UserManagement />}
      {activeTab === 'posts' && <PostManagement />}
      {activeTab === 'comments' && <CommentManagement />}
      {activeTab === 'announcements' && <AnnouncementManagement />}
    </div>
  )
}

function UserManagement() {
  const queryClient = useQueryClient()

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      return (data || []) as Profile[]
    },
  })

  const toggleAdmin = useMutation({
    mutationFn: async ({ id, isAdmin }: { id: string; isAdmin: boolean }) => {
      await supabase.from('profiles').update({ is_admin: !isAdmin }).eq('id', id)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('profiles').delete().eq('id', id)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  if (isLoading) return <div className="text-center py-8 text-gray-500/50">加载中...</div>

  return (
    <div className="card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-white/10">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-gray-500/70">用户</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500/70">用户名</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500/70">加入时间</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500/70">角色</th>
            <th className="text-right px-4 py-3 font-medium text-gray-500/70">操作</th>
          </tr>
        </thead>
        <tbody>
          {users?.map((u) => (
            <tr key={u.id} className="border-t border-white/10 hover:bg-white/10">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium">
                    {u.display_name?.charAt(0) || u.username.charAt(0)}
                  </div>
                  <span className="font-medium">{u.display_name || u.username}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-gray-500/60">@{u.username}</td>
              <td className="px-4 py-3 text-gray-500/60">
                {new Date(u.created_at).toLocaleDateString('zh-CN')}
              </td>
              <td className="px-4 py-3">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  u.is_admin ? 'bg-primary-50 text-primary-600' : 'bg-gray-100 text-gray-500/60'
                }`}>
                  {u.is_admin ? '管理员' : '普通用户'}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => toggleAdmin.mutate({ id: u.id, isAdmin: u.is_admin })}
                  className="text-xs text-primary-500 hover:text-primary-600 mr-3"
                >
                  {u.is_admin ? '取消管理' : '设为管理'}
                </button>
                <button
                  onClick={() => deleteUser.mutate(u.id)}
                  className="text-xs text-red-400 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function PostManagement() {
  const queryClient = useQueryClient()

  const { data: posts, isLoading } = useQuery({
    queryKey: ['admin-posts'],
    queryFn: async () => {
      const { data } = await supabase
        .from('posts')
        .select('*, author:profiles(*)')
        .order('created_at', { ascending: false })
      return (data || []) as (Post & { author: any })[]
    },
  })

  const deletePost = useMutation({
    mutationFn: async (id: number) => {
      await supabase.from('posts').delete().eq('id', id)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-posts'] }),
  })

  if (isLoading) return <div className="text-center py-8 text-gray-500/50">加载中...</div>

  return (
    <div className="space-y-3">
      {posts?.map((post) => (
        <div key={post.id} className="card p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium">
                {post.author?.display_name?.charAt(0) || post.author?.username?.charAt(0)}
              </div>
              <span className="text-sm font-medium">{post.author?.display_name || post.author?.username}</span>
              <span className="text-xs text-gray-500/50">
                {new Date(post.created_at).toLocaleDateString('zh-CN')}
              </span>
            </div>
            <button
              onClick={() => deletePost.mutate(post.id)}
              className="text-gray-300 hover:text-red-500 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
          <p className="text-gray-500/80 text-sm">{post.content}</p>
        </div>
      ))}
      {posts?.length === 0 && (
        <div className="text-center text-gray-500/50 py-8">暂无动态</div>
      )}
    </div>
  )
}

function CommentManagement() {
  const queryClient = useQueryClient()

  const { data: comments, isLoading } = useQuery({
    queryKey: ['admin-comments'],
    queryFn: async () => {
      const { data } = await supabase
        .from('comments')
        .select('*, author:profiles(*)')
        .order('created_at', { ascending: false })
        .limit(50)
      return (data || []) as (Comment & { author: any })[]
    },
  })

  const deleteComment = useMutation({
    mutationFn: async (id: number) => {
      await supabase.from('comments').delete().eq('id', id)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-comments'] }),
  })

  if (isLoading) return <div className="text-center py-8 text-gray-500/50">加载中...</div>

  return (
    <div className="space-y-2">
      {comments?.map((c) => (
        <div key={c.id} className="card p-3 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-gray-500/70">
                {c.author?.display_name || c.author?.username}
              </span>
              <span className="text-xs text-gray-500/50">
                {new Date(c.created_at).toLocaleDateString('zh-CN')}
              </span>
            </div>
            <p className="text-sm text-gray-500/70">{c.content}</p>
          </div>
          <button
            onClick={() => deleteComment.mutate(c.id)}
            className="text-gray-300 hover:text-red-500 flex-shrink-0 ml-2"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      {comments?.length === 0 && (
        <div className="text-center text-gray-500/50 py-8">暂无评论</div>
      )}
    </div>
  )
}

function AnnouncementManagement() {
  const queryClient = useQueryClient()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')

  const { data: announcements, isLoading } = useQuery({
    queryKey: ['admin-announcements'],
    queryFn: async () => {
      const { data } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
      return (data || []) as Announcement[]
    },
  })

  const createMutation = useMutation({
    mutationFn: async (item: { title: string; content: string }) => {
      const { error } = await supabase.from('announcements').insert(item)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] })
      setShowCreate(false)
      setNewTitle('')
      setNewContent('')
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (item: { id: number; title: string; content: string }) => {
      const { error } = await supabase
        .from('announcements')
        .update({ title: item.title, content: item.content, updated_at: new Date().toISOString() })
        .eq('id', item.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] })
      setEditingId(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('announcements').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-announcements'] }),
  })

  if (isLoading) return <div className="text-center py-8 text-gray-500/50">加载中...</div>

  return (
    <div className="space-y-3">
      {!showCreate && (
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-1 text-sm">
          <Plus size={16} /> 新建公告
        </button>
      )}

      {showCreate && (
        <div className="card p-4">
          <input
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:border-primary-300"
            placeholder="公告标题"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <textarea
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 min-h-[120px] focus:outline-none focus:border-primary-300"
            placeholder="公告内容（支持换行）"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              onClick={() => createMutation.mutate({ title: newTitle, content: newContent })}
              disabled={!newTitle.trim() || createMutation.isPending}
              className="btn-primary text-sm"
            >
              {createMutation.isPending ? '发布中...' : '发布'}
            </button>
            <button
              onClick={() => { setShowCreate(false); setNewTitle(''); setNewContent('') }}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {announcements?.map((a) => (
        <div key={a.id} className="card p-4">
          {editingId === a.id ? (
            <>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:border-primary-300"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
              <textarea
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 min-h-[120px] focus:outline-none focus:border-primary-300"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => updateMutation.mutate({ id: a.id, title: editTitle, content: editContent })}
                  disabled={!editTitle.trim() || updateMutation.isPending}
                  className="btn-primary text-sm"
                >
                  {updateMutation.isPending ? '保存中...' : '保存'}
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-800">{a.title}</h3>
                  <p className="text-xs text-gray-500/50 mt-1">
                    {new Date(a.created_at).toLocaleDateString('zh-CN')}
                    {a.updated_at !== a.created_at ? ' (已编辑)' : ''}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0 ml-4">
                  <button
                    onClick={() => { setEditingId(a.id); setEditTitle(a.title); setEditContent(a.content) }}
                    className="text-gray-300 hover:text-primary-500 transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => { if (confirm('确定删除这条公告？')) deleteMutation.mutate(a.id) }}
                    className="text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-500/70 mt-2 line-clamp-3">{a.content}</p>
            </>
          )}
        </div>
      ))}
      {announcements?.length === 0 && !showCreate && (
        <div className="text-center text-gray-500/50 py-8">暂无公告</div>
      )}
    </div>
  )
}
