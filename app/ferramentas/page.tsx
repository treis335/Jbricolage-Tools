
"use client"

import { useState, useMemo, useEffect } from "react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ToolFormModal } from "@/components/tool-form-modal"
import { ToolSearchModal } from "@/components/tool-search-modal"
import { PrintQRToolsButton } from "@/components/print-qr-tools-button"
import { useStore } from "@/lib/store"
import { Plus, Pencil, Trash2, QrCode, Search, Printer } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import jsPDF from "jspdf"
import QRCode from "qrcode"

// Define Tool interface to match ToolFormModalProps
interface Tool {
  id: string;
  name: string;
  barcode: string;
  photo?: string;
  status?: string;
  assignedTo?: string | null;
}

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

export default function FerramentasPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null)
  const [showQR, setShowQR] = useState<string | null>(null)
  const [showQRDetails, setShowQRDetails] = useState<Tool | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [qrSize, setQrSize] = useState(120) // State to manage responsive size

  // Determine QR size based on screen width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setQrSize(120)
      else if (window.innerWidth < 1024) setQrSize(150)
      else setQrSize(180)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const tools = useStore((state) => state.tools) as Tool[]
  const users = useStore((state) => state.users)
  const assignments = useStore((state) => state.assignments)
  const deleteTool = useStore((state) => state.deleteTool)
  const currentUser = useStore((state) => state.currentUser)

  const isAdmin = currentUser?.role === "admin"

  const filteredTools = useMemo(() => {
    if (!searchTerm) return tools
    const term = searchTerm.toLowerCase()
    return tools.filter((tool) => {
      const user = tool.status === "assigned" && tool.assignedTo ? users.find((u) => u.id === tool.assignedTo) : null
      return (
        tool.name.toLowerCase().includes(term) ||
        tool.barcode.toLowerCase().includes(term) ||
        (user && user.name.toLowerCase().includes(term))
      )
    })
  }, [tools, users, searchTerm])

  const handleEdit = (tool: Tool) => {
    setSelectedTool(tool)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja deletar esta ferramenta?")) {
      deleteTool(id)
      toast.success("Ferramenta deletada com sucesso!", { duration: 3000 })
    }
  }

  const handleAddNew = () => {
    setSelectedTool(null)
    setIsModalOpen(true)
  }

  const handleShowQRDetails = (tool: Tool) => {
    setShowQRDetails(tool)
    setShowQR(null)
  }

  const handlePrintLabel = (tool: Tool) => {
    generateToolLabelPDF(tool)
  }

  const generateToolLabelPDF = async (tool: Tool) => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [36, 36],
      })

      doc.setLineWidth(0.1)
      doc.setDrawColor(150, 150, 150)
      doc.rect(3, 3, 30, 30)

      const qrDataUrl = await QRCode.toDataURL(tool.barcode, {
        width: 90,
        margin: 0,
        errorCorrectionLevel: "H",
        color: { dark: "#000000", light: "#FFFFFF" },
      })
      doc.addImage(qrDataUrl, "PNG", 6, 6, 24, 24)

      doc.setFontSize(6)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(0, 0, 0)
      const codeWidth = doc.getTextWidth(tool.barcode)
      doc.text(tool.barcode, 18 - codeWidth / 2, 31)

      if (tool.status === "assigned" && tool.assignedTo) {
        const user = users.find((u) => u.id === tool.assignedTo)
        const assignment = assignments.find(
          (a) => a.userId === tool.assignedTo && a.toolIds.includes(tool.id) && a.status === "pending"
        )
        const assignmentText = `${user?.name || ""}${user && assignment?.project ? " - " : ""}${assignment?.project || ""}`
        if (assignmentText) {
          const textWidth = doc.getTextWidth(assignmentText)
          doc.setFontSize(5)
          doc.setFont("helvetica", "normal")
          doc.text(assignmentText, 18 - textWidth / 2, 34)
        }
      }

      doc.save(`etiqueta-${tool.barcode}.pdf`)
      toast.success("Etiqueta PDF gerada!")
    } catch (error) {
      console.error("PDF error:", error)
      toast.error("Erro ao gerar etiqueta")
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-2 sm:p-3 md:p-4 lg:p-6">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="mx-auto max-w-7xl space-y-4 sm:space-y-6"
          >
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4"
            >
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                  Ferramentas
                </h2>
                <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-1">
                  Gerencie o inventário de ferramentas
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button
                  onClick={() => setIsSearchModalOpen(true)}
                  className="w-full sm:w-auto h-10 sm:h-12 gap-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 ripple bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Search className="h-4 w-4" />
                  Buscar Ferramenta
                </Button>
                {isAdmin && (
                  <>
                    <PrintQRToolsButton />
                    <Button
                      onClick={handleAddNew}
                      className="w-full sm:w-auto h-10 sm:h-12 gap-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 ripple bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Plus className="h-4 w-4" />
                      Adicionar
                    </Button>
                  </>
                )}
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filtrar por nome, código ou usuário..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full max-w-xs sm:max-w-sm md:max-w-md h-10 sm:h-12 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="shadow-md hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl md:text-2xl">
                    Lista de Ferramentas ({filteredTools.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                      <thead>
                        <tr className="border-b bg-gray-100 dark:bg-gray-700">
                          <th className="pb-2 px-2 sm:px-4 text-left text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
                            Foto
                          </th>
                          <th className="pb-2 px-2 sm:px-4 text-left text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
                            Nome
                          </th>
                          <th className="pb-2 px-2 sm:px-4 text-left text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
                            Código
                          </th>
                          <th className="pb-2 px-2 sm:px-4 text-left text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
                            Status
                          </th>
                          <th className="pb-2 px-2 sm:px-4 text-right text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <AnimatePresence>
                          {filteredTools.map((tool) => {
                            const user = tool.status === "assigned" && tool.assignedTo
                              ? users.find((u) => u.id === tool.assignedTo)
                              : null
                            const assignment = tool.status === "assigned" && tool.assignedTo
                              ? assignments.find(
                                  (a) => a.userId === tool.assignedTo && a.toolIds.includes(tool.id) && a.status === "pending"
                                )
                              : null
                            return (
                              <motion.tr
                                key={tool.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="border-b hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                              >
                                <td className="py-2 px-2 sm:px-4">
                                  {tool.photo && (
                                    <div className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-lg overflow-hidden">
                                      <Image
                                        src={tool.photo || "/placeholder.svg"}
                                        alt={tool.name}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 40px, 48px"
                                      />
                                    </div>
                                  )}
                                </td>
                                <td className="py-2 px-2 sm:px-4 text-xs sm:text-sm font-medium">{tool.name}</td>
                                <td className="py-2 px-2 sm:px-4 text-xs sm:text-sm">
                                  <code className="rounded bg-muted px-1 sm:px-2 py-1 text-xs">{tool.barcode}</code>
                                </td>
                                <td className="py-2 px-2 sm:px-4 text-xs sm:text-sm">
                                  <Badge
                                    variant={tool.status === "available" ? "default" : "secondary"}
                                    className={
                                      tool.status === "available"
                                        ? "bg-green-500 hover:bg-green-600 text-white rounded-full"
                                        : "bg-yellow-500 hover:bg-yellow-600 text-white rounded-full"
                                    }
                                  >
                                    {tool.status === "available"
                                      ? "Disponível"
                                      : `Atribuída a ${user?.name || "N/A"} - ${assignment?.project || "N/A"}`}
                                  </Badge>
                                </td>
                                <td className="py-2 px-2 sm:px-4 text-right">
                                  <div className="flex justify-end gap-1 sm:gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleShowQRDetails(tool)}
                                      className="h-8 sm:h-9 rounded-lg hover:scale-105 transition-transform"
                                    >
                                      <QrCode className="h-3 w-3 sm:h-4 sm:w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handlePrintLabel(tool)}
                                      className="h-8 sm:h-9 rounded-lg hover:scale-105 transition-transform"
                                    >
                                      <Printer className="h-3 w-3 sm:h-4 sm:w-4" />
                                    </Button>
                                    {isAdmin && (
                                      <>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleEdit(tool)}
                                          className="h-8 sm:h-9 rounded-lg hover:scale-105 transition-transform"
                                        >
                                          <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          onClick={() => handleDelete(tool.id)}
                                          className="h-8 sm:h-9 rounded-lg hover:scale-105 transition-transform"
                                        >
                                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </motion.tr>
                            )
                          })}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>

                  <div className="md:hidden space-y-3">
                    <AnimatePresence>
                      {filteredTools.map((tool) => {
                        const user = tool.status === "assigned" && tool.assignedTo
                          ? users.find((u) => u.id === tool.assignedTo)
                          : null
                        const assignment = tool.status === "assigned" && tool.assignedTo
                          ? assignments.find(
                              (a) => a.userId === tool.assignedTo && a.toolIds.includes(tool.id) && a.status === "pending"
                            )
                          : null
                        return (
                          <motion.div
                            key={tool.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20}}
                          >
                            <Card className="shadow-sm hover:shadow-md transition-all rounded-xl overflow-hidden">
                              <CardContent className="p-3 sm:p-4">
                                <div className="flex flex-col sm:flex-row gap-3">
                                  {tool.photo && (
                                    <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-lg overflow-hidden flex-shrink-0">
                                      <Image
                                        src={tool.photo || "/placeholder.svg"}
                                        alt={tool.name}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 640px) 64px, 80px"
                                      />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <h3 className="text-sm sm:text-base font-semibold truncate">{tool.name}</h3>
                                    <code className="text-xs sm:text-sm bg-muted px-1 sm:px-2 py-1 rounded">
                                      {tool.barcode}
                                    </code>
                                    <div className="mt-2">
                                      <Badge
                                        variant={tool.status === "available" ? "default" : "secondary"}
                                        className={
                                          tool.status === "available"
                                            ? "bg-green-500 hover:bg-green-600 text-white rounded-full text-xs sm:text-sm"
                                            : "bg-yellow-500 hover:bg-yellow-600 text-white rounded-full text-xs sm:text-sm"
                                        }
                                      >
                                        {tool.status === "available"
                                          ? "Disponível"
                                          : `Atribuída a ${user?.name || "N/A"} - ${assignment?.project || "N/A"}`}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2 mt-3">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleShowQRDetails(tool)}
                                    className="w-full sm:w-auto h-10 rounded-lg"
                                  >
                                    <QrCode className="h-4 w-4 mr-1 sm:mr-2" />
                                    Detalhes QR
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handlePrintLabel(tool)}
                                    className="w-full sm:w-auto h-10 rounded-lg"
                                  >
                                    <Printer className="h-4 w-4 mr-1 sm:mr-2" />
                                    Etiqueta QR
                                  </Button>
                                  {isAdmin && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleEdit(tool)}
                                        className="w-full sm:w-auto h-10 rounded-lg"
                                      >
                                        <Pencil className="h-4 w-4 mr-1 sm:mr-2" />
                                        Editar
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleDelete(tool.id)}
                                        className="w-full sm:w-auto h-10 rounded-lg"
                                      >
                                        <Trash2 className="h-4 w-4 mr-1 sm:mr-2" />
                                        Deletar
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </main>
      </div>

      <ToolFormModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedTool(null)
        }}
        tool={selectedTool ? { id: selectedTool.id, name: selectedTool.name, barcode: selectedTool.barcode, photo: selectedTool.photo } : undefined}
      />

      <ToolSearchModal open={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />

      <AnimatePresence>
        {showQRDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4"
            onClick={() => setShowQRDetails(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xs sm:max-w-sm md:max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 sm:p-6 overflow-y-auto max-h-[90vh]"
            >
              <Card className="bg-transparent border-0">
                <CardHeader className="p-0">
                  <CardTitle className="text-lg sm:text-xl md:text-2xl text-center text-gray-900 dark:text-gray-100">
                    Detalhes da Ferramenta
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  {showQRDetails.photo && (
                    <div className="flex justify-center">
                      <div className="relative h-24 w-24 sm:h-32 sm:w-32 rounded-xl overflow-hidden">
                        <Image
                          src={showQRDetails.photo}
                          alt={showQRDetails.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 96px, 128px"
                        />
                      </div>
                    </div>
                  )}
                  <div className="text-center space-y-2">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100">
                      {showQRDetails.name}
                    </h3>
                    <Badge
                      variant={showQRDetails.status === "available" ? "default" : "secondary"}
                      className={
                        showQRDetails.status === "available"
                          ? "bg-green-500 hover:bg-green-600 text-white text-xs sm:text-sm"
                          : "bg-yellow-500 hover:bg-yellow-600 text-white text-xs sm:text-sm"
                      }
                    >
                      {showQRDetails.status === "available"
                        ? "Disponível"
                        : `Atribuída a ${showQRDetails.assignedTo
                            ? users.find((u) => u.id === showQRDetails.assignedTo)?.name || "N/A"
                            : "N/A"} - ${showQRDetails.assignedTo
                            ? assignments.find(
                                (a) =>
                                  a.userId === showQRDetails.assignedTo &&
                                  a.toolIds.includes(showQRDetails.id) &&
                                  a.status === "pending"
                              )?.project || "N/A"
                            : "N/A"}`}
                    </Badge>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-2 sm:p-3 bg-white dark:bg-gray-700 rounded-xl shadow-sm">
                      <QRCodeSVG value={showQRDetails.barcode} size={qrSize} />
                    </div>
                    <code className="text-xs sm:text-sm md:text-base bg-muted px-2 py-1 rounded-full break-all text-center">
                      {showQRDetails.barcode}
                    </code>
                  </div>
                  <Button
                    onClick={() => setShowQRDetails(null)}
                    className="w-full h-10 sm:h-12 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-900 dark:text-gray-100"
                  >
                    Fechar
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4"
            onClick={() => setShowQR(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xs sm:max-w-sm md:max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 sm:p-6 overflow-y-auto max-h-[90vh]"
            >
              <Card className="bg-transparent border-0">
                <CardHeader className="p-0">
                  <CardTitle className="text-lg sm:text-xl md:text-2xl text-center text-gray-900 dark:text-gray-100">
                    Código QR
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex flex-col items-center gap-4">
                  <div className="p-2 sm:p-3 bg-white dark:bg-gray-700 rounded-xl shadow-sm">
                    <QRCodeSVG value={showQR} size={qrSize} />
                  </div>
                  <p className="text-xs sm:text-sm md:text-base text-muted-foreground text-center break-all">{showQR}</p>
                  <Button
                    onClick={() => setShowQR(null)}
                    className="w-full h-10 sm:h-12 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-900 dark:text-gray-100"
                  >
                    Fechar
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
