import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Middleware para actualizar la sesión de Supabase en cada request.
 * Se ejecuta antes de procesar cualquier ruta protegida.
 */

export async function updateSession(request: NextRequest) {

  let supabaseResponse = NextResponse.next({                       // Crear respuesta base que se modificará con las cookies actualizadas
    request,
  })

  const supabase = createServerClient(                             // Inicializar cliente de Supabase con manejo de cookies SSR
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {                                                 // Leer todas las cookies del request entrante
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Sincroniza las cookies en el request actual, para que el resto del
          // pipeline de esta misma petición (Server Components, etc.) vea los
          // valores nuevos en vez de los que llegaron originalmente.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )

          supabaseResponse = NextResponse.next({ request })

          // Establece las cookies en la response para que el navegador las reciba
          // y las persista de cara a la siguiente petición.
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANTE: usar getUser() y no getSession().
  // getSession() confía en el JWT de la cookie sin validarlo contra Supabase Auth.
  // getUser() sí hace esa validación (revocación, expiración real), necesaria
  // porque este middleware es la barrera de seguridad antes de las rutas protegidas.
  // El resultado no se usa: el efecto secundario es que, si hace falta, dispara
  // el refresh y llama a setAll() con las cookies nuevas.
  await supabase.auth.getUser()

  // Retornar la respuesta con las cookies actualizadas
  return supabaseResponse
}