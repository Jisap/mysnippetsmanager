'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { User, LogOut, LogIn, UserPlus, Sparkles, ChevronDown } from 'lucide-react'
import { logoutAction } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'

import { createClient } from '@/lib/supabase/client'

interface UserNavProps {
  user: {
    email?: string
    id?: string
  } | null
}

/**
 * Menú de usuario en la Navbar.
 *
 * Muestra botones de login/registro si no hay sesión, o un menú desplegable
 * con el email del usuario y la opción de cerrar sesión si la hay.
 *
 * El `user` llega como prop desde `Navbar`, que es quien mantiene el estado
 * de sesión sincronizado con Supabase (ver navbar.tsx). Este componente no
 * lee la sesión por sí mismo, solo la muestra y dispara el logout.
 */
export function UserNav({ user }: UserNavProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  /**
   * Cierra la sesión en las dos capas donde vive el estado de autenticación:
   *
   * 1. Cliente (SDK de Supabase en el navegador, vía localStorage/memoria).
   * 2. Servidor (cookies HTTP que lee el middleware en cada request).
   *
   * Si solo se limpiara una de las dos, quedarían inconsistentes: por
   * ejemplo, el cliente diría "deslogueado" pero un Server Component
   * seguiría viendo cookies válidas hasta que expiraran.
   */
  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      // 1) Cierra sesión del lado del cliente.
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch (e) {
      console.error('Error signing out on client:', e)
    }

    // 2) Avisa a Navbar para que resincronice su estado de inmediato, sin
    //    esperar a que se propague el listener onAuthStateChange.
    window.dispatchEvent(new Event('auth-state-change'))

    // 3) Limpia las cookies de sesión del lado del servidor (Server Action).
    await logoutAction()

    // 4) Fuerza el re-render de los Server Components con las cookies ya
    //    actualizadas, para que cualquier dato server-side dependiente del
    //    usuario quede coherente con el nuevo estado "sin sesión".
    router.refresh()

    setIsOpen(false)
    setIsLoggingOut(false)
  }

  // --- Usuario no autenticado: botones de login/registro ---
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm" className="text-xs h-8">
          <Link href="/login" className="flex items-center gap-1.5">
            <LogIn className="w-3.5 h-3.5" />
            <span>Iniciar Sesión</span>
          </Link>
        </Button>
        <Button
          asChild
          size="sm"
          className="text-xs h-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-sm"
        >
          <Link href="/register" className="flex items-center gap-1.5">
            <UserPlus className="w-3.5 h-3.5" />
            <span>Registrarse</span>
          </Link>
        </Button>
      </div>
    )
  }

  // Avatar simplificado: primera letra del email en mayúscula.
  // 'U' como fallback por si el objeto user llegara sin email.
  const initial = user.email ? user.email.charAt(0).toUpperCase() : 'U'

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full border border-border/70 bg-card hover:bg-muted/70 transition-all cursor-pointer group"
      >
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[11px] font-bold shadow-sm">
          {initial}
        </div>
        <span className="text-xs font-medium text-foreground max-w-[120px] truncate hidden sm:inline">
          {user.email}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-transform duration-200" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Capa invisible a pantalla completa: cerrar el menú al hacer
                clic en cualquier punto fuera de él (patrón "click outside"). */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 5 }}
              className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card/95 backdrop-blur-xl shadow-xl z-50 p-2 space-y-1"
            >
              <div className="px-3 py-2 border-b border-border/50">
                <p className="text-[11px] text-muted-foreground">Conectado como</p>
                <p className="text-xs font-medium text-foreground truncate mt-0.5">{user.email}</p>
              </div>

              <Link
                href="/snippets"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg text-foreground hover:bg-muted transition-colors w-full"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Mis Snippets</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg text-destructive hover:bg-destructive/10 transition-colors w-full text-left cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{isLoggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}