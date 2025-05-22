"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { RouteProtection } from "@/components/route-protection"
import { AlertCircle, CheckCircle, XCircle, Clock, ArrowLeft, FileText } from "lucide-react"
import { API_URL } from "@/lib/config"
import { getExamDetails } from "@/lib/api"

// Add the ExamData interface at the top of the file
interface ExamData {
  id: number
  title: string
  topic: string
  subject_id: number
  questions: {
    type: string
    number: number
    statement: string
    alternatives?: string[]
    correct_answer: string
    explanation: string
  }[]
  total_questions: number
  source?: string[]
}

interface ExamResult {
  exam_id: number
  exam_title: string
  topic: string
  subject_name: string
  score: number
  total_questions: number
  correct_answers: number
  time_taken: number
  submitted_at: string
  questions: {
    number: number
    statement: string
    type: string
    user_answer: string
    correct_answer: string
    is_correct: boolean
    explanation: string
  }[]
}

export default function ExamResultPage() {
  return (
    <RouteProtection>
      <ExamResultContent />
    </RouteProtection>
  )
}

function ExamResultContent() {
  const params = useParams()
  const router = useRouter()
  const examId = params.id as string

  const [result, setResult] = useState<ExamResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [subjects, setSubjects] = useState<any[]>([])
  const [exam, setExam] = useState<ExamData | null>(null)

  // Carregar os resultados da prova
  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true)

        // First check if we have results in localStorage
        const storedResults = localStorage.getItem(`exam_results_${examId}`)

        if (storedResults) {
          const parsedResults = JSON.parse(storedResults)

          // Transform the data to match the expected format
          const formattedResult = {
            exam_id: parsedResults.exam_id,
            exam_title: parsedResults.exam_title,
            topic: parsedResults.topic,
            subject_name: "", // We'll need to fetch this separately
            score: parsedResults.percentage,
            total_questions: parsedResults.max_score,
            correct_answers: parsedResults.total_score,
            time_taken: parsedResults.time_taken,
            submitted_at: parsedResults.submitted_at,
            questions: parsedResults.questions.map((q) => ({
              number: q.question_number,
              statement: exam?.questions.find((eq) => eq.number === q.question_number)?.statement || "",
              type: exam?.questions.find((eq) => eq.number === q.question_number)?.type || "multiple_choice",
              user_answer: q.student_answer,
              correct_answer: q.correct_answer,
              is_correct: q.correct,
              explanation: q.explanation,
            })),
          }

          // Fetch subject name if needed
          if (subjects.length > 0) {
            const subject = subjects.find((s) => s.id === parsedResults.subject_id)
            if (subject) {
              formattedResult.subject_name = subject.name
            }
          }

          setResult(formattedResult)
          return
        }

        // If no stored results, fetch from API
        const response = await fetch(`${API_URL}/exam/exams/${examId}/results`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("apollo_token")}`,
          },
        })

        if (!response.ok) {
          throw new Error(`Erro ao carregar resultados: ${response.status}`)
        }

        const data = await response.json()
        setResult(data)
      } catch (error) {
        console.error("Erro ao carregar resultados:", error)
        setError("Não foi possível carregar os resultados da prova. Por favor, tente novamente.")
      } finally {
        setLoading(false)
      }
    }

    if (examId) {
      fetchResult()
    }
  }, [examId, subjects, exam])

  // Add this to the existing useEffect or create a new one to fetch exam details
  useEffect(() => {
    const fetchExamDetails = async () => {
      try {
        const examData = await getExamDetails(Number(examId))
        setExam(examData)
      } catch (error) {
        console.error("Erro ao carregar detalhes da prova:", error)
      }
    }

    if (examId) {
      fetchExamDetails()
    }
  }, [examId])

  // Formatar o tempo decorrido
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`
  }

  if (loading) {
    return (
      <div className="container mx-auto py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-t-apollo-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Carregando resultados...</p>
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

  if (!result) {
    return (
      <div className="container mx-auto py-12">
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Resultados não encontrados.</AlertDescription>
        </Alert>
        <div className="text-center mt-6">
          <Button onClick={() => router.push("/provas")}>Voltar para Provas</Button>
        </div>
      </div>
    )
  }

  // Calcular a porcentagem de acertos
  const percentCorrect = Math.round((result.correct_answers / result.total_questions) * 100)

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.push("/provas")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Provas
        </Button>
        <h1 className="text-3xl font-bold">{result.exam_title}</h1>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="outline">{result.subject_name}</Badge>
          <p className="text-muted-foreground">Tópico: {result.topic}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pontuação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-5xl font-bold text-apollo-600">{percentCorrect}%</p>
              <p className="text-muted-foreground mt-2">
                {result.correct_answers} de {result.total_questions} questões corretas
              </p>
            </div>
            <Progress value={percentCorrect} className="h-2 mt-4" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tempo</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <div className="text-center">
              <div className="flex items-center justify-center">
                <Clock className="h-6 w-6 mr-2 text-muted-foreground" />
                <p className="text-3xl font-mono">{formatTime(result.time_taken)}</p>
              </div>
              <p className="text-muted-foreground mt-2">Tempo total de prova</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <div className="text-center">
              {percentCorrect >= 70 ? (
                <>
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                  <p className="font-bold text-xl mt-2 text-green-600">Aprovado</p>
                </>
              ) : (
                <>
                  <XCircle className="h-12 w-12 text-red-500 mx-auto" />
                  <p className="font-bold text-xl mt-2 text-red-600">Reprovado</p>
                </>
              )}
              <p className="text-muted-foreground mt-1">Mínimo para aprovação: 70%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mb-4">Revisão das Questões</h2>
      <div className="space-y-6">
        {result.questions.map((question) => (
          <Card key={question.number} className={question.is_correct ? "border-green-200" : "border-red-200"}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">
                  Questão {question.number} - {question.type === "essay" ? "Dissertativa" : "Múltipla Escolha"}
                </CardTitle>
                {question.is_correct ? (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Correta</Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Incorreta</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium">Enunciado:</p>
                <p>{question.statement}</p>
              </div>

              <div>
                <p className="font-medium">Sua resposta:</p>
                <p className={`p-2 rounded ${question.is_correct ? "bg-green-50" : "bg-red-50"}`}>
                  {question.user_answer || "(Sem resposta)"}
                </p>
              </div>

              <div>
                <p className="font-medium">Resposta correta:</p>
                <p className="p-2 rounded bg-green-50">{question.correct_answer}</p>
              </div>

              <div>
                <p className="font-medium">Explicação:</p>
                <p className="p-2 rounded bg-gray-50 text-muted-foreground">
                  <FileText className="h-4 w-4 inline mr-1" />
                  {question.explanation}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
