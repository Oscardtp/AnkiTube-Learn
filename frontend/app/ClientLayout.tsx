"use client"

import { NotificationProvider } from "@/context/NotificationContext"
import { NotificationSystem } from "@/components/NotificationSystem"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider>
      {children}
      <NotificationSystem />
    </NotificationProvider>
  )
}
