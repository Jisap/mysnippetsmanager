'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FolderOpen, Plus, Check, X, Pencil, Trash2, Loader2 } from 'lucide-react'
import { createCollection, renameCollection, deleteCollection } from '@/app/actions'

export interface CollectionItem {
  id: string
  name: string
  count: number
}

interface CollectionFilterProps {
  collections: CollectionItem[]
  selectedId: string | null
  onSelect: (id: string | null) => void
}

export function CollectionFilter({ collections, selectedId, onSelect }: CollectionFilterProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [managing, setManaging] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Si la lista se vacía (p. ej. se borra la última), salir del modo
  // gestión: si no, se queda pillado sin pills ni botón "+ Nueva".
  useEffect(() => {
    if (collections.length === 0) {
      setManaging(false)
      setEditingId(null)
    }
  }, [collections.length])

  const run = (fn: () => Promise<{ success: boolean; error?: string }>) => {
    setError(null)
    startTransition(async () => {
      const res = await fn()
      if (!res.success) {
        setError(res.error || 'Error')
      } else {
        router.refresh()
      }
    })
  }

  const handleCreate = () => {
    if (!newName.trim()) return
    run(async () => {
      const res = await createCollection(newName)
      if (res.success) {
        setNewName('')
        setShowCreate(false)
      }
      return res
    })
  }

  const startRename = (c: CollectionItem) => {
    setEditingId(c.id)
    setEditingName(c.name)
  }

  const commitRename = () => {
    if (!editingId) return
    const id = editingId
    const name = editingName
    setEditingId(null)
    run(() => renameCollection(id, name))
  }

  const handleDelete = (c: CollectionItem) => {
    if (!window.confirm(`¿Eliminar la colección "${c.name}"? Los snippets se conservan.`)) return
    if (selectedId === c.id) onSelect(null)
    // Salida inmediata del modo gestión si era la última: el refresh
    // del servidor tarda un instante en actualizar la prop.
    if (collections.length <= 1) {
      setManaging(false)
      setEditingId(null)
    }
    run(() => deleteCollection(c.id))
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs text-muted-foreground flex items-center gap-1 mr-1">
          <FolderOpen className="w-3 h-3" /> Colecciones:
        </span>
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={`text-[11px] font-medium px-2 py-0.5 rounded-md transition-all cursor-pointer ${
            !selectedId
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary/70 hover:bg-secondary text-secondary-foreground'
          }`}
        >
          Todas
        </button>
        {collections.map((c) =>
          managing ? (
            <span
              key={c.id}
              className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-md bg-secondary/70"
            >
              {editingId === c.id ? (
                <input
                  autoFocus
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitRename()
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                  maxLength={60}
                  className="w-24 bg-background border border-border rounded px-1 py-px text-[11px] outline-none focus:border-blue-500"
                />
              ) : (
                <>
                  <span className="font-medium max-w-[120px] truncate">{c.name}</span>
                  <button
                    type="button"
                    title={`Renombrar ${c.name}`}
                    aria-label={`Renombrar colección ${c.name}`}
                    onClick={() => startRename(c)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    title={`Eliminar ${c.name}`}
                    aria-label={`Eliminar colección ${c.name}`}
                    onClick={() => handleDelete(c)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </>
              )}
            </span>
          ) : (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(selectedId === c.id ? null : c.id)}
              className={`text-[11px] font-medium px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                selectedId === c.id
                  ? 'bg-emerald-600 text-white font-semibold shadow-sm ring-1 ring-emerald-400'
                  : 'bg-secondary/70 hover:bg-secondary text-secondary-foreground'
              }`}
            >
              {c.name} <span className="opacity-60 text-[10px]">({c.count})</span>
            </button>
          )
        )}

        {/* Crear / gestionar */}
        {!managing && (
          <button
            type="button"
            title="Nueva colección"
            aria-label="Nueva colección"
            onClick={() => setShowCreate((v) => !v)}
            className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md border border-dashed border-border/80 text-muted-foreground hover:text-foreground hover:border-blue-500/60 transition-all cursor-pointer"
          >
            <Plus className="w-3 h-3" /> Nueva
          </button>
        )}
        {collections.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setManaging((v) => !v)
              setEditingId(null)
            }}
            className="text-[11px] text-muted-foreground hover:text-foreground underline-offset-2 hover:underline cursor-pointer"
          >
            {managing ? 'Listo' : 'Gestionar'}
          </button>
        )}
        {isPending && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
      </div>

      {showCreate && !managing && (
        <div className="flex items-center gap-1.5">
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
            className="h-8 w-56 px-2.5 rounded-lg bg-background border border-border/80 focus:border-emerald-500 outline-none text-xs"
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={!newName.trim() || isPending}
            aria-label="Crear colección"
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

      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  )
}
