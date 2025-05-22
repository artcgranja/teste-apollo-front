"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useChatStore } from "@/store/chat-store"
import { ChatSidebar } from "./chat-sidebar"
import { ChatMessage } from "./chat-message"
import { ChatInput } from "./chat-input"
import { ChatWelcome } from "./chat-welcome"
import { ChatTypingIndicator } from "./chat-typing-indicator"
import { ChatTypingAnimation } from "./chat-typing-animation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Menu, PlusCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

export function Chat() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  const {
    conversations,
    activeConversationId,
    isNewChatMode,
    sendMessage,
    fetchConversations,
    isLoadingConversations,
    setActiveConversation,
    isThinking,
    isTyping,
    typingMessage,
    completeTypingAnimation,
    resetActiveConversation,
  } = useChatStore()

  // Get the active conversation
  const activeConversation = conversations.find((conv) => conv.id === activeConversationId)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  // Fetch conversations when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations()

      // Only load the last active conversation if we're not explicitly in new chat mode
      if (conversations.length > 0 && !isNewChatMode && activeConversationId === null) {
        const lastActiveId = useChatStore.getState().lastActiveConversationId

        if (lastActiveId && conversations.some((c) => c.id === lastActiveId)) {
          setActiveConversation(lastActiveId)
        } else {
          // If no last active conversation or it doesn't exist anymore, use the most recent one
          setActiveConversation(conversations[0].id)
        }
      }
    }
  }, [
    isAuthenticated,
    fetchConversations,
    conversations.length,
    isNewChatMode,
    activeConversationId,
    setActiveConversation,
  ])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (activeConversation?.messages?.length || isThinking || isTyping) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [activeConversation?.messages, isThinking, isTyping])

  // Memoize the handleSendMessage function to prevent unnecessary re-renders
  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return

      setIsLoading(true)
      try {
        await sendMessage(content)
      } finally {
        setIsLoading(false)
      }
    },
    [isLoading, sendMessage],
  )

  // Memoize the handleExampleClick function
  const handleExampleClick = useCallback(
    (example: string) => {
      handleSendMessage(example)
    },
    [handleSendMessage],
  )

  // Memoize the handleNewChat function
  const handleNewChat = useCallback(async () => {
    // Criar uma nova conversa diretamente
    await useChatStore.getState().createNewConversation()
  }, [])

  // Limpar a animação quando o usuário sair da página
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isTyping) {
        completeTypingAnimation()
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [isTyping, completeTypingAnimation])

  if (!isAuthenticated) {
    return null // Don't render anything while redirecting
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      <ChatSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
            <h1 className="text-xl font-semibold">
              {isNewChatMode ? "Nova conversa" : activeConversation?.title || ""}
            </h1>
          </div>
          <Button variant="ghost" size="sm" className="gap-2" onClick={handleNewChat}>
            <PlusCircle className="h-4 w-4" />
            Nova conversa
          </Button>
        </div>

        <ScrollArea className="flex-1">
          {isNewChatMode || !activeConversation || activeConversation.messages.length === 0 ? (
            <div className="animate-in fade-in slide-in-from-bottom-5 duration-300 ease-in-out">
              <ChatWelcome onExampleClick={handleExampleClick} />
            </div>
          ) : (
            <div className="divide-y animate-in fade-in zoom-in-95 duration-300 ease-in-out">
              {activeConversation.messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isThinking && <ChatTypingIndicator mode="thinking" />}
              {isTyping && typingMessage && (
                <ChatTypingAnimation
                  key={`typing-${activeConversationId}`}
                  message={typingMessage}
                  onComplete={completeTypingAnimation}
                />
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </ScrollArea>

        <div className="border-t bg-background p-4">
          <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Apollo AI responde com base nos documentos carregados pela instituição.
          </p>
        </div>
      </div>
    </div>
  )
}
