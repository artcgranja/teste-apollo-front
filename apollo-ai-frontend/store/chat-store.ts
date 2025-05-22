import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Conversation, Message } from "@/types/chat"
import { createNewChat as apiCreateNewChat, askQuestion, getConversations, getConversationMessages } from "@/lib/api"

interface ChatState {
  conversations: Conversation[]
  activeConversationId: string | null
  isLoadingConversations: boolean
  isLoadingMessages: boolean
  isNewChatMode: boolean
  lastActiveConversationId: string | null
  isThinking: boolean
  isTyping: boolean
  typingMessage: string | null
  pendingMessageMetadata: {
    subject?: string
    source?: string
  } | null
  createNewConversation: () => Promise<string>
  fetchConversations: () => Promise<void>
  fetchConversationMessages: (conversationId: string) => Promise<void>
  setActiveConversation: (id: string) => void
  setNewChatMode: (isNewChat: boolean) => void
  resetActiveConversation: () => void
  addMessage: (conversationId: string, message: Message) => void
  sendMessage: (content: string) => Promise<void>
  completeTypingAnimation: () => void
  updateConversationTitle: (conversationId: string, title: string) => void
  deleteConversation: (conversationId: string) => void
  clearConversations: () => void
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeConversationId: null,
      lastActiveConversationId: null,
      isLoadingConversations: false,
      isLoadingMessages: false,
      isNewChatMode: true,
      isThinking: false,
      isTyping: false,
      typingMessage: null,
      pendingMessageMetadata: null,

      setNewChatMode: (isNewChat: boolean) => {
        set({ isNewChatMode: isNewChat })
      },

      resetActiveConversation: () => {
        set({
          activeConversationId: null,
          isNewChatMode: true,
          isThinking: false,
          isTyping: false,
          typingMessage: null,
          pendingMessageMetadata: null,
        })
      },

