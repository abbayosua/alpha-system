'use client'

import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { UserProfile, AuthState, LoginCredentials, RegisterData } from '@/types'

type AuthStore = AuthState & {
  // Actions
  login: (credentials: LoginCredentials) => Promise<{ error: string | null }>
  register: (data: RegisterData) => Promise<{ error: string | null }>
  logout: () => Promise<void>
  initializeAuth: () => Promise<void>
  setUser: (user: UserProfile | null) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async ({ email, password }: LoginCredentials) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error: error.message }
      }

      // After login, fetch the user's profile from the profiles table
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single()

        if (profile) {
          set({
            user: profile as UserProfile,
            isAuthenticated: true,
            isLoading: false,
          })
        }
      }

      return { error: null }
    } catch (err: any) {
      return { error: err?.message ?? 'An unexpected error occurred' }
    }
  },

  register: async ({ email, password, name, phone }: RegisterData) => {
    try {
      const supabase = createClient()

      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
          },
        },
      })

      if (error) {
        return { error: error.message }
      }

      // After signup, the profile is auto-created via a Supabase trigger or we
      // need to wait for confirmation. For now, set the user state.
      if (data.user) {
        // Try to fetch the profile (it may be auto-created by a trigger)
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()

        if (profile) {
          set({
            user: profile as UserProfile,
            isAuthenticated: true,
            isLoading: false,
          })
        }
      }

      return { error: null }
    } catch (err: any) {
      return { error: err?.message ?? 'An unexpected error occurred' }
    }
  },

  logout: async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    } catch (err) {
      console.error('Logout error:', err)
    }
  },

  initializeAuth: async () => {
    try {
      const supabase = createClient()

      // Check for existing session
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        // Fetch the user's profile from the profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profile) {
          set({
            user: profile as UserProfile,
            isAuthenticated: true,
            isLoading: false,
          })
        } else {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        })
      }

      // Listen for auth state changes
      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (profile) {
            set({
              user: profile as UserProfile,
              isAuthenticated: true,
              isLoading: false,
            })
          }
        } else {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      })
    } catch (err) {
      console.error('Auth initialization error:', err)
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  },

  setUser: (user: UserProfile | null) => {
    set({
      user,
      isAuthenticated: !!user,
      isLoading: false,
    })
  },
}))
