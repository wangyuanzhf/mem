import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import PostCard from './PostCard'

type ContentItem =
  | { kind: 'post'; id: string; title: string; content: string; created_at: string; is_public: boolean }
  | { kind: 'note'; id: string; content: string; created_at: string; is_public: boolean }
  | { kind: 'mindmap'; id: string; title: string; created_at: string; is_public: boolean }

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const supabase = await createClient()

  // 当前登录用户（可能为空）
  const { data: { user: viewer } } = await supabase.auth.getUser()

  // 查主页所属用户
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username')
    .eq('username', username)
    .single()

  if (!profile) notFound()

  const isSelf = viewer?.id === profile.id

  // 并行查三张表
  const [postsRes, notesRes, mindmapsRes] = await Promise.all([
    supabase
      .from('posts')
      .select('id, title, content, created_at, is_public, published')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('notes')
      .select('id, content, created_at, is_public')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('mindmaps')
      .select('id, title, created_at, is_public')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false }),
  ])

  // 合并并过滤：自己看全部，别人只看公开
  const posts = (postsRes.data ?? [])
    .filter((p) => isSelf || p.is_public)
    .map((p) => ({ kind: 'post' as const, ...p }))

  const notes = (notesRes.data ?? [])
    .filter((n) => isSelf || n.is_public)
    .map((n) => ({ kind: 'note' as const, ...n }))

  const mindmaps = (mindmapsRes.data ?? [])
    .filter((m) => isSelf || m.is_public)
    .map((m) => ({ kind: 'mindmap' as const, ...m }))

  // 按时间倒序合并
  const feed: ContentItem[] = [...posts, ...notes, ...mindmaps].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  const totalPublic = posts.filter(p => p.is_public).length
    + notes.filter(n => n.is_public).length
    + mindmaps.filter(m => m.is_public).length

  return (
    <div className="min-h-screen bg-[#f6f8fa]">
      {/* Header */}
      <header className="bg-[#1f2328] border-b border-[#30363d]">
        <div className="max-w-[860px] mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="10" fill="white" fillOpacity="0.12"/>
              <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fill="white" fontFamily="Georgia, serif" fontSize="17" fontWeight="700" letterSpacing="-0.5">mem</text>
            </svg>
            <span className="text-white font-semibold text-sm">mem</span>
          </Link>
          {viewer ? (
            <Link href="/dashboard" className="text-sm text-[#8d96a0] hover:text-white transition-colors">
              我的主页
            </Link>
          ) : (
            <Link href="/login" className="text-sm text-[#8d96a0] hover:text-white transition-colors">
              登录
            </Link>
          )}
        </div>
      </header>

      <div className="max-w-[860px] mx-auto px-4 py-8">
        {/* Profile card */}
        <div className="bg-white border border-[#d0d7de] rounded-md p-6 mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#1f2328] flex items-center justify-center text-white text-xl font-semibold select-none">
              {username[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[#1f2328]">@{username}</h1>
              <p className="text-sm text-[#57606a] mt-0.5">
                {isSelf ? `共 ${feed.length} 条内容，${totalPublic} 条公开` : `${feed.length} 条公开内容`}
              </p>
            </div>
          </div>
          {isSelf && (
            <Link
              href="/dashboard"
              className="shrink-0 px-3 py-1.5 text-sm border border-[#d0d7de] text-[#1f2328] rounded-md hover:bg-[#f6f8fa] transition-colors"
            >
              管理内容
            </Link>
          )}
        </div>

        {/* Feed */}
        {feed.length === 0 ? (
          <div className="bg-white border border-[#d0d7de] rounded-md p-12 text-center">
            <p className="text-sm text-[#57606a]">
              {isSelf ? '还没有任何内容，去创建吧' : '该用户暂无公开内容'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {feed.map((item) => (
              <FeedCard key={`${item.kind}-${item.id}`} item={item} isSelf={isSelf} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function FeedCard({ item, isSelf }: { item: ContentItem; isSelf: boolean }) {
  const time = new Date(item.created_at).toLocaleString('zh-CN', {
    month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  if (item.kind === 'post') {
    return <PostCard item={item} isSelf={isSelf} time={time} />
  }

  if (item.kind === 'note') {
    return (
      <div className="bg-white border border-[#d0d7de] rounded-md p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs px-1.5 py-0.5 rounded bg-[#dafbe1] text-[#1a7f37] border border-[#acd7b4]">随笔</span>
          {!item.is_public && isSelf && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-[#f6f8fa] text-[#57606a] border border-[#d0d7de]">私密</span>
          )}
          <span className="text-xs text-[#57606a] ml-auto">{time}</span>
        </div>
        <p className="text-sm text-[#1f2328] whitespace-pre-wrap leading-relaxed line-clamp-4">
          {item.content}
        </p>
      </div>
    )
  }

  // mindmap
  return (
    <div className="bg-white border border-[#d0d7de] rounded-md p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="shrink-0 text-xs px-1.5 py-0.5 rounded bg-[#fff8c5] text-[#7d4e00] border border-[#e3c26f]">导图</span>
          {!item.is_public && isSelf && (
            <span className="shrink-0 text-xs px-1.5 py-0.5 rounded bg-[#f6f8fa] text-[#57606a] border border-[#d0d7de]">私密</span>
          )}
          <Link
            href={`/mindmap/${item.id}`}
            className="text-sm font-medium text-[#1f2328] hover:text-[#0969da] truncate"
          >
            {item.title}
          </Link>
        </div>
        <span className="shrink-0 text-xs text-[#57606a]">{time}</span>
      </div>
    </div>
  )
}
