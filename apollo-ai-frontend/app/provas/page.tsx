"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Play, Edit, Trash2, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RouteProtection } from "@/components/route-protection"
import { getSubjects, getExamsList, deleteExam, updateExamTitle } from "@/lib/api"
import { useRouter } from "next/navigation"

// We'll fetch real exams from the API instead of using this mock data
// const mockExams = [...]

// Wrap the component with RouteProtection
export default function ProvasPage() {
  return (
    <RouteProtection>
      <ProvasContent />
    </RouteProtection>
  )
}

// Update the ProvasContent function to fetch and use real exam data
function ProvasContent() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null)
  const [subjects, setSubjects] = useState<{ id: number; name: string }[]>([])
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true)
  const [subjectMap, setSubjectMap] = useState<Record<string, string>>({})
  const [exams, setExams] = useState<any[]>([])
  const [isLoadingExams, setIsLoadingExams] = useState(true)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)
  const [editingExamId, setEditingExamId] = useState<number | null>(null)
  const [newExamTitle, setNewExamTitle] = useState("")

  // Fetch exams from the API
  useEffect(() => {
    const fetchExams = async () => {
      try {
        setIsLoadingExams(true)
        const examsList = await getExamsList()
        setExams(examsList)
      } catch (error) {
        console.error("Failed to fetch exams:", error)
      } finally {
        setIsLoadingExams(false)
      }
    }

    fetchExams()
  }, [])

  // Buscar disciplinas da API
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setIsLoadingSubjects(true)
        const apiSubjects = await getSubjects()

        const subjects = apiSubjects.map((subject) => ({
          id: subject.id,
          name: subject.name,
        }))

        setSubjects(subjects)

        // Criar um mapa de ID para nome para uso na função getSubjectName
        const map: Record<string, string> = {}
        subjects.forEach((subject) => {
          map[subject.id.toString()] = subject.name
        })
        setSubjectMap(map)
      } catch (error) {
        console.error("Failed to fetch subjects:", error)
      } finally {
        setIsLoadingSubjects(false)
      }
    }

    fetchSubjects()
  }, [])

  // Atualizar a função getSubjectName para usar o mapa de disciplinas
  const getSubjectName = (subjectId: string | number) => {
    return subjectMap[subjectId.toString()] || subjectId.toString()
  }

  // Filtrar provas com base na pesquisa, matéria e dificuldade
  const filteredExams = exams.filter((exam) => {
    const matchesSearch =
      exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getSubjectName(exam.subject_id).toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject =
      subjectFilter === null || subjectFilter === "all" || exam.subject_id.toString() === subjectFilter
    return matchesSearch && matchesSubject
  })

  const handleDeleteExam = async (examId: number) => {
    if (confirm("Tem certeza que deseja excluir esta prova? Esta ação não pode ser desfeita.")) {
      try {
        setIsDeleting(examId)
        await deleteExam(examId)
        // Atualizar a lista de exames após a exclusão
        const updatedExams = exams.filter((exam) => exam.id !== examId)
        setExams(updatedExams)
      } catch (error) {
        console.error("Erro ao excluir exame:", error)
        alert("Ocorreu um erro ao excluir a prova. Por favor, tente novamente.")
      } finally {
        setIsDeleting(null)
      }
    }
  }

  const handleEditExamTitle = async (examId: number) => {
    const exam = exams.find((e) => e.id === examId)
    if (exam) {
      setEditingExamId(examId)
      setNewExamTitle(exam.title)
    }
  }

  const handleSaveExamTitle = async () => {
    if (editingExamId && newExamTitle.trim()) {
      try {
        await updateExamTitle(editingExamId, newExamTitle)
        // Atualizar a lista de exames após a edição
        setExams(exams.map((exam) => (exam.id === editingExamId ? { ...exam, title: newExamTitle } : exam)))
        setEditingExamId(null)
      } catch (error) {
        console.error("Erro ao atualizar título do exame:", error)
        alert("Ocorreu um erro ao atualizar o título da prova. Por favor, tente novamente.")
      }
    }
  }

  // Return the JSX from the original component
  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-3xl font-bold">Provas</h1>
      <p className="mb-8 text-muted-foreground">
        Visualize e gerencie as provas geradas pelo Apollo AI. Selecione uma prova para realizá-la no sistema.
      </p>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar prova..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Select value={subjectFilter || ""} onValueChange={(value) => setSubjectFilter(value || null)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={isLoadingSubjects ? "Carregando..." : "Filtrar por matéria"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as matérias</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id.toString()}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoadingExams ? (
          <div className="col-span-full flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-apollo-600" />
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="col-span-full py-8 text-center">
            <p className="text-lg font-medium">Nenhuma prova encontrada</p>
            <p className="mt-2 text-muted-foreground">Tente ajustar seus filtros ou criar uma nova prova</p>
          </div>
        ) : (
          filteredExams.map((exam) => {
            return (
              <Card key={exam.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between">
                    <Badge variant="outline">{getSubjectName(exam.subject_id)}</Badge>
                  </div>
                  <CardTitle className="mt-2 line-clamp-1">{exam.title}</CardTitle>
                  <CardDescription>
                    {format(new Date(exam.created_at), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Tópico: {exam.topic}</span>
                    </div>
                    {exam.source && exam.source.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        <span>Fonte: {exam.source.join(", ")}</span>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        className="flex-1 gap-1 bg-apollo-600 hover:bg-apollo-700"
                        onClick={() => router.push(`/provas/${exam.id}`)}
                      >
                        <Play className="h-4 w-4" />
                        Realizar Prova
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleEditExamTitle(exam.id)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteExam(exam.id)}
                        disabled={isDeleting === exam.id}
                      >
                        {isDeleting === exam.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
      {editingExamId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Editar título da prova</h3>
            <Input
              value={newExamTitle}
              onChange={(e) => setNewExamTitle(e.target.value)}
              className="mb-4"
              placeholder="Novo título da prova"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingExamId(null)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveExamTitle} className="bg-apollo-600 hover:bg-apollo-700">
                Salvar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
