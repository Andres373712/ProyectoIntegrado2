import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../repositories/talleresRepository.js', () => ({
  talleresRepository: {
    getActivos: vi.fn(),
    getTodos: vi.fn(),
    getById: vi.fn(),
    crear: vi.fn(),
    actualizar: vi.fn(),
  },
}));

const { talleresRepository } = await import('../repositories/talleresRepository.js');
const { talleresService } = await import('./talleresService.js');

describe('talleresService — forma de respuesta', () => {
  beforeEach(() => vi.clearAllMocks());

  it('mapea imageurl (columna) a imageUrl y aplica los defaults de cupos', async () => {
    talleresRepository.getActivos.mockResolvedValue([
      { id: 1, nombre: 'Taller A', imageurl: '/uploads/a.jpg', cupos_totales: 0, cupos_inscritos: 0 },
    ]);

    const [taller] = await talleresService.getActivos();

    expect(taller.imageUrl).toBe('/uploads/a.jpg');
    // cupos_totales=0 es falsy → cae al default de 10, igual que antes de Drizzle
    expect(taller.cupos_totales).toBe(10);
    expect(taller.cupos_inscritos).toBe(0);
  });

  it('conserva cupos_totales real cuando no es 0/undefined', async () => {
    talleresRepository.getTodos.mockResolvedValue([
      { id: 2, nombre: 'Taller B', imageurl: null, cupos_totales: 8, cupos_inscritos: 3 },
    ]);

    const [taller] = await talleresService.getTodos();

    expect(taller.cupos_totales).toBe(8);
    expect(taller.cupos_inscritos).toBe(3);
  });

  it('getById devuelve undefined si el repositorio no encuentra nada', async () => {
    talleresRepository.getById.mockResolvedValue(undefined);
    await expect(talleresService.getById(999)).resolves.toBeUndefined();
  });

  it('crear calcula imageUrl a partir del archivo subido', async () => {
    await talleresService.crear({ nombre: 'X' }, { filename: 'foo.jpg' });
    expect(talleresRepository.crear).toHaveBeenCalledWith(
      expect.objectContaining({ imageUrl: '/uploads/foo.jpg' }),
    );
  });

  it('crear deja imageUrl en null si no se subió archivo', async () => {
    await talleresService.crear({ nombre: 'X' }, undefined);
    expect(talleresRepository.crear).toHaveBeenCalledWith(expect.objectContaining({ imageUrl: null }));
  });

  it('actualizar conserva la imagen actual si no se sube una nueva', async () => {
    await talleresService.actualizar(1, { imageUrlActual: '/uploads/vieja.jpg' }, undefined);
    expect(talleresRepository.actualizar).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ imageUrl: '/uploads/vieja.jpg' }),
    );
  });
});
