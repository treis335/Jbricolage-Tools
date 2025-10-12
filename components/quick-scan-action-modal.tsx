"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useStore, type User } from "@/lib/store"
import { Package, RotateCcw, Eye, CheckCircle2, X } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { toast } from "sonner"

interface QuickScanActionModalProps {
  open: boolean
  onClose: () => void
  user: User
}

export function QuickScanActionModal({ open, onClose, user }: QuickScanActionModalProps) {
  const [activeTab, setActiveTab] = useState("assign")
  const [selectedToolIds, setSelectedToolIds] = useState<string[]>([])
  const [project, setProject] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const tools = useStore((state) => state.tools)
  const assignments = useStore((state) => state.assignments)
  const addAssignment = useStore((state) => state.addAssignment)
  const returnTools = useStore((state) => state.returnTools)
  const setQuickScanMode = useStore((state) => state.setQuickScanMode)
  const setScannedUser = useStore((state) => state.setScannedUser)

  const availableTools = tools.filter((t) => t.status === "available")
  const userTools = tools.filter((t) => user.assignedTools.includes(t.id))
  const userAssignment = assignments.find((a) => a.userId === user.id && a.status === "pending")

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const handleAssign = () => {
    if (selectedToolIds.length === 0) {
      toast.error("Selecione pelo menos uma ferramenta")
      return
    }

    if (!project.trim()) {
      toast.error("Digite o nome da obra/projeto")
      return
    }

    setIsProcessing(true)

    const selectedTools = tools.filter((t) => selectedToolIds.includes(t.id))
    const toolNames = selectedTools.map((t) => t.name)

    addAssignment({
      userId: user.id,
      userName: user.name,
      toolIds: selectedToolIds,
      toolNames,
      date: new Date().toISOString().split("T")[0],
      project: project.trim(),
      status: "pending",
    })

    toast.success(`${selectedToolIds.length} ferramenta(s) atribuída(s) com sucesso!`)

    // Reset form
    setSelectedToolIds([])
    setProject("")
    setIsProcessing(false)
  }

  const handleReturn = () => {
    if (selectedToolIds.length === 0) {
      toast.error("Selecione pelo menos uma ferramenta para devolver")
      return
    }

    if (!userAssignment) {
      toast.error("Nenhuma atribuição pendente encontrada")
      return
    }

    setIsProcessing(true)

    returnTools(userAssignment.id, selectedToolIds)

    toast.success(`${selectedToolIds.length} ferramenta(s) devolvida(s) com sucesso!`)

    // Reset form
    setSelectedToolIds([])
    setIsProcessing(false)
  }

  const handleFinalize = () => {
    setQuickScanMode(false)
    setScannedUser(null)
    onClose()
    toast.success("Sessão finalizada!")
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleFinalize()}>
      <DialogContent className="max-w-full h-[95vh] sm:h-auto sm:max-w-4xl flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl text-center">Ações Rápidas</DialogTitle>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto">
          <Card className="border-2 border-primary">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-2xl font-bold">{initials}</AvatarFallback>
                </Avatar>

                <div className="flex-1 text-center sm:text-left space-y-2">
                  <h3 className="text-2xl font-bold">{user.name}</h3>
                  <p className="text-muted-foreground">{user.role}</p>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    <Badge variant={user.assignedTools.length > 0 ? "default" : "secondary"}>
                      {user.assignedTools.length} {user.assignedTools.length === 1 ? "ferramenta" : "ferramentas"}
                    </Badge>
                    <Badge variant="outline">{new Date().toLocaleDateString("pt-BR")}</Badge>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <QRCodeSVG value={user.qrCodeData || ""} size={80} className="rounded border-2 p-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-14">
              <TabsTrigger value="assign" className="text-sm sm:text-base">
                <Package className="mr-2 h-4 w-4" />
                Atribuir
              </TabsTrigger>
              <TabsTrigger value="return" className="text-sm sm:text-base" disabled={userTools.length === 0}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Devolver
              </TabsTrigger>
              <TabsTrigger value="details" className="text-sm sm:text-base">
                <Eye className="mr-2 h-4 w-4" />
                Detalhes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="assign" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ferramentas Disponíveis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {availableTools.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Nenhuma ferramenta disponível</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {availableTools.map((tool) => (
                        <div
                          key={tool.id}
                          className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent"
                        >
                          <Checkbox
                            id={`tool-${tool.id}`}
                            checked={selectedToolIds.includes(tool.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedToolIds([...selectedToolIds, tool.id])
                              } else {
                                setSelectedToolIds(selectedToolIds.filter((id) => id !== tool.id))
                              }
                            }}
                          />
                          <Label htmlFor={`tool-${tool.id}`} className="flex-1 cursor-pointer">
                            <div className="flex items-center gap-3">
                              {tool.photo && (
                                <img
                                  src={tool.photo || "/placeholder.svg"}
                                  alt={tool.name}
                                  className="h-10 w-10 rounded object-cover"
                                />
                              )}
                              <div>
                                <p className="font-medium">{tool.name}</p>
                                <p className="text-xs text-muted-foreground">{tool.barcode}</p>
                              </div>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="project">Obra/Projeto</Label>
                    <Input
                      id="project"
                      placeholder="Ex: Obra Centro"
                      value={project}
                      onChange={(e) => setProject(e.target.value)}
                      className="h-12"
                    />
                  </div>

                  <Button
                    onClick={handleAssign}
                    disabled={selectedToolIds.length === 0 || !project.trim() || isProcessing}
                    className="w-full h-14 text-base"
                    size="lg"
                  >
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Confirmar Atribuição ({selectedToolIds.length})
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="return" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ferramentas Atribuídas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {userTools.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Nenhuma ferramenta atribuída</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {userTools.map((tool) => (
                        <div
                          key={tool.id}
                          className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent"
                        >
                          <Checkbox
                            id={`return-${tool.id}`}
                            checked={selectedToolIds.includes(tool.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedToolIds([...selectedToolIds, tool.id])
                              } else {
                                setSelectedToolIds(selectedToolIds.filter((id) => id !== tool.id))
                              }
                            }}
                          />
                          <Label htmlFor={`return-${tool.id}`} className="flex-1 cursor-pointer">
                            <div className="flex items-center gap-3">
                              {tool.photo && (
                                <img
                                  src={tool.photo || "/placeholder.svg"}
                                  alt={tool.name}
                                  className="h-10 w-10 rounded object-cover"
                                />
                              )}
                              <div>
                                <p className="font-medium">{tool.name}</p>
                                <p className="text-xs text-muted-foreground">{tool.barcode}</p>
                              </div>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    onClick={handleReturn}
                    disabled={selectedToolIds.length === 0 || isProcessing}
                    className="w-full h-14 text-base"
                    size="lg"
                    variant="secondary"
                  >
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Confirmar Devolução ({selectedToolIds.length})
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Histórico de Atribuições</CardTitle>
                </CardHeader>
                <CardContent>
                  {userAssignment ? (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Data:</span>
                        <span className="font-medium">{new Date(userAssignment.date).toLocaleDateString("pt-BR")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Projeto:</span>
                        <span className="font-medium">{userAssignment.project}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <Badge variant={userAssignment.status === "pending" ? "default" : "secondary"}>
                          {userAssignment.status === "pending" ? "Pendente" : "Devolvido"}
                        </Badge>
                      </div>
                      <div className="pt-2">
                        <p className="text-sm text-muted-foreground mb-2">Ferramentas:</p>
                        <div className="flex flex-wrap gap-2">
                          {userAssignment.toolNames.map((name, i) => (
                            <Badge key={i} variant="outline">
                              {name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">Nenhuma atribuição pendente</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="pt-4 border-t">
          <Button onClick={handleFinalize} variant="destructive" size="lg" className="w-full h-14 text-base">
            <X className="mr-2 h-5 w-5" />
            Finalizar Sessão
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
