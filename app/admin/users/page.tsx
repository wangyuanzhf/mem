import { createClient as createServiceClient } from '@supabase/supabase-js'
import Link from 'next/link'
import BanButton from './BanButton'
import UserSearch from './UserSearch'

type SortField = 'username' | 'created_at' | 'posts' | 'notes' | 'mindmaps'
type SortDir = 'asc' | 'desc'

function SortLink({
  label,
  field,
  current,
  dir,
  searchParams,
}: {
  label: string
  field: SortField
  current: SortField
  dir: SortDir
  searchParams: URLSearchParams
}) {
  const isActive = current === field
  const nextDir = isActive && dir === 'asc' ? 'desc' : 'asc'
  const params = new URLSearchParams(searchParams.toString())
  params.set('sort', field)
  params.set('dir', nextDir)
  return (
    <Link href={`/admin/users?${params.toString()}`} className="flex items-center gap-1 hover:text-[#1f2328] group">
      {label}
      <span className="text-[#8d96a0] group-hover:text-[#1f2328]">
        {isActive ? (dir === 'asc' ? '↑' : '↓') : '↕'}
      </span>
    </Link>
  )
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; dir?: string }>
}) {
  const { q = '', sort = 'created_at', dir = 'desc' } = await searchParams
  const sortField = ['username', 'created_at', 'posts', 'notes', 'mindmaps'].includes(sort)
    ? (sort as SortField)
    : 'created_at'
  const sortDir = dir === 'asc' ? 'asc' : 'desc'

  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const [
    { data: profiles },
    { data: postRows },
    { data: noteRows },
    { data: mindmapRows },
  ] = await Promise.all([
    admin.from('profiles').select('id, username, created_at, is_banned'),
    admin.from('posts').select('user_id'),
    admin.from('notes').select('user_id'),
    admin.from('mindmaps').select('user_id'),
  ])

  const countBy = (rows: { user_id: string }[] | null) => {
    const m = new Map<string, number>()
    for (const r of rows ?? []) m.set(r.user_id, (m.get(r.user_id) ?? 0) + 1)
    return m
  }
  const postMap = countBy(postRows)
  const noteMap = countBy(noteRows)
  const mindmapMap = countBy(mindmapRows)

  let users = (profiles ?? []).map((p) => ({
    ...p,
    posts: postMap.get(p.id) ?? 0,
    notes: noteMap.get(p.id) ?? 0,
    mindmaps: mindmapMap.get(p.id) ?? 0,
  }))

  // Filter
  if (q.trim()) {
    users = users.filter((u) => u.username.toLowerCase().includes(q.trim().toLowerCase()))
  }

  // Sort
  users.sort((a, b) => {
    let av: string | number, bv: string | number
    if (sortField === 'username') { av = a.username; bv = b.username }
    else if (sortField === 'posts') { av = a.posts; bv = b.posts }
    else if (sortField === 'notes') { av = a.notes; bv = b.notes }
    else if (sortField === 'mindmaps') { av = a.mindmaps; bv = b.mindmaps }
    else { av = a.created_at; bv = b.created_at }
    if (av < bv) return sortDir === 'asc' ? -1 : 1
    if (av > bv) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  const sp = new URLSearchParams({ q, sort: sortField, dir: sortDir })

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-[#1f2328]">用户管理 <span className="text-sm font-normal text-[#57606a]">({users.length})</span></h1>
        <UserSearch defaultValue={q} />
      </div>
      <div className="bg-white border border-[#d0d7de] rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#f6f8fa] border-b border-[#d0d7de]">
            <tr>
              <th className="text-left px-4 py-2 text-xs font-semibold text-[#57606a]">
                <SortLink label="用户名" field="username" current={sortField} dir={sortDir} searchParams={sp} />
              </th>
              <th className="text-left px-4 py-2 text-xs font-semibold text-[#57606a]">
                <SortLink label="注册时间" field="created_at" current={sortField} dir={sortDir} searchParams={sp} />
              </th>
              <th className="text-left px-4 py-2 text-xs font-semibold text-[#57606a]">
                <SortLink label="文章" field="posts" current={sortField} dir={sortDir} searchParams={sp} />
              </th>
              <th className="text-left px-4 py-2 text-xs font-semibold text-[#57606a]">
                <SortLink label="随笔" field="notes" current={sortField} dir={sortDir} searchParams={sp} />
              </th>
              <th className="text-left px-4 py-2 text-xs font-semibold text-[#57606a]">
                <SortLink label="导图" field="mindmaps" current={sortField} dir={sortDir} searchParams={sp} />
              </th>
              <th className="text-left px-4 py-2 text-xs font-semibold text-[#57606a]">状态</th>
              <th className="text-left px-4 py-2 text-xs font-semibold text-[#57606a]">操作</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-[#57606a]">没有找到用户</td></tr>
            ) : users.map((user) => (
              <tr key={user.id} className="border-b border-[#d0d7de] last:border-0 hover:bg-[#f6f8fa]">
                <td className="px-4 py-3">
                  <Link href={`/admin/users/${user.id}`} className="text-[#0969da] hover:underline font-medium">
                    @{user.username}
                  </Link>
                </td>
                <td className="px-4 py-3 text-[#57606a]">
                  {new Date(user.created_at).toLocaleDateString('zh-CN')}
                </td>
                <td className="px-4 py-3 text-[#57606a]">{user.posts}</td>
                <td className="px-4 py-3 text-[#57606a]">{user.notes}</td>
                <td className="px-4 py-3 text-[#57606a]">{user.mindmaps}</td>
                <td className="px-4 py-3">
                  {user.is_banned ? (
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-[#fff0ee] text-[#cf222e] border border-[#ffcecb]">已禁言</span>
                  ) : (
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-[#dafbe1] text-[#1a7f37] border border-[#aceebb]">正常</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <BanButton userId={user.id} isBanned={user.is_banned} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
