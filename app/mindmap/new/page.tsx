'use client'

import 'mind-elixir/style.css'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { MindElixirInstance, MindElixirData } from 'mind-elixir'

function VisibilityToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!value)}
      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border transition-colors ${
        value ? 'bg-[#ddf4ff] text-[#0969da] border-[#b6e3ff]' : 'bg-[#f6f8fa] text-[#57606a] border-[#d0d7de]'
      }`}>
      {value ? (
        <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor"><path d="M8 2c1.981 0 3.671.992 4.933 2.078 1.27 1.091 2.187 2.345 2.637 3.023a1.62 1.62 0 0 1 0 1.798c-.45.678-1.367 1.932-2.637 3.023C11.67 13.008 9.981 14 8 14c-1.981 0-3.671-.992-4.933-2.078C1.797 10.83.88 9.576.43 8.898a1.62 1.62 0 0 1 0-1.798c.45-.677 1.367-1.931 2.637-3.022C4.33 2.992 6.019 2 8 2ZM1.679 7.932a.12.12 0 0 0 0 .136c.411.622 1.241 1.75 2.366 2.717C5.175 11.758 6.527 12.5 8 12.5c1.473 0 2.825-.742 3.955-1.715 1.124-.967 1.954-2.096 2.366-2.717a.12.12 0 0 0 0-.136c-.412-.621-1.242-1.75-2.366-2.717C10.825 4.242 9.473 3.5 8 3.5c-1.473 0-2.825.742-3.955 1.715-1.124.967-1.954 2.096-2.366 2.717ZM8 10a2 2 0 1 1-.001-3.999A2 2 0 0 1 8 10Z"/></svg>
      ) : (
        <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor"><path d="M.143 2.31a.75.75 0 0 1 1.047-.167l14.5 10.5a.75.75 0 1 1-.88 1.214l-2.248-1.628C11.346 13.19 9.792 14 8 14c-1.981 0-3.671-.992-4.933-2.078C1.797 10.83.88 9.576.43 8.898a1.62 1.62 0 0 1 0-1.798c.353-.533.995-1.407 1.868-2.264L.31 3.357A.75.75 0 0 1 .143 2.31Zm3.386 3.378L4.64 6.48a7.688 7.688 0 0 0-1.215 1.662.12.12 0 0 0 0 .136c.412.621 1.242 1.75 2.366 2.717C6.825 11.758 8.177 12.5 9.65 12.5c1.013 0 1.97-.33 2.836-.863l-1.108-.803a3.25 3.25 0 0 1-4.62-4.218l-.229-.166ZM6.557 8.52l2.437 1.763a1.75 1.75 0 0 1-2.437-1.763ZM8 3.5c-.574 0-1.131.086-1.662.244L4.894 2.56C5.9 2.183 7.012 2 8 2c1.981 0 3.671.992 4.933 2.078 1.27 1.091 2.187 2.345 2.637 3.023a1.62 1.62 0 0 1 0 1.798 12.9 12.9 0 0 1-.44.613l-1.36-.983c.24-.3.447-.594.616-.852a.12.12 0 0 0 0-.136C13.979 6.746 13.149 5.617 12.025 4.65 10.895 3.678 9.543 2.936 8.07 2.936h-.07Z"/></svg>
      )}
      {value ? '公开' : '私密'}
    </button>
  )
}

export default function NewMindmapPage() {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const mindRef = useRef<MindElixirInstance | null>(null)
  const [title, setTitle] = useState('未命名导图')
  const [isPublic, setIsPublic] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!containerRef.current) return
    let cancelled = false
    const init = async () => {
      const MindElixirLib = (await import('mind-elixir')).default
      if (cancelled || !containerRef.current) return
      const instance = new MindElixirLib({
        el: containerRef.current,
        direction: MindElixirLib.SIDE,
        draggable: true, contextMenu: true, toolBar: true, keypress: true,
      }) as unknown as MindElixirInstance
      instance.init({
        nodeData: {
          id: 'root', topic: '中心主题',
          children: [
            { id: 'child1', topic: '分支 1', children: [] },
            { id: 'child2', topic: '分支 2', children: [] },
          ],
        },
      })
      mindRef.current = instance
    }
    init()
    return () => { cancelled = true; mindRef.current = null }
  }, [])

  const save = async () => {
    if (!mindRef.current) return
    if (!title.trim()) { setError('请输入标题'); return }
    setSaving(true); setError('')
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const data = mindRef.current.getData()
      const { data: saved, error: err } = await supabase.from('mindmaps')
        .insert({ user_id: user.id, title: title.trim(), data: data as unknown as Record<string, unknown>, is_public: isPublic })
        .select('id').single()
      if (err) throw err
      router.push(`/mindmap/${saved.id}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '保存失败')
    } finally { setSaving(false) }
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 130px)' }}>
      <div className="flex items-center gap-4 mb-4 shrink-0">
        <button onClick={() => router.push('/mindmap')} className="text-sm text-[#57606a] hover:text-[#0969da]">← 返回列表</button>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
          className="flex-1 text-base font-semibold text-[#1f2328] border border-[#d0d7de] rounded-md px-3 py-1.5 focus:outline-none focus:border-[#0969da]" />
        {error && <span className="text-sm text-red-600">{error}</span>}
        <VisibilityToggle value={isPublic} onChange={setIsPublic} />
        <button onClick={save} disabled={saving}
          className="px-4 py-1.5 text-sm bg-[#1f2328] text-white rounded-md hover:bg-[#2d3139] transition-colors disabled:opacity-50">
          {saving ? '保存中...' : '保存'}
        </button>
      </div>
      <div ref={containerRef} style={{ flex: 1, minHeight: 0 }}
        className="bg-white border border-[#d0d7de] rounded-md overflow-hidden" />
    </div>
  )
}
