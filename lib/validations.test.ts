import { describe, it, expect } from 'vitest'
import {
  snippetSchema,
  snippetImportItemSchema,
  MAX_IMPORT_ITEMS,
  normalizeLanguage,
  slugify,
  uniqueSlug,
  parseTags,
} from './validations'

describe('slugify', () => {
  it('convierte a kebab-case', () => {
    expect(slugify('useFetch Hook')).toBe('usefetch-hook')
  })

  it('normaliza acentos y eñes', () => {
    expect(slugify('Canción de prueba')).toBe('cancion-de-prueba')
  })

  it('elimina símbolos', () => {
    expect(slugify('C++ Guide!')).toBe('c-guide')
  })

  it('devuelve vacío si no hay nada aprovechable', () => {
    expect(slugify('!!!')).toBe('')
  })

  it('limita a 80 caracteres', () => {
    expect(slugify('a'.repeat(200)).length).toBeLessThanOrEqual(80)
  })
})

describe('uniqueSlug', () => {
  it('une base y sufijo', () => {
    expect(uniqueSlug('Mi Snippet', 'abc123')).toBe('mi-snippet-abc123')
  })

  it('usa fallback si la base está vacía', () => {
    expect(uniqueSlug('!!!', 'abc123')).toContain('abc123')
  })
})

describe('parseTags', () => {
  it('separa por comas, minúsculas y sin duplicados', () => {
    expect(parseTags('React, react, HOOKS')).toEqual(['react', 'hooks'])
  })

  it('filtra vacíos y sanea caracteres', () => {
    expect(parseTags('a,, b!, c#')).toEqual(['a', 'b', 'c#'])
  })

  it('devuelve [] con entrada vacía o nula', () => {
    expect(parseTags('')).toEqual([])
    expect(parseTags(null)).toEqual([])
  })

  it('limita a 20 tags', () => {
    const input = Array.from({ length: 30 }, (_, i) => `tag${i}`).join(',')
    expect(parseTags(input)).toHaveLength(20)
  })
})

describe('normalizeLanguage', () => {
  it('normaliza soportados', () => {
    expect(normalizeLanguage('TypeScript')).toBe('typescript')
  })

  it('rechaza no soportados', () => {
    expect(normalizeLanguage('cobol')).toBeNull()
  })
})

describe('snippetSchema', () => {
  const valid = {
    title: 'Mi snippet',
    code: 'const a = 1',
    language: 'typescript' as const,
  }

  it('acepta un snippet válido', () => {
    expect(snippetSchema.safeParse(valid).success).toBe(true)
  })

  it('rechaza título corto', () => {
    expect(snippetSchema.safeParse({ ...valid, title: 'ab' }).success).toBe(false)
  })

  it('rechaza código vacío o gigante', () => {
    expect(snippetSchema.safeParse({ ...valid, code: '' }).success).toBe(false)
    expect(snippetSchema.safeParse({ ...valid, code: 'x'.repeat(100_001) }).success).toBe(false)
  })

  it('rechaza lenguaje no soportado', () => {
    expect(snippetSchema.safeParse({ ...valid, language: 'cobol' }).success).toBe(false)
  })

  it('valida collectionIds como uuids (máx 20)', () => {
    const id = '123e4567-e89b-12d3-a456-426614174000'
    expect(snippetSchema.safeParse({ ...valid, collectionIds: [id] }).success).toBe(true)
    expect(snippetSchema.safeParse({ ...valid, collectionIds: ['no-uuid'] }).success).toBe(false)
    expect(
      snippetSchema.safeParse({ ...valid, collectionIds: Array(21).fill(id) }).success
    ).toBe(false)
  })
})

describe('snippetImportItemSchema', () => {
  it('acepta item mínimo válido', () => {
    const res = snippetImportItemSchema.safeParse({
      title: 'Importado',
      code: 'x',
      language: 'python',
    })
    expect(res.success).toBe(true)
  })

  it('rechaza item sin código', () => {
    expect(
      snippetImportItemSchema.safeParse({ title: 'Sin código', language: 'python' }).success
    ).toBe(false)
  })
})

describe('límites', () => {
  it('MAX_IMPORT_ITEMS es 500', () => {
    expect(MAX_IMPORT_ITEMS).toBe(500)
  })
})
