"use client"

import { useEffect, useRef, useState } from "react"
import { Html5QrcodeScanner } from "html5-qrcode"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useStore } from "@/lib/store"
import { toast } from "sonner"
import { Camera, X, Loader2, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion, AnimatePresence } from "framer-motion"

interface QRScannerModalProps {
  open: boolean
  onClose: () => void
  onUserScanned: (userId: string) => void
  users: { id: string; name: string; photo?: string }[]
}

export function QRScannerModal({ open, onClose, onUserScanned, users }: QRScannerModalProps) {
  const [manualCode, setManualCode] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [cameraError, setCameraError] = useState(false)
  const [showUserList, setShowUserList] = useState(false)
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([])
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null)
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const hasScannedRef = useRef(false)

  const findUserByQRCode = useStore((state) => state.findUserByQRCode)
  const setScannedUser = useStore((state) => state.setScannedUser)
  const setQuickScanMode = useStore((state) => state.setQuickScanMode)

  useEffect(() => {
    if (!open) {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error)
        scannerRef.current = null
      }
      setIsScanning(false)
      setIsInitializing(false)
      setCameraError(false)
      setManualCode("")
      setShowUserList(false)
      setAvailableCameras([])
      setSelectedCamera(null)
      hasScannedRef.current = false
    }
  }, [open])

  const handleScanSuccess = (decodedText: string) => {
    if (hasScannedRef.current) return
    hasScannedRef.current = true

    console.log("[v0] QR Code scanned:", decodedText)

    let qrCode = decodedText
    try {
      const parsed = JSON.parse(decodedText)
      if (parsed.id) {
        qrCode = `USER-${String(parsed.id).padStart(3, "0")}`
      }
    } catch {
      // Not JSON, use as-is
    }

    const user = findUserByQRCode(qrCode)

    if (user) {
      toast.success(`Usuário ${user.name} carregado!`)
      setScannedUser(user)
      setQuickScanMode(true)

      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error)
        scannerRef.current = null
      }

      onClose()
      onUserScanned(user.id)
    } else {
      toast.error("Usuário não encontrado!")
      hasScannedRef.current = false
    }
  }

  const startScanner = async () => {
    setIsInitializing(true)
    setCameraError(false)

    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter((device) => device.kind === "videoinput")
      setAvailableCameras(videoDevices)

      if (videoDevices.length === 0) {
        throw new Error("Nenhuma câmera encontrada no dispositivo.")
      }

      let stream
      const cameraConstraints = selectedCamera
        ? { deviceId: { exact: selectedCamera } }
        : [
            { facingMode: "environment" },
            { facingMode: "user" },
            {},
          ]

      for (const constraint of Array.isArray(cameraConstraints) ? cameraConstraints : [cameraConstraints]) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: constraint,
          })
          break
        } catch (err) {
          console.warn("[v0] Falha ao tentar constraint:", constraint, err)
        }
      }

      if (!stream) {
        throw new Error("Nenhuma câmera pôde ser acessada.")
      }

      stream.getTracks().forEach((track) => track.stop())

      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 300, height: 300 },
          aspectRatio: 1.0,
          videoConstraints: selectedCamera ? { deviceId: { exact: selectedCamera } } : { facingMode: "environment" },
        },
        false
      )

      scannerRef.current.render(handleScanSuccess, (error) => {
        if (!error.includes("NotFoundException")) {
          console.warn("[v0] QR Scan error:", error)
        }
      })

      setIsScanning(true)
      setIsInitializing(false)
      toast.success("Câmera ativada! Aponte para o QR code.")
    } catch (error) {
      console.error("[v0] Camera error:", error)
      setCameraError(true)
      setIsInitializing(false)
      let errorMessage = "Erro ao acessar a câmera."
      if (error.name === "NotAllowedError") {
        errorMessage = "Permissão para câmera negada. Permita o acesso nas configurações do navegador."
      } else if (error.name === "NotFoundError") {
        errorMessage = "Nenhuma câmera encontrada no dispositivo."
      }
      toast.error(errorMessage, {
        description: "Para produção, use HTTPS para acesso à câmera.",
        duration: 5000,
      })
    }
  }

  const handleManualSubmit = () => {
    if (!manualCode.trim()) {
      toast.error("Digite um código QR válido")
      return
    }

    handleScanSuccess(manualCode.trim())
  }

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error)
      scannerRef.current = null
    }
    setIsScanning(false)
  }

  const handleSelectUser = (userId: string) => {
    const formattedUserId = `USER-${String(userId).padStart(3, "0")}`
    handleScanSuccess(formattedUserId)
    setShowUserList(false)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-full h-[95vh] sm:h-auto sm:max-w-2xl flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl text-center">Leitura Rápida QR</DialogTitle>
          <DialogDescription className="text-center text-base">
            {isScanning ? "Aponte a câmera para o QR code do usuário" : "Ative a câmera ou digite manualmente"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto">
          {!isScanning && !isInitializing && !cameraError && (
            <Button
              onClick={startScanner}
              size="lg"
              className="w-full h-16 text-lg font-semibold bg-green-600 hover:bg-green-700"
            >
              <Camera className="mr-2 h-6 w-6" />
              Ativar Câmera e Escanear QR
            </Button>
          )}

          {isInitializing && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-lg font-medium">Ativando câmera...</p>
              <p className="text-sm text-muted-foreground">Permita o acesso quando solicitado</p>
            </div>
          )}

          {isScanning && (
            <div className="space-y-4">
              <div id="qr-reader" className="w-full rounded-lg overflow-hidden border-4 border-green-500 shadow-lg" />
              {availableCameras.length > 1 && (
                <div className="space-y-2">
                  <Label htmlFor="camera-select" className="text-base">
                    Selecionar Câmera
                  </Label>
                  <select
                    id="camera-select"
                    value={selectedCamera || ""}
                    onChange={(e) => {
                      setSelectedCamera(e.target.value)
                      stopScanner()
                      startScanner()
                    }}
                    className="w-full h-12 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {availableCameras.map((device) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Câmera ${device.deviceId}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <Button onClick={stopScanner} variant="outline" size="lg" className="w-full h-12 bg-transparent">
                <X className="mr-2 h-5 w-5" />
                Parar Scanner
              </Button>
            </div>
          )}

          {!isScanning && (
            <div className="space-y-4">
              {!isInitializing && (
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      {cameraError ? "Use entrada manual" : "Ou digite manualmente"}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Label htmlFor="manual-code" className="text-base">
                  Código QR ou Pistola de Leitura
                </Label>
                <Input
                  id="manual-code"
                  placeholder="USER-001"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleManualSubmit()
                    }
                  }}
                  className="h-14 text-lg"
                  autoFocus={cameraError}
                />
                <p className="text-xs text-muted-foreground">
                  Para pistola QR: escaneie e pressione Enter automaticamente
                </p>
              </div>

              <Button onClick={handleManualSubmit} className="w-full h-14 text-base" variant="secondary">
                Processar Código
              </Button>

              <div className="space-y-2">
                <Button
                  onClick={() => setShowUserList(!showUserList)}
                  variant="outline"
                  className="w-full h-14 text-base rounded-lg border-green-500 hover:bg-green-100 dark:hover:bg-green-900/20"
                  aria-label="Selecionar usuário da lista"
                >
                  <User className="mr-2 h-5 w-5" />
                  {showUserList ? "Ocultar Lista de Usuários" : "Selecionar Usuário da Lista"}
                </Button>
                <AnimatePresence>
                  {showUserList && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="max-h-[30vh] overflow-y-auto space-y-2 bg-white/80 dark:bg-black/30 backdrop-blur-md rounded-lg p-2"
                    >
                      {users.map((user) => (
                        <motion.div
                          key={user.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-md cursor-pointer transition-all"
                          onClick={() => handleSelectUser(user.id)}
                        >
                          <Avatar className="h-8 w-8 border">
                            {user.photo ? (
                              <AvatarImage src={user.photo || "/placeholder.svg"} alt={user.name} />
                            ) : (
                              <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                                {user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <span className="text-sm truncate">{user.name}</span>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}