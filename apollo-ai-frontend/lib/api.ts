import { API_URL } from "./config"

// Types
interface LoginResponse {
  access_token: string
  token_type: string
}

interface ChatResponse {
  id: number
  name: string
}

interface AskResponse {
  subject: string
  answer: string
  source: string
}

interface ExamQuestion {
  type: string
  number: number
  statement: string
  alternatives?: string[]
  correct_answer: string
  explanation: string
}

interface GenerateExamResponse {
  title: string
  total_questions: number
  questions: ExamQuestion[]
  source: string[]
}

interface UploadDocumentResponse {
  id: number
  filename: string
}

// Adicione estas interfaces após as interfaces existentes
interface ConversationResponse {
  id: number
  name: string
}

interface MessageResponse {
  id: number
  sender: string
  message: string
  source: string | null
  created_at: string
}

// Adicione esta interface após as interfaces existentes
interface Subject {
  id: number
  name: string
  created_at: string
  updated_at: string
}

// Add this interface after the existing interfaces
interface ExamListItem {
  id: number
  topic: string
  title: string
  subject_id: number
  source: string[]
  created_at: string
}

interface Document {
  id: number
  filename: string
  user_id: number
  subject_id: number
  description?: string
  created_at?: string
}

// Auth
export async function login(username: string, password: string): Promise<LoginResponse> {
  console.log(`Attempting to login with API URL: ${API_URL}`)

  try {
    // Create URLSearchParams for x-www-form-urlencoded format
    const urlencoded = new URLSearchParams()
    urlencoded.append("username", username)
    urlencoded.append("password", password)

    // Send request with x-www-form-urlencoded content type
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: urlencoded,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Login failed with status: ${response.status}, message: ${errorText}`)
      throw new Error(`Login failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    // Store the token in localStorage
    localStorage.setItem("apollo_token", data.access_token)
    return data
  } catch (error) {
    console.error("Login error:", error)
    throw error
  }
}

export function logout() {
  localStorage.removeItem("apollo_token")
}

export function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("apollo_token")
  }
  return null
}

// Helper function to get auth headers
function getAuthHeaders() {
  const token = getToken()
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  }
}

