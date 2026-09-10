'use client'

import { useState, useTransition } from 'react'
import { CopyPlus, Loader2, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { duplicateSnippet } from '@/app/actions'
import { Button } from '@/components/ui/button'

interface DuplicateSnippetButtonProps {
  snippetId: string
  size?: 'sm' | 'default' | 'icon'
  variant?: 'outline' | 'ghost' | 'secondary'
  showLabel?: boolean
  className?: string
}

export function DuplicateSnippetButton({
  snippetId,
  size = 'sm',
  variant = 'outline',
  showLabel = true,
  className = '',
}: DuplicateSnippetButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isSuccess, setIsSuccess] = useState(false)

  const handleDuplicate = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    startTransition(async () => {
      const res = await duplicateSnippet(snippetId)
      if (res.success && res.slug) {
        setIsSuccess(true)
        setTimeout(() => {
          router.push(`/snippets/${res.slug}`)
        }, 600)
      }
    })
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleDuplicate}
      disabled={isPending || isSuccess}
      title="Duplicar como nuevo snippet"
      className={`transition-all duration-200 ${className}`}
    >
      {isPending ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : isSuccess ? (
        <Check className="w-3.5 h-3.5 text-green-500" />
      ) : (
        <CopyPlus className="w-3.5 h-3.5" />
      )}
      {showLabel && (
        <span className="ml-1.5">
          {isPending ? 'Duplicando...' : isSuccess ? '¡Duplicado!' : 'Duplicar'}
        </span>
      )}
    </Button>
  )
}
