import type { ValoracionDetalle, RawValoracion } from '../types/Valoracion';

/** Id de usuario guardado en login (`/api/me`). */
export function getStoredUserId(): number | null {
    const s = localStorage.getItem('userId');
    if (s == null || s === '') return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
}

/** True si la sesión actual ya tiene una valoración en la lista (por id de usuario o por nombre). */
export function yaValoroEnLista(
    isLoggedIn: boolean,
    vals: ValoracionDetalle[],
    currentUserId: number | null,
    nombreUsuario: string | null,
): boolean {
    if (!isLoggedIn) return false;
    if (currentUserId != null && vals.some(v => v.usuarioId === currentUserId)) return true;
    if (nombreUsuario != null && vals.some(v => v.nombreUsuario === nombreUsuario)) return true;
    return false;
}

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
        usuarioId: v.usuario?.id,
    }));
}
