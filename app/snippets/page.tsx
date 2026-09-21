// app/snippets/page.tsx
import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { Code2 } from 'lucide-react'
import { SnippetSearch } from '@/components/snippet-search'
import { BackupDialog } from '@/components/backup-dialog'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Prisma } from '@/lib/generated/prisma'

const PAGE_SIZE = 24

interface SearchParams {
  q?: string
  lang?: string
  tag?: string
  fav?: string
  collection?: string
  page?: string
  sort?: string
  order?: string
}

interface Props {
  searchParams: Promise<SearchParams>
}

export default async function SnippetsPage({ searchParams }: Props) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Si no hay sesión, redirigir al login
  if (!user) redirect('/login')

  const sp = await searchParams
  const query = (sp.q || '').trim().slice(0, 100)
  const langParam = (sp.lang || 'all').trim().slice(0, 30)
  const tagParam = (sp.tag || '').trim().toLowerCase().slice(0, 30) || null
  const onlyFavorites = sp.fav === '1'
  const collectionParam = (sp.collection || '').trim().slice(0, 40) || null
  const page = Math.max(1, parseInt(sp.page || '1', 10) || 1)
  const sortField = ['createdAt', 'title', 'language'].includes(sp.sort || '')
    ? (sp.sort as 'createdAt' | 'title' | 'language')
    : 'createdAt'
  const sortOrder: 'asc' | 'desc' = sp.order === 'asc' ? 'asc' : 'desc'

  // WHERE compartido para count + findMany (solo datos del dueño)
  const where: Prisma.SnippetWhereInput = { userId: user.id }
  if (onlyFavorites) where.isFavorite = true
  if (langParam !== 'all') where.language = { equals: langParam, mode: 'insensitive' }
  if (tagParam) where.tags = { some: { name: tagParam } }
  // La colección debe ser propia; si no, el filtro no coincide con nada
  if (collectionParam) {
    const ownedCollection = await prisma.collection.findFirst({
      where: { id: collectionParam, userId: user.id },
      select: { id: true },
    })
    where.collections = { some: { id: ownedCollection ? ownedCollection.id : '__none__' } }
  }
  if (query) {
    where.AND = [
      {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { language: { contains: query, mode: 'insensitive' } },
          { slug: { contains: query, mode: 'insensitive' } },
          { tags: { some: { name: { contains: query, mode: 'insensitive' } } } },
        ],
      },
    ]
  }

  const orderBy: Prisma.SnippetOrderByWithRelationInput =
    sortField === 'title'
      ? { title: sortOrder }
      : sortField === 'language'
        ? { language: sortOrder }
        : { createdAt: sortOrder }

  const [totalCount, totalUserCount, favoritesCount, rawItems, langRows, tagRows, collectionRows] = await Promise.all([
    prisma.snippet.count({ where }),
    prisma.snippet.count({ where: { userId: user.id } }),
    prisma.snippet.count({ where: { userId: user.id, isFavorite: true } }),
    prisma.snippet.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        language: true,
        isFavorite: true,
        createdAt: true,
        code: true, // solo para calcular lineCount en servidor; se elimina antes de enviar al cliente
        tags: { select: { id: true, name: true } },
      },
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.snippet.findMany({
      where: { userId: user.id },
      select: { language: true },
      distinct: ['language'],
      take: 50,
    }),
    prisma.tag.findMany({
      where: { snippets: { some: { userId: user.id } } },
      select: {
        id: true,
        name: true,
        snippets: { where: { userId: user.id }, select: { id: true } },
      },
      take: 100,
    }),
    prisma.collection.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        name: true,
        snippets: { where: { userId: user.id }, select: { id: true } },
      },
      orderBy: { name: 'asc' },
      take: 100,
    }),
  ])

  // Payload ligero al cliente: sin `code`, con `lineCount` precalculado
  const snippets = rawItems.map(({ code, ...rest }) => ({
    ...rest,
    lineCount: code ? code.split('\n').length : 0,
  }))

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)

  const availableLanguages = langRows.map((r) => r.language).filter(Boolean).sort()
  const topTags = tagRows
    .map((t) => ({ name: t.name, count: t.snippets.length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  const collections = collectionRows.map((c) => ({
    id: c.id,
    name: c.name,
    count: c.snippets.length,
  }))

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Mis Snippets
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {totalUserCount} {totalUserCount === 1 ? 'snippet guardado' : 'snippets guardados'}
          </p>
        </div>

        <BackupDialog />
      </div>

      {totalUserCount === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Code2 className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p>Aún no has guardado ningún snippet.</p>
        </div>
      ) : (
        <Suspense fallback={<div className="py-20 text-center text-sm text-muted-foreground">Cargando snippets…</div>}>
          <SnippetSearch
          initialSnippets={snippets}
          totalCount={totalCount}
          totalUserCount={totalUserCount}
          favoritesCount={favoritesCount}
          availableLanguages={availableLanguages}
          topTags={topTags}
          collections={collections}
          page={safePage}
          totalPages={totalPages}
          initialQuery={query}
          initialLanguage={langParam}
          initialTag={tagParam}
          initialCollection={collectionParam}
          initialOnlyFavorites={onlyFavorites}
          initialSort={sortField}
          initialOrder={sortOrder}
        />
        </Suspense>
      )}
    </div>
  )
}
