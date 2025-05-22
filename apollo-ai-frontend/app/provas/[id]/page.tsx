"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getExamDetails } from "@/lib/api"
import { RouteProtection } from "@/components/route-protection"
import { ChevronLeft, ChevronRight, AlertCircle, CheckCircle, Clock, Send, Loader2 } from "lucide-react"
import { API_URL } from "@/lib/config"

// Tipos para as questões e respostas
interface ExamQuestion {
  type: "essay" | "multiple_choice"
  number: number
  statement: string
  alternatives?: string[]
  correct_answer: string
  explanation: string
}

interface ExamData {
  id: number
  title: string
  topic: string
  subject_id: number
  questions: ExamQuestion[]
  total_questions: number
  source?: string[]
}

interface UserAnswer {
  questionNumber: number
  answer: string
  isAnswered: boolean
}

export default function ExamPage() {
  return (
    <RouteProtection>
      <ExamContent />
    </RouteProtection>
  )
}

function ExamContent() {
  const params = useParams()
  const router = useRouter()
  const examId = params.id as string

  const [exam, setExam] = useState<ExamData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([])
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [examSubmitted, setExamSubmitted] = useState(false)

  // Adicionar um novo estado para controlar a exibição do pop-up de confirmação
  const [showConfirmation, setShowConfirmation] = useState(false)

  // Carregar os detalhes da prova
  useEffect(() => {
    const fetchExam = async () => {
      try {
        setLoading(true)
        const examData = await getExamDetails(Number(examId))
        setExam(examData)

        // Inicializar as respostas do usuário
        const initialAnswers = examData.questions.map((q) => ({
          questionNumber: q.number,
          answer: "",
          isAnswered: false,
        }))
        setUserAnswers(initialAnswers)
      } catch (error) {
        console.error("Erro ao carregar prova:", error)
        setError("Não foi possível carregar a prova. Por favor, tente novamente.")
      } finally {
        setLoading(false)
      }
    }

    if (examId) {
      fetchExam()
    }
  }, [examId])

  // Timer para contar o tempo decorrido
  useEffect(() => {
    if (!loading && exam && !examSubmitted) {
      const timer = setInterval(() => {
        setTimeElapsed((prev) => prev + 1)
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [loading, exam, examSubmitted])

  // Formatar o tempo decorrido
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`
  }

  // Calcular o progresso da prova
  const calculateProgress = () => {
    if (!exam) return 0
    const answeredCount = userAnswers.filter((a) => a.isAnswered).length
    return Math.round((answeredCount / exam.questions.length) * 100)
  }

  // Navegar para a próxima questão
  const goToNextQuestion = () => {
    if (exam && currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  // Navegar para a questão anterior
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  // Atualizar a resposta do usuário
  const updateAnswer = (answer: string) => {
    if (!exam) return

    const currentQuestion = exam.questions[currentQuestionIndex]
    setUserAnswers((prev) =>
      prev.map((a) =>
        a.questionNumber === currentQuestion.number ? { ...a, answer, isAnswered: answer.trim().length > 0 } : a,
      ),
    )
  }

  // Navegar para uma questão específica
  const goToQuestion = (index: number) => {
    if (index >= 0 && exam && index < exam.questions.length) {
      setCurrentQuestionIndex(index)
    }
  }

  // Modificar a função submitExam para primeiro mostrar o pop-up
  const submitExam = async () => {
    if (!exam) return

    // Em vez de enviar imediatamente, mostrar o pop-up de confirmação
    setShowConfirmation(true)
  }

  // Adicionar uma nova função para enviar a prova após confirmação
  const confirmAndSubmitExam = async () => {
    if (!exam) return

    setIsSubmitting(true)
    setShowConfirmation(false)

    try {
      // Format the data according to the required structure
      const answersToSubmit = userAnswers.map((a) => ({
        question_number: a.questionNumber,
        answer: a.answer,
      }))

      // Create the payload with exam_id and answers
      const payload = {
        exam_id: Number(examId),
        answers: {
          answers: answersToSubmit,
        },
      }

      console.log("Submitting exam with payload:", payload)

      // Send the data to the correct_exam endpoint
      const response = await fetch(`${API_URL}/exam/correct_exam`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("apollo_token")}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`Erro ao enviar respostas: ${response.status}`)
      }

      // Get the exam results
      const examResults = await response.json()
      console.log("Resultados da prova:", examResults)

      // Store the results in localStorage to be accessed in the results page
      localStorage.setItem(
        `exam_results_${examId}`,
        JSON.stringify({
          ...examResults,
          exam_id: Number(examId),
          exam_title: exam.title,
          topic: exam.topic,
          subject_id: exam.subject_id,
          time_taken: timeElapsed,
          submitted_at: new Date().toISOString(),
        }),
      )

      // Mark the exam as submitted
      setExamSubmitted(true)

      // Redirect to the results page after 2 seconds
      setTimeout(() => {
        router.push(`/provas/resultados/${examId}`)
      }, 2000)
    } catch (error) {
      console.error("Erro ao enviar respostas:", error)
      setError("Ocorreu um erro ao enviar suas respostas. Por favor, tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Verificar se todas as questões foram respondidas
  const allQuestionsAnswered = () => {
    return userAnswers.every((a) => a.isAnswered)
  }

  // Renderizar o conteúdo da questão atual
  const renderCurrentQuestion = () => {
    if (!exam) return null

    const currentQuestion = exam.questions[currentQuestionIndex]
    const userAnswer = userAnswers.find((a) => a.questionNumber === currentQuestion.number)

    if (currentQuestion.type === "multiple_choice") {
      return (
        <div className="space-y-4">
          <p className="text-lg">{currentQuestion.statement}</p>
          <RadioGroup value={userAnswer?.answer || ""} onValueChange={updateAnswer} className="space-y-3">
            {currentQuestion.alternatives?.map((alternative, index) => (
              <div key={index} className="flex items-start space-x-2">
                <RadioGroupItem value={alternative} id={`alternative-${index}`} />
                <Label htmlFor={`alternative-${index}`} className="text-base font-normal">
                  {alternative}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )
    } else if (currentQuestion.type === "essay") {
      return (
        <div className="space-y-4">
          <p className="text-lg">{currentQuestion.statement}</p>
          <Textarea
            placeholder="Digite sua resposta aqui..."
            value={userAnswer?.answer || ""}
            onChange={(e) => updateAnswer(e.target.value)}
            className="min-h-[200px]"
          />
        </div>
      )
    }

    return null
  }

  if (loading) {
    return (
      <div className="container mx-auto py-12 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-apollo-600 mx-auto mb-4" />
          <p className="text-lg">Carregando prova...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-12">
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="text-center mt-6">
          <Button onClick={() => router.push("/provas")}>Voltar para Provas</Button>
        </div>
      </div>
    )
  }

  if (examSubmitted) {
    return (
      <div className="container mx-auto py-12 flex items-center justify-center">
        <div className="text-center max-w-md">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Prova Enviada com Sucesso!</h2>
          <p className="text-muted-foreground mb-6">
            Suas respostas foram registradas. Você será redirecionado para a página de resultados.
          </p>
          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  if (!exam) {
    return (
      <div className="container mx-auto py-12">
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Prova não encontrada.</AlertDescription>
        </Alert>
        <div className="text-center mt-6">
          <Button onClick={() => router.push("/provas")}>Voltar para Provas</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{exam.title}</h1>
          <p className="text-muted-foreground">Tópico: {exam.topic}</p>
        </div>
        <div className="flex items-center gap-2 bg-muted p-2 rounded-md">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <span className="font-mono text-lg">{formatTime(timeElapsed)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar com navegação das questões */}
        <div className="md:col-span-1 order-2 md:order-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Questões</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {exam.questions.map((question, index) => (
                  <Button
                    key={question.number}
                    variant={userAnswers[index]?.isAnswered ? "default" : "outline"}
                    className={`h-10 w-10 p-0 ${
                      currentQuestionIndex === index ? "ring-2 ring-apollo-500 dark:ring-apollo-400" : ""
                    }`}
                    onClick={() => goToQuestion(index)}
                  >
                    {question.number}
                  </Button>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-4">
              <div className="w-full">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progresso</span>
                  <span>
                    {userAnswers.filter((a) => a.isAnswered).length}/{exam.questions.length}
                  </span>
                </div>
                <Progress value={calculateProgress()} className="h-2" />
              </div>
              <Button className="w-full bg-apollo-600 hover:bg-apollo-700" onClick={submitExam} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Finalizar Prova
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Conteúdo da questão atual */}
        <div className="md:col-span-3 order-1 md:order-2">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>
                Questão {exam.questions[currentQuestionIndex].number} de {exam.questions.length}
              </CardTitle>
            </CardHeader>
            <CardContent>{renderCurrentQuestion()}</CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={goToPreviousQuestion} disabled={currentQuestionIndex === 0}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Anterior
              </Button>
              <Button
                variant="outline"
                onClick={goToNextQuestion}
                disabled={currentQuestionIndex === exam.questions.length - 1}
              >
                Próxima
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Confirmar envio da prova</h3>

            <div className="mb-4">
              <p className="text-muted-foreground mb-2">
                Você está prestes a finalizar e enviar sua prova. Por favor, verifique o status das suas respostas:
              </p>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm">Respondida</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm">Não respondida</span>
                </div>
              </div>
            </div>

            <div className="border rounded-md overflow-hidden mb-6">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-2 text-left">Questão</th>
                    <th className="p-2 text-left">Tipo</th>
                    <th className="p-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {exam.questions.map((question, index) => {
                    const isAnswered = userAnswers[index]?.isAnswered || false
                    return (
                      <tr key={question.number} className={!isAnswered ? "bg-red-50 dark:bg-red-900/20" : ""}>
                        <td className="p-2">Questão {question.number}</td>
                        <td className="p-2">
                          {question.type === "multiple_choice" ? "Múltipla Escolha" : "Dissertativa"}
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${isAnswered ? "bg-green-500" : "bg-red-500"}`}></div>
                            <span>{isAnswered ? "Respondida" : "Não respondida"}</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-2">
              {!allQuestionsAnswered() && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Atenção: Você tem {exam.questions.length - userAnswers.filter((a) => a.isAnswered).length} questões
                    não respondidas. Deseja continuar mesmo assim?
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowConfirmation(false)}>
                  Voltar e revisar
                </Button>
                <Button
                  onClick={confirmAndSubmitExam}
                  className="bg-apollo-600 hover:bg-apollo-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Confirmar e enviar"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
