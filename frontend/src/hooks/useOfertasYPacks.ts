import { useState, useEffect, useMemo } from 'react';
import { AxiosError } from 'axios';
import api from '../services/api';
import {
    type CategoriaPromo,
    type ValoracionBase,
    type ItemPromocional,
    type EstadoFiltros,
    type RawPack,
    type RawProducto,
    type RawProyecto
} from '../types/Oferta';

export interface ItemPromocionalExtra extends ItemPromocional {
    autorNombre?: string;
    autorId?: number;
    stock?: number;
}

function calcularMediaPromo(vals: ValoracionBase[] | undefined, mediaDirecta?: number | null): number {
    if (mediaDirecta !== undefined && mediaDirecta !== null) return mediaDirecta;
    if (!vals || vals.length === 0) return 0;
    return vals.reduce((acc, v) => acc + v.estrellas, 0) / vals.length;
}

export default function useOfertasYPacks() {
    const [items, setItems] = useState<ItemPromocionalExtra[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [filtros, setFiltros] = useState<EstadoFiltros>({
        busqueda: '',
        categorias: [],
        orden: 'reciente',
        filtroPacks: 'todos'
    });

    const cargarDatos = async () => {
        setLoading(true);
        setError(null);
        try {
            const [resPacks, resProds, resProjs] = await Promise.all([
                api.get<RawPack[]>('/packs'),
                api.get<RawProducto[]>('/productos'),
                api.get<RawProyecto[]>('/proyectos')
            ]);

            const packsMapeados: ItemPromocional[] = resPacks.data.map(p => {
                let tipoCategoria: CategoriaPromo = 'servicio';
                const tipoMin = p.tipoPack?.toLowerCase() || '';
                if (tipoMin.includes('producto')) tipoCategoria = 'producto';
                else if (tipoMin.includes('plantilla')) tipoCategoria = 'plantilla';
                return {
                    idUnico: `pack-${p.id}`,
                    dbId: p.id,
                    titulo: p.titulo || 'Pack sin título',
                    descripcion: p.descripcion || '',
                    imagen: p.imagen || '',
                    imagenes: p.imagenes || [],
                    precioOriginal: p.precioOriginal || 0,
                    precioOferta: p.precioOferta ?? null,
                    stock: p.stock ?? 0,
                    tipo: tipoCategoria,
                    tipoOriginal: 'pack',
                    esPack: true,
                    fechaSubida: p.fecha_subida || new Date().toISOString(),
                    valoracionMedia: calcularMediaPromo(p.valoracionPacks, p.media),
                    autorNombre: p.creador?.usuario ? `${p.creador.usuario.nombre} ${p.creador.usuario.apellidos || ''}` : undefined,
                    autorId: p.creador?.id
                };
            });

            const prodsMapeados: ItemPromocionalExtra[] = resProds.data
                .filter(p => p.precio_oferta !== null && p.precio_oferta !== undefined)
                .map(p => ({
                    idUnico: `prod-${p.id}`,
                    dbId: p.id,
                    titulo: p.nombre || 'Sin nombre',
                    descripcion: p.descripcion || '',
                    imagen: p.imagen || '',
                    imagenes: p.imagenes || [],
                    precioOriginal: p.precio_original || 0,
                    precioOferta: p.precio_oferta ?? null,
                    stock: p.stock ?? 0,
                    tipo: 'producto' as CategoriaPromo,
                    tipoOriginal: 'producto',
                    esPack: false,
                    fechaSubida: p.fecha_subida || new Date().toISOString(),
                    valoracionMedia: calcularMediaPromo(p.valoracionProductos, p.media),
                    autorNombre: p.creador?.usuario ? `${p.creador.usuario.nombre} ${p.creador.usuario.apellidos || ''}` : undefined,
                    autorId: p.creador?.id
                }));

            const projsMapeados: ItemPromocionalExtra[] = resProjs.data
                .filter(p => p.precio_oferta !== null && p.precio_oferta !== undefined)
                .map(p => ({
                    idUnico: `proj-${p.id}`,
                    dbId: p.id,
                    titulo: p.nombre || 'Sin nombre',
                    descripcion: p.descripcion || p.tipo || '',
                    imagen: p.imagen || '',
                    precioOriginal: p.precio_original || 0,
                    precioOferta: p.precio_oferta ?? null,
                    tipo: ((p.tipo || '').toLowerCase().includes('plantilla') ? 'plantilla' : 'servicio') as CategoriaPromo,
                    tipoOriginal: p.tipo || 'servicio',
                    esPack: false,
                    fechaSubida: p.fecha_subida || new Date().toISOString(),
                    valoracionMedia: calcularMediaPromo(p.valoracionProyectos, p.media),
                    autorNombre: p.autor?.usuario ? `${p.autor.usuario.nombre} ${p.autor.usuario.apellidos || ''}` : undefined,
                    autorId: p.autor?.id
                }));

            setItems([...packsMapeados, ...prodsMapeados, ...projsMapeados]);
        } catch (err) {
            if (err instanceof AxiosError) {
                setError(`Error al cargar datos: ${err.response?.status}`);
            } else {
                setError('Error desconocido al cargar las promociones.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { cargarDatos(); }, []);

    const itemsFiltrados = useMemo(() => {
        let resultado = items.filter(item =>
            item.titulo.toLowerCase().includes(filtros.busqueda.toLowerCase())
        );

        if (filtros.categorias.length > 0) {
            resultado = resultado.filter(item => filtros.categorias.includes(item.tipo));
        }

        if (filtros.filtroPacks === 'solo-oferta') {
            resultado = resultado.filter(item => !item.esPack || (item.esPack && item.precioOferta !== null));
        } else if (filtros.filtroPacks === 'sin-oferta') {
            resultado = resultado.filter(item => item.esPack && item.precioOferta === null);
        }

        resultado.sort((a, b) => {
            const fechaA = new Date(a.fechaSubida).getTime();
            const fechaB = new Date(b.fechaSubida).getTime();
            if (filtros.orden === 'reciente') return fechaB - fechaA;
            if (filtros.orden === 'antiguo') return fechaA - fechaB;
            if (filtros.orden === 'valoracionAlta') return b.valoracionMedia - a.valoracionMedia;
            if (filtros.orden === 'valoracionBaja') return a.valoracionMedia - b.valoracionMedia;
            return 0;
        });

        return resultado;
    }, [items, filtros]);

    const handleToggleCategoria = (cat: CategoriaPromo) => {
        setFiltros(prev => ({
            ...prev,
            categorias: prev.categorias.includes(cat)
                ? prev.categorias.filter(c => c !== cat)
                : [...prev.categorias, cat]
        }));
    };

    const handleEliminar = async (idUnico: string, dbId: number, esPack: boolean, isProduct: boolean) => {
        if (!window.confirm('¿Seguro que deseas eliminar este elemento?')) return;
        try {
            let endpoint = `/proyectos/${dbId}`;
            if (esPack) endpoint = `/packs/${dbId}`;
            else if (isProduct) endpoint = `/productos/${dbId}`;
            await api.delete(endpoint);
            setItems(prev => prev.filter(item => item.idUnico !== idUnico));
        } catch (err) {
            console.error('Error eliminando', err);
        }
    };

    return {
        filtros,
        setFiltros,
        itemsFiltrados,
        loading,
        error,
        handleToggleCategoria,
        handleEliminar
    };
}
