import { test, expect } from "@playwright/test";
import { crearTallerViaApi } from "./helpers";

test("una clienta puede ver el catálogo e inscribirse a un taller", async ({ page, request }) => {
  const taller = await crearTallerViaApi(request, {
    nombre: `Taller Inscripción E2E ${Date.now()}`,
  });

  await page.goto("/catalogo");
  // El nombre del taller va en <CardTitle>, que renderiza un <div> (no un
  // heading real) — se busca por texto en vez de por rol "heading".
  await expect(page.getByText(taller.nombre, { exact: true })).toBeVisible();

  // Se navega por href en vez de "click en la tarjeta correcta" para no
  // depender de la estructura del DOM entre varias tarjetas de talleres.
  await page.locator(`a[href="/inscribir/${taller.id}"]`).first().click();

  await expect(page).toHaveURL(new RegExp(`/inscribir/${taller.id}$`));

  await page.getByLabel("Nombre Completo").fill("Clienta E2E");
  await page.getByLabel("Email").fill(`clienta-e2e-${Date.now()}@test.com`);
  await page.getByLabel("Teléfono (WhatsApp)").fill("+56911112222");

  await page.getByRole("button", { name: "Proceder al pago" }).click();

  await expect(page.getByRole("heading", { name: "¡Inscripción Exitosa!" })).toBeVisible();
});
