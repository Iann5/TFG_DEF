import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserPhotoKey } from '../utils/authUtils';
import api from '../services/api';
import type { UserData } from '../types/perfil';

import Navbar from '../components/Navbar';
import FotoPerfil from '../components/perfil/FotoPerfil';
import EditarPanel from '../components/perfil/EditarPanel';
import PanelUsuario from '../components/perfil/PanelUsuario';
import PanelTrabajador from '../components/perfil/PanelTrabajador';
import PanelAdmin from '../components/perfil/PanelAdmin';
import ModalCambio from '../components/perfil/ModalCambio';

type ModalType = 'email' | 'telefono' | 'password' | null;

export default function Perfil() {
    const navigate = useNavigate();
    const { hasRole, isLoggedIn, refreshAuth } = useAuth();

    const [userData, setUserData] = useState<UserData | null>(null);
    const [photo, setPhoto] = useState<string | null>(null);
    const [modal, setModal] = useState<ModalType>(null);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [loading, setLoading] = useState(true);

    const isAdmin = hasRole('ROLE_ADMIN');
    const isTrabajador = hasRole('ROLE_TRABAJADOR');

    // Cargar datos del usuario
    useEffect(() => {
        if (!isLoggedIn) { navigate('/login'); return; }

        api.get('/me')
            .then(res => {
                setUserData(res.data);
                const localKey = getUserPhotoKey();
                setPhoto(res.data.foto_perfil || (localKey ? localStorage.getItem(localKey) : null));
            })
            .catch(() => {
                const localKey = getUserPhotoKey();
                setPhoto(localKey ? localStorage.getItem(localKey) : null);
            })
            .finally(() => setLoading(false));
    }, [isLoggedIn, navigate]);

    // Cerrar sesión
    const handleLogout = () => {
        const photoKey = getUserPhotoKey();
        if (photoKey) localStorage.removeItem(photoKey);
        localStorage.removeItem('token');
        window.dispatchEvent(new Event('storage'));
        refreshAuth();
        navigate('/');
    };

    // Cambiar campo del usuario
    const handleCambiarCampo = async (campo: string, valor: string) => {
        if (!userData?.id || !valor.trim()) return;
        try {
            await api.patch(`/users/${userData.id}`, { [campo]: valor }, {
                headers: { 'Content-Type': 'application/merge-patch+json' },
            });
            setUserData(prev => prev ? { ...prev, [campo]: valor } : prev);
        } catch {/* silencioso */ }
        setModal(null);
    };

    // Eliminar cuenta
    const handleEliminarCuenta = async () => {
        if (!userData?.id) return;
        try { await api.delete(`/users/${userData.id}`); } catch {/* silencioso */ }
        handleLogout();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="animate-spin w-12 h-12 border-4 border-sky-300 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <div
                className="min-h-screen bg-cover bg-center bg-no-repeat relative flex flex-col"
                style={{ backgroundImage: 'url(/Plantilla-Sesion.png)' }}
            >
                <div className="absolute inset-0 bg-black/30" />

                <div className="relative z-10 flex flex-col flex-1 px-6 py-10 max-w-5xl mx-auto w-full">

                    {/* Botón volver */}
                    <button onClick={() => navigate(-1)} className="self-start text-white hover:text-sky-300 transition text-2xl mb-6">
                        ←
                    </button>

                    {/* Título */}
                    <h1 className="text-5xl font-bold text-white text-center mb-8 tracking-wide">Perfil</h1>

                    {/* Foto */}
                    <FotoPerfil photo={photo} userId={userData?.id ?? null} onPhotoChange={setPhoto} />

                    {/* Contenido: dos columnas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                        {/* Panel izquierdo según rol */}
                        <div className="bg-slate-700/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                            {isAdmin && <PanelAdmin />}
                            {!isAdmin && isTrabajador && (
                                <PanelTrabajador
                                    estilosIniciales={userData?.estilos ?? []}
                                    descripcionInicial={userData?.descripcion ?? ''}
                                    trabajadorId={userData?.trabajadorId}
                                />
                            )}
                            {!isAdmin && !isTrabajador && <PanelUsuario userId={userData?.id ?? null} />}
                        </div>

                        {/* Panel derecho: editar (igual para todos) */}
                        <EditarPanel
                            userData={userData}
                            onCambiar={campo => setModal(campo as ModalType)}
                            onLogout={handleLogout}
                            onEliminar={() => setConfirmDelete(true)}
                        />
                    </div>
                </div>

                {/* Modales de cambio de campo */}
                {modal === 'email' && <ModalCambio titulo="Cambiar Email" tipo="email" placeholder="nuevo@email.com" onConfirm={v => handleCambiarCampo('email', v)} onClose={() => setModal(null)} />}
                {modal === 'telefono' && <ModalCambio titulo="Cambiar Teléfono" tipo="tel" placeholder="6XX XXX XXX" onConfirm={v => handleCambiarCampo('telefono', v)} onClose={() => setModal(null)} />}
                {modal === 'password' && <ModalCambio titulo="Cambiar Contraseña" tipo="password" placeholder="Nueva contraseña" onConfirm={v => handleCambiarCampo('password', v)} onClose={() => setModal(null)} />}

                {/* Modal confirmar eliminar cuenta */}
                {confirmDelete && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
                        <div className="bg-slate-800 border border-white/20 rounded-2xl p-8 w-full max-w-sm shadow-2xl text-center">
                            <h3 className="text-white text-xl font-bold mb-2">¿Eliminar cuenta?</h3>
                            <p className="text-white/60 text-sm mb-6">Esta acción es irreversible.</p>
                            <div className="flex gap-3">
                                <button onClick={handleEliminarCuenta} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-lg transition">Sí, eliminar</button>
                                <button onClick={() => setConfirmDelete(false)} className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2.5 rounded-lg transition">Cancelar</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
