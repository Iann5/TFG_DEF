// Tipos para el flujo de Checkout

export interface TarjetaState {
    numero: string;
    caducidad: string;
    cvc: string;
    titular: string;
}

export interface BizumState {
    telefono: string;
    concepto: string;
}

export interface PaymentValidationErrors {
    numero?: string;
    caducidad?: string;
    cvc?: string;
    titular?: string;
    telefono?: string;
    concepto?: string;
}
