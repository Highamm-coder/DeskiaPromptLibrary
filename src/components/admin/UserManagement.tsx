import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { db } from '@/lib/supabase'
import { Profile } from '@/types/database.types'
import { formatDate, getInitials } from '@/lib/utils'
import { Shield, User, Mail, Calendar, Loader2 } from 'lucide-react'

export default function UserManagement() {
  const [updatingUser, setUpdatingUser] = useState<string | null>(null)

  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await db.profiles.list()
      if (error) throw error
      return data || []
    },
  })

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'user') => {
    setUpdatingUser(userId)
    try {
      const { error } = await db.profiles.update(userId, { role: newRole })
      if (!error) {
        refetch()
      }
    } catch (error) {
      console.error('Error updating role:', error)
    } finally {
      setUpdatingUser(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-1">Team Members</h2>
        <p className="text-sm text-neutral-600">
          Manage user roles and permissions
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="text-left py-3 px-4 text-sm font-medium text-neutral-700">
                User
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-neutral-700">
                Email
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-neutral-700">
                Role
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-neutral-700">
                Joined
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-neutral-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user: Profile) => (
              <tr key={user.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-medium">
                      {getInitials(user.full_name || user.email)}
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">
                        {user.full_name || 'No name'}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2 text-neutral-600">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  {user.role === 'admin' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                      <Shield className="w-3 h-3" />
                      Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-100 text-neutral-700 rounded-full text-xs font-medium">
                      <User className="w-3 h-3" />
                      User
                    </span>
                  )}
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2 text-neutral-600">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{formatDate(user.created_at)}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value as 'admin' | 'user')}
                    disabled={updatingUser === user.id}
                    className="text-sm border border-neutral-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users && users.length === 0 && (
        <div className="text-center py-8">
          <User className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
          <p className="text-neutral-600">No users found</p>
        </div>
      )}
    </div>
  )
}
