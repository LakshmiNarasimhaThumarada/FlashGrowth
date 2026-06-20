import React, { createContext, useContext, useState, useEffect } from 'react'

export interface UserProfile {
  id: string
  email: string
  fullName: string | null
  avatarUrl: string | null
  role: 'USER' | 'ADMIN'
}

interface AuthContextType {
  user: UserProfile | null
  token: string | null
  loading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  login: (credential: string) => Promise<void>
  loginAdmin: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('flash_token'))
  const [loading, setLoading] = useState<boolean>(true)

  // Fetch profile when token is loaded
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (res.ok) {
          const profile = await res.json()
          setUser(profile)
        } else {
          // Token expired or invalid
          logout()
        }
      } catch (err) {
        console.error('[Profile Fetch Error]:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [token])

  const login = async (credential: string) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Login failed')

      localStorage.setItem('flash_token', data.token)
      setToken(data.token)
      setUser(data.user)
    } catch (err) {
      setLoading(false)
      throw err
    }
  }

  const loginAdmin = async (email: string, password: string) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/auth/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Invalid credentials')

      localStorage.setItem('flash_token', data.token)
      setToken(data.token)
      setUser(data.user)
    } catch (err) {
      setLoading(false)
      throw err
    }
  }

  const logout = () => {
    localStorage.removeItem('flash_token')
    setToken(null)
    setUser(null)
  }

  const isAuthenticated = !!user
  const isAdmin = user?.role === 'ADMIN'

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        loginAdmin,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
