'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteSnippet } from '@/app/actions'

interface DeleteSnippetButtonProps {
  snippetId: string
  snippetTitle: string
}

export function DeleteSnippetButton({ snippetId, snippetTitle }: DeleteSnippetButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    const confirmed = window.confirm(`¿Estás seguro de que deseas eliminar el snippet "${snippetTitle}"? Esta acción no se puede deshacer.`)
    if (!confirmed) return

    setIsDeleting(true)
    try {
      const result = await deleteSnippet(snippetId)
      if (result.success) {
        router.refresh()
        router.push('/snippets')
      } else {
        alert(result.error || 'No se pudo eliminar el snippet')
        setIsDeleting(false)
      }
    } catch (error) {
      console.error('Error deleting snippet:', error)
      alert('Ocurrió un error inesperado')
      setIsDeleting(false)
    }
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={isDeleting}
      className="flex items-center gap-1.5"
    >
      {isDeleting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
      <span>{isDeleting ? 'Eliminando...' : 'Eliminar'}</span>
    </Button>
  )
}
