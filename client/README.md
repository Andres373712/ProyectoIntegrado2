# TMM Bienestar y Conexión — Frontend

Frontend en Next.js 16 (App Router) del sitio de TMM Bienestar y Conexión.
Consume la API del backend en [`../server`](../server) — ver el
[README de la raíz](../README.md) para la visión general del proyecto y cómo
levantar el backend en local.

## Rutas principales

- `/` — landing pública
- `/catalogo` — catálogo de talleres y `/inscribir/[id]` para inscribirse
- `/carrito` — carrito de la tienda de productos
- `/login`, `/registro`, `/login-cliente`, `/registro-cliente` — auth de admin y de cliente
- `/mi-cuenta` — panel de cliente (inscripciones, pedidos)
- `/cancelar-inscripcion/[token]` — cancelación de inscripción por link
- `/forgot-password`, `/reset-password/[token]` — recuperación de contraseña
- `/admin`, `/admin/talleres`, `/admin/productos`, `/admin/testimonios`, `/admin/mensajes`, `/admin/clientes`, `/admin/cliente/[id]`, `/admin/editar/[id]` — panel de administración

## Variables de entorno

| Variable              | Para qué sirve                                                        | Default                  |
| ---------------------- | ---------------------------------------------------------------------- | ------------------------- |
| `NEXT_PUBLIC_API_URL`  | URL base de la API del backend, usada por el cliente Axios (`src/shared/lib/apiClient.ts`). | `http://localhost:5000`  |

Definila en `.env.local` para desarrollo local:

```bash
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local
```

## Scripts

```bash
npm install

npm run dev        # servidor de desarrollo — http://localhost:3000
npm run build      # build de producción
npm run start      # sirve el build de producción
npm run lint       # ESLint

npm test           # tests unitarios (Vitest)
npm run test:e2e   # tests end-to-end (Playwright, en client/e2e/)
```

`npm run test:e2e` levanta por su cuenta una instancia real del backend
(con una base de datos SQLite descartable, puerto 5100) y el frontend en
modo desarrollo (puerto 3100) — no hace falta tener nada corriendo de
antemano. Configuración en `playwright.config.ts`.
