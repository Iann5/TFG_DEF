export interface ValoracionBase {
  id: number;
  estrellas: number;
  comentario?: string;
}

export interface ValoracionDetalle {
  id: number;
  estrellas: number;
  comentario?: string;
  fecha: string;
  nombreUsuario?: string;
  fotoPerfil?: string;
  /** Id del usuario autor; sirve para mostrar editar/eliminar solo en reseñas propias */
  usuarioId?: number;
}

export interface RawValoracion {
  id: number;
  estrellas: number;
  comentario?: string;
  fecha: string;
  usuario?: { id?: number; nombre?: string; foto_perfil?: string; };
}