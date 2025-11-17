import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getInitials } from '@/lib/utils'
import { Search, Plus, LogOut, User, Settings, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface HeaderProps {
  onSearchChange: (value: string) => void
  onCreatePrompt: () => void
}

export default function Header({ onSearchChange, onCreatePrompt }: HeaderProps) {
  const { profile, signOut, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-neutral-900">Deksia</h1>
              <p className="text-xs text-neutral-500">Prompt Library</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search prompts..."
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={onCreatePrompt}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Prompt
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-10 h-10 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-medium hover:bg-primary-200 transition-colors"
              >
                {profile && getInitials(profile.full_name || profile.email)}
              </button>

              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-neutral-200 py-2 z-20">
                    <div className="px-4 py-3 border-b border-neutral-200">
                      <p className="font-medium text-neutral-900">
                        {profile?.full_name || 'User'}
                      </p>
                      <p className="text-sm text-neutral-500">{profile?.email}</p>
                      {isAdmin && (
                        <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium">
                          <Shield className="w-3 h-3" />
                          Admin
                        </span>
                      )}
                    </div>

                    <div className="py-2">
                      <button
                        className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                        onClick={() => {
                          setShowUserMenu(false)
                          // Navigate to profile
                        }}
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </button>

                      <button
                        className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                        onClick={() => {
                          setShowUserMenu(false)
                          // Navigate to settings
                        }}
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </button>

                      {isAdmin && (
                        <button
                          className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                          onClick={() => {
                            setShowUserMenu(false)
                            navigate('/admin')
                          }}
                        >
                          <Shield className="w-4 h-4" />
                          Admin Panel
                        </button>
                      )}
                    </div>

                    <div className="border-t border-neutral-200 pt-2">
                      <button
                        onClick={handleSignOut}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
