import { AddSnippetForm } from '@/components/add-snippet-form'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { BookOpen, Code2, Tag, Star } from 'lucide-react'

export default async function Home() {
  const [snippetCount, tagCount, favoriteCount] = await Promise.all([
    prisma.snippet.count(),
    prisma.tag.count(),
    (prisma.snippet as any).count({ where: { isFavorite: true } }),
  ])

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Stats row */}
      {snippetCount > 0 && (
        <div className="flex flex-wrap gap-3 mb-10">
          <Link
            href="/snippets"
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-border/60 bg-card hover:bg-muted/60 transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
              <Code2 className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-lg font-bold leading-none">{snippetCount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {snippetCount === 1 ? 'Snippet guardado' : 'Snippets guardados'}
              </p>
            </div>
          </Link>

          {favoriteCount > 0 && (
            <Link
              href="/snippets"
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-border/60 bg-card hover:bg-muted/60 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              </div>
              <div>
                <p className="text-lg font-bold leading-none">{favoriteCount}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {favoriteCount === 1 ? 'Favorito' : 'Favoritos'}
                </p>
              </div>
            </Link>
          )}

          <Link
            href="/snippets"
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-border/60 bg-card hover:bg-muted/60 transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
              <Tag className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <p className="text-lg font-bold leading-none">{tagCount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {tagCount === 1 ? 'Etiqueta única' : 'Etiquetas únicas'}
              </p>
            </div>
          </Link>

          <Link
            href="/snippets"
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 transition-colors ml-auto"
          >
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">Explorar snippets →</span>
          </Link>
        </div>
      )}

      {/* Formulario principal */}
      <AddSnippetForm />
    </div>
  )
}