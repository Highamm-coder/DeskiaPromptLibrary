import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, FolderTree, ArrowLeft } from 'lucide-react'
import UserManagement from '@/components/admin/UserManagement'
import CategoryManagement from '@/components/admin/CategoryManagement'

type Tab = 'users' | 'categories'

export default function AdminPanel() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('users')

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-neutral-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">Admin Panel</h1>
                <p className="text-sm text-neutral-600">
                  Manage users, categories, and system settings
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6">
          <div className="flex gap-1 border-b border-neutral-200">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'users'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Users className="w-4 h-4" />
              User Management
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'categories'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <FolderTree className="w-4 h-4" />
              Category Management
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-6">
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'categories' && <CategoryManagement />}
      </main>
    </div>
  )
}
