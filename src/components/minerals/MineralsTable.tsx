import { useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react'
import type { Mineral } from '@/types/database'

interface MineralsTableProps {
  minerals: Mineral[]
  onDelete: (id: string) => void
  onBulkStatusUpdate: (ids: string[], status: string) => void
  isLoading?: boolean
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  published: 'bg-green-100 text-green-800',
  archived: 'bg-red-100 text-red-800'
}

export function MineralsTable({
  minerals,
  onDelete,
  onBulkStatusUpdate,
  isLoading
}: MineralsTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const handleSelectAll = () => {
    if (selectedIds.length === minerals.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(minerals.map(m => m.id))
    }
  }

  const handleSelectMineral = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  const handleBulkAction = (status: string) => {
    onBulkStatusUpdate(selectedIds, status)
    setSelectedIds([])
  }

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading minerals...</p>
        </div>
      </div>
    )
  }

  if (minerals.length === 0) {
    return (
      <div className="rounded-md border">
        <div className="p-8 text-center">
          <p className="text-lg font-medium">No minerals found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Get started by creating your first mineral.
          </p>
          <Link to="/minerals/new">
            <Button className="mt-4">Add Mineral</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
          <span className="text-sm text-muted-foreground">
            {selectedIds.length} mineral(s) selected
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleBulkAction('published')}
          >
            Publish
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleBulkAction('draft')}
          >
            Set to Draft
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleBulkAction('archived')}
          >
            Archive
          </Button>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.length === minerals.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {minerals.map((mineral) => (
              <TableRow key={mineral.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(mineral.id)}
                    onCheckedChange={() => handleSelectMineral(mineral.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Link
                      to={`/minerals/${mineral.id}/edit`}
                      className="font-medium hover:underline"
                    >
                      {mineral.title}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      /{mineral.slug}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={statusColors[mineral.status]}
                  >
                    {mineral.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {mineral.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {mineral.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{mineral.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(mineral.updated_at), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
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
                        onClick={() => onDelete(mineral.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

// Install date-fns for date formatting
// npm install date-fns