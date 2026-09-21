'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { randomUUID } from 'crypto'
import { createClient } from '@/lib/supabase/server'
import {
  snippetSchema,
  snippetImportItemSchema,
  MAX_IMPORT_ITEMS,
  normalizeLanguage,
  slugify,
  uniqueSlug,
  parseTags,
} from '@/lib/validations'

async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado. Inicia sesión.', user: null as null }
  return { user, error: null as null }
}

function buildSlug(title: string, fallbackSuffix?: string): string {
  const base = slugify(title)
  if (base) return base
  return `snippet-${(fallbackSuffix || randomUUID().slice(0, 8)).toLowerCase()}`
}

export async function createSnippet(data: unknown) {
  try {
    const { user, error: authError } = await requireUser()
    if (!user) return { success: false, error: authError }

    const parsed = snippetSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Datos inválidos' }
    }
    const input = parsed.data

    let slug = buildSlug(input.title)
    const existing = await prisma.snippet.findUnique({ where: { slug } })
    if (existing) {
      slug = uniqueSlug(input.title, randomUUID().slice(0, 6))
    }

    const uniqueTags = parseTags(input.tags)

    const snippet = await prisma.snippet.create({
      data: {
        title: input.title,
        slug: slug,
        description: input.description || null,
        code: input.code,
        language: input.language,
        notes: input.notes || null,
        userId: user.id,
        ...(uniqueTags.length > 0
          ? {
              tags: {
                connectOrCreate: uniqueTags.map((name) => ({
                  where: { name },
                  create: { name },
                })),
              },
            }
          : {}),
      },
    })

    revalidatePath('/')
    revalidatePath('/snippets')

    return { success: true, slug: snippet.slug }
  } catch (error) {
    console.error('Error creating snippet:', error)
    return { success: false, error: 'No se pudo guardar el snippet' }
  }
}

export async function updateSnippet(id: string, data: unknown) {
  try {
    const { user, error: authError } = await requireUser()
    if (!user) return { success: false, error: authError }
    if (!id || typeof id !== 'string') return { success: false, error: 'ID inválido' }

    const parsed = snippetSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Datos inválidos' }
    }
    const input = parsed.data

    const existing = await prisma.snippet.findUnique({ where: { id } })
    if (!existing) {
      return { success: false, error: 'Snippet no encontrado' }
    }
    if (existing.userId !== user.id) {
      return { success: false, error: 'No tienes permiso para editar este snippet' }
    }

    let slug = buildSlug(input.title, existing.slug)
    if (!slug) slug = existing.slug

    // Si el slug ha cambiado, verificar colisiones
    if (slug !== existing.slug) {
      const conflict = await prisma.snippet.findUnique({ where: { slug } })
      if (conflict && conflict.id !== id) {
        slug = uniqueSlug(input.title, randomUUID().slice(0, 6))
      }
    }

    const uniqueTags = parseTags(input.tags)

    const updated = await prisma.snippet.update({
      where: { id },
      data: {
        title: input.title,
        slug,
        description: input.description || null,
        code: input.code,
        language: input.language,
        notes: input.notes || null,
        tags: {
          set: [],
          connectOrCreate: uniqueTags.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
      },
    })

    // Limpieza best-effort de tags huérfanos
    await prisma.tag.deleteMany({ where: { snippets: { none: {} } } }).catch(() => {})

    revalidatePath('/')
    revalidatePath('/snippets')
    revalidatePath(`/snippets/${existing.slug}`)
    if (slug !== existing.slug) {
      revalidatePath(`/snippets/${slug}`)
    }

    return { success: true, slug: updated.slug }
  } catch (error) {
    console.error('Error updating snippet:', error)
    return { success: false, error: 'No se pudo actualizar el snippet' }
  }
}

