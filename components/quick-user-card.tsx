"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useStore, type User } from "@/lib/store"
import { X, Package, RotateCcw, Eye } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { AssignmentFormModal } from "./assignment-form-modal"
import { ReturnToolsModal } from "./return-tools-modal"

interface QuickUserCardProps {
  user: User
  onClose: () => void
}

export function QuickUserCard({ user, onClose }: QuickUserCardProps) {
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showReturnModal, setShowReturnModal] = useState(false)
  const tools = useStore((state) => state.tools)
  const assignments = useStore((state) => state.assignments)

  const userTools = tools.filter((t) => user.assignedTools.includes(t.id))
  const userAssignment = assignments.find((a) => a.userId === user.id && a.status === "pending")

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <>
      <Card className="border-2 border-primary shadow-lg animate-in slide-in-from-top-4 duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-base sm:text-lg">Usuário Escaneado</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
              <AvatarFallback className="text-lg sm:text-xl font-bold">{initials}</AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-1">
              <h3 className="text-lg sm:text-xl font-bold">{user.name}</h3>
              <p className="text-sm text-muted-foreground">{user.role}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant={user.assignedTools.length > 0 ? "default" : "secondary"}>
                  {user.assignedTools.length} {user.assignedTools.length === 1 ? "ferramenta" : "ferramentas"}
                </Badge>
                {user.lastAssignment && (
                  <Badge variant="outline" className="text-xs">
                    Última: {new Date(user.lastAssignment).toLocaleDateString("pt-BR")}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex-shrink-0">
              <QRCodeSVG value={user.qrCodeData || ""} size={64} className="rounded border p-1" />
            </div>
          </div>

          {userTools.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Ferramentas Atribuídas:</p>
              <div className="flex flex-wrap gap-2">
                {userTools.map((tool) => (
                  <Badge key={tool.id} variant="secondary" className="text-xs">
                    {tool.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
            <Button onClick={() => setShowAssignModal(true)} className="w-full h-12 sm:h-10" size="sm">
              <Package className="mr-2 h-4 w-4" />
              Atribuir
            </Button>

            <Button
              onClick={() => setShowReturnModal(true)}
              variant="outline"
              className="w-full h-12 sm:h-10"
              size="sm"
              disabled={user.assignedTools.length === 0}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Devolver
            </Button>

            <Button variant="secondary" className="w-full h-12 sm:h-10" size="sm" onClick={onClose}>
              <Eye className="mr-2 h-4 w-4" />
              Fechar
            </Button>
          </div>
        </CardContent>
      </Card>

      <AssignmentFormModal
        open={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        preselectedUserId={user.id}
      />

      {userAssignment && (
        <ReturnToolsModal
          open={showReturnModal}
          onClose={() => setShowReturnModal(false)}
          assignment={userAssignment}
        />
      )}
    </>
  )
}
