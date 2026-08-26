export interface Cliente {
  id: number;
  nombre: string;
  email?: string;
  telefono?: string;
  intereses?: string;
  fecha_registro?: string;
  total_inscripciones?: number;
}

export interface NotaFidelizacion {
  id: number;
  nota: string;
  fecha: string;
}

export interface HistorialTaller {
  nombre: string;
  fecha?: string;
  fecha_inscripcion?: string;
}
