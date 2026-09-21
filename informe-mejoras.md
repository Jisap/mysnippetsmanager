# Informe de Evaluación — SnippetManager (Next 16 + Prisma + Supabase)

**Fecha:** 2026-09-21
**Repo:** `next16-mysnippetmanager`
**Stack:** Next.js 16.3.4 (App Router), React 19, TypeScript, Prisma 6 + PostgreSQL, Supabase Auth (@supabase/ssr), Tailwind v4, Shiki, Monaco, Fuse.js, Framer Motion, Radix/Shadcn
**Nota global:** 7/10 funcional · 4/10 seguridad y escalado

---

## 1. Resumen ejecutivo

App bien estructurada: Server Components para datos, Server Actions centralizadas en `app/actions.ts`, resaltado Shiki en servidor + editor Monaco solo en cliente, búsqueda difusa y doble vista (grid/tabla). Lista para uso personal con decenas de snippets.

Bloqueadores antes de escalar o exponer en producción:

1. **IDOR total:** cualquier `update/delete/toggle/notes/duplicate` acepta un `id` sin comprobar `userId`. El detalle `/snippets/[slug]` y `/edit` tampoco filtran por usuario. Conocer un UUID/slug = leer/editar/borrar ajeno.
2. **Lista sin paginar:** `app/snippets/page.tsx` trae todos los `code` completos al cliente para Fuse.js. Con cientos de snippets = MBs de RSC + OOM.
3. **Sin validación en servidor:** Zod solo existe en el cliente. `create/update/import` aceptan payload arbitrario, sin límites de tamaño/número.
4. **Bundle pesado:** Monaco estático, meta-paquete `radix-ui`, CLI `shadcn` como dependency, `framer-motion@13`, fuentes sin `weight`, Shiki con 4 temas en memoria + roundtrip por cambio de tema.
5. **Datos incorrectos:** `tagCount` global en `app/page.tsx`, tags huérfanos que nunca se limpian, slugify sin normalizar acentos.

Todo es corregible sin rewrite. Ver plan priorizado en §7.

---

## 2. Estado actual (lo que está bien)

- Separación clara `app/` (server) vs `components/` (client con `'use client'`).
- Auth Supabase con `createClient` servidor + listener `onAuthStateChange` en `components/navbar.tsx:47`.
- Singleton Prisma correcto en `lib/prisma.ts:7` (evita exhaust de conexiones en dev).
- Singleton Shiki en `lib/shiki.ts:6` con fallback a `plaintext`.
- `highlightCode` en servidor para carga instantánea en `app/snippets/[slug]/page.tsx:39`.
- `revalidatePath` tras mutaciones, backup export/import JSON, favoritos optimistas, `view_mode` persistido en `localStorage`.
- UI cuidada: dashboard `app/page.tsx`, `SnippetSearch`, `SnippetTableView` ordenable, `MarkdownNotes`, `CodeViewer` con zoom/temas.

---

## 3. Hallazgos críticos — Seguridad y corrección

### 3.1 IDOR / falta de autorización (P0)

| Lugar | Problema |
|---|---|
| `app/actions.ts:74 updateSnippet` | `findUnique({where:{id}})` + `update` sin `userId`. |
| `app/actions.ts:143 updateSnippetNotes` | Igual. |
| `app/actions.ts:167 deleteSnippet` | `delete({where:{id}})` sin dueño. |
| `app/actions.ts:184 toggleFavoriteSnippet` | Igual. |
| `app/actions.ts:211 duplicateSnippet` | Lee original ajeno, crea copia. |
| `app/snippets/[slug]/page.tsx:24` | `findFirst({where:{slug}})` sin `userId` ni login. Filtra en lista (`page.tsx:19`) pero el detalle queda público por slug enumerable. |
| `app/snippets/[slug]/edit/page.tsx:13` | Igual, permite abrir editor ajeno. |

**Fix patrón:**
```ts
const supabase = await createClient();
const { data:{ user } } = await supabase.auth.getUser();
if (!user) return { success:false, error:'No autorizado' };
// y en cada query:
where: { id, userId: user.id }
// detalle:
where: { slug, userId: user.id }
```
Si se quiere snippet público, añadir `isPublic Boolean @default(false)` y `OR:[{userId},{isPublic:true}]`.

### 3.2 Conteo global de tags (bug privacidad)

`app/page.tsx:23` → `prisma.tag.count()` cuenta tags de todos los usuarios.

```ts
prisma.tag.count({ where:{ snippets:{ some:{ userId:user.id } } } })
```

### 3.3 Sin validación servidor (P0)

Zod solo en `components/add-snippet-form.tsx:18` y `edit-snippet-form.tsx:19`. Atacante puede llamar la Server Action con `code` de 10MB, `title` de 1MB, `language` inventado.

