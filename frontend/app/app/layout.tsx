"use client"

import { AppLayout } from "@/components/layout/AppLayout"
import { AuthProvider } from "@/context/AuthContext"

export default function AppRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <AppLayout>{children}</AppLayout>
    </AuthProvider>
  )
}
