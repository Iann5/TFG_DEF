import { useRef, type ChangeEvent } from 'react';
import { getUserPhotoKey } from '../../utils/authUtils';
import api from '../../services/api';

interface Props {
    photo: string | null;
    userId: number | null;
    onPhotoChange: (newPhoto: string) => void;
}

export default function FotoPerfil({ photo, userId, onPhotoChange }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        const reader = new FileReader();
        reader.readAsDataURL(e.target.files[0]);
        reader.onload = () => {
            const newPhoto = reader.result as string;
            onPhotoChange(newPhoto);

            // Guardar en localStorage con clave del usuario
            const photoKey = getUserPhotoKey();
            if (photoKey) {
                localStorage.setItem(photoKey, newPhoto);
                window.dispatchEvent(new Event('storage'));
            }

            // Persistir en la BD vía PATCH
            if (userId) {
                api.patch(`/users/${userId}`, { foto_perfil: newPhoto }, {
                    headers: { 'Content-Type': 'application/merge-patch+json' },
                }).catch(() => {/* silencioso */ });
            }
        };
    };

    return (
        <div className="flex flex-col items-center">
            {/* Círculo de foto */}
            <div
                className="w-36 h-36 rounded-full border-2 border-primary/50 overflow-hidden bg-surface-container-highest flex items-center justify-center cursor-pointer hover:border-primary hover:shadow-[0_0_20px_rgba(173,198,255,0.2)] transition-all group relative"
                onClick={() => fileInputRef.current?.click()}
                title="Cambiar foto de perfil"
            >
                {photo ? (
                    <img src={photo} alt="Foto de perfil" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                    <span className="material-symbols-outlined text-outline group-hover:text-primary text-5xl transition-colors">account_circle</span>
                )}
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-surface-container/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <span className="material-symbols-outlined text-primary text-3xl">photo_camera</span>
                </div>
            </div>

            {/* Input oculto */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
            />

            <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 text-on-surface hover:text-primary transition-colors font-label text-[10px] uppercase tracking-[0.2em] flex items-center gap-1"
            >
                <span className="material-symbols-outlined text-xs">edit</span>
                Cambiar Avatar
            </button>
        </div>
    );
}
