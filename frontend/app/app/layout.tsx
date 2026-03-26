import { AppLayout } from "@/components/layout/AppLayout"

export const metadata = {
  title: "Entrenamiento | CallCenter Pro",
  description: "Mejora tu ingles para call center con simulaciones reales y practica interactiva.",
}

export default function AppRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppLayout>{children}</AppLayout>
}
