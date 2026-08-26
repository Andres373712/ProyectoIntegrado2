import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../repositories/testimoniosRepository.js', () => ({
  testimoniosRepository: {
    getActivos: vi.fn(),
    contarActivos: vi.fn(),
    getTodos: vi.fn(),
    contarTodos: vi.fn(),
    getById: vi.fn(),
    crear: vi.fn(),
    actualizar: vi.fn(),
    eliminar: vi.fn(),
  },
}));

const { testimoniosRepository } = await import('../repositories/testimoniosRepository.js');
const { testimoniosService } = await import('./testimoniosService.js');

describe('testimoniosService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getActivos reenvía la paginación al repositorio', async () => {
    testimoniosRepository.getActivos.mockResolvedValue([{ id: 1, nombre: 'Camila' }]);
    const paginacion = { page: 1, pageSize: 10, limit: 10, offset: 0 };

    const resultado = await testimoniosService.getActivos(paginacion);

    expect(testimoniosRepository.getActivos).toHaveBeenCalledWith(paginacion);
    expect(resultado).toEqual([{ id: 1, nombre: 'Camila' }]);
  });

  it('getById devuelve undefined si el repositorio no encuentra nada', async () => {
    testimoniosRepository.getById.mockResolvedValue(undefined);
    await expect(testimoniosService.getById(999)).resolves.toBeUndefined();
  });

  it('crear reenvía los datos tal cual al repositorio', async () => {
    const datos = { nombre: 'Camila Rojas', curso: 'Resina Epóxica', comentario: 'Excelente', calificacion: 5 };
    await testimoniosService.crear(datos);
    expect(testimoniosRepository.crear).toHaveBeenCalledWith(datos);
  });

  it('actualizar reenvía id y datos al repositorio', async () => {
    const datos = { nombre: 'Camila Rojas', comentario: 'Editado', calificacion: 4, activo: 0 };
    await testimoniosService.actualizar(1, datos);
    expect(testimoniosRepository.actualizar).toHaveBeenCalledWith(1, datos);
  });

  it('eliminar reenvía el id al repositorio', async () => {
    await testimoniosService.eliminar(3);
    expect(testimoniosRepository.eliminar).toHaveBeenCalledWith(3);
  });
});
