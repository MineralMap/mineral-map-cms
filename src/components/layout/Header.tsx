import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Bell, User, Zap } from 'lucide-react'

interface HeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export function Header({ title, description, action }: HeaderProps) {
  return (
    <header className="glass-effect border-b border-border/50 sticky top-0 z-50">
      {/* Top bar */}
      <div className="flex h-16 items-center gap-4 px-6">
        <div className="flex flex-1 items-center gap-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search minerals..."
              className="pl-10 bg-muted/50 border-border/50 focus:bg-background transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative hover:bg-accent/50">
            <Bell className="h-4 w-4" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-accent/50">
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Page header */}
      <div className="gradient-bg-subtle border-b border-border/30 px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                {title}
              </h1>
              <Zap className="h-5 w-5 text-primary" />
            </div>
            {description && (
              <p className="text-muted-foreground font-medium">{description}</p>
            )}
          </div>
          {action && (
            <div className="flex items-center gap-2">
              {action}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}