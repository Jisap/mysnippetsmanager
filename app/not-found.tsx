import Link from 'next/link'
import { FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-20 text-center">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-5">
        <FileQuestion className="w-7 h-7 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight">Página no encontrada</h1>
      <p className="text-sm text-muted-foreground mt-2">
        El snippet o la página que buscas no existe o no tienes permiso para verlo.
      </p>
      <div className="flex items-center justify-center gap-3 mt-6">
        <Button asChild>
          <Link href="/snippets">Ver mis snippets</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Inicio</Link>
        </Button>
      </div>
    </div>
  )
}
