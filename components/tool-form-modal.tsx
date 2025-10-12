"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useStore } from "@/lib/store"
import { toast } from "sonner"

interface ToolFormModalProps {
  open: boolean
  onClose: () => void
  tool?: { id: string; name: string; barcode: string; photo?: string }
}

export function ToolFormModal({ open, onClose, tool }: ToolFormModalProps) {
  const [name, setName] = useState(tool?.name || "")
  const [barcode, setBarcode] = useState(tool?.barcode || "")
  const [photo, setPhoto] = useState(tool?.photo || "")
  const [photoPreview, setPhotoPreview] = useState(tool?.photo || "")

  const addTool = useStore((state) => state.addTool)
  const updateTool = useStore((state) => state.updateTool)
  const tools = useStore((state) => state.tools)

  const generateBarcode = () => {
    const maxNumber = tools.reduce((max, t) => {
      const match = t.barcode.match(/TOOL-(\d+)/)
      return match ? Math.max(max, Number.parseInt(match[1])) : max
    }, 0)
    setBarcode(`TOOL-${String(maxNumber + 1).padStart(3, "0")}`)
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setPhoto(result)
        setPhotoPreview(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !barcode) {
      toast.error("Preencha todos os campos obrigatórios")
      return
    }

    if (tool) {
      updateTool(tool.id, { name, barcode, photo })
      toast.success("Ferramenta atualizada com sucesso!")
    } else {
      addTool({ name, barcode, photo, status: "available" })
      toast.success("Ferramenta adicionada com sucesso!")
    }

    onClose()
    setName("")
    setBarcode("")
    setPhoto("")
    setPhotoPreview("")
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{tool ? "Editar Ferramenta" : "Adicionar Ferramenta"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Ferramenta *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Berbequim"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="barcode">Código de Barras *</Label>
            <div className="flex gap-2">
              <Input
                id="barcode"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Ex: TOOL-001"
                required
              />
              <Button type="button" onClick={generateBarcode} variant="outline">
                Gerar
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo">Foto</Label>
            <div className="flex items-center gap-4">
              <Input id="photo" type="file" accept="image/*" onChange={handlePhotoChange} className="flex-1" />
              {photoPreview && (
                <img
                  src={photoPreview || "/placeholder.svg"}
                  alt="Preview"
                  className="h-16 w-16 rounded-lg object-cover"
                />
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">{tool ? "Atualizar" : "Adicionar"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
