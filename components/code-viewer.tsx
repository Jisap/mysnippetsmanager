'use client'

import { useState, useTransition } from 'react'
import { motion } from 'framer-motion'
import { Check, Copy, ZoomIn, ZoomOut, Palette, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getHighlightedCodeAction } from '@/app/actions'

interface CodeViewerProps {
  code: string
  initialHtml: string
  initialLanguage: string
  initialTheme?: string
}

const THEMES = [
  { value: 'github-dark', label: 'GitHub Dark' },
  { value: 'github-light', label: 'GitHub Light' },
  { value: 'dracula', label: 'Dracula' },
  { value: 'one-dark-pro', label: 'One Dark Pro' },
]

export function CodeViewer({
  code,
  initialHtml,
  initialLanguage,
  initialTheme = 'github-dark',
}: CodeViewerProps) {
  const [copied, setCopied] = useState(false)
  const [theme, setTheme] = useState(initialTheme)
  const [fontSize, setFontSize] = useState(14)
  const [highlightedHtml, setHighlightedHtml] = useState(initialHtml)
  const [isPending, startTransition] = useTransition()

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
    startTransition(async () => {
      try {
        const html = await getHighlightedCodeAction(code, initialLanguage, newTheme)
        setHighlightedHtml(html)
      } catch (err) {
        console.error('Error changing theme:', err)
      }
    })
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-xl overflow-hidden border bg-zinc-950 shadow-2xl my-6 w-full"
    >
      {/* Barra de Herramientas */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono text-zinc-400 mr-4">{initialLanguage}</span>

          {/* Selector de Tema */}
          <Select value={theme} onValueChange={handleThemeChange}>
            <SelectTrigger className="h-7 w-[140px] text-xs bg-zinc-800 border-zinc-700">
              <Palette className="w-3 h-3 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {THEMES.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground ml-1" />}
        </div>

        <div className="flex items-center gap-1">
          {/* Controles de Zoom */}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-zinc-400 hover:text-white"
            onClick={() => setFontSize((prev) => Math.max(10, prev - 1))}
          >
            <ZoomOut className="h-3 w-3" />
          </Button>
          <span className="text-xs text-zinc-400 w-8 text-center select-none">{fontSize}px</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-zinc-400 hover:text-white"
            onClick={() => setFontSize((prev) => Math.min(24, prev + 1))}
          >
            <ZoomIn className="h-3 w-3" />
          </Button>

          <div className="w-px h-4 bg-zinc-700 mx-2" />

          {/* Botón Copiar */}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-zinc-400 hover:text-white"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
          </Button>
        </div>
      </div>

      {/* Área de Código */}
      <div
        className="p-6 overflow-x-auto w-full min-h-[150px] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-zinc-900 [&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded [scrollbar-width:thin] [scrollbar-color:#3f3f46_#18181b]"
        style={{ fontSize: `${fontSize}px`, lineHeight: '1.6' }}
      >
        <div
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          className="w-full font-mono [&_pre]:!bg-transparent [&_pre]:!m-0 [&_pre]:!p-0 [&_pre]:!border-0 [&_pre]:!overflow-visible [&_code]:!font-mono [&_code]:!block [&_code]:!w-full"
        />
      </div>
    </motion.div>
  )
}