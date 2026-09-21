'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { FolderOpen, Plus, Check, X, Loader2 } from 'lucide-react'
import { setSnippetCollections, createCollection } from '@/app/actions'
import type { CollectionItem } from './collection-filter'

interface CollectionAssignerProps {
  snippetId: string
  allCollections: CollectionItem[]
  assignedIds: string[]
}

export function CollectionAssigner({ snippetId, allCollections, assignedIds }: CollectionAssignerProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [checked, setChecked] = useState<string[]>(assignedIds)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const persist = (ids: string[]) => {
    setChecked(ids)
    setError(null)
    startTransition(async () => {
      const res = await setSnippetCollections(snippetId, ids)
      if (!res.success) {
        setError(res.error || 'Error al guardar')
        setChecked(assignedIds)
      } else {
        router.refresh()
      }
    })
  }

  const toggle = (id: string) => {
    persist(checked.includes(id) ? checked.filter((c) => c !== id) : [...checked, id])
  }

  const handleCreate = () => {
    if (!newName.trim()) return
    setError(null)
    startTransition(async () => {
      const res = await createCollection(newName)
      if (!res.success || !res.collection) {
        setError(res.error || 'Error al crear')
        return
      }
      const id = (res.collection as { id: string }).id
      setNewName('')
      setShowCreate(false)
      persist([...checked, id])
    })
  }

  return (
    <div className="rounded-2xl border border-border/70 bg-card/60 p-5 shadow-sm">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
          <FolderOpen className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-base font-semibold">Colecciones</h2>
          <p className="text-xs text-muted-foreground">Organiza este snippet en carpetas</p>
        </div>
        {isPending && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground ml-auto" />}
      </div>

      {allCollections.length === 0 && !showCreate ? (
        <p className="text-xs text-muted-foreground">
          Aún no tienes colecciones.{' '}
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="text-emerald-400 hover:underline cursor-pointer"
          >
            Crea la primera
          </button>
        </p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {allCollections.map((c) => {
            const active = checked.includes(c.id)
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => toggle(c.id)}
                disabled={isPending}
                className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer disabled:opacity-50 ${
                  active
                    ? 'bg-emerald-600/15 border-emerald-500/40 text-emerald-300 font-medium'
                    : 'bg-muted/40 border-border/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                <span
                  className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                    active ? 'bg-emerald-500 border-emerald-500' : 'border-muted-foreground/50'
                  }`}
                >
                  {active && <Check className="w-2.5 h-2.5 text-white" />}
                </span>
                {c.name}
              </button>
            )
          })}
          <button
            type="button"
            title="Nueva colección"
            aria-label="Nueva colección"
            onClick={() => setShowCreate((v) => !v)}
            className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border border-dashed border-border/80 text-muted-foreground hover:text-foreground hover:border-emerald-500/60 cursor-pointer"
          >
            <Plus className="w-3 h-3" /> Nueva
          </button>
        </div>
      )}

      {showCreate && (
        <div className="flex items-center gap-1.5 mt-3">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate()
              if (e.key === 'Escape') setShowCreate(false)
            }}
            maxLength={60}
            placeholder="Nombre de la colección…"
            className="h-8 flex-1 px-2.5 rounded-lg bg-background border border-border/80 focus:border-emerald-500 outline-none text-xs"
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={!newName.trim() || isPending}
            aria-label="Crear y asignar colección"
            className="h-8 w-8 flex items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setShowCreate(false)}
            aria-label="Cancelar"
            className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {error && <p className="text-[11px] text-destructive mt-2">{error}</p>}
    </div>
  )
}
