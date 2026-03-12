'use client'

import { useEffect, useRef } from 'react'
import katex from 'katex'
import mermaid from 'mermaid'

mermaid.initialize({ startOnLoad: false, theme: 'default' })

function renderMath(el: HTMLElement) {
  const text = el.innerHTML

  const result = text.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
    try {
      return katex.renderToString(math, { displayMode: true, throwOnError: false })
    } catch { return _ }
  })
  .replace(/\$([^$\n]+?)\$/g, (_, math) => {
    try {
      return katex.renderToString(math, { displayMode: false, throwOnError: false })
    } catch { return _ }
  })

  if (result !== text) el.innerHTML = result
}

async function renderMermaid(el: HTMLElement) {
  const blocks = el.querySelectorAll<HTMLElement>('pre code.language-mermaid')
  for (const block of blocks) {
    const code = block.textContent ?? ''
    const id = `mermaid-${Math.random().toString(36).slice(2)}`
    try {
      const { svg } = await mermaid.render(id, code)
      const wrapper = document.createElement('div')
      wrapper.className = 'mermaid-diagram my-4 overflow-x-auto'
      wrapper.innerHTML = svg
      block.closest('pre')!.replaceWith(wrapper)
    } catch { /* 保留原始代码块 */ }
  }
}

export default function PostContent({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    renderMath(ref.current)
    renderMermaid(ref.current)
  }, [html])

  return (
    <div
      ref={ref}
      className="p-6 prose max-w-none text-[#1f2328] prose-headings:text-[#1f2328] prose-a:text-[#0969da] prose-code:text-[#cf222e] prose-code:bg-[#f6f8fa] prose-code:px-1 prose-code:rounded prose-pre:bg-[#1f2328]"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
