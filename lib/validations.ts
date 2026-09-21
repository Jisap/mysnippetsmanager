import * as z from 'zod'

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

export const snippetSchema = z.object({
  title: z.string().trim().min(3, { message: 'El título debe tener al menos 3 caracteres' }).max(200),
  description: z.string().trim().max(1000).optional().or(z.literal('')),
  code: z.string().min(1, { message: 'El código no puede estar vacío' }).max(100_000, {
    message: 'El código supera el límite de 100.000 caracteres',
  }),
  language: z.enum(SUPPORTED_LANGUAGES),
  tags: z.string().max(200, { message: 'Demasiadas etiquetas' }).optional().or(z.literal('')),
  notes: z.string().max(50_000, { message: 'Las notas superan el límite permitido' }).optional().or(z.literal('')),
})

export type SnippetInput = z.infer<typeof snippetSchema>

export const snippetImportItemSchema = z.object({
  title: z.string().trim().min(3).max(200),
  slug: z.string().trim().max(220).optional(),
  description: z.string().max(1000).nullable().optional(),
  code: z.string().min(1).max(100_000),
  language: z.string().trim().max(30),
  notes: z.string().max(50_000).nullable().optional(),
  isFavorite: z.boolean().optional(),
  tags: z.array(z.union([z.string(), z.object({ name: z.string() })])).optional(),
})

export const MAX_IMPORT_ITEMS = 500

export function normalizeLanguage(lang: string): string | null {
  const normalized = lang.trim().toLowerCase()
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(normalized) ? normalized : null
}

export function slugify(text: string): string {
  const base = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
  return base
}

export function uniqueSlug(base: string, suffix: string): string {
  const clean = slugify(base) || 'snippet'
  return `${clean}-${suffix}`.slice(0, 100)
}

export function parseTags(input?: string | null): string[] {
  const tagList = (input || '')
    .split(',')
    .map((t) => t.trim().toLowerCase().replace(/[^a-z0-9+#_.-]/g, ''))
    .map((t) => t.slice(0, 30))
    .filter(Boolean)
  return Array.from(new Set(tagList)).slice(0, 20)
}
