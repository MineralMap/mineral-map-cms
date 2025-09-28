import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  Gem,
  Tags,
  LayoutDashboard,
  Plus,
  Database,
  Sparkles
} from 'lucide-react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    description: 'Overview & Analytics'
  },
  {
    name: 'Minerals',
    href: '/minerals',
    icon: Database,
    description: 'Manage Collection'
  },
  {
    name: 'Add Mineral',
    href: '/minerals/new',
    icon: Plus,
    description: 'Create New Entry'
  },
  {
    name: 'Categories',
    href: '/tags',
    icon: Tags,
    description: 'Organize Tags'
  }
]

export function Sidebar() {
  const location = useLocation()

  return (
    <div className="flex h-full w-72 flex-col gradient-bg-subtle border-r border-border/50">
      {/* Header */}
      <div className="flex h-20 items-center px-6 border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 gradient-bg rounded-lg blur-sm opacity-20"></div>
            <div className="relative gradient-bg p-2 rounded-lg">
              <Gem className="h-6 w-6 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Mineral Map
            </h1>
            <p className="text-sm text-muted-foreground font-medium">Content Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          const Icon = item.icon

          return (
            <Link key={item.name} to={item.href} className="block">
              <div
                className={cn(
                  'group relative flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200',
                  'hover:bg-accent/50 hover:shadow-md',
                  isActive && 'bg-primary/10 shadow-elegant border border-primary/20'
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
                )}

                <div className={cn(
                  'flex-shrink-0 p-2 rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-glow'
                    : 'bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                )}>
                  <Icon className="h-5 w-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-sm font-medium truncate transition-colors',
                    isActive ? 'text-primary' : 'text-foreground group-hover:text-primary'
                  )}>
                    {item.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {item.description}
                  </p>
                </div>

                {isActive && (
                  <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border/30">
        <div className="glass-effect rounded-xl p-4 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Gem className="h-4 w-4" />
            <span className="font-medium">Dice Museum</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Professional CMS Solution
          </p>
        </div>
      </div>
    </div>
  )
}