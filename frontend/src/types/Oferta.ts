// src/types/Ofertas.ts

export type CategoriaPromo = 'servicio' | 'plantilla' | 'producto';
export type OrdenPromocion = 'reciente' | 'antiguo' | 'valoracionAlta' | 'valoracionBaja';

export interface ValoracionBase {
  estrellas: number;
}

// Objeto normalizado para la vista
export interface ItemPromocional {
  idUnico: string; // Ej: 'pack-1', 'prod-5'
  dbId: number;
  titulo: string;
  descripcion: string;
  imagen: string;
  precioOriginal: number;
  precioOferta: number | null;
  tipo: CategoriaPromo;
  esPack: boolean;
  fechaSubida: string;
  valoracionMedia: number;
}

// Estado de los filtros
export interface EstadoFiltros {
  busqueda: string;
  categorias: CategoriaPromo[];
  orden: OrdenPromocion;
  filtroPacks: 'todos' | 'solo-oferta' | 'sin-oferta';
}



export interface RawPack {
  id: number;
  nombrePack: string;
  descripcion?: string;
  imagen?: string;
  precioOriginal?: number;
  precioOferta?: number;
  tipoDePack?: string;
  fecha_subida?: string;
}

export interface RawProducto {
  id: number;
  nombre: string;
  descripcion?: string;
  imagen?: string;
  precio_original: number;
  precio_oferta?: number | null;
  fecha_subida: string;
  valoracionProductos?: ValoracionBase[];
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
}