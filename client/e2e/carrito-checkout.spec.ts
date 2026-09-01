import { test, expect } from "@playwright/test";
import { crearProductoViaApi, ADMIN_EMAIL, ADMIN_PASSWORD, API_URL } from "./helpers";

test("una clienta puede añadir un producto al carrito y completar el checkout", async ({
  page,
  request,
}) => {
  // La pantalla de éxito abre window.open("https://www.mercadopago.cl/")
  // (simulación de pago) 2s después de confirmar — en este entorno de
  // pruebas esa navegación externa cuelga el navegador entero en vez de
  // fallar rápido. Se aborta a nivel de *contexto* (no de página): el popup
  // que crea window.open es una Page nueva dentro del mismo
  // BrowserContext, y page.route() no lo cubre — solo intercepta requests
  // de la página en la que se llamó.
  await page.context().route("https://www.mercadopago.cl/**", (route) => route.abort());

  const producto = await crearProductoViaApi(request, {
    nombre: `Kit Resina E2E ${Date.now()}`,
    precio: "12000",
    stock: "3",
  });

  await page.goto("/catalogo");

  // Igual que con CardTitle de talleres: es un <div>, no un heading real —
  // se busca por texto exacto. Se scopea al Card completo (identificado por
  // la clase que usa CatalogoProductos.tsx) para no depender de que sea el
  // único producto en la base compartida de e2e.
  const card = page.locator(".overflow-hidden").filter({ hasText: producto.nombre }).first();
  await expect(card).toBeVisible();
  await card.getByRole("button", { name: "Añadir al Carrito" }).click();

  // El toast (Radix) duplica el texto: una vez visible y otra vez en un
  // live-region para lectores de pantalla — .first() evita el strict-mode
  // violation de Playwright por match ambiguo.
  await expect(page.getByText(`¡${producto.nombre} añadido al carrito!`).first()).toBeVisible();

  // Se navega por click (ruteo de cliente) en vez de page.goto en todo el
  // test: page.goto queda intermitentemente colgado esperando el evento
  // "load" en este entorno (next dev con Turbopack de por medio), sin
  // relación con la lógica de la app. El nav es "fixed", pero Playwright a
  // veces lo reporta "outside of the viewport" si la página quedó
  // scrolleada desde una interacción anterior — forzar scroll al top antes
  // de clickear evita ese falso negativo.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.getByLabel("Ver carrito").first().click();
  await expect(page.getByText(producto.nombre, { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Finalizar compra" }).click();

  const email = `clienta-carrito-e2e-${Date.now()}@test.com`;
  await page.getByLabel("Nombre Completo").fill("Clienta Carrito E2E");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Teléfono (WhatsApp)").fill("+56911112222");

  await page.getByRole("button", { name: "Proceder al pago" }).click();

  await expect(page.getByRole("heading", { name: "¡Pedido Confirmado!" })).toBeVisible();

  // El carrito se vacía tras un pedido exitoso (clearCart en carrito/page.tsx)
  // — se comprueba volviendo a ver esta pantalla desde cero, en vez de solo
  // confiar en la de éxito que ya se está mirando. "exito" es estado local
  // del componente: sigue en true mientras no se desmonte, así que hay que
  // salir de /carrito primero (si no, un click a "/carrito" estando ya ahí
  // no remonta nada y se seguiría viendo la pantalla de éxito). Se navega
  // por click (ruteo de cliente) en vez de page.goto (recarga completa), que
  // en este entorno de pruebas queda colgado esperando el "load" de la
  // navegación por una razón no relacionada con la app en sí.
  await page.getByRole("link", { name: /volver al catálogo/i }).click();
  await expect(page).toHaveURL("http://localhost:3100/");
  // Dos links "Ver carrito" en el DOM (nav desktop + nav móvil, uno oculto
  // por CSS pero igual presente) — .first() toma el del nav desktop.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.getByLabel("Ver carrito").first().click();
  await expect(page.getByText("Tu carrito está vacío")).toBeVisible();

  // No alcanza con ver la pantalla de éxito: se confirma contra el backend
  // que el pedido quedó guardado con el total real (no uno inventado por el
  // cliente) y que el stock del producto se descontó — el mismo
  // comportamiento que ya prueba pedidoService.test.js a nivel de service,
  // pero acá de punta a punta, pasando por la UI real del carrito.
  const loginResp = await request.post(`${API_URL}/api/login`, {
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  const { token } = await loginResp.json();

  const pedidos = await (
    await request.get(`${API_URL}/api/pedidos/todos`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  ).json();
  const pedidoCreado = pedidos.find((p: { cliente: { email: string } }) => p.cliente.email === email);
  expect(pedidoCreado, "No se encontró el pedido recién creado en /pedidos/todos").toBeTruthy();
  expect(pedidoCreado.total).toBe(12000);

  const productosActualizados = await (await request.get(`${API_URL}/api/productos/activos`)).json();
  const productoActualizado = productosActualizados.find(
    (p: { id: number }) => p.id === producto.id,
  );
  expect(productoActualizado.stock).toBe(2); // 3 - 1
});
