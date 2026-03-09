'use client'

import { useRouter } from 'next/navigation'

export default function BackButton() {
  const router = useRouter()
  return (
    <button onClick={() => router.back()} className="text-sm text-[#57606a] hover:text-[#0969da]">
      ← 返回
    </button>
  )
}
