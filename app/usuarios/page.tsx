"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserFormModal } from "@/components/user-form-modal"
import { UserQRModal } from "@/components/user-qr-modal"
import { PrintQRUsersButton } from "@/components/print-qr-users-button"
import { useStore } from "@/lib/store"
import { Plus, Pencil, Trash2, QrCode } from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function UsuariosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [qrModalUserId, setQrModalUserId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const users = useStore((state) => state.users)
  const deleteUser = useStore((state) => state.deleteUser)
  const currentUser = useStore((state) => state.currentUser)

  const isAdmin = currentUser?.role === "admin"

  const handleEdit = (user: any) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja deletar este usuário?")) {
      deleteUser(id)
      toast.success("Usuário deletado com sucesso!", { duration: 3000 })
    }
  }

  const handleAddNew = () => {
    setSelectedUser(null)
    setIsModalOpen(true)
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-4 md:p-6">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="mx-auto max-w-7xl space-y-6"
          >
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Usuários</h2>
                <p className="text-sm text-muted-foreground mt-1">Gerencie os usuários do sistema</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                {isAdmin && <PrintQRUsersButton />}
                {isAdmin && (
                  <Button
                    onClick={handleAddNew}
                    className="w-full sm:w-auto min-h-[44px] gap-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 ripple"
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar
                  </Button>
                )}
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden bg-white/80 dark:bg-black/30 backdrop-blur-md border-0">
                <CardHeader>
                  <CardTitle className="font-bold">Lista de Usuários ({users.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="pb-3 px-4 text-left text-sm font-medium">Usuário</th>
                          <th className="pb-3 px-4 text-left text-sm font-medium">Ferramentas</th>
                          <th className="pb-3 px-4 text-left text-sm font-medium">Última Atribuição</th>
                          <th className="pb-3 px-4 text-center text-sm font-medium">QR Code</th>
                          {isAdmin && <th className="pb-3 px-4 text-right text-sm font-medium">Ações</th>}
                        </tr>
                      </thead>
                      <tbody>
                        <AnimatePresence>
                          {users.map((user) => (
                            <motion.tr
                              key={user.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="border-b hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 dark:hover:from-blue-900/10 dark:hover:to-indigo-900/10 transition-all"
                            >
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-12 w-12 border-2 border-primary/20 ring-2 ring-primary/10 hover:ring-primary/30 transition-all">
                                    {user.photo ? (
                                      <AvatarImage src={user.photo || "/placeholder.svg"} alt={user.name} />
                                    ) : (
                                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                                        {user.name
                                          .split(" ")
                                          .map((n) => n[0])
                                          .join("")
                                          .toUpperCase()
                                          .slice(0, 2)}
                                      </AvatarFallback>
                                    )}
                                  </Avatar>
                                  <span className="text-sm font-medium">{user.name}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-sm">
                                {user.assignedTools.length > 0 ? (
                                  <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-md">
                                    {user.assignedTools.length} ferramenta(s)
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground">Nenhuma</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-sm">{user.lastAssignment || "-"}</td>
                              <td className="py-3 px-4 text-center">
                                {user.qrCodeData && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setQrModalUserId(user.id)}
                                    title="Ver QR Code"
                                    className="min-h-[36px] rounded-lg hover:scale-110 transition-transform shadow-sm"
                                  >
                                    <QrCode className="h-4 w-4" />
                                  </Button>
                                )}
                              </td>
                              {isAdmin && (
                                <td className="py-3 px-4 text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleEdit(user)}
                                      className="min-h-[36px] rounded-lg hover:scale-110 transition-transform shadow-sm"
                                      title="Editar"
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleDelete(user.id)}
                                      disabled={user.assignedTools.length > 0}
                                      className="min-h-[36px] rounded-lg hover:scale-110 transition-transform shadow-sm"
                                      title="Deletar"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </td>
                              )}
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>

                  <div className="md:hidden space-y-4">
                    <AnimatePresence>
                      {users.map((user) => (
                        <motion.div
                          key={user.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                        >
                          <Card className="shadow-lg hover:shadow-xl transition-all rounded-2xl overflow-hidden bg-white/80 dark:bg-black/20 backdrop-blur border-0">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-4">
                                <Avatar className="h-16 w-16 border-4 border-primary/20 ring-2 ring-primary/10 flex-shrink-0">
                                  {user.photo ? (
                                    <AvatarImage src={user.photo || "/placeholder.svg"} alt={user.name} />
                                  ) : (
                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-lg">
                                      {user.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .toUpperCase()
                                        .slice(0, 2)}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold truncate">{user.name}</h3>
                                  <p className="text-xs text-muted-foreground">
                                    {user.assignedTools.length > 0
                                      ? `${user.assignedTools.length} ferramenta(s)`
                                      : "Nenhuma ferramenta"}
                                  </p>
                                  {user.lastAssignment && (
                                    <p className="text-xs text-muted-foreground mt-1">Última: {user.lastAssignment}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2 mt-4">
                                {user.qrCodeData && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setQrModalUserId(user.id)}
                                    className="flex-1 min-h-[44px] rounded-xl shadow-sm"
                                  >
                                    <QrCode className="h-4 w-4 mr-2" />
                                    QR Code
                                  </Button>
                                )}
                                {isAdmin && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleEdit(user)}
                                      className="flex-1 min-h-[44px] rounded-xl shadow-sm"
                                    >
                                      <Pencil className="h-4 w-4 mr-2" />
                                      Editar
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleDelete(user.id)}
                                      disabled={user.assignedTools.length > 0}
                                      className="min-h-[44px] rounded-xl shadow-sm"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </main>
      </div>

      <UserFormModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedUser(null)
        }}
        user={selectedUser}
      />

      {qrModalUserId && (
        <UserQRModal open={!!qrModalUserId} onClose={() => setQrModalUserId(null)} userId={qrModalUserId} />
      )}
    </div>
  )
}
