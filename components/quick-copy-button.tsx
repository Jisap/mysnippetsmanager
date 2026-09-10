'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface QuickCopyButtonProps {
  code: string
  size?: 'sm' | 'icon'
  className?: string
}

export function QuickCopyButton({
  code,
  size = 'icon',
  className = '',
}: QuickCopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code', err)
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size={size}
      onClick={handleCopy}
      aria-label={copied ? 'Código copiado' : 'Copiar código al portapapeles'}
      title={copied ? '¡Copiado!' : 'Copiar código'}
      className={`h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 ${className}`}
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-emerald-500 transition-transform scale-110" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </Button>
  )
}
