"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useStore } from "@/lib/store"
import { toast } from "sonner"

interface AssignmentFormModalProps {
  open: boolean
  onClose: () => void
  preselectedUserId?: string
}

export function AssignmentFormModal({ open, onClose, preselectedUserId }: AssignmentFormModalProps) {
  const [userId, setUserId] = useState("")
  const [selectedToolIds, setSelectedToolIds] = useState<string[]>([])
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [project, setProject] = useState("")

  const users = useStore((state) => state.users)
  const tools = useStore((state) => state.tools)
  const addAssignment = useStore((state) => state.addAssignment)

  const availableTools = tools.filter((tool) => tool.status === "available")

  useEffect(() => {
    if (preselectedUserId) {
      setUserId(preselectedUserId)
    }
  }, [preselectedUserId])

  const handleToolToggle = (toolId: string) => {
    setSelectedToolIds((prev) => (prev.includes(toolId) ? prev.filter((id) => id !== toolId) : [...prev, toolId]))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!userId || selectedToolIds.length === 0 || !project) {
      toast.error("Preencha todos os campos e selecione pelo menos uma ferramenta")
      return
    }

    const user = users.find((u) => u.id === userId)
    const selectedTools = tools.filter((t) => selectedToolIds.includes(t.id))

    if (!user) return

    addAssignment({
      userId,
      userName: user.name,
      toolIds: selectedToolIds,
      toolNames: selectedTools.map((t) => t.name),
      date,
      project,
      status: "pending",
    })

    toast.success("Ferramentas atribuídas com sucesso!")
    onClose()
    setUserId("")
    setSelectedToolIds([])
    setDate(new Date().toISOString().split("T")[0])
    setProject("")
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Atribuir Ferramentas</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user">Usuário *</Label>
            <Select value={userId} onValueChange={setUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um usuário" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} - {user.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Ferramentas Disponíveis *</Label>
            <div className="max-h-[300px] space-y-2 overflow-y-auto rounded-lg border p-4">
              {availableTools.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma ferramenta disponível</p>
              ) : (
                availableTools.map((tool) => (
                  <div key={tool.id} className="flex items-center gap-3 rounded-lg border p-3">
                    <Checkbox
                      id={tool.id}
                      checked={selectedToolIds.includes(tool.id)}
                      onCheckedChange={() => handleToolToggle(tool.id)}
                    />
                    {tool.photo && (
                      <img
                        src={tool.photo || "/placeholder.svg"}
                        alt={tool.name}
                        className="h-12 w-12 rounded object-cover"
                      />
                    )}
                    <Label htmlFor={tool.id} className="flex-1 cursor-pointer text-sm font-medium">
                      {tool.name}
                      <span className="ml-2 text-xs text-muted-foreground">({tool.barcode})</span>
                    </Label>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data *</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project">Obra/Projeto *</Label>
              <Input
                id="project"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                placeholder="Ex: Obra Centro"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Atribuir</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
