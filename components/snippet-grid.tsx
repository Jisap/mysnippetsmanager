'use client'

import { motion } from 'framer-motion'
import { SnippetCard } from './snippets-card'

interface SnippetGridProps {
    snippets: any[]
}

export function SnippetGrid({ snippets }: SnippetGridProps) {
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