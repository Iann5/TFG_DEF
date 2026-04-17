// --- INTERFACES DE LA API ---

export interface UsuarioAPI {
    nombre?: string;
    apellidos?: string;
    foto_perfil?: string;
}

export interface Tarifa {
    cm: number;
    minutos: number;
    precio: number;
}

export interface TrabajadorAPI {
    id: number;
    usuario?: UsuarioAPI;
    tarifas?: Tarifa[];
}

// --- INTERFACES LOCALES ---
export interface Trabajador {
    id: number;
    nombre: string;
    apellidos: string;
    foto_perfil?: string;
    tarifas: Tarifa[];
}

export interface FirmasState {
    // Firmas (opcionales)
    responsabilidad?: string;
    privacidad?: string;

    // Protección para confirmar reserva:
    // - el usuario debe haber descargado el/los documentos
    // - y marcar el checkbox de compromiso
    descargadoResponsabilidad: boolean;
    descargadoPrivacidad?: boolean;
    compromisoEntregar: boolean;
}

export interface SlotHora {
    hora: string;
    disponible: boolean;
    motivo?: 'ocupado' | 'superaLimite';
}

export interface LocationState {
    plantillaId?: number; // legacy
    proyectoId?: number;
    packId?: number;
    trabajadorId?: number;
}

export interface CitaForm {
    trabajadorId: number | null;
    fecha: string;
    horaInicio: string;
    horaFin: string;
    nombre: string;
    apellidos: string;
    dni: string;
    telefono: string;
    tipo: 'plantilla' | 'personalizado' | '';
    tamanoCm: number;
    descripcion: string;
    imagen?: File | null;
    proyectosIDs: number[];
    packsIDs: number[];
}

export type TrabajadorSimplificado = Omit<Trabajador, 'tarifas'>;