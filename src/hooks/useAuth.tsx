import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, auth as authHelpers } from '@/lib/supabase'
import { Profile, ProfileInsert } from '@/types/database.types'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: Error | null }>
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    authHelpers.getSession().then(({ session }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        await loadProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const loadProfile = async (userId: string) => {
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile load timeout')), 5000)
      )

      const loadPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      const { data, error } = await Promise.race([loadPromise, timeoutPromise]) as any

      if (error || !data) {
        console.error('Error loading profile:', error)
        // Try to create profile if it doesn't exist
        const user = (await supabase.auth.getUser()).data.user
        if (user) {
          console.log('Creating profile for user:', userId)
          const newProfileData: ProfileInsert = {
            id: userId,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || null,
            role: 'user',
          }
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            // @ts-ignore - Supabase type inference issue
            .insert(newProfileData)
            .select()
            .maybeSingle()

          if (createError) {
            console.error('Error creating profile:', createError)
            // Still set loading to false even on error
            setProfile(null)
          } else if (newProfile) {
            console.log('Profile created successfully')
            setProfile(newProfile)
          }
        }
      } else {
        console.log('Profile loaded successfully')
        setProfile(data)
      }
    } catch (error) {
      console.error('Error in loadProfile:', error)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await authHelpers.signIn(email, password)
      if (error) return { error }
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const { error } = await authHelpers.signUp(email, password, fullName)
      if (error) return { error }
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signOut = async () => {
    await authHelpers.signOut()
    setUser(null)
    setProfile(null)
    setSession(null)
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await authHelpers.resetPassword(email)
      if (error) return { error }
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await authHelpers.updatePassword(newPassword)
      if (error) return { error }
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    isAdmin: profile?.role === 'admin',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