export async function updateSnippetNotes(id: string, notes: string) {
  try {
    const { user, error: authError } = await requireUser()
    if (!user) return { success: false, error: authError }
    if (!id || typeof id !== 'string') return { success: false, error: 'ID inválido' }
    if (typeof notes !== 'string' || notes.length > 50_000) {
      return { success: false, error: 'Notas inválidas o demasiado largas' }
    }

    const existing = await prisma.snippet.findUnique({
      where: { id },
      select: { id: true, slug: true, userId: true },
    })

    if (!existing) {
      return { success: false, error: 'Snippet no encontrado' }
    }
    if (existing.userId !== user.id) {
      return { success: false, error: 'No tienes permiso para editar este snippet' }
    }

    const updated = await prisma.snippet.update({
      where: { id },
      data: { notes: notes || null },
    })

    revalidatePath(`/snippets/${existing.slug}`)
    return { success: true, notes: updated.notes }
  } catch (error) {
    console.error('Error updating snippet notes:', error)
    return { success: false, error: 'No se pudieron guardar las notas' }
  }
}

export async function deleteSnippet(id: string) {
  try {
    const { user, error: authError } = await requireUser()
    if (!user) return { success: false, error: authError }
    if (!id || typeof id !== 'string') return { success: false, error: 'ID inválido' }

    const existing = await prisma.snippet.findUnique({
      where: { id },
      select: { id: true, slug: true, userId: true },
    })
    if (!existing) return { success: false, error: 'Snippet no encontrado' }
    if (existing.userId !== user.id) {
      return { success: false, error: 'No tienes permiso para eliminar este snippet' }
    }

    const deleted = await prisma.snippet.delete({
      where: { id },
    })

    await prisma.tag.deleteMany({ where: { snippets: { none: {} } } }).catch(() => {})

    revalidatePath('/')
    revalidatePath('/snippets')
    revalidatePath(`/snippets/${deleted.slug}`)

    return { success: true }
  } catch (error) {
    console.error('Error deleting snippet:', error)
    return { success: false, error: 'No se pudo eliminar el snippet' }
  }
}

export async function toggleFavoriteSnippet(id: string) {
  try {
    const { user, error: authError } = await requireUser()
    if (!user) return { success: false, error: authError }
    if (!id || typeof id !== 'string') return { success: false, error: 'ID inválido' }

    const existing = await prisma.snippet.findUnique({
      where: { id },
      select: { id: true, isFavorite: true, slug: true, userId: true },
    })

    if (!existing) {
      return { success: false, error: 'Snippet no encontrado' }
    }
    if (existing.userId !== user.id) {
      return { success: false, error: 'No tienes permiso para modificar este snippet' }
    }

    const updated = await prisma.snippet.update({
      where: { id },
      data: { isFavorite: !existing.isFavorite },
    })

    revalidatePath('/')
    revalidatePath('/snippets')
    revalidatePath(`/snippets/${existing.slug}`)

    return { success: true, isFavorite: Boolean(updated.isFavorite) }
  } catch (error) {
    console.error('Error toggling favorite:', error)
    return { success: false, error: 'No se pudo actualizar favorito' }
  }
}

export async function duplicateSnippet(id: string) {
  try {
    const { user, error: authError } = await requireUser()
    if (!user) return { success: false, error: authError }
    if (!id || typeof id !== 'string') return { success: false, error: 'ID inválido' }

    const original = await prisma.snippet.findUnique({
      where: { id },
      include: { tags: true },
    })

    if (!original) {
      return { success: false, error: 'Snippet no encontrado' }
    }
    if (original.userId !== user.id) {
      return { success: false, error: 'No tienes permiso para duplicar este snippet' }
    }

    const title = `${original.title} (Copia)`.slice(0, 200)
    let slug = slugify(title) || `snippet-${randomUUID().slice(0, 8)}`
    const existing = await prisma.snippet.findUnique({ where: { slug } })
    if (existing) {
      slug = uniqueSlug(title, randomUUID().slice(0, 6))
    }

    const duplicate = await prisma.snippet.create({
      data: {
        title,
        slug,
        description: original.description,
        code: original.code,
        language: original.language,
        notes: original.notes || null,
        userId: user.id,
        isFavorite: false,
        tags: {
          connect: original.tags.map((t) => ({ id: t.id })),
        },
      },
    })

    revalidatePath('/')
    revalidatePath('/snippets')

    return { success: true, slug: duplicate.slug }
  } catch (error) {
    console.error('Error duplicating snippet:', error)
    return { success: false, error: 'No se pudo duplicar el snippet' }
  }
}

