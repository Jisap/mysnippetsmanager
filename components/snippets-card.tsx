'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Calendar, Code2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { FavoriteButton } from '@/components/favorite-button'
import { QuickCopyButton } from '@/components/quick-copy-button'

export function SnippetsGrid({
  snippets,
  onTagClick,
  onFavoriteToggle,
}: {
  snippets: any[]
  onTagClick?: (tag: string) => void
  onFavoriteToggle?: (id: string, isFav: boolean) => void
}) {
  if (snippets.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <Code2 className="w-16 h-16 mx-auto mb-4 opacity-20" />
        <p>No se encontraron snippets.</p>
      </div>
    )
  }

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.05,
          },
        },
      }}
    >
      {snippets.map((snippet) => (
        <SnippetCard
          key={snippet.id}
          snippet={snippet}
          onTagClick={onTagClick}
          onFavoriteToggle={onFavoriteToggle}
        />
      ))}
    </motion.div>
  )
}

export function SnippetCard({
  snippet,
  onTagClick,
  onFavoriteToggle,
}: {
  snippet: any
  onTagClick?: (tag: string) => void
  onFavoriteToggle?: (id: string, isFav: boolean) => void
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0 },
      }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative p-5 border border-border/70 rounded-2xl bg-card hover:border-border hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between"
    >
      <Link href={`/snippets/${snippet.slug}`} className="flex flex-col h-full">
        <div>
          {/* Header de la tarjeta con Badge, Lenguaje, Favorito y Copiar */}
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs font-semibold px-2 py-0.5 bg-muted/40">
                {snippet.language}
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(snippet.createdAt).toLocaleDateString('es-ES')}
              </span>
            </div>

            {/* Acciones Rápidas */}
            <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
              <QuickCopyButton code={snippet.code} />
              <FavoriteButton
                snippetId={snippet.id}
                initialIsFavorite={Boolean(snippet.isFavorite)}
                onToggle={(isFav) => onFavoriteToggle?.(snippet.id, isFav)}
              />
            </div>
          </div>

          <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-500 transition-colors line-clamp-1">
            {snippet.title}
          </h3>

          <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
            {snippet.description || "Sin descripción proporcionada"}
          </p>
        </div>

        {/* Tags interactivos */}
        {snippet.tags && snippet.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-auto pt-3 border-t border-border/40">
            {snippet.tags.map((tag: any) => (
              <button
                key={tag.id || tag.name}
                type="button"
                onClick={(e) => {
                  if (onTagClick) {
                    e.preventDefault()
                    e.stopPropagation()
                    onTagClick(tag.name)
                  }
                }}
                className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-secondary/80 text-secondary-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
              >
                #{tag.name}
              </button>
            ))}
          </div>
        )}

        {/* Borde inferior dinámico en hover */}
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
      </Link>
    </motion.div>
  )
}