export type MessageRole = "user" | "assistant" | "system"

export interface Message {
  id: string
  content: string
  role: MessageRole
  createdAt: Date
  metadata?: {
    subject?: string
    source?: string
  }
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}
