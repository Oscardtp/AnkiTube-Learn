"use client"

import { usePathname } from "next/navigation"
import { useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { LandingLayout } from "@/components/layout/LandingLayout"
import { NotificationProvider } from "@/context/NotificationContext"
import { NotificationSystem } from "@/components/NotificationSystem"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith("/dashboard") || pathname?.startsWith("/settings") || pathname?.startsWith("/my-decks") || pathname?.startsWith("/preview") || pathname?.startsWith("/generate") || pathname?.startsWith("/admin") || pathname?.startsWith("/activate-license")

  const content = (
    <>
      {children}
      <NotificationSystem />
    </>
  )

  const dashboardContent = isDashboard ? (
    <NotificationProvider>
      {content}
    </NotificationProvider>
  ) : (
    <NotificationProvider>
      <LandingLayout>{content}</LandingLayout>
    </NotificationProvider>
  )

  return (
    <QueryClientProvider client={queryClient}>
      {dashboardContent}
    </QueryClientProvider>
  )
}