"use client"

import { useEffect, useState } from "react"
import { Bot } from "lucide-react"

interface ChatTypingIndicatorProps {
  mode: "thinking" | "typing"
}

export function ChatTypingIndicator({ mode }: ChatTypingIndicatorProps) {
  const [dots, setDots] = useState(".")

  // Animate the dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return "."
        return prev + "."
      })
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="py-5 px-4 bg-muted/50 animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div className="container mx-auto max-w-3xl flex gap-4">
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-background shadow">
          <Bot className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="prose prose-sm dark:prose-invert">
            <div className="flex items-center">
              <span className="animate-pulse">{dots}</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      </div>
    </div>
  )
}