Crear `lib/validations.ts` con el mismo schema + límites (`title max 200, description max 1000, code max 100_000, language enum, tags max 200`) y parsear al inicio de `createSnippet/updateSnippet/importSnippetsAction`.

### 3.4 Import vulnerable a DoS (P0)

`app/actions.ts:303 importSnippetsAction(items:any[])`: `any[]`, loop `for...await` con 2 queries por item (N+1), sin límite, sin transacción.

Fix: `if(items.length>500) reject`, validar cada item con Zod, `createMany` + batch `connectOrCreate`, o transacción `prisma.$transaction`.

### 3.5 Slugify débil

`app/actions.ts:7`: solo `toLowerCase + replace(/ /g)`. `canción → cancin`, `C++ → c`. Colisión resuelta con `Date.now()` predecible.

```ts
text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim()
 .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || `snippet-${randomUUID().slice(0,8)}`
```

### 3.6 Tags huérfanos

`updateSnippet` hace `tags:{set:[]}` pero nunca borra `Tag` sin snippets. Añadir limpieza:
```ts
prisma.tag.deleteMany({ where:{ snippets:{ none:{} } } })
```
como job o tras update/delete.

---

## 4. Optimización de recursos — Rendimiento

### 4.1 Red: se envía demasiado código al cliente (mayor coste)

`app/snippets/page.tsx:18`:
```ts
findMany({ where:{userId}, include:{tags:true}, orderBy:{createdAt:'desc'} })
```
trae `code` completo de todos + `SnippetSearch` lo guarda en `useState` y Fuse lo indexa en memoria. Estimación: 500 snippets × 20KB = 10MB de RSC.

Fix:
```ts
select:{ id:true,title:true,slug:true,description:true,language:true,isFavorite:true,createdAt:true, tags:{select:{id:true,name:true}} }
```
+ paginación servidor (`take:50`, cursor `createdAt/id`, `searchParams ?q=&lang=&tag=&fav=`). `code` solo bajo demanda (botón copiar pide por `id` o trunca a 200 chars para preview).

### 4.2 JS: bundle cliente pesado

- `@monaco-editor/react` (~2-3MB) importado estático en add/edit form. Carga en `/` aunque solo se mire dashboard. → `next/dynamic(...,{ssr:false})`.
- `radix-ui:^1.6.7` meta-paquete completo. → `@radix-ui/react-select`, `react-slot`, etc. sueltos.
- `shadcn:^4.21.0` es la CLI, debe ser devDependency o eliminarse.
- `cn:^0.2.6` duplica `lib/utils.ts`. Quedarse con uno.
- `react-simple-code-editor` sin uso aparente. Eliminar si no se usa.
- `framer-motion:^13.2.0` antigua. Migrar a `motion` actual o al menos `framer-motion@12`.
- `lucide-react@^1.43.0`: verificar versión (serie histórica 0.x). Fijar versión real.
- `next.config.ts` vacío. Añadir:
```ts
experimental:{ optimizePackageImports:['lucide-react','framer-motion','fuse.js'] },
compress:true
```
+ `npx @next/bundle-analyzer`.

### 4.3 Servidor: Shiki + Prisma

- `lib/shiki.ts:8` carga 4 temas + 10 langs (~50-100MB por instancia serverless). Cada cambio de tema en `components/code-viewer.tsx:39` hace `getHighlightedCodeAction` (roundtrip). → Pre-generar 2 temas en `page.tsx` una vez y cachear con `unstable_cache`, o limitar selector a `github-dark/dracula`.
- Lenguajes UI (6 en el form) vs Shiki (10). Unificar en `lib/languages.ts` para no caer en `plaintext`.
- Índices actuales insuficientes (`schema.prisma:27`). Añadir:
```prisma
@@index([userId, createdAt(sort: Desc)])
@@index([userId, isFavorite])
@@index([language])
@@fulltext([title, description]) // Postgres, para sustituir Fuse al escalar
@@index([updatedAt])
```
- `exportAllSnippetsAction` materializa todo en memoria. Paginar/stream si >1000.
- `revalidatePath('/','/snippets','/snippets/slug')` en cada mutación invalida de más. Usar `revalidateTag` o solo ruta afectada.

### 4.4 Render / animación

- `components/snippet-table-view.tsx:145` `motion.tr` con `delay:index*0.02` + `snippets-card.tsx:36` `staggerChildren:0.05` = jank con 200 filas. Desactivar animación en tabla o virtualizar con `@tanstack/virtual`.
- 3 familias Google Fonts en `app/layout.tsx:8` sin `weight`. Fijar `weight:['400','600','700']` + `display:'swap'` (ya) para bajar LCP.
- `layout.tsx:38` fuerza `dark` siempre pero `navbar.tsx:43` lee `localStorage`. Flash + hidratación. Añadir script de tema en `<head>` + `suppressHydrationWarning`.

