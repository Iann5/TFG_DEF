/**
 * Origen del backend (sin sufijo /api), para rutas tipo /media/...
 */
export function getApiOrigin(): string {
    // Si hay VITE_API_URL (ej. http://localhost:8000/api), derivamos el origin.
    // Si no, en Docker/producción asumimos mismo host y que nginx proxy /media.
    const raw = (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL;
    if (raw && String(raw).trim() !== '') {
        const trimmed = String(raw).trim().replace(/\/$/, '');
        const withoutApi = trimmed.replace(/\/?api\/?$/, '').replace(/\/$/, '');
        return withoutApi;
    }
    return typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
}

/**
 * URL usable en <img src>: data URI, http(s) o ruta absoluta en el servidor de Symfony.
 */
export function resolveCitaMediaSrc(url: string | undefined | null): string | undefined {
    if (url == null) return undefined;
    const u = String(url).trim();
    if (u === '') return undefined;
    if (u.startsWith('data:') || u.startsWith('http://') || u.startsWith('https://')) return u;
    const origin = getApiOrigin();
    return u.startsWith('/') ? `${origin}${u}` : `${origin}/${u}`;
}
