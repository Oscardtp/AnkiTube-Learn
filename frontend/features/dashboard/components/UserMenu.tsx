"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { useDashboardStore } from "../stores/useDashboardStore"
import MaterialIcon from "@/components/MaterialIcon"
import type { User } from "../types"

interface UserMenuProps {
  user: User
  onLogout: () => void
}

export function UserMenu({ user, onLogout }: UserMenuProps) {
  const { showUserMenu, toggleUserMenu, closeUserMenu } = useDashboardStore()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeUserMenu()
      }
    }
    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showUserMenu, closeUserMenu])

  const initial = user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={toggleUserMenu}
        className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center overflow-hidden border-2 border-white shadow-sm hover:ring-2 hover:ring-primary/20 transition-all"
        title="Menú de usuario"
      >
        <span className="text-lg font-bold text-primary">{initial}</span>
      </button>

      {showUserMenu && (
        <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-2xl border border-outline-variant/20 py-1.5 z-50 min-w-[180px]">
          <div className="px-4 py-2 border-b border-outline-variant/10">
            <p className="text-xs font-medium text-on-surface-variant truncate">{user.name || user.email}</p>
          </div>
          <Link
            href="/settings"
            onClick={closeUserMenu}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <MaterialIcon name="person" className="text-base" />
            <span>Mi perfil</span>
          </Link>
          <button
            onClick={() => { closeUserMenu(); onLogout() }}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-error hover:bg-error/5 transition-colors w-full text-left"
          >
            <MaterialIcon name="logout" className="text-base" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      )}
    </div>
  )
}
