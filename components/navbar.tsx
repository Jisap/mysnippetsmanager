'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Code2, LayoutGrid, Plus, Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UserNav } from '@/components/auth/user-nav'

/**
 * Navbar principal de la aplicación.
 *
 * Combina dos responsabilidades independientes:
 * 1. Tema claro/oscuro persistido en localStorage.
 * 2. Sincronización del estado de autenticación en el cliente,
 *    usando el SDK de Supabase (no depende de las cookies del servidor).
 *
 * La sesión mostrada aquí puede tardar un instante en reflejar cambios
 * hechos en el servidor (p. ej. tras un login por Server Action), porque
 * se basa en el listener `onAuthStateChange` del navegador, no en cookies
 * leídas server-side.
 */
export function Navbar() {
  const pathname = usePathname()
  const [isDark, setIsDark] = useState(true)

  // Evita el "flash" de contenido incorrecto: hasta que el componente no
  // esté montado en el cliente no sabemos el tema real (depende de
  // localStorage/matchMedia, que no existen en el render del servidor).
  const [mounted, setMounted] = useState(false)

  const [user, setUser] = useState<{ email?: string; id?: string } | null>(null)

  // --- Tema ---
  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    // Prioridad: preferencia guardada por el usuario > preferencia del sistema operativo.
    const dark = savedTheme ? savedTheme === 'dark' : prefersDark
    setIsDark(dark)
    document.documentElement.classList.toggle('dark', dark)
  }, [])

  // --- Autenticación ---
  useEffect(() => {
    const supabase = createClient()

    // Estado inicial: se pide el usuario actual al montar (o al cambiar de ruta).
    const syncUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user ? { email: data.user.email, id: data.user.id } : null)
    }

    syncUser()

    // Fuente de verdad reactiva: cualquier login/logout/refresh de token
    // dispara este listener automáticamente, sin necesidad de polling.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { email: session.user.email, id: session.user.id } : null)
    })

    // Refuerzo manual: `onAuthStateChange` no siempre se dispara al instante
    // cuando el cambio de sesión lo origina OTRO componente (p. ej. el logout
    // en UserNav). Este evento custom permite forzar una resincronización
    // inmediata sin esperar la propagación del listener de Supabase.
    const handleAuthEvent = () => {
      syncUser()
    }
    window.addEventListener('auth-state-change', handleAuthEvent)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('auth-state-change', handleAuthEvent)
    }
    // Se re-suscribe en cada cambio de ruta para evitar listeners obsoletos
    // en navegaciones largas dentro de la SPA.
  }, [pathname])

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  const navLinks = [
    { href: '/snippets', label: 'Mis Snippets', icon: LayoutGrid },
    { href: '/', label: 'Nuevo Snippet', icon: Plus },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md group-hover:shadow-blue-500/30 transition-all duration-300">
            <Code2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-base tracking-tight hidden sm:block">
            SnippetManager
          </span>
        </Link>

        {/* Enlaces de navegación */}
        <nav className="flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => {
            // '/snippets' se considera activo también en sub-rutas (p. ej. /snippets/123)
            const isActive = pathname === href || (href === '/snippets' && pathname.startsWith('/snippets'))
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 ${isActive
                  ? 'text-foreground bg-muted'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{label}</span>
                {isActive && (
                  // layoutId comparte la animación entre los distintos links:
                  // el fondo "se desliza" de un link activo a otro en vez de
                  // aparecer/desaparecer de golpe.
                  <motion.span
                    layoutId="navbar-active-pill"
                    className="absolute inset-0 rounded-lg bg-muted -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 36 }}
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Acciones: tema + navegación de usuario */}
        <div className="flex items-center gap-2">
          {/* Se renderiza solo cuando `mounted` es true para no mostrar un
              icono de tema incorrecto antes de leer localStorage. */}
          {mounted && (
            <button
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-200"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}

          {mounted && <UserNav user={user} />}
        </div>
      </div>
    </header>
  )
}