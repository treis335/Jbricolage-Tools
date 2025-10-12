"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { useStore, type Assignment } from "@/lib/store"
import { toast } from "sonner"

interface ReturnToolsModalProps {
  open: boolean
  onClose: () => void
  assignment: Assignment
}

export function ReturnToolsModal({ open, onClose, assignment }: ReturnToolsModalProps) {
  const [selectedToolIds, setSelectedToolIds] = useState<string[]>([])
  const returnTools = useStore((state) => state.returnTools)

  const handleToolToggle = (toolId: string) => {
    setSelectedToolIds((prev) => (prev.includes(toolId) ? prev.filter((id) => id !== toolId) : [...prev, toolId]))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedToolIds.length === 0) {
      toast.error("Selecione pelo menos uma ferramenta para devolver")
      return
    }

    returnTools(assignment.id, selectedToolIds)
    toast.success("Ferramentas devolvidas com sucesso!")
    onClose()
    setSelectedToolIds([])
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Devolver Ferramentas - {assignment.userName}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Selecione as ferramentas para devolver:</Label>
            <div className="space-y-2 rounded-lg border p-4">
              {assignment.toolIds.map((toolId, index) => (
                <div key={toolId} className="flex items-center gap-3">
                  <Checkbox
                    id={toolId}
                    checked={selectedToolIds.includes(toolId)}
                    onCheckedChange={() => handleToolToggle(toolId)}
                  />
                  <Label htmlFor={toolId} className="flex-1 cursor-pointer text-sm font-medium">
                    {assignment.toolNames[index]}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-muted p-3 text-sm">
            <p>
              <strong>Obra:</strong> {assignment.project}
            </p>
            <p>
              <strong>Data de Atribuição:</strong> {assignment.date}
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Confirmar Devolução</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
