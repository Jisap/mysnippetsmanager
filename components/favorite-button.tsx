'use client'

import { useState, useTransition } from 'react'
import { Star, Loader2 } from 'lucide-react'
import { toggleFavoriteSnippet } from '@/app/actions'
import { Button } from '@/components/ui/button'

interface FavoriteButtonProps {
  snippetId: string
  initialIsFavorite?: boolean
  size?: 'sm' | 'default' | 'icon'
  showLabel?: boolean
  className?: string
  onToggle?: (isFav: boolean) => void
}

export function FavoriteButton({
  snippetId,
  initialIsFavorite = false,
  size = 'icon',
  showLabel = false,
  className = '',
  onToggle,
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
  const [isPending, startTransition] = useTransition()

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const next = !isFavorite
    setIsFavorite(next)
    onToggle?.(next)

    startTransition(async () => {
      const res = await toggleFavoriteSnippet(snippetId)
      if (!res.success) {
        // Revert on failure
        setIsFavorite(!next)
        onToggle?.(!next)
      }
    })
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size={size}
      onClick={handleToggle}
      aria-label={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
      title={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
      className={`transition-all duration-200 ${
        isFavorite
          ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-400/10'
          : 'text-muted-foreground hover:text-amber-400 hover:bg-amber-400/10'
      } ${className}`}
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      ) : (
        <Star
          className={`w-4 h-4 transition-transform active:scale-125 ${
            isFavorite ? 'fill-amber-400 text-amber-400' : ''
          }`}
        />
      )}
      {showLabel && (
        <span className="ml-1.5 text-xs">
          {isFavorite ? 'Favorito' : 'Favorito'}
        </span>
      )}
    </Button>
  )
}
