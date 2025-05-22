"use client"

import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { FileUp, X, Check, FileText, File, Loader2, Trash2, Download, Pencil } from "lucide-react"
import { cn } from "@/lib/utils"
import { uploadDocument, deleteDocument, getSubjects, getDocuments, updateDocumentName } from "@/lib/api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { RouteProtection } from "@/components/route-protection"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

type UploadStatus = "idle" | "uploading" | "success" | "error"

type UploadFile = {
  id: string
  file: File
  progress: number
  status: UploadStatus
  error?: string
  documentId?: number
}

interface Document {
  id: number
  filename: string
  user_id: number
  subject_id: number
  description?: string
  created_at?: string
}

function UploadContent() {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<string>("")
  const [subjects, setSubjects] = useState<{ id: number; name: string }[]>([])
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true)
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false)
  const [activeTab, setActiveTab] = useState("upload")
  const [subjectMap, setSubjectMap] = useState<Record<number, string>>({})
  const [isDeletingDocument, setIsDeletingDocument] = useState<number | null>(null)
  const [isEditingDocument, setIsEditingDocument] = useState<number | null>(null)
  const [newDocumentName, setNewDocumentName] = useState("")
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const API_URL = process.env.NEXT_PUBLIC_API_URL

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

        // Create a map of subject IDs to names for easy lookup
        const map: Record<number, string> = {}
        subjects.forEach((subject) => {
          map[subject.id] = subject.name
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

  // Fetch documents when the view tab is selected
  useEffect(() => {
    if (activeTab === "view") {
      fetchDocuments()
    }
  }, [activeTab])

  const fetchDocuments = async () => {
    try {
      setIsLoadingDocuments(true)
      console.log("Fetching documents...")
      console.log("Current auth token:", localStorage.getItem("apollo_token") ? "Token exists" : "No token")

      const data = await getDocuments()
      console.log("Documents fetched successfully:", data)
      setDocuments(data)
    } catch (error) {
      console.error("Error fetching documents:", error)
      // Show a user-friendly error message
      alert("Não foi possível carregar os documentos. Por favor, verifique sua conexão e tente novamente.")
    } finally {
      setIsLoadingDocuments(false)
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      progress: 0,
      status: "idle" as UploadStatus,
    }))
    setFiles((prev) => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-powerpoint": [".ppt"],
      "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
      "text/plain": [".txt"],
    },
  })

  const removeFile = async (id: string) => {
    const file = files.find((f) => f.id === id)

    // If the file was successfully uploaded and has a document ID, delete it from the server
    if (file?.documentId) {
      try {
        await deleteDocument(file.documentId)
      } catch (error) {
        console.error("Error deleting document:", error)
      }
    }

    setFiles((prev) => prev.filter((file) => file.id !== id))
  }

  const uploadFiles = async () => {
    if (files.length === 0 || isUploading || !selectedSubject) return

    setIsUploading(true)
    const subjectId = Number.parseInt(selectedSubject)

    // Process files one by one
    for (const file of files) {
      if (file.status !== "idle") continue

      // Update file status to uploading
      setFiles((prev) => prev.map((f) => (f.id === file.id ? { ...f, status: "uploading", progress: 0 } : f)))

      try {
        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setFiles((prev) =>
            prev.map((f) => {
              if (f.id === file.id && f.status === "uploading" && f.progress < 90) {
                return { ...f, progress: f.progress + 10 }
              }
              return f
            }),
          )
        }, 300)

        // Upload the file
        const response = await uploadDocument(subjectId, file.file)

        clearInterval(progressInterval)

        // Update file status to success
        setFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, status: "success", progress: 100, documentId: response.id } : f)),
        )
      } catch (error) {
        console.error("Error uploading file:", error)

        // Update file status to error
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: "error", error: "Erro ao processar o arquivo. Tente novamente." } : f,
          ),
        )
      }
    }

    setIsUploading(false)

    // Refresh the documents list if we're in view mode
    if (activeTab === "view") {
      fetchDocuments()
    }
  }

  const clearCompleted = () => {
    setFiles((prev) => prev.filter((file) => file.status !== "success"))
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase()
    switch (extension) {
      case "pdf":
        return <FileText className="h-6 w-6 text-red-500" />
      case "doc":
      case "docx":
        return <FileText className="h-6 w-6 text-blue-500" />
      case "xls":
      case "xlsx":
        return <FileText className="h-6 w-6 text-green-500" />
      case "ppt":
      case "pptx":
        return <FileText className="h-6 w-6 text-orange-500" />
      default:
        return <File className="h-6 w-6 text-gray-500" />
    }
  }

  const handleDeleteDocument = async (documentId: number) => {
    if (confirm("Tem certeza que deseja excluir este documento? Esta ação não pode ser desfeita.")) {
      try {
        setIsDeletingDocument(documentId)
        await deleteDocument(documentId)
        // Refresh the documents list
        fetchDocuments()
      } catch (error) {
        console.error("Error deleting document:", error)
        alert("Ocorreu um erro ao excluir o documento. Por favor, tente novamente.")
      } finally {
        setIsDeletingDocument(null)
      }
    }
  }

  const handleEditDocument = (documentId: number, currentName: string) => {
    setIsEditingDocument(documentId)
    setNewDocumentName(currentName)
    setEditDialogOpen(true)
  }

  const handleSaveDocumentName = async () => {
    if (!isEditingDocument || !newDocumentName.trim()) return

    try {
      await updateDocumentName(isEditingDocument, newDocumentName)
      // Refresh the documents list
      fetchDocuments()
      setEditDialogOpen(false)
      setIsEditingDocument(null)
    } catch (error) {
      console.error("Error updating document name:", error)
      alert("Ocorreu um erro ao atualizar o nome do documento. Por favor, tente novamente.")
    }
  }

  const handleDownloadDocument = async (documentId: number, filename: string) => {
    try {
      const response = await fetch(`${API_URL}/documents/${documentId}/download`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("apollo_token")}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to download document: ${response.status}`)
      }

      // Create a blob from the response
      const blob = await response.blob()

      // Create a link element and trigger download
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()

      // Clean up
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error downloading document:", error)
      alert("Ocorreu um erro ao baixar o documento. Por favor, tente novamente.")
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-3xl font-bold">Documentos</h1>
      <p className="mb-8 text-muted-foreground">
        Gerencie os documentos que serão utilizados como base de conhecimento para o Apollo AI.
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="upload">Upload de Documentos</TabsTrigger>
          <TabsTrigger value="view">Visualizar Documentos</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-6">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Selecione os Arquivos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Label htmlFor="subject-select">Disciplina</Label>
                    <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={isLoadingSubjects}>
                      <SelectTrigger id="subject-select">
                        <SelectValue
                          placeholder={isLoadingSubjects ? "Carregando disciplinas..." : "Selecione uma disciplina"}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id.toString()}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div
                    {...getRootProps()}
                    className={cn(
                      "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center transition-colors",
                      isDragActive
                        ? "border-apollo-500 bg-apollo-50 dark:bg-apollo-950/50"
                        : "border-muted-foreground/25 hover:border-muted-foreground/50",
                    )}
                  >
                    <input {...getInputProps()} />
                    <FileUp className="mb-4 h-12 w-12 text-muted-foreground" />
                    {isDragActive ? (
                      <p className="text-lg font-medium">Solte os arquivos aqui</p>
                    ) : (
                      <>
                        <p className="text-lg font-medium">Arraste e solte arquivos aqui, ou clique para selecionar</p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Suporta PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT
                        </p>
                      </>
                    )}
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    <Button
                      onClick={uploadFiles}
                      disabled={files.length === 0 || isUploading || !selectedSubject}
                      className="bg-apollo-600 hover:bg-apollo-700"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        "Enviar Arquivos"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={clearCompleted}
                      disabled={!files.some((file) => file.status === "success")}
                    >
                      Limpar Concluídos
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Arquivos ({files.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {files.length === 0 ? (
                    <p className="text-center text-muted-foreground">Nenhum arquivo selecionado</p>
                  ) : (
                    <div className="max-h-[400px] space-y-3 overflow-y-auto pr-2">
                      {files.map((file) => (
                        <div key={file.id} className="flex items-center justify-between rounded-lg border p-3">
                          <div className="flex items-center gap-3">
                            {getFileIcon(file.file.name)}
                            <div className="flex-1 truncate">
                              <p className="truncate font-medium">{file.file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(file.file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>

                          <div className="ml-4 flex items-center gap-2">
                            {file.status === "idle" && (
                              <Button variant="ghost" size="icon" onClick={() => removeFile(file.id)}>
                                <X className="h-4 w-4" />
                              </Button>
                            )}

                            {file.status === "uploading" && (
                              <div className="w-24">
                                <Progress value={file.progress} className="h-2" />
                              </div>
                            )}

                            {file.status === "success" && <Check className="h-5 w-5 text-green-500" />}

                            {file.status === "error" && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-red-500">Erro</span>
                                <Button variant="ghost" size="icon" onClick={() => removeFile(file.id)}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="view" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Documentos Carregados</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingDocuments ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-apollo-600" />
                </div>
              ) : documents.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-lg font-medium">Nenhum documento encontrado</p>
                  <p className="mt-2 text-muted-foreground">Faça upload de documentos para visualizá-los aqui</p>
                  <Button className="mt-4 bg-apollo-600 hover:bg-apollo-700" onClick={() => setActiveTab("upload")}>
                    <FileUp className="mr-2 h-4 w-4" />
                    Fazer Upload
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome do Arquivo</TableHead>
                        <TableHead>Disciplina</TableHead>
                        <TableHead>Data de Upload</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {documents.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {getFileIcon(doc.filename)}
                              <span className="truncate max-w-[200px]">{doc.filename}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {subjectMap[doc.subject_id] || `Disciplina ${doc.subject_id}`}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {doc.created_at
                              ? format(new Date(doc.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })
                              : "Data não disponível"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditDocument(doc.id, doc.filename)}
                              >
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Editar</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadDocument(doc.id, doc.filename)}
                              >
                                <Download className="h-4 w-4" />
                                <span className="sr-only">Download</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-500 hover:bg-red-50 hover:text-red-600"
                                onClick={() => handleDeleteDocument(doc.id)}
                                disabled={isDeletingDocument === doc.id}
                              >
                                {isDeletingDocument === doc.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                                <span className="sr-only">Excluir</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Document Name Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Nome do Documento</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="document-name">Nome do Documento</Label>
            <Input
              id="document-name"
              value={newDocumentName}
              onChange={(e) => setNewDocumentName(e.target.value)}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveDocumentName} className="bg-apollo-600 hover:bg-apollo-700">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function UploadPage() {
  return (
    <RouteProtection>
      <UploadContent />
    </RouteProtection>
  )
}
