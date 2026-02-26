// src/types/Proyecto.ts
import { type ValoracionBase, type RawValoracion } from './Valoracion';

export interface ProyectoResponse {
  nombre?: string;
  tipo?: string;
  estilo?: string | { id: number };
  imagen?: string;
  precioOriginal?: number;
  precio_original?: number;
  precioOferta?: number;
  precio_oferta?: number;
}

// 1. Lo que recibimos de la Base de Datos (Symfony/API Platform)
export interface RawProyecto {
  id: number;
  tituloTatuaje?: string;
  nombre?: string;
  descripcion?: string;
  estilo?: string;
  tipo?: string;
  precioOriginal?: number;
  precio_original?: number;
  precioOferta?: number | null;
  precio_oferta?: number | null;
  imagen?: string;
  nombreTrabajador?: string;
  autor?: {
    usuario?: {
      nombre?: string;
      apellidos?: string;
    }
  };
  fecha_subida?: string;
  valoracionProyectos?: ValoracionBase[];
  media?: number;
}


// 2. Lo que usaremos en nuestros componentes (Limpio y seguro)
export interface ProyectoNormalizado {
  id: number;
  titulo: string;
  descripcion: string;
  estilo: string;
  tipo: string;
  precioOriginal: number;
  precioOferta: number | null;
  imagen: string;
  nombreTrabajador: string;
  fechaSubida: string;
  valoraciones: ValoracionBase[];
  media: number;
}
  //   autor_id: number;
  //   autorUserId?: number; 

export interface FiltrosProyectos {
  orden: 'reciente' | 'antiguo' | 'valoracionAlta' | 'valoracionBaja';
  tipo: 'todos' | 'tatuaje' | 'plantilla';
  trabajador: string;
}

export interface DetalleRaw {
    id: number;
    nombre?: string;
    tituloTatuaje?: string;
    descripcion?: string;
    tipo?: string;
    estilo?: string;
    imagen?: string;
    precio_original?: number;
    precioOriginal?: number;
    precio_oferta?: number | null;
    precioOferta?: number | null;
    nombreTrabajador?: string;
    fecha_subida?: string;
    valoracionProyectos?: RawValoracion[];
}

