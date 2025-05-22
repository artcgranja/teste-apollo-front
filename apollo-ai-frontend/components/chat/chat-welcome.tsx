"use client"

import { Button } from "@/components/ui/button"
import { BookOpen, FileUp, MessageSquare } from "lucide-react"

interface ChatWelcomeProps {
  onExampleClick: (example: string) => void
}

export function ChatWelcome({ onExampleClick }: ChatWelcomeProps) {
  const examples = [
    "Explique o teorema de Pitágoras de forma simples.",
    "Quais são os principais eventos da Revolução Francesa?",
    "Como funciona a fotossíntese nas plantas?",
  ]

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-10 text-center">
      <div className="mb-4 rounded-full bg-apollo-100 p-3 dark:bg-apollo-900 animate-in fade-in-50 zoom-in-105 duration-500">
        <MessageSquare className="h-8 w-8 text-apollo-600" />
      </div>
      <h2 className="mb-2 text-2xl font-bold animate-in fade-in slide-in-from-bottom-3 duration-500 delay-100">
        Converse com Apollo AI
      </h2>
      <p className="mb-8 text-muted-foreground animate-in fade-in slide-in-from-bottom-3 duration-500 delay-200">
        Faça perguntas sobre o conteúdo dos documentos carregados e receba respostas precisas baseadas em fontes
        confiáveis.
      </p>

      <div className="mb-8 grid w-full gap-4 sm:grid-cols-2 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-300">
        <div className="flex flex-col items-center gap-2 rounded-lg border bg-card p-4 text-card-foreground shadow-sm hover:shadow-md transition-shadow">
          <BookOpen className="h-6 w-6 text-apollo-600" />
          <h3 className="text-lg font-medium">Conhecimento Confiável</h3>
          <p className="text-sm text-muted-foreground">
            Respostas baseadas apenas nos documentos fornecidos pela instituição.
          </p>
        </div>
        <div className="flex flex-col items-center gap-2 rounded-lg border bg-card p-4 text-card-foreground shadow-sm hover:shadow-md transition-shadow">
          <FileUp className="h-6 w-6 text-apollo-600" />
          <h3 className="text-lg font-medium">Documentos Personalizados</h3>
          <p className="text-sm text-muted-foreground">
            Carregue materiais específicos para obter respostas mais relevantes.
          </p>
        </div>
      </div>

      <div className="w-full animate-in fade-in slide-in-from-bottom-3 duration-500 delay-400">
        <h3 className="mb-3 text-sm font-medium">Experimente perguntar:</h3>
        <div className="flex flex-col gap-2">
          {examples.map((example, index) => (
            <Button
              key={index}
              variant="outline"
              className="justify-start text-left transition-all hover:bg-apollo-50 hover:text-apollo-600 dark:hover:bg-apollo-900 dark:hover:text-apollo-400"
              onClick={() => onExampleClick(example)}
            >
              {example}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
