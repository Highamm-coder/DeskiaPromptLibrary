import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { db } from '@/lib/supabase'
import Header from '@/components/dashboard/Header'
import Sidebar from '@/components/dashboard/Sidebar'
import PromptList from '@/components/prompts/PromptList'
import PromptModal from '@/components/prompts/PromptModal'
import { PromptWithDetails } from '@/types/database.types'

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<PromptWithDetails | null>(null)

  const { data: prompts, isLoading, refetch } = useQuery({
    queryKey: ['prompts', selectedCategory, searchQuery],
    queryFn: async () => {
      const { data, error } = await db.prompts.list({
        categoryId: selectedCategory || undefined,
        search: searchQuery || undefined,
      })
      if (error) throw error
      return (data || []) as PromptWithDetails[]
    },
  })

  // Filter by tags on the client side
  const filteredPrompts = prompts?.filter(prompt => {
    if (selectedTags.length === 0) return true
    return selectedTags.some(tag => prompt.tags?.includes(tag))
  })

  const handleCreatePrompt = () => {
    setEditingPrompt(null)
    setShowCreateModal(true)
  }

  const handleEditPrompt = (prompt: PromptWithDetails) => {
    setEditingPrompt(prompt)
    setShowCreateModal(true)
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
    setEditingPrompt(null)
    refetch()
  }

  return (
    <div className="h-screen flex flex-col">
      <Header
        onSearchChange={setSearchQuery}
        onCreatePrompt={handleCreatePrompt}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedTags={selectedTags}
          onTagsChange={setSelectedTags}
        />

        <main className="flex-1 overflow-y-auto bg-neutral-50">
          <div className="p-6">
            <PromptList
              prompts={filteredPrompts || []}
              isLoading={isLoading}
              onEdit={handleEditPrompt}
              onRefresh={refetch}
            />
          </div>
        </main>
      </div>

      {showCreateModal && (
        <PromptModal
          prompt={editingPrompt}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}
