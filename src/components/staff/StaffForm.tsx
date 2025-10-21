import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { FileUpload } from '@/components/ui/file-upload'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { staffService, storageService } from '@/services/database'
import type { Staff } from '@/types/database'
import { Save, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

const staffSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
})

type StaffFormData = z.infer<typeof staffSchema>

export function StaffForm() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditing = id !== 'new' && !!id

  const [staff, setStaff] = useState<Staff | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(isEditing)
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  })

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      if (isEditing && id) {
        const staffData = await staffService.getById(id)
        setStaff(staffData)
        setImageUrl(staffData.image || null)

        form.reset({
          title: staffData.title,
          description: staffData.description || '',
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
      const file = files[0]
      const { url } = await storageService.uploadStaffImage(file)
      setImageUrl(url)
      toast.success('Image uploaded')
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image')
    }
  }

  const handleImageRemove = () => {
    setImageUrl(null)
    toast.success('Image removed')
  }

  const onSubmit = async (data: StaffFormData) => {
    setIsSaving(true)
    try {
      const staffData = {
        ...data,
        image: imageUrl || undefined,
      }

      if (isEditing && id) {
        await staffService.update({ id, ...staffData })
        toast.success('Staff member updated successfully')
      } else {
        await staffService.create(staffData)
        toast.success('Staff member created successfully')
      }

      navigate('/staff')
    } catch (error) {
      console.error('Error saving staff:', error)
      toast.error('Failed to save staff member')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-8 w-48 loading-pulse rounded"></div>
        <div className="h-64 loading-pulse rounded-xl"></div>
      </div>
    )
  }

  const title = isEditing ? `Edit ${staff?.title || 'Staff Member'}` : 'Add New Staff Member'
  const description = isEditing ? 'Update staff member information' : 'Create a new staff member entry'

  return (
    <div className="space-y-8">
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
          <Button variant="outline" onClick={() => navigate('/staff')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Staff
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSaving}
            className="gradient-bg hover:shadow-glow"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Staff Member'}
          </Button>
        </div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
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
                        <FormLabel>Name/Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter staff member name or title..." {...field} />
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
                            placeholder="Enter staff member bio or description..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Photo</CardTitle>
                </CardHeader>
                <CardContent>
                  <FileUpload
                    type="image"
                    maxSize={5}
                    onUpload={handleImageUpload}
                    uploadedFiles={imageUrl ? [{
                      id: 'staff-image',
                      url: imageUrl,
                      name: 'Staff Photo',
                      size: 0,
                      type: 'image'
                    }] : []}
                    onRemove={handleImageRemove}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