export async function getHighlightedCodeAction(code: string, lang: string, theme: string = 'github-dark') {
  if (typeof code !== 'string' || code.length === 0 || code.length > 100_000) {
    throw new Error('Código inválido')
  }
  if (typeof lang !== 'string' || lang.length > 30) {
    throw new Error('Lenguaje inválido')
  }
  const safeTheme = typeof theme === 'string' && theme.length <= 30 ? theme : 'github-dark'
  const { highlightCode } = await import('@/lib/shiki')
  return highlightCode(code, lang, safeTheme)
}

export async function exportAllSnippetsAction() {
  try {
    const { user, error: authError } = await requireUser()
    if (!user) return { success: false, error: authError }

    const snippets = await prisma.snippet.findMany({
      where: { userId: user.id },
      include: {
        tags: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: 'asc' },
      take: 2000,
    })

    const payload = {
      app: 'SnippetManager',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      totalCount: snippets.length,
      snippets: snippets.map((s) => ({
        title: s.title,
        slug: s.slug,
        description: s.description,
        code: s.code,
        language: s.language,
        notes: s.notes,
        isFavorite: s.isFavorite,
        createdAt: s.createdAt,
        tags: s.tags.map((t) => t.name),
      })),
    }

    return { success: true, data: payload }
  } catch (error) {
    console.error('Error exporting snippets:', error)
    return { success: false, error: 'No se pudieron exportar los snippets' }
  }
}

export async function importSnippetsAction(items: unknown) {
  try {
    const { user, error: authError } = await requireUser()
    if (!user) return { success: false, error: authError }

    if (!Array.isArray(items) || items.length === 0) {
      return { success: false, error: 'El archivo de copia de seguridad no contiene snippets válidos' }
    }
    if (items.length > MAX_IMPORT_ITEMS) {
      return { success: false, error: `Límite de ${MAX_IMPORT_ITEMS} snippets por importación` }
    }

    let importedCount = 0

    for (const raw of items) {
      const parsed = snippetImportItemSchema.safeParse(raw)
      if (!parsed.success) continue
      const item = parsed.data

      const language = normalizeLanguage(item.language)
      if (!language) continue

      let slug = item.slug ? slugify(item.slug) : slugify(item.title)
      if (!slug) slug = `snippet-${randomUUID().slice(0, 8)}`

      const existing = await prisma.snippet.findUnique({ where: { slug } })
      if (existing) {
        slug = uniqueSlug(slug, randomUUID().slice(0, 6))
      }

      const rawTags = Array.isArray(item.tags) ? item.tags : []
      const tagNames = rawTags
        .map((t) => (typeof t === 'string' ? t.trim().toLowerCase() : t?.name?.trim().toLowerCase()))
        .filter(Boolean)
        .map((t) => t.replace(/[^a-z0-9+#_.-]/g, '').slice(0, 30))
        .filter(Boolean)
      const uniqueTags = Array.from(new Set(tagNames)).slice(0, 20)

      await prisma.snippet.create({
        data: {
          title: item.title,
          slug,
          description: item.description || null,
          code: item.code,
          language,
          notes: item.notes || null,
          userId: user.id,
          isFavorite: Boolean(item.isFavorite),
          ...(uniqueTags.length > 0
            ? {
                tags: {
                  connectOrCreate: uniqueTags.map((name) => ({
                    where: { name },
                    create: { name },
                  })),
                },
              }
            : {}),
        },
      })

      importedCount++
    }

    revalidatePath('/')
    revalidatePath('/snippets')

    return { success: true, count: importedCount }
  } catch (error) {
    console.error('Error importing snippets:', error)
    return { success: false, error: 'Error durante la importación de snippets' }
  }
}
