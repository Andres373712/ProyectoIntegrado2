export interface Testimonio {
  id: number;
  nombre: string;
  curso?: string;
  comentario: string;
  calificacion: number;
  activo?: boolean | number;
  fecha_creacion?: string;
}
