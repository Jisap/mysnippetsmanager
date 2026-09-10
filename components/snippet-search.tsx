'use client'

import { useState, useMemo } from 'react'
import Fuse from 'fuse.js'
import { motion, AnimatePresence } from 'framer-motion'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { SnippetCard } from './snippets-card'

interface SnippetSearchProps {
  initialSnippets: any[]
}

export function SnippetSearch({ initialSnippets }: SnippetSearchProps) {
  const [query, setQuery] = useState('')

  // Configuración de Fuse para buscar por título, descripción, lenguaje, slug y tags
  const fuse = useMemo(() => new Fuse(initialSnippets, {
    keys: ['title', 'description', 'language', 'slug', 'tags.name'],
    threshold: 0.3, // Sensibilidad de la búsqueda
  }), [initialSnippets])

  const results = query ? fuse.search(query).map((result) => result.item) : initialSnippets

  return (
    <div className="space-y-8">
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por título, tag, slug, lenguaje..."
          className="pl-10 h-12 bg-background/50 backdrop-blur-sm border-muted"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <AnimatePresence mode="wait">
        {results.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-muted-foreground py-10"
          >
            No se encontraron resultados para "{query}"
          </motion.p>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {results.map((snippet) => (
              <SnippetCard key={snippet.id} snippet={snippet} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}