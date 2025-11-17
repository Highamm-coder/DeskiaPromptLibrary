import { useQuery } from '@tanstack/react-query'
import { db } from '@/lib/supabase'
import { Category } from '@/types/database.types'
import { Loader2, Folder, Tag } from 'lucide-react'

interface SidebarProps {
  selectedCategory: string | null
  onCategoryChange: (categoryId: string | null) => void
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
}

export default function Sidebar({
  selectedCategory,
  onCategoryChange,
  selectedTags,
  onTagsChange,
}: SidebarProps) {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await db.categories.list()
      if (error) throw error
      return data || []
    },
  })

  // Mock popular tags - in real app, you'd fetch these from the database
  const popularTags = [
    'code-review',
    'documentation',
    'testing',
    'debugging',
    'refactoring',
    'api',
    'frontend',
    'backend',
  ]

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag))
    } else {
      onTagsChange([...selectedTags, tag])
    }
  }

  return (
    <aside className="w-64 bg-white border-r border-neutral-200 h-full overflow-y-auto">
      <div className="p-6 space-y-8">
        {/* Categories */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Folder className="w-5 h-5 text-neutral-500" />
            <h2 className="font-semibold text-neutral-900">Categories</h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 text-neutral-400 animate-spin" />
            </div>
          ) : (
            <div className="space-y-1">
              <button
                onClick={() => onCategoryChange(null)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedCategory === null
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                All Prompts
              </button>

              {categories?.map((category: Category) => (
                <button
                  key={category.id}
                  onClick={() => onCategoryChange(category.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                    selectedCategory === category.id
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  {category.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-5 h-5 text-neutral-500" />
            <h2 className="font-semibold text-neutral-900">Popular Tags</h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {popularTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-primary-500 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {selectedTags.length > 0 && (
            <button
              onClick={() => onTagsChange([])}
              className="mt-3 text-xs text-primary-600 hover:text-primary-700 font-medium"
            >
              Clear tags
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
