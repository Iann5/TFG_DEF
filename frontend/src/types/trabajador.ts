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
  usuario?: { nombre?: string; apellidos?: string; roles?: string[] };
  nombre?: string;
}

// Tipo para la gestión de roles (admin)
export interface UserPerfil {
  id: number;
  nombre: string;
  apellidos: string;
  dni: string;
  email: string;
  roles: string[];
}

// Tipo para la lista de trabajadores con agenda (admin)
export interface TrabajadorResumen {
  id: number;
  usuario: {
    nombre: string;
    apellidos: string;
    foto_perfil: string | null;
    roles?: string[];
  };
}

// Extensión para la vista de Equipo con valoración media
export interface TrabajadorConMedia extends Trabajador {
    mediaValoracion?: number;
}
