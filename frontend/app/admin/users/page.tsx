"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, AlertCircle, Users, ChevronLeft, ChevronRight } from "lucide-react"
import { api } from "@/lib/api"

interface User {
  id: string
  email: string
  role: string
  generations_today: number
  tester_expires_at: string | null
  created_at: string
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [limit] = useState(20)
  const [twoFactorCode, setTwoFactorCode] = useState("")
  const [showTwoFactor, setShowTwoFactor] = useState(false)
  const [updatingRole, setUpdatingRole] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    const user = localStorage.getItem("user")
    if (user) {
      const userData = JSON.parse(user)
      if (userData.role !== "superadmin") {
        router.push("/")
        return
      }
    }

    fetchUsers()
  }, [page])

  async function fetchUsers() {
    try {
      const data = await api.getAdminUsers(page, limit) as { users: User[]; total: number }
      setUsers(data.users)
      setTotal(data.total)
      setShowTwoFactor(false)
      setError("")
    } catch (err: unknown) {
      const error = err as { status?: number; message?: string }
      if (error.status === 401) {
        setShowTwoFactor(true)
        setError("Se requiere código 2FA")
        return
      }
      const errorMessage = error.message || "Error al cargar usuarios"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdateRole(userId: string, newRole: string) {
    setUpdatingRole(userId)
    try {
      await api.updateAdminUserRole(userId, newRole, twoFactorCode || undefined)
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)))
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al actualizar rol"
      alert(errorMessage)
    } finally {
      setUpdatingRole(null)
    }
  }

  function handleTwoFactorSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    fetchUsers()
  }

  const totalPages = Math.ceil(total / limit)

  if (loading && !showTwoFactor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (showTwoFactor) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-on-surface mb-2">Verificación 2FA</h1>
            <p className="text-on-surface-variant">Ingresa el código de autenticación</p>
          </div>

          <form onSubmit={handleTwoFactorSubmit} className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/20 shadow-sm">
            {error && (
              <div className="mb-4 p-4 bg-error-container/30 rounded-xl border border-error/20">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-error" />
                  <p className="text-sm text-on-error-container">{error}</p>
                </div>
              </div>
            )}

            <div className="mb-6">
              <label htmlFor="twoFactor" className="block text-sm font-semibold text-on-surface mb-2">
                Código 2FA
              </label>
              <input
                id="twoFactor"
                type="text"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                placeholder="123456"
                className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-3 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-base bg-primary text-white hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                "Verificar"
              )}
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="bg-error-container/30 rounded-xl p-6 border border-error/20">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-error" />
            <h2 className="text-lg font-semibold text-on-error-container">Error</h2>
          </div>
          <p className="text-on-error-container">{error}</p>
        </div>
      </div>
    )
  }

  const roleColors: Record<string, string> = {
    user: "bg-surface-container-variant text-on-surface-variant",
    tester: "bg-primary-container/30 text-on-primary-container",
    premium: "bg-yellow-500/20 text-yellow-700",
    superadmin: "bg-error-container/30 text-on-error-container",
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-on-surface mb-2">Gestión de usuarios</h1>
        <p className="text-on-surface-variant">{total} usuarios registrados</p>
      </div>

      <div className="bg-surface-container-low rounded-xl border border-outline-variant/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-container">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Generaciones hoy
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Fecha de registro
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-surface-container/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-container/30 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-on-surface">{user.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${roleColors[user.role] || roleColors.user}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-on-surface">
                    {user.generations_today}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-on-surface-variant">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.role}
                      onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                      disabled={updatingRole === user.id}
                      className="bg-surface border border-outline-variant rounded-lg px-3 py-1 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-50"
                    >
                      <option value="user">user</option>
                      <option value="tester">tester</option>
                      <option value="premium">premium</option>
                      <option value="superadmin">superadmin</option>
                    </select>
                    {updatingRole === user.id && (
                      <Loader2 className="w-4 h-4 animate-spin inline-block ml-2" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-on-surface-variant">
            Mostrando {(page - 1) * limit + 1} a {Math.min(page * limit, total)} de {total} usuarios
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="p-2 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-4 py-2 text-sm font-medium text-on-surface">
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
