import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { tagsService } from '@/services/database'
import type { Tag } from '@/types/database'
import { Save, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

const tagSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color'),
  description: z.string().optional(),
})

type TagFormData = z.infer<typeof tagSchema>

const DEFAULT_COLORS = [
  '#6B7280', '#EF4444', '#F59E0B', '#10B981', '#3B82F6',
  '#6366F1', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'
]

export function TagForm() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditing = id !== 'new' && !!id

  const [tag, setTag] = useState<Tag | null>(null)
  const [isLoading, setIsLoading] = useState(isEditing)
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<TagFormData>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      name: '',
      color: '#6B7280',
      description: '',
    },
  })

  useEffect(() => {
    if (isEditing && id) {
      loadTag()
    }
  }, [id])

  const loadTag = async () => {
    try {
      const tagData = await tagsService.getById(id!)
      setTag(tagData)
      form.reset({
        name: tagData.name,
        color: tagData.color,
        description: tagData.description || '',
      })
    } catch (error) {
      console.error('Error loading tag:', error)
      toast.error('Failed to load tag')
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: TagFormData) => {
    setIsSaving(true)
    try {
      if (isEditing && id) {
        await tagsService.update({ id, ...data })
        toast.success('Tag updated successfully')
      } else {
        await tagsService.create(data)
        toast.success('Tag created successfully')
      }
      navigate('/categories')
    } catch (error) {
      console.error('Error saving tag:', error)
      toast.error('Failed to save tag')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="h-8 w-48 loading-pulse rounded"></div>
          <div className="h-4 w-72 loading-pulse rounded"></div>
        </div>
        <div className="h-96 loading-pulse rounded-xl"></div>
      </div>
    )
  }

  const title = isEditing ? `Edit ${tag?.name || 'Tag'}` : 'Add New Tag'
  const description = isEditing ? 'Update tag information' : 'Create a new tag for organizing minerals'

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            {title}
          </h1>
          <p className="text-xl text-muted-foreground">
            {description}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate('/categories')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Categories
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSaving}
            className="gradient-bg hover:shadow-glow"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Tag'}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="max-w-2xl">
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="text-xl">Tag Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter tag name..." {...field} />
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
                        <Textarea placeholder="Enter tag description..." {...field} />
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
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <Input
                              type="color"
                              {...field}
                              className="w-20 h-10 cursor-pointer"
                            />
                            <Input
                              type="text"
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                              placeholder="#6B7280"
                              className="flex-1"
                            />
                            <div
                              className="w-10 h-10 rounded border-2 border-border"
                              style={{ backgroundColor: field.value }}
                            />
                          </div>
                          <div>
                            <Label className="text-sm text-muted-foreground mb-2 block">
                              Quick Colors
                            </Label>
                            <div className="flex flex-wrap gap-2">
                              {DEFAULT_COLORS.map((color) => (
                                <button
                                  key={color}
                                  type="button"
                                  className="w-8 h-8 rounded border-2 border-border hover:scale-110 transition-transform"
                                  style={{ backgroundColor: color }}
                                  onClick={() => field.onChange(color)}
                                  title={color}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  )
}
