import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { mineralsService, tagsService } from '@/services/database'
import type { Mineral, Tag } from '@/types/database'
import { Plus, Gem, Tags, FileText, TrendingUp } from 'lucide-react'

export function Dashboard() {
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

      // Calculate stats
      const publishedCount = allMinerals.filter(m => m.status === 'published').length
      const draftCount = allMinerals.filter(m => m.status === 'draft').length

      setStats({
        totalMinerals: allMinerals.length,
        publishedMinerals: publishedCount,
        draftMinerals: draftCount,
        totalTags: allTags.length,
      })

      // Get recent minerals (last 5)
      setRecentMinerals(allMinerals.slice(0, 5))
      setTags(allTags)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const headerAction = (
    <Link to="/minerals/new">
      <Button>
        <Plus className="mr-2 h-4 w-4" />
        Add Mineral
      </Button>
    </Link>
  )

  if (isLoading) {
    return (
      <Layout title="Dashboard" description="Mineral Map CMS Overview" action={headerAction}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout
      title="Dashboard"
      description="Welcome to Mineral Map CMS"
      action={headerAction}
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Minerals</CardTitle>
              <Gem className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMinerals}</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.publishedMinerals}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalMinerals > 0
                  ? `${Math.round((stats.publishedMinerals / stats.totalMinerals) * 100)}%`
                  : '0%'
                } of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Drafts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.draftMinerals}</div>
              <p className="text-xs text-muted-foreground">
                Waiting for review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <Tags className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTags}</div>
              <p className="text-xs text-muted-foreground">
                Mineral classifications
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Minerals */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Minerals</CardTitle>
            </CardHeader>
            <CardContent>
              {recentMinerals.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground">No minerals yet</p>
                  <Link to="/minerals/new">
                    <Button className="mt-2" size="sm">
                      Create First Mineral
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentMinerals.map((mineral) => (
                    <div key={mineral.id} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Link
                          to={`/minerals/${mineral.id}/edit`}
                          className="font-medium hover:underline"
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
                    </div>
                  ))}
                  <div className="pt-2">
                    <Link to="/minerals">
                      <Button variant="outline" size="sm" className="w-full">
                        View All Minerals
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tags Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Tag Categories</CardTitle>
            </CardHeader>
            <CardContent>
              {tags.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground">No tags yet</p>
                  <Link to="/tags">
                    <Button className="mt-2" size="sm">
                      Create First Tag
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {tags.slice(0, 8).map((tag) => (
                      <Badge
                        key={tag.id}
                        style={{ backgroundColor: tag.color, color: 'white' }}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                    {tags.length > 8 && (
                      <Badge variant="outline">
                        +{tags.length - 8} more
                      </Badge>
                    )}
                  </div>
                  <div className="pt-2">
                    <Link to="/tags">
                      <Button variant="outline" size="sm" className="w-full">
                        Manage Tags
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/minerals/new">
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Mineral
                </Button>
              </Link>
              <Link to="/tags">
                <Button className="w-full justify-start" variant="outline">
                  <Tags className="mr-2 h-4 w-4" />
                  Manage Tags
                </Button>
              </Link>
              <Link to="/minerals">
                <Button className="w-full justify-start" variant="outline">
                  <Gem className="mr-2 h-4 w-4" />
                  View All Minerals
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}