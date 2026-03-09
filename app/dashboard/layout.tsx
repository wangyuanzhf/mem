import AppShell from '@/app/components/AppShell'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppShell activeSection="dashboard">{children}</AppShell>
}
