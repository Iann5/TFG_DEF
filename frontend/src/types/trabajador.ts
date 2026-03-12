export interface Trabajador {
  id: number;
  nombre: string;
  descripcion: string;
  imagen?: string;
  email?: string;
  telefono?: string;
  estilos?: { id: number; nombre: string }[];
  usuario?: { nombre?: string; email?: string; telefono?: string };
  tiempo_cm_min?: number;
  precio_cm?: number;
}

export interface TrabajadorBasico {
  id: number;
  usuario?: { nombre?: string; apellidos?: string };
  nombre?: string;
}