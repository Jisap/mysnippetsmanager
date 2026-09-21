// Fuente única de verdad para lenguajes soportados.
// Usado por: formularios (Select), validación servidor (Zod) y Shiki (resaltado).

export const SUPPORTED_LANGUAGES = [
  'typescript',
  'javascript',
  'python',
  'css',
  'html',
  'sql',
  'json',
  'bash',
  'rust',
  'go',
] as const

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  python: 'Python',
  css: 'CSS',
  html: 'HTML',
  sql: 'SQL',
  json: 'JSON',
  bash: 'Bash',
  rust: 'Rust',
  go: 'Go',
}

export function isSupportedLanguage(lang: string): lang is SupportedLanguage {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(lang.trim().toLowerCase())
}
