// Tipos compartidos para los componentes de Perfil

export interface Estilo {
    id: number;
    nombre: string;
}

export interface UserData {
    id: number;
    email: string;
    nombre: string;
    apellidos: string;
    telefono: string;
    foto_perfil: string | null;
    roles: string[];
    // Solo presente cuando el usuario tiene rol trabajador
    trabajadorId?: number;
    descripcion?: string;
    tarifas?: { cm: number; minutos: number; precio: number }[];
    estilos?: Estilo[];
}

export interface Cita {
    id: number;
    fecha: string;        // API Platform returns dates as ISO strings
    hora_inicio: string;  // API Platform returns times as ISO strings
    hora_fin: string;
    estado: string;
    tipo_cita: string;
    usuario?: {
        nombre: string;
        apellidos: string;
    };
    trabajador?: {
        id: number;
        usuario?: {
            nombre: string;
            apellidos: string;
        };
    };
    imagen?: string;
    descripcion?: string;
    tamano_cm?: number;
    proyectos?: {
        id: number;
        nombre?: string;
        imagen?: string;
    }[];
    packs?: {
        id: number;
        titulo?: string;
        imagen?: string;
    }[];
}
