// app/snippets/page.tsx
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { SnippetsGrid } from '@/components/snippets-card'

export default async function SnippetsPage() {
  // Consultamos todos los snippets ordenados por fecha
  const snippets = await prisma.snippet.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      tags: true, // Por si en el futuro añadimos tags
    }
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

      <SnippetsGrid snippets={snippets} />
    </div>
  )
}