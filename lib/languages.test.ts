import { describe, it, expect } from 'vitest'
import { SUPPORTED_LANGUAGES, LANGUAGE_LABELS, isSupportedLanguage } from './languages'

describe('languages', () => {
  it('expone 10 lenguajes soportados', () => {
    expect(SUPPORTED_LANGUAGES).toHaveLength(10)
    expect(SUPPORTED_LANGUAGES).toContain('typescript')
    expect(SUPPORTED_LANGUAGES).toContain('go')
  })

  it('LANGUAGE_LABELS cubre todos los lenguajes', () => {
    for (const lang of SUPPORTED_LANGUAGES) {
      expect(LANGUAGE_LABELS[lang]).toBeTruthy()
    }
  })

  it('isSupportedLanguage es insensible a mayúsculas y espacios', () => {
    expect(isSupportedLanguage('Rust')).toBe(true)
    expect(isSupportedLanguage('  typescript  ')).toBe(true)
    expect(isSupportedLanguage('cobol')).toBe(false)
    expect(isSupportedLanguage('')).toBe(false)
  })
})
