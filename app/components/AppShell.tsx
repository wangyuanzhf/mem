import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from '@/app/dashboard/LogoutButton'

export default async function AppShell({
  children,
  activeSection,
}: {
  children: React.ReactNode
  activeSection?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 查当前用户的 username
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  const navItems = [
    {
      href: '/dashboard',
      label: '主页',
      key: 'dashboard',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M6.906.664a1.749 1.749 0 0 1 2.187 0l5.25 4.2c.415.332.657.835.657 1.367v7.019A1.75 1.75 0 0 1 13.25 15h-3.5a.75.75 0 0 1-.75-.75V9H7v5.25a.75.75 0 0 1-.75.75h-3.5A1.75 1.75 0 0 1 1 13.25V6.23c0-.531.242-1.034.657-1.366l5.25-4.2Zm1.25 1.171a.25.25 0 0 0-.312 0l-5.25 4.2a.25.25 0 0 0-.094.196v7.019c0 .138.112.25.25.25H5.5V8.25a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 .75.75v5.25h2.75a.25.25 0 0 0 .25-.25V6.23a.25.25 0 0 0-.094-.195Z"/>
        </svg>
      ),
    },
    {
      href: '/blog',
      label: '博客',
      key: 'blog',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M0 3.75A.75.75 0 0 1 .75 3h13.5a.75.75 0 0 1 0 1.5H.75A.75.75 0 0 1 0 3.75Zm0 4A.75.75 0 0 1 .75 7h13.5a.75.75 0 0 1 0 1.5H.75A.75.75 0 0 1 0 7.75Zm0 4A.75.75 0 0 1 .75 11h7.5a.75.75 0 0 1 0 1.5H.75a.75.75 0 0 1-.75-.75Z"/>
        </svg>
      ),
    },
    {
      href: '/notes',
      label: '随笔',
      key: 'notes',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61Zm.176 4.823L9.75 4.81l-6.286 6.287a.253.253 0 0 0-.064.108l-.558 1.953 1.953-.558a.253.253 0 0 0 .108-.064Zm1.238-3.763a.25.25 0 0 0-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 0 0 0-.354Z"/>
        </svg>
      ),
    },
    {
      href: '/mindmap',
      label: '思维导图',
      key: 'mindmap',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M1.5 2.75a1.25 1.25 0 1 1 2.5 0 1.25 1.25 0 0 1-2.5 0ZM2.75 0a2.75 2.75 0 1 0 0 5.5A2.75 2.75 0 0 0 2.75 0ZM13.5 2.75a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0ZM12.25 0a2.75 2.75 0 1 0 0 5.5 2.75 2.75 0 0 0 0-5.5ZM1.5 13.25a1.25 1.25 0 1 1 2.5 0 1.25 1.25 0 0 1-2.5 0ZM2.75 10.5a2.75 2.75 0 1 0 0 5.5 2.75 2.75 0 0 0 0-5.5ZM9.5 8A1.25 1.25 0 1 1 12 8 1.25 1.25 0 0 1 9.5 8ZM10.75 5.25a2.75 2.75 0 1 0 0 5.5 2.75 2.75 0 0 0 0-5.5Z"/>
        </svg>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-[#f6f8fa] flex flex-col">
      <header className="bg-[#1f2328] border-b border-[#30363d] shrink-0">
        <div className="max-w-[1280px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-3">
              <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="48" height="48" rx="10" fill="white" fillOpacity="0.12"/>
                <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fill="white" fontFamily="Georgia, 'Times New Roman', serif" fontSize="17" fontWeight="700" letterSpacing="-0.5">mem</text>
              </svg>
              <span className="text-white font-semibold text-sm">mem</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {profile && (
              <Link
                href={`/u/${profile.username}`}
                className="text-sm text-[#8d96a0] hover:text-white transition-colors hidden sm:block"
              >
                @{profile.username}
              </Link>
            )}
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-[1280px] mx-auto w-full px-4 py-6 gap-6">
        <nav className="w-52 shrink-0">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                    activeSection === item.key
                      ? 'bg-[#eef1f4] text-[#1f2328] font-medium'
                      : 'text-[#57606a] hover:bg-[#eef1f4] hover:text-[#1f2328]'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              </li>
            ))}
            {profile && (
              <li className="pt-2 mt-2 border-t border-[#d0d7de]">
                <Link
                  href={`/u/${profile.username}`}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-[#57606a] rounded-md hover:bg-[#eef1f4] hover:text-[#1f2328] transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M10.561 8.073a6.005 6.005 0 0 1 3.432 5.142.75.75 0 1 1-1.498.07 4.5 4.5 0 0 0-8.99 0 .75.75 0 0 1-1.498-.07 6.004 6.004 0 0 1 3.431-5.142 3.999 3.999 0 1 1 5.123 0ZM10.5 5a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z"/>
                  </svg>
                  我的主页
                </Link>
              </li>
            )}
          </ul>
        </nav>

        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}
