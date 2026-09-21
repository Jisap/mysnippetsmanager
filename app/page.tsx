import { AddSnippetForm } from '@/components/add-snippet-form'
import { LandingPage } from '@/components/landing-page'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { BookOpen, Code2, Tag, Star, User, Sparkles } from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Si no hay usuario autenticado, mostramos la Landing Page de presentación
  if (!user) {
    return <LandingPage />
  }

  // Si el usuario está autenticado, mostramos su Dashboard personal de snippets
  const [snippetCount, tagCount, favoriteCount] = await Promise.all([
    prisma.snippet.count({
      where: { userId: user.id },
    }),
    prisma.tag.count({
      where: { snippets: { some: { userId: user.id } } },
    }),
    prisma.snippet.count({
      where: {
        userId: user.id,
        isFavorite: true,
      },
    }),
  ])

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Saludo y Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-400 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Panel de Desarrollador</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Hola, <span className="text-blue-400">{user.email?.split('@')[0]}</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Crea un nuevo snippet o consulta tu colección guardada
          </p>
        </div>

        <Link
          href="/snippets"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-semibold transition-all shadow-sm self-start sm:self-auto"
        >
          <BookOpen className="w-4 h-4" />
          <span>Ver todos mis snippets →</span>
        </Link>
      </div>

      {/* Fila de Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-10">
        <Link
          href="/snippets"
          className="flex items-center gap-3 p-4 rounded-2xl border border-border/70 bg-card hover:bg-muted/60 transition-all group shadow-sm"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
            <Code2 className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-2xl font-bold leading-none">{snippetCount}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {snippetCount === 1 ? 'Snippet guardado' : 'Snippets guardados'}
            </p>
          </div>
        </Link>

        <Link
          href="/snippets"
          className="flex items-center gap-3 p-4 rounded-2xl border border-border/70 bg-card hover:bg-muted/60 transition-all group shadow-sm"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
          </div>
          <div>
            <p className="text-2xl font-bold leading-none">{favoriteCount}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {favoriteCount === 1 ? 'Snippet favorito' : 'Snippets favoritos'}
            </p>
          </div>
        </Link>

        <Link
          href="/snippets"
          className="flex items-center gap-3 p-4 rounded-2xl border border-border/70 bg-card hover:bg-muted/60 transition-all group shadow-sm"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
            <Tag className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <p className="text-2xl font-bold leading-none">{tagCount}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {tagCount === 1 ? 'Etiqueta única' : 'Etiquetas únicas'}
            </p>
          </div>
        </Link>
      </div>

      {/* Formulario de Creación de Snippet */}
      <AddSnippetForm />
    </div>
  )
}