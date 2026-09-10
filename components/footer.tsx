'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, Code2, X, ExternalLink, Heart, Sparkles } from 'lucide-react'

export function Footer() {
  const [isLicenseOpen, setIsLicenseOpen] = useState(false)
  const currentYear = new Date().getFullYear()

  return (
    <>
      <footer className="w-full border-t border-border/50 bg-background/80 backdrop-blur-xl mt-auto py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Brand & Personal Logo */}
          <div className="flex items-center gap-3.5">
            <div className="relative group">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-border/80 bg-black/90 p-0.5 shadow-md group-hover:border-blue-500/50 group-hover:shadow-blue-500/20 transition-all duration-300">
                <Image
                  src="/jisapdev-logo.jpg"
                  alt="JisapDev Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl blur-sm opacity-0 group-hover:opacity-30 transition-opacity -z-10" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text">
                  SnippetManager
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border/50">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                Creado por{' '}
                <span className="font-semibold text-foreground hover:text-blue-400 transition-colors">
                  JisapDev
                </span>
              </p>
            </div>
          </div>

          {/* Center / Links */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link
              href="/snippets"
              className="hover:text-foreground transition-colors"
            >
              Mis Snippets
            </Link>
            <span>•</span>
            <Link
              href="/"
              className="hover:text-foreground transition-colors"
            >
              Nuevo Snippet
            </Link>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsLicenseOpen(true)}
              className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 hover:underline cursor-pointer font-medium"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Licencia MIT</span>
            </button>
          </div>

          {/* Copyright & Badge */}
          <div className="text-center sm:text-right text-xs text-muted-foreground">
            <p>© {currentYear} JisapDev. Código abierto bajo Licencia MIT.</p>
          </div>
        </div>
      </footer>

      {/* Modal / Dialog de Licencia MIT */}
      <AnimatePresence>
        {isLicenseOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-border/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden border border-border bg-black/90 p-0.5 shadow-sm shrink-0">
                    <Image
                      src="/jisapdev-logo.jpg"
                      alt="JisapDev Logo"
                      width={40}
                      height={40}
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </div>
                  <div>
                    <h3 className="text-base font-bold tracking-tight text-foreground flex items-center gap-1.5">
                      Licencia MIT
                      <span className="text-xs font-normal text-blue-400 font-mono bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                        Open Source
                      </span>
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Copyright (c) {currentYear} JisapDev
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsLicenseOpen(false)}
                  className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* License Body */}
              <div className="my-4 max-h-[300px] overflow-y-auto rounded-xl bg-muted/40 p-4 border border-border/50 text-[12px] font-mono text-muted-foreground leading-relaxed">
                <p className="font-semibold text-foreground mb-2">MIT License</p>
                <p className="mb-2">Copyright (c) {currentYear} JisapDev</p>
                <p className="mb-3">
                  Permission is hereby granted, free of charge, to any person obtaining a copy
                  of this software and associated documentation files (the &quot;Software&quot;), to deal
                  in the Software without restriction, including without limitation the rights
                  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
                  copies of the Software, and to permit persons to whom the Software is
                  furnished to do so, subject to the following conditions:
                </p>
                <p className="mb-3">
                  The above copyright notice and this permission notice shall be included in all
                  copies or substantial portions of the Software.
                </p>
                <p className="text-muted-foreground/80">
                  THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
                  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
                  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
                  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
                  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
                  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
                  SOFTWARE.
                </p>
              </div>

              {/* Footer Modal */}
              <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Software Libre y Seguro
                </span>
                <button
                  type="button"
                  onClick={() => setIsLicenseOpen(false)}
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium text-xs hover:bg-primary/90 transition-colors cursor-pointer"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
