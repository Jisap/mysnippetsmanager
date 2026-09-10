import { AddSnippetForm } from '@/components/add-snippet-form'

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-background">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-10 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          Mi Gestor de Snippets
        </h1>
        <AddSnippetForm />
      </div>
    </main>
  )
}