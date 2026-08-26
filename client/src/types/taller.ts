export interface Taller {
  id: number;
  nombre: string;
  descripcion?: string;
  fecha?: string;
  tipo?: string;
  precio?: number;
  activo?: boolean | number;
  imageUrl?: string | null;
  lugar?: string;
  cupos_totales?: number;
  cupos_inscritos?: number;
}
