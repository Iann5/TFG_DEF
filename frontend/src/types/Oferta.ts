// src/types/Ofertas.ts

export type CategoriaPromo = 'servicio' | 'plantilla' | 'producto';
export type OrdenPromocion = 'reciente' | 'antiguo' | 'valoracionAlta' | 'valoracionBaja';

export interface ValoracionBase {
  estrellas: number;
}

export interface ItemPromocional {
  idUnico: string;
  dbId: number;
  titulo: string;
  descripcion: string;
  imagen: string;
  imagenes?: string[];
  precioOriginal: number;
  precioOferta: number | null;
  tipo: CategoriaPromo;
  tipoOriginal?: string;
  esPack: boolean;
  fechaSubida: string;
  valoracionMedia: number;
}

export interface EstadoFiltros {
  busqueda: string;
  categorias: CategoriaPromo[];
  orden: OrdenPromocion;
  filtroPacks: 'todos' | 'solo-oferta' | 'sin-oferta';
}

// Interfaces Raw actualizadas con la propiedad media que envía tu backend
export interface RawPack {
  id: number;
  titulo: string;
  descripcion?: string;
  imagen?: string;
  imagenes?: string[];
  precioOriginal?: number;
  precioOferta?: number;
  stock?: number;
  tipoPack?: string;
  fecha_subida?: string;
  valoracionPacks?: ValoracionBase[];
  media?: number; // Agregado
  creador?: {
    id: number;
    usuario?: {
      nombre?: string;
      apellidos?: string;
    }
  }
}

export interface RawProducto {
  id: number;
  nombre: string;
  descripcion?: string;
  imagen?: string;
  imagenes?: string[];
  precio_original: number;
  precio_oferta?: number | null;
  stock?: number;
  fecha_subida: string;
  valoracionProductos?: ValoracionBase[];
  media?: number; // Agregado
  creador?: {
    id: number;
    usuario?: {
      nombre?: string;
      apellidos?: string;
    }
  }
}

export interface RawProyecto {
  id: number;
  nombre: string;
  tipo: string;
  descripcion?: string;
  imagen?: string;
  precio_original: number;
  precio_oferta?: number | null;
  fecha_subida: string;
  valoracionProyectos?: ValoracionBase[];
  media?: number; // Agregado
  autor?: {
    id: number;
    usuario?: {
      nombre?: string;
      apellidos?: string;
    }
  }
}