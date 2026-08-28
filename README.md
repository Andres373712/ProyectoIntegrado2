# TMM Bienestar y Conexión

Sitio web para **TMM Bienestar y Conexión**: talleres de bienestar con
catálogo público, inscripciones, una pequeña tienda de productos, cuentas de
cliente (registro, login, "Mi Cuenta", checkout de pedidos) y un panel de
administración para gestionar talleres, productos, testimonios, mensajes de
contacto y clientes.

## Stack

- **Frontend**: [Next.js 16](https://nextjs.org/) (App Router) + React 19 +
  TypeScript, Tailwind CSS, Radix UI, TanStack Query, Axios. Deploy en
  [Vercel](https://vercel.com/).
- **Backend**: Node.js + Express, [Drizzle ORM](https://orm.drizzle.team/)
  sobre SQLite (`better-sqlite3`), autenticación con JWT, envío de correo vía
  la API HTTP de [SendGrid](https://sendgrid.com/). Deploy en
  [Railway](https://railway.app/).
- **Tests**: [Vitest](https://vitest.dev/) en ambos proyectos (unitarios/de
  integración) y [Playwright](https://playwright.dev/) para e2e en el
  frontend.

## Estructura del repo

```
.
├── client/   # Next.js — sitio público + panel admin + panel de cliente
└── server/   # API Express — talleres, productos, pedidos, clientes, auth
```

Cada carpeta tiene su propio `package.json`, dependencias y scripts — no hay
un `package.json` de workspace en la raíz, así que los comandos se corren
dentro de `client/` o `server/` según corresponda. Ver también
[`client/README.md`](./client/README.md) para más detalle del frontend.

## Cómo levantar el proyecto en local

### 1. Backend (`server/`)

```bash
cd server
npm install
cp .env.example .env   # y completar los valores (ver detalle abajo)
npm run dev             # http://localhost:5000
```

Variables de entorno relevantes (`server/.env.example` trae la lista
completa con explicación de cada una):

| Variable                 | Para qué sirve                                                                 |
| ------------------------ | ------------------------------------------------------------------------------- |
| `DEFAULT_ADMIN_PASSWORD` | Contraseña del admin por defecto creado al arrancar con la base de datos vacía. Si se deja vacía, se genera una al azar y se imprime una sola vez en consola. |
| `JWT_SECRET`             | Secreto para firmar los JWT de sesión (admin y cliente).                        |
| `SENDGRID_API_KEY`       | API key de SendGrid (permiso "Mail Send") para el envío de correos transaccionales. |
| `EMAIL_USER`             | Remitente verificado en SendGrid (Single Sender o dominio autenticado).         |
| `FRONTEND_URL`           | URL del frontend — se usa para CORS y para enlaces que resuelve el frontend (reset de contraseña, etc). Default `http://localhost:3000`. |
| `API_URL`                | URL pública del propio backend, para enlaces que el backend resuelve directamente (verificación de cuenta). En Railway se infiere sola de `RAILWAY_PUBLIC_DOMAIN` si no se fija a mano. |
| `PORT`                   | Puerto donde escucha el servidor. Default `5000`.                              |

La base de datos SQLite se crea sola (`tmm_bienestar.sqlite`) y las
migraciones de Drizzle corren automáticamente al arrancar el servidor.

### 2. Frontend (`client/`)

```bash
cd client
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local
npm run dev              # http://localhost:3000
```

`NEXT_PUBLIC_API_URL` es la única variable de entorno que necesita el
frontend: la URL base de la API del backend (default
`http://localhost:5000` si no se define). Ver
[`client/README.md`](./client/README.md) para más detalle.

## Tests

```bash
# Backend — Vitest, corre sobre mocks, no necesita base de datos ni .env real
cd server && npm test

# Frontend — Vitest (componentes/lógica de cliente)
cd client && npm test
```

## Tests end-to-end (e2e)

El frontend tiene tests end-to-end con Playwright en `client/e2e/`. Levantan
automáticamente una instancia real del backend (con una base de datos SQLite
descartable) y del frontend en modo desarrollo, así que no hace falta tener
nada corriendo de antemano:

```bash
cd client
npm run test:e2e
```

## Integración continua

`.github/workflows/ci.yml` corre en cada push/PR a `main`: tests del backend
(`server`) y build + tests unitarios del frontend (`client`). Los tests e2e
de Playwright no forman parte de este pipeline todavía.
