'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CodeViewerProps {
    code: string
    highlightedHtml: string
    language: string
}

export function CodeViewer({ code, highlightedHtml, language }: CodeViewerProps) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-xl overflow-hidden border bg-zinc-950 shadow-2xl my-6"
        >
            <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800">
                <span className="text-sm font-mono text-zinc-400">{language}</span>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="h-8 w-8 p-0 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
            </div>

            <div
                className="p-6 overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-zinc-900 [&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded [scrollbar-width:thin] [scrollbar-color:#3f3f46_#18181b]"
                dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            />
        </motion.div>
    )
}