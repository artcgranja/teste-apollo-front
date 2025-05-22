"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { login as apiLogin, logout as apiLogout, getToken } from "@/lib/api"
import { API_URL } from "@/lib/config"

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated on mount
    const token = getToken()
    setIsAuthenticated(!!token)
    setIsLoading(false)

    // Log API URL for debugging
    console.log("Auth Provider initialized with API URL:", API_URL)
  }, [])

  const login = async (username: string, password: string) => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("Attempting login with:", { username, apiUrl: API_URL })
      await apiLogin(username, password)
      setIsAuthenticated(true)
      router.push("/chat")
    } catch (error) {
      console.error("Login failed:", error)

      // Set a user-friendly error message
      if (error instanceof Error) {
        if (error.message.includes("Failed to fetch")) {
          setError(
            "Não foi possível conectar ao servidor. Verifique sua conexão com a internet ou tente novamente mais tarde.",
          )
        } else if (error.message.includes("422")) {
          setError("Formato de dados inválido. Verifique se o email e senha estão corretos.")
        } else {
          setError(`Erro ao fazer login: ${error.message}`)
        }
      } else {
        setError("Ocorreu um erro desconhecido durante o login.")
      }

      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    apiLogout()
    setIsAuthenticated(false)
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout, error }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
