"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Play, Sparkles, Menu, X } from "lucide-react"

interface LandingLayoutProps {
  children: React.ReactNode
}

export function LandingLayout({ children }: LandingLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-surface">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-surface/95 backdrop-blur-sm shadow-sm">
        <div className="flex justify-between items-center h-16 px-6 md:px-12 max-w-7xl mx-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo/ankitube-horizontal-light.svg"
              alt="AnkiTube Learn"
              width={180}
              height={40}
              className="h-8 w-auto"
              priority
            />
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex gap-8 items-center">
            <a href="#problema" className="text-on-surface-variant hover:text-primary transition-colors text-sm font-medium scroll-smooth">
              Características
            </a>
            <a href="#precios" className="text-on-surface-variant hover:text-primary transition-colors text-sm font-medium scroll-smooth">
              Precios
            </a>
            <a href="#faq" className="text-on-surface-variant hover:text-primary transition-colors text-sm font-medium scroll-smooth">
              FAQ
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-3 items-center">
            <Link
              href="/generate"
              className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-primary to-primary-container text-white px-5 py-2.5 rounded-full font-bold text-sm hover:opacity-90 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Generar mi primer mazo
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-on-surface-variant hover:text-on-surface transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-surface border-t border-outline-variant/20">
            <div className="px-6 py-4 space-y-3">
              <Link
                href="#caracteristicas"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-on-surface-variant hover:text-primary transition-colors py-2"
              >
                Características
              </Link>
              <Link
                href="#precios"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-on-surface-variant hover:text-primary transition-colors py-2"
              >
                Precios
              </Link>
              <Link
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-on-surface-variant hover:text-primary transition-colors py-2"
              >
                FAQ
              </Link>
              <Link
                href="/generate"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary-container text-white px-5 py-3 rounded-full font-bold text-sm mt-4"
              >
                <Sparkles className="w-4 h-4" />
                Generar mi primer mazo
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low py-12 px-6 md:px-12 border-t border-outline-variant/15">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {/* Brand */}
          <div>
            <Image
              src="/logo/ankitube-horizontal-light.svg"
              alt="AnkiTube Learn"
              width={140}
              height={32}
              className="h-7 w-auto mb-4"
            />
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Aprende inglés real, con contenido que te importa. De colombianos para el mundo.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-bold text-on-surface mb-4">Producto</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/generate" className="text-sm text-on-surface-variant hover:text-primary transition-colors">
                  Generar mazo
                </Link>
              </li>
              <li>
                <Link href="#caracteristicas" className="text-sm text-on-surface-variant hover:text-primary transition-colors">
                  Características
                </Link>
              </li>
              <li>
                <Link href="#precios" className="text-sm text-on-surface-variant hover:text-primary transition-colors">
                  Precios
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-on-surface mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-on-surface-variant hover:text-primary transition-colors">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-on-surface-variant hover:text-primary transition-colors">
                  Privacidad
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-on-surface mb-4">Contacto</h4>
            <a
              href="mailto:hola@ankitube.co"
              className="text-sm text-on-surface-variant hover:text-primary transition-colors"
            >
              hola@ankitubelearn.com
            </a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-outline-variant/10 text-center">
          <p className="text-sm text-on-surface-variant">
            © 2024 AnkiTube Learn. Hecho en Colombia con 💙.
          </p>
        </div>
      </footer>
    </div>
  )
}
