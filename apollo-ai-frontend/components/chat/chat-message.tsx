import type { Message } from "@/types/chat"
import { cn } from "@/lib/utils"
import { Bot, User, FileText } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import ReactMarkdown from "react-markdown"
import { memo } from "react"

interface ChatMessageProps {
  message: Message
}

// Usando memo para evitar re-renderizações desnecessárias
export const ChatMessage = memo(function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"

  return (
    <div
      className={cn(
        "py-5 px-4 animate-in fade-in-50 duration-300 ease-in-out",
        isUser ? "bg-background" : "bg-muted/50",
      )}
    >
      <div className="container mx-auto max-w-3xl flex gap-4">
        {!isUser && (
          <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-background shadow">
            <Bot className="h-5 w-5" />
          </div>
        )}
        {isUser && (
          <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-background shadow">
            <User className="h-5 w-5" />
          </div>
        )}
        <div className="flex-1">
          <div className="prose prose-sm dark:prose-invert">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>

          {message.metadata?.source && (
            <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <FileText className="h-3 w-3" />
              <span>Fonte: {message.metadata.source}</span>
            </div>
          )}

          <div className="mt-2 text-xs text-muted-foreground">
            {format(new Date(message.createdAt), "HH:mm", { locale: ptBR })}
          </div>
        </div>
      </div>
    </div>
  )
})
