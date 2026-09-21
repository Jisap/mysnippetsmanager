'use client'

import { useState } from 'react'
import { Copy, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getSnippetCodeAction } from '@/app/actions'

interface QuickCopyButtonProps {
  code?: string
  snippetId?: string
  size?: 'sm' | 'icon'
  className?: string
}

export function QuickCopyButton({
  code,
  snippetId,
  size = 'icon',
  className = '',
}: QuickCopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      let text = code
      if (!text && snippetId) {
        setLoading(true)
        const res = await getSnippetCodeAction(snippetId)
        setLoading(false)
        if (!res.success || !('code' in res) || typeof res.code !== 'string') {
          console.error('No se pudo obtener el código para copiar')
          return
        }
        text = res.code
      }
      if (!text) return
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code', err)
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size={size}
      onClick={handleCopy}
      disabled={loading}
      aria-label={copied ? 'Código copiado' : 'Copiar código al portapapeles'}
      title={copied ? '¡Copiado!' : 'Copiar código'}
      className={`h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 ${className}`}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : copied ? (
        <Check className="w-3.5 h-3.5 text-emerald-500 transition-transform scale-110" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </Button>
  )
}
