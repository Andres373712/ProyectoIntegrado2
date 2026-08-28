import { defineConfig, devices } from "@playwright/test";

const PLAYWRIGHT_CHROMIUM = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false, // los tests comparten el mismo backend/DB de prueba
  retries: 0,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3100",
    trace: "retain-on-failure",
    launchOptions: {
      executablePath: PLAYWRIGHT_CHROMIUM,
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command:
        "rm -f tmm_bienestar.sqlite && DEFAULT_ADMIN_PASSWORD=TestAdmin123! JWT_SECRET=clave-de-test-e2e-no-usar-en-produccion FRONTEND_URL=http://localhost:3100 PORT=5100 node server.js",
      cwd: "../server",
      port: 5100,
      reuseExistingServer: false,
      timeout: 30_000,
      stdout: "pipe",
      stderr: "pipe",
    },
    {
      // next dev en vez de build+start: el build de producción falla hoy por
      // errores de tipos preexistentes y ajenos a esta iteración (ver
      // admin/editar/[id]/page.tsx y cartLogic.ts, documentados desde la
      // auditoría original). Para e2e alcanza con el servidor de desarrollo.
      command: "npx next dev -p 3100",
      cwd: ".",
      env: { NEXT_PUBLIC_API_URL: "http://localhost:5100" },
      port: 3100,
      reuseExistingServer: false,
      timeout: 60_000,
      stdout: "pipe",
      stderr: "pipe",
    },
  ],
});
