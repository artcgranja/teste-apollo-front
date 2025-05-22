"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { FileDown, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { RouteProtection } from "@/components/route-protection"
// Importe a função getSubjects
import { getSubjects } from "@/lib/api"

// Mock data
const exams = [
  { id: "1", name: "Avaliação de Matemática - 1º Bimestre" },
  { id: "2", name: "Avaliação de Português - 1º Bimestre" },
  { id: "3", name: "Avaliação de Ciências - 1º Bimestre" },
]

const students = [
  { id: "1", name: "Ana Silva", grade: 8.5, completionTime: "45 min" },
  { id: "2", name: "Bruno Santos", grade: 7.2, completionTime: "52 min" },
  { id: "3", name: "Carla Oliveira", grade: 9.0, completionTime: "38 min" },
  { id: "4", name: "Daniel Pereira", grade: 6.8, completionTime: "60 min" },
  { id: "5", name: "Eduardo Costa", grade: 8.0, completionTime: "47 min" },
  { id: "6", name: "Fernanda Lima", grade: 9.5, completionTime: "42 min" },
  { id: "7", name: "Gabriel Souza", grade: 7.8, completionTime: "50 min" },
  { id: "8", name: "Helena Martins", grade: 8.3, completionTime: "44 min" },
  { id: "9", name: "Igor Alves", grade: 6.5, completionTime: "55 min" },
  { id: "10", name: "Juliana Ferreira", grade: 9.2, completionTime: "40 min" },
]

const gradeDistribution = [
  { range: "0-2", count: 0 },
  { range: "2-4", count: 0 },
  { range: "4-6", count: 1 },
  { range: "6-8", count: 4 },
  { range: "8-10", count: 5 },
]

const questionPerformance = [
  { id: 1, correct: 8, incorrect: 2 },
  { id: 2, correct: 6, incorrect: 4 },
  { id: 3, correct: 9, incorrect: 1 },
  { id: 4, correct: 7, incorrect: 3 },
  { id: 5, correct: 5, incorrect: 5 },
  { id: 6, correct: 8, incorrect: 2 },
  { id: 7, correct: 7, incorrect: 3 },
  { id: 8, correct: 9, incorrect: 1 },
  { id: 9, correct: 6, incorrect: 4 },
  { id: 10, correct: 8, incorrect: 2 },
]

const COLORS = ["#3b6bff", "#ff6b6b"]

// Wrap the component with RouteProtection
export default function ResultsPage() {
  return (
    <RouteProtection>
      <ResultsContent />
    </RouteProtection>
  )
}

// Atualize a função ResultsContent para buscar disciplinas da API
function ResultsContent() {
  const [selectedExam, setSelectedExam] = useState("1")
  const [searchTerm, setSearchTerm] = useState("")
  const [subjects, setSubjects] = useState<{ id: number; name: string }[]>([])
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true)

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

  const filteredStudents = students.filter((student) => student.name.toLowerCase().includes(searchTerm.toLowerCase()))

  // Return the JSX from the original component
  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-3xl font-bold">Resultados das Provas</h1>
      <p className="mb-8 text-muted-foreground">
        Visualize e analise o desempenho dos alunos nas provas geradas pelo Apollo AI.
      </p>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Label htmlFor="exam-select" className="mb-2 block">
            Selecione a Prova
          </Label>
          <Select value={selectedExam} onValueChange={setSelectedExam}>
            <SelectTrigger id="exam-select" className="w-full">
              <SelectValue placeholder="Selecione uma prova" />
            </SelectTrigger>
            <SelectContent>
              {exams.map((exam) => (
                <SelectItem key={exam.id} value={exam.id}>
                  {exam.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar aluno..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <Button className="gap-2 sm:w-auto">
          <FileDown className="h-4 w-4" />
          Exportar Relatório
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Notas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={gradeDistribution}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b6bff" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Desempenho por Questão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={questionPerformance}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="id" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="correct" stackId="a" fill="#3b6bff" name="Corretas" />
                  <Bar dataKey="incorrect" stackId="a" fill="#ff6b6b" name="Incorretas" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Lista de Alunos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Nota</TableHead>
                    <TableHead>Tempo de Conclusão</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.grade.toFixed(1)}</TableCell>
                      <TableCell>{student.completionTime}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            student.grade >= 7
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : student.grade >= 5
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                          }`}
                        >
                          {student.grade >= 7 ? "Aprovado" : student.grade >= 5 ? "Recuperação" : "Reprovado"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aprovação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Aprovados", value: 7 },
                      { name: "Reprovados", value: 3 },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[0, 1].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-md bg-blue-50 p-3 text-center dark:bg-blue-900">
                  <p className="text-sm text-muted-foreground">Média da Turma</p>
                  <p className="text-2xl font-bold text-apollo-600 dark:text-apollo-400">8.1</p>
                </div>
                <div className="rounded-md bg-blue-50 p-3 text-center dark:bg-blue-900">
                  <p className="text-sm text-muted-foreground">Tempo Médio</p>
                  <p className="text-2xl font-bold text-apollo-600 dark:text-apollo-400">47 min</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
