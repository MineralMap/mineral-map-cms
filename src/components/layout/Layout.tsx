import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { Toaster } from '@/components/ui/sonner'

interface LayoutProps {
  children: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export function Layout({ children, title, description, action }: LayoutProps) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <Header title={title} description={description} action={action} />
        <main className="flex-1 overflow-auto">
          <div className="p-8 space-y-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      <Toaster richColors />
    </div>
  )
}