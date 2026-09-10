'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Calendar, Code2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function SnippetsGrid({ snippets }: { snippets: any[] }) {
  if (snippets.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <Code2 className="w-16 h-16 mx-auto mb-4 opacity-20" />
        <p>Aún no has guardado ningún snippet.</p>
      </div>
    )
  }

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
    >
      {snippets.map((snippet) => (
        <SnippetCard key={snippet.id} snippet={snippet} />
      ))}
    </motion.div>
  )
}

export function SnippetCard({ snippet }: { snippet: any }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="group relative p-6 border rounded-xl bg-card hover:shadow-lg transition-all cursor-pointer overflow-hidden"
    >
      <Link href={`/snippets/${snippet.slug}`}>
        <div className="flex justify-between items-start mb-4">
          <Badge variant="outline" className="font-mono text-xs">
            {snippet.language}
          </Badge>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(snippet.createdAt).toLocaleDateString('es-ES')}
          </span>
        </div>

        <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-500 transition-colors">
          {snippet.title}
        </h3>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {snippet.description || "Sin descripción"}
        </p>

        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
      </Link>
    </motion.div>
  )
}