// lib/shiki.ts
import { createHighlighter } from 'shiki'

// Creamos una instancia única para no recargar los temas/lenguajes en cada petición
let highlighter: any = null

export async function getHighlighter() {
    if (!highlighter) {
        highlighter = await createHighlighter({
            themes: ['github-dark'], // Puedes añadir más temas si quieres
            langs: ['javascript', 'typescript', 'python', 'css', 'html', 'sql', 'json', 'bash'],
        })
    }
    return highlighter
}

export async function highlightCode(code: string, lang: string) {
    const hl = await getHighlighter()

    // Si el lenguaje no está soportado, usamos plaintext para evitar errores
    const supportedLangs = hl.getLoadedLanguages()
    const language = supportedLangs.includes(lang) ? lang : 'plaintext'

    return hl.codeToHtml(code, {
        lang: language,
        theme: 'github-dark',
    })
}