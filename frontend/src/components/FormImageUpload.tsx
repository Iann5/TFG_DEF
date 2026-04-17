import type { ChangeEvent } from 'react';

interface FormImageUploadProps {
    archivo: File | null;
    imagenPrevia?: string | null;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    isRequired: boolean;
    label?: string;
}

export default function FormImageUpload({ archivo, imagenPrevia, onChange, isRequired, label = "Imagen del Proyecto" }: FormImageUploadProps) {
    return (
        <div className="space-y-2 relative group">
            <label className="text-outline font-label text-xs tracking-[0.2em] uppercase block mb-1">
                {label}
            </label>
            <div className="flex items-center gap-6 p-4 bg-surface-container/50 border border-outline-variant/30 rounded-sm overflow-hidden flex-wrap sm:flex-nowrap group-hover:border-primary/50 transition-colors">
                {(archivo || imagenPrevia) ? (
                    <img
                        src={archivo ? URL.createObjectURL(archivo) : imagenPrevia as string}
                        className="w-24 h-24 object-cover border border-primary/50 shrink-0 transform group-hover:scale-105 transition-transform"
                        alt="Preview"
                    />
                ) : (
                    <div className="w-24 h-24 bg-surface-container border border-outline-variant/50 border-dashed flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-3xl text-outline-variant/50 font-light">add_photo_alternate</span>
                    </div>
                )}
                <input
                    type="file"
                    accept="image/*"
                    required={isRequired}
                    onChange={onChange}
                    className="font-body text-sm text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-label file:uppercase file:tracking-[0.1em] file:bg-primary/10 file:text-primary hover:file:bg-primary/20 file:transition-colors file:rounded-sm file:cursor-pointer cursor-pointer w-full focus:outline-none"
                />
            </div>
        </div>
    );
}
