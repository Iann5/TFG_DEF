import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    type TrabajadorAPI,
    type Trabajador,
    type FirmasState,
    type LocationState,
    type CitaForm,
    type SlotHora
} from '../types/Citas';
import type { RawProyecto } from '../types/proyecto';

// Límite diario en minutos (8 horas)
const MAX_MINUTOS_DIARIOS = 480;

export default function useReservaCita() {
    const location = useLocation();
    const navigate = useNavigate();
    const { isLoggedIn, hasRole } = useAuth();

    const [paso, setPaso] = useState<number>(1);
    const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
    const [plantillasTrabajador, setPlantillasTrabajador] = useState<RawProyecto[]>([]);
    const [horasDisponibles, setHorasDisponibles] = useState<SlotHora[]>([]);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [firmas, setFirmas] = useState<FirmasState | null>(null);

    const [formData, setFormData] = useState<CitaForm>({
        trabajadorId: null,
        fecha: '',
        horaInicio: '',
        horaFin: '',
        nombre: '',
        apellidos: '',
        dni: '',
        telefono: '',
        tipo: '',
        tamanoCm: 10,
        descripcion: '',
        proyectosIDs: [],
        packsIDs: []
    });

    // Cargar datos del usuario si está logueado
    useEffect(() => {
        if (isLoggedIn) {
            if (hasRole('ROLE_ADMIN') || hasRole('ROLE_TRABAJADOR')) {
                alert('Acceso denegado: Los administradores y trabajadores no pueden solicitar citas.');
                navigate('/');
                return;
            }

            api.get('/me')
                .then(res => {
                    const data = res.data;
                    setFormData(prev => ({
                        ...prev,
                        nombre: data.nombre || '',
                        apellidos: data.apellidos || '',
                        dni: data.dni || '',
                        telefono: data.telefono || ''
                    }));
                })
                .catch(err => console.error('Error al cargar datos del usuario', err));
        }
    }, [isLoggedIn, hasRole, navigate]);

    // Tipado de location.state
    useEffect(() => {
        const state = location.state as LocationState | null;
        if (state) {
            setFormData(prev => ({
                ...prev,
                ...(state.trabajadorId && { trabajadorId: state.trabajadorId }),
                // Mantener `plantillaId` por compatibilidad o migrar a `proyectoId`
                ...((state.plantillaId || state.proyectoId) && {
                    tipo: 'plantilla',
                    proyectosIDs: [...prev.proyectosIDs, (state.plantillaId || state.proyectoId) as number]
                })
            }));

            if (state.trabajadorId) {
                setPaso(2); // Skip step 1 if worker is already selected
            }
        }
    }, []); // Only run ONCE on mount to grab initialization variables

    // Fetch plantillas/tatuajes when a worker is selected
    useEffect(() => {
        if (formData.trabajadorId && formData.tipo === 'plantilla') {
            api.get<RawProyecto[]>(`/proyectos?autor=${formData.trabajadorId}`)
                .then(res => setPlantillasTrabajador(res.data))
                .catch(err => console.error("Error cargando proyectos del trabajador", err));
        }
    }, [formData.trabajadorId, formData.tipo]);

    // Tipado del fetch de trabajadores (Sin ANY)
    useEffect(() => {
        const cargarTrabajadores = async () => {
            try {
                const res = await api.get<TrabajadorAPI[]>('/trabajadors');
                const activos = res.data.filter((t: any) => {
                    return t.usuario && t.usuario.roles ? t.usuario.roles.includes('ROLE_TRABAJADOR') : true;
                });

                const dataMapeada: Trabajador[] = activos.map((t: any) => ({
                    id: t.id,
                    nombre: t.usuario?.nombre || 'Desconocido',
                    apellidos: t.usuario?.apellidos || '',
                    foto_perfil: t.usuario?.foto_perfil,
                    tarifas: t.tarifas || []
                }));

                setTrabajadores(dataMapeada);
            } catch (err) {
                console.error('Error cargando trabajadores', err);
            }
        };
        cargarTrabajadores();
    }, []);

    const generarHoras = (): string[] => {
        const horas: string[] = [];
        for (let h = 9; h <= 20; h++) {
            for (let m = 0; m < 60; m += 15) {
                const hStr = h.toString().padStart(2, '0');
                const mStr = m.toString().padStart(2, '0');
                horas.push(`${hStr}:${mStr}`);
            }
        }
        horas.push('21:00');
        return horas;
    };

    const handleTrabajadorSelect = (id: number) => {
        setFormData(prev => ({ ...prev, trabajadorId: id }));
        setPaso(2);
    };

    const getTarifaAproximada = (trabajador: Trabajador | undefined, cm: number) => {
        if (!trabajador || !trabajador.tarifas || trabajador.tarifas.length === 0) {
            return { cm: 10, minutos: 60, precio: 50 }; // Fallback seguro
        }
        const exacta = trabajador.tarifas.find(t => t.cm === cm);
        if (exacta) return exacta;
        
        // Si no hay exacta, cogemos la primera tarifa como base para una regla de tres
        const base = trabajador.tarifas[0];
        return {
            cm,
            minutos: (cm / base.cm) * base.minutos,
            precio: (cm / base.cm) * base.precio
        };
    };

    const calcularDuracionReserva = (): number => {
        let tiempoMinutos = 60; // Por defecto 1h
        const trabajador = trabajadores.find(t => t.id === formData.trabajadorId);

        if (formData.tipo === 'personalizado' || formData.tipo === 'plantilla') {
            const tarifa = getTarifaAproximada(trabajador, formData.tamanoCm);
            tiempoMinutos = tarifa.minutos + 15;
        }
        return Math.round(tiempoMinutos);
    };

    const handleFechaChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const nuevaFecha = e.target.value;

        // Comprobación segura de fin de semana (ignorando zonas horarias)
        const [año, mes, dia] = nuevaFecha.split('-').map(Number);
        const fechaLocal = new Date(año, mes - 1, dia); // Mes es 0-indexado
        if (fechaLocal.getDay() === 0 || fechaLocal.getDay() === 6) {
            alert("El estudio permanece cerrado los fines de semana. Por favor, elige de lunes a viernes.");
            return;
        }

        setFormData(prev => ({ ...prev, fecha: nuevaFecha, horaInicio: '' }));
        setHorasDisponibles([]); // Limpiar horas mientras carga

        try {
            // 1. Obtener citas del trabajador en ese día
            const res = await api.get<{ 'hydra:member': any[] }>(`/citas?trabajador=${formData.trabajadorId}&fecha=${nuevaFecha}`);
            const citasDelDia = res.data['hydra:member'] || res.data; // Compat con hydra y direct json

            // 2. Calcular cuántos minutos ya tiene ocupados este trabajador EN ESE DÍA EXACTO
            let minutosOcupados = 0;
            citasDelDia.forEach((c: any) => {
                if (c.estado === 'Cancelada' || c.estado === 'Rechazada') return;
                // Filtrar del lado cliente por si el servidor devuelve todo el histórico
                if (c.fecha && !c.fecha.startsWith(nuevaFecha)) return;

                const inicio = new Date(c.hora_inicio);
                const fin = new Date(c.hora_fin);
                // Diferencia en minutos
                minutosOcupados += (fin.getTime() - inicio.getTime()) / 60000;
            });

            // 3. Calcular los minutos de LA NUEVA reserva
            const duracionNuevaReserva = calcularDuracionReserva();

            // 4. Validar si supera el tope de 8h (480 minutos)
            if (minutosOcupados + duracionNuevaReserva > MAX_MINUTOS_DIARIOS) {
                alert(`El tatuador no tiene tiempo suficiente este día (${Math.round(minutosOcupados / 60)}h ya ocupadas). Necesitas ${Math.round(duracionNuevaReserva / 60)}h para tu diseño. Por favor, elige otro día.`);
                setHorasDisponibles([]); // Bloqueamos el día
                return;
            }

            // Si hay tiempo total en el día, filtramos las horas exactas para que no se pisen.
            // Generamos las horas base
            const horasBase = generarHoras();
            const slotsFinales: SlotHora[] = horasBase.map(hora => {
                const [h, m] = hora.split(':').map(Number);

                // Representamos la reserva propuesta en milisegundos para comparar
                const fechaPropuestaInicio = new Date(`${nuevaFecha}T00:00:00`);
                fechaPropuestaInicio.setHours(h, m, 0, 0);

                const fechaPropuestaFin = new Date(fechaPropuestaInicio.getTime() + duracionNuevaReserva * 60000);

                // Comprobar si se solapa con ALGUNA reserva existente
                let motivo: 'ocupado' | 'superaLimite' | undefined;
                let haySolapamiento = false;

                for (const citaExt of citasDelDia) {
                    // Ignorar citas canceladas o rechazadas para liberar hueco
                    if (citaExt.estado === 'Cancelada' || citaExt.estado === 'Rechazada') continue;
                    
                    // Ignorar citas que la base de datos haya colado de otros días
                    if (citaExt.fecha && !citaExt.fecha.startsWith(nuevaFecha)) continue;

                    // Extraer Literalmente HH:MM para ignorar las franjas horarias (Timezones) del navegador
                    // si ApiPlatform devolviera +00:00 (UTC) o similar.
                    const extraerHHMM = (iso: string) => iso.includes('T') ? iso.split('T')[1].substring(0, 5) : '00:00';
                    const [inicioH, inicioM] = extraerHHMM(citaExt.hora_inicio).split(':').map(Number);
                    const [finH, finM] = extraerHHMM(citaExt.hora_fin).split(':').map(Number);

                    const citaInicio = new Date(`${nuevaFecha}T00:00:00`);
                    citaInicio.setHours(inicioH, inicioM, 0, 0);

                    const citaFin = new Date(`${nuevaFecha}T00:00:00`);
                    citaFin.setHours(finH, finM, 0, 0);

                    // Lógica de solapamiento:
                    // Se solapan si (InicioA < FinB) AND (FinA > InicioB)
                    if ((fechaPropuestaInicio < citaFin) && (fechaPropuestaFin > citaInicio)) {
                        haySolapamiento = true;
                        if (fechaPropuestaInicio >= citaInicio && fechaPropuestaInicio < citaFin) {
                            motivo = 'ocupado';
                            break; // Ocupación total tiene prioridad visual, salir del bucle.
                        } else {
                            motivo = 'superaLimite';
                        }
                    }
                }

                return {
                    hora,
                    disponible: !haySolapamiento,
                    ...(motivo && { motivo })
                };
            });

            setHorasDisponibles(slotsFinales);

        } catch (error) {
            console.error('Error al comprobar disponibilidad del día', error);
            // Fallback
            setHorasDisponibles(generarHoras().map(h => ({ hora: h, disponible: true })));
        }
    };

    const handleHoraSelect = (hora: string) => {
        const [horaStr, minStr] = hora.split(':');

        // Calcular hora inicio
        const fechaInicio = new Date();
        fechaInicio.setHours(Number(horaStr), Number(minStr), 0);

        // Sumar duración
        const duracionMinutos = calcularDuracionReserva();
        const fechaFin = new Date(fechaInicio.getTime() + duracionMinutos * 60000);

        // Formatear hora de vuelta
        const fhStr = fechaFin.getHours().toString().padStart(2, '0');
        const fmStr = fechaFin.getMinutes().toString().padStart(2, '0');
        const horaFinStr = `${fhStr}:${fmStr}`;

        setFormData(prev => ({ ...prev, horaInicio: hora, horaFin: horaFinStr }));
        // Siguiente paso es el 4 (Datos Personales) ahora
        setPaso(4);
    };

    const handleSignComplete = (sigs: FirmasState) => {
        setFirmas(sigs);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const meRes = await api.get('/me');
            const userId = meRes.data.id;

            if (!formData.trabajadorId) throw new Error("Falta elegir trabajador");

            const trabajadorSelect = trabajadores.find(t => t.id === formData.trabajadorId);
            const tarifaEstimada = getTarifaAproximada(trabajadorSelect, formData.tamanoCm);

            const payload: {
                usuario: string;
                trabajador: string;
                fecha: string;
                horaInicio: string;
                horaFin: string;
                tipoCita: string;
                estado: string;
                precioTotal: number | null;
                proyectos: string[];
                packs: string[];
                descripcion?: string;
                tamano_cm?: number;
                imagen?: string;
            } = {
                usuario: `/api/users/${userId}`,
                trabajador: `/api/trabajadors/${formData.trabajadorId}`,
                fecha: formData.fecha,
                horaInicio: formData.fecha + 'T' + formData.horaInicio + ':00',
                horaFin: formData.fecha + 'T' + formData.horaFin + ':00',
                tipoCita: formData.tipo === 'plantilla' ? 'Plantilla' : 'Personalizado',
                estado: 'Pendiente',
                precioTotal: tarifaEstimada ? Math.round(tarifaEstimada.precio) : null,
                proyectos: [],
                packs: []
            };

            // Para Citas Personalizadas o Plantillas Custom, almacenamos detalles base
            if (formData.tipo === 'personalizado' || formData.tipo === 'plantilla') {
                payload.descripcion = formData.descripcion;
                payload.tamano_cm = formData.tamanoCm;
                
                // Si el usuario adjuntó una imagen, subirla primero a MediaObjects
                if (formData.imagen) {
                    const fd = new FormData();
                    fd.append('file', formData.imagen);
                    const uploadRes = await api.post('/media_objects', fd, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    payload.imagen = uploadRes.data.contentUrl;
                }
            }

            if (formData.tipo === 'plantilla') {
                payload.proyectos = formData.proyectosIDs.map(id => `/api/proyectos/${id}`);
                payload.packs = formData.packsIDs.map(id => `/api/packs/${id}`);
            }

            await api.post('/citas', payload, {
                headers: {
                    'Content-Type': 'application/ld+json',
                }
            });

            alert("¡Cita reservada con éxito! Revisa tu perfil.");
            navigate('/perfil');
        } catch (error) {
            console.error("Error al guardar cita:", error);
            alert("Hubo un error al confirmar la cita. Por favor, inténtalo de nuevo.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        paso,
        setPaso,
        trabajadores,
        plantillasTrabajador,
        horasDisponibles,
        isSubmitting,
        firmas,
        formData,
        setFormData,
        handleTrabajadorSelect,
        handleFechaChange,
        handleHoraSelect,
        handleSignComplete,
        handleSubmit
    };
}
