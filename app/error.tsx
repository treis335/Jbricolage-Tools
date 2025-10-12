"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[v0] Application error:", error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="max-w-md w-full shadow-xl rounded-2xl border-0 bg-white/80 dark:bg-black/30 backdrop-blur-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-xl font-bold">Algo deu errado</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Ocorreu um erro inesperado. Por favor, tente novamente.</p>
          {error.message && <div className="p-3 rounded-lg bg-muted/50 text-xs font-mono">{error.message}</div>}
          <Button
            onClick={reset}
            className="w-full min-h-[44px] rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 shadow-lg"
          >
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
