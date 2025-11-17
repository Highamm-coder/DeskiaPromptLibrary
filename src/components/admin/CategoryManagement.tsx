import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'
import { db } from '@/lib/supabase'
import { Category } from '@/types/database.types'
import { Plus, Edit, Trash2, Folder, Loader2, X, AlertCircle } from 'lucide-react'

const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color'),
})

type CategoryFormData = z.infer<typeof categorySchema>

export default function CategoryManagement() {
  const { profile } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: categories, isLoading, refetch } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const { data, error } = await db.categories.list()
      if (error) throw error
      return data || []
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      color: '#FF6B35',
    },
  })

  const openCreateModal = () => {
    setEditingCategory(null)
    reset({
      name: '',
      description: '',
      color: '#FF6B35',
    })
    setShowModal(true)
  }

  const openEditModal = (category: Category) => {
    setEditingCategory(category)
    reset({
      name: category.name,
      description: category.description || '',
      color: category.color,
    })
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingCategory(null)
    setError(null)
    reset()
  }

  const onSubmit = async (data: CategoryFormData) => {
    if (!profile) return

    setLoading(true)
    setError(null)

    try {
      if (editingCategory) {
        const { error } = await db.categories.update(editingCategory.id, data)
        if (error) throw error
      } else {
        const { error } = await db.categories.create({
          ...data,
          created_by: profile.id,
        })
        if (error) throw error
      }

      refetch()
      handleCloseModal()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await db.categories.delete(categoryId)
      if (!error) {
        refetch()
      }
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading categories...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 mb-1">Categories</h2>
          <p className="text-sm text-neutral-600">
            Organize prompts with custom categories
          </p>
        </div>
        <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories?.map((category: Category) => (
          <div
            key={category.id}
            className="p-4 border border-neutral-200 rounded-lg hover:border-neutral-300 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  <Folder className="w-5 h-5" style={{ color: category.color }} />
                </div>
                <div>
                  <h3 className="font-medium text-neutral-900">{category.name}</h3>
                  {category.description && (
                    <p className="text-xs text-neutral-600 mt-1">
                      {category.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => openEditModal(category)}
                className="flex-1 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit
              </button>
              <button
                onClick={() => handleDelete(category.id)}
                className="flex-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {categories && categories.length === 0 && (
        <div className="text-center py-8">
          <Folder className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
          <p className="text-neutral-600">No categories yet</p>
          <button onClick={openCreateModal} className="mt-4 btn-primary">
            Create your first category
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <h2 className="text-xl font-bold text-neutral-900">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-neutral-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
                  Name *
                </label>
                <input
                  {...register('name')}
                  type="text"
                  id="name"
                  className="input-field"
                  placeholder="e.g., Code Review"
                  disabled={loading}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
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
                  placeholder="Brief description of this category..."
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="color" className="block text-sm font-medium text-neutral-700 mb-2">
                  Color *
                </label>
                <div className="flex gap-3">
                  <input
                    {...register('color')}
                    type="color"
                    id="color"
                    className="w-16 h-10 rounded-lg border border-neutral-300 cursor-pointer"
                    disabled={loading}
                  />
                  <input
                    {...register('color')}
                    type="text"
                    className="input-field flex-1"
                    placeholder="#FF6B35"
                    disabled={loading}
                  />
                </div>
                {errors.color && (
                  <p className="mt-1 text-sm text-red-600">{errors.color.message}</p>
                )}
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn-secondary flex-1"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
