/**
 * Decodifica el payload de un JWT sin usar librerías externas.
 * @param token - El JWT como string
 * @returns El payload decodificado o null si el token no es válido
 */
export function decodeToken(token: string): Record<string, unknown> | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        // El payload es la segunda parte (índice 1), codificada en Base64URL
        const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const decoded = atob(payload);
        return JSON.parse(decoded);
    } catch {
        return null;
    }
}

/**
 * Lee el JWT del localStorage y devuelve los roles del usuario.
 * @returns Array de roles (ej: ['ROLE_USER', 'ROLE_ADMIN']) o [] si no hay sesión
 */
export function getUserRoles(): string[] {
    const token = localStorage.getItem('token');
    if (!token) return [];

    const payload = decodeToken(token);
    if (!payload) return [];

    // Symfony JWT guarda los roles en payload.roles
    const roles = payload.roles;
    if (Array.isArray(roles)) {
        return roles as string[];
    }
    return [];
}

/**
 * Comprueba si el token ha expirado.
 */
export function isTokenExpired(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return true;

    const payload = decodeToken(token);
    if (!payload || typeof payload.exp !== 'number') return true;

    const nowInSeconds = Math.floor(Date.now() / 1000);
    return payload.exp < nowInSeconds;
}

/**
 * Devuelve el rol más alto del usuario (orden: ROLE_ADMIN > ROLE_TRABAJADOR > ROLE_USER)
 */
export function getHighestRole(roles: string[]): string | null {
    if (roles.includes('ROLE_ADMIN')) return 'ROLE_ADMIN';
    if (roles.includes('ROLE_TRABAJADOR')) return 'ROLE_TRABAJADOR';
    if (roles.includes('ROLE_USER')) return 'ROLE_USER';
    return null;
}

/**
 * Extrae el email (username) del JWT — Symfony usa 'username' o 'email' como sub.
 */
export function getUserEmailFromToken(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = decodeToken(token);
    if (!payload) return null;
    // LexikJWT guarda el identificador en 'username'
    return (payload.username as string) ?? (payload.email as string) ?? null;
}

/**
 * Devuelve la clave de localStorage específica para la foto del usuario actual.
 * Ej: "userPhoto_usuario@email.com"
 */
export function getUserPhotoKey(): string | null {
    const email = getUserEmailFromToken();
    if (!email) return null;
    return `userPhoto_${email}`;
}

/**
 * Devuelve la clave de localStorage para los favoritos del usuario actual.
 * Solo los usuarios autenticados pueden tener favoritos.
 * Devuelve null si no hay usuario validado.
 */
export function getFavoritesStorageKey(): string | null {
    const storedUserId = localStorage.getItem('userId');
    return storedUserId ? `mis_favoritos_plantillas_${storedUserId}` : null;
}
