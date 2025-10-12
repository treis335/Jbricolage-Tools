"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"
import { QRCodeSVG } from "qrcode.react"
import { Download } from "lucide-react"

interface UserQRModalProps {
  open: boolean
  onClose: () => void
  userId: string
}

export function UserQRModal({ open, onClose, userId }: UserQRModalProps) {
  const user = useStore((state) => state.users.find((u) => u.id === userId))

  if (!user) return null

  const handleDownload = () => {
    const canvas = document.getElementById("user-qr-code") as HTMLCanvasElement
    if (!canvas) return

    const svg = canvas.querySelector("svg")
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(svgBlob)

    const link = document.createElement("a")
    link.href = url
    link.download = `qr-${user.qrCodeData}.svg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code - {user.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-4">
            <div id="user-qr-code" className="rounded-lg border bg-white p-4">
              <QRCodeSVG value={user.qrCodeData || user.id} size={200} level="H" includeMargin />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.role}</p>
              <p className="mt-2 font-mono text-sm font-bold">{user.qrCodeData}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleDownload} className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Download QR Code
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Fechar
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Use este QR Code para identificação rápida do usuário no armazém. Escaneie com a pistola leitora para acesso
            rápido às ferramentas atribuídas.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
