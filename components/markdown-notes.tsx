'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Edit3, Check, X, Loader2, BookOpen, Sparkles, FileText, AlertCircle } from 'lucide-react'
import { updateSnippetNotes } from '@/app/actions'
import { Button } from '@/components/ui/button'

interface MarkdownNotesProps {
  snippetId: string
  notes?: string | null
  onNotesChange?: (newNotes: string) => void
}

export function MarkdownNotes({
  snippetId,
  notes: initialNotes = '',
  onNotesChange,
}: MarkdownNotesProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [notes, setNotes] = useState(initialNotes || '')
  const [draft, setDraft] = useState(initialNotes || '')
  const [isPending, startTransition] = useTransition()
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    setNotes(initialNotes || '')
    if (!isEditing) {
      setDraft(initialNotes || '')
    }
  }, [initialNotes, isEditing])

  const handleStartEdit = () => {
    setDraft(notes)
    setErrorMessage(null)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setDraft(notes)
    setErrorMessage(null)
    setIsEditing(false)
  }

  const handleSave = () => {
    setErrorMessage(null)
    startTransition(async () => {
      try {
        const res = await updateSnippetNotes(snippetId, draft)
        if (res.success) {
          setNotes(draft)
          onNotesChange?.(draft)
          setIsEditing(false)
          setSaveSuccess(true)
          router.refresh()
          setTimeout(() => setSaveSuccess(false), 2500)
        } else {
          setErrorMessage(res.error || 'Error al guardar las notas')
        }
      } catch (err: any) {
        setErrorMessage(err?.message || 'Error de conexión al guardar')
      }
    })
  }

  const insertTemplate = (templateText: string) => {
    setDraft((prev) => (prev ? `${prev}\n\n${templateText}` : templateText))
  }

  return (
    <div className="rounded-2xl border border-border/70 bg-card/60 backdrop-blur-sm p-6 shadow-sm">
      {/* Cabecera de Notas */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-border/50 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold">Explicación y Notas de Uso</h2>
            <p className="text-xs text-muted-foreground">
              Documentación técnica, parámetros y detalles de implementación
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-xs text-emerald-500 flex items-center gap-1 font-medium animate-in fade-in">
              <Check className="w-3.5 h-3.5" /> ¡Guardado!
            </span>
          )}

          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleStartEdit}
              className="h-8 gap-1.5 text-xs bg-background/50 hover:bg-muted"
            >
              <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{notes ? 'Editar notas' : 'Añadir notas'}</span>
            </Button>
          ) : (
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                disabled={isPending}
                className="h-8 text-xs px-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5 mr-1" /> Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isPending}
                className="h-8 text-xs px-3 bg-purple-600 hover:bg-purple-500 text-white gap-1.5"
              >
                {isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                <span>Guardar notas</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Modo Edición */}
      {isEditing ? (
        <div className="space-y-3">
          {/* Barra de atajos para plantillas rápidas */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs text-muted-foreground">
            <span className="text-[11px] font-medium mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-400" /> Insertar:
            </span>
            <button
              type="button"
              onClick={() => insertTemplate('### 📌 ¿Cómo funciona?\nDescribe aquí el propósito principal y la lógica detrás del código.')}
              className="px-2 py-0.5 rounded bg-muted/60 hover:bg-muted text-foreground text-[11px] transition-colors cursor-pointer"
            >
              + Propósito
            </button>
            <button
              type="button"
              onClick={() => insertTemplate('### ⚙️ Parámetros / Props\n- `param1` (tipo): Explicación del parámetro\n- `param2` (tipo): Explicación del parámetro')}
              className="px-2 py-0.5 rounded bg-muted/60 hover:bg-muted text-foreground text-[11px] transition-colors cursor-pointer"
            >
              + Parámetros
            </button>
            <button
              type="button"
              onClick={() => insertTemplate('### 💡 Ejemplo de Uso\n```typescript\n// Ejemplo práctico de invocación\n```')}
              className="px-2 py-0.5 rounded bg-muted/60 hover:bg-muted text-foreground text-[11px] transition-colors cursor-pointer"
            >
              + Ejemplo
            </button>
            <button
              type="button"
              onClick={() => insertTemplate('> ⚠️ **Advertencia / Requisito:**\n> Requiere instalar tal paquete o tener configurada la variable `X`.')}
              className="px-2 py-0.5 rounded bg-muted/60 hover:bg-muted text-foreground text-[11px] transition-colors cursor-pointer"
            >
              + Advertencia
            </button>
          </div>

          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={10}
            placeholder="Escribe aquí notas detalladas, cómo usar este snippet, advertencias, parámetros o ejemplos... (Soporta Markdown básico: ### Títulos, - Listas, **Negrita**, `código inline`, etc.)"
            className="w-full p-4 rounded-xl bg-background/80 border border-border/80 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none font-mono text-sm leading-relaxed transition-all placeholder:text-muted-foreground/60 resize-y"
          />
        </div>
      ) : (
        /* Modo Visualización */
        <div>
          {notes ? (
            <div className="prose prose-invert max-w-none text-sm leading-relaxed space-y-3 text-foreground/90">
              <SimpleMarkdownRenderer content={notes} />
            </div>
          ) : (
            <div className="text-center py-10 px-4 rounded-xl border border-dashed border-border/60 bg-muted/20">
              <FileText className="w-10 h-10 mx-auto text-muted-foreground/40 mb-2.5" />
              <p className="text-sm font-medium text-foreground/80">Sin notas ni documentación adicional</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                Añade explicaciones técnicas, ejemplos de llamada o advertencias para documentar este snippet.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleStartEdit}
                className="mt-4 h-8 text-xs gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Escribir explicación</span>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Renderizador ligero y seguro de Markdown para notas
 */
function SimpleMarkdownRenderer({ content }: { content: string }) {
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let inCodeBlock = false
  let codeBlockContent: string[] = []

  lines.forEach((line, index) => {
    // Bloques de código ```
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre
            key={`code-${index}`}
            className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono overflow-x-auto text-zinc-300 my-2.5"
          >
            <code>{codeBlockContent.join('\n')}</code>
          </pre>
        )
        codeBlockContent = []
        inCodeBlock = false
      } else {
        inCodeBlock = true
      }
      return
    }

    if (inCodeBlock) {
      codeBlockContent.push(line)
      return
    }

    // Encabezados
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={index} className="text-base font-bold text-foreground mt-4 mb-1.5 flex items-center gap-1.5">
          {renderFormattedText(line.replace('### ', ''))}
        </h3>
      )
      return
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={index} className="text-lg font-bold text-foreground mt-5 mb-2 pb-1 border-b border-border/40">
          {renderFormattedText(line.replace('## ', ''))}
        </h2>
      )
      return
    }
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={index} className="text-xl font-extrabold text-foreground mt-6 mb-2.5">
          {renderFormattedText(line.replace('# ', ''))}
        </h1>
      )
      return
    }

    // Citas / Callouts (alertas >)
    if (line.startsWith('> ')) {
      elements.push(
        <div
          key={index}
          className="border-l-2 border-purple-500 bg-purple-500/10 px-3.5 py-2 rounded-r-lg text-xs text-purple-200 my-2"
        >
          {renderFormattedText(line.replace('> ', ''))}
        </div>
      )
      return
    }

    // Listas con guión
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      elements.push(
        <li key={index} className="ml-4 list-disc text-sm my-0.5 text-foreground/90">
          {renderFormattedText(line.trim().substring(2))}
        </li>
      )
      return
    }

    // Líneas vacías
    if (!line.trim()) {
      elements.push(<div key={index} className="h-2" />)
      return
    }

    // Párrafos regulares
    elements.push(
      <p key={index} className="text-sm leading-relaxed my-1 text-foreground/90">
        {renderFormattedText(line)}
      </p>
    )
  })

  // Si quedó un bloque de código abierto
  if (inCodeBlock && codeBlockContent.length > 0) {
    elements.push(
      <pre
        key="code-last"
        className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono overflow-x-auto text-zinc-300 my-2.5"
      >
        <code>{codeBlockContent.join('\n')}</code>
      </pre>
    )
  }

  return <div className="space-y-1">{elements}</div>
}

/**
 * Formateador de texto inline: **negrita**, *cursiva*, `código inline`
 */
function renderFormattedText(text: string): React.ReactNode {
  const parts: React.ReactNode[] = []
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index))
    }

    const token = match[0]
    if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code
          key={match.index}
          className="font-mono text-xs bg-muted/80 text-purple-400 px-1.5 py-0.5 rounded border border-border/50"
        >
          {token.slice(1, -1)}
        </code>
      )
    } else if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={match.index} className="font-semibold text-foreground">
          {token.slice(2, -2)}
        </strong>
      )
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em key={match.index} className="italic text-foreground/90">
          {token.slice(1, -1)}
        </em>
      )
    }

    lastIndex = regex.lastIndex
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }

  return parts.length > 0 ? parts : text
}
