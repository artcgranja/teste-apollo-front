"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Menu, X, LogOut, LogIn } from "lucide-react"
import { useState } from "react"
import { useMobile } from "@/hooks/use-mobile"
import { useAuth } from "@/contexts/auth-context"

// Define navigation items for authenticated users
const authenticatedNavItems = [
  { name: "Chat", href: "/chat" },
  { name: "Arquivos", href: "/upload" },
  { name: "Gerador de Provas", href: "/exams" },
  { name: "Provas", href: "/provas" },
  { name: "Resultados", href: "/results" },
]

// Define navigation items for unauthenticated users
const unauthenticatedNavItems = [{ name: "Início", href: "/" }]

export function Navbar() {
  const pathname = usePathname()
  const isMobile = useMobile()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isAuthenticated, logout } = useAuth()

  // Choose which nav items to display based on authentication status
  const navItems = isAuthenticated ? authenticatedNavItems : unauthenticatedNavItems

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href={isAuthenticated ? "/chat" : "/"} className="flex items-center gap-2">
          <Image src="/images/logo.png" alt="Apollo AI Logo" width={40} height={40} className="h-10 w-auto" />
          <span className="text-xl font-bold">Apollo AI</span>
        </Link>

        {isMobile ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </Button>

            {isMenuOpen && (
              <div className="fixed inset-0 top-16 z-50 bg-background p-4">
                <nav className="flex flex-col space-y-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={cn(
                        "text-lg font-medium transition-colors hover:text-apollo-600",
                        pathname === item.href ? "text-apollo-600" : "text-muted-foreground",
                      )}
                    >
                      {item.name}
                    </Link>
                  ))}

                  {!isAuthenticated && (
                    <Link
                      href="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className={cn(
                        "text-lg font-medium transition-colors hover:text-apollo-600",
                        pathname === "/login" ? "text-apollo-600" : "text-muted-foreground",
                      )}
                    >
                      Entrar
                    </Link>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <ThemeToggle />
                    {isAuthenticated ? (
                      <Button variant="ghost" size="sm" onClick={logout} className="gap-2 text-red-500">
                        <LogOut className="h-4 w-4" />
                        Sair
                      </Button>
                    ) : null}
                  </div>
                </nav>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-apollo-600",
                    pathname === item.href ? "text-apollo-600" : "text-muted-foreground",
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
            <ThemeToggle />
            {isAuthenticated ? (
              <Button variant="ghost" size="sm" onClick={logout} className="gap-2">
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            ) : (
              <Button asChild variant="default" size="sm" className="gap-2 bg-apollo-600 hover:bg-apollo-700">
                <Link href="/login">
                  <LogIn className="h-4 w-4" />
                  Entrar
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
