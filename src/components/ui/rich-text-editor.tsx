import { Editor } from '@tinymce/tinymce-react'
import { useRef } from 'react'

interface RichTextEditorProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  height?: number
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start typing...',
  height = 400
}: RichTextEditorProps) {
  const editorRef = useRef<unknown>(null)

  return (
    <div className="border rounded-md overflow-hidden">
      <Editor
        apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
        onInit={(_evt, editor) => editorRef.current = editor}
        value={value}
        onEditorChange={(content) => onChange(content)}
        init={{
          height,
          menubar: false,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | help',
          content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif; font-size: 14px }',
          placeholder,
          branding: false,
          resize: false,
          statusbar: false,
          content_css: false,
          skin: 'oxide',
          content_css_cors: true
        }}
      />
    </div>
  )
}