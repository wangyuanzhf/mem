import { createClient as createServiceClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import BanButton from '../BanButton'

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const [
    { data: profile },
    { data: posts },
    { data: notes },
    { data: mindmaps },
  ] = await Promise.all([
    admin.from('profiles').select('id, username, created_at, is_banned, bio').eq('id', id).single(),
    admin.from('posts').select('id, title, published, is_public, created_at').eq('user_id', id).order('created_at', { ascending: false }),
    admin.from('notes').select('id, content, is_public, created_at').eq('user_id', id).order('created_at', { ascending: false }),
    admin.from('mindmaps').select('id, title, is_public, created_at').eq('user_id', id).order('created_at', { ascending: false }),
  ])

  if (!profile) notFound()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-[#1f2328]">@{profile.username}</h1>
            {profile.is_banned && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-[#fff0ee] text-[#cf222e] border border-[#ffcecb]">已禁言</span>
            )}
          </div>
          <p className="text-sm text-[#57606a] mt-1">
            注册于 {new Date(profile.created_at).toLocaleDateString('zh-CN')}
            {profile.bio && ` · ${profile.bio}`}
          </p>
        </div>
        <BanButton userId={profile.id} isBanned={profile.is_banned} />
      </div>

      {/* 文章 */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-[#57606a] mb-2">文章（{posts?.length ?? 0}）</h2>
        <div className="bg-white border border-[#d0d7de] rounded-md overflow-hidden">
          {!posts?.length ? (
            <div className="p-6 text-center text-sm text-[#57606a]">暂无文章</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-[#f6f8fa] border-b border-[#d0d7de]">
                <tr>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-[#57606a]">标题</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-[#57606a]">状态</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-[#57606a]">可见性</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-[#57606a]">创建时间</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={p.id} className="border-b border-[#d0d7de] last:border-0 hover:bg-[#f6f8fa]">
                    <td className="px-4 py-2.5">
                      <Link href={`/blog/${p.id}`} className="text-[#0969da] hover:underline">{p.title}</Link>
                    </td>
                    <td className="px-4 py-2.5 text-[#57606a]">{p.published ? '已发布' : '草稿'}</td>
                    <td className="px-4 py-2.5 text-[#57606a]">{p.is_public ? '公开' : '私密'}</td>
                    <td className="px-4 py-2.5 text-[#57606a]">{new Date(p.created_at).toLocaleDateString('zh-CN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* 随笔 */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-[#57606a] mb-2">随笔（{notes?.length ?? 0}）</h2>
        <div className="bg-white border border-[#d0d7de] rounded-md overflow-hidden">
          {!notes?.length ? (
            <div className="p-6 text-center text-sm text-[#57606a]">暂无随笔</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-[#f6f8fa] border-b border-[#d0d7de]">
                <tr>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-[#57606a]">内容</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-[#57606a]">可见性</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-[#57606a]">创建时间</th>
                </tr>
              </thead>
              <tbody>
                {notes.map((n) => (
                  <tr key={n.id} className="border-b border-[#d0d7de] last:border-0 hover:bg-[#f6f8fa]">
                    <td className="px-4 py-2.5 text-[#1f2328] max-w-md">
                      <p className="line-clamp-2 whitespace-pre-wrap">{n.content}</p>
                    </td>
                    <td className="px-4 py-2.5 text-[#57606a]">{n.is_public ? '公开' : '私密'}</td>
                    <td className="px-4 py-2.5 text-[#57606a]">{new Date(n.created_at).toLocaleDateString('zh-CN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* 思维导图 */}
      <section>
        <h2 className="text-sm font-semibold text-[#57606a] mb-2">思维导图（{mindmaps?.length ?? 0}）</h2>
        <div className="bg-white border border-[#d0d7de] rounded-md overflow-hidden">
          {!mindmaps?.length ? (
            <div className="p-6 text-center text-sm text-[#57606a]">暂无思维导图</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-[#f6f8fa] border-b border-[#d0d7de]">
                <tr>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-[#57606a]">标题</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-[#57606a]">可见性</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-[#57606a]">创建时间</th>
                </tr>
              </thead>
              <tbody>
                {mindmaps.map((m) => (
                  <tr key={m.id} className="border-b border-[#d0d7de] last:border-0 hover:bg-[#f6f8fa]">
                    <td className="px-4 py-2.5">
                      <Link href={`/mindmap/${m.id}`} className="text-[#0969da] hover:underline">{m.title}</Link>
                    </td>
                    <td className="px-4 py-2.5 text-[#57606a]">{m.is_public ? '公开' : '私密'}</td>
                    <td className="px-4 py-2.5 text-[#57606a]">{new Date(m.created_at).toLocaleDateString('zh-CN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  )
}
