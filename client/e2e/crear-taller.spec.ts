import { test, expect } from "@playwright/test";
import { loginComoAdmin } from "./helpers";

// JPEG mínimo válido de 1x1 px, para no depender de un archivo externo.
const IMAGEN_1x1 = Buffer.from(
  "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAj/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
  "base64",
);

test("un admin puede crear un taller nuevo y verlo en la lista", async ({ page }) => {
  await loginComoAdmin(page);

  await page.goto("/admin/talleres");

  const nombreTaller = `Taller Playwright ${Date.now()}`;

  await page.getByLabel("Nombre del Taller").fill(nombreTaller);
  await page.getByLabel("Descripción").fill("Creado por el test e2e de crear-taller.");
  await page.getByLabel("Fecha").fill("2026-08-01T10:00");
  await page.getByLabel("Lugar").fill("Online");
  await page.getByLabel("Cupos Totales").fill("6");
  await page.getByLabel("Precio (CLP)").fill("25000");
  await page.getByLabel("Imagen del Taller").setInputFiles({
    name: "taller.jpg",
    mimeType: "image/jpeg",
    buffer: IMAGEN_1x1,
  });

  await page.getByRole("button", { name: "Guardar Taller" }).click();

  await expect(page.getByText(/¡Éxito! Taller/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: nombreTaller })).toBeVisible();
});
