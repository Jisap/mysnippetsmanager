'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

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
}) {
  try {
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

export async function getHighlightedCodeAction(code: string, lang: string, theme: string = 'github-dark') {
  const { highlightCode } = await import('@/lib/shiki')
  return highlightCode(code, lang, theme)
}