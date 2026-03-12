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
        <div className="space-y-2">
            <label className="text-gray-400 text-sm font-bold uppercase tracking-wider block">{label}</label>
            <div className="flex items-center gap-4 p-4 bg-[#1C1B28] border border-white/10 rounded-xl overflow-hidden">
                {(archivo || imagenPrevia) ? (
                    <img
                        src={archivo ? URL.createObjectURL(archivo) : imagenPrevia as string}
                        className="w-16 h-16 object-cover rounded-lg border border-sky-500/50 shrink-0"
                        alt="Preview"
                    />
                ) : (
                    <div className="w-16 h-16 bg-white/5 rounded-lg border border-white/10 border-dashed flex items-center justify-center shrink-0">
                        <span className="text-xs text-gray-500">IMG</span>
                    </div>
                )}
                <input
                    type="file"
                    accept="image/*"
                    required={isRequired}
                    onChange={onChange}
                    className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-sky-500/10 file:text-sky-400 hover:file:bg-sky-500/20 cursor-pointer w-full"
                />
            </div>
        </div>
    );
}
