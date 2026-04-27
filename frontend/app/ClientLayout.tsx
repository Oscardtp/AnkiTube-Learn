"use client"

import { usePathname } from "next/navigation"
import { LandingLayout } from "@/components/layout/LandingLayout"
import { NotificationProvider } from "@/context/NotificationContext"
import { NotificationSystem } from "@/components/NotificationSystem"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith("/dashboard") || pathname?.startsWith("/settings") || pathname?.startsWith("/my-decks") || pathname?.startsWith("/preview") || pathname?.startsWith("/generate") || pathname?.startsWith("/admin") || pathname?.startsWith("/activate-license")

  const content = (
    <>
      {children}
      <NotificationSystem />
    </>
  )

  if (isDashboard) {
    return (
      <NotificationProvider>
        {content}
      </NotificationProvider>
    )
  }

  return (
    <NotificationProvider>
      <LandingLayout>{content}</LandingLayout>
    </NotificationProvider>
  )
}