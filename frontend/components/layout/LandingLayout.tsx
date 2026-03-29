"use client"

import Link from "next/link"
import Image from "next/image"

interface LandingLayoutProps {
  children: React.ReactNode
}

export function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <div className="min-h-screen bg-surface">
      {/* Main Content */}
      <main>
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
