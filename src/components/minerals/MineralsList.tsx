import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MineralsTable } from './MineralsTable'
import { mineralsService, categoriesService } from '@/services/database'
import type { Mineral, Category } from '@/types/database'
import { Search } from 'lucide-react'
import { toast } from 'sonner'

export function MineralsList() {
  const [minerals, setMinerals] = useState<Mineral[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterMinerals()
  }, [search, statusFilter, categoryFilter])

  const loadData = async () => {
    try {
      const [mineralsData, categoriesData] = await Promise.all([
        mineralsService.getAll(),
        categoriesService.getAll()
      ])
      setMinerals(mineralsData)
      setCategories(categoriesData)
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

      if (categoryFilter !== 'all') {
        filters.category = categoryFilter
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


  return (
    <MainLayout>
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

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.name}>
                  {category.name}
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
    </MainLayout>
  )
}