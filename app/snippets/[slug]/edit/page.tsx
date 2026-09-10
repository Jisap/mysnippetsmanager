import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { EditSnippetForm } from '@/components/edit-snippet-form'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function EditSnippetPage({ params }: Props) {
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

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <EditSnippetForm snippet={snippet} />
    </div>
  )
}
