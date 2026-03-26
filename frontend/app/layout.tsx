import type { Metadata } from "next"
import "./globals.css"
import { LandingLayout } from "@/components/layout/LandingLayout"

export const metadata: Metadata = {
  title: "AnkiTube Learn — Convierte YouTube en mazos Anki con audio",
  description: "Genera flashcards Anki desde cualquier video de YouTube. Audio real embebido, nivel CEFR personalizado, explicaciones en español colombiano.",
  keywords: "anki youtube ingles, flashcards youtube español, aprender ingles videos youtube, mazos anki automaticos",
  icons: {
    icon: "/logo/ankitube-favicon-32.svg",
    apple: "/logo/ankitube-icon.svg",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-surface">
        <LandingLayout>{children}</LandingLayout>
      </body>
    </html>
  )
}
