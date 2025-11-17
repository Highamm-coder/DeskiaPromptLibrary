import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { db } from '@/lib/supabase'
import { PromptWithDetails } from '@/types/database.types'
import { formatDate, truncateText, copyToClipboard } from '@/lib/utils'
import {
  Copy,
  Edit,
  Trash2,
  Calendar,
  User,
  TrendingUp,
  CheckCircle,
} from 'lucide-react'

interface PromptCardProps {
  prompt: PromptWithDetails
  onEdit: (prompt: PromptWithDetails) => void
  onDelete: () => void
}

export default function PromptCard({ prompt, onEdit, onDelete }: PromptCardProps) {
  const { profile, isAdmin } = useAuth()
  const [copied, setCopied] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const canEdit = profile?.id === prompt.created_by || isAdmin
  const canDelete = profile?.id === prompt.created_by || isAdmin

  const handleCopy = async () => {
    const success = await copyToClipboard(prompt.prompt_content)
    if (success) {
      setCopied(true)
      // Increment usage count
      await db.prompts.incrementUsage(prompt.id)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDelete = async () => {
    const { error } = await db.prompts.delete(prompt.id)
    if (!error) {
      onDelete()
    }
  }

  return (
    <div className="card p-6 relative group">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-neutral-900 mb-1">
            {prompt.title}
          </h3>
          {prompt.description && (
            <p className="text-sm text-neutral-600">
              {truncateText(prompt.description, 150)}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleCopy}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            title="Copy to clipboard"
          >
            {copied ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4 text-neutral-600" />
            )}
          </button>

          {canEdit && (
            <button
              onClick={() => onEdit(prompt)}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              title="Edit prompt"
            >
              <Edit className="w-4 h-4 text-neutral-600" />
            </button>
          )}

          {canDelete && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete prompt"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          )}
        </div>
      </div>

      {/* Category Badge */}
      {prompt.category && (
        <div className="mb-3">
          <span
            className="badge"
            style={{
              backgroundColor: `${prompt.category.color}20`,
              color: prompt.category.color,
            }}
          >
            {prompt.category.name}
          </span>
        </div>
      )}

      {/* Tags */}
      {prompt.tags && prompt.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {prompt.tags.slice(0, 5).map((tag, index) => (
            <span
              key={index}
              className="badge bg-neutral-100 text-neutral-700"
            >
              {tag}
            </span>
          ))}
          {prompt.tags.length > 5 && (
            <span className="badge bg-neutral-100 text-neutral-500">
              +{prompt.tags.length - 5} more
            </span>
          )}
        </div>
      )}

      {/* Prompt Preview */}
      <div className="mb-4 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
        <p className="text-sm text-neutral-700 font-mono whitespace-pre-wrap">
          {truncateText(prompt.prompt_content, 200)}
        </p>
      </div>

      {/* Meta Info */}
      <div className="flex items-center justify-between text-xs text-neutral-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            <span>{prompt.profile?.full_name || prompt.profile?.email}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(prompt.created_at)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{prompt.usage_count} uses</span>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              Delete Prompt
            </h3>
            <p className="text-neutral-600 mb-6">
              Are you sure you want to delete "{prompt.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