// Chat
// Atualize a função createNewChat para incluir um corpo na requisição
export async function createNewChat(): Promise<ChatResponse> {
  try {
    console.log("Creating new chat with POST request to /tutor/conversations")
    const response = await fetch(`${API_URL}/tutor/conversations`, {
      method: "POST",
      headers: getAuthHeaders(),
      // Adicionando um corpo à requisição com um nome padrão para a nova conversa
      body: JSON.stringify({
        name: "Nova conversa",
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Failed to create new chat: ${response.status}, message: ${errorText}`)
      throw new Error(`Failed to create new chat: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Create chat error:", error)
    throw error
  }
}

export async function askQuestion(conversationId: number, question: string): Promise<AskResponse> {
  try {
    const response = await fetch(`${API_URL}/tutor/ask`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        conversation_id: conversationId,
        question,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Failed to send question: ${response.status}, message: ${errorText}`)
      throw new Error(`Failed to send question: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Ask question error:", error)
    throw error
  }
}

// Adicione estas funções após as funções de chat existentes
export async function getConversations(): Promise<ConversationResponse[]> {
  try {
    const response = await fetch(`${API_URL}/tutor/conversations`, {
      method: "GET",
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Failed to get conversations: ${response.status}, message: ${errorText}`)
      throw new Error(`Failed to get conversations: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Get conversations error:", error)
    throw error
  }
}

// Também precisamos atualizar a função getConversationMessages para usar o endpoint correto

export async function getConversationMessages(conversationId: number): Promise<MessageResponse[]> {
  try {
    const response = await fetch(`${API_URL}/tutor/conversations/${conversationId}/messages`, {
      method: "GET",
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Failed to get conversation messages: ${response.status}, message: ${errorText}`)
      throw new Error(`Failed to get conversation messages: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Get conversation messages error:", error)
    throw error
  }
}

// Adicione esta função após as funções existentes
export async function getSubjects(): Promise<Subject[]> {
  try {
    const response = await fetch(`${API_URL}/core/subjects/`, {
      method: "GET",
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Failed to get subjects: ${response.status}, message: ${errorText}`)
      throw new Error(`Failed to get subjects: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Get subjects error:", error)
    throw error
  }
}

// Exams
// Atualizar a função generateExam para usar o formato correto de requisição
// Atualize as funções relacionadas a exames para usar os novos endpoints CRUD

// Atualizar a função getExamsList para usar o novo endpoint
export async function getExamsList(): Promise<ExamListItem[]> {
  try {
    const response = await fetch(`${API_URL}/exam/exams`, {
      method: "GET",
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Failed to get exams list: ${response.status}, message: ${errorText}`)
      throw new Error(`Failed to get exams list: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Get exams list error:", error)
    throw error
  }
}

// Atualizar a função generateExam para usar o novo endpoint
export async function generateExam(
  topic: string,
  subjectId: number,
  numQuestions: number,
  questionTypes: string[],
  description?: string,
): Promise<GenerateExamResponse> {
  try {
    const response = await fetch(`${API_URL}/exam/exams`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        topic,
        subject_id: subjectId,
        num_questions: numQuestions,
        question_types: questionTypes,
        description: description || undefined,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Failed to generate exam: ${response.status}, message: ${errorText}`)
      throw new Error(`Failed to generate exam: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Generate exam error:", error)
    throw error
  }
}

// Adicionar função para obter detalhes de um exame específico
export async function getExamDetails(examId: number): Promise<GenerateExamResponse> {
  try {
    const response = await fetch(`${API_URL}/exam/exams/${examId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Failed to get exam details: ${response.status}, message: ${errorText}`)
      throw new Error(`Failed to get exam details: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Get exam details error:", error)
    throw error
  }
}

// Adicionar função para atualizar o título de um exame
export async function updateExamTitle(examId: number, title: string): Promise<any> {
  try {
    const response = await fetch(`${API_URL}/exam/exams/${examId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ title }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Failed to update exam title: ${response.status}, message: ${errorText}`)
      throw new Error(`Failed to update exam title: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Update exam title error:", error)
    throw error
  }
}

// Adicionar função para excluir um exame
export async function deleteExam(examId: number): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/exam/exams/${examId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Failed to delete exam: ${response.status}, message: ${errorText}`)
      throw new Error(`Failed to delete exam: ${response.status} ${response.statusText}`)
    }
  } catch (error) {
    console.error("Delete exam error:", error)
    throw error
  }
}

// Documents
// Get all documents
// Update the getDocuments function to ensure proper authentication and handle redirects
export async function getDocuments(): Promise<Document[]> {
  try {
    // Get the token directly to log and verify it
    const token = getToken()
    console.log("Using token for documents request:", token ? "Token exists" : "No token found")

    // Make sure we're using the correct endpoint with trailing slash
    const response = await fetch(`${API_URL}/documents/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      // Add redirect: 'follow' to handle redirects properly
      redirect: "follow",
    })

    console.log("Documents API response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Failed to fetch documents: ${response.status}, message: ${errorText}`)
      throw new Error(`Failed to fetch documents: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching documents:", error)
    throw error
  }
}

// Update document name
export async function updateDocumentName(documentId: number, filename: string): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/documents/${documentId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ filename }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Failed to update document name: ${response.status}, message: ${errorText}`)
      throw new Error(`Failed to update document name: ${response.status}`)
    }
  } catch (error) {
    console.error("Error updating document name:", error)
    throw error
  }
}

// Modifique a função uploadDocument para enviar o subject_id como um parâmetro de consulta
export async function uploadDocument(subjectId: number, file: File): Promise<UploadDocumentResponse> {
  try {
    const formData = new FormData()
    formData.append("file", file)

    // Agora enviamos o subject_id como um parâmetro de consulta na URL
    const response = await fetch(`${API_URL}/documents/upload?subject_id=${subjectId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Failed to upload document: ${response.status}, message: ${errorText}`)
      throw new Error(`Failed to upload document: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Upload document error:", error)
    throw error
  }
}

export async function deleteDocument(documentId: number): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/documents/${documentId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Failed to delete document: ${response.status}, message: ${errorText}`)
      throw new Error(`Failed to delete document: ${response.status} ${response.statusText}`)
    }
  } catch (error) {
    console.error("Delete document error:", error)
    throw error
  }
}
