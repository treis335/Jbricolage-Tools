"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useStore } from "@/lib/store"
import { Camera, Search, Loader2, Package } from "lucide-react"
import { Html5Qrcode } from "html5-qrcode"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

interface ToolSearchModalProps {
  open: boolean
  onClose: () => void
}

export function ToolSearchModal({ open, onClose }: ToolSearchModalProps) {
  const [activeTab, setActiveTab] = useState<"camera" | "manual">("camera")
  const [isScanning, setIsScanning] = useState(false)
  const [manualInput, setManualInput] = useState("")
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const scannerContainerRef = useRef<HTMLDivElement>(null)

  const tools = useStore((state) => state.tools)
  const users = useStore((state) => state.users)
  const scannedTool = useStore((state) => state.scannedTool)
  const setScannedTool = useStore((state) => state.setScannedTool)
  const findToolByBarcode = useStore((state) => state.findToolByBarcode)
  const addAssignment = useStore((state) => state.addAssignment)
  const updateTool = useStore((state) => state.updateTool)
  const currentUser = useStore((state) => state.currentUser)

  const isAdmin = currentUser?.role === "admin"

  // Filter available tools for manual search
  const filteredTools = useMemo(() => {
    if (!manualInput) return tools
    const query = manualInput.toLowerCase()
    return tools.filter((tool) => tool.name.toLowerCase().includes(query) || tool.barcode.toLowerCase().includes(query))
  }, [tools, manualInput])

  const startScanning = async () => {
    if (!scannerContainerRef.current) return

    try {
      setIsScanning(true)

      // Request camera permissions
      await navigator.mediaDevices.getUserMedia({ video: true })

      const scanner = new Html5Qrcode("tool-qr-reader")
      scannerRef.current = scanner

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          handleScanSuccess(decodedText)
        },
        () => {
          // Ignore scan errors
        },
      )
    } catch (error) {
      console.error("[v0] Camera error:", error)
      toast.error("Erro ao ativar câmera. Verifique as permissões.")
      setIsScanning(false)
    }
  }

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
        scannerRef.current.clear()
        scannerRef.current = null
      } catch (error) {
        console.error("[v0] Error stopping scanner:", error)
      }
    }
    setIsScanning(false)
  }

  const handleScanSuccess = (decodedText: string) => {
    console.log("[v0] Scanned tool barcode:", decodedText)

    // Find tool by barcode
    const tool = findToolByBarcode(decodedText)

    if (tool) {
      setScannedTool(tool)
      toast.success(`Ferramenta encontrada: ${tool.name}`)
      stopScanning()
    } else {
      toast.error("Ferramenta não encontrada")
    }
  }

  const handleManualSearch = (barcode: string) => {
    const tool = findToolByBarcode(barcode)
    if (tool) {
      setScannedTool(tool)
      toast.success(`Ferramenta encontrada: ${tool.name}`)
    } else {
      toast.error("Ferramenta não encontrada")
    }
  }

  const handleAssignTool = () => {
    if (!scannedTool || !selectedUserId) {
      toast.error("Selecione um usuário")
      return
    }

    const user = users.find((u) => u.id === selectedUserId)
    if (!user) return

    addAssignment({
      userId: user.id,
      userName: user.name,
      toolIds: [scannedTool.id],
      toolNames: [scannedTool.name],
      date: new Date().toISOString().split("T")[0],
      project: "Obra Geral",
      status: "pending",
    })

    toast.success(`${scannedTool.name} atribuída a ${user.name}`)
    handleClose()
  }

  const handleMarkAvailable = () => {
    if (!scannedTool) return

    updateTool(scannedTool.id, { status: "available", assignedTo: undefined })
    toast.success(`${scannedTool.name} marcada como disponível`)
    handleClose()
  }

  const handleClose = () => {
    stopScanning()
    setScannedTool(null)
    setManualInput("")
    setSelectedUserId("")
    onClose()
  }

  useEffect(() => {
    if (open && activeTab === "camera" && !isScanning && !scannedTool) {
      startScanning()
    }

    return () => {
      stopScanning()
    }
  }, [open, activeTab])

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Ferramenta
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {!scannedTool ? (
            <motion.div
              key="search"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "camera" | "manual")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="camera" className="gap-2">
                    <Camera className="h-4 w-4" />
                    Por QR Câmera
                  </TabsTrigger>
                  <TabsTrigger value="manual" className="gap-2">
                    <Search className="h-4 w-4" />
                    Manual
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="camera" className="space-y-4">
                  <div className="rounded-lg border bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground text-center mb-4">
                      Aponte a câmera para o código QR da ferramenta
                    </p>
                    <div
                      id="tool-qr-reader"
                      ref={scannerContainerRef}
                      className="w-full aspect-square max-w-md mx-auto rounded-lg overflow-hidden"
                    />
                    {isScanning && (
                      <div className="flex items-center justify-center gap-2 mt-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Escaneando...</span>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="manual" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="search">Buscar por nome ou código</Label>
                      <Input
                        id="search"
                        placeholder="Digite o nome ou código da ferramenta..."
                        value={manualInput}
                        onChange={(e) => setManualInput(e.target.value)}
                        className="mt-2"
                      />
                    </div>

                    <div className="max-h-[300px] overflow-y-auto space-y-2">
                      {filteredTools.map((tool) => (
                        <Card
                          key={tool.id}
                          className="cursor-pointer hover:bg-accent transition-colors"
                          onClick={() => handleManualSearch(tool.barcode)}
                        >
                          <CardContent className="p-4 flex items-center gap-4">
                            {tool.photo && (
                              <img
                                src={tool.photo || "/placeholder.svg"}
                                alt={tool.name}
                                className="h-12 w-12 rounded object-cover"
                              />
                            )}
                            <div className="flex-1">
                              <p className="font-medium">{tool.name}</p>
                              <code className="text-xs text-muted-foreground">{tool.barcode}</code>
                            </div>
                            <Badge
                              variant={tool.status === "available" ? "default" : "secondary"}
                              className={
                                tool.status === "available"
                                  ? "bg-green-600 hover:bg-green-700"
                                  : "bg-yellow-600 hover:bg-yellow-700"
                              }
                            >
                              {tool.status === "available" ? "Disponível" : "Atribuída"}
                            </Badge>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          ) : (
            <motion.div
              key="actions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <Card className="border-2 border-primary">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    {scannedTool.photo ? (
                      <img
                        src={scannedTool.photo || "/placeholder.svg"}
                        alt={scannedTool.name}
                        className="h-20 w-20 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center">
                        <Package className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">{scannedTool.name}</h3>
                      <code className="text-sm text-muted-foreground">{scannedTool.barcode}</code>
                      <div className="mt-2">
                        <Badge
                          variant={scannedTool.status === "available" ? "default" : "secondary"}
                          className={
                            scannedTool.status === "available"
                              ? "bg-green-600 hover:bg-green-700"
                              : "bg-yellow-600 hover:bg-yellow-700"
                          }
                        >
                          {scannedTool.status === "available" ? "Disponível" : "Atribuída"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <h4 className="font-semibold">Ações Rápidas</h4>

                {scannedTool.status === "available" && (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="user-select">Atribuir a Usuário</Label>
                      <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                        <SelectTrigger id="user-select" className="mt-2">
                          <SelectValue placeholder="Selecione um usuário" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleAssignTool} className="w-full min-h-12" disabled={!selectedUserId}>
                      Atribuir Ferramenta
                    </Button>
                  </div>
                )}

                {scannedTool.status === "assigned" && isAdmin && (
                  <Button onClick={handleMarkAvailable} className="w-full min-h-12 bg-transparent" variant="outline">
                    Marcar como Disponível
                  </Button>
                )}

                <Button onClick={handleClose} variant="secondary" className="w-full min-h-12">
                  Finalizar
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
