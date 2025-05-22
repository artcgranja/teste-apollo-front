import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { BookOpen, MessageSquare, FileUp, FileCheck, Award, LogIn } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-apollo-50 to-white py-20 dark:from-apollo-950 dark:to-background">
        <div className="container flex flex-col items-center gap-8 text-center">
          <div className="flex flex-col items-center">
            <Image
              src="/images/logo.png"
              alt="Apollo AI Logo"
              width={120}
              height={120}
              className="h-32 w-auto"
              priority
            />
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              <span className="text-apollo-600 dark:text-apollo-400">Apollo AI</span>
            </h1>
            <p className="mt-2 text-xl text-apollo-500 dark:text-apollo-300">CLARITY. KNOWLEDGE. APOLLO.</p>
          </div>
          <p className="max-w-2xl text-xl text-muted-foreground">
            Um tutor especializado e customizável para escolas e faculdades, baseado em documentos confiáveis fornecidos
            pelos professores.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-apollo-600 hover:bg-apollo-700">
              <Link href="/login">
                <LogIn className="mr-2 h-5 w-5" />
                Entrar na Plataforma
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Criar Conta</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight sm:text-4xl">Recursos Principais</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<MessageSquare className="h-10 w-10 text-apollo-600" />}
              title="Chat Inteligente"
              description="Converse com um tutor AI que responde com base em documentos confiáveis fornecidos pela instituição."
            />
            <FeatureCard
              icon={<FileUp className="h-10 w-10 text-apollo-600" />}
              title="Upload de Documentos"
              description="Envie materiais de estudo em diversos formatos para alimentar a base de conhecimento da AI."
            />
            <FeatureCard
              icon={<BookOpen className="h-10 w-10 text-apollo-600" />}
              title="Geração de Provas"
              description="Crie avaliações personalizadas com base no conteúdo dos documentos enviados."
            />
            <FeatureCard
              icon={<FileCheck className="h-10 w-10 text-apollo-600" />}
              title="Análise de Resultados"
              description="Visualize o desempenho dos alunos e identifique áreas que precisam de mais atenção."
            />
            <FeatureCard
              icon={<Award className="h-10 w-10 text-apollo-600" />}
              title="Conteúdo Confiável"
              description="Todas as respostas são baseadas em documentos verificados, eliminando o problema de alucinações da AI."
            />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-apollo-50 py-20 dark:bg-apollo-950/50">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl">Quem Somos</h2>
            <p className="mb-6 text-lg text-muted-foreground">
              Escolhemos o nome Apollo para nossa empresa quando estávamos pensando em algum nome que pudesse passar a
              ideia de clareza, conhecimento, algo que remetesse a uma ferramenta para estudo. Chamamos de Apollo por
              ser o deus do sol dos gregos, conhecido por ser o "deus da verdade".
            </p>
            <p className="mb-6 text-lg text-muted-foreground">
              Escolhemos a cor azul para tentar passar uma ideia de futuro também, algo mais tecnológico para levar
              tecnologia para dentro das escolas.
            </p>
            <p className="text-lg text-muted-foreground">
              Hoje em dia é inevitável fugir do uso de AI, principalmente para meios acadêmicos. Mas a maioria das AIs
              tem dois grandes problemas: a alucinação das informações e a falta de fontes confiáveis. Pensando nisso,
              desenvolvemos Apollo, um tutor especializado e customizável que interage com os documentos
              disponibilizados pela instituição.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl rounded-lg bg-apollo-600 p-8 text-center text-white shadow-lg dark:bg-apollo-800">
            <h2 className="mb-4 text-3xl font-bold">Pronto para transformar o aprendizado?</h2>
            <p className="mb-6 text-lg text-apollo-50">
              Comece a usar Apollo AI hoje mesmo e experimente um novo nível de tutoria personalizada.
            </p>
            <Button asChild size="lg" variant="secondary">
              <Link href="/login">Entrar Agora</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center rounded-lg border bg-card p-6 text-center shadow-sm transition-all hover:shadow-md">
      <div className="mb-4 rounded-full bg-apollo-100 p-3 dark:bg-apollo-900">{icon}</div>
      <h3 className="mb-2 text-xl font-medium">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}
