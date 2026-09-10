'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Database, Download, Upload, Check, AlertCircle, Loader2, X, FileJson, ShieldCheck } from 'lucide-react'
import { exportAllSnippetsAction, importSnippetsAction } from '@/app/actions'
import { Button } from '@/components/ui/button'

export function BackupDialog() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export')
  const [isPending, startTransition] = useTransition()
  const [exportSuccess, setExportSuccess] = useState(false)
  const [importResult, setImportResult] = useState<{ success?: boolean; count?: number; error?: string } | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<any[] | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 1. Exportar Backup JSON
  const handleExportBackup = () => {
    startTransition(async () => {
      const res = await exportAllSnippetsAction()
      if (res.success && res.data) {
        const jsonString = JSON.stringify(res.data, null, 2)
        const blob = new Blob([jsonString], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        const dateStr = new Date().toISOString().split('T')[0]
        a.href = url
        a.download = `snippets-backup-${dateStr}.json`
        a.click()
        URL.revokeObjectURL(url)

        setExportSuccess(true)
        setTimeout(() => setExportSuccess(false), 3000)
      }
    })
  }

  // 2. Cargar y previsualizar archivo JSON seleccionado
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setImportResult(null)

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string)
        const items = Array.isArray(json) ? json : json.snippets
        if (Array.isArray(items) && items.length > 0) {
          setParsedData(items)
        } else {
          setParsedData(null)
          setImportResult({ error: 'El archivo JSON no contiene una lista válida de snippets.' })
        }
      } catch (err) {
        setParsedData(null)
        setImportResult({ error: 'El archivo no es un JSON válido.' })
      }
    }
    reader.readAsText(file)
  }

  // 3. Ejecutar Importación
  const handleRunImport = () => {
    if (!parsedData || parsedData.length === 0) return

    startTransition(async () => {
      const res = await importSnippetsAction(parsedData)
      if (res.success) {
        setImportResult({ success: true, count: res.count })
        setSelectedFile(null)
        setParsedData(null)
        router.refresh()
      } else {
        setImportResult({ error: res.error || 'Error al importar snippets' })
      }
    })
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-1.5 border-border/80 bg-background/50 hover:bg-muted"
        title="Gestionar copias de seguridad de la biblioteca"
      >
        <Database className="w-3.5 h-3.5 text-blue-400" />
        <span className="hidden sm:inline">Backup & Restaurar</span>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Database className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold">Copia de Seguridad de la Biblioteca</h3>
                    <p className="text-xs text-muted-foreground">Exporta o importa toda tu colección de snippets</p>
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
                  onClick={() => {
                    setActiveTab('export')
                    setImportResult(null)
                  }}
                  className={`pb-2.5 text-xs font-medium flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'export'
                      ? 'border-blue-500 text-blue-400 font-semibold'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exportar (Backup JSON)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('import')
                    setExportSuccess(false)
                  }}
                  className={`pb-2.5 text-xs font-medium flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'import'
                      ? 'border-blue-500 text-blue-400 font-semibold'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Importar (Restaurar)</span>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5">
                {activeTab === 'export' ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-muted/20 border border-border/70 flex items-start gap-3">
                      <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                      <div className="text-xs text-muted-foreground leading-relaxed">
                        <strong className="text-foreground font-semibold block mb-0.5">
                          Backup Completo y Portátil
                        </strong>
                        Descarga un único archivo JSON con todos tus snippets, notas técnicas, etiquetas y favoritos para guardar en tu disco duro o migrar a otra base de datos.
                      </div>
                    </div>

                    <Button
                      onClick={handleExportBackup}
                      disabled={isPending}
                      className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-md gap-2"
                    >
                      {isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : exportSuccess ? (
                        <Check className="w-4 h-4 text-emerald-300" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      <span>
                        {isPending
                          ? 'Generando backup...'
                          : exportSuccess
                          ? '¡Backup Descargado!'
                          : 'Descargar Backup (.JSON)'}
                      </span>
                    </Button>
                  </div>
                ) : (
                  /* Pestaña Importar */
                  <div className="space-y-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json,application/json"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {/* Zona Drop / Picker */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="p-6 border-2 border-dashed border-border/80 hover:border-blue-500/80 rounded-xl bg-muted/10 hover:bg-muted/20 transition-all text-center cursor-pointer"
                    >
                      <FileJson className="w-8 h-8 mx-auto text-blue-400 mb-2" />
                      <p className="text-sm font-medium text-foreground">
                        {selectedFile ? selectedFile.name : 'Haz clic para seleccionar archivo de backup'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Formatos soportados: .json</p>
                    </div>

                    {/* Previsualización del número de elementos */}
                    {parsedData && (
                      <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-center justify-between">
                        <span>Listos para importar:</span>
                        <strong className="font-semibold text-white">{parsedData.length} snippets detectados</strong>
                      </div>
                    )}

                    {/* Mensajes de Resultado / Error */}
                    {importResult?.error && (
                      <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{importResult.error}</span>
                      </div>
                    )}

                    {importResult?.success && (
                      <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
                        <Check className="w-4 h-4 shrink-0" />
                        <span>¡Se han importado {importResult.count} snippets correctamente a tu base de datos!</span>
                      </div>
                    )}

                    <Button
                      onClick={handleRunImport}
                      disabled={!parsedData || isPending}
                      className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-md gap-2"
                    >
                      {isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      <span>
                        {isPending ? 'Importando snippets...' : 'Importar Snippets a la Base de Datos'}
                      </span>
                    </Button>
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
