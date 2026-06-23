import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Send, ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import type { Profile, Message } from '../types'

export default function ChatPage() {
  const { friendId } = useParams<{ friendId: string }>()
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [newMessage, setNewMessage] = useState('')
  const [activeChat, setActiveChat] = useState<string | null>(friendId || null)

  // 获取聊天列表（所有有过对话的好友）
  const { data: chatList } = useQuery({
    queryKey: ['chat-list', user?.id],
    queryFn: async () => {
      // 获取所有与当前用户相关的消息，按发送者/接收者分组
      const { data: sent } = await supabase
        .from('messages')
        .select('receiver_id, receiver:profiles!messages_receiver_id_fkey(*)')
        .eq('sender_id', user!.id)
        .order('created_at', { ascending: false })

      const { data: received } = await supabase
        .from('messages')
        .select('sender_id, sender:profiles!messages_sender_id_fkey(*)')
        .eq('receiver_id', user!.id)
        .order('created_at', { ascending: false })

      // 合并去重
      const chatMap = new Map<string, Profile & { lastMessage?: string }>()
      ;[...(sent || []), ...(received || [])].forEach((m: any) => {
        const friend = m.receiver || m.sender
        const friendId = m.receiver_id || m.sender_id
        if (!chatMap.has(friendId) && friend) {
          chatMap.set(friendId, friend)
        }
      })
      return Array.from(chatMap.entries()).map(([id, profile]) => ({ id, ...profile }))
    },
  })

  // 获取当前聊天消息
  const { data: messages } = useQuery({
    queryKey: ['messages', user?.id, activeChat],
    queryFn: async () => {
      if (!activeChat) return []
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${user!.id},receiver_id.eq.${activeChat}),and(sender_id.eq.${activeChat},receiver_id.eq.${user!.id})`
        )
        .order('created_at', { ascending: true })
      return (data || []) as Message[]
    },
    enabled: !!activeChat,
  })

  // 获取当前聊天对象信息
  const { data: chatFriend } = useQuery({
    queryKey: ['profile', activeChat],
    queryFn: async () => {
      if (!activeChat) return null
      const { data } = await supabase.from('profiles').select('*').eq('id', activeChat).single()
      return data as Profile
    },
    enabled: !!activeChat,
  })

  // 实时订阅新消息
  useEffect(() => {
    if (!activeChat || !user) return

    const channel = supabase
      .channel(`messages-${activeChat}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['messages'] })
          queryClient.invalidateQueries({ queryKey: ['chat-list'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [activeChat, user])

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 发送消息
  const sendMessage = useMutation({
    mutationFn: async () => {
      if (!newMessage.trim() || !activeChat) return
      await supabase.from('messages').insert({
        sender_id: user!.id,
        receiver_id: activeChat,
        content: newMessage.trim(),
      })
    },
    onSuccess: () => {
      setNewMessage('')
      queryClient.invalidateQueries({ queryKey: ['messages'] })
      queryClient.invalidateQueries({ queryKey: ['chat-list'] })
    },
  })

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage.mutate()
  }

  // 如果没有选中聊天对象，显示聊天列表
  if (!activeChat) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-500 mb-6">私信</h1>
        {chatList && chatList.length > 0 ? (
          <div className="space-y-2">
            {chatList.map((chat: any) => (
              <button
                key={chat.id}
                onClick={() => {
                  setActiveChat(chat.id)
                  navigate(`/chat/${chat.id}`)
                }}
                className="card p-3 flex items-center gap-3 w-full text-left hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-medium">
                  {chat.display_name?.charAt(0) || chat.username?.charAt(0)}
                </div>
                <div>
                  <div className="font-medium text-gray-500 text-sm">
                    {chat.display_name || chat.username}
                  </div>
                  <div className="text-xs text-gray-500/50">@{chat.username}</div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500/50 py-12">
            暂无聊天记录
            <br />
            <span className="text-sm">去好友列表找人聊天吧！</span>
          </div>
        )}
      </div>
    )
  }

  // 聊天窗口
  return (
    <div className="h-full flex flex-col">
      {/* 聊天头部 */}
      <div className="bg-transparent border-b border-white/20 px-4 py-3 flex items-center gap-3">
        <button onClick={() => { setActiveChat(null); navigate('/chat') }} className="text-gray-500/50 hover:text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <div className="w-9 h-9 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-medium text-sm">
          {chatFriend?.display_name?.charAt(0) || chatFriend?.username?.charAt(0)}
        </div>
        <div>
          <div className="font-medium text-gray-500 text-sm">
            {chatFriend?.display_name || chatFriend?.username}
          </div>
        </div>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-auto p-4 space-y-3 bg-gray-50">
        {messages?.map((msg) => {
          const isMine = msg.sender_id === user!.id
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${
                  isMine
                    ? 'bg-primary-500 text-gray-500 rounded-br-md'
                    : 'bg-transparent text-gray-500 rounded-bl-md shadow-sm border border-white/20'
                }`}
              >
                <p>{msg.content}</p>
                <p className={`text-xs mt-1 ${isMine ? 'text-gray-500/70' : 'text-gray-500/50'}`}>
                  {new Date(msg.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入框 */}
      <form onSubmit={handleSend} className="bg-transparent border-t border-white/20 px-4 py-3 flex gap-3 items-center">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="输入消息..."
          className="flex-1 bg-white/30 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="bg-primary-500 text-gray-500 rounded-full w-9 h-9 flex items-center justify-center hover:bg-primary-600 disabled:opacity-50 transition-colors"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  )
}
