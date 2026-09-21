import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
      <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      <p className="text-sm">Cargando…</p>
    </div>
  )
}
