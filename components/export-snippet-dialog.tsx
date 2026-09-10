'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, FileCode, FileText, Image as ImageIcon, X, Check, Sparkles, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ExportSnippetDialogProps {
  snippet: {
    id: string
    title: string
    slug: string
    code: string
    language: string
    description?: string | null
    notes?: string | null
    tags?: Array<{ id?: string; name: string }>
  }
}

const LANGUAGE_EXTENSIONS: Record<string, string> = {
  typescript: 'ts',
  javascript: 'js',
  python: 'py',
  css: 'css',
  html: 'html',
  json: 'json',
  sql: 'sql',
  rust: 'rs',
  go: 'go',
  java: 'java',
  csharp: 'cs',
  cpp: 'cpp',
  php: 'php',
  ruby: 'rb',
  shell: 'sh',
  bash: 'sh',
  yaml: 'yaml',
  markdown: 'md',
}

const GRADIENT_THEMES = [
  {
    id: 'cosmic',
    name: 'Cosmic Violet',
    bg: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
    from: '#6366f1',
    to: '#ec4899',
  },
  {
    id: 'sunset',
    name: 'Sunset Glow',
    bg: 'linear-gradient(135deg, #f97316 0%, #e11d48 50%, #9333ea 100%)',
    from: '#f97316',
    to: '#9333ea',
  },
  {
    id: 'cyber',
    name: 'Cyber Neon',
    bg: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)',
    from: '#06b6d4',
    to: '#8b5cf6',
  },
  {
    id: 'dark',
    name: 'Midnight Dark',
    bg: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
    from: '#18181b',
    to: '#27272a',
  },
  {
    id: 'emerald',
    name: 'Emerald Matrix',
    bg: 'linear-gradient(135deg, #059669 0%, #0d9488 50%, #0284c7 100%)',
    from: '#059669',
    to: '#0284c7',
  },
]

