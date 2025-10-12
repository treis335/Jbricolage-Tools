"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"
import { Printer, Loader2 } from "lucide-react"
import { toast } from "sonner"
import jsPDF from "jspdf"
import QRCode from "qrcode"

export function PrintQRToolsButton() {
  const tools = useStore((state) => state.tools)
  const [isGenerating, setIsGenerating] = useState(false)

  const generateToolQRPDF = useCallback(async () => {
    if (tools.length === 0) {
      toast.error("Nenhuma ferramenta para imprimir")
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
        doc.addImage(logoBase64, "PNG", 15, 8, 10, 7)
      }

      // Smaller, lighter "TOOLS" next to logo (watermark style)
      doc.setFontSize(8)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(150, 150, 150)
      doc.text("TOOLS", 30, 14)

      // Subtle header line below logo + TOOLS
      doc.setLineWidth(0.2)
      doc.setDrawColor(240, 240, 240)
      doc.line(15, 20, 190, 20)

      // Table-like structure: No explicit header row, just clean rows
      const startY = 25 // Higher start to maximize space after header
      const colWidths = { photo: 35, name: 75, qr: 50 } // Slightly tighter columns
      const rowHeight = 40 // Reduced to fit ~7-8 rows per page

      let yPosition = startY

      for (const tool of tools) {
        // New page if needed
        if (yPosition > 260) {
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

        // Generate QR as base64 (barcode as data)
        const qrDataUrl = await QRCode.toDataURL(tool.barcode, {
          width: 150, // Smaller for sharpness
          margin: 1,
          errorCorrectionLevel: 'H', // High for readability
          color: { dark: "#000000", light: "#FFFFFF" }
        })

        // Photo column
        const photoX = 20
        const photoY = yPosition + 5
        if (tool.photo) {
          try {
            doc.addImage(tool.photo, "PNG", photoX, photoY, 25, 25)
          } catch (imgError) {
            console.warn(`Erro ao adicionar foto para ${tool.name}:`, imgError)
            doc.setFillColor(240, 240, 240)
            doc.circle(photoX + 12.5, photoY + 12.5, 12.5, "F")
          }
        } else {
          doc.setFillColor(240, 240, 240)
          doc.circle(photoX + 12.5, photoY + 12.5, 12.5, "F")
        }

        // Name column
        doc.setFontSize(9)
        doc.setFont("helvetica", "normal")
        doc.setTextColor(40, 40, 40)
        const nameX = photoX + colWidths.photo + 8
        const nameY = photoY + 3
        const nameLines = doc.splitTextToSize(tool.name, colWidths.name - 15)
        doc.text(nameLines, nameX, nameY + 12)

        // QR column
        const qrX = photoX + colWidths.photo + colWidths.name + 12
        const qrY = photoY
        doc.addImage(qrDataUrl, "PNG", qrX, qrY, 25, 25) // Small QR

        // Subtle row separator
        doc.setLineWidth(0.2)
        doc.setDrawColor(245, 245, 245)
        doc.line(20, yPosition + rowHeight - 3, 190, yPosition + rowHeight - 3)

        yPosition += rowHeight
      }

      // Download
      doc.save("ferramentas-qr.pdf")
      toast.success("PDF gerado com sucesso!")
    } catch (error) {
      console.error("[v0] PDF generation error:", error)
      toast.error("Erro ao gerar PDF")
    } finally {
      setIsGenerating(false)
    }
  }, [tools])

  return (
    <Button
      onClick={generateToolQRPDF}
      disabled={isGenerating || tools.length === 0}
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
          Lista QR Ferramentas
        </>
      )}
    </Button>
  )
}