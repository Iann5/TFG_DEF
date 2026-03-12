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
}

export interface RawValoracion {
  id: number;
  estrellas: number;
  comentario?: string;
  fecha: string;
  usuario?: { nombre?: string; foto_perfil?: string; };
}