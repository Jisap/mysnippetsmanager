import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { EditSnippetForm } from '@/components/edit-snippet-form'
import { createClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function EditSnippetPage({ params }: Props) {
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

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <EditSnippetForm snippet={snippet} />
    </div>
  )
}
