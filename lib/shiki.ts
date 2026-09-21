// lib/shiki.ts
import { createHighlighter, type Highlighter } from 'shiki'
import { SUPPORTED_LANGUAGES } from '@/lib/languages'

let highlighter: Highlighter | null = null

export async function getHighlighter() {
    if (!highlighter) {
        highlighter = await createHighlighter({
            themes: ['github-dark', 'github-light', 'dracula', 'one-dark-pro'],
            langs: [...SUPPORTED_LANGUAGES],
        })
    }
    return highlighter
}

export async function highlightCode(code: string, lang: string, theme: string = 'github-dark') {
    const hl = await getHighlighter()

    const supportedLangs = hl.getLoadedLanguages()
    const language = supportedLangs.includes(lang) ? lang : 'plaintext'

    // Verificamos si el tema existe, si no usamos el por defecto
    const availableThemes = hl.getLoadedThemes()
    const selectedTheme = availableThemes.includes(theme as any) ? theme : 'github-dark'

    return hl.codeToHtml(code, {
        lang: language,
        theme: selectedTheme as any,
    })
}