      fetchConversations: async () => {
        set({ isLoadingConversations: true })
        try {
          const apiConversations = await getConversations()
          const conversations: Conversation[] = apiConversations.map((conv) => ({
            id: conv.id.toString(),
            title: conv.name,
            messages: [],
            createdAt: new Date(conv.created_at),
            updatedAt: new Date(conv.updated_at),
          }))

          // Sort conversations by updatedAt in descending order (newest first)
          conversations.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())

          set({
            conversations,
            isLoadingConversations: false,
          })

          // Only set active conversation if not in new chat mode
          if (conversations.length > 0 && !get().isNewChatMode && !get().activeConversationId) {
            const { lastActiveConversationId } = get()

            // Try to set the last active conversation if it exists
            if (lastActiveConversationId && conversations.some((c) => c.id === lastActiveConversationId)) {
              get().setActiveConversation(lastActiveConversationId)
            }
            // Otherwise set the most recent conversation
            else {
              get().setActiveConversation(conversations[0].id)
            }
          }
        } catch (error) {
          console.error("Failed to fetch conversations:", error)
          set({ isLoadingConversations: false })
        }
      },

      fetchConversationMessages: async (conversationId: string) => {
        set({ isLoadingMessages: true })
        try {
          const apiMessages = await getConversationMessages(Number(conversationId))

          const messages: Message[] = apiMessages.map((msg) => ({
            id: msg.id.toString(),
            content: msg.message,
            role: msg.sender.toLowerCase() === "tutor" ? "assistant" : "user",
            createdAt: new Date(msg.created_at),
            metadata: msg.source
              ? {
                  source: msg.source,
                }
              : undefined,
          }))

          // Update the conversation with messages
          set((state) => ({
            conversations: state.conversations.map((conv) =>
              conv.id === conversationId ? { ...conv, messages } : conv,
            ),
            isLoadingMessages: false,
          }))
        } catch (error) {
          console.error(`Failed to fetch messages for conversation ${conversationId}:`, error)
          set({ isLoadingMessages: false })
        }
      },

      createNewConversation: async () => {
        try {
          console.log("Creating new conversation via API")
          const response = await apiCreateNewChat()
          console.log("API response for new chat:", response)

          const newId = response.id.toString()

          const newConversation: Conversation = {
            id: newId,
            title: "Nova conversa",
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          }

          // Atualiza o estado de forma simples e direta
          set({
            conversations: [newConversation, ...get().conversations],
            activeConversationId: newId,
            lastActiveConversationId: newId,
            isNewChatMode: false,
          })

          return newId
        } catch (error) {
          console.error("Failed to create new conversation:", error)

          // Cria uma conversa local como fallback
          const fallbackId = Date.now().toString()
          const fallbackConversation: Conversation = {
            id: fallbackId,
            title: "Nova conversa (offline)",
            messages: [
              {
                id: "welcome",
                content: "Olá! Sou Apollo, seu tutor AI. Como posso ajudar você hoje? (Modo offline)",
                role: "assistant",
                createdAt: new Date(),
              },
            ],
            createdAt: new Date(),
            updatedAt: new Date(),
          }

          set({
            conversations: [fallbackConversation, ...get().conversations],
            activeConversationId: fallbackId,
            lastActiveConversationId: fallbackId,
            isNewChatMode: false,
          })

          return fallbackId
        }
      },

      setActiveConversation: (id) => {
        set({
          activeConversationId: id,
          lastActiveConversationId: id,
          isNewChatMode: false,
        })

        // Fetch messages for this conversation if not already loaded
        const conversation = get().conversations.find((c) => c.id === id)
        if (conversation && conversation.messages.length === 0) {
          get().fetchConversationMessages(id)
        }
      },

      addMessage: (conversationId, message) => {
        set((state) => {
          const updatedConversations = state.conversations.map((conv) => {
            if (conv.id === conversationId) {
              // Update conversation title based on first user message if still default
              let title = conv.title
              if ((title === "Nova conversa" || title === "Nova conversa (offline)") && message.role === "user") {
                title = message.content.slice(0, 30) + (message.content.length > 30 ? "..." : "")
              }

              return {
                ...conv,
                messages: [...conv.messages, message],
                title,
                updatedAt: new Date(),
              }
            }
            return conv
          })

          return { conversations: updatedConversations }
        })
      },

      sendMessage: async (content: string) => {
        if (!content.trim()) return

        const { isNewChatMode, activeConversationId } = get()
        let conversationId = activeConversationId

        try {
          // Se estiver no modo de nova conversa, criar um novo chat
          if (isNewChatMode) {
            conversationId = await get().createNewConversation()
          }

          if (!conversationId) {
            throw new Error("No active conversation")
          }

          // Add user message immediately
          const userMessage: Message = {
            id: `user-${Date.now()}`,
            content,
            role: "user",
            createdAt: new Date(),
          }

          // Add user message to the UI
          get().addMessage(conversationId, userMessage)

          // Start thinking animation
          set({ isThinking: true })

          // Send message to API
          const response = await askQuestion(Number.parseInt(conversationId), content)

          // Switch from thinking to typing with the response
          set({
            isThinking: false,
            isTyping: true,
            typingMessage: response.answer,
            pendingMessageMetadata: {
              subject: response.subject,
              source: response.source,
            },
          })
        } catch (error) {
          console.error("Error sending message:", error)

          if (conversationId) {
            // Add error message
            const errorMessage: Message = {
              id: (Date.now() + 1).toString(),
              content: "Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.",
              role: "assistant",
              createdAt: new Date(),
            }

            get().addMessage(conversationId, errorMessage)
          }

          set({ isThinking: false, isTyping: false, typingMessage: null, pendingMessageMetadata: null })
        }
      },

      completeTypingAnimation: () => {
        const { activeConversationId, typingMessage, pendingMessageMetadata } = get()
        if (!activeConversationId || !typingMessage) return

        // Add the complete message
        const message: Message = {
          id: `assistant-${Date.now()}`,
          content: typingMessage,
          role: "assistant",
          createdAt: new Date(),
          metadata: pendingMessageMetadata || undefined,
        }

        get().addMessage(activeConversationId, message)

        // Reset typing state
        set({ isTyping: false, typingMessage: null, pendingMessageMetadata: null })
      },

      updateConversationTitle: (conversationId, title) => {
        set((state) => {
          const updatedConversations = state.conversations.map((conv) => {
            if (conv.id === conversationId) {
              return {
                ...conv,
                title,
                updatedAt: new Date(),
              }
            }
            return conv
          })

          return { conversations: updatedConversations }
        })
      },

      deleteConversation: (conversationId) => {
        set((state) => {
          const updatedConversations = state.conversations.filter((conv) => conv.id !== conversationId)

          // If we're deleting the active conversation, set a new active one
          let activeId = state.activeConversationId
          if (activeId === conversationId) {
            activeId = updatedConversations.length > 0 ? updatedConversations[0].id : null
          }

          return {
            conversations: updatedConversations,
            activeConversationId: activeId,
          }
        })
      },

      clearConversations: () => {
        set({ conversations: [], activeConversationId: null })
      },
    }),
    {
      name: "apollo-chat-storage",
      partialize: (state) => ({
        conversations: state.conversations,
        activeConversationId: state.activeConversationId,
        lastActiveConversationId: state.lastActiveConversationId,
      }),
    },
  ),
)
