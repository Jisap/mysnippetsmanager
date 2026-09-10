import { AddSnippetForm } from '@/components/add-snippet-form'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-background">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-10 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          Mi Gestor de Snippets
        </h1>

        <AddSnippetForm />

        <Link href="/snippets" className="block text-center mt-8 text-blue-500 hover:underline">
          Ver todos mis snippets →
        </Link>
      </div>
    </main>
  )
}