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

export function UserNav({ user }: UserNavProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch (e) {
      console.error('Error signing out on client:', e)
    }
    window.dispatchEvent(new Event('auth-state-change'))
    await logoutAction()
    router.refresh()
    setIsOpen(false)
    setIsLoggingOut(false)
  }

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
