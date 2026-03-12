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
    onSignComplete: (signatures: { responsabilidad: string, privacidad?: string }) => void;
}