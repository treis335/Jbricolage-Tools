"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"
import { Printer, Loader2 } from "lucide-react"
import { toast } from "sonner"
import jsPDF from "jspdf"
import QRCode from "qrcode"

export function PrintQRUsersButton() {
  const users = useStore((state) => state.users)
  const [isGenerating, setIsGenerating] = useState(false)

  const generateUserQRPDF = useCallback(async () => {
    if (users.length === 0) {
      toast.error("Nenhum usuário para imprimir")
      return
    }

    setIsGenerating(true)

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      // Fetch logo as base64 for PDF
      const logoResponse = await fetch('/logologin.png')
      const logoBlob = await logoResponse.blob()
      const logoReader = new FileReader()
      let logoBase64 = ''
      logoReader.onload = () => { logoBase64 = logoReader.result as string }
      logoReader.readAsDataURL(logoBlob)
      await new Promise(resolve => logoReader.onloadend = resolve) // Wait for load

      // Even smaller logo at top left (like subtle watermark)
      if (logoBase64) {
        doc.addImage(logoBase64, "PNG", 15, 8, 10, 7) // Further reduced to 10x7mm
      }

      // Smaller, lighter "TOOLS" next to logo (watermark style)
      doc.setFontSize(8) // Even smaller font
      doc.setFont("helvetica", "bold")
      doc.setTextColor(150, 150, 150) // Lighter gray for watermark effect
      doc.text("TOOLS", 30, 14) // Adjusted position to align with smaller logo

      // Subtle header line below logo + TOOLS
      doc.setLineWidth(0.2)
      doc.setDrawColor(240, 240, 240) // Even lighter line
      doc.line(15, 20, 190, 20)

      // Table-like structure: No explicit header row, just clean rows
      const startY = 25 // Higher start to maximize space after header
      const colWidths = { photo: 35, name: 75, qr: 50 } // Slightly tighter columns
      const rowHeight = 40 // Reduced to fit ~2 more rows per page (total ~7 rows)

      let yPosition = startY

      for (const user of users) {
        if (!user.qrCodeData) continue

        // New page if needed
        if (yPosition > 260) { // Adjusted threshold for more rows
          doc.addPage()
          // Re-add even smaller logo and TOOLS on new page
          if (logoBase64) {
            doc.addImage(logoBase64, "PNG", 15, 8, 10, 7)
          }
          doc.setFontSize(8)
          doc.setFont("helvetica", "bold")
          doc.setTextColor(150, 150, 150)
          doc.text("TOOLS", 30, 14)
          doc.setLineWidth(0.2)
          doc.setDrawColor(240, 240, 240)
          doc.line(15, 20, 190, 20)
          yPosition = 25
        }

        // Generate QR as base64 (smaller pixel width for better scaling in PDF)
        const qrDataUrl = await QRCode.toDataURL(user.qrCodeData, {
          width: 150, // Reduced from 200 for smaller, sharper QR in PDF
          margin: 1,
          errorCorrectionLevel: 'H', // High error correction for readability even when scaled down
          color: { dark: "#000000", light: "#FFFFFF" } // Clean black/white
        })

        // Photo column with tighter margin
        const photoX = 20
        const photoY = yPosition + 5 // Reduced top padding
        if (user.photo) {
          try {
            doc.addImage(user.photo, "PNG", photoX, photoY, 25, 25) // Slightly smaller photo to fit
          } catch (imgError) {
            console.warn(`Erro ao adicionar foto para ${user.name}:`, imgError)
            // Placeholder circle with subtle margin
            doc.setFillColor(240, 240, 240)
            doc.circle(photoX + 12.5, photoY + 12.5, 12.5, "F") // Smaller circle
          }
        } else {
          doc.setFillColor(240, 240, 240)
          doc.circle(photoX + 12.5, photoY + 12.5, 12.5, "F")
        }

        // Name column with more space
        doc.setFontSize(9) // Smaller font for compactness
        doc.setFont("helvetica", "normal")
        doc.setTextColor(40, 40, 40)
        const nameX = photoX + colWidths.photo + 8 // Reduced left margin
        const nameY = photoY + 3 // Reduced top alignment
        const nameLines = doc.splitTextToSize(user.name, colWidths.name - 15)
        doc.text(nameLines, nameX, nameY + 12) // Centered vertically in row

        // QR column with more margin, smaller size
        const qrX = photoX + colWidths.photo + colWidths.name + 12 // Reduced left margin
        const qrY = photoY // Aligned with photo
        doc.addImage(qrDataUrl, "PNG", qrX, qrY, 25, 25) // Further reduced to 25x25mm for more per page

        // Optional very subtle row separator (thinner, lighter to avoid conflict/tightness)
        doc.setLineWidth(0.2)
        doc.setDrawColor(245, 245, 245) // Almost white/light gray for minimal visual weight
        doc.line(20, yPosition + rowHeight - 3, 190, yPosition + rowHeight - 3)

        yPosition += rowHeight // Consistent spacing
      }

      // Download
      doc.save("usuarios-qr.pdf")
      toast.success("PDF gerado com sucesso!")
    } catch (error) {
      console.error("[v0] PDF generation error:", error)
      toast.error("Erro ao gerar PDF")
    } finally {
      setIsGenerating(false)
    }
  }, [users])

  return (
    <Button
      onClick={generateUserQRPDF}
      disabled={isGenerating || users.length === 0}
      className="gap-2 min-h-[44px] rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ripple bg-transparent"
      variant="outline"
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Gerando PDF...
        </>
      ) : (
        <>
          <Printer className="h-4 w-4" />
          Imprimir Lista QR
        </>
      )}
    </Button>
  )
}