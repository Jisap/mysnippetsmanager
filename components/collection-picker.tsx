'use client'

import { useEffect, useState } from 'react'
import { Check, Loader2, Plus, X } from 'lucide-react'
import { getCollectionsAction, createCollection } from '@/app/actions'

interface CollectionPickerProps {
  value: string[]
  onChange: (ids: string[]) => void
}

export function CollectionPicker({ value, onChange }: CollectionPickerProps) {
  const [collections, setCollections] = useState<Array<{ id: string; name: string; count: number }>>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getCollectionsAction().then((res) => {
      if (res.success) setCollections(res.collections)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        Cargando colecciones…
      </div>
    )
  }

  const toggle = (id: string) => {
    onChange(value.includes(id) ? value.filter((c) => c !== id) : [...value, id])
  }

  const handleCreate = async () => {
    if (!newName.trim() || creating) return
    setCreating(true)
    setError(null)
    const res = await createCollection(newName)
    setCreating(false)
    if (!res.success || !res.collection) {
      setError(res.error || 'No se pudo crear la colección')
      return
    }
    const created = res.collection as { id: string; name: string }
    setCollections((prev) => [...prev, { ...created, count: 0 }].sort((a, b) => a.name.localeCompare(b.name)))
    // La nueva colección queda seleccionada directamente
    if (!value.includes(created.id)) onChange([...value, created.id])
    setNewName('')
    setShowCreate(false)
  }

  return (
    <div className="space-y-2">
    <div className="flex flex-wrap gap-1.5">
      {collections.length === 0 && (
        <span className="text-xs text-muted-foreground py-1">
          Sin colecciones todavía — crea la primera con “+ Nueva”.
        </span>
      )}
      {collections.map((c) => {
        const active = value.includes(c.id)
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => toggle(c.id)}
            className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
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

    {showCreate && (
      <div className="flex items-center gap-1.5">
        <input
          autoFocus
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleCreate()
            }
            if (e.key === 'Escape') setShowCreate(false)
          }}
          maxLength={60}
          placeholder="Nombre de la colección…"
          className="h-8 w-56 px-2.5 rounded-lg bg-background border border-border/80 focus:border-emerald-500 outline-none text-xs"
        />
        <button
          type="button"
          onClick={handleCreate}
          disabled={!newName.trim() || creating}
          aria-label="Crear colección"
          className="h-8 w-8 flex items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
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
