import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { mineralsService, tagsService } from '@/services/database'
import type { Mineral, Tag } from '@/types/database'
import { Plus, Gem, Tags, FileText, TrendingUp, ArrowRight } from 'lucide-react'

export function DashboardPage() {
  const [stats, setStats] = useState({
    totalMinerals: 0,
    publishedMinerals: 0,
    draftMinerals: 0,
    totalTags: 0,
  })
  const [recentMinerals, setRecentMinerals] = useState<Mineral[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [allMinerals, allTags] = await Promise.all([
        mineralsService.getAll(),
        tagsService.getAll()
      ])

      const publishedCount = allMinerals.filter(m => m.status === 'published').length
      const draftCount = allMinerals.filter(m => m.status === 'draft').length

      setStats({
        totalMinerals: allMinerals.length,
        publishedMinerals: publishedCount,
        draftMinerals: draftCount,
        totalTags: allTags.length,
      })

      setRecentMinerals(allMinerals.slice(0, 5))
      setTags(allTags)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="h-8 w-48 loading-pulse rounded"></div>
          <div className="h-4 w-72 loading-pulse rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 loading-pulse rounded-xl"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
          Dashboard
        </h1>
        <p className="text-xl text-muted-foreground">
          Welcome back! Here's what's happening with your mineral collection.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-modern group hover:scale-105 transition-transform">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Minerals</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <Gem className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.totalMinerals}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="card-modern group hover:scale-105 transition-transform">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.publishedMinerals}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalMinerals > 0
                ? `${Math.round((stats.publishedMinerals / stats.totalMinerals) * 100)}%`
                : '0%'
              } of total
            </p>
          </CardContent>
        </Card>

        <Card className="card-modern group hover:scale-105 transition-transform">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
              <FileText className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{stats.draftMinerals}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Waiting for review
            </p>
          </CardContent>
        </Card>

        <Card className="card-modern group hover:scale-105 transition-transform">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
              <Tags className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{stats.totalTags}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Classification types
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Minerals */}
        <Card className="card-modern">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Recent Minerals</CardTitle>
            <Link to="/minerals">
              <Button variant="ghost" className="gap-2 hover:gap-3 transition-all">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentMinerals.length === 0 ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 mx-auto gradient-bg rounded-full flex items-center justify-center">
                  <Gem className="h-8 w-8 text-white" />
                </div>
                <div className="space-y-2">
                  <p className="font-medium">No minerals yet</p>
                  <p className="text-sm text-muted-foreground">Get started by creating your first mineral entry</p>
                </div>
                <Link to="/minerals/new">
                  <Button className="gradient-bg hover:shadow-glow">
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Mineral
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentMinerals.map((mineral) => (
                  <div key={mineral.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group">
                    <div className="space-y-1">
                      <Link
                        to={`/minerals/${mineral.id}/edit`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {mineral.title}
                      </Link>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={mineral.status === 'published' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {mineral.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(mineral.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tag Categories */}
        <Card className="card-modern">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Categories</CardTitle>
            <Link to="/tags">
              <Button variant="ghost" className="gap-2 hover:gap-3 transition-all">
                Manage
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {tags.length === 0 ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 mx-auto gradient-bg rounded-full flex items-center justify-center">
                  <Tags className="h-8 w-8 text-white" />
                </div>
                <div className="space-y-2">
                  <p className="font-medium">No categories yet</p>
                  <p className="text-sm text-muted-foreground">Create tags to organize your minerals</p>
                </div>
                <Link to="/tags">
                  <Button className="gradient-bg hover:shadow-glow">
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Tag
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {tags.slice(0, 12).map((tag) => (
                    <Badge
                      key={tag.id}
                      style={{ backgroundColor: tag.color, color: 'white' }}
                      className="hover:scale-105 transition-transform cursor-pointer"
                    >
                      {tag.name}
                    </Badge>
                  ))}
                  {tags.length > 12 && (
                    <Badge variant="outline" className="hover:scale-105 transition-transform">
                      +{tags.length - 12} more
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{tags.length}</div>
                    <div className="text-xs text-muted-foreground">Total Tags</div>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {tags.slice(0, 3).length}
                    </div>
                    <div className="text-xs text-muted-foreground">Most Used</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}