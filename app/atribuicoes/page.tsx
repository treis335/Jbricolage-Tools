
"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AssignmentFormModal } from "@/components/assignment-form-modal"
import { GroupedAssignmentsTable } from "@/components/grouped-assignments-table"
import { useStore } from "@/lib/store"
import { Plus } from "lucide-react"
import { motion } from "framer-motion"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function AtribuicoesPage() {
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const assignments = useStore((state) => state.assignments)
  const currentUser = useStore((state) => state.currentUser)

  const isAdmin = currentUser?.role === "admin"

  // Debugging: Log to verify state change
  const handleOpenModal = () => {
    console.log("Opening modal...");
    setIsAssignModalOpen(true);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-2 sm:p-3 md:p-4 lg:p-6 overflow-x-hidden">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="mx-auto max-w-full sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl space-y-4 sm:space-y-6"
          >
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4"
            >
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                  Atribuições
                </h2>
                <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-1">
                  Atribua e gerencie ferramentas para usuários
                </p>
              </div>
              <Button
                onClick={handleOpenModal}
                className="w-full sm:w-auto h-10 sm:h-12 gap-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 bg-green-600 hover:bg-green-700 text-white z-10"
                aria-label="Nova Atribuição"
              >
                <Plus className="h-4 w-4" />
                Nova Atribuição
              </Button>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="shadow-md hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl md:text-2xl">
                    Atribuições Pendentes (Agrupadas por Usuário)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <GroupedAssignmentsTable />
                </CardContent>
              </Card>
            </motion.div>

            {isAdmin && (
              <motion.div variants={itemVariants}>
                <Card className="shadow-md hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl md:text-2xl">
                      Histórico Completo de Atribuições
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-x-auto">
                    {assignments.length === 0 ? (
                      <div className="py-6 sm:py-8 text-center text-muted-foreground text-sm sm:text-base">
                        Nenhuma atribuição registrada
                      </div>
                    ) : (
                      <table className="w-full min-w-[320px] sm:min-w-[600px]">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                          <tr className="border-b">
                            <th className="pb-2 px-2 sm:px-4 text-left text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
                              Usuário
                            </th>
                            <th className="pb-2 px-2 sm:px-4 text-left text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
                              Ferramentas
                            </th>
                            <th className="pb-2 px-2 sm:px-4 text-left text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
                              Data
                            </th>
                            <th className="pb-2 px-2 sm:px-4 text-left text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
                              Obra
                            </th>
                            <th className="pb-2 px-2 sm:px-4 text-left text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
                              Status
                            </th>
                            <th className="pb-2 px-2 sm:px-4 text-left text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
                              Devolução
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {assignments.map((assignment) => (
                            <motion.tr
                              key={assignment.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="border-b hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              <td className="py-2 px-2 sm:px-4 text-xs sm:text-sm font-medium truncate max-w-xs sm:max-w-none">
                                {assignment.userName}
                              </td>
                              <td className="py-2 px-2 sm:px-4 text-xs sm:text-sm truncate max-w-xs sm:max-w-none">
                                {assignment.toolNames.join(", ")}
                              </td>
                              <td className="py-2 px-2 sm:px-4 text-xs sm:text-sm">
                                {assignment.date}
                              </td>
                              <td className="py-2 px-2 sm:px-4 text-xs sm:text-sm truncate max-w-xs sm:max-w-none">
                                {assignment.project}
                              </td>
                              <td className="py-2 px-2 sm:px-4 text-xs sm:text-sm">
                                <Badge
                                  variant={assignment.status === "pending" ? "default" : "secondary"}
                                  className={
                                    assignment.status === "pending"
                                      ? "bg-yellow-500 hover:bg-yellow-600 text-white rounded-full"
                                      : "bg-green-500 hover:bg-green-600 text-white rounded-full"
                                  }
                                >
                                  {assignment.status === "pending" ? "Pendente" : "Devolvida"}
                                </Badge>
                              </td>
                              <td className="py-2 px-2 sm:px-4 text-xs sm:text-sm">
                                {assignment.returnDate || "-"}
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </main>
      </div>

      <AssignmentFormModal open={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} />
    </div>
  )
}
