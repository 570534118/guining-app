import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Camera, Edit3, Save, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import type { Profile, Post } from '../types'

export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const currentUser = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [editBio, setEditBio] = useState('')
  const [editDisplayName, setEditDisplayName] = useState('')

  const isMe = userId === 'me' || userId === currentUser?.id
  const targetId = isMe ? currentUser?.id : userId

  // 获取用户资料
  const { data: profile } = useQuery({
    queryKey: ['profile', targetId],
    queryFn: async () => {
      if (!targetId) return null
      const { data } = await supabase.from('profiles').select('*').eq('id', targetId).single()
      return data as Profile
    },
    enabled: !!targetId,
  })

  // 获取用户动态
  const { data: posts } = useQuery({
    queryKey: ['user-posts', targetId],
    queryFn: async () => {
      if (!targetId) return []
      const { data } = await supabase
        .from('posts')
        .select('*, author:profiles(*)')
        .eq('user_id', targetId)
        .order('created_at', { ascending: false })
      return (data || []) as (Post & { author: any })[]
    },
    enabled: !!targetId,
  })

  // 更新资料
  const updateProfile = useMutation({
    mutationFn: async () => {
      if (!targetId) return
      await supabase.from('profiles').update({
        display_name: editDisplayName,
        bio: editBio,
      }).eq('id', targetId)
    },
    onSuccess: () => {
      setEditing(false)
      queryClient.invalidateQueries({ queryKey: ['profile', targetId] })
      if (isMe && profile) {
        setUser({ ...profile, display_name: editDisplayName, bio: editBio })
      }
    },
  })

  const startEdit = () => {
    if (!profile) return
    setEditDisplayName(profile.display_name || '')
    setEditBio(profile.bio || '')
    setEditing(true)
  }

  if (!targetId) {
    return <div className="text-center text-gray-500/50 py-12">用户不存在</div>
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* 个人资料卡片 */}
      <div className="card overflow-hidden mb-6">
        {/* 背景 */}
        <div className="h-32 bg-gradient-blue relative">
          {isMe && (
            <button className="absolute bottom-3 right-3 bg-white/20 hover:bg-white/30 text-gray-500 rounded-full p-1.5 transition-colors">
              <Camera size={16} />
            </button>
          )}
        </div>
        <div className="px-6 pb-6">
          <div className="flex items-end -mt-10 mb-4">
            <div className="w-20 h-20 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-2xl font-bold border-4 border-white">
              {profile?.display_name?.charAt(0) || profile?.username?.charAt(0) || '?'}
            </div>
            {isMe && !editing && (
              <button
                onClick={startEdit}
                className="ml-auto mb-2 btn-outline text-sm flex items-center gap-1"
              >
                <Edit3 size={14} /> 编辑资料
              </button>
            )}
          </div>

          {editing ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500/60">显示名称</label>
                <input
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500/60">个人简介</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="input-field resize-none"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => updateProfile.mutate()}
                  className="btn-primary text-sm flex items-center gap-1"
                >
                  <Save size={14} /> 保存
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="btn-outline text-sm flex items-center gap-1"
                >
                  <X size={14} /> 取消
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-xl font-bold text-gray-500">
                {profile?.display_name || profile?.username}
              </h1>
              <p className="text-sm text-gray-500/50 mt-1">@{profile?.username}</p>
              {profile?.bio && (
                <p className="text-gray-500/70 mt-3">{profile.bio}</p>
              )}
              <div className="text-xs text-gray-500/50 mt-3">
                加入于 {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('zh-CN') : '-'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 用户动态 */}
      <h2 className="text-lg font-semibold text-gray-500 mb-4">发布的动态</h2>
      {posts?.length === 0 ? (
        <div className="text-center text-gray-500/50 py-8">暂无动态</div>
      ) : (
        <div className="space-y-3">
          {posts?.map((post) => (
            <div key={post.id} className="card p-4">
              <p className="text-gray-700 mb-2 whitespace-pre-wrap">{post.content}</p>
              {post.image_url && (
                <img src={post.image_url} alt="" className="max-w-full rounded-lg max-h-64 object-cover" />
              )}
              <p className="text-xs text-gray-500/50 mt-2">
                {new Date(post.created_at).toLocaleDateString('zh-CN')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
