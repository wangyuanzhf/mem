import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import BackButton from './BackButton'

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 先查文章（RLS 已允许 is_public=true 的条目被任何人读到）
  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single()

  if (!post) notFound()

  // 私密文章：必须登录且是本人
  if (!post.is_public) {
    if (!user) redirect('/login')
    if (user.id !== post.user_id) notFound()
  }

  const isOwner = user?.id === post.user_id

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        {isOwner ? (
          <Link href="/blog" className="text-sm text-[#57606a] hover:text-[#0969da]">
            ← 我的博客
          </Link>
        ) : (
          <BackButton />
        )}
        <span className="text-[#d0d7de]">/</span>
        <span className="text-sm text-[#1f2328] truncate">{post.title}</span>
      </div>

      <div className="bg-white border border-[#d0d7de] rounded-md">
        <div className="p-6 border-b border-[#d0d7de] flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-[#1f2328]">{post.title}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span
                className={`text-xs px-2 py-0.5 rounded-full border ${
                  post.published
                    ? 'bg-[#dafbe1] text-[#1a7f37] border-[#82e19b]'
                    : 'bg-[#f6f8fa] text-[#57606a] border-[#d0d7de]'
                }`}
              >
                {post.published ? '已发布' : '草稿'}
              </span>
              {!post.is_public && (
                <span className="text-xs px-2 py-0.5 rounded-full border bg-[#f6f8fa] text-[#57606a] border-[#d0d7de]">
                  私密
                </span>
              )}
              <span className="text-xs text-[#57606a]">
                {new Date(post.created_at).toLocaleString('zh-CN')}
              </span>
            </div>
          </div>
          {isOwner && (
            <Link
              href={`/blog/${post.id}/edit`}
              className="shrink-0 px-3 py-1.5 text-sm border border-[#d0d7de] text-[#1f2328] rounded-md hover:bg-[#f6f8fa] transition-colors"
            >
              编辑
            </Link>
          )}
        </div>
        <div
          className="p-6 prose max-w-none text-[#1f2328] prose-headings:text-[#1f2328] prose-a:text-[#0969da] prose-code:text-[#cf222e] prose-code:bg-[#f6f8fa] prose-code:px-1 prose-code:rounded prose-pre:bg-[#1f2328]"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>
    </div>
  )
}
