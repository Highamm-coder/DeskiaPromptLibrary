import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Auth helpers
export const auth = {
  signUp: async (email: string, password: string, fullName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })
    return { data, error }
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { data, error }
  },

  updatePassword: async (newPassword: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    return { data, error }
  },

  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },
}

// Database helpers
export const db = {
  profiles: {
    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()
      return { data, error }
    },

    getByEmail: async (email: string) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single()
      return { data, error }
    },

    update: async (id: string, updates: Partial<Database['public']['Tables']['profiles']['Update']>) => {
      const { data, error } = await supabase
        .from('profiles')
        // @ts-ignore - Supabase type inference issue
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      return { data, error }
    },

    list: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      return { data, error }
    },
  },

  categories: {
    list: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')
      return { data, error }
    },

    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single()
      return { data, error }
    },

    create: async (category: Database['public']['Tables']['categories']['Insert']) => {
      const { data, error } = await supabase
        .from('categories')
        // @ts-ignore - Supabase type inference issue
        .insert(category)
        .select()
        .single()
      return { data, error }
    },

    update: async (id: string, updates: Database['public']['Tables']['categories']['Update']) => {
      const { data, error } = await supabase
        .from('categories')
        // @ts-ignore - Supabase type inference issue
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      return { data, error }
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
      return { error }
    },
  },

  prompts: {
    list: async (filters?: {
      categoryId?: string
      search?: string
      isPublic?: boolean
      createdBy?: string
    }) => {
      let query = supabase
        .from('prompts')
        .select(`
          *,
          category:categories(*),
          profile:profiles(*)
        `)
        .order('created_at', { ascending: false })

      if (filters?.categoryId) {
        query = query.eq('category_id', filters.categoryId)
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,prompt_content.ilike.%${filters.search}%`)
      }

      if (filters?.isPublic !== undefined) {
        query = query.eq('is_public', filters.isPublic)
      }

      if (filters?.createdBy) {
        query = query.eq('created_by', filters.createdBy)
      }

      const { data, error } = await query
      return { data, error }
    },

    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('prompts')
        .select(`
          *,
          category:categories(*),
          profile:profiles(*)
        `)
        .eq('id', id)
        .single()
      return { data, error }
    },

    create: async (prompt: Database['public']['Tables']['prompts']['Insert']) => {
      const { data, error } = await supabase
        .from('prompts')
        // @ts-ignore - Supabase type inference issue
        .insert(prompt)
        .select(`
          *,
          category:categories(*),
          profile:profiles(*)
        `)
        .single()
      return { data, error }
    },

    update: async (id: string, updates: Database['public']['Tables']['prompts']['Update']) => {
      const { data, error } = await supabase
        .from('prompts')
        // @ts-ignore - Supabase type inference issue
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select(`
          *,
          category:categories(*),
          profile:profiles(*)
        `)
        .single()
      return { data, error }
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('id', id)
      return { error }
    },

    incrementUsage: async (id: string) => {
      // @ts-ignore - Supabase RPC type inference issue
      const { data, error } = await supabase.rpc('increment_usage_count', {
        prompt_id: id
      } as any)
      return { data, error }
    },
  },
}
