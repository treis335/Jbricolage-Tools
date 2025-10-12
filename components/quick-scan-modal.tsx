"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useStore } from "@/lib/store"
import { Scan, User, Package } from "lucide-react"
import { toast } from "sonner"
import { ReturnToolsModal } from "./return-tools-modal"
import { AssignmentFormModal } from "./assignment-form-modal"

interface QuickScanModalProps {
  open: boolean
  onClose: () => void
}

export function QuickScanModal({ open, onClose }: QuickScanModalProps) {
  const [scanInput, setScanInput] = useState("")
  const [scannedUser, setScannedUser] = useState<any>(null)
  const [showReturnModal, setShowReturnModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)

  const findUserByQRCode = useStore((state) => state.findUserByQRCode)
  const assignments = useStore((state) => state.assignments)

  const handleScan = () => {
    if (!scanInput.trim()) {
      toast.error("Digite ou escaneie um código QR")
      return
    }

    const user = findUserByQRCode(scanInput.trim())
    if (user) {
      setScannedUser(user)
      toast.success(`Usuário ${user.name} carregado!`)
    } else {
      toast.error("Usuário não encontrado")
      setScannedUser(null)
    }
  }

  const handleReturn = () => {
    const userAssignments = assignments.filter((a) => a.userId === scannedUser.id && a.status === "pending")
    if (userAssignments.length === 0) {
      toast.error("Este usuário não possui ferramentas pendentes")
      return
    }
    setShowReturnModal(true)
  }

  const handleAssign = () => {
    setShowAssignModal(true)
  }

  const handleClose = () => {
    setScanInput("")
    setScannedUser(null)
    onClose()
  }

  const userAssignments = scannedUser
    ? assignments.filter((a) => a.userId === scannedUser.id && a.status === "pending")
    : []

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scan className="h-5 w-5" />
              Leitura Rápida QR
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="scan-input">Código QR do Usuário</Label>
              <div className="flex gap-2">
                <Input
                  id="scan-input"
                  placeholder="Ex: USER-001"
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleScan()}
                  className="font-mono"
                />
                <Button onClick={handleScan}>
                  <Scan className="mr-2 h-4 w-4" />
                  Escanear
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Simule o escaneamento digitando o código (ex: USER-001, USER-002, USER-003)
              </p>
            </div>

            {scannedUser && (
              <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-medium">{scannedUser.name}</p>
                    <p className="text-sm text-muted-foreground">{scannedUser.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {scannedUser.assignedTools.length > 0
                      ? `${scannedUser.assignedTools.length} ferramenta(s) atribuída(s)`
                      : "Nenhuma ferramenta atribuída"}
                  </span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button onClick={handleReturn} disabled={userAssignments.length === 0} className="flex-1">
                    Devolver Ferramentas
                  </Button>
                  <Button onClick={handleAssign} variant="outline" className="flex-1 bg-transparent">
                    Atribuir Ferramentas
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {showReturnModal && userAssignments[0] && (
        <ReturnToolsModal
          open={showReturnModal}
          onClose={() => {
            setShowReturnModal(false)
            handleClose()
          }}
          assignment={userAssignments[0]}
        />
      )}

      {showAssignModal && (
        <AssignmentFormModal
          open={showAssignModal}
          onClose={() => {
            setShowAssignModal(false)
            handleClose()
          }}
          preselectedUserId={scannedUser?.id}
        />
      )}
    </>
  )
}
