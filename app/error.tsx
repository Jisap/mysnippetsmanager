'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Route error:', error)
  }, [error])

  return (
    <div className="max-w-2xl mx-auto px-6 py-20 text-center">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-destructive/10 flex items-center justify-center mb-5">
        <AlertTriangle className="w-7 h-7 text-destructive" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight">Algo salió mal</h1>
      <p className="text-sm text-muted-foreground mt-2">
        Ocurrió un error inesperado al cargar esta página. Puedes reintentarlo o volver al inicio.
      </p>
      <div className="flex items-center justify-center gap-3 mt-6">
        <Button onClick={() => reset()}>Reintentar</Button>
        <Button asChild variant="outline">
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    </div>
  )
}
