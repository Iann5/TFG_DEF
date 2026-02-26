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
        <div className="flex flex-col items-center mb-10">
            {/* Círculo de foto */}
            <div
                className="w-36 h-36 rounded-full border-4 border-white overflow-hidden bg-slate-600 flex items-center justify-center cursor-pointer hover:opacity-80 transition"
                onClick={() => fileInputRef.current?.click()}
                title="Cambiar foto de perfil"
            >
                {photo ? (
                    <img src={photo} alt="Foto de perfil" className="w-full h-full object-cover" />
                ) : (
                    <svg className="w-20 h-20 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                    </svg>
                )}
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
                className="mt-3 text-white font-bold hover:text-sky-300 transition text-sm"
            >
                Cambiar Foto de perfil
            </button>
        </div>
    );
}
