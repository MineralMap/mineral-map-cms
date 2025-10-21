import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { faqService } from '@/services/database'
import type { FAQ } from '@/types/database'
import { Plus, Edit, Trash2, HelpCircle } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

export default function FAQPage() {
  const navigate = useNavigate()
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const data = await faqService.getAll()
      setFaqs(data)
    } catch (error) {
      console.error('Error loading FAQs:', error)
      toast.error('Failed to load FAQs')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string, question: string) => {
    if (!confirm(`Are you sure you want to delete "${question}"?`)) return

    try {
      await faqService.delete(id)
      setFaqs(prev => prev.filter(f => f.id !== id))
      toast.success('FAQ deleted')
    } catch (error) {
      console.error('Error deleting FAQ:', error)
      toast.error('Failed to delete FAQ')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-12 w-64 loading-pulse rounded"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 loading-pulse rounded-xl"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold">FAQ Management</h1>
          <p className="text-xl text-muted-foreground mt-2">
            Manage frequently asked questions ({faqs.length} {faqs.length === 1 ? 'question' : 'questions'})
          </p>
        </div>
        <Button onClick={() => navigate('/faq/new')} className="gradient-bg">
          <Plus className="mr-2 h-4 w-4" />
          Add FAQ
        </Button>
      </div>

      {faqs.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No FAQs yet</h3>
            <p className="text-muted-foreground mb-4">
              Get started by adding your first frequently asked question.
            </p>
            <Button onClick={() => navigate('/faq/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Add FAQ
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {faqs.map((faq) => (
            <Card key={faq.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                        #{faq.display_order}
                      </span>
                      <CardTitle className="text-lg">{faq.question}</CardTitle>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Updated {format(new Date(faq.updated_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/faq/${faq.id}/edit`)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleDelete(faq.id, faq.question)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div
                  className="text-sm text-muted-foreground line-clamp-3"
                  dangerouslySetInnerHTML={{ __html: faq.answer.substring(0, 200) + '...' }}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
