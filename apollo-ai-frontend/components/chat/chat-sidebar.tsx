"use client"
import { useChatStore } from "@/store/chat-store"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { PlusCircle, MessageSquare, Trash2, X, Loader2, Pencil } from "lucide-react"
import { API_URL } from "@/lib/config"

interface ChatSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function ChatSidebar({ isOpen, onClose }: ChatSidebarProps) {
  const {
    conversations,
    activeConversationId,
    setActiveConversation,
    deleteConversation,
    isLoadingConversations,
    resetActiveConversation,
  } = useChatStore()

  // Simplifique a função handleNewChat para criar uma nova conversa diretamente:
  const handleNewChat = async () => {
    // Criar uma nova conversa diretamente
    await useChatStore.getState().createNewConversation()

    // Fechar o sidebar em dispositivos móveis
    if (window.innerWidth < 768) {
      onClose()
    }
  }

  const handleSelectConversation = (id: string) => {
    setActiveConversation(id)
    if (window.innerWidth < 768) {
      onClose()
    }
  }

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-20 flex w-80 flex-col border-r bg-background transition-transform duration-300 md:static",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
      )}
    >
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-lg font-semibold">Conversas</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="p-4">
        <Button onClick={handleNewChat} className="w-full justify-start gap-2 bg-apollo-600 hover:bg-apollo-700">
          <PlusCircle className="h-5 w-5" />
          Nova conversa
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-2 p-2">
          {isLoadingConversations ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-apollo-600" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="py-4 text-center text-sm text-muted-foreground">Nenhuma conversa encontrada</div>
          ) : (
            conversations.map((conversation) => (
              <div key={conversation.id} className="group relative">
                <button
                  onClick={() => handleSelectConversation(conversation.id)}
                  className={cn(
                    "w-full flex items-center rounded-md px-3 py-2 text-left text-xs transition-colors hover:bg-accent",
                    activeConversationId === conversation.id
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  <div className="flex items-center gap-2 w-full min-w-0">
                    <MessageSquare className="h-3 w-3 shrink-0" />
                    <span className="truncate">{conversation.title}</span>
                  </div>
                </button>

                {/* Overlay apenas no lado direito */}
                <div className="absolute right-0 top-0 bottom-0 w-16 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity rounded-r-md pr-1">
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 bg-background/90 hover:bg-background"
                      onClick={(e) => {
                        e.stopPropagation()
                        // Editar nome da conversa
                        const newTitle = prompt("Renomear conversa:", conversation.title)
                        if (newTitle && newTitle.trim()) {
                          // Chamar API para atualizar nome da conversa
                          fetch(`${API_URL}/tutor/conversations/${conversation.id}`, {
                            method: "PUT",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${localStorage.getItem("apollo_token")}`,
                            },
                            body: JSON.stringify({ name: newTitle.trim() }),
                          })
                            .then((response) => {
                              if (response.ok) {
                                // Atualizar estado local
                                useChatStore.getState().updateConversationTitle(conversation.id, newTitle.trim())
                              }
                            })
                            .catch((error) => console.error("Erro ao renomear conversa:", error))
                        }
                      }}
                    >
                      <Pencil className="h-3 w-3" />
                      <span className="sr-only">Renomear</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 bg-background/90 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900 dark:hover:text-red-400"
                      onClick={(e) => {
                        e.stopPropagation()
                        // Confirmar antes de excluir
                        if (confirm("Tem certeza que deseja excluir esta conversa?")) {
                          // Chamar API para excluir conversa
                          fetch(`${API_URL}/tutor/conversations/${conversation.id}`, {
                            method: "DELETE",
                            headers: {
                              Authorization: `Bearer ${localStorage.getItem("apollo_token")}`,
                            },
                          })
                            .then((response) => {
                              if (response.ok) {
                                // Atualizar estado local
                                deleteConversation(conversation.id)
                              }
                            })
                            .catch((error) => console.error("Erro ao excluir conversa:", error))
                        }
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                      <span className="sr-only">Excluir</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
