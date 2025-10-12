"use client"

import { useState, useMemo, useCallback } from "react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { GroupedAssignmentsTable } from "@/components/grouped-assignments-table"
import { QRScannerModal } from "@/components/qr-scanner-modal"
import { QuickScanActionModal } from "@/components/quick-scan-action-modal"
import { ToolSearchModal } from "@/components/tool-search-modal"
import { useStore } from "@/lib/store"
import { Wrench, Package, Users, Search, Camera } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import CountUp from "react-countup"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showQuickScan, setShowQuickScan] = useState(false)
  const [showActionModal, setShowActionModal] = useState(false)
  const [showToolSearch, setShowToolSearch] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const tools = useStore((state) => state.tools)
  const users = useStore((state) => state.users)
  const assignments = useStore((state) => state.assignments)
  const currentUser = useStore((state) => state.currentUser)
  const scannedUser = useStore((state) => state.scannedUser)
  const isQuickScanMode = useStore((state) => state.isQuickScanMode)

  const stats = useMemo(() => {
    const availableTools = tools.filter((t) => t.status === "available").length
    const pendingAssignments = assignments.filter((a) => a.status === "pending")
    const usersWithPendingTools = new Set(pendingAssignments.map((a) => a.userId)).size
    const totalToolsAssigned = pendingAssignments.reduce((sum, a) => sum + a.toolIds.length, 0)

    return { availableTools, usersWithPendingTools, totalToolsAssigned }
  }, [tools, assignments])

  const [toolSearchTerm, setToolSearchTerm] = useState("")
  const assignedTools = useMemo(() => {
    return tools
      .filter((t) => t.status === "assigned")
      .filter((t) => {
        if (!toolSearchTerm) return true
        const searchLower = toolSearchTerm.toLowerCase()
        const user = users.find((u) => u.id === t.assignedTo)
        return (
          t.name.toLowerCase().includes(searchLower) ||
          t.barcode.toLowerCase().includes(searchLower) ||
          user?.name.toLowerCase().includes(searchLower)
        )
      })
  }, [tools, users, toolSearchTerm])

  const handleUserScanned = useCallback(() => {
    setShowActionModal(true)
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} disabled={isQuickScanMode} />
        <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-hidden">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="mx-auto max-w-7xl space-y-4 sm:space-y-6 overflow-y-auto h-full pb-20 sm:pb-0"
          >
            <motion.div variants={itemVariants} className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              {(currentUser?.role === "warehouse-manager" || currentUser?.role === "admin") && (
                <Card className="border-2 border-green-500 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 shadow-xl overflow-hidden rounded-2xl">
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="text-lg sm:text-xl font-bold text-green-900 dark:text-green-100">
                      Leitura Rápida QR
                    </CardTitle>
                    <p className="text-xs sm:text-sm text-green-700 dark:text-green-300">
                      Escaneie o QR code do usuário para ações rápidas
                    </p>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => setShowQuickScan(true)}
                      size="lg"
                      className="w-full min-h-[44px] text-base sm:text-lg font-semibold shadow-lg hover:shadow-2xl transition-all duration-300 bg-green-600 hover:bg-green-700 animate-pulse-glow ripple rounded-xl"
                      aria-label="Escaneie QR para ações rápidas"
                    >
                      <Camera className="mr-2 h-6 w-6 sm:h-7 sm:w-7" />
                      Ativar Câmera e Escanear QR
                    </Button>
                  </CardContent>
                </Card>
              )}

              <Card className="border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 shadow-xl overflow-hidden rounded-2xl">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-lg sm:text-xl font-bold text-blue-900 dark:text-blue-100">
                    Procurar Ferramenta Ocupada
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
                    Busque ferramentas atribuídas por nome ou código
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Buscar por nome ou código..."
                      value={toolSearchTerm}
                      onChange={(e) => setToolSearchTerm(e.target.value)}
                      className="min-h-[44px] rounded-lg focus:ring-2 focus:ring-blue-500"
                      aria-label="Buscar ferramenta"
                    />
                    <Button
                      onClick={() => setShowToolSearch(true)}
                      size="lg"
                      variant="outline"
                      className="min-h-[44px] rounded-lg hover:scale-105 transition-transform"
                      aria-label="Escanear QR da ferramenta"
                    >
                      <Camera className="h-5 w-5" />
                    </Button>
                  </div>
                  {toolSearchTerm && (
                    <div className="text-xs text-muted-foreground">
                      {assignedTools.length} ferramenta(s) encontrada(s)
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <AnimatePresence>
              {toolSearchTerm && assignedTools.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  variants={itemVariants}
                >
                  <Card className="shadow-xl rounded-2xl overflow-hidden bg-white/80 dark:bg-black/30 backdrop-blur-md border-0">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold">Resultados da Busca</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {assignedTools.map((tool) => {
                          const user = users.find((u) => u.id === tool.assignedTo)
                          const assignment = assignments.find(
                            (a) =>
                              a.userId === tool.assignedTo && a.toolIds.includes(tool.id) && a.status === "pending",
                          )
                          return (
                            <motion.div
                              key={tool.id}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="p-4 border rounded-xl hover:shadow-lg transition-all bg-card"
                            >
                              <div className="flex items-start gap-3">
                                {tool.photo && (
                                  <img
                                    src={tool.photo || "/placeholder.svg"}
                                    alt={tool.name}
                                    className="w-12 h-12 object-cover rounded-lg"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-sm truncate">{tool.name}</h4>
                                  <p className="text-xs text-muted-foreground">{tool.barcode}</p>
                                  {user && (
                                    <div className="flex items-center gap-2 mt-2">
                                      <Avatar className="h-6 w-6 border">
                                        {user.photo ? (
                                          <AvatarImage src={user.photo || "/placeholder.svg"} alt={user.name} />
                                        ) : (
                                          <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                                            {user.name
                                              .split(" ")
                                              .map((n) => n[0])
                                              .join("")
                                              .toUpperCase()
                                              .slice(0, 2)}
                                          </AvatarFallback>
                                        )}
                                      </Avatar>
                                      <span className="text-xs truncate">{user.name}</span>
                                    </div>
                                  )}
                                  {assignment && (
                                    <div className="mt-2 space-y-1">
                                      <p className="text-xs text-muted-foreground">Data: {assignment.date}</p>
                                      <p className="text-xs text-muted-foreground">Obra: {assignment.project}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            >
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-sm text-muted-foreground">Visão geral do sistema de controle de ferramentas</p>
              </div>
            </motion.div>

            <motion.div
              variants={containerVariants}
              className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            >
              <motion.div variants={itemVariants}>
                <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden bg-white/80 dark:bg-black/30 backdrop-blur-md border-0">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ferramentas Disponíveis</CardTitle>
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      <CountUp end={stats.availableTools} duration={1.5} />
                    </div>
                    <p className="text-xs text-muted-foreground">de {tools.length} total</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden bg-white/80 dark:bg-black/30 backdrop-blur-md border-0">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Usuários com Ferramentas Pendentes</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      <CountUp end={stats.usersWithPendingTools} duration={1.5} />
                    </div>
                    <p className="text-xs text-muted-foreground">de {users.length} total</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="sm:col-span-2 lg:col-span-1 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden bg-white/80 dark:bg-black/30 backdrop-blur-md border-0">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Ferramentas Atribuídas</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      <CountUp end={stats.totalToolsAssigned} duration={1.5} />
                    </div>
                    <p className="text-xs text-muted-foreground">aguardando devolução</p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden bg-white/80 dark:bg-black/30 backdrop-blur-md border-0">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <CardTitle className="text-base sm:text-lg font-bold">
                      Atribuições Pendentes (Agrupadas por Usuário)
                    </CardTitle>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por usuário ou obra..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-64 min-h-[44px] rounded-lg focus:ring-2 focus:ring-blue-500"
                        aria-label="Buscar atribuições"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <GroupedAssignmentsTable />
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </main>
      </div>

      <QRScannerModal
        open={showQuickScan}
        onClose={() => setShowQuickScan(false)}
        onUserScanned={handleUserScanned}
        users={users}
      />

      {scannedUser && (
        <QuickScanActionModal open={showActionModal} onClose={() => setShowActionModal(false)} user={scannedUser} />
      )}

      <ToolSearchModal open={showToolSearch} onClose={() => setShowToolSearch(false)} />
    </div>
  )
}