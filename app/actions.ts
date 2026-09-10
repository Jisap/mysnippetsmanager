'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '')
}

export async function createSnippet(data: {
  title: string
  description?: string
  code: string
  language: string
  tags?: string
  notes?: string
}) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let slug = slugify(data.title)
    if (!slug) slug = `snippet-${Date.now().toString(36)}`

    // Verificar si el slug ya existe
    const existing = await prisma.snippet.findUnique({ where: { slug } })
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`
    }

    const tagList = (data.tags || '')
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)
    const uniqueTags = Array.from(new Set(tagList))

    const snippet = await prisma.snippet.create({
      data: {
        title: data.title,
        slug: slug,
        description: data.description,
        code: data.code,
        language: data.language,
        notes: data.notes || null,
        userId: user?.id || null,
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

export async function updateSnippet(
  id: string,
  data: {
    title: string
    description?: string
    code: string
    language: string
    tags?: string
    notes?: string
  }
) {
  try {
    const existing = await prisma.snippet.findUnique({ where: { id } })
    if (!existing) {
      return { success: false, error: 'Snippet no encontrado' }
    }

    let slug = slugify(data.title)
    if (!slug) {
      slug = existing.slug
    }

    // Si el slug ha cambiado, verificar colisiones
    if (slug !== existing.slug) {
      const conflict = await prisma.snippet.findUnique({ where: { slug } })
      if (conflict && conflict.id !== id) {
        slug = `${slug}-${Date.now().toString(36)}`
      }
    }

    const tagList = (data.tags || '')
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)
    const uniqueTags = Array.from(new Set(tagList))

    const updated = await prisma.snippet.update({
      where: { id },
      data: {
        title: data.title,
        slug,
        description: data.description,
        code: data.code,
        language: data.language,
        notes: data.notes || null,
        tags: {
          set: [],
          connectOrCreate: uniqueTags.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
      },
    })

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
    const existing = await prisma.snippet.findUnique({
      where: { id },
      select: { id: true, slug: true },
    })

    if (!existing) {
      return { success: false, error: 'Snippet no encontrado' }
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
    const deleted = await prisma.snippet.delete({
      where: { id },
    })

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
    const existing = await prisma.snippet.findUnique({
      where: { id },
      select: { id: true, isFavorite: true, slug: true },
    })

    if (!existing) {
      return { success: false, error: 'Snippet no encontrado' }
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
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const original = await prisma.snippet.findUnique({
      where: { id },
      include: { tags: true },
    })

    if (!original) {
      return { success: false, error: 'Snippet no encontrado' }
    }

    const title = `${original.title} (Copia)`
    let slug = slugify(title)
    const existing = await prisma.snippet.findUnique({ where: { slug } })
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`
    }

    const duplicate = await prisma.snippet.create({
      data: {
        title,
        slug,
        description: original.description,
        code: original.code,
        language: original.language,
        notes: original.notes || null,
        userId: user?.id || null,
        isFavorite: false,
        tags: {
          connect: original.tags.map((t: any) => ({ id: t.id })),
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
  const { highlightCode } = await import('@/lib/shiki')
  return highlightCode(code, lang, theme)
}

export async function exportAllSnippetsAction() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const snippets = await prisma.snippet.findMany({
      where: user ? { userId: user.id } : { userId: null },
      include: {
        tags: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: 'asc' },
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

export async function importSnippetsAction(items: any[]) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!Array.isArray(items) || items.length === 0) {
      return { success: false, error: 'El archivo de copia de seguridad no contiene snippets válidos' }
    }

    let importedCount = 0

    for (const item of items) {
      if (!item.title || !item.code || !item.language) continue

      let slug = item.slug ? slugify(item.slug) : slugify(item.title)
      if (!slug) slug = `snippet-${Date.now().toString(36)}`

      const existing = await prisma.snippet.findUnique({ where: { slug } })
      if (existing) {
        slug = `${slug}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`
      }

      const rawTags = Array.isArray(item.tags) ? item.tags : []
      const tagNames = rawTags
        .map((t: any) => (typeof t === 'string' ? t.trim().toLowerCase() : t?.name?.trim().toLowerCase()))
        .filter(Boolean)
      const uniqueTags = Array.from(new Set(tagNames)) as string[]

      await prisma.snippet.create({
        data: {
          title: item.title,
          slug,
          description: item.description || null,
          code: item.code,
          language: item.language,
          notes: item.notes || null,
          userId: user?.id || null,
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