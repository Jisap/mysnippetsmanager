// app/snippets/page.tsx
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Code2 } from 'lucide-react'
import { SnippetSearch } from '@/components/snippet-search'

export default async function SnippetsPage() {
  const snippets = await prisma.snippet.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          Mis Snippets
        </h1>
        <Link
          href="/"
          className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
        >
          + Nuevo Snippet
        </Link>
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