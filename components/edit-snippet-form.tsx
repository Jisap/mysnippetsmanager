'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, Loader2, ArrowLeft, Code } from 'lucide-react'
import Editor from '@monaco-editor/react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { updateSnippet } from '@/app/actions'
import { configureMonaco } from '@/lib/monaco'

const formSchema = z.object({
  title: z.string().min(3, { message: 'El título debe tener al menos 3 caracteres' }),
  description: z.string().optional(),
  code: z.string().min(1, { message: 'El código no puede estar vacío' }),
  language: z.string({ required_error: 'Selecciona un lenguaje' }),
})

interface SnippetData {
  id: string
  title: string
  slug: string
  description?: string | null
  code: string
  language: string
}

export function EditSnippetForm({ snippet }: { snippet: SnippetData }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: snippet.title,
      description: snippet.description || '',
      code: snippet.code,
      language: snippet.language,
    },
  })

  const currentLanguage = form.watch('language') || 'typescript'

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    setStatus('idle')
    setErrorMessage('')

    const result = await updateSnippet(snippet.id, values)

    setIsSubmitting(false)

    if (result.success && result.slug) {
      setStatus('success')
      router.refresh()
      setTimeout(() => {
        router.push(`/snippets/${result.slug}`)
      }, 1000)
    } else {
      setStatus('error')
      setErrorMessage(result.error || 'Ocurrió un error al actualizar el snippet')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="max-w-4xl mx-auto p-8 border rounded-2xl bg-card shadow-xl backdrop-blur-sm bg-opacity-90"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            href={`/snippets/${snippet.slug}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Cancelar y volver
          </Link>
          <h2 className="text-3xl font-bold tracking-tight">Editar Snippet</h2>
        </div>
        <AnimatePresence>
          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-green-500 bg-green-500/10 px-3 py-1 rounded-full text-sm font-medium"
            >
              <CheckCircle2 className="w-4 h-4" /> Cambios Guardados
            </motion.div>
          )}
          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-destructive bg-destructive/10 px-3 py-1 rounded-full text-sm font-medium"
            >
              <AlertCircle className="w-4 h-4" /> {errorMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Título del Snippet</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: useFetch Hook" className="h-11" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Lenguaje</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Selecciona lenguaje" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="typescript">TypeScript</SelectItem>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="css">CSS</SelectItem>
                      <SelectItem value="html">HTML</SelectItem>
                      <SelectItem value="sql">SQL</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base">Descripción</FormLabel>
                <FormControl>
                  <Input placeholder="¿Para qué sirve este código?" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between mb-1.5">
                  <FormLabel className="text-base">Código Fuente</FormLabel>
                  <span className="text-xs font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                    {currentLanguage}
                  </span>
                </div>
                <FormControl>
                  <div className="border border-zinc-800 rounded-xl overflow-hidden bg-[#1e1e1e] shadow-2xl">
                    <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900/90 border-b border-zinc-800 text-xs text-zinc-400 font-mono">
                      <Code className="w-3.5 h-3.5 text-blue-400" />
                      <span>VS Code Editor</span>
                    </div>
                    <Editor
                      height="350px"
                      language={currentLanguage}
                      value={field.value}
                      theme="vs-dark"
                      beforeMount={configureMonaco}
                      onChange={(value) => field.onChange(value || '')}
                      loading={
                        <div className="h-[350px] flex items-center justify-center text-zinc-400 gap-2 font-mono text-sm">
                          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                          Cargando editor...
                        </div>
                      }
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 2,
                        wordWrap: 'on',
                        fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
                        padding: { top: 12, bottom: 12 },
                        roundedSelection: true,
                        cursorBlinking: 'smooth',
                        smoothScrolling: true,
                      }}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              className="w-1/3 h-12 text-base"
              onClick={() => router.push(`/snippets/${snippet.slug}`)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="w-2/3 h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                >
                  <Loader2 className="w-5 h-5 mr-2" />
                </motion.div>
              ) : null}
              {isSubmitting ? 'Guardando Cambios...' : 'Actualizar Snippet'}
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  )
}
