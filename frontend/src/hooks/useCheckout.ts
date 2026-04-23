import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import { type TarjetaState, type BizumState, type PaymentValidationErrors } from '../types/checkout';

// ─────────────────────────────────────────────────────────
// ALGORITMO DE LUHN — Valida matemáticamente un número de
// tarjeta de crédito/débito.
// ─────────────────────────────────────────────────────────
function luhnCheck(cardNumber: string): boolean {
    const digits = cardNumber.replace(/\s+/g, '').split('').reverse();
    let sum = 0;
    digits.forEach((d, i) => {
        let n = parseInt(d, 10);
        if (i % 2 === 1) {
            n *= 2;
            if (n > 9) n -= 9;
        }
        sum += n;
    });
    return sum % 10 === 0;
}

export function useCheckout() {
    const { isLoggedIn } = useAuth();
    const { cart, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();

    // Estado del formulario de envío
    const [envio, setEnvio] = useState({
        pais: '',
        direccion: '',
        provincia: '',
        localidad: '',
        cp: ''
    });

    const [metodoPago, setMetodoPago] = useState<'tarjeta' | 'bizum' | 'efectivo'>('tarjeta');

    // ── Estado de los formularios de pago ──
    const [tarjeta, setTarjeta] = useState<TarjetaState>({
        numero: '', caducidad: '', cvc: '', titular: ''
    });
    const [bizum, setBizum] = useState<BizumState>({
        telefono: '', concepto: ''
    });
    const [payErrors, setPayErrors] = useState<PaymentValidationErrors>({});
    const [pagoReferencia, setPagoReferencia] = useState<string>('');

    // Estados UI
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    // Cargar datos del usuario
    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/login', { state: { returnTo: '/checkout' } });
            return;
        }

        if (cart.length === 0 && !success) {
            navigate('/carrito');
            return;
        }

        api.get('/me')
            .then(res => {
                const user = res.data;
                setEnvio({
                    pais: user.pais || '',
                    direccion: user.direccion || '',
                    provincia: user.provincia || '',
                    localidad: user.localidad || '',
                    cp: user.cp || ''
                });
            })
            .catch(err => console.error("Error cargando perfil", err));
    }, [isLoggedIn, navigate, cart.length, success]);

    const handleChangeEnvio = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEnvio({ ...envio, [e.target.name]: e.target.value });
    };

    // ─────────────────────────────────────────────────────
    // HANDLERS DE CAMPOS DE PAGO
    // ─────────────────────────────────────────────────────
    const handleTarjetaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let v = value;

        // Formateo automático: número de tarjeta con espacios cada 4 dígitos
        if (name === 'numero') {
            v = value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
        }
        // Formateo automático: caducidad MM/AA
        if (name === 'caducidad') {
            v = value.replace(/\D/g, '').slice(0, 4);
            if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
        }
        // CVC: sólo 3 dígitos
        if (name === 'cvc') {
            v = value.replace(/\D/g, '').slice(0, 3);
        }

        setTarjeta(prev => ({ ...prev, [name]: v }));
        // Limpia el error del campo al escribir
        setPayErrors(prev => ({ ...prev, [name]: undefined }));
    };

    const handleBizumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let v = value;
        if (name === 'telefono') {
            v = value.replace(/\D/g, '').slice(0, 9);
        }
        setBizum(prev => ({ ...prev, [name]: v }));
        setPayErrors(prev => ({ ...prev, [name]: undefined }));
    };

    // ─────────────────────────────────────────────────────
    // VALIDACIÓN FRONTEND — Ejecutada antes del fetch
    // ─────────────────────────────────────────────────────
    const validarPago = (): boolean => {
        const newErrors: PaymentValidationErrors = {};

        if (metodoPago === 'tarjeta') {
            const numLimpio = tarjeta.numero.replace(/\s/g, '');
            if (!/^\d{13,19}$/.test(numLimpio)) {
                newErrors.numero = 'Número de tarjeta inválido (13-19 dígitos).';
            } else if (!luhnCheck(numLimpio)) {
                newErrors.numero = 'Número de tarjeta incorrecto (Algoritmo de Luhn).';
            }

            if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(tarjeta.caducidad)) {
                newErrors.caducidad = 'Formato inválido. Usa MM/AA.';
            } else {
                const [mes, anio] = tarjeta.caducidad.split('/');
                const expDate = new Date(2000 + parseInt(anio), parseInt(mes) - 1, 1);
                const hoy = new Date();
                hoy.setDate(1); hoy.setHours(0, 0, 0, 0);
                if (expDate < hoy) newErrors.caducidad = 'La tarjeta está caducada.';
            }

            if (!/^\d{3}$/.test(tarjeta.cvc)) {
                newErrors.cvc = 'El CVC debe tener 3 dígitos.';
            }

            if (tarjeta.titular.trim().length < 3) {
                newErrors.titular = 'Introduce el nombre del titular.';
            }
        }

        if (metodoPago === 'bizum') {
            if (!/^[67]\d{8}$/.test(bizum.telefono)) {
                newErrors.telefono = 'Móvil español inválido (9 dígitos, empieza por 6 o 7).';
            }
            if (bizum.concepto.trim().length < 3) {
                newErrors.concepto = 'El concepto no puede estar vacío.';
            }
        }

        setPayErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleComprar = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setPayErrors({});

        // ── Validaciones de envío ──
        if (!envio.pais || !envio.direccion || !envio.provincia || !envio.localidad || !envio.cp) {
            setError('Por favor rellena toda la información de envío de forma correcta.');
            return;
        }
        if (cart.length === 0) return;

        // ── Validaciones de pago (frontend — Luhn, Bizum, etc.) ──
        if (!validarPago()) {
            setError('Revisa los datos de pago antes de continuar.');
            return;
        }

        setLoading(true);

        try {
            // ──────────────────────────────────────────────────────────
            // PASO 0: Llamar al endpoint de simulación de pasarela de pago
            // /api/process-payment valida los datos y simula latencia (sleep 2s)
            // ──────────────────────────────────────────────────────────
            const payloadPago: Record<string, unknown> = {
                metodo_pago: metodoPago,
                total: cartTotal,
            };

            if (metodoPago === 'tarjeta') {
                payloadPago.numero_tarjeta = tarjeta.numero.replace(/\s/g, '');
                payloadPago.caducidad      = tarjeta.caducidad;
                payloadPago.cvc            = tarjeta.cvc;
                payloadPago.titular        = tarjeta.titular;
            }

            if (metodoPago === 'bizum') {
                payloadPago.telefono_bizum = bizum.telefono;
                payloadPago.concepto_bizum = bizum.concepto;
            }

            const pagoRes = await api.post('/process-payment', payloadPago);

            if (!pagoRes.data?.success) {
                throw new Error(pagoRes.data?.message ?? 'Error en la pasarela de pago.');
            }

            // Guardamos referencia para mostrarla en la pantalla de éxito
            setPagoReferencia(pagoRes.data.referencia ?? '');

            // Obtenemos nuestro URI
            const userRes = await api.get('/me');
            const userId = userRes.data.id;
            const usuarioUri = `/api/users/${userId}`;

            // PASO 1: Crear el Pedido Maestro
            const pedidoData = {
                usuario: usuarioUri,
                metodo_pago: metodoPago,
                total: cartTotal,
                fecha_compra: new Date().toISOString(),
                pais: envio.pais,
                direccion: envio.direccion,
                provincia: envio.provincia,
                localidad: envio.localidad,
                cp: envio.cp,
                estado: 'Completado' // Por defecto
            };

            const resPedido = await api.post('/pedidos', pedidoData);
            const pedidoUri = `/api/pedidos/${resPedido.data.id}`;

            // PASO 2: Crear las Líneas de Pedido
            for (const item of cart) {
                if (item.tipo === 'producto' && item.producto?.id) {
                    const precioReal = item.producto.precioOferta ?? item.producto.precio_oferta ?? item.producto.precioOriginal ?? item.producto.precio_original ?? 0;
                    const lineaData = {
                        usuario: usuarioUri,
                        producto: `/api/productos/${item.producto.id}`,
                        pedido: pedidoUri,
                        cantidad: item.cantidad,
                        precio: precioReal
                    };
                    await api.post('/linea_pedidos', lineaData);
                    continue;
                }

                // Packs de PRODUCTOS: se convierten en varias líneas de productos
                if (item.tipo === 'pack' && item.pack?.id) {
                    const packId = item.pack.id;
                    const packUnits = item.cantidad;
                    const packPrice = item.pack.precioOferta ?? item.pack.precioOriginal ?? 0;

                    // Pedimos el detalle del pack para obtener los productos incluidos
                    const packRes = await api.get<any>(`/packs/${packId}`);
                    const packData = packRes.data ?? {};

                    const parseIdFromIri = (iri: unknown): number | null => {
                        if (typeof iri !== 'string') return null;
                        const m = iri.match(/\/(\d+)(?:\.\w+)?$/);
                        return m ? Number(m[1]) : null;
                    };

                    const productosIds: number[] = Array.isArray(packData.productos)
                        ? packData.productos
                            .map((p: any) => {
                                if (typeof p?.id === 'number') return p.id;
                                const iri = (typeof p === 'string')
                                    ? p
                                    : (p?.['@id'] ?? p?.['hydra:about'] ?? p?.iri ?? null);
                                return parseIdFromIri(iri);
                            })
                            .filter((n: any) => typeof n === 'number' && !Number.isNaN(n))
                        : [];

                    // Fallback: packs antiguos con un único producto asociado
                    const productoUnicoId: number | null =
                        typeof packData.producto?.id === 'number'
                            ? packData.producto.id
                            : parseIdFromIri(packData.producto);

                    const ids = productosIds.length
                        ? productosIds
                        : (productoUnicoId != null ? [productoUnicoId] : []);

                    // Líneas de producto solo si el pack incluye merchandising; los packs solo de tatuaje/plantilla no tienen producto.
                    if (ids.length > 0) {
                        const precioUnitarioLinea = packPrice / ids.length;
                        for (const productoId of ids) {
                            const lineaData = {
                                usuario: usuarioUri,
                                producto: `/api/productos/${productoId}`,
                                pedido: pedidoUri,
                                cantidad: packUnits,
                                precio: precioUnitarioLinea
                            };
                            await api.post('/linea_pedidos', lineaData);
                        }
                    }

                    // Siempre descontar stock del pack vendido
                    try {
                        await api.post(`/packs/${packId}/decrement_stock`, { cantidad: packUnits });
                    } catch (e) {
                        try {
                            const stockActualPack = typeof packData.stock === 'number'
                                ? packData.stock
                                : (item.pack.stock ?? null);
                            if (stockActualPack !== null) {
                                const nuevoStockPack = Math.max(0, stockActualPack - packUnits);
                                await api.patch(
                                    `/packs/${packId}`,
                                    { stock: nuevoStockPack },
                                    { headers: { 'Content-Type': 'application/merge-patch+json' } }
                                );
                            }
                        } catch (e2) {
                            console.warn('No se pudo actualizar stock del pack', e, e2);
                        }
                    }
                }
            }

            // Éxito total
            clearCart();
            setSuccess(true);
            window.scrollTo(0, 0);

        } catch (err) {
            console.error(err);
            setError('Ha ocurrido un error procesando tu pedido. Por favor, inténtalo más tarde.');
        } finally {
            setLoading(false);
        }
    };

    return {
        cart,
        cartTotal,
        navigate,
        envio,
        handleChangeEnvio,
        metodoPago,
        setMetodoPago,
        tarjeta,
        handleTarjetaChange,
        bizum,
        handleBizumChange,
        payErrors,
        pagoReferencia,
        loading,
        success,
        error,
        handleComprar
    };
}
