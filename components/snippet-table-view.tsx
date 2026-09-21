'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Code2,
  Calendar,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  FileCode2,
  Layers,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { FavoriteButton } from '@/components/favorite-button'
import { QuickCopyButton } from '@/components/quick-copy-button'

interface SnippetTableViewProps {
  snippets: any[]
  onTagClick?: (tag: string) => void
  onFavoriteToggle?: (id: string, isFav: boolean) => void
  initialSort?: SortField
  initialOrder?: SortOrder
}

type SortField = 'title' | 'language' | 'createdAt' | 'lines'
type SortOrder = 'asc' | 'desc'

export function SnippetTableView({
  snippets,
  onTagClick,
  onFavoriteToggle,
  initialSort = 'createdAt',
  initialOrder = 'desc',
}: SnippetTableViewProps) {
  const [sortField, setSortField] = useState<SortField>(initialSort)
  const [sortOrder, setSortOrder] = useState<SortOrder>(initialOrder)

  const getLineCount = (s: any): number => {
    if (typeof s.lineCount === 'number') return s.lineCount
    return (s.code || '').split('\n').length
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const sortedSnippets = useMemo(() => {
    return [...snippets].sort((a, b) => {
      let comparison = 0
      if (sortField === 'title') {
        comparison = a.title.localeCompare(b.title)
      } else if (sortField === 'language') {
        comparison = a.language.localeCompare(b.language)
      } else if (sortField === 'createdAt') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      } else if (sortField === 'lines') {
        const linesA = getLineCount(a)
        const linesB = getLineCount(b)
        comparison = linesA - linesB
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })
  }, [snippets, sortField, sortOrder])

  if (snippets.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <Code2 className="w-16 h-16 mx-auto mb-4 opacity-20" />
        <p>No se encontraron snippets.</p>
      </div>
    )
  }

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-blue-400" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-blue-400" />
    )
  }

  return (
    <div className="border border-border/70 rounded-2xl bg-card shadow-sm overflow-hidden backdrop-blur-sm">
      <div className="overflow-x-auto [scrollbar-width:thin]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border/80 bg-muted/40 text-[12px] font-semibold text-muted-foreground uppercase tracking-wider select-none">
              <th scope="col" className="py-3 px-3 w-12 text-center">
                Fav
              </th>
              <th scope="col" className="py-3 px-4 min-w-[220px]">
                <button
                  type="button"
                  onClick={() => handleSort('title')}
                  className="flex items-center gap-1.5 hover:text-foreground transition-colors group cursor-pointer"
                >
                  <span>Título / Descripción</span>
                  {renderSortIcon('title')}
                </button>
              </th>
              <th scope="col" className="py-3 px-3 min-w-[120px]">
                <button
                  type="button"
                  onClick={() => handleSort('language')}
                  className="flex items-center gap-1.5 hover:text-foreground transition-colors group cursor-pointer"
                >
                  <span>Lenguaje</span>
                  {renderSortIcon('language')}
                </button>
              </th>
              <th scope="col" className="py-3 px-3 min-w-[180px] hidden md:table-cell">
                <span>Tags</span>
              </th>
              <th scope="col" className="py-3 px-3 min-w-[100px] hidden lg:table-cell text-center">
                <button
                  type="button"
                  onClick={() => handleSort('lines')}
                  className="inline-flex items-center gap-1 hover:text-foreground transition-colors group cursor-pointer"
                >
                  <span>Líneas</span>
                  {renderSortIcon('lines')}
                </button>
              </th>
              <th scope="col" className="py-3 px-3 min-w-[120px] hidden sm:table-cell">
                <button
                  type="button"
                  onClick={() => handleSort('createdAt')}
                  className="flex items-center gap-1.5 hover:text-foreground transition-colors group cursor-pointer"
                >
                  <span>Fecha</span>
                  {renderSortIcon('createdAt')}
                </button>
              </th>
              <th scope="col" className="py-3 px-4 w-28 text-right">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50 text-sm">
            {sortedSnippets.map((snippet, index) => {
              const lineCount = getLineCount(snippet)
              return (
                <motion.tr
                  key={snippet.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15, delay: Math.min(index * 0.02, 0.3) }}
                  className="group hover:bg-muted/50 transition-colors"
                >
                  {/* Favorito */}
                  <td className="py-3 px-3 text-center align-middle">
                    <FavoriteButton
                      snippetId={snippet.id}
                      initialIsFavorite={Boolean(snippet.isFavorite)}
                      onToggle={(isFav) => onFavoriteToggle?.(snippet.id, isFav)}
                    />
                  </td>

                  {/* Título & Descripción */}
                  <td className="py-3 px-4 align-middle">
                    <Link
                      href={`/snippets/${snippet.slug}`}
                      className="block group/link"
                    >
                      <div className="font-medium text-foreground group-hover/link:text-blue-400 transition-colors line-clamp-1 text-sm flex items-center gap-1.5">
                        <FileCode2 className="w-4 h-4 text-muted-foreground shrink-0 group-hover/link:text-blue-400" />
                        <span>{snippet.title}</span>
                      </div>
                      {snippet.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5 max-w-md">
                          {snippet.description}
                        </p>
                      )}
                    </Link>
                  </td>

                  {/* Lenguaje */}
                  <td className="py-3 px-3 align-middle">
                    <Badge
                      variant="outline"
                      className="font-mono text-[11px] font-semibold px-2 py-0.5 bg-muted/60 border-border/70"
                    >
                      {snippet.language}
                    </Badge>
                  </td>

                  {/* Tags */}
                  <td className="py-3 px-3 align-middle hidden md:table-cell">
                    {snippet.tags && snippet.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {snippet.tags.map((tag: any) => (
                          <button
                            key={tag.id || tag.name}
                            type="button"
                            onClick={() => onTagClick?.(tag.name)}
                            className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-secondary/80 text-secondary-foreground hover:bg-purple-600/20 hover:text-purple-300 transition-colors cursor-pointer"
                          >
                            #{tag.name}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground/50 italic">—</span>
                    )}
                  </td>

                  {/* Líneas */}
                  <td className="py-3 px-3 align-middle hidden lg:table-cell text-center">
                    <span className="text-xs text-muted-foreground font-mono">
                      {lineCount} {lineCount === 1 ? 'línea' : 'líneas'}
                    </span>
                  </td>

                  {/* Fecha */}
                  <td className="py-3 px-3 align-middle hidden sm:table-cell">
                    <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
                      <Calendar className="w-3 h-3 opacity-70" />
                      {new Date(snippet.createdAt).toLocaleDateString('es-ES')}
                    </span>
                  </td>

                  {/* Acciones */}
                  <td className="py-3 px-4 align-middle text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <QuickCopyButton snippetId={snippet.id} />
                      <Link
                        href={`/snippets/${snippet.slug}`}
                        title="Ver detalle"
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Footer de resumen de la tabla */}
      <div className="px-4 py-2.5 bg-muted/20 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
        <span>Total: {sortedSnippets.length} snippets</span>
        <span className="hidden sm:inline">Haz clic en los encabezados para ordenar</span>
      </div>
    </div>
  )
}
