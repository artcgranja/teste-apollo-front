"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"
import Link from "next/link"
import { API_URL } from "@/lib/config"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { login, isLoading, error: authError } = useAuth()

  // Display auth context errors
  useEffect(() => {
    if (authError) {
      setError(authError)
    }
  }, [authError])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Basic validation
    if (!username || !password) {
      setError("Por favor, preencha todos os campos.")
      return
    }

    try {
      console.log("Submitting login form with credentials:", { username, password })
      await login(username, password)
    } catch (err) {
      // Error is already handled in the auth context
      console.error("Login form error:", err)
    }
  }

  return (
    <div className="container flex h-[calc(100vh-8rem)] items-center justify-center">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center">
            <Image src="/images/logo.png" alt="Apollo AI Logo" width={80} height={80} className="h-20 w-auto" />
          </div>
          <CardTitle className="text-2xl">Entrar no Apollo AI</CardTitle>
          <CardDescription>Digite suas credenciais para acessar a plataforma</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Email</Label>
              <Input
                id="username"
                type="email"
                placeholder="seu@email.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <Link href="/forgot-password" className="text-xs text-apollo-600 hover:underline">
                  Esqueceu a senha?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Debug info */}
            <div className="rounded-md bg-gray-100 p-2 text-xs dark:bg-gray-800">
              <p>API URL: {API_URL}</p>
              <p>Form Data Format: username={username}, password=******</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full bg-apollo-600 hover:bg-apollo-700" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
