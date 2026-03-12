import type { ValoracionDetalle, RawValoracion } from '../types/Valoracion';

/** Calcula la media aritmética de estrellas de una lista de valoraciones. */
export function calcularMedia(vals: ValoracionDetalle[]): number {
    if (!vals.length) return 0;
    return vals.reduce((acc, v) => acc + v.estrellas, 0) / vals.length;
}

/** Convierte las valoraciones crudas de la API al formato interno. */
export function mapearValoraciones(raw: RawValoracion[]): ValoracionDetalle[] {
    return raw.map(v => ({
        id: v.id,
        estrellas: v.estrellas,
        comentario: v.comentario,
        fecha: v.fecha,
        nombreUsuario: v.usuario?.nombre ?? 'Usuario',
        fotoPerfil: v.usuario?.foto_perfil,
    }));
}
