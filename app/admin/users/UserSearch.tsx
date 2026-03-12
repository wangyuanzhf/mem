'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

export default function UserSearch({ defaultValue }: { defaultValue: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const params = new URLSearchParams(searchParams.toString())
      if (e.target.value) {
        params.set('q', e.target.value)
      } else {
        params.delete('q')
      }
      params.delete('page')
      router.replace(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  return (
    <input
      type="text"
      defaultValue={defaultValue}
      onChange={handleChange}
      placeholder="搜索用户名..."
      className="px-3 py-1.5 text-sm border border-[#d0d7de] rounded-md focus:outline-none focus:border-[#0969da] w-48"
    />
  )
}
