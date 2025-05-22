import { Chat } from "@/components/chat/chat"
import { RouteProtection } from "@/components/route-protection"

export default function ChatPage() {
  return (
    <RouteProtection>
      <Chat />
    </RouteProtection>
  )
}
