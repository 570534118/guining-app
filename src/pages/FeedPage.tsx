import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Image, Send, MessageCircle, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import type { Post, Comment } from '../types'

export default function FeedPage() {
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()
  const [content, setContent] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({})
  const [showComments, setShowComments] = useState<Record<number, boolean>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*, author:profiles(*)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as (Post & { author: any })[]
    },
  })

  const createPost = useMutation({
    mutationFn: async () => {
      let imageUrl: string | null = null

      if (selectedImage) {
        const ext = selectedImage.name.split('.').pop() || 'jpg'
        const safeName = Date.now() + '.' + ext
        const fileName = `${user!.id}/${safeName}`
        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(fileName, selectedImage)
        if (uploadError) {
          throw new Error(uploadError.message)
        }
        const { data: urlData } = supabase.storage.from('post-images').getPublicUrl(fileName)
        imageUrl = urlData.publicUrl
      }

      const { error } = await supabase.from('posts').insert({
        user_id: user!.id,
        content,
        image_url: imageUrl,
      })
      if (error) throw error
    },
    onSuccess: () => {
      setContent('')
      setSelectedImage(null)
      setPreviewUrl(null)
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
    onError: (error: Error) => {
      alert('发布失败: ' + JSON.stringify(error.message || error))
    },
  })

  const addComment = useMutation({
    mutationFn: async ({ postId, comment }: { postId: number; comment: string }) => {
      const { error } = await supabase.from('comments').insert({
        post_id: postId,
        user_id: user!.id,
        content: comment,
      })
      if (error) throw error
    },
    onSuccess: (_, variables) => {
      setCommentInputs((prev) => ({ ...prev, [variables.postId]: '' }))
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })

  const deletePost = useMutation({
    mutationFn: async (postId: number) => {
      await supabase.from('posts').delete().eq('id', postId)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
  })

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() && !selectedImage) return
    createPost.mutate()
  }

  const toggleComments = (postId: number) => {
    setShowComments((prev) => ({ ...prev, [postId]: !prev[postId] }))
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-500 mb-6">公共动态</h1>

      <div className="card p-4 mb-6">
        <form onSubmit={handleSubmit}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="分享你的想法..."
            className="w-full border-0 resize-none focus:outline-none text-gray-500/80 min-h-[80px]"
            rows={3}
          />
          {previewUrl && (
            <div className="relative inline-block mb-3">
              <img src={previewUrl} alt="预览" className="max-h-48 rounded-lg" />
              <button
                type="button"
                onClick={() => { setSelectedImage(null); setPreviewUrl(null) }}
                className="absolute top-1 right-1 bg-red-500 text-gray-500 rounded-full w-6 h-6 flex items-center justify-center text-xs"
              >
                ×
              </button>
            </div>
          )}
          <div className="flex items-center justify-between border-t pt-3 mt-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 text-gray-500/50 hover:text-primary-500 transition-colors text-sm"
            >
              <Image size={18} /> 图片
            </button>
            <button
              type="submit"
              disabled={(!content.trim() && !selectedImage) || createPost.isPending}
              className="btn-primary flex items-center gap-1 text-sm"
            >
              <Send size={16} /> 发布
            </button>
          </div>
        </form>
      </div>

      {isLoading ? (
        <div className="text-center text-gray-500/50 py-12">加载中...</div>
      ) : posts?.length === 0 ? (
        <div className="text-center text-gray-500/50 py-12">还没有动态，快来发布第一条吧！</div>
      ) : (
        <div className="space-y-4">
          {posts?.map((post) => (
            <div key={post.id} className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-medium">
                    {post.author?.display_name?.charAt(0) || post.author?.username?.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-500 text-sm">
                      {post.author?.display_name || post.author?.username}
                    </div>
                    <div className="text-xs text-gray-500/50">
                      {new Date(post.created_at).toLocaleDateString('zh-CN')}
                    </div>
                  </div>
                </div>
                {user?.id === post.user_id && (
                  <button
                    onClick={() => deletePost.mutate(post.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded" title="删除动态"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <p className="text-gray-500/80 mb-3 whitespace-pre-wrap">{post.content}</p>
              {post.image_url && (
                <img src={post.image_url} alt="" className="max-w-full rounded-lg mb-3 max-h-96 object-cover" />
              )}
              <div className="flex items-center gap-4 border-t pt-3">
                <button
                  onClick={() => toggleComments(post.id)}
                  className="flex items-center gap-1 text-gray-500/50 hover:text-primary-500 transition-colors text-sm"
                >
                  <MessageCircle size={16} /> 评论
                </button>
              </div>

              {showComments[post.id] && (
                <div className="mt-3 pt-3 border-t border-gray-50">
                  <CommentSection
                    postId={post.id}
                    commentInputs={commentInputs}
                    setCommentInputs={setCommentInputs}
                    addComment={addComment}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CommentSection({
  postId,
  commentInputs,
  setCommentInputs,
  addComment,
}: {
  postId: number
  commentInputs: Record<number, string>
  setCommentInputs: React.Dispatch<React.SetStateAction<Record<number, string>>>
  addComment: any
}) {
  const user = useAuthStore((s) => s.user)
  const { data: comments } = useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const { data } = await supabase
        .from('comments')
        .select('*, author:profiles(*)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true })
      return (data || []) as (Comment & { author: any })[]
    },
  })

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault()
    const comment = commentInputs[postId]
    if (!comment?.trim()) return
    addComment.mutate({ postId, comment })
  }

  return (
    <div className="space-y-2">
      {comments?.map((c) => (
        <div key={c.id} className="flex gap-2 py-1">
          <div className="w-7 h-7 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
            {c.author?.display_name?.charAt(0) || c.author?.username?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-medium text-gray-500/70">
              {c.author?.display_name || c.author?.username}
            </span>
            <p className="text-sm text-gray-500/70">{c.content}</p>
            <span className="text-xs text-gray-500/50">
              {new Date(c.created_at).toLocaleDateString('zh-CN')}
            </span>
          </div>
        </div>
      ))}
      <form onSubmit={handleAddComment} className="flex gap-2 mt-2">
        <input
          value={commentInputs[postId] || ''}
          onChange={(e) => setCommentInputs((prev) => ({ ...prev, [postId]: e.target.value }))}
          placeholder="写评论..."
          className="flex-1 text-sm border border-gray-200 rounded-full px-3 py-1.5 focus:outline-none focus:border-primary-300"
        />
        <button type="submit" className="text-primary-500 hover:text-primary-600">
          <Send size={16} />
        </button>
      </form>
    </div>
  )
}
