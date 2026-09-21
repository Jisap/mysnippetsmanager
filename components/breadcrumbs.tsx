'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'

const SEGMENT_LABELS: Record<string, string> = {
  snippets: 'Mis Snippets',
  edit: 'Editar',
}

function humanizeSegment(segment: string): string {
  return SEGMENT_LABELS[segment] ?? decodeURIComponent(segment).replace(/-/g, ' ')
}

const HIDDEN_ROUTES = new Set(['/', '/login', '/register'])

export function Breadcrumbs() {
  const pathname = usePathname()

  // Sin migas en landing y auth: no aportan y añaden ruido visual
  if (HIDDEN_ROUTES.has(pathname)) return null

  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) return null

  const crumbs = segments.map((seg, i) => {
    const href = '/' + segments.slice(0, i + 1).join('/')
    const isLast = i === segments.length - 1
    const isSlug =
      i === 2 && segments[0] === 'snippets' && !SEGMENT_LABELS[seg]

    const label = isSlug
      ? decodeURIComponent(seg).replace(/-/g, ' ')
      : humanizeSegment(seg)

    return { href, label, isLast }
  })

  return (
    <div className="border-b border-border/40">
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-muted-foreground px-6 py-2 max-w-6xl mx-auto">
      <Link href="/" aria-label="Inicio" className="flex items-center gap-1 hover:text-foreground transition-colors">
        <Home className="w-3.5 h-3.5" />
      </Link>
      {crumbs.map(({ href, label, isLast }) => (
        <span key={href} className="flex items-center gap-1">
          <ChevronRight className="w-3.5 h-3.5 opacity-50 shrink-0" />
          {isLast ? (
            <span className="text-foreground font-medium capitalize truncate max-w-[180px]">
              {label}
            </span>
          ) : (
            <Link href={href} className="hover:text-foreground transition-colors capitalize">
              {label}
            </Link>
          )}
        </span>
      ))}
    </nav>
    </div>
  )
}
