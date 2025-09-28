import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { mineralsService, tagsService } from '@/services/database'
import type { Mineral, Tag } from '@/types/database'
import { Plus, Search, Filter, Edit, Trash2, Eye, Calendar, MoreHorizontal } from 'lucide-react'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'

export function MineralsPage() {
  const [minerals, setMinerals] = useState<Mineral[]>([])
  const [filteredMinerals, setFilteredMinerals] = useState<Mineral[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [tagFilter, setTagFilter] = useState<string>('all')

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterMinerals()
  }, [minerals, search, statusFilter, tagFilter])

  const loadData = async () => {
    try {
      const [mineralsData, tagsData] = await Promise.all([
        mineralsService.getAll(),
        tagsService.getAll()
      ])
      setMinerals(mineralsData)
      setTags(tagsData)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  const filterMinerals = () => {
    let filtered = minerals

    if (search) {
      filtered = filtered.filter(mineral =>
        mineral.title.toLowerCase().includes(search.toLowerCase()) ||
        mineral.description?.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(mineral => mineral.status === statusFilter)
    }

    if (tagFilter !== 'all') {
      filtered = filtered.filter(mineral => mineral.tags.includes(tagFilter))
    }

    setFilteredMinerals(filtered)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this mineral?')) return

    try {
      await mineralsService.delete(id)
      setMinerals(prev => prev.filter(m => m.id !== id))
      toast.success('Mineral deleted successfully')
    } catch (error) {
      console.error('Error deleting mineral:', error)
      toast.error('Failed to delete mineral')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'archived':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 w-48 loading-pulse rounded"></div>
            <div className="h-4 w-72 loading-pulse rounded"></div>
          </div>
          <div className="h-10 w-32 loading-pulse rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 loading-pulse rounded-xl"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Minerals
          </h1>
          <p className="text-xl text-muted-foreground">
            Manage your mineral database and collection entries
          </p>
        </div>
        <Link to="/minerals/new">
          <Button className="gradient-bg hover:shadow-glow">
            <Plus className="mr-2 h-4 w-4" />
            Add Mineral
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="card-modern">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search minerals..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={tagFilter} onValueChange={setTagFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {tags.map((tag) => (
                  <SelectItem key={tag.id} value={tag.name}>
                    {tag.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(search || statusFilter !== 'all' || tagFilter !== 'all') && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Showing {filteredMinerals.length} of {minerals.length} minerals
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch('')
                  setStatusFilter('all')
                  setTagFilter('all')
                }}
                className="ml-auto"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Minerals Grid */}
      {filteredMinerals.length === 0 ? (
        <Card className="card-modern">
          <CardContent className="p-12 text-center space-y-4">
            <div className="w-16 h-16 mx-auto gradient-bg rounded-full flex items-center justify-center">
              <Search className="h-8 w-8 text-white" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">No minerals found</h3>
              <p className="text-muted-foreground">
                {search || statusFilter !== 'all' || tagFilter !== 'all'
                  ? 'Try adjusting your filters or search terms'
                  : 'Get started by creating your first mineral entry'
                }
              </p>
            </div>
            {!search && statusFilter === 'all' && tagFilter === 'all' && (
              <Link to="/minerals/new">
                <Button className="gradient-bg hover:shadow-glow">
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Mineral
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMinerals.map((mineral) => (
            <Card key={mineral.id} className="card-modern group">
              <CardHeader className="space-y-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                    <Link to={`/minerals/${mineral.id}/edit`}>
                      {mineral.title}
                    </Link>
                  </CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/minerals/${mineral.id}/preview`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={`/minerals/${mineral.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(mineral.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(mineral.status)}>
                    {mineral.status}
                  </Badge>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    {format(new Date(mineral.updated_at), 'MMM d, yyyy')}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {mineral.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {mineral.description.replace(/<[^>]*>/g, '')}
                  </p>
                )}

                {mineral.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {mineral.tags.slice(0, 3).map((tagName) => {
                      const tag = tags.find(t => t.name === tagName)
                      return (
                        <Badge
                          key={tagName}
                          variant="outline"
                          style={{ borderColor: tag?.color, color: tag?.color }}
                          className="text-xs"
                        >
                          {tagName}
                        </Badge>
                      )
                    })}
                    {mineral.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{mineral.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-muted-foreground">
                    /{mineral.slug}
                  </span>
                  <Link to={`/minerals/${mineral.id}/edit`}>
                    <Button size="sm" variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}