// app/snippets/[slug]/page.tsx
import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { highlightCode } from '@/lib/shiki'
import { createClient } from '@/lib/supabase/server'
import { SnippetDetailView } from '@/components/snippet-detail-view'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DeleteSnippetButton } from '@/components/delete-snippet-button'
import { FavoriteButton } from '@/components/favorite-button'
import { DuplicateSnippetButton } from '@/components/duplicate-snippet-button'
import { ShareSnippetButton } from '@/components/share-snippet-button'
import { ExportSnippetDialog } from '@/components/export-snippet-dialog'
import { CollectionAssigner } from '@/components/collection-assigner'
import Link from 'next/link'
import { Pencil, Tag, Calendar } from 'lucide-react'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { title: 'Snippet' }

  const snippet = await prisma.snippet.findFirst({
    where: { userId: user.id, slug: decodeURIComponent(slug) },
    select: { title: true, description: true, language: true },
  })
  if (!snippet) return { title: 'Snippet no encontrado' }
  return {
    title: snippet.title,
    description: snippet.description || `Snippet de ${snippet.language}`,
  }
}

export default async function SnippetDetailPage({ params }: Props) {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const snippet = await prisma.snippet.findFirst({
    where: {
      userId: user.id,
      OR: [
        { slug: slug },
        { slug: decodedSlug },
      ],
    },
    include: {
      tags: true,
      collections: { select: { id: true } },
    },
  })

  if (!snippet) notFound()

  const allCollections = await prisma.collection.findMany({
    where: { userId: user.id },
    select: { id: true, name: true, _count: { select: { snippets: true } } },
    orderBy: { name: 'asc' },
  })

  // Resaltado inicial en el servidor para carga instantánea
  const initialHtml = await highlightCode(snippet.code, snippet.language, 'github-dark')

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Header: título + metadatos + barra de acciones */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-2">
            <h1 className="text-3xl font-bold tracking-tight">{snippet.title}</h1>
            <Badge variant="secondary" className="font-mono text-xs uppercase font-semibold">
              {snippet.language}
            </Badge>
            {snippet.tags && snippet.tags.map((tag: any) => (
              <Badge
                key={tag.id}
                variant="outline"
                className="text-xs bg-muted/40 text-muted-foreground flex items-center gap-1 font-medium"
              >
                <Tag className="w-2.5 h-2.5" />
                {tag.name}
              </Badge>
            ))}
          </div>
          {snippet.description && (
            <p className="text-muted-foreground text-base leading-relaxed mt-2">
              {snippet.description}
            </p>
          )}
        </div>

        {/* Barra de Acciones */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <FavoriteButton
            snippetId={snippet.id}
            initialIsFavorite={Boolean(snippet.isFavorite)}
            size="sm"
            showLabel={true}
            className="border border-border/60 bg-background/50 hover:bg-muted"
          />

          <ExportSnippetDialog snippet={snippet} />

          <ShareSnippetButton title={snippet.title} />

          <DuplicateSnippetButton snippetId={snippet.id} />

          <Button asChild variant="outline" size="sm">
            <Link href={`/snippets/${snippet.slug}/edit`} className="flex items-center gap-1.5">
              <Pencil className="w-3.5 h-3.5" />
              <span>Editar</span>
            </Link>
          </Button>

          <DeleteSnippetButton snippetId={snippet.id} snippetTitle={snippet.title} />
        </div>
      </div>

      {/* Visor Interactivo con Tabs y Split View */}
      <SnippetDetailView
        snippetId={snippet.id}
        code={snippet.code}
        initialHtml={initialHtml}
        language={snippet.language}
        notes={snippet.notes}
      />

      {/* Colecciones del snippet */}
      <div className="mt-6 max-w-2xl">
        <CollectionAssigner
          snippetId={snippet.id}
          allCollections={allCollections.map((c) => ({
            id: c.id,
            name: c.name,
            count: c._count.snippets,
          }))}
          assignedIds={snippet.collections.map((c) => c.id)}
        />
      </div>

      <div className="mt-8 flex items-center justify-between text-xs text-muted-foreground border-t border-border/40 pt-4">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          Creado el {new Date(snippet.createdAt).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </span>
        <span>ID: <code className="font-mono">{snippet.id.slice(0, 8)}</code></span>
      </div>
    </div>
  )
}