export function ExportSnippetDialog({ snippet }: ExportSnippetDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'files' | 'image'>('image')
  const [selectedTheme, setSelectedTheme] = useState(GRADIENT_THEMES[0])
  const [showWindowButtons, setShowWindowButtons] = useState(true)
  const [isExportingImage, setIsExportingImage] = useState(false)
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  const extension = LANGUAGE_EXTENSIONS[snippet.language.toLowerCase()] || 'txt'
  const filename = `${snippet.slug || 'snippet'}.${extension}`

  // Descargar código puro como archivo fuente (.ts, .py, etc.)
  const downloadCodeFile = () => {
    const blob = new Blob([snippet.code], { type: 'text/plain;charset=utf-8' })
    triggerDownload(blob, filename)
    notifySuccess('code')
  }

  // Descargar como Markdown estructurado con documentación
  const downloadMarkdownFile = () => {
    let md = `# ${snippet.title}\n\n`
    if (snippet.description) {
      md += `> ${snippet.description}\n\n`
    }
    if (snippet.tags && snippet.tags.length > 0) {
      md += `**Tags:** ${snippet.tags.map((t) => `#${t.name}`).join(' ')}\n\n`
    }
    md += `## Código (${snippet.language})\n\n`
    md += `\`\`\`${snippet.language}\n${snippet.code}\n\`\`\`\n\n`
    if (snippet.notes) {
      md += `## Explicación y Notas de Uso\n\n${snippet.notes}\n`
    }

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
    triggerDownload(blob, `${snippet.slug || 'snippet'}.md`)
    notifySuccess('md')
  }

  // Exportar como Imagen PNG en alta resolución (Canvas 2x)
  const exportAsPng = async () => {
    setIsExportingImage(true)

    try {
      // Dibujar en un Canvas 2D con alta resolución
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const scale = 2 // Alta densidad Retina
      const width = 800
      const padding = 50
      const cardRadius = 16
      const headerHeight = 44
      const lineHeight = 22
      const fontSize = 14

      // Partir el código en líneas (hasta un límite de 40 líneas para no desbordar)
      const lines = snippet.code.split('\n').slice(0, 35)
      const codeHeight = lines.length * lineHeight + 30
      const cardHeight = headerHeight + codeHeight
      const totalHeight = cardHeight + padding * 2

      canvas.width = width * scale
      canvas.height = totalHeight * scale
      ctx.scale(scale, scale)

      // 1. Fondo Degradado
      const bgGrad = ctx.createLinearGradient(0, 0, width, totalHeight)
      bgGrad.addColorStop(0, selectedTheme.from)
      bgGrad.addColorStop(1, selectedTheme.to)
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, width, totalHeight)

      // 2. Tarjeta estilo macOS Window (Sombra + Fondo oscuro)
      const cardX = padding
      const cardY = padding
      const cardW = width - padding * 2

      ctx.save()
      ctx.shadowColor = 'rgba(0, 0, 0, 0.45)'
      ctx.shadowBlur = 30
      ctx.shadowOffsetY = 15

      ctx.fillStyle = '#121216'
      roundRect(ctx, cardX, cardY, cardW, cardHeight, cardRadius)
      ctx.fill()
      ctx.restore()

      // Borde sutil de la tarjeta
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
      ctx.lineWidth = 1
      roundRect(ctx, cardX, cardY, cardW, cardHeight, cardRadius)
      ctx.stroke()

      // 3. Barra Superior de la Ventana
      ctx.fillStyle = '#18181e'
      ctx.beginPath()
      ctx.moveTo(cardX + cardRadius, cardY)
      ctx.lineTo(cardX + cardW - cardRadius, cardY)
      ctx.arcTo(cardX + cardW, cardY, cardX + cardW, cardY + headerHeight, cardRadius)
      ctx.lineTo(cardX + cardW, cardY + headerHeight)
      ctx.lineTo(cardX, cardY + headerHeight)
      ctx.lineTo(cardX, cardY + cardRadius)
      ctx.arcTo(cardX, cardY, cardX + cardRadius, cardY, cardRadius)
      ctx.closePath()
      ctx.fill()

      // Línea divisoria
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
      ctx.beginPath()
      ctx.moveTo(cardX, cardY + headerHeight)
      ctx.lineTo(cardX + cardW, cardY + headerHeight)
      ctx.stroke()

      // Botones de ventana estilo macOS (🔴 🟡 🟢)
      if (showWindowButtons) {
        drawCircle(ctx, cardX + 20, cardY + 22, 5.5, '#ff5f56')
        drawCircle(ctx, cardX + 38, cardY + 22, 5.5, '#ffbd2e')
        drawCircle(ctx, cardX + 56, cardY + 22, 5.5, '#27c93f')
      }

      // Título en la barra de ventana
      ctx.font = '500 12px "Plus Jakarta Sans", system-ui, sans-serif'
      ctx.fillStyle = '#a1a1aa'
      ctx.textAlign = 'center'
      ctx.fillText(
        snippet.title.length > 40 ? snippet.title.substring(0, 38) + '...' : snippet.title,
        cardX + cardW / 2,
        cardY + 26
      )

      // Badge de Lenguaje
      ctx.font = '600 11px "JetBrains Mono", monospace'
      ctx.textAlign = 'right'
      ctx.fillStyle = '#60a5fa'
      ctx.fillText(snippet.language.toUpperCase(), cardX + cardW - 20, cardY + 26)

      // 4. Código Fuente con JetBrains Mono
      ctx.font = `${fontSize}px "JetBrains Mono", monospace`
      ctx.textAlign = 'left'
      ctx.fillStyle = '#e4e4e7'

      lines.forEach((line, i) => {
        const textY = cardY + headerHeight + 28 + i * lineHeight

        // Número de línea tenue
        ctx.fillStyle = '#52525b'
        ctx.fillText(String(i + 1).padStart(2, ' '), cardX + 20, textY)

        // Texto del código
        ctx.fillStyle = '#e4e4e7'
        ctx.fillText(line, cardX + 52, textY)
      })

      // 5. Marca de agua tenue
      ctx.font = '10px "Plus Jakarta Sans", sans-serif'
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
      ctx.textAlign = 'right'
      ctx.fillText('SnippetManager', width - padding - 8, totalHeight - padding + 28)

      // Descargar PNG
      const dataUrl = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `${snippet.slug || 'snippet'}-card.png`
      a.click()
      notifySuccess('image')
    } catch (err) {
      console.error('Error generating PNG image:', err)
    } finally {
      setIsExportingImage(false)
    }
  }

  const triggerDownload = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
    URL.revokeObjectURL(url)
  }

  const notifySuccess = (type: string) => {
    setDownloadSuccess(type)
    setTimeout(() => setDownloadSuccess(null), 2500)
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-1.5"
        title="Exportar código, archivo Markdown o capturar como imagen PNG"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Exportar</span>
      </Button>

      {/* Modal de Exportación */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Download className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold">Exportar Snippet</h3>
                    <p className="text-xs text-muted-foreground">{snippet.title}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Selector de Pestañas */}
              <div className="flex border-b border-border px-6 pt-2 gap-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('image')}
                  className={`pb-2.5 text-xs font-medium flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'image'
                      ? 'border-blue-500 text-blue-400 font-semibold'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Imagen PNG (Estilo Carbon)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('files')}
                  className={`pb-2.5 text-xs font-medium flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'files'
                      ? 'border-blue-500 text-blue-400 font-semibold'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Archivos de Código & Markdown</span>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                {activeTab === 'image' ? (
                  <div className="space-y-4">
                    {/* Selector de Temas / Gradientes */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Palette className="w-3.5 h-3.5" /> Tema de fondo:
                      </span>
                      <div className="flex items-center gap-2">
                        {GRADIENT_THEMES.map((theme) => (
                          <button
                            key={theme.id}
                            type="button"
                            onClick={() => setSelectedTheme(theme)}
                            title={theme.name}
                            style={{ background: theme.bg }}
                            className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                              selectedTheme.id === theme.id ? 'scale-125 ring-2 ring-white shadow-md' : 'opacity-70 hover:opacity-100'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Previsualización en vivo */}
                    <div
                      ref={previewRef}
                      style={{ background: selectedTheme.bg }}
                      className="p-6 rounded-xl transition-all duration-300 shadow-inner"
                    >
                      <div className="rounded-xl overflow-hidden bg-[#121216] border border-white/10 shadow-2xl">
                        {/* macOS Header */}
                        <div className="flex items-center justify-between px-4 py-2.5 bg-[#18181e] border-b border-white/5 text-xs text-zinc-400 font-mono">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                            <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                            <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                          </div>
                          <span className="text-[11px] font-sans truncate max-w-[200px] text-zinc-400">
                            {snippet.title}
                          </span>
                          <span className="text-[10px] text-blue-400 font-bold uppercase">
                            {snippet.language}
                          </span>
                        </div>

                        {/* Code preview block */}
                        <div className="p-4 text-xs font-mono text-zinc-200 overflow-x-auto max-h-[220px] leading-relaxed">
                          <pre className="!bg-transparent !m-0 !p-0 select-none">
                            <code>
                              {snippet.code.split('\n').slice(0, 15).join('\n')}
                              {snippet.code.split('\n').length > 15 && '\n// ...'}
                            </code>
                          </pre>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={exportAsPng}
                      disabled={isExportingImage}
                      className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-md gap-2"
                    >
                      {isExportingImage ? (
                        <span>Generando PNG...</span>
                      ) : downloadSuccess === 'image' ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-300" />
                          <span>¡PNG Descargado con Éxito!</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span>Descargar Imagen PNG (Alta Resolución 2x)</span>
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  /* Pestaña de Archivos de Código & Markdown */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Tarjeta Archivo Fuente */}
                    <div className="p-5 border border-border/80 rounded-xl bg-muted/20 hover:border-border transition-all flex flex-col justify-between">
                      <div>
                        <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3">
                          <FileCode className="w-5 h-5 text-blue-400" />
                        </div>
                        <h4 className="text-sm font-semibold mb-1">Archivo de Código Fuente</h4>
                        <p className="text-xs text-muted-foreground mb-4">
                          Descarga el código puro en formato <code className="font-mono text-blue-400">.{extension}</code> listo para importar a tu proyecto.
                        </p>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadCodeFile}
                        className="w-full gap-1.5"
                      >
                        {downloadSuccess === 'code' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span>¡Descargado {filename}!</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" />
                            <span>Descargar {filename}</span>
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Tarjeta Markdown */}
                    <div className="p-5 border border-border/80 rounded-xl bg-muted/20 hover:border-border transition-all flex flex-col justify-between">
                      <div>
                        <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center mb-3">
                          <FileText className="w-5 h-5 text-purple-400" />
                        </div>
                        <h4 className="text-sm font-semibold mb-1">Documento Markdown (.md)</h4>
                        <p className="text-xs text-muted-foreground mb-4">
                          Incluye el título, tags, bloque de código resaltado y todas las <strong>notas de funcionamiento</strong> del autor.
                        </p>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadMarkdownFile}
                        className="w-full gap-1.5"
                      >
                        {downloadSuccess === 'md' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span>¡Descargado .md!</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" />
                            <span>Descargar {snippet.slug}.md</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

function drawCircle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, fill: string) {
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fillStyle = fill
  ctx.fill()
}
