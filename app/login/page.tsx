'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Code2, LogIn, Lock, Mail, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { loginAction } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      const res = await loginAction({ email, password })       // El formulario establece el estado de email y pass -> loginAction -> establece cookies -> signInWithPassword -> se devuelve true
      if (res.success) {                                       // Si res.success es true
        window.dispatchEvent(new Event('auth-state-change'))   // Se emite un evento global para notificar a otros componentes del cambio de estado de autenticación
        router.refresh()                                       // Se refresca la página para que se reflejen los cambios de cookies
        router.push('/snippets')                               // Se redirige al usuario a la página de snippets
      } else {
        setErrorMessage(res.error || 'Credenciales inválidas') // Si res.success es false, se muestra el error
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error al iniciar sesión')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="p-8 border border-border/80 rounded-2xl bg-card/90 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          {/* Barra de gradiente superior */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

          {/* Logo & Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <Code2 className="w-5 h-5 text-white" />
              </div>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">Bienvenido de nuevo</h1>
            <p className="text-xs text-muted-foreground mt-1.5">
              Inicia sesión para gestionar tus snippets de código privados
            </p>
          </div>

          {/* Mensaje de Error */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  required
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 bg-background/60 rounded-xl border-border/80 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11 bg-background/60 rounded-xl border-border/80 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 mt-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-md transition-all gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              <span>{isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}</span>
            </Button>
          </form>

          {/* Footer del Formulario */}
          <div className="text-center mt-6 pt-6 border-t border-border/50 text-xs text-muted-foreground">
            ¿No tienes cuenta aún?{' '}
            <Link href="/register" className="text-blue-400 hover:underline font-semibold">
              Crear una cuenta
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
