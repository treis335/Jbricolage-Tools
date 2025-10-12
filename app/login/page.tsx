"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useStore } from "@/lib/store"
import { toast } from "sonner"
import { motion } from "framer-motion"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const login = useStore((state) => state.login)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate loading
    await new Promise((resolve) => setTimeout(resolve, 500))

    const success = login(username, password)

    if (success) {
      toast.success("Login realizado com sucesso!", { duration: 3000 })
      router.push("/dashboard")
    } else {
      toast.error("Credenciais inválidas")
    }

    setIsLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl rounded-2xl overflow-hidden bg-card/80 backdrop-blur">
          <CardHeader className="space-y-1 text-center pb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-md" // Fundo branco com sombra sutil para destaque
            >
              <img
                src="/logologin.png"
                alt="Logo da Firma"
                className="h-18 w-18 object-contain" // Tamanho ajustado para caber perfeitamente no container (64px); object-contain preserva proporção sem clip
              />
            </motion.div>
            <CardTitle className="text-2xl font-bold">Controle de Ferramentas</CardTitle>
            <CardDescription>Entre com suas credenciais para acessar o sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuário</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin ou armazem"
                  required
                  className="min-h-12 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="min-h-12 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button
                type="submit"
                className="w-full min-h-12 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ripple"
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 space-y-2 rounded-xl bg-muted/50 p-4 text-xs backdrop-blur"
            >
              <p className="font-semibold">Credenciais de teste:</p>
              <p>
                Admin: <code className="rounded bg-background px-2 py-1">admin</code> /{" "}
                <code className="rounded bg-background px-2 py-1">admin123</code>
              </p>
              <p>
                Armazém: <code className="rounded bg-background px-2 py-1">armazem</code> /{" "}
                <code className="rounded bg-background px-2 py-1">armazem123</code>
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}