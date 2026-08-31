import { APIRequestContext, Page, expect } from "@playwright/test";

export const API_URL = "http://localhost:5100";
export const ADMIN_EMAIL = "carolina@tmm.cl";
export const ADMIN_PASSWORD = "TestAdmin123!";

export async function loginComoAdmin(page: Page) {
  await page.goto("/login");
  await page.getByLabel(/correo|email/i).fill(ADMIN_EMAIL);
  await page.getByLabel(/contraseña|password/i).fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: /iniciar sesión|ingresar/i }).click();
  await expect(page).toHaveURL(/\/admin/);
}

/** Crea un taller directo por API (sin pasar por la UI) para tests que solo necesitan datos ya sembrados. */
export async function crearTallerViaApi(
  request: APIRequestContext,
  overrides: Record<string, string> = {},
) {
  const loginResp = await request.post(`${API_URL}/api/login`, {
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  const { token } = await loginResp.json();

  const nombre = overrides.nombre ?? `Taller E2E ${Date.now()}`;

  const resp = await request.post(`${API_URL}/api/talleres`, {
    headers: { Authorization: `Bearer ${token}` },
    multipart: {
      nombre,
      fecha: overrides.fecha ?? "2026-06-01T10:00",
      tipo: overrides.tipo ?? "B2C",
      precio: overrides.precio ?? "15000",
      cupos_totales: overrides.cupos_totales ?? "5",
    },
  });
  expect(resp.ok()).toBeTruthy();

  // La lista de "activos" se ordena por fecha, no por orden de creación —
  // hay que buscar por nombre en vez de asumir que es el último del array.
  const activos = await (await request.get(`${API_URL}/api/talleres/activos`)).json();
  const creado = activos.find((t: { nombre: string }) => t.nombre === nombre);
  expect(creado, `No se encontró el taller recién creado "${nombre}" en /talleres/activos`).toBeTruthy();
  return creado;
}

/** Crea un producto directo por API (sin pasar por la UI), igual que crearTallerViaApi. */
export async function crearProductoViaApi(
  request: APIRequestContext,
  overrides: Record<string, string> = {},
) {
  const loginResp = await request.post(`${API_URL}/api/login`, {
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  const { token } = await loginResp.json();

  const nombre = overrides.nombre ?? `Producto E2E ${Date.now()}`;

  const resp = await request.post(`${API_URL}/api/productos`, {
    headers: { Authorization: `Bearer ${token}` },
    multipart: {
      nombre,
      precio: overrides.precio ?? "8000",
      stock: overrides.stock ?? "3",
    },
  });
  expect(resp.ok()).toBeTruthy();

  const activos = await (await request.get(`${API_URL}/api/productos/activos`)).json();
  const creado = activos.find((p: { nombre: string }) => p.nombre === nombre);
  expect(creado, `No se encontró el producto recién creado "${nombre}" en /productos/activos`).toBeTruthy();
  return creado;
}
