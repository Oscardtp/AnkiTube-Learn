"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  ArrowLeft,
  User,
  Bell,
  Volume2,
  Moon,
  Globe,
  Shield,
  HelpCircle,
  Mail,
  ChevronRight,
  Check,
  Loader2
} from "lucide-react"
import { motion } from "framer-motion"
import { useAuth } from "@/context/AuthContext"

export default function SettingsPage() {
  const { user, isLoading } = useAuth()
  const [notifications, setNotifications] = useState(true)
  const [sound, setSound] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [language, setLanguage] = useState("es")

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-on-surface-variant">Cargando configuracion...</p>
        </div>
      </div>
    )
  }

  const settingsSections = [
    {
      title: "Cuenta",
      items: [
        {
          icon: User,
          label: "Perfil",
          description: user?.email || "Tu informacion personal",
          action: "view",
        },
        {
          icon: Mail,
          label: "Correo electronico",
          description: user?.email || "No configurado",
          action: "view",
        },
        {
          icon: Shield,
          label: "Seguridad",
          description: "Contraseña y autenticacion",
          action: "navigate",
        },
      ],
    },
    {
      title: "Preferencias",
      items: [
        {
          icon: Bell,
          label: "Notificaciones",
          description: "Recordatorios de practica",
          action: "toggle",
          value: notifications,
          onChange: () => setNotifications(!notifications),
        },
        {
          icon: Volume2,
          label: "Sonido",
          description: "Efectos de sonido y audio",
          action: "toggle",
          value: sound,
          onChange: () => setSound(!sound),
        },
        {
          icon: Moon,
          label: "Modo oscuro",
          description: "Cambia la apariencia de la app",
          action: "toggle",
          value: darkMode,
          onChange: () => setDarkMode(!darkMode),
        },
        {
          icon: Globe,
          label: "Idioma de la interfaz",
          description: language === "es" ? "Espanol" : "English",
          action: "select",
        },
      ],
    },
    {
      title: "Soporte",
      items: [
        {
          icon: HelpCircle,
          label: "Centro de ayuda",
          description: "Preguntas frecuentes y tutoriales",
          action: "navigate",
        },
        {
          icon: Mail,
          label: "Contactar soporte",
          description: "Envianos un mensaje",
          action: "navigate",
        },
      ],
    },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Link 
          href="/app"
          className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Volver al inicio</span>
        </Link>
        <h1 className="text-2xl lg:text-3xl font-bold text-on-surface">
          Configuracion
        </h1>
        <p className="text-on-surface-variant mt-1">
          Personaliza tu experiencia de aprendizaje
        </p>
      </div>

      {/* Settings Sections */}
      {settingsSections.map((section, sectionIdx) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: sectionIdx * 0.1 }}
        >
          <h2 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-3 px-1">
            {section.title}
          </h2>
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden">
            {section.items.map((item, itemIdx) => {
              const Icon = item.icon
              const isLast = itemIdx === section.items.length - 1

              return (
                <div
                  key={item.label}
                  className={`flex items-center gap-4 p-4 ${
                    !isLast ? "border-b border-outline-variant/10" : ""
                  } ${item.action === "navigate" ? "cursor-pointer hover:bg-surface-container transition-colors" : ""}`}
                >
                  <div className="w-10 h-10 bg-surface-container rounded-xl flex items-center justify-center">
                    <Icon className="w-5 h-5 text-on-surface-variant" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-on-surface">{item.label}</p>
                    <p className="text-sm text-on-surface-variant truncate">
                      {item.description}
                    </p>
                  </div>

                  {item.action === "toggle" && (
                    <button
                      onClick={item.onChange}
                      className={`w-12 h-7 rounded-full transition-colors relative ${
                        item.value ? "bg-primary" : "bg-surface-container-high"
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                          item.value ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  )}

                  {item.action === "navigate" && (
                    <ChevronRight className="w-5 h-5 text-on-surface-variant" />
                  )}

                  {item.action === "view" && (
                    <Check className="w-5 h-5 text-secondary" />
                  )}

                  {item.action === "select" && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-primary font-medium">ES</span>
                      <ChevronRight className="w-4 h-4 text-on-surface-variant" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </motion.div>
      ))}

      {/* App Version */}
      <div className="text-center py-8">
        <p className="text-sm text-on-surface-variant">
          CallCenter Pro v1.0.0
        </p>
        <p className="text-xs text-on-surface-variant mt-1">
          Hecho con amor para ayudarte a conseguir tu trabajo
        </p>
      </div>
    </div>
  )
}
