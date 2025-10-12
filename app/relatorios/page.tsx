"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"
import { Download } from "lucide-react"
import { toast } from "sonner"

export default function RelatoriosPage() {
  const tools = useStore((state) => state.tools)
  const users = useStore((state) => state.users)
  const assignments = useStore((state) => state.assignments)

  const generateReport = () => {
    const report = `
RELATÓRIO DE CONTROLE DE FERRAMENTAS
=====================================

Data: ${new Date().toLocaleDateString("pt-BR")}

RESUMO GERAL
------------
Total de Ferramentas: ${tools.length}
Ferramentas Disponíveis: ${tools.filter((t) => t.status === "available").length}
Ferramentas Atribuídas: ${tools.filter((t) => t.status === "assigned").length}

Total de Usuários: ${users.length}
Usuários com Ferramentas: ${users.filter((u) => u.assignedTools.length > 0).length}

Total de Atribuições: ${assignments.length}
Atribuições Pendentes: ${assignments.filter((a) => a.status === "pending").length}
Atribuições Devolvidas: ${assignments.filter((a) => a.status === "returned").length}

FERRAMENTAS
-----------
${tools.map((t) => `${t.name} (${t.barcode}) - ${t.status === "available" ? "Disponível" : "Atribuída"}`).join("\n")}

USUÁRIOS COM FERRAMENTAS
------------------------
${users
  .filter((u) => u.assignedTools.length > 0)
  .map((u) => `${u.name} (${u.role}) - ${u.assignedTools.length} ferramenta(s)`)
  .join("\n")}

ATRIBUIÇÕES PENDENTES
---------------------
${assignments
  .filter((a) => a.status === "pending")
  .map((a) => `${a.userName} - ${a.toolNames.join(", ")} - ${a.project} (${a.date})`)
  .join("\n")}
    `.trim()

    const blob = new Blob([report], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `relatorio-ferramentas-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success("Relatório gerado com sucesso!")
  }

  const availableTools = tools.filter((t) => t.status === "available").length
  const assignedTools = tools.filter((t) => t.status === "assigned").length
  const pendingAssignments = assignments.filter((a) => a.status === "pending").length

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
                <p className="text-muted-foreground">Visualize e exporte relatórios do sistema</p>
              </div>
              <Button onClick={generateReport}>
                <Download className="mr-2 h-4 w-4" />
                Exportar Relatório
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total de Ferramentas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{tools.length}</div>
                  <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <p>Disponíveis: {availableTools}</p>
                    <p>Atribuídas: {assignedTools}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{users.length}</div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    <p>Com ferramentas: {users.filter((u) => u.assignedTools.length > 0).length}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total de Atribuições</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{assignments.length}</div>
                  <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <p>Pendentes: {pendingAssignments}</p>
                    <p>Devolvidas: {assignments.length - pendingAssignments}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Detalhes do Relatório</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="mb-2 font-semibold">Ferramentas por Status</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <span className="text-sm">Disponíveis</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">{availableTools}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <span className="text-sm">Atribuídas</span>
                      <span className="font-semibold text-yellow-600 dark:text-yellow-400">{assignedTools}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 font-semibold">Usuários Ativos</h3>
                  <div className="space-y-2">
                    {users
                      .filter((u) => u.assignedTools.length > 0)
                      .map((user) => (
                        <div key={user.id} className="flex items-center justify-between rounded-lg border p-3">
                          <div>
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.role}</p>
                          </div>
                          <span className="text-sm font-semibold">{user.assignedTools.length} ferramenta(s)</span>
                        </div>
                      ))}
                    {users.filter((u) => u.assignedTools.length > 0).length === 0 && (
                      <p className="text-sm text-muted-foreground">Nenhum usuário com ferramentas atribuídas</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
