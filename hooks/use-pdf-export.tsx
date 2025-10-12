"use client"

import { useState } from "react"
import jsPDF from "jspdf"
import { toast } from "sonner"
import type { User } from "@/lib/store"

export function usePDFExport() {
  const [isGenerating, setIsGenerating] = useState(false)

  const generateUserQRPDF = async (users: User[]) => {
    try {
      setIsGenerating(true)

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      // Minimal header
      pdf.setFontSize(14)
      pdf.setFont("helvetica", "bold")
      pdf.text("Lista QR Usuários", 105, 15, { align: "center" })

      let yPosition = 30

      for (const user of users) {
        // Check if we need a new page
        if (yPosition > 270) {
          pdf.addPage()
          yPosition = 20
        }

        // User name (left)
        pdf.setFontSize(12)
        pdf.setFont("helvetica", "bold")
        pdf.text(user.name, 20, yPosition)

        // Generate QR code as data URL
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        if (ctx) {
          canvas.width = 200
          canvas.height = 200

          // Create SVG string
          const svgString = `
            <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
              <rect width="200" height="200" fill="white"/>
              <text x="100" y="100" text-anchor="middle" font-size="16" fill="black">${user.qrCodeData || user.id}</text>
            </svg>
          `

          const img = new Image()
          const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" })
          const url = URL.createObjectURL(svgBlob)

          await new Promise((resolve) => {
            img.onload = () => {
              ctx.drawImage(img, 0, 0)
              URL.revokeObjectURL(url)
              resolve(null)
            }
            img.src = url
          })

          // Add QR image to PDF (right side, 2cm x 2cm)
          const qrDataUrl = canvas.toDataURL("image/png")
          pdf.addImage(qrDataUrl, "PNG", 170, yPosition - 5, 20, 20)
        }

        // Move to next user (1cm spacing)
        yPosition += 30
      }

      // Download
      const currentDate = new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")
      pdf.save(`lista-qr-usuarios-${currentDate}.pdf`)

      toast.success("PDF gerado com sucesso!", { duration: 3000 })
    } catch (error) {
      console.error("[v0] Error generating PDF:", error)
      toast.error("Erro ao gerar PDF")
    } finally {
      setIsGenerating(false)
    }
  }

  return { generateUserQRPDF, isGenerating }
}
