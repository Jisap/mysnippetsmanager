'use client'

import { useState, useMemo, useEffect } from 'react'
import Fuse from 'fuse.js'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Star, Filter, Sparkles, Tag as TagIcon, LayoutGrid, Table2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SnippetsGrid } from './snippets-card'
import { SnippetTableView } from './snippet-table-view'

interface SnippetSearchProps {
  initialSnippets: any[]
}

export function SnippetSearch({ initialSnippets }: SnippetSearchProps) {
  const [snippets, setSnippets] = useState(initialSnippets)
  const [query, setQuery] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(false)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

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

  // Extraer todos los lenguajes únicos presentes en los snippets
  const availableLanguages = useMemo(() => {
    const langs = Array.from(new Set(snippets.map((s) => s.language).filter(Boolean)))
    return langs.sort()
  }, [snippets])

  // Extraer todos los tags únicos con conteo
  const topTags = useMemo(() => {
    const tagCountMap: Record<string, number> = {}
    snippets.forEach((s) => {
      s.tags?.forEach((t: any) => {
        tagCountMap[t.name] = (tagCountMap[t.name] || 0) + 1
      })
    })
    return Object.entries(tagCountMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }))
  }, [snippets])

  // Conteo de favoritos
  const favoritesCount = useMemo(() => {
    return snippets.filter((s) => s.isFavorite).length
  }, [snippets])

  // Configuración de Fuse.js para búsqueda difusa
  const fuse = useMemo(() => {
    return new Fuse(snippets, {
      keys: ['title', 'description', 'language', 'slug', 'tags.name'],
      threshold: 0.35,
    })
  }, [snippets])

  // Aplicar filtros combinados: Búsqueda + Favoritos + Lenguaje + Tag
  const filteredSnippets = useMemo(() => {
    let list = query ? fuse.search(query).map((res) => res.item) : snippets

    if (onlyFavorites) {
      list = list.filter((s) => Boolean(s.isFavorite))
    }

    if (selectedLanguage !== 'all') {
      list = list.filter((s) => s.language.toLowerCase() === selectedLanguage.toLowerCase())
    }

    if (selectedTag) {
      list = list.filter((s) =>
        s.tags?.some((t: any) => t.name.toLowerCase() === selectedTag.toLowerCase())
      )
    }

    return list
  }, [snippets, query, onlyFavorites, selectedLanguage, selectedTag, fuse])

  const hasActiveFilters = Boolean(query || onlyFavorites || selectedLanguage !== 'all' || selectedTag)

  const clearAllFilters = () => {
    setQuery('')
    setSelectedLanguage('all')
    setSelectedTag(null)
    setOnlyFavorites(false)
  }

  const handleFavoriteToggle = (id: string, isFav: boolean) => {
    setSnippets((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isFavorite: isFav } : item))
    )
  }

  const handleTagClick = (tagName: string) => {
    if (selectedTag === tagName) {
      setSelectedTag(null)
    } else {
      setSelectedTag(tagName)
    }
  }

  return (
    <div className="space-y-6">
      {/* Barra de Búsqueda y Pestaña Favoritos */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Input de Búsqueda */}
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar por título, código, tag o lenguaje..."
            className="pl-10 pr-9 h-11 bg-background/70 backdrop-blur-sm border-border/80 rounded-xl transition-all focus:border-blue-500 shadow-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
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
              onClick={() => setOnlyFavorites(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                !onlyFavorites
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Todos ({snippets.length})
            </button>
            <button
              type="button"
              onClick={() => setOnlyFavorites(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                onlyFavorites
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm font-semibold'
                  : 'text-muted-foreground hover:text-amber-400'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span>Favoritos ({favoritesCount})</span>
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
            onClick={() => setSelectedLanguage('all')}
            className={`text-xs px-2.5 py-1 rounded-lg transition-all shrink-0 cursor-pointer ${
              selectedLanguage === 'all'
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
              onClick={() => setSelectedLanguage(lang === selectedLanguage ? 'all' : lang)}
              className={`text-xs font-mono px-2.5 py-1 rounded-lg transition-all shrink-0 cursor-pointer ${
                selectedLanguage.toLowerCase() === lang.toLowerCase()
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
          <span>
            {filteredSnippets.length} de {snippets.length}
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
            const isSelected = selectedTag?.toLowerCase() === name.toLowerCase()
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
              snippets={filteredSnippets}
              onTagClick={handleTagClick}
              onFavoriteToggle={handleFavoriteToggle}
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
              snippets={filteredSnippets}
              onTagClick={handleTagClick}
              onFavoriteToggle={handleFavoriteToggle}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}