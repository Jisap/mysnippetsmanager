'use client'

import { useState, useMemo, useEffect, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Star, Filter, Tag as TagIcon, LayoutGrid, Table2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { SnippetsGrid } from './snippets-card'
import { SnippetTableView } from './snippet-table-view'

interface SnippetSearchProps {
  initialSnippets: any[]
  totalCount: number
  totalUserCount: number
  favoritesCount: number
  availableLanguages: string[]
  topTags: Array<{ name: string; count: number }>
  page: number
  totalPages: number
  initialQuery: string
  initialLanguage: string
  initialTag: string | null
  initialOnlyFavorites: boolean
  initialSort: 'createdAt' | 'title' | 'language'
  initialOrder: 'asc' | 'desc'
}

export function SnippetSearch({
  initialSnippets,
  totalCount,
  totalUserCount,
  favoritesCount,
  availableLanguages,
  topTags,
  page,
  totalPages,
  initialQuery,
  initialLanguage,
  initialTag,
  initialOnlyFavorites,
  initialSort,
  initialOrder,
}: SnippetSearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [snippets, setSnippets] = useState(initialSnippets)
  const [queryInput, setQueryInput] = useState(initialQuery)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  // Sincronizar al navegar (paginación / filtros servidor)
  useEffect(() => {
    setSnippets(initialSnippets)
  }, [initialSnippets])

  useEffect(() => {
    setQueryInput(initialQuery)
  }, [initialQuery])

  useEffect(() => {
    const saved = localStorage.getItem('snippet_view_mode') as 'grid' | 'table' | null
    if (saved === 'grid' || saved === 'table') {
      setViewMode(saved)
    }
  }, [])

  const handleViewModeChange = (mode: 'grid' | 'table') => {
    setViewMode(mode)
    localStorage.setItem('snippet_view_mode', mode)
  }

  const updateParams = (patch: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === '' || value === 'all' && key === 'lang') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    }
    // Limpiar defaults para URLs cortas
    if (params.get('lang') === 'all') params.delete('lang')
    if (params.get('page') === '1') params.delete('page')
    if (params.get('sort') === 'createdAt') params.delete('sort')
    if (params.get('order') === 'desc') params.delete('order')
    const qs = params.toString()
    startTransition(() => {
      router.push(qs ? `/snippets?${qs}` : '/snippets')
    })
  }

  // Debounce de búsqueda: actualiza URL 350ms tras dejar de escribir
  useEffect(() => {
    if (queryInput === initialQuery) return
    const t = setTimeout(() => {
      updateParams({ q: queryInput.trim() || null, page: null })
    }, 350)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryInput])

  const hasActiveFilters = Boolean(
    initialQuery || initialOnlyFavorites || initialLanguage !== 'all' || initialTag
  )

  const clearAllFilters = () => {
    setQueryInput('')
    updateParams({ q: null, lang: null, tag: null, fav: null, page: null })
  }

  const handleFavoriteToggle = (id: string, isFav: boolean) => {
    setSnippets((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isFavorite: isFav } : item))
    )
  }

  const handleTagClick = (tagName: string) => {
    updateParams({ tag: initialTag === tagName ? null : tagName, page: null })
  }

  const goToPage = (next: number) => {
    const clamped = Math.min(Math.max(1, next), totalPages)
    updateParams({ page: clamped === 1 ? null : String(clamped) })
  }

  const favCount = useMemo(() => favoritesCount, [favoritesCount])

  return (
    <div className="space-y-6">
      {/* Barra de Búsqueda y Pestaña Favoritos */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Input de Búsqueda (servidor, con debounce) */}
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar por título, descripción, tag o lenguaje..."
            className="pl-10 pr-9 h-11 bg-background/70 backdrop-blur-sm border-border/80 rounded-xl transition-all focus:border-blue-500 shadow-sm"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
          />
          {queryInput && (
            <button
              type="button"
              onClick={() => {
                setQueryInput('')
                updateParams({ q: null, page: null })
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full hover:bg-muted"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Toggle Todos vs Favoritos */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/50">
            <button
              type="button"
              onClick={() => updateParams({ fav: null, page: null })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                !initialOnlyFavorites
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Todos ({totalUserCount})
            </button>
            <button
              type="button"
              onClick={() => updateParams({ fav: initialOnlyFavorites ? null : '1', page: null })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                initialOnlyFavorites
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm font-semibold'
                  : 'text-muted-foreground hover:text-amber-400'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${initialOnlyFavorites ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span>Favoritos ({favCount})</span>
            </button>
          </div>

          {/* Toggle Vista: Grid vs Tabla (Excel) */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/50">
            <button
              type="button"
              title="Vista en Tarjetas"
              onClick={() => handleViewModeChange('grid')}
              className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Vista en Tabla / Filas (tipo Excel)"
              onClick={() => handleViewModeChange('table')}
              className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Table2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Barra de Filtros Rápidos (Lenguajes y Tags) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-border/40">
        {/* Pills de Lenguaje */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
          <span className="text-xs text-muted-foreground flex items-center gap-1 mr-1 shrink-0">
            <Filter className="w-3 h-3" /> Lenguaje:
          </span>
          <button
            type="button"
            onClick={() => updateParams({ lang: null, page: null })}
            className={`text-xs px-2.5 py-1 rounded-lg transition-all shrink-0 cursor-pointer ${
              initialLanguage === 'all'
                ? 'bg-primary text-primary-foreground font-medium'
                : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            Todos
          </button>
          {availableLanguages.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() =>
                updateParams({ lang: lang === initialLanguage ? null : lang, page: null })
              }
              className={`text-xs font-mono px-2.5 py-1 rounded-lg transition-all shrink-0 cursor-pointer ${
                initialLanguage.toLowerCase() === lang.toLowerCase()
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* Resumen / Reset */}
        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            {isPending && <Loader2 className="w-3 h-3 animate-spin" />}
            {totalCount} de {totalUserCount}
          </span>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3 h-3 mr-1" />
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Top Tags sugeridos */}
      {topTags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-muted-foreground flex items-center gap-1 mr-1">
            <TagIcon className="w-3 h-3" /> Tags:
          </span>
          {topTags.map(({ name, count }) => {
            const isSelected = initialTag?.toLowerCase() === name.toLowerCase()
            return (
              <button
                key={name}
                type="button"
                onClick={() => handleTagClick(name)}
                className={`text-[11px] font-medium px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-purple-600 text-white font-semibold shadow-sm ring-1 ring-purple-400'
                    : 'bg-secondary/70 hover:bg-secondary text-secondary-foreground'
                }`}
              >
                #{name} <span className="opacity-60 text-[10px]">({count})</span>
              </button>
            )
          })}
        </div>
      )}

      {/* Renderizado de Resultados: Tabla (Excel) o Tarjetas (Grid) */}
      <AnimatePresence mode="wait">
        {viewMode === 'table' ? (
          <motion.div
            key="table-view"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            <SnippetTableView
              snippets={snippets}
              onTagClick={handleTagClick}
              onFavoriteToggle={handleFavoriteToggle}
              initialSort={initialSort === 'language' ? 'language' : initialSort === 'title' ? 'title' : 'createdAt'}
              initialOrder={initialOrder}
            />
          </motion.div>
        ) : (
          <motion.div
            key="grid-view"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            <SnippetsGrid
              snippets={snippets}
              onTagClick={handleTagClick}
              onFavoriteToggle={handleFavoriteToggle}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Paginación servidor */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || isPending}
            onClick={() => goToPage(page - 1)}
            className="gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Anterior
          </Button>
          <span className="text-xs text-muted-foreground">
            Página {page} de {totalPages} · {totalCount} resultados
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || isPending}
            onClick={() => goToPage(page + 1)}
            className="gap-1"
          >
            Siguiente
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
    </div>
  )
}
