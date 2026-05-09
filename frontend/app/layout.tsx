import type { Metadata } from "next"
import "./globals.css"
import ClientLayout from "./ClientLayout"

export const metadata: Metadata = {
  title: "AnkiTube Learn — Aprende ingles con YouTube",
  description: "Convierte cualquier video de YouTube en tarjetas Anki personalizadas. Pega el link, nosotros hacemos el resto. Hecho con amor desde Colombia.",
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
    <html lang="es" className="bg-background">
      <body className="min-h-screen">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
