export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'admin' | 'user'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: UserRole
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          color: string
          created_at: string
          created_by: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          color: string
          created_at?: string
          created_by: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          color?: string
          created_at?: string
          created_by?: string
        }
      }
      prompts: {
        Row: {
          id: string
          title: string
          description: string | null
          prompt_content: string
          category_id: string | null
          tags: string[]
          is_public: boolean
          created_by: string
          created_at: string
          updated_at: string
          usage_count: number
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          prompt_content: string
          category_id?: string | null
          tags?: string[]
          is_public?: boolean
          created_by: string
          created_at?: string
          updated_at?: string
          usage_count?: number
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          prompt_content?: string
          category_id?: string | null
          tags?: string[]
          is_public?: boolean
          created_by?: string
          created_at?: string
          updated_at?: string
          usage_count?: number
        }
      }
    }
  }
}

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Prompt = Database['public']['Tables']['prompts']['Row']

export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type CategoryInsert = Database['public']['Tables']['categories']['Insert']
export type PromptInsert = Database['public']['Tables']['prompts']['Insert']

export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type CategoryUpdate = Database['public']['Tables']['categories']['Update']
export type PromptUpdate = Database['public']['Tables']['prompts']['Update']

// Extended types with relations
export interface PromptWithDetails extends Prompt {
  category?: Category | null
  profile?: Profile
}

export interface CategoryWithCount extends Category {
  prompt_count?: number
}
