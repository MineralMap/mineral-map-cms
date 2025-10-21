import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { FileUpload, type UploadedFile } from '@/components/ui/file-upload'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { mineralsService, categoriesService, storageService, utilityService } from '@/services/database'
import type { Mineral, Category, MineralImage } from '@/types/database'
import { Save, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

const mineralSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  video_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  status: z.enum(['draft', 'published', 'archived']),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
})

type MineralFormData = z.infer<typeof mineralSchema>

export function MineralForm() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditing = id !== 'new' && !!id

  const [mineral, setMineral] = useState<Mineral | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [images, setImages] = useState<MineralImage[]>([])
  const [isLoading, setIsLoading] = useState(isEditing)
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<MineralFormData>({
    resolver: zodResolver(mineralSchema),
    defaultValues: {
      title: '',
      slug: '',
      description: '',
      video_url: '',
      status: 'draft',
      meta_title: '',
      meta_description: '',
    },
  })

  useEffect(() => {
    loadData()
  }, [id])

  useEffect(() => {
    // Auto-generate slug from title
    const title = form.watch('title')
    if (title && !isEditing) {
      const slug = utilityService.generateSlug(title)
      form.setValue('slug', slug)
    }
  }, [form.watch('title')])

  const loadData = async () => {
    try {
      const categoriesData = await categoriesService.getAll()
      setCategories(categoriesData)

      if (isEditing && id) {
        const mineralData = await mineralsService.getById(id)
        setMineral(mineralData)
        setSelectedCategory(mineralData.category || null)
        setImages(mineralData.images)

        // Set form values
        form.reset({
          title: mineralData.title,
          slug: mineralData.slug,
          description: mineralData.description || '',
          video_url: mineralData.video_url || '',
          status: mineralData.status,
          meta_title: mineralData.meta_title || '',
          meta_description: mineralData.meta_description || '',
        })
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = async (files: File[]) => {
    try {
      const uploadPromises = files.map(async (file) => {
        const { url } = await storageService.uploadImage(file)
        return {
          id: crypto.randomUUID(),
          url,
          alt: '',
          caption: '',
          filename: file.name,
          size: file.size,
        } as MineralImage
      })

      const newImages = await Promise.all(uploadPromises)
      setImages(prev => [...prev, ...newImages])
      toast.success(`Uploaded ${newImages.length} image(s)`)
    } catch (error) {
      console.error('Error uploading images:', error)
      toast.error('Failed to upload images')
    }
  }

  const handleImageRemove = (imageToRemove: UploadedFile) => {
    setImages(prev => prev.filter(img => img.id !== imageToRemove.id))
    toast.success('Image removed')
  }

  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName)
  }

  const onSubmit = async (data: MineralFormData) => {
    setIsSaving(true)
    try {
      // Ensure slug is unique
      const finalSlug = await utilityService.makeSlugUnique(data.slug, isEditing ? id : undefined)

      const mineralData = {
        ...data,
        slug: finalSlug,
        category: selectedCategory,
        images,
      }

      if (isEditing && id) {
        await mineralsService.update({ id, ...mineralData })
        toast.success('Mineral updated successfully')
      } else {
        await mineralsService.create(mineralData)
        toast.success('Mineral created successfully')
      }

      navigate('/minerals')
    } catch (error) {
      console.error('Error saving mineral:', error)
      toast.error('Failed to save mineral')
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 loading-pulse rounded-xl"></div>
            ))}
          </div>
          <div className="space-y-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-32 loading-pulse rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const title = isEditing ? `Edit ${mineral?.title || 'Mineral'}` : 'Add New Mineral'
  const description = isEditing ? 'Update mineral information' : 'Create a new mineral entry'

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
          <Button variant="outline" onClick={() => navigate('/minerals')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Minerals
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSaving}
            className="gradient-bg hover:shadow-glow"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Mineral'}
          </Button>
        </div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card className="card-modern">
                <CardHeader>
                  <CardTitle className="text-xl">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter mineral title..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug</FormLabel>
                        <FormControl>
                          <Input placeholder="url-friendly-name" {...field} />
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
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <RichTextEditor
                            value={field.value || ''}
                            onChange={field.onChange}
                            placeholder="Enter detailed mineral description..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="video_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Video URL (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://youtube.com/watch?v=..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Images */}
              <Card>
                <CardHeader>
                  <CardTitle>Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <FileUpload
                    type="image"
                    multiple
                    maxSize={5}
                    onUpload={handleImageUpload}
                    uploadedFiles={images.map(img => ({
                      id: img.id,
                      url: img.url,
                      name: img.filename,
                      size: img.size,
                      type: 'image'
                    }))}
                    onRemove={handleImageRemove}
                  />
                </CardContent>
              </Card>

              {/* SEO */}
              <Card>
                <CardHeader>
                  <CardTitle>SEO Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="meta_title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Title</FormLabel>
                        <FormControl>
                          <Input placeholder="SEO title..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="meta_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="SEO description..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Publish</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Category */}
              <Card>
                <CardHeader>
                  <CardTitle>Category</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Select Category</Label>
                    <Select value={selectedCategory || ''} onValueChange={handleCategorySelect}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select a category..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}