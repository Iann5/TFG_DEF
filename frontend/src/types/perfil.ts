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
    estilos?: Estilo[];
}

export interface Cita {
    id: number;
    fecha: string;
    hora: string;
}
