interface TrabajadorSimplificado {
    nombre: string;
    apellidos?: string;
}

interface PDFFormData {
    tipo: 'plantilla' | 'personalizado' | '';
    fecha: string;
    horaInicio: string;
    nombre: string;
    apellidos: string;
    dni: string;
    telefono: string;
}

export interface PDFSignerProps {
    formData: PDFFormData;
    trabajador: TrabajadorSimplificado | null;
    onSignComplete: (state: {
        responsabilidad?: string;
        privacidad?: string;
        descargadoResponsabilidad: boolean;
        descargadoPrivacidad?: boolean;
        compromisoEntregar: boolean;
    }) => void;
}