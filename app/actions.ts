'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createSnippet(data: {
  title: string
  description?: string
  code: string
  language: string
}) {
  try {
    // Generamos un slug simple a partir del título
    const slug = data.title
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '')

    await prisma.snippet.create({
      data: {
        title: data.title,
        slug: slug,
        description: data.description,
        code: data.code,
        language: data.language,
      },
    })

    // Revalidamos la caché para que aparezca el nuevo snippet si estamos en la lista
    revalidatePath('/')

    // Opcional: redirigir o mostrar mensaje de éxito
    return { success: true }
  } catch (error) {
    console.error('Error creating snippet:', error)
    return { success: false, error: 'No se pudo guardar el snippet' }
  }
}

export async function getHighlightedCodeAction(code: string, lang: string, theme: string = 'github-dark') {
  const { highlightCode } = await import('@/lib/shiki')
  return highlightCode(code, lang, theme)
}