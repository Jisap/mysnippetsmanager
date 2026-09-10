// app/snippets/page.tsx
import { prisma } from '@/lib/prisma'
import { Code2 } from 'lucide-react'
import { SnippetSearch } from '@/components/snippet-search'

export default async function SnippetsPage() {
  const snippets = await prisma.snippet.findMany({
    include: {
      tags: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          Mis Snippets
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {snippets.length} {snippets.length === 1 ? 'snippet guardado' : 'snippets guardados'}
        </p>
      </div>

      {snippets.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Code2 className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p>Aún no has guardado ningún snippet.</p>
        </div>
      ) : (
        <SnippetSearch initialSnippets={snippets} />
      )}
    </div>
  )
}