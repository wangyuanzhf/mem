import AppShell from '@/app/components/AppShell'

export default function MindmapLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppShell activeSection="mindmap">{children}</AppShell>
}
