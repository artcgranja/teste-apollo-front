import Link from "next/link"
import { cn } from "@/lib/utils"

export function Footer() {
  return (
    <footer className="w-full border-t bg-background py-6">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-center text-sm text-muted-foreground md:text-left">
          &copy; {new Date().getFullYear()} Apollo AI. Todos os direitos reservados.
        </p>
        <div className="flex items-center gap-4">
          <Link href="/terms" className={cn("text-sm text-muted-foreground transition-colors hover:text-apollo-600")}>
            Termos de Uso
          </Link>
          <Link href="/privacy" className={cn("text-sm text-muted-foreground transition-colors hover:text-apollo-600")}>
            Política de Privacidade
          </Link>
        </div>
      </div>
    </footer>
  )
}
