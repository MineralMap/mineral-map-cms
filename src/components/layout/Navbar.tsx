import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Gem,
  Tags,
  LayoutDashboard,
  Plus,
  Database,
  Search,
  Bell,
  User
} from 'lucide-react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard
  },
  {
    name: 'Minerals',
    href: '/minerals',
    icon: Database
  },
  {
    name: 'Categories',
    href: '/tags',
    icon: Tags
  }
]

export function Navbar() {
  const location = useLocation()

  return (
    <nav className="glass-effect border-b border-border/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 gradient-bg rounded-lg blur-sm opacity-20"></div>
              <div className="relative gradient-bg p-2 rounded-lg">
                <Gem className="h-5 w-5 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Mineral Map CMS
              </h1>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              const Icon = item.icon

              return (
                <Link key={item.name} to={item.href}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className={cn(
                      'gap-2',
                      isActive && 'gradient-bg shadow-glow text-white'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              )
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative max-w-sm hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-10 w-64 bg-muted/50 border-border/50 focus:bg-background"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Link to="/minerals/new">
                <Button className="gradient-bg hover:shadow-glow">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Mineral
                </Button>
              </Link>

              <Button variant="ghost" size="icon" className="relative hover:bg-accent/50">
                <Bell className="h-4 w-4" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
              </Button>

              <Button variant="ghost" size="icon" className="hover:bg-accent/50">
                <User className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}