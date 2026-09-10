'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Code2,
  Sparkles,
  Zap,
  BookOpen,
  Image as ImageIcon,
  Search,
  Database,
  ArrowRight,
  CheckCircle2,
  Terminal,
  ShieldCheck,
  Cpu,
  Layers,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const DEMO_CODE = `// useSnippetManager.ts
import { useState, useEffect } from 'react'

export function useSnippet(slug: string) {
  const [snippet, setSnippet] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const res = await fetch(\`/api/snippets/\${slug}\`)
      const data = await res.json()
      setSnippet(data)
      setLoading(false)
    }
    load()
  }, [slug])

  return { snippet, loading }
}`

const FEATURES = [
  {
    icon: Terminal,
    title: 'Editor VS Code (Monaco)',
    description:
      'Escribe y edita código con la misma potencia y atajos que tu IDE favorito, con soporte para TypeScript, TSX, Python y CSS.',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    icon: Sparkles,
    title: 'Resaltado de Sintaxis Shiki',
    description:
      'Renderizado visual de alta precisión con múltiples temas integrados (GitHub Dark, Dracula, One Dark Pro).',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: BookOpen,
    title: 'Base de Conocimiento Markdown',
    description:
      'No olvides el porqué de tu código. Añade notas técnicas, parámetros, advertencias y ejemplos de uso en paralelo.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: ImageIcon,
    title: 'Exportador PNG (Estilo Carbon)',
    description:
      'Genera capturas en alta resolución con marco de ventana y fondos degradados listas para compartir en redes o chats.',
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: Search,
    title: 'Búsqueda Difusa Instantánea',
    description:
      'Motor Fuse.js ultrarrápido para encontrar cualquier función por título, descripción, tag o lenguaje sin latencia.',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    icon: Database,
    title: 'Backup & Restauración JSON',
    description:
      'Copia de seguridad en 1 clic de toda tu biblioteca para llevar tus snippets a cualquier parte con total soberanía.',
    color: 'from-emerald-500 to-teal-500',
  },
]

export function LandingPage() {
  const [activeTab, setActiveTab] = useState<'code' | 'notes'>('code')

  return (
    <div className="relative overflow-hidden">
      {/* Luces de fondo decorativas */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-600/20 via-purple-600/20 to-pink-600/10 blur-[140px] pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 text-center">
        {/* Eyebrow Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border/80 bg-card/60 backdrop-blur-md text-xs font-medium text-muted-foreground mb-6 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Gestor de Snippets de Código para Desarrolladores</span>
        </motion.div>

        {/* Titular Principal */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.15]"
        >
          Guarda, documenta y comparte tus snippets con{' '}
          <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            estilo y velocidad
          </span>
          .
        </motion.h1>

        {/* Subtítulo */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mt-6 leading-relaxed"
        >
          Construye tu base de conocimiento de código personal. Con editor Monaco integrado,
          resaltado Shiki, notas técnicas en Markdown, exportación PNG y búsqueda instantánea.
        </motion.p>

        {/* Botones CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mt-8"
        >
          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto h-12 px-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all gap-2"
          >
            <Link href="/register">
              <span>Crear Cuenta Gratis</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto h-12 px-8 rounded-xl border-border/80 bg-background/60 hover:bg-muted font-medium"
          >
            <Link href="/snippets">Explorar Snippets</Link>
          </Button>
        </motion.div>

        {/* Preview / Demo Interactiva */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="max-w-4xl mx-auto mt-14 text-left"
        >
          <div className="rounded-2xl border border-border/80 bg-card/90 backdrop-blur-xl shadow-2xl overflow-hidden">
            {/* Window Topbar */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#18181e] border-b border-border/60">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
                <span className="text-xs font-mono text-zinc-400 ml-2 hidden sm:inline">
                  useSnippetManager.ts
                </span>
              </div>

              {/* Selector Demo */}
              <div className="flex items-center gap-1 bg-zinc-900/80 p-0.5 rounded-lg border border-zinc-800 text-[11px]">
                <button
                  type="button"
                  onClick={() => setActiveTab('code')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    activeTab === 'code' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400'
                  }`}
                >
                  Código
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('notes')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    activeTab === 'notes' ? 'bg-purple-600 text-white font-semibold' : 'text-zinc-400'
                  }`}
                >
                  Notas & Explicación
                </button>
              </div>
            </div>

            {/* Window Content */}
            <div className="p-6 bg-[#121216] font-mono text-xs sm:text-sm text-zinc-300 leading-relaxed overflow-x-auto min-h-[220px]">
              {activeTab === 'code' ? (
                <pre className="!bg-transparent !p-0 !m-0 font-mono select-none">
                  <code>{DEMO_CODE}</code>
                </pre>
              ) : (
                <div className="space-y-3 font-sans text-xs sm:text-sm text-zinc-300">
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    📌 ¿Cómo funciona este hook?
                  </h4>
                  <p className="text-zinc-400 leading-relaxed">
                    Hook personalizado para obtener un snippet desde la API por su <code className="font-mono bg-zinc-800 px-1 py-0.5 rounded text-purple-400">slug</code> único.
                  </p>
                  <div className="border-l-2 border-purple-500 bg-purple-500/10 p-2.5 rounded-r text-xs text-purple-200">
                    💡 <strong>Tip:</strong> Puedes copiar o exportar este snippet como archivo <code className="font-mono">.ts</code> con 1 clic.
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Características Destacadas (Features Grid) */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-border/40">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight">
            Todo lo que necesitas para tu flujo de trabajo
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Diseñado para desarrolladores modernos que buscan orden, estética y rendimiento.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feat, index) => {
            const Icon = feat.icon
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="p-6 rounded-2xl border border-border/80 bg-card hover:border-border hover:shadow-xl transition-all duration-300 group"
              >
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center text-white mb-4 shadow-md group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">{feat.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {feat.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Banner CTA Final */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden border border-border/80 bg-gradient-to-br from-card to-muted/40 text-center shadow-2xl">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground max-w-xl mx-auto">
            Empieza a organizar tus snippets hoy mismo
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto mt-3">
            Crea tu cuenta gratuita en segundos y no vuelvas a perder un fragmento de código valioso.
          </p>

          <Button
            asChild
            size="lg"
            className="mt-6 h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg gap-2"
          >
            <Link href="/register">
              <span>Registrarse Gratis</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
