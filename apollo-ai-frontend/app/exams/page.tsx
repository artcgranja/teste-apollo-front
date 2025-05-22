"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Play } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { generateExam, getSubjects } from "@/lib/api"
import { RouteProtection } from "@/components/route-protection"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { API_URL } from "@/lib/config"

// Atualizando o schema para remover o campo difficultyLevel que não estamos mais usando
const formSchema = z.object({
  title: z.string().min(3, {
    message: "O título deve ter pelo menos 3 caracteres.",
  }),
  subject: z.string().min(1, {
    message: "Por favor, selecione uma disciplina.",
  }),
  description: z.string().optional(),
  questionCount: z.coerce
    .number()
    .min(1, { message: "Mínimo de 1 questão." })
    .max(50, { message: "Máximo de 50 questões." }),
  questionTypes: z.array(z.string()).min(1, { message: "Selecione pelo menos um tipo de questão." }),
  topics: z.string().min(3, {
    message: "Por favor, informe os tópicos a serem abordados.",
  }),
})

// Wrap the component with RouteProtection
export default function ExamsPage() {
  return (
    <RouteProtection>
      <ExamsContent />
    </RouteProtection>
  )
}

// Move the existing component content to a new component
function ExamsContent() {
  // ... existing code from ExamsPage ...
  const [isGenerating, setIsGenerating] = useState(false)
  const [examGenerated, setExamGenerated] = useState(false)
  const [generatedExam, setGeneratedExam] = useState<any>(null)
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [subjects, setSubjects] = useState<{ id: number; name: string }[]>([])
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true)
  const [questionTypes, setQuestionTypes] = useState<{ id: string; name: string; description: string }[]>([])
  const [isLoadingQuestionTypes, setIsLoadingQuestionTypes] = useState(true)
  const [isFormValid, setIsFormValid] = useState(false)

  // Buscar tipos de questões da API
  useEffect(() => {
    const fetchQuestionTypes = async () => {
      try {
        setIsLoadingQuestionTypes(true)
        const response = await fetch(`${API_URL}/exam/question_types`)

        if (!response.ok) {
          throw new Error(`Failed to fetch question types: ${response.status}`)
        }

        const data = await response.json()
        setQuestionTypes(data)
      } catch (error) {
        console.error("Failed to fetch question types:", error)
        // Fallback para tipos de questões padrão em caso de erro
        setQuestionTypes([
          {
            id: "multiple_choice",
            name: "Múltipla Escolha",
            description: "Questão com alternativas onde apenas uma é correta",
          },
          {
            id: "true_false",
            name: "Verdadeiro ou Falso",
            description: "Questão com duas alternativas: verdadeiro ou falso",
          },
          { id: "short_answer", name: "Resposta Curta", description: "Questão que requer uma resposta textual curta" },
          { id: "essay", name: "Dissertativa", description: "Questão que requer uma resposta textual elaborada" },
        ])
      } finally {
        setIsLoadingQuestionTypes(false)
      }
    }

    fetchQuestionTypes()
  }, [])

  // Buscar disciplinas da API
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setIsLoadingSubjects(true)
        const apiSubjects = await getSubjects()
        setSubjects(
          apiSubjects.map((subject) => ({
            id: subject.id,
            name: subject.name,
          })),
        )
      } catch (error) {
        console.error("Failed to fetch subjects:", error)
      } finally {
        setIsLoadingSubjects(false)
      }
    }

    fetchSubjects()
  }, [])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "Prova Gerada Automaticamente",
      subject: "",
      description: "",
      questionCount: 10,
      questionTypes: [],
      topics: "",
    },
    mode: "onChange", // Isso faz com que a validação ocorra em tempo real
  })

  // Observar os campos do formulário para validação em tempo real
  const subject = form.watch("subject")
  const topics = form.watch("topics")
  const selectedQuestionTypes = form.watch("questionTypes")

  // Atualizar o estado de validação do formulário
  useEffect(() => {
    const hasSubject = !!subject
    const hasTopics = !!topics && topics.length >= 3
    const hasQuestionTypes = selectedQuestionTypes.length > 0

    setIsFormValid(hasSubject && hasTopics && hasQuestionTypes)

    // Log para debug
    console.log("Form validation:", {
      hasSubject,
      hasTopics,
      hasQuestionTypes,
      subject,
      topics,
      selectedQuestionTypes,
    })
  }, [subject, topics, selectedQuestionTypes])

  // Atualizar a função onSubmit para enviar os dados no formato correto
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsGenerating(true)

    try {
      console.log("Enviando dados para gerar prova:", {
        topic: values.topics,
        subject_id: Number.parseInt(values.subject),
        num_questions: values.questionCount,
        question_types: values.questionTypes,
        description: values.description || undefined,
      })

      // Call the API to generate the exam
      const exam = await generateExam(
        values.topics,
        Number.parseInt(values.subject),
        values.questionCount,
        values.questionTypes,
        values.description,
      )

      console.log("Prova gerada com sucesso:", exam)
      setGeneratedExam(exam)
      setExamGenerated(true)
    } catch (error) {
      console.error("Error generating exam:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  if (!isAuthenticated) {
    return null // Don't render anything while redirecting
  }

  // Return the JSX from the original component
  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-3xl font-bold">Gerador de Provas</h1>
      <p className="mb-8 text-muted-foreground">
        Configure os parâmetros para gerar uma prova personalizada com base nos documentos disponíveis.
      </p>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Configuração da Prova</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Disciplina</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingSubjects}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={isLoadingSubjects ? "Carregando disciplinas..." : "Selecione uma disciplina"}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.id.toString()}>
                              {subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="topics"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tópicos</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Liste os tópicos que devem ser abordados na prova, separados por vírgula"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Ex: Equações do 2º grau, Teorema de Pitágoras, Funções</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição (opcional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Informações adicionais sobre a prova" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="questionCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Questões</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} max={50} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="questionTypes"
                  render={() => (
                    <FormItem>
                      <div className="mb-2">
                        <FormLabel>Tipos de Questões</FormLabel>
                        <FormDescription>Selecione pelo menos um tipo de questão.</FormDescription>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {isLoadingQuestionTypes ? (
                          <div className="col-span-2 flex items-center justify-center py-4">
                            <Loader2 className="h-5 w-5 animate-spin text-apollo-600 mr-2" />
                            <span>Carregando tipos de questões...</span>
                          </div>
                        ) : (
                          questionTypes.map((type) => (
                            <FormField
                              key={type.id}
                              control={form.control}
                              name="questionTypes"
                              render={({ field }) => {
                                return (
                                  <FormItem key={type.id} className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(type.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, type.id])
                                            : field.onChange(field.value?.filter((value) => value !== type.id))
                                        }}
                                      />
                                    </FormControl>
                                    <div>
                                      <FormLabel className="font-normal">{type.name}</FormLabel>
                                      {type.description && (
                                        <p className="text-xs text-muted-foreground">{type.description}</p>
                                      )}
                                    </div>
                                  </FormItem>
                                )
                              }}
                            />
                          ))
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-apollo-600 hover:bg-apollo-700"
                  disabled={isGenerating || !isFormValid}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando Prova...
                    </>
                  ) : (
                    "Gerar Prova"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prévia da Prova</CardTitle>
          </CardHeader>
          <CardContent>
            {!examGenerated ? (
              <div className="flex h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
                <p className="text-lg font-medium">Configure e gere uma prova para visualizar a prévia</p>
                <p className="mt-2 text-sm text-muted-foreground">A prévia da prova aparecerá aqui após a geração</p>
              </div>
            ) : (
              <div className="flex h-[400px] flex-col">
                <div className="flex-1 overflow-y-auto rounded-lg border p-4 flex flex-col items-center justify-center text-center">
                  <h3 className="text-2xl font-bold mb-2">{generatedExam.title}</h3>
                  <div className="space-y-3 mb-6">
                    <p className="text-muted-foreground">
                      <span className="font-medium">Disciplina:</span>{" "}
                      {subjects.find((s) => s.id.toString() === form.getValues("subject"))?.name || ""}
                    </p>
                    <p className="text-muted-foreground">
                      <span className="font-medium">Quantidade de questões:</span> {generatedExam.total_questions}
                    </p>
                    {generatedExam.source && generatedExam.source.length > 0 && (
                      <p className="text-muted-foreground">
                        <span className="font-medium">Fontes utilizadas:</span> {generatedExam.source.join(", ")}
                      </p>
                    )}
                  </div>

                  <div className="mt-6">
                    <Button className="gap-2 bg-apollo-600 hover:bg-apollo-700 px-8 py-6 text-lg">
                      <Play className="h-5 w-5" />
                      Iniciar Prova
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