---

## 5. Calidad, UX, SEO, accesibilidad

- Faltan `app/loading.tsx`, `app/error.tsx`, `app/not-found.tsx`, `generateMetadata` por snippet, `sitemap.ts`, `robots.ts`. SEO = solo título genérico en `layout.tsx:26`.
- `SimpleMarkdownRenderer` (`markdown-notes.tsx:221`) casero: sin tablas/links/listas numeradas, regex inline frágil. → `react-markdown + remark-gfm + rehype-sanitize`.
- `Breadcrumbs` y `Navbar` son `'use client'` globales en layout; bien aislados, pero breadcrumbs se renderiza hasta en landing/login. Ocultar en `/login,/register,/`.
- `BackupDialog` sin validación de tamaño/tipo más allá de extensión, sin progreso por lotes.
- Sin `error boundary` en formularios Monaco (si CDN falla, rompe).
- Contraste/ARIA: botones icon-only con `title` pero sin `aria-label` en tabla/grid.

---

## 6. Qué se puede añadir (roadmap)

**P0 — antes de prod:** §3 + §4.1 + tests mínimos (`vitest` para slugify/validación, `playwright` para CRUD ajeno → 403).

**P1 — valor inmediato, bajo coste:**
- Búsqueda + filtros en servidor vía `searchParams` (q/lang/tag/fav/sort/page). Mantener Fuse solo como fallback offline.
- Paginación/cursor + conteo `totalCount`.
- Colecciones/carpetas: `model Collection {id,name,userId,snippets[]}`.
- Archivar: `isArchived Boolean`, filtro Ocultar archivados.
- Historial versiones: `model SnippetVersion {snippetId,code,createdAt}` al actualizar.
- Favoritos/tags ya existen; añadir renombrar/combinar tags y nube de tags.
- Export PNG (README lo anuncia pero no hay componente) + copy con nombre archivo.
- `Cmd+K` command palette, atajos `n` nuevo, `/` buscar.

**P2 — diferencial:**
- Share público `/s/[token]` con `shareToken String? @unique`, expiración y solo-lectura.
- API `GET/POST /api/snippets` con token para Raycast/VSCode extension.
- Import desde Gist/GitHub URL.
- Estadísticas: top langs, líneas totales, heatmap, dashboard charts.
- AI opcional: explicar código, sugerir tags/título, streaming con `ai` SDK (con opt-out y límite coste).
- PWA offline + sync, modo claro pulido, i18n `next-intl` (ya todo en es).

---

## 7. Plan de optimización propuesto (orden de ejecución)

1. **Seguridad (½ día):** `requireUser()`, `where userId` en 5 actions + 2 páginas, fix `tagCount`, schema Zod servidor compartido.
2. **Escalado datos (½ día):** `select` sin `code` en lista, paginación `take 50`, índices Prisma `@@index([userId,createdAt])`, límite import 500 + validación.
3. **Bundle (½ día):** `dynamic` Monaco, `optimizePackageImports`, limpiar deps (`radix-ui` granular, quitar `shadcn` de deps, quitar `cn` o `utils` duplicado, quitar `react-simple-code-editor` si sin uso), fijar `weight` fuentes.
4. **Shiki (2h):** reducir a 2 temas por defecto, `unstable_cache` HTML, unificar `lib/languages.ts`.
5. **UX/SEO (2h):** `loading/error/not-found`, `generateMetadata`, `sitemap/robots`, `react-markdown`, `aria-labels`.
6. **Medir:** `next build --analyze`, Lighthouse, `EXPLAIN` queries lentas, test carga import 500.

**Métricas objetivo:** lista `/snippets` <200KB RSC con 500 items (hoy ~MBs), LCP <2.5s, cambio tema <100ms sin roundtrip, import 500 en <5s.

---

## 8. Checklist de verificación

- [ ] Intentar `update/delete/toggle` con `id` ajeno → debe fallar.
- [ ] Abrir `/snippets/slug-ajeno` sin sesión → debe 404/redirect, no filtrar.
- [ ] Crear snippet con `code` 200KB → debe rechazar con mensaje.
- [ ] Importar JSON 1000 items → debe capar a 500 + error claro.
- [ ] `/snippets` con 500 rows → Network RSC <500KB, sin `code` completo.
- [ ] `npm run build` sin warnings de tamaño, Fonts con `weight` fijo.
- [ ] Cambio de tema Shiki sin Server Action por cada click (cache).
- [ ] Tags huérfanos = 0 tras borrar snippets.
- [ ] Lighthouse Perf/SEO ≥90, `not-found` y `error` renderizan.

---
*Generado como referencia escrita. No se ha modificado código de la app en este informe.*
