import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";

vi.mock("./cuentaService", () => ({
  cuentaService: {
    getInscripciones: vi.fn(),
    getPedidos: vi.fn(),
    cancelar: vi.fn(),
  },
}));

import { cuentaService } from "./cuentaService";
import { useMiCuenta } from "./useMiCuenta";

const INSCRIPCION_RAW = {
  id: 1,
  tallerId: 10,
  taller: "Yoga restaurativo",
  fecha: "2099-01-01",
  lugar: "Sala 1",
  estado: "proximo",
  fechaInscripcion: "2026-01-01",
};

type InscripcionesResponse = Awaited<ReturnType<typeof cuentaService.getInscripciones>>;
type PedidosResponse = Awaited<ReturnType<typeof cuentaService.getPedidos>>;
type CancelarResponse = Awaited<ReturnType<typeof cuentaService.cancelar>>;

beforeEach(() => {
  vi.mocked(cuentaService.getInscripciones).mockResolvedValue({
    data: [INSCRIPCION_RAW],
  } as InscripcionesResponse);
  vi.mocked(cuentaService.getPedidos).mockResolvedValue({ data: [] } as PedidosResponse);
  vi.mocked(cuentaService.cancelar).mockReset();
});

describe("useMiCuenta.cancelarInscripcion", () => {
  it("llama al servicio con el id y saca la inscripción del estado local si tiene éxito", async () => {
    vi.mocked(cuentaService.cancelar).mockResolvedValue({} as CancelarResponse);
    const { result } = renderHook(() => useMiCuenta());

    await waitFor(() => expect(result.current.inscripciones).toHaveLength(1));

    await act(async () => {
      await result.current.cancelarInscripcion(1);
    });

    expect(cuentaService.cancelar).toHaveBeenCalledWith(1);
    expect(result.current.inscripciones).toHaveLength(0);
    expect(result.current.errorCancelacion).toBe("");
  });

  it("si el servicio falla, deja la inscripción y setea un error", async () => {
    vi.mocked(cuentaService.cancelar).mockRejectedValue(new Error("500"));
    const { result } = renderHook(() => useMiCuenta());

    await waitFor(() => expect(result.current.inscripciones).toHaveLength(1));

    await act(async () => {
      await result.current.cancelarInscripcion(1);
    });

    expect(result.current.inscripciones).toHaveLength(1);
    expect(result.current.errorCancelacion).not.toBe("");
  });

  it("expone cancelandoId mientras la cancelación está en curso", async () => {
    let resolver!: () => void;
    vi.mocked(cuentaService.cancelar).mockReturnValue(
      new Promise((resolve) => {
        resolver = () => resolve({} as CancelarResponse);
      }),
    );
    const { result } = renderHook(() => useMiCuenta());

    await waitFor(() => expect(result.current.inscripciones).toHaveLength(1));

    let promise!: Promise<void>;
    act(() => {
      promise = result.current.cancelarInscripcion(1);
    });

    expect(result.current.cancelandoId).toBe(1);

    await act(async () => {
      resolver();
      await promise;
    });

    expect(result.current.cancelandoId).toBeNull();
  });
});
