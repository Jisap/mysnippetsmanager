'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Code2, BookOpen, Columns, FileText } from 'lucide-react'
import { CodeViewer } from '@/components/code-viewer'
import { MarkdownNotes } from '@/components/markdown-notes'

interface SnippetDetailViewProps {
  snippetId: string
  code: string
  initialHtml: string
  language: string
  notes?: string | null
}

export function SnippetDetailView({
  snippetId,
  code,
  initialHtml,
  language,
  notes: initialNotes,
}: SnippetDetailViewProps) {
  const [viewMode, setViewMode] = useState<'split' | 'code' | 'notes'>('split')
  const [currentNotes, setCurrentNotes] = useState(initialNotes || '')

  useEffect(() => {
    setCurrentNotes(initialNotes || '')
  }, [initialNotes])

  return (
    <div className="space-y-6">
      {/* Selector de Modos de Vista */}
      <div className="flex items-center justify-between gap-4 border-b border-border/50 pb-3">
        <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl border border-border/50">
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              viewMode === 'split'
                ? 'bg-background text-foreground shadow-sm font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Vista Dividida</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('code')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              viewMode === 'code'
                ? 'bg-background text-foreground shadow-sm font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Solo Código</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('notes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              viewMode === 'notes'
                ? 'bg-purple-600 text-white shadow-sm font-semibold'
                : 'text-muted-foreground hover:text-purple-400'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Explicación & Notas</span>
            {Boolean(currentNotes) && (
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block ml-0.5" />
            )}
          </button>
        </div>

        <div className="text-xs text-muted-foreground hidden md:block">
          {viewMode === 'split' && 'Código a la izquierda, documentación a la derecha'}
          {viewMode === 'code' && 'Vista enfocada en el código fuente'}
          {viewMode === 'notes' && 'Vista enfocada en la explicación técnica'}
        </div>
      </div>

      {/* Contenido según el modo */}
      {viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Columna Izquierda: Visor de Código (7 cols en desktop) */}
          <div className="lg:col-span-7">
            <CodeViewer
              code={code}
              initialHtml={initialHtml}
              initialLanguage={language}
              initialTheme="github-dark"
            />
          </div>

          {/* Columna Derecha: Notas & Explicación (5 cols en desktop) */}
          <div className="lg:col-span-5 my-6">
            <MarkdownNotes
              snippetId={snippetId}
              notes={currentNotes}
              onNotesChange={(n) => setCurrentNotes(n)}
            />
          </div>
        </div>
      )}

      {viewMode === 'code' && (
        <motion.div
          key="code-only"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          <CodeViewer
            code={code}
            initialHtml={initialHtml}
            initialLanguage={language}
            initialTheme="github-dark"
          />
        </motion.div>
      )}

      {viewMode === 'notes' && (
        <motion.div
          key="notes-only"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="max-w-4xl mx-auto my-6"
        >
          <MarkdownNotes
            snippetId={snippetId}
            notes={currentNotes}
            onNotesChange={(n) => setCurrentNotes(n)}
          />
        </motion.div>
      )}
    </div>
  )
}
