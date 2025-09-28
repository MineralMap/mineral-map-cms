import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MineralsTable } from './MineralsTable'
import { mineralsService, tagsService } from '@/services/database'
import type { Mineral, Tag } from '@/types/database'
import { Plus, Search } from 'lucide-react'
import { toast } from 'sonner'

export function MineralsList() {
  const [minerals, setMinerals] = useState<Mineral[]>([])
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
  }, [search, statusFilter, tagFilter])

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

  const filterMinerals = async () => {
    try {
      const filters: Record<string, unknown> = {}

      if (statusFilter !== 'all') {
        filters.status = statusFilter
      }

      if (tagFilter !== 'all') {
        filters.tags = [tagFilter]
      }

      if (search) {
        filters.search = search
      }

      const filtered = await mineralsService.getAll(filters)
      setMinerals(filtered)
    } catch (error) {
      console.error('Error filtering minerals:', error)
    }
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

  const handleBulkStatusUpdate = async (ids: string[], status: string) => {
    try {
      await mineralsService.bulkUpdateStatus(ids, status)
      await filterMinerals() // Reload data
      toast.success(`Updated ${ids.length} mineral(s) status to ${status}`)
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
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

  return (
    <Layout
      title="Minerals"
      description="Manage your mineral database entries"
      action={headerAction}
    >
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search minerals..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          <Select value={tagFilter} onValueChange={setTagFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All tags" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tags</SelectItem>
              {tags.map((tag) => (
                <SelectItem key={tag.id} value={tag.name}>
                  {tag.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <MineralsTable
          minerals={minerals}
          onDelete={handleDelete}
          onBulkStatusUpdate={handleBulkStatusUpdate}
          isLoading={isLoading}
        />
      </div>
    </Layout>
  )
}