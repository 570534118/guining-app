import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, UserPlus, UserCheck, UserX, Clock, MessageCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import type { Profile, Friendship } from '../types'

export default function FriendsPage() {
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Profile[]>([])
  const [showSearch, setShowSearch] = useState(false)

  // 好友列表
  const { data: friends, isLoading } = useQuery({
    queryKey: ['friends', user?.id],
    queryFn: async () => {
      // 获取已接受的好友关系
      const { data: friendships, error } = await supabase
        .from('friendships')
        .select('*, friend_profile:profiles!friendships_friend_id_fkey(*)')
        .or(`user_id.eq.${user!.id},friend_id.eq.${user!.id}`)
        .eq('status', 'accepted')

      if (error) throw error
      // 处理双向关系
      return (friendships || []).map((f: any) => {
        const isUser = f.user_id === user!.id
        return {
          ...f,
          friend: isUser ? f.friend_profile : f.user_profile,
        }
      })
    },
  })

  // 待处理的好友请求
  const { data: pendingRequests } = useQuery({
    queryKey: ['friend-requests', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('friendships')
        .select('*, user_profile:profiles!friendships_user_id_fkey(*)')
        .eq('friend_id', user!.id)
        .eq('status', 'pending')
      return (data || []) as any[]
    },
  })

  // 搜索用户
  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .ilike('username', `%${searchQuery}%`)
      .neq('id', user!.id)
      .limit(20)
    setSearchResults((data || []) as Profile[])
  }

  // 发送好友请求
  const sendRequest = useMutation({
    mutationFn: async (targetId: string) => {
      await supabase.from('friendships').insert({
        user_id: user!.id,
        friend_id: targetId,
        status: 'pending',
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['friends'] }),
  })

  // 处理好友请求
  const handleRequest = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: 'accepted' | 'rejected' }) => {
      await supabase.from('friendships').update({ status }).eq('id', id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] })
      queryClient.invalidateQueries({ queryKey: ['friends'] })
    },
  })

  // 删除好友
  const removeFriend = useMutation({
    mutationFn: async (friendshipId: number) => {
      await supabase.from('friendships').delete().eq('id', friendshipId)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['friends'] }),
  })

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-500">好友</h1>
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="btn-primary flex items-center gap-1 text-sm"
        >
          <UserPlus size={16} /> 添加好友
        </button>
      </div>

      {/* 搜索面板 */}
      {showSearch && (
        <div className="card p-4 mb-6">
          <div className="flex gap-2">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="搜索用户名..."
              className="input-field flex-1"
            />
            <button onClick={handleSearch} className="btn-primary">
              <Search size={18} />
            </button>
          </div>
          {searchResults.length > 0 && (
            <div className="mt-3 space-y-2">
              {searchResults.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-medium">
                      {p.display_name?.charAt(0) || p.username.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-500 text-sm">{p.display_name || p.username}</div>
                      <div className="text-xs text-gray-500/50">@{p.username}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => sendRequest.mutate(p.id)}
                    className="btn-outline text-sm flex items-center gap-1"
                  >
                    <UserPlus size={14} /> 添加
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 待处理请求 */}
      {pendingRequests && pendingRequests.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-500/50 mb-3 flex items-center gap-1">
            <Clock size={14} /> 待处理的好友请求
          </h2>
          <div className="space-y-2">
            {pendingRequests.map((req: any) => (
              <div key={req.id} className="card p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-medium">
                    {req.user_profile?.display_name?.charAt(0) || req.user_profile?.username?.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-500 text-sm">
                      {req.user_profile?.display_name || req.user_profile?.username}
                    </div>
                    <div className="text-xs text-gray-500/50">请求添加你为好友</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRequest.mutate({ id: req.id, status: 'accepted' })}
                    className="btn-primary text-xs flex items-center gap-1"
                  >
                    <UserCheck size={14} /> 接受
                  </button>
                  <button
                    onClick={() => handleRequest.mutate({ id: req.id, status: 'rejected' })}
                    className="text-xs flex items-center gap-1 text-gray-500/50 hover:text-red-500 px-2 py-1"
                  >
                    <UserX size={14} /> 拒绝
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 好友列表 */}
      {isLoading ? (
        <div className="text-center text-gray-500/50 py-12">加载中...</div>
      ) : friends?.length === 0 ? (
        <div className="text-center text-gray-500/50 py-12">还没有好友，快去添加吧！</div>
      ) : (
        <div className="space-y-2">
          {friends?.map((f: any) => (
            <div key={f.id} className="card p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-medium">
                  {f.friend?.display_name?.charAt(0) || f.friend?.username?.charAt(0)}
                </div>
                <div>
                  <div className="font-medium text-gray-500 text-sm">{f.friend?.display_name || f.friend?.username}</div>
                  <div className="text-xs text-gray-500/50">@{f.friend?.username}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/chat/${f.friend?.id}`)}
                  className="btn-primary text-xs flex items-center gap-1"
                >
                  <MessageCircle size={14} /> 发消息
                </button>
                <button
                  onClick={() => removeFriend.mutate(f.id)}
                  className="text-xs text-gray-500/50 hover:text-red-500 px-2 py-1"
                >
                  <UserX size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
