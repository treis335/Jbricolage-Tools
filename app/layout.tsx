import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth"
import { Toaster } from "sonner"
import { Suspense } from "react"
import ServiceWorkerProvider from "@/components/ServiceWorkerProvider"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "JBricolage Tools",
  description: "Sistema de gerenciamento de ferramentas",
  generator: "v0.app",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [
      { rel: "icon", type: "image/png", sizes: "32x32", url: "/favicon-32x32.png" },
      { rel: "icon", type: "image/png", sizes: "16x16", url: "/favicon-16x16.png" },
    ],
  },
  manifest: "/site.webmanifest",
  themeColor: "#3b82f6",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <AuthProvider>
            <Suspense fallback={null}>
              {children}
              <Toaster position="top-right" richColors />
            </Suspense>
          </AuthProvider>
        </ThemeProvider>
        <ServiceWorkerProvider /> {/* Adicionado aqui */}
        <Analytics />
      </body>
    </html>
  )
}
