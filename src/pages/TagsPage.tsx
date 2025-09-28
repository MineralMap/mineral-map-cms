import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { tagsService } from '@/services/database'
import type { Tag } from '@/types/database'
import { Plus, Edit, Trash2, Tags as TagsIcon } from 'lucide-react'
import { toast } from 'sonner'

const tagSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  color: z.string().min(1, 'Color is required'),
  description: z.string().optional(),
})

type TagFormData = z.infer<typeof tagSchema>

const predefinedColors = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
  '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981',
  '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1'
]

export function TagsPage() {
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 loading-pulse rounded-xl"></div>
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
            Categories
          </h1>
          <p className="text-xl text-muted-foreground">
            Organize your minerals with custom tags and categories
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="gradient-bg hover:shadow-glow">
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="card-modern">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {editingTag ? 'Edit Category' : 'Create New Category'}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Silicates, Oxides..." {...field} />
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
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Input type="color" {...field} className="w-16 h-10 rounded-lg" />
                            <Input
                              type="text"
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="#6366f1"
                              className="flex-1"
                            />
                          </div>
                          <div className="grid grid-cols-8 gap-2">
                            {predefinedColors.map((color) => (
                              <button
                                key={color}
                                type="button"
                                className="w-8 h-8 rounded-lg border-2 border-border hover:scale-110 transition-transform"
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
                          placeholder="Brief description of this category..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                  <Button type="submit" className="gradient-bg">
                    {editingTag ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-modern">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{tags.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active classification types
            </p>
          </CardContent>
        </Card>

        <Card className="card-modern">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Most Popular</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {tags.length > 0 ? tags[0].name : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Most used category
            </p>
          </CardContent>
        </Card>

        <Card className="card-modern">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Quick Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 4).map((tag) => (
                <Badge
                  key={tag.id}
                  style={{ backgroundColor: tag.color, color: 'white' }}
                  className="text-xs"
                >
                  {tag.name}
                </Badge>
              ))}
              {tags.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{tags.length - 4}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Grid */}
      {tags.length === 0 ? (
        <Card className="card-modern">
          <CardContent className="p-12 text-center space-y-4">
            <div className="w-16 h-16 mx-auto gradient-bg rounded-full flex items-center justify-center">
              <TagsIcon className="h-8 w-8 text-white" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">No categories yet</h3>
              <p className="text-muted-foreground">
                Create your first category to start organizing minerals
              </p>
            </div>
            <Button onClick={() => handleOpenDialog()} className="gradient-bg hover:shadow-glow">
              <Plus className="mr-2 h-4 w-4" />
              Create First Category
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tags.map((tag) => (
            <Card key={tag.id} className="card-modern group">
              <CardHeader className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full border-2 border-white shadow-md"
                      style={{ backgroundColor: tag.color }}
                    />
                    <CardTitle className="text-lg">{tag.name}</CardTitle>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleOpenDialog(tag)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(tag.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <Badge
                  style={{ backgroundColor: tag.color, color: 'white' }}
                  className="w-fit"
                >
                  {tag.name}
                </Badge>

                {tag.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {tag.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                  <span>Created {new Date(tag.created_at).toLocaleDateString()}</span>
                  <code className="px-2 py-1 bg-muted rounded text-xs">{tag.color}</code>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}