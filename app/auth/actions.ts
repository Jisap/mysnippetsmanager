'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

/**
 * Asigna todos los snippets huérfanos (userId: null) al usuario dado.
 * Esto ocurre una sola vez: la primera sesión tras implantar el sistema de auth.
 */
async function claimLegacySnippets(userId: string) {
  await prisma.snippet.updateMany({
    where: { userId: null },
    data: { userId },
  })
}

export async function loginAction(formData: { email: string; password: string }) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  // Asignar snippets legacy al usuario si existen sin dueño
  if (data.user) {
    await claimLegacySnippets(data.user.id)
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function registerAction(formData: { email: string; password: string }) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) {
    return { success: false, error: error.message }
  }

  // Si la sesión se crea al instante (sin verificación de email), reclamar snippets legacy
  if (data.session && data.user) {
    await claimLegacySnippets(data.user.id)
  }

  revalidatePath('/', 'layout')
  return {
    success: true,
    requiresEmailConfirmation: !data.session,
  }
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
