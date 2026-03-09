import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function BlogPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, published, created_at, updated_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-[#1f2328]">我的博客</h1>
        <Link
          href="/blog/new"
          className="px-3 py-1.5 text-sm bg-[#1f2328] text-white rounded-md hover:bg-[#2d3139] transition-colors"
        >
          + 新建文章
        </Link>
      </div>

      {!posts || posts.length === 0 ? (
        <div className="bg-white border border-[#d0d7de] rounded-md p-12 text-center">
          <p className="text-[#57606a] text-sm mb-4">还没有文章，写下你的第一篇吧</p>
          <Link
            href="/blog/new"
            className="px-4 py-2 text-sm bg-[#0969da] text-white rounded-md hover:bg-[#0860c9] transition-colors"
          >
            新建文章
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white border border-[#d0d7de] rounded-md p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`shrink-0 text-xs px-2 py-0.5 rounded-full border ${
                    post.published
                      ? 'bg-[#dafbe1] text-[#1a7f37] border-[#82e19b]'
                      : 'bg-[#f6f8fa] text-[#57606a] border-[#d0d7de]'
                  }`}
                >
                  {post.published ? '已发布' : '草稿'}
                </span>
                <Link
                  href={`/blog/${post.id}`}
                  className="text-sm font-medium text-[#1f2328] hover:text-[#0969da] truncate"
                >
                  {post.title}
                </Link>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-4">
                <span className="text-xs text-[#57606a]">
                  {new Date(post.updated_at).toLocaleDateString('zh-CN')}
                </span>
                <Link
                  href={`/blog/${post.id}/edit`}
                  className="text-xs text-[#0969da] hover:underline"
                >
                  编辑
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
