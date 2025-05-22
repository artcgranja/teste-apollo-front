"use client"

import { useEffect, useState } from "react"
import { Bot } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import ReactMarkdown from "react-markdown"

interface ChatTypingAnimationProps {
  message: string
  onComplete: () => void
  typingSpeed?: number
}

export function ChatTypingAnimation({ message, onComplete, typingSpeed = 10 }: ChatTypingAnimationProps) {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null

    if (currentIndex < message.length) {
      timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + message[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, typingSpeed)

      return () => {
        if (timeout) clearTimeout(timeout)
      }
    } else {
      onComplete()
    }

    // Limpar o timeout quando o componente for desmontado
    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [currentIndex, message, onComplete, typingSpeed])

  return (
    <div className="py-5 px-4 bg-muted/50 animate-in fade-in-50 duration-200">
      <div className="container mx-auto max-w-3xl flex gap-4">
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-background shadow">
          <Bot className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="prose prose-sm dark:prose-invert">
            <ReactMarkdown>{displayedText}</ReactMarkdown>
            <span className="animate-pulse">|</span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">{format(new Date(), "HH:mm", { locale: ptBR })}</div>
        </div>
      </div>
    </div>
  )
}
