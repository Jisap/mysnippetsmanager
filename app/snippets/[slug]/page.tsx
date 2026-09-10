// app/snippets/[slug]/page.tsx
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { highlightCode } from '@/lib/shiki'
import { CodeViewer } from '@/components/code-viewer'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function SnippetDetailPage({ params }: Props) {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)

  const snippet = await prisma.snippet.findFirst({
    where: {
      OR: [
        { slug: slug },
        { slug: decodedSlug },
      ],
    },
  })

  if (!snippet) notFound()

  // Resaltado inicial en el servidor para carga instantánea
  const initialHtml = await highlightCode(snippet.code, snippet.language, 'github-dark')

  return (
    <div className="max-w-5xl mx-auto p-8">
      <Link href="/snippets" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Volver a la lista
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">{snippet.title}</h1>
          <Badge variant="secondary">{snippet.language}</Badge>
        </div>
        <p className="text-muted-foreground text-lg">{snippet.description}</p>
      </div>

      <CodeViewer
        code={snippet.code}
        initialHtml={initialHtml}
        initialLanguage={snippet.language}
        initialTheme="github-dark"
      />

      <div className="mt-8 text-sm text-muted-foreground border-t pt-4">
        Creado el {new Date(snippet.createdAt).toLocaleDateString('es-ES')}
      </div>
    </div>
  )
}