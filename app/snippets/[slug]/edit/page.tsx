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
  })

  if (!snippet) notFound()

  return (
    <main className="min-h-screen p-8 bg-background">
      <div className="max-w-5xl mx-auto">
        <EditSnippetForm snippet={snippet} />
      </div>
    </main>
  )
}
