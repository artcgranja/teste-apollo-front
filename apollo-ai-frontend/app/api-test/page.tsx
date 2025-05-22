"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { API_URL } from "@/lib/config"

export default function ApiTestPage() {
  const [status, setStatus] = useState<string>("Not tested")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testConnection = async () => {
    setLoading(true)
    setStatus("Testing...")

    try {
      // Try a simple OPTIONS request to check CORS
      const response = await fetch(`${API_URL}`, {
        method: "OPTIONS",
        mode: "cors",
      })

      setStatus(`Connection successful! Status: ${response.status}`)

      // Try to get response headers
      const headers: Record<string, string> = {}
      response.headers.forEach((value, key) => {
        headers[key] = value
      })

      setResult({
        status: response.status,
        statusText: response.statusText,
        headers,
      })
    } catch (error) {
      console.error("API test error:", error)
      setStatus(`Connection failed: ${error instanceof Error ? error.message : String(error)}`)
      setResult({ error: String(error) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-8">
      <h1 className="mb-6 text-3xl font-bold">API Connection Test</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            <strong>API URL:</strong> {API_URL}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connection Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Button onClick={testConnection} disabled={loading}>
              {loading ? "Testing..." : "Test Connection"}
            </Button>
          </div>

          <div className="mb-4">
            <p>
              <strong>Status:</strong> {status}
            </p>
          </div>

          {result && (
            <div className="rounded-md bg-gray-100 p-4 dark:bg-gray-800">
              <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
