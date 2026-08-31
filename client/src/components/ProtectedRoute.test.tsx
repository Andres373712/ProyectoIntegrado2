import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

const useAuth = vi.fn();
vi.mock("@/shared/auth/AuthProvider", () => ({ useAuth }));

const { default: ProtectedRoute } = await import("./ProtectedRoute");

// listo/token/rol vienen de AuthProvider — acá se simula cada combinación
// posible sin depender del provider real ni de localStorage.
function mockAuth(overrides: Partial<{ token: string | null; rol: string | null; listo: boolean }>) {
  useAuth.mockReturnValue({ token: null, rol: null, listo: true, ...overrides });
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("no renderiza nada ni redirige mientras la sesión todavía no está lista", () => {
    mockAuth({ listo: false, token: null, rol: null });
    render(
      <ProtectedRoute>
        <p>Contenido protegido</p>
      </ProtectedRoute>,
    );
    expect(screen.queryByText("Contenido protegido")).not.toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it("redirige a redirectTo (default /login) si no hay token", () => {
    mockAuth({ listo: true, token: null, rol: null });
    render(
      <ProtectedRoute>
        <p>Contenido protegido</p>
      </ProtectedRoute>,
    );
    expect(screen.queryByText("Contenido protegido")).not.toBeInTheDocument();
    expect(replace).toHaveBeenCalledWith("/login");
  });

  it("respeta un redirectTo custom", () => {
    mockAuth({ listo: true, token: null, rol: null });
    render(
      <ProtectedRoute redirectTo="/login-cliente">
        <p>Contenido protegido</p>
      </ProtectedRoute>,
    );
    expect(replace).toHaveBeenCalledWith("/login-cliente");
  });

  it("redirige a / si hay sesión pero el rol no está permitido", () => {
    mockAuth({ listo: true, token: "un-token", rol: "cliente" });
    render(
      <ProtectedRoute allowedRoles={["admin"]}>
        <p>Contenido protegido</p>
      </ProtectedRoute>,
    );
    expect(screen.queryByText("Contenido protegido")).not.toBeInTheDocument();
    expect(replace).toHaveBeenCalledWith("/");
  });

  it("renderiza los hijos y no redirige cuando el rol está permitido", () => {
    mockAuth({ listo: true, token: "un-token", rol: "admin" });
    render(
      <ProtectedRoute allowedRoles={["admin"]}>
        <p>Contenido protegido</p>
      </ProtectedRoute>,
    );
    expect(screen.getByText("Contenido protegido")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it("acepta cualquier rol de la lista, no solo el primero", () => {
    mockAuth({ listo: true, token: "un-token", rol: "cliente" });
    render(
      <ProtectedRoute allowedRoles={["admin", "cliente"]}>
        <p>Contenido protegido</p>
      </ProtectedRoute>,
    );
    expect(screen.getByText("Contenido protegido")).toBeInTheDocument();
  });
});
