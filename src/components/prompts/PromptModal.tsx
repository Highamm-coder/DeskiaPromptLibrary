import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { db } from '@/lib/supabase'
import { PromptWithDetails } from '@/types/database.types'
import { X, Save, Eye, AlertCircle } from 'lucide-react'

const promptSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  prompt_content: z.string().min(10, 'Prompt content must be at least 10 characters'),
  category_id: z.string().nullable(),
  tags: z.string(),
  is_public: z.boolean(),
})

type PromptFormData = z.infer<typeof promptSchema>

interface PromptModalProps {
  prompt?: PromptWithDetails | null
  onClose: () => void
}

export default function PromptModal({ prompt, onClose }: PromptModalProps) {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await db.categories.list()
      if (error) throw error
      return data || []
    },
  })

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PromptFormData>({
    resolver: zodResolver(promptSchema),
    defaultValues: {
      title: prompt?.title || '',
      description: prompt?.description || '',
      prompt_content: prompt?.prompt_content || '',
      category_id: prompt?.category_id || null,
      tags: prompt?.tags?.join(', ') || '',
      is_public: prompt?.is_public ?? true,
    },
  })

  const formData = watch()

  const onSubmit = async (data: PromptFormData) => {
    if (!profile) return

    setLoading(true)
    setError(null)

    try {
      const tags = data.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      const promptData = {
        title: data.title,
        description: data.description || null,
        prompt_content: data.prompt_content,
        category_id: data.category_id || null,
        tags,
        is_public: data.is_public,
        created_by: profile.id,
      }

      if (prompt) {
        // Update existing prompt
        const { error } = await db.prompts.update(prompt.id, promptData)
        if (error) throw error
      } else {
        // Create new prompt
        const { error } = await db.prompts.create(promptData)
        if (error) throw error
      }

      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <h2 className="text-2xl font-bold text-neutral-900">
            {prompt ? 'Edit Prompt' : 'Create New Prompt'}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="btn-secondary flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              {showPreview ? 'Edit' : 'Preview'}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-neutral-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {showPreview ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  {formData.title || 'Untitled Prompt'}
                </h3>
                {formData.description && (
                  <p className="text-neutral-600">{formData.description}</p>
                )}
              </div>

              <div>
                <h4 className="text-sm font-medium text-neutral-700 mb-2">Prompt Content</h4>
                <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                  <pre className="text-sm text-neutral-900 font-mono whitespace-pre-wrap">
                    {formData.prompt_content || 'No content yet...'}
                  </pre>
                </div>
              </div>

              {formData.tags && (
                <div>
                  <h4 className="text-sm font-medium text-neutral-700 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags
                      .split(',')
                      .map(tag => tag.trim())
                      .filter(tag => tag.length > 0)
                      .map((tag, index) => (
                        <span key={index} className="badge bg-neutral-100 text-neutral-700">
                          {tag}
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-2">
                  Title *
                </label>
                <input
                  {...register('title')}
                  type="text"
                  id="title"
                  className="input-field"
                  placeholder="e.g., Code Review Assistant"
                  disabled={loading}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-2">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  id="description"
                  rows={3}
                  className="input-field resize-none"
                  placeholder="Brief description of what this prompt does..."
                  disabled={loading}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="prompt_content" className="block text-sm font-medium text-neutral-700 mb-2">
                  Prompt Content *
                </label>
                <textarea
                  {...register('prompt_content')}
                  id="prompt_content"
                  rows={10}
                  className="input-field resize-none font-mono text-sm"
                  placeholder="Enter your prompt content here..."
                  disabled={loading}
                />
                {errors.prompt_content && (
                  <p className="mt-1 text-sm text-red-600">{errors.prompt_content.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label htmlFor="category_id" className="block text-sm font-medium text-neutral-700 mb-2">
                    Category
                  </label>
                  <select
                    {...register('category_id')}
                    id="category_id"
                    className="input-field"
                    disabled={loading}
                  >
                    <option value="">No category</option>
                    {categories?.map((category: any) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-neutral-700 mb-2">
                    Tags
                  </label>
                  <input
                    {...register('tags')}
                    type="text"
                    id="tags"
                    className="input-field"
                    placeholder="code, review, javascript"
                    disabled={loading}
                  />
                  <p className="mt-1 text-xs text-neutral-500">Separate tags with commas</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  {...register('is_public')}
                  type="checkbox"
                  id="is_public"
                  className="w-4 h-4 text-primary-500 border-neutral-300 rounded focus:ring-primary-500"
                  disabled={loading}
                />
                <label htmlFor="is_public" className="text-sm text-neutral-700">
                  Make this prompt public (visible to all team members)
                </label>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Footer */}
        {!showPreview && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit(onSubmit)}
              className="btn-primary flex items-center gap-2"
              disabled={loading}
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : prompt ? 'Update Prompt' : 'Create Prompt'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
