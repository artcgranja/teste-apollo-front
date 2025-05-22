"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

interface RouteProtectionProps {
  children: React.ReactNode
}

export function RouteProtection({ children }: RouteProtectionProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  // Don't render anything while checking authentication
  if (isLoading) {
    return null
  }

  // If not authenticated, don't render the children
  if (!isAuthenticated) {
    return null
  }

  // If authenticated, render the children
  return <>{children}</>
}
