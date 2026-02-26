// src/types/estilo.ts
import { type TrabajadorBasico } from "./trabajador";

export interface EstiloType {
    id: number;
    nombre: string;
    informacion: string;
    imagen?: string;
    imagenes?: string[]; // Para las fotos de ejemplo (si las devuelve la API)
}

export interface EstiloData {
  id: number;
  nombre: string;
  informacion: string;
  imagen?: string;
  imagenes?: string[];         // hasta 3 fotos de ejemplo (JSON array)
  trabajadores?: TrabajadorBasico[];
}