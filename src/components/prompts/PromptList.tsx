import { PromptWithDetails } from '@/types/database.types'
import PromptCard from './PromptCard'
import { Loader2, FileText } from 'lucide-react'

interface PromptListProps {
  prompts: PromptWithDetails[]
  isLoading: boolean
  onEdit: (prompt: PromptWithDetails) => void
  onRefresh: () => void
}

export default function PromptList({ prompts, isLoading, onEdit, onRefresh }: PromptListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading prompts...</p>
        </div>
      </div>
    )
  }

  if (!prompts || prompts.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <FileText className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 mb-2">
            No prompts found
          </h3>
          <p className="text-neutral-600">
            Try adjusting your filters or create a new prompt to get started.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {prompts.map((prompt) => (
        <PromptCard
          key={prompt.id}
          prompt={prompt}
          onEdit={onEdit}
          onDelete={onRefresh}
        />
      ))}
    </div>
  )
}
