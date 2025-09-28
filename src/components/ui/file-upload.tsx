import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Upload, Image, Video } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  accept?: string
  multiple?: boolean
  maxSize?: number // in MB
  onUpload: (files: File[]) => Promise<void>
  uploadedFiles?: UploadedFile[]
  onRemove?: (file: UploadedFile) => void
  disabled?: boolean
  type?: 'image' | 'video' | 'any'
}

export interface UploadedFile {
  id: string
  url: string
  name: string
  size: number
  type: string
}

export function FileUpload({
  accept,
  multiple = false,
  maxSize = 10,
  onUpload,
  uploadedFiles = [],
  onRemove,
  disabled = false,
  type = 'any'
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getAcceptString = () => {
    if (accept) return accept
    switch (type) {
      case 'image':
        return 'image/*'
      case 'video':
        return 'video/*'
      default:
        return ''
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'image':
        return <Image className="h-8 w-8" />
      case 'video':
        return <Video className="h-8 w-8" />
      default:
        return <Upload className="h-8 w-8" />
    }
  }

  const handleFiles = async (files: FileList) => {
    if (disabled || isUploading) return

    const validFiles: File[] = []
    const maxSizeBytes = maxSize * 1024 * 1024

    Array.from(files).forEach(file => {
      if (file.size > maxSizeBytes) {
        alert(`File ${file.name} is too large. Maximum size is ${maxSize}MB.`)
        return
      }
      validFiles.push(file)
    })

    if (validFiles.length === 0) return

    setIsUploading(true)
    try {
      await onUpload(validFiles)
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
          dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary/50'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="text-muted-foreground">
            {getIcon()}
          </div>
          <div>
            <p className="text-sm font-medium">
              {isUploading ? 'Uploading...' : `Drop ${type}s here or click to browse`}
            </p>
            <p className="text-xs text-muted-foreground">
              Maximum file size: {maxSize}MB
              {multiple && ' • Multiple files allowed'}
            </p>
          </div>
        </div>

        <Input
          ref={fileInputRef}
          type="file"
          accept={getAcceptString()}
          multiple={multiple}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
          disabled={disabled || isUploading}
        />
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Uploaded Files</p>
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {file.type.startsWith('image/') ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="h-10 w-10 object-cover rounded"
                    />
                  ) : (
                    <div className="h-10 w-10 bg-muted rounded flex items-center justify-center">
                      <Video className="h-4 w-4" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                {onRemove && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemove(file)}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}