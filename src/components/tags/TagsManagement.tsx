import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { tagsService } from '@/services/database'
import type { Tag } from '@/types/database'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

const tagSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  color: z.string().min(1, 'Color is required'),
  description: z.string().optional(),
})

type TagFormData = z.infer<typeof tagSchema>

const predefinedColors = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
  '#8B5CF6', '#06B6D4', '#84CC16', '#6B7280',
  '#EC4899', '#F97316', '#14B8A6', '#8B5A3C'
]

export function TagsManagement() {
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)

  const form = useForm<TagFormData>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      name: '',
      color: predefinedColors[0],
      description: '',
    },
  })

  useEffect(() => {
    loadTags()
  }, [])

  const loadTags = async () => {
    try {
      const data = await tagsService.getAll()
      setTags(data)
    } catch (error) {
      console.error('Error loading tags:', error)
      toast.error('Failed to load tags')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenDialog = (tag?: Tag) => {
    if (tag) {
      setEditingTag(tag)
      form.reset({
        name: tag.name,
        color: tag.color,
        description: tag.description || '',
      })
    } else {
      setEditingTag(null)
      form.reset({
        name: '',
        color: predefinedColors[0],
        description: '',
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingTag(null)
    form.reset()
  }

  const onSubmit = async (data: TagFormData) => {
    try {
      if (editingTag) {
        await tagsService.update({ id: editingTag.id, ...data })
        toast.success('Tag updated successfully')
      } else {
        await tagsService.create(data)
        toast.success('Tag created successfully')
      }
      await loadTags()
      handleCloseDialog()
    } catch (error) {
      console.error('Error saving tag:', error)
      toast.error('Failed to save tag')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tag?')) return

    try {
      await tagsService.delete(id)
      setTags(prev => prev.filter(t => t.id !== id))
      toast.success('Tag deleted successfully')
    } catch (error) {
      console.error('Error deleting tag:', error)
      toast.error('Failed to delete tag')
    }
  }

  const headerAction = (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Tag
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingTag ? 'Edit Tag' : 'Create New Tag'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Silicates" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Input type="color" {...field} className="h-10" />
                      <div className="flex flex-wrap gap-2">
                        {predefinedColors.map((color) => (
                          <button
                            key={color}
                            type="button"
                            className="w-6 h-6 rounded border-2 border-border"
                            style={{ backgroundColor: color }}
                            onClick={() => field.onChange(color)}
                          />
                        ))}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of this tag category..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit">
                {editingTag ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )

  if (isLoading) {
    return (
      <Layout title="Tags" description="Manage mineral categories" action={headerAction}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout
      title="Tags"
      description="Manage mineral categories and classifications"
      action={headerAction}
    >
      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tags.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Most Used</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">
                {tags.length > 0 ? tags[0].name : 'N/A'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">
                {tags.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    style={{ backgroundColor: tag.color, color: 'white' }}
                    className="text-xs"
                  >
                    {tag.name}
                  </Badge>
                ))}
                {tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{tags.length - 3}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tags Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Tags</CardTitle>
          </CardHeader>
          <CardContent>
            {tags.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-lg font-medium">No tags found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Create your first tag to start organizing minerals.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tags.map((tag) => (
                    <TableRow key={tag.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge
                            style={{ backgroundColor: tag.color, color: 'white' }}
                          >
                            {tag.name}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: tag.color }}
                          />
                          <code className="text-xs">{tag.color}</code>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground">
                          {tag.description || 'No description'}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(tag.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(tag)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(tag.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}