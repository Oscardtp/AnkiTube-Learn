"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"

interface MinimalNavbarProps {
  /** Si es true, el logo NO es un link (usado en /preview para evitar salida accidental) */
  logoNotLink?: boolean
}

export default function MinimalNavbar({ logoNotLink = false }: MinimalNavbarProps) {
  const [activeSection, setActiveSection] = useState<string>("")

  useEffect(() => {
    // Secciones a monitorear con Scroll Spy
    const sectionIds = ["hero", "features", "pricing"]
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            setActiveSection(entry.target.id)
          }
        })
      },
      {
        threshold: 0.5,
        rootMargin: "-80px 0px 0px 0px", // Ajuste para la barra de navegación fija
      }
    )

    // Observar cada sección si existe
    sectionIds.forEach((id) => {
      const element = document.getElementById(id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  const logo = (
    <Image
      src="/logo/ankitube-horizontal-brand.svg"
      alt="AnkiTube Learn"
      width={140}
      height={32}
      priority
      className="h-8 w-auto"
    />
  )

  const navLinks = [
    { href: "#hero", label: "Inicio", id: "hero" },
    { href: "#features", label: "Características", id: "features" },
    { href: "#pricing", label: "Precios", id: "pricing" },
  ]

  return (
    <nav className="w-full bg-surface/80 backdrop-blur-sm border-b border-outline-variant/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
        {/* Logo - Izquierda */}
        <div className="flex items-center">
          {logoNotLink ? (
            <div className="flex items-center gap-2">{logo}</div>
          ) : (
            <a href="/" className="flex items-center gap-2">
              {logo}
            </a>
          )}
        </div>

        {/* Navegación central - Solo visible en desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={link.href}
              className={`text-sm font-medium transition-colors duration-200 ${
                activeSection === link.id
                  ? "text-primary border-b-2 border-primary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Botones de autenticación - Derecha */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors duration-200 px-4 py-2"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium bg-primary text-white px-5 py-2.5 rounded-full hover:opacity-90 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Registrarse
          </Link>
        </div>
      </div>
    </nav>
  )
}
