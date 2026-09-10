'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import Editor from 'react-simple-code-editor'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { createSnippet } from '@/app/actions'

const formSchema = z.object({
  title: z.string().min(3, { message: "El título debe tener al menos 3 caracteres" }),
  description: z.string().optional(),
  code: z.string().min(1, { message: "El código no puede estar vacío" }),
  language: z.string({ required_error: "Selecciona un lenguaje" }),
})

export function AddSnippetForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      code: '',
      language: 'typescript',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    setStatus('idle')

    const result = await createSnippet(values)

    setIsSubmitting(false)

    if (result.success) {
      setStatus('success')
      form.reset()
      setTimeout(() => setStatus('idle'), 3000)
    } else {
      setStatus('error')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="max-w-3xl mx-auto p-8 border rounded-2xl bg-card shadow-xl backdrop-blur-sm bg-opacity-90"
    >
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Nuevo Snippet</h2>
        <AnimatePresence>
          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-green-500 bg-green-500/10 px-3 py-1 rounded-full text-sm font-medium"
            >
              <CheckCircle2 className="w-4 h-4" /> Guardado
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
                <FormLabel className="text-base">Código Fuente</FormLabel>
                <FormControl>
                  <div className="border rounded-lg overflow-hidden bg-zinc-950">
                    <Editor
                      value={field.value}
                      onValueChange={field.onChange}
                      highlight={(code) => code} // Aquí iría shiki más tarde
                      padding={20}
                      style={{
                        fontFamily: '"Fira Code", monospace',
                        fontSize: 14,
                        minHeight: '250px',
                        outline: 'none',
                        color: '#e4e4e7',
                        backgroundColor: 'transparent'
                      }}
                      className="w-full"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="pt-4">
            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                  <Loader2 className="w-5 h-5 mr-2" />
                </motion.div>
              ) : null}
              {isSubmitting ? 'Procesando...' : 'Guardar en Base de Datos'}
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  )
}