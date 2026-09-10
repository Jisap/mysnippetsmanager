// app/snippets/[slug]/page.tsx
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { highlightCode } from '@/lib/shiki'
import { CodeViewer } from '@/components/code-viewer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DeleteSnippetButton } from '@/components/delete-snippet-button'
import Link from 'next/link'
import { Pencil, Tag } from 'lucide-react'

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
    include: {
      tags: true,
    },
  })

  if (!snippet) notFound()

  // Resaltado inicial en el servidor para carga instantánea
  const initialHtml = await highlightCode(snippet.code, snippet.language, 'github-dark')

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Header: título + acciones */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-2">
            <h1 className="text-3xl font-bold truncate">{snippet.title}</h1>
            <Badge variant="secondary">{snippet.language}</Badge>
            {snippet.tags && snippet.tags.map((tag) => (
              <Badge key={tag.id} variant="outline" className="text-xs bg-muted/40 text-muted-foreground flex items-center gap-1">
                <Tag className="w-2.5 h-2.5" />
                {tag.name}
              </Badge>
            ))}
          </div>
          <p className="text-muted-foreground text-base">{snippet.description}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button asChild variant="outline" size="sm">
            <Link href={`/snippets/${snippet.slug}/edit`} className="flex items-center gap-1.5">
              <Pencil className="w-4 h-4" />
              <span>Editar</span>
            </Link>
          </Button>
          <DeleteSnippetButton snippetId={snippet.id} snippetTitle={snippet.title} />
        </div>
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