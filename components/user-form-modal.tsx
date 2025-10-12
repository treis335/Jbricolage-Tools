"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useStore } from "@/lib/store"
import { toast } from "sonner"
import { Upload, X } from "lucide-react"

interface UserFormModalProps {
  open: boolean
  onClose: () => void
  user?: { id: string; name: string; photo?: string }
}

export function UserFormModal({ open, onClose, user }: UserFormModalProps) {
  const [name, setName] = useState(user?.name || "")
  const [photo, setPhoto] = useState<string | undefined>(user?.photo)
  const [photoPreview, setPhotoPreview] = useState<string | undefined>(user?.photo)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addUser = useStore((state) => state.addUser)
  const updateUser = useStore((state) => state.updateUser)

  const handlePhotoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem válida")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB")
      return
    }

    // Create preview
    const previewUrl = URL.createObjectURL(file)
    setPhotoPreview(previewUrl)

    // Convert to base64
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      setPhoto(base64String)
    }
    reader.onerror = () => {
      toast.error("Erro ao carregar imagem")
    }
    reader.readAsDataURL(file)
  }, [])

  const handleRemovePhoto = useCallback(() => {
    setPhoto(undefined)
    setPhotoPreview(undefined)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()

      if (!name) {
        toast.error("Preencha o nome do usuário")
        return
      }

      try {
        if (user) {
          updateUser(user.id, { name, photo })
          toast.success("Usuário atualizado com sucesso!", { duration: 3000 })
        } else {
          addUser({ name, photo })
          toast.success("Usuário adicionado com sucesso!", { duration: 3000 })
        }

        onClose()
        setName("")
        setPhoto(undefined)
        setPhotoPreview(undefined)
      } catch (error) {
        toast.error("Erro ao salvar usuário")
      }
    },
    [name, photo, user, addUser, updateUser, onClose],
  )

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl bg-white/80 dark:bg-black/30 backdrop-blur-md border-0 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{user ? "Editar Usuário" : "Adicionar Usuário"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="photo" className="text-sm font-medium">
              Foto de Perfil
            </Label>
            <p className="text-xs text-muted-foreground">
              Carregue foto para perfil visual (ajuda identificar no dashboard)
            </p>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-4 border-primary/20 shadow-lg">
                {photoPreview ? (
                  <AvatarImage src={photoPreview || "/placeholder.svg"} alt={name || "Preview"} />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-2xl font-bold">
                    {name
                      ? name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)
                      : "?"}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  id="photo"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="min-h-10 rounded-lg"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Carregar Foto
                </Button>
                {photoPreview && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemovePhoto}
                    className="min-h-10 rounded-lg text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remover
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Nome Completo *
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: João Silva"
              required
              className="min-h-12 rounded-lg focus:ring-2 focus:ring-blue-500"
              aria-label="Nome do usuário"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="min-h-12 rounded-xl bg-transparent">
              Cancelar
            </Button>
            <Button
              type="submit"
              className="min-h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {user ? "Atualizar" : "Adicionar